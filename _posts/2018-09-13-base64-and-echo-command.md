---
id: 462
title: 'Base64 and echo command'
date: '2018-09-13T12:55:23+01:00'
author: Lord_evron
layout: post
permalink: /2018/09/13/base64-and-echo-command/
categories:
    - Technical
tags:
    - bash
    - linux
    - kubernetes
    - technology
---

As discussed in a previous post about [Kubernetes Secrets](/2018/09/12/secrets-in-kubernetes/) data is stored and transmitted in base64 encoded format.  
During my own experimentation with this process, I encountered several issues, including problems with unescaped characters, incorrect usernames, 
and incorrect passwords. I eventually identified the source of these problems and wanted to share the solution in this brief post.


One common method for base64 encoding is using the base64 command-line tool, available on most Linux distributions (and even within Git Bash on Windows). 
You can convert a value to base64 by issuing the following command:
```bash
$ echo "admin" | base64 -w0
```

However, you'll likely notice that the output is "YWRtaW4K" and not the expected "YWRtaW4=". 
This is because the echo command automatically adds a newline character, which is then included in the base64 encoding process, causing various issues.

The solution is to use the -n flag with the echo command to suppress the newline character. The correct command is:

```bash
$ echo -n "admin" | base64 -w0
```

This will output the correct value.
Also for decoding you can easily do that by:

```bash
$ echo "YWRtaW4=" | base64 -d
```

I hope this quick post was useful!
