---
id: 852
title: 'Docker Image Migration script'
date: '2021-11-12T18:12:30+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=852'
permalink: /2021/11/12/docker-image-migration-script/
yasr_schema_additional_fields:
    - 'a:1:{s:17:"yasr_schema_title";s:0:"";}'
ao_post_optimize:
    - 'a:5:{s:16:"ao_post_optimize";s:2:"on";s:19:"ao_post_js_optimize";s:2:"on";s:20:"ao_post_css_optimize";s:2:"on";s:12:"ao_post_ccss";s:2:"on";s:16:"ao_post_lazyload";s:2:"on";}'
categories:
    - Technical
tags:
    - code
    - docker
    - script
---

Docker is changing.. and as all the changes in this period, things are getting shittier. So recently the announced two shitty things:

1\. Docker desktop is not gonna be free anymore for companies above 250 employees

2\. They messed up again the way how you can manage and define docker teams and image repo in the docker registry.

Regarding 1, we are just waiting that everyone start to migrate to free alternative (eg [Rancher ](https://rancherdesktop.io/)). For number 2, this article will help to save a shitload of money.

Basically, few year back, you were billed based for the number of users belonging to an organization. Organization then could have and manage multiples Teams for free. Each team had its own repo name (with some restriction).

Now this has changed. You get billed per TEAM. so if you have two teams, once called TEAM1/ and another called TEAM2/ you will get charged twice, even if they belong to the same organization and if the user base is the same. This was more or less what we had. They really pissed me off, when they blocked the pulling of my private images for the team with no subscription. They hold them in hostage, because they wanted me to pay for both TEAM1 and TEAM2. So then i just decided to squash all the images in the same Team (since I did have infinite repo available for Team1 )!

So i wrote a script that moved all my repo from team2 to team1, including COPY of ALL TAGS!!!! By doing this i squashed all the images in the same repo, without loosing any of the previous tags.

If you run into the same problem, remember that they block you read access for TEAM2. So you either need to pay 1 month subscription for team2 while you migrate the images, or make it temporarily public and delete it once migrated (you cannot make it private again without a pro subscription). Migration takes only 1 or 2 min, so you chose.

Here you can find the script –&gt; <https://github.com/LordEvron/dockermigration>

There is a Readme with the instructions on how to use it. In case you want to prepend some string either to the image name or to the tags, you edit a bit the code to support that simple feature. Leave a comment if you encounter into any problem.

I hope that this is useful…. Thanks for reading!