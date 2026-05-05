---
title: 'Kubernetes Deep Dive: From Kubelet to CNI'
date: '2026-05-05'
author: Lord_evron
layout: post
permalink: /2026/05/05/kubernetes-deep-dive/
categories:
    - Technical
tags:
    - secops
    - technology
    - linux
---

When people first get into Kubernetes, it’s easy to think of it as one big system that “just runs containers.” But under the hood, it’s more like a collection of small, specialized components constantly talking to each other.
To understand networking (and especially CNI, iptables, and eBPF), you need to zoom out first and see the bigger picture; who’s responsible for what. In this article we will give a look at the basic kubernetes blocks and some of the CNI implementation details.

At a high level, Kubernetes is split into two parts: the **control plane** that decides what should happen and the **nodes** that make it actually happen.

The control plane includes these components:
- `Kube-apiserver` that is the central entry point. Everything goes through this. Every component talks to it.
- `Kube-scheduler` it decides *where* a pod should run.
- `Kube-controller-manager` constantly tries to make reality match the desired state (replicas, nodes, jobs, etc.).
- `etcd` is the database storing the entire cluster state.

On the node side, things are more focused to make "things" run. There is `container runtime` (like containerd) that actually launches containers, 
`Kubelet` that makes sure containers actually run, the `CNI plugin` that wires up networking and `kube-proxy` that route traffic from Kubernetes Services to the pods.

In this article we will look more in detail the role of Kubelet and CNI plugins.

## Kubelet — The primary node agent

The Kubelet is often described as a `node agent`, but that is a bit minimalistic respect to what it really does. It’s the core component that continuously reconciles what the control plane *wants* with what’s actually running on the machine. Notice that It doesn’t make decisions like the scheduler and it doesn’t store state like etcd. Instead, it’s constantly asking:
 “What pods am I supposed to run, and are they actually running?”. If the state is not the same, it will reconcile them.
To achieve that, Kubelet operates as a loop:

- It watches the API server for pod specs assigned to its node.
- It compares that desired state with what’s running locally.
- If something is missing or broken, it fixes it.

For example actions that are normally performed by kubelet are:
- pulling images
- starting/stopping containers
- restarting crashed containers
- reporting status back to the control plane

However, is important to notice that kubelet does not get involved in any networking tasks. 
When a pod is about to start, Kubelet prepares everything, from filesystem to volumes to runtime configuration, but when it comes to networking, it hands off responsibility to CNI essentially saying: “Here’s a new container. Give it an IP and make sure it can talk to the cluster.”

This design is an architectural choice of Kubernetes. **In fact, Kubernetes doesn’t include a native networking solution by default**; instead, it delegates that entire responsibility to external CNI compliant plugins.

## CNI — the network layer

CNI stands for Container Network Interface. It’s one of those things that sounds like a service, but it’s really just a **contract**.
Indeed, strictly speaking is just a set of specifications that defines:
- how a runtime asks for networking
- what inputs/outputs look like
- how plugins should behave

Everything else is implementation detail. kubernetes only state that  _"Every pod gets its own IP, and all pods need to be able to talk to each other directly (no NAT in between)."_
This sounds simple, but it creates a big challenge:

- How do you make pod IPs routable across nodes?
- How do you scale that to thousands of pods?

That is where different CNI plugins take different approaches that will see in the next paragraph.
So, when Kubelet asks the CNI plugin to “set up” a pod, the plugin executes a series of low-level Linux networking operations. This is where things get very real and very close to the OS.
To wire up a pod, the plugin will:

- create a new network namespace for the pod (isolated networking stack)
- create a **veth pair** (two virtual interfaces connected like a cable)
- move one end into the pod namespace
- attach the other end to the host network (bridge, overlay, or routing layer)
- assign an IP address
- configure routes so packets know where to go

Once pods have IPs, how does traffic actually get routed the right pod behind a Service? This is where `kube-proxy` enters the picture.
`kube-proxy` runs on every node and watches the API server for Service and Endpoint changes. Its job is to make sure that when you send traffic to a Service IP, it gets forwarded to one of the correct backend pods.
In the traditional setup, `kube-proxy` implements this using iptables.
It translates high-level Kubernetes concepts like:
- "Service X points to Pods A, B, and C"
into low-level packet handling rules inside the Linux kernel.

### A deeper look at CNI implementations -Cilium case
As we saw before, kubernetes only give specifications for CNI leave a lot of freedom to the actual implementation. 
Some plugins (like Flannel) use overlays which encapsulate traffic between nodes.
Others (like Calico) rely more on routing and BGP. Newer ones like Cilium move the roting logic into the kernel using eBPF.

But regardless of implementation, they all sit behind the same CNI interface. **To Kubelet, they look identical.**


Ok, CNI plugins are responsible for wiring up networking, but how do they actually control traffic?

This is where the difference between traditional approaches (iptables) and modern ones (eBPF) really matters.
For a long time, Kubernetes networking leaned heavily on iptables.
iptables works by defining chains of rules that every packet is checked against. When a packet enters the system, it’s evaluated step by step until a matching rule is found. That rule might say:

- forward this packet
- rewrite its destination (NAT)
- drop it
- send it somewhere else

In Kubernetes, this mechanism gets used for several things at once:

- implementing Services (ClusterIP, NodePort)
- load balancing between pods
- handling outbound traffic (SNAT)
- enforcing some network policies

Over time, as the number of services and pods grows, the number of rules grows with it. And because iptables evaluates rules sequentially, performance becomes increasingly tied to how long those chains are and this is where eBPF changes the game.
Instead of building long rule chains, eBPF allows you to attach small, purpose-built programs directly into the Linux kernel. These programs can intercept packets at various points and make decisions immediately, often using efficient data structures like maps and hash tables.

So instead of saying: “Check rule 1, then rule 2, then rule 3…”

with eBPF you’re saying:

“Run this program that already knows how to handle this packet."

This reduces overhead and makes behavior far more performant at scale. Cilium is a CNI plugin that fully embrace this model.
Rather than relying on iptables for service routing and policy enforcement, Cilium installs eBPF programs into the kernel that handle:

- service load balancing
- network policies (including L7 in some cases)
- packet forwarding decisions

In additions Cilium can replace kube-proxy entirely. Instead of using iptables to implement Services routing, it handles them directly via eBPF.
From the outside, your Kubernetes cluster still behaves the same with Pods getting IPs, Services and Traffic flows working fine, but internally, the mechanics are very different.
With eBPF (via Cilium), the system becomes more efficient with packets handled by logic in the kernel that can evolve without rewriting massive rule sets.

This leads to higher performance at scale, faster updates (no need to rebuild long rule chains) and deeper observability, since eBPF can inspect traffic more intelligently.

## Key Takeaways

At this point, a short resume to make things clearer:

- The control plane (API server, scheduler, controllers) decides what should exist.
- Kubelet ensures pods actually run on a node.
- The CNI layer gives those pods a network identity.
- The underlying implementation (iptables or eBPF via Cilium) determines how traffic is handled.

If you zoom out far enough, Kubernetes networking is less about “one technology” and more about **layers of delegation**:

- Kubernetes delegates networking to CNI  
- CNI plugins delegate packet handling to the kernel  
- The kernel executes that logic via iptables or eBPF

I hope this article made Kubernetes appear now much less mysterious. 

