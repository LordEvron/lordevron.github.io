---
id: 460
title: 'Secrets in Kubernetes'
date: '2018-09-12T12:49:14+01:00'
author: Lord_evron
layout: post
permalink: /2018/09/12/secrets-in-kubernetes/
categories:
    - Technical
tags:
    - k8s
    - kubernetes
    - technology
---

Kubernetes is a powerful orchestration tool that simplifies deploying, managing, and scaling containerized applications. 
Numerous tutorials cover setting up your own cluster or using managed Kubernetes services on various cloud platforms. 
This post focuses specifically on Kubernetes Secret objects.
Secrets in Kubernetes are designed to handle sensitive information, such as usernames, passwords, connection strings, and other confidential data.
While this seems straightforward, let's examine how to create a Secret object in Kubernetes more closely.  Here's an example:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  username: YWRtaW4=
  password: MWYyZDFlMmU2N2Rm
```

This example defines a Secret object named "mysecret." It contains two data fields: "username" and "password."  
Crucially, the value associated with each key must be base64 encoded.  For instance, the value "admin" is encoded as "YWRtaW4=" in base64.
Accessing these secrets is also relatively simple.  
A Pod, for example, can access and load these secrets as environment variables using the following configuration:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-env-pod
spec:
  containers:
  - name: mycontainer
    image: redis
    env:
      - name: SECRET_USERNAME
        valueFrom:
          secretKeyRef:
            name: mysecret
            key: username
      - name: SECRET_PASSWORD
        valueFrom:
          secretKeyRef:
            name: mysecret
            key: password
  restartPolicy: Never
```

Hope that this basic intro helps you to understand k8s secrets!

