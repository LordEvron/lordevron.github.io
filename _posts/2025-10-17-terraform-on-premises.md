---
title: 'Using Terraform On-Premises: Extending GitOps Beyond the Cloud'
date: '2025-10-17'
author: Lord_evron
layout: post
permalink: /2025/10/17/terraform-on-premises/
categories:
    - Technical
tags:
    - secops
    - terraform
    - technology
---
When people think about Terraform, they usually associate it with cloud automation — AWS, Azure, GCP, and similar environments. 
However, Terraform’s true power lies not in being cloud-specific, but in its ability to describe and manage infrastructure declaratively, regardless of where it runs. Over the past months, I’ve been successfully applying Terraform principles to an on-premises environment, and the results have been both powerful and elegant.

## What Terraform Is

Terraform, created by HashiCorp, is an open-source tool for Infrastructure as Code (IaC). It allows you to define your 
entire infrastructure, from virtual machines to DNS records, in human-readable configuration files. 
Terraform then automates the provisioning and lifecycle management of these resources.
With Terraform, you no longer need to click through dashboards or manually configure infrastructure: everything is defined in code. 
Creating a virtual machine, for example, is as simple as writing a 10-line block that declares its CPU, memory, and network. 
Want to change the CPU count? Just edit a single number. Want to remove it? Delete the block. 
It’s like magic, your entire infrastructure becomes reproducible, versioned, and self-documenting, with no need to 
remember how a particular network or database was configured.
The key advantage is idempotency: Terraform knows what already exists and only applies the necessary changes to reach the desired state. 
It also provides a plan phase, where changes can be reviewed before being executed, ensuring predictability and control.
For example, suppose you have a Terraform configuration that defines a Kubernetes namespace called monitoring with a 
Helm chart deploying Prometheus. If you later modify the Helm chart version or add a new configuration value, you can run:
```bash
terraform plan
```
Terraform will show a detailed execution plan, such as:

```terraform
# helm_release.prometheus will be updated in-place
~ resource "helm_release" "prometheus" {
      version = "25.5.0" -> "25.6.1"
      values  = [
          ...
          + "alertmanager.enabled=true"
      ]
}
Plan: 0 to add, 1 to change, 0 to destroy.
```
This preview step lets you clearly see what Terraform intends to change, (in this case, upgrading Prometheus and enabling 
Alertmanager), before you apply the modifications. In a GitOps setup, this becomes even more powerful. 
The `terraform plan` command can be automatically triggered whenever a `Pull Request` is opened. The plan output is 
posted as a comment or status check in the PR, allowing the team to review the proposed infrastructure changes just like application code.
Once the PR is approved and merged, a pipeline can then safely execute `terraform apply`, applying only the reviewed and approved changes. 
This ensures that every infrastructure modification is traceable, peer-reviewed, and auditable; aligned with gitops principles.

### Terraform Beyond the Cloud
While Terraform is commonly used for cloud deployments, its provider ecosystem allows it to manage almost anything with 
an API, including on-premises infrastructure. This means you can use it to orchestrate:
* Kubernetes clusters running locally
* Bare-metal servers
* VMware or OpenStack virtual environments
* Network and storage configurations
* Helm charts and Kubernetes resources

In my case, the underlying infrastructure, Kubernetes clusters, load balancers, and base networking, is bootstrapped using Ansible. 
Ansible is great for low-level provisioning and configuration, especially when Terraform can’t directly manage the underlying hardware,
making it ideal for setting up Kubernetes clusters or configuring operating systems.

Once that foundation is in place, Terraform takes over. Using its Kubernetes and Helm providers, Terraform manages the higher-level 
deployments: namespaces, ingress controllers, monitoring stacks, applications, and policies. This combination allows both flexibility and 
consistency: Ansible handles the initial provisioning, while Terraform governs the continuous state of the platform and applications.

## Alignment with GitOps Principles

This hybrid approach fits perfectly within the GitOps philosophy.
*GitOps* is about using Git as the single source of truth for your infrastructure and application configurations. 
All changes go through version-controlled pull requests, and automated pipelines apply those changes to the environment. 
The principles are simple but powerful:

* Declarative infrastructure — define your desired state in code.
* Versioned and auditable — all changes are tracked in Git.
* Automated reconciliation — systems automatically converge toward the declared state.
* Observability and feedback — visibility into what’s running versus what’s declared.

By using Terraform configurations stored in Git, combined with CI/CD or GitOps tools (like Argo CD or Flux), you can bring 
these same principles to your **on-premises environments**. Every infrastructure change becomes a pull request, 
every deployment is reproducible, and rollbacks are as simple as reverting a commit.

## Benefits
Since adopting this approach, I’ve seen many benefits:
* Consistency across environments: development, staging, production, etc are defined the same way.
* Reproducibility: rebuilding an environment from scratch is straightforward. This is extremely important for disaster recovery!
* Transparency and collaboration: infrastructure changes are reviewed just like application code.
* Reduced drift: Terraform’s state tracking ensures the environment matches the desired configuration.
* Seamless integration with existing automation tools like Ansible, Jenkins, or Argo CD.

# Final Thoughts

Terraform is not limited to the cloud. It’s a universal IaC tool, and when combined with Ansible and GitOps practices, 
it enables a modern, automated, and auditable on-premises infrastructure workflow.

This approach has been a success in my experience, bridging the gap between traditional datacenter automation 
and modern DevOps methodologies. It proves that the power of declarative infrastructure and GitOps 
principles is not bound to any specific platform: **it’s a mindset that can transform how we manage infrastructure anywhere**.

As always I hope this article was usefull.
