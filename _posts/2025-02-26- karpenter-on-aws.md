---
id: 250207
title: 'Karpenter on AWS: Simplifying Kubernetes Node Provisioning'
date: '2025-02-26'
author: Lord_evron
layout: post
permalink: /2025/02/26/karpenter-on-aws/
categories:
    - Technical
tags:
    - secops
    - aws
    - technology
---

Karpenter, an open-source node provisioning project from AWS, is revolutionizing how Kubernetes clusters scale on Elastic Kubernetes Service (EKS). Unlike the traditional Cluster Autoscaler, which relies on pre-defined node groups, Karpenter directly provisions compute resources in response to pending pods. This dynamic approach significantly improves cluster efficiency and reduces operational overhead. Let see it in details.

## What is Karpenter?

Karpenter is a Kubernetes node autoscaling solution that operates at the pod level. It monitors pending pods and directly provisions the necessary EC2 instances to satisfy their resource requirements. 
So in practice, there's no need for manual node management or creation; you simply deploy pods and Karpenter initiates a process that evaluates their resource requirements and dynamically launches the optimal (and most economical) EC2 instances to accommodate them. When you delete pods, then it will automatically scale down/ delete ec2 instances that are not needed anymore.

## How Karpenter Makes Work Easier:

Karpenter addresses several challenges associated with traditional Kubernetes node autoscaling, making cluster management more efficient:

* **Eliminating Node Group management**:
    Traditional autoscaling requires managing multiple node groups with pre-defined instance types and sizes. Karpenter eliminates this complexity by directly provisioning instances based on pod requirements, reducing the number of moving parts and simplifying configuration.


* **Reducing Over-Provisioning**: 
Node groups often lead to over-provisioning, as you must anticipate peak workloads and configure instance types accordingly. Karpenter's pod-driven scaling ensures that you only provision the resources you need, minimizing wasted compute capacity and reducing costs.


* **Improving Scaling Speed:**
  Traditional autoscaling can be slow, as it relies on node group scaling operations, which can take several minutes. Karpenter's direct EC2 integration enables rapid provisioning, ensuring that pods are scheduled quickly and application performance is maintained.


* **Optimizing for Spot Instances:**
   Spot Instances offer significant cost savings, but managing them with traditional autoscaling can be challenging. Karpenter simplifies Spot Instance usage by automatically selecting and managing Spot Instances based on availability and pricing, maximizing cost efficiency.


* **Simplified Configuration and Management:**
  Karpenter's declarative configuration by using Kubernetes-native yaml files make it easy to integrate with existing Kubernetes workflows. This simplifies cluster management and reduces the learning curve.
   

* **Easier Node Updates:**
  Karpenter makes updating your node's operating system much simpler. It checks if anything's out of date (Drift), and when it finds something, it automatically moves the running applications (pods) off the old nodes and starts new ones with the latest updates. This means less downtime and keeps your nodes secure and up-to-date.
      

* **Better System Stability:**
  With Karpenter, you can treat nodes almost like regular pods. If a node gets stuck or stops working, you can just delete/kill it, and Karpenter will automatically start a new one. This helps keep your system running smoothly and quickly fixes any problems with individual nodes, making your cluster more reliable.

  
### Key Components of Karpenter: NodePool & NodeClass

Karpenter introduces `NodePool` and `NodeClass` as core components for managing node provisioning efficiently. 

`NodePool` defines the high-level policies for node provisioning, such as which instance type should be used for the new nodes. 
On the other hand, `NodeClass` provides the specific template configuration for the underlying infrastructure, such as *AMI (Amazon Machine Image)*, security groups, and instance metadata. It standardizes how nodes are launched, ensuring consistency across the cluster. 

Practically speaking, NodePools reference a NodeClass, using that nodeClass as base configurations for node deployment. Multiple nodePool can reference the same nodeClass.

### Installing Karpenter:

For optimal performance and to prevent circular dependencies, Karpenter itself *should not run on the managed nodes it provisions*. It's best practice to deploy Karpenter within a separate, stable environment. This can be achieved through a small, dedicated node group or, preferably, a Fargate profile. It's much easier to use Fargate for Karpenter because AWS handles all the updates and security fixes automatically. If you run Karpenter on a regular node group, you'd have to do those updates yourself on that node group, which can be tricky and risky. Also, you will need to make sure that the node group is always up and running.  

In a newly provisioned EKS cluster, establishing a Fargate profile specifically for Karpenter is recommended. After installing Karpenter within this isolated environment, core Kubernetes components like kubelet and application pods can be deployed. Karpenter will then dynamically provision the necessary EC2 worker nodes to accommodate these workloads. Here are the main step to be done:

1. Install Karpenter: Deploy Karpenter to your EKS cluster (fargate profile) using Helm or kubectl.
2. Configure IAM Permissions: Grant Karpenter the necessary IAM permissions to provision EC2 instances.
3. Create a NodeClass and NodePools: Define the instance requirements for your workloads.
4. Deploy Workloads: Deploy your Kubernetes workloads, and Karpenter will automatically provision the necessary nodes.
5. Monitor: In case of problems, Monitor Karpenter's logs understand why is not able to create nodes.

Here is an example of nodePool and nodeClass (YAML). Notice that this is just an example and there are many more parameters that you can control. Please refer to official [karpenter](https://karpenter.sh/docs/) documentation for a full overview. 

```yaml
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: default-np
spec:
  template:
    metadata:
      labels:
        billing-team: my-team
      annotations:
        example.com/owner: "my-team"
    spec:
      nodeClassRef:
        group: karpenter.k8s.aws  
        kind: EC2NodeClass
        name: mynodeclass
      expireAfter: 720h | Never
      terminationGracePeriod: 48h
      requirements:
          #specify the ec2 instance family 
        - key: "karpenter.k8s.aws/instance-family"
          operator: In
          values: ["m5","m5d","c5","c5d","c4","r4"]
        - key: "kubernetes.io/arch"
          operator: In
          values: ["arm64", "amd64"]
        - key: "karpenter.sh/capacity-type"
          operator: In
          values: ["spot", "on-demand"]
  disruption:
    consolidationPolicy: WhenEmptyOrUnderutilized | WhenEmpty
    consolidateAfter: 1m | Never # Added to allow additional control over consolidation aggressiveness
  # Resource limits constrain the total size of the pool.
  # Limits prevent Karpenter from creating new instances once the limit is exceeded.
  limits:
    cpu: "50"
    memory: 100Gi
    
---
apiVersion: karpenter.k8s.aws/v1
kind: EC2NodeClass
metadata:
  name: mynodeclass
spec:
  kubelet:
    maxPods: 110
  amiFamily: AL2023
  subnetSelectorTerms:
    - tags:
        Name: my_private_subnet_1
    - tags:
        Name: my_private_subnet_2
  securityGroupSelectorTerms:
    - tags:
        Name: my_secgroup
  role: "KarpenterNodeRole-${CLUSTER_NAME}"
  instanceProfile: "KarpenterNodeInstanceProfile-${CLUSTER_NAME}"

  amiSelectorTerms:
    - alias: AL2023@latest

```

Let's start by exploring the `NodeClass` resource. Here, we need to define the `amiFamily`, which determines the OS image running on the node. You can either use one of the AWS-provided images or specify a custom one. Next, we must define the IAM `role` that Karpenter will assume. This role requires permissions to create and terminate EC2 instances, attach them to the EKS cluster, and perform related actions.
Additionally, we need to specify the `instanceProfile`, which is the role assigned to each node. For example, if nodes require access to an S3 bucket, you can grant the necessary permissions through this role, and they will automatically be applied to the nodes. Keep in mind that certain permissions are essential for joining the EKS cluster and managing instance lifecycle operations. Finally, we must specify the security groups and subnets where the EC2 instances will be launched.

In the `NodePool` resource, we reference the `nodeClassRef`, which links to a NodeClass. This means every node provisioned by that NodePool will use the NodeClass as a template, inheriting its AMI, IAM roles, networking configuration, and other settings.
One key parameter is `expireAfter`, which defines how frequently a node is terminated and replaced with a fresh one. 
Another critical section is `requirements`, where you specify which EC2 instances are allowed. You can filter based on CPU, memory, architecture, instance family, instance type, and Spot/On-Demand preferences. For example, you could configure a NodePool to only select ARM-based M family instances with at least 2 CPUs and 32GB of RAM.

Another important setting is `limits`, which defines the maximum resources this NodePool can allocate. Karpenter won't provision beyond this limit, even if more capacity is needed. For instance, if the limit is set to 50 CPUs and 100GB of RAM, Karpenter could provision three instances with 32GB RAM each, but it wouldn't launch a fourth since it exceeds the limit. If additional pods need scheduling but no resources are available, Karpenter logs a message stating that no NodePool meets the demand and the pod will remain unscheduled. Similarly, if your nodes are ARM-based and a deployment requests an AMD64 node with a taint, Karpenter won’t be able to fulfill the request since the NodePool is restricted to ARM instances.




## Conclusion:

In conclusion, after six months of practical use, Karpenter has proven to be a game-changer for our EKS cluster management. It has drastically simplified both cluster upgrades and day-to-day node operations. The automated node provisioning and replacement features have significantly reduced our operational overhead, allowing us to focus on application development rather than infrastructure maintenance. Karpenter's ability to handle node OS updates and recover from node failures automatically has made our cluster more stable and resilient. If you're looking to improve your EKS experience and reduce the complexities of node management, Karpenter is undoubtedly a powerful and effective solution.

I hope you found this article useful!




