---
id: 202
title: 'Unable to pull images from Docker Hub'
date: '2018-01-31T15:06:26+01:00'
author: Lord_evron
layout: post
guid: 'http://presspi/?p=202'
categories:
    - Technical
tags:
    - docker
    - technology
---

Several of my colleagues and I encountered an issue where we couldn't pull images from Docker Hub. 
We successfully logged in via the local Docker console and verified user permissions on the web admin page. After troubleshooting, we discovered a workaround: using our usernames instead of emails for authentication.

While using emails seemed to log us in, it prevented image pulls. So just use your username and password instead and it will work!  
This bug is still there as 31 January 2018…