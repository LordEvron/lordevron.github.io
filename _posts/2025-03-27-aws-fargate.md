---
id: 250207
title: 'AWS Fargate Pricing: Understanding the Cost of Serverless Containers'
date: '2025-03-27'
author: Lord_evron
layout: post
permalink: /2025/03/27/aws-fargate/
categories:
    - Technical
tags:
    - secops
    - aws
    - technology
---

In one of my [previous article](/2025/02/26/karpenter-on-aws/), I talked about Karpenter and how elegant and powerful it is for automatically scaling and managing nodes on your EKS clusters. Today, we're going to look at AWS Fargate.

In that article I mentioned that you should not run Karpenter on a node that is managed by Karpenter. Also, it is best practice to deploy Karpenter in Fargate, because AWS handles all the updates automatically. If you run Karpenter on a regular node group, you'd have to do those updates yourself on that node group, which can be tricky and risky. But how much those fargate profiles costs? 

That's why in this article, we're going to take a closer look at what fargate is and how the pricing works for this popular service.

# What is AWS Fargate?

When you have your applications packaged up in containers (using Docker, for example), you will need a place to run those containers, which usually means setting up and managing virtual machines (like EC2 instances). Fargate takes away that part.

**Fargate is a serverless compute engine specifically for containers.**

Notice that "serverless" doesn't mean there are no actual servers involved. It means *you* don't have to see them, touch them, or worry about them. AWS handles all the underlying server infrastructure for you (for a  cost).

Here are some technical details:

* **Container Execution without VM Management:** You tell AWS which container images you want to run (from a registry like ECR). Fargate then figures out the necessary computing power (CPU and memory) and runs your containers. You don't pick instance types, you don't SSH into machines, and you don't patch operating systems. AWS does all that behind the scenes.
* **Integration with Container Orchestrators:** Fargate works directly with two main AWS container management services:
  - **Amazon ECS (Elastic Container Service):** If you're using ECS, Fargate is an option for how your ECS "tasks" are actually run. Instead of launching tasks on EC2 instances you manage, you can launch them *on Fargate*. ECS takes care of orchestrating your containers, and Fargate provides the compute.
  - **Amazon EKS (Elastic Kubernetes Service):** If you're using Kubernetes on AWS, Fargate lets you run your Kubernetes "pods" directly on Fargate. This means you don't need to manage the worker nodes. Amazon EKS Fargate assigns one Node to each pod. For all your Fargate Pods, *Amazon advises you set the requested amount of CPU and memory to be exactly the same as the limits in your Kubernetes manifest file.*
* **Resource-Based Allocation:** When you define a Fargate task or pod, you specify how much CPU (in vCPUs) and memory (in GBs) that specific workload needs. Fargate then allocates the right amount of resources.



In short, Fargate is the serverless way to run your Docker containers on AWS, abstracting away all the underlying server management.


# How Fargate Pricing Works

The pricing model for AWS Fargate is different from the traditional virtual machines. With regular VMs, you pay for them to be running all the time. But with Fargate, you only pay for the specific amount of processing power (vCPU) and memory your containers need while they are running, and the cost is calculated every second. 

Basically Fargate bills you based on:

* **Compute (vCPU):** You are charged an hourly rate (billed per second) for the vCPU allocated to your Fargate task or pod.
* **Memory (GB):** Similarly, you are charged an hourly rate (billed per second) for the memory allocated to your Fargate task or pod. **Notice that EKS Fargate adds 256 MB to each Pod’s memory reservation for the required Kubernetes components (kubelet, kube-proxy, and containerd).**
* **Ephemeral Storage (Beyond 20GB):** Billing for additional storage beyond the default 20GB is per GB per month, independent of the vCPU/memory profiles.

 However, a critical point is that **Fargate bills based on predefined vCPU and memory profile combinations. Your requested resources are rounded up to the smallest supported profile that meets or exceeds your specifications.** And this is where the documentation is not very clear.
 Indeed, It is important to note that you don't specify an arbitrary vCPU amount. Instead, you request a certain amount, and Fargate will bill you for the smallest available vCPU profile that is greater than or equal to your request.  These profiles come in discrete sizes (e.g., 0.25 vCPU, 0.5 vCPU, 1 vCPU, etc.). Just like vCPU, same applies for memory allocation.  Fargate will bill you for the memory associated with the smallest vCPU profile that can accommodate your memory needs (or the next higher memory offering within that profile). Here's a resume table I got from the AWS documentation:

| vCPU Value | Memory Value                      |
|------------|-----------------------------------|
| 0.25 vCPU  | 0.5 GB, 1 GB, 2 GB                |
| 0.5 vCPU   | 1 GB, 2 GB, 3 GB, 4 GB            |
| 1 vCPU     | 2 GB, 3 GB, 4 GB, 5 GB, 6 GB, 7 GB, 8 GB |
| 2 vCPU     | Between 4 GB and 16 GB in 1-GB increments |
| 4 vCPU     | Between 8 GB and 30 GB in 1-GB increments |
| 8 vCPU     | Between 16 GB and 60 GB in 4-GB increments |
| 16 vCPU    | Between 32 GB and 120 GB in 8-GB increments |
	
Keep in mind that in addition to these basic settings, there are other factor that impact the final cost, such as:

* **Operating System/Architecture:**There is a price difference between Windows-based Vs Linux based containers. Same for x86 arch vs arm.
* **Fargate Spot:** Similar to EC2, Fargate offer Spot profiles at discounted rate for interruptible workloads,
* **Data Transfer:** Standard AWS data transfer charges apply for data in and out of your Fargate tasks.


### The implication of this profile-based billing

 Because AWS rounds up your requested resources to the nearest available Fargate profile, choosing the right CPU and memory for your pods becomes really important to control the cost. Here some examples:

* **Paying for More Than You Need:** If your container needs very little CPU and memory (like 0.01 vCPU and 0.2 GB), Fargate will still charge you for a larger minimum profile (in this case, 0.25 vCPU and 0.5 GB) since it doesn't offer anything smaller. This means you could be paying for computing power your container isn't actually using. In this case you can increase your requests/limits to 0.25 vCPU for free. 
* **Memory Tied to CPU Profiles:** The amount of memory you're billed for is linked to the CPU profile. For instance, if you need 4 vCPUs but only 1 GB of memory, Fargate will still bill you for the smallest profile that offers at least 4 vCPUs, which will come with 8 GB of memory. Similarly, if you want 5 GB of RAM but only 0.25 CPU, you will be billed for a profile with 1 vCPU.
Also, keep in mind that Fargate adds an extra 256 MB of memory on top of your request. This small addition can sometimes push you into a larger, more expensive profile! For example, if you specify 0.25 vCPU and 4 GB of RAM, the actual resources Fargate sees will be 0.25 vCPU and 4.25 GB. This could force Fargate to use the 1 vCPU, 5 GB profile. If possible, setting memory to 3.75Gb will make fargate use the smaller (cheaper) profile. 


### Identifying the Fargate Profile in Use
One thing it was confusing for me (and took some time to figure it out), is that there is no correlation between instance Fargate profile and the node size reported by `kubectl describe node` command. The reported node size is often larger than the fargate profile you are actually using. To find out the profile you are using, you should describe the pod running on that node (remember each pod run in its own fargate node). 
```bash
kubectl describe pod --namespace <your-ns> <pod-name>
```
You will find an annotation like this: 

```
Annotations:          CapacityProvisioned: 0.25vCPU 1GB  
```

That will tell you the fargate profile in use.

## Conclusion:

Understanding how Fargate charges you can be a bit difficult at first, but once you get it, you can optimize your resources usage and reduce some costs.
Given its higher price point compared to EC2 (15-20% higher), Fargate is often most suited for short-lived workloads or specific scenarios like running Karpenter in its dedicated, serverless compute, that simplify the overall EKS cluster maintenance.

I hope you found this article useful!


