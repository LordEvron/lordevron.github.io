---
id: 462
title: 'Base64 and &#8220;echo&#8221; command'
date: '2018-09-13T12:55:23+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=462'
permalink: /2018/09/13/base64-and-echo-command/
yasr_overall_rating:
    - '5'
yasr_review_type:
    - Product
categories:
    - Technical
tags:
    - base64
    - bash
    - k8s
    - linux
---

As we saw in the previous post, [secrets in Kubernetes](http://localhost:8080/2018/09/13/secrets-in-kubernetes/) are passed and stored in base64 form. However when i was trying to do so, I run in a lot of problems, such as not escaped characters, wrong username, wrong password ,etc. At the end I found out the reason and I think is nice to report it in this quick post. So, lets see…

One nice way to encode the values in base64 is using the base64 tool available in any linux distribution (even GIT bash in windows has it). So you can issue the following command to convert a value in base64:

```
$ echo "admin" | base64 -w0
```

However if you do that you will notice that the output is “YWRtaW4K” and not “YWRtaW4=” (which is the expected output) . The reason is because echo command issue a new line character automatically, and thus will be appended, passed and encoded in base64 too, causing all sort of problems.

The solution is to append -n to echo to prevent the new line to be added. The correct command is

```
 $ echo -n "admin" | base64 -w0
```

This will output the correct value.

Also for decoding you can easily do that by:

```
 $ echo "YWRtaW4=" | base64 -d
```

I hope this quick post was useful!