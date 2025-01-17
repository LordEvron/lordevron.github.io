---
id: 460
title: 'Secrets in Kubernetes'
date: '2018-09-13T12:49:14+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=460'
permalink: /2018/09/13/secrets-in-kubernetes/
yasr_overall_rating:
    - '5'
yasr_review_type:
    - Product
categories:
    - Technical
tags:
    - k8s
    - kubernetes
    - secrets
---

Kubernetes is a great orchestration tool. It allows to deploy and easily manage dockerized applications and be able to scale them properly. There are many tutorials on how to set up your own cluster or use one of the managed ones in any cloud provider. But in this post i want to focus on the secrets objects.

Secrets in Kubernetes are objects that handler sensitive data such as Usernames, passwords, connection strings, etc.

So far so good. However lets give a closer look on how to create a secret object in Kubernetes. Here is reported an example:

```
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  username: YWRtaW4=
  password: MWYyZDFlMmU2N2Rm
```

This object is a secret object called “mysecret”. It contains two data fields. One key called username and one key called password. The value of each key must be encoded in base64. For example the value “admin” has been encoded in base64 resulting in “YWRtaW4=” .

Accessing secrets is also pretty straight forward. For example a Pods can access this secrets and load it as env variable with the following lines:

```
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

This post is related to the base 64 and echo command post.