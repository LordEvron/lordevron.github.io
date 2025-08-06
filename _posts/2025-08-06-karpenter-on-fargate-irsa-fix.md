---
title: 'EKS Terraform 21.x IRSA Issue: How to Fix Karpenter on Fargate'
date: '2025-08-06'
author: Lord_evron
layout: post
permalink: /2025/05/30/karpenter-fargate-irsa-fix/
categories:
    - Technical
tags:
    - secops
    - aws
    - technology
---
In a previous [article](/2025/02/26/karpenter-on-aws/), I explained why running Karpenter on AWS Fargate was highly recommended. 
The key motivation is that Karpenter itself should not run on the managed nodes it provisions. So a simple solution would be to run it on a small dedicated fargate instance. 

Since that article, AWS has also introduced a new "EKS Cluster Auto-mode", which provisions control plane and data plane resources more seamlessly. However, this comes with increased cost and reduced control. For many teams, especially where cost control is important, sticking with traditional EKS + Fargate still makes more sense.

However, the Terraform EKS module introduced breaking changes in version [21.0.0](https://github.com/terraform-aws-modules/terraform-aws-eks/releases/tag/v21.0.0), notably removing native IRSA (IAM Roles for Service Accounts) support. 
This has significant implications, since by removing IRSA:

* Any workloads relying on it to assume IAM roles (e.g., Karpenter) will break.
* Fargate workloads, which must use IRSA for AWS permissions will break.

While EKS now supports Pod Identity as an alternative, Fargate cannot leverage that since is not [supported](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html). The core reason is that EKS Pod Identity relies on a dedicated agent (add-on) that runs as a DaemonSet on each worker node to provide credentials. Since AWS Fargate does not support DaemonSets, this agent cannot be deployed, making Pod Identity incompatible with Fargate. For pods on Fargate, you must continue to use IAM Roles for Service Accounts (IRSA).

 It is particularly surprising that the EKS Terraform module developers, when deprecating native IRSA support in favor of Pod Identity, did not provide a documented solution for common use cases like Karpenter on Fargate, which cannot use the new approach..

So if you're using Karpenter on Fargate, and you're now stuck… you need to manually restore IRSA support. but before i show you how, lets clarify the difference between IRSA and Pod Identity.

# IRSA vs Pod Identity

## What is IRSA?

IAM Roles for Service Accounts (IRSA) is the original and widely adopted method of securely assigning AWS IAM permissions to Kubernetes pods.
With IRSA, the flow works like this:
* You create an IAM Role with a trust policy that allows the EKS OIDC provider to assume it.
* The trust policy ensures only a specific service account in a specific namespace can use that role.
* The Kubernetes service account is annotated with the role ARN.
* When the pod starts, EKS injects a web identity token into the pod, which AWS STS uses to validate and issue temporary credentials.

Key advantages:
* Secure, least-privilege model.
* Easy to audit and manage.
* Works perfectly with EKS and Fargate.

## What is Pod Identity?

EKS Pod Identity is a newer approach introduced by AWS in 2024, offering another way to associate IAM roles with pods.

Instead of relying on OIDC providers and complex trust policies, you create an association that directly links an IAM role to a Kubernetes service account within a specific namespace using the EKS API. This new approach relies on a daemonset running on worker nodes, and as stated above, is not supported by fargate. 

# Manually Restoring IRSA for Karpenter on Fargate

If you're using the EKS Terraform module version 21.x or higher, the built-in IRSA configuration for Karpenter on Fargate is no longer available. 
To restore this functionality, you must manually define the necessary IAM role trust policy and pass it to the Karpenter module.
This approach effectively recreates the IRSA trust relationship that was previously managed by the module, allowing your Karpenter pods on Fargate to assume their required IAM role.
if you do not restore the policy, karpenter will fail to start with this error message 
 ``` 
 failed to retrieve credentials, operation error STS: AssumeRoleWithWebIdentity, https response error StatusCode: 403, RequestID: 3d312d21-22d2-4d80-c222-227ae8c27cc1, api error AccessDenied: Not authorized to perform sts:AssumeRoleWithWebIdentity"
```


To restore the policy, here is the snippet of terraform code that implements these changes. It has been adapted from a GitHub [discussion](https://github.com/terraform-aws-modules/terraform-aws-eks/issues/3394)

``` terraform
data "aws_iam_policy_document" "karpenter_controller_assume_role_policy" {
    statement {
        effect = "Allow"
    
        principals {
          type        = "Federated"
          identifiers = [module.YOUR_EKS_CLUSTER.oidc_provider_arn]
        }
    
        condition {
          test     = "StringEquals"
          variable = "${module.YOUR_EKS_CLUSTER.oidc_provider}:sub"
          values   = ["system:serviceaccount:karpenter:karpenter"]
        }
    
        condition { # Required for OIDC trust
          test     = "StringEquals"
          variable = "${module.YOUR_EKS_CLUSTER.oidc_provider}:aud"
          values   = ["sts.amazonaws.com"]
        }
    
        actions = ["sts:AssumeRoleWithWebIdentity"]
    }
}
```
and then link this policy to karpenter:

```terraform
module "karpenter" {
  ...
  iam_role_source_assume_policy_documents = [
    data.aws_iam_policy_document.karpenter_controller_assume_role_policy.json,
  ]
}
```

I’ve tested these changes and can confirm that Karpenter is successfully able to assume the role and provision new nodes.

As always, I hope you found this article helpful.

