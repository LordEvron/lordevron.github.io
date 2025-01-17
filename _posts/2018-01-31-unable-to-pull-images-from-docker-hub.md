---
id: 202
title: 'Unable to pull images from Docker Hub&#8230;'
date: '2018-01-31T15:06:26+01:00'
author: Lord_evron
layout: post
guid: 'http://presspi/?p=202'
permalink: /2018/01/31/unable-to-pull-images-from-docker-hub/
categories:
    - Technical
tags:
    - docker
    - issue
    - login
---

It happened to me and to some of my colleagues that we were unable to pull images from Docker Hub… From the local docker console the login was successful and from the web admin page we set up all the correct permissions for the users… After some hours of struggling, I finally was able to figure out what was the problem and — was deeply technical …  
I tried to login with username and password instead of email and password and it just worked!…  
So if you use with your email and password it seems to login, but will not let you pull the images from the hub… So just use your username and password instead and it will work!  
This bug is still there as 31 January 2018…