---
id: 852
title: 'Docker Image Migration script'
date: '2021-11-12T18:12:30+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=852'
permalink: /2021/11/12/docker-image-migration-script/
categories:
    - Technical
tags:
    - code
    - docker
    - technology
---

Docker's recent changes have made things more difficult for users.  Two key issues are:
1. Docker Desktop is no longer free for companies with over 250 employees.  Many are expected to migrate to free alternatives like Rancher Desktop.
2. Docker has restructured how teams and image repositories are managed in the Docker Registry, leading to increased costs.

Previously, billing was based on the number of users in an organization, and organizations could create multiple free teams, each with its own repository. 
Now, billing is per team.  
This means if an organization has two teams (e.g., TEAM1 and TEAM2) with the same users and repositories, they are billed twice.
This change can significantly increase costs. In my case, Docker blocked access to private images in one of my
teams without a subscription, essentially holding the images hostage. 
To resolve this, I had to consolidate all images into a single team's repository.

They created a script to migrate all repositories from TEAM2 to TEAM1, including copying all tags. 
This allowed me to consolidate images without losing any previous tags.

The script is available on my [GitHub](https://github.com/LordEvron/dockermigration)

The README provides instructions for use. The script can be easily modified to prepend a string to image names or tags.


A key challenge is that Docker blocks read access to the team without a subscription (TEAM2 in this example). 
You have two options: pay for a one-month subscription for TEAM2 during migration, or temporarily make the repositories public,
migrate them, and then delete the public repositories (note: making them private again requires a pro subscription). 
The migration process itself is quick, taking only a few minutes.


I hope that this is useful…. Thanks for reading!

