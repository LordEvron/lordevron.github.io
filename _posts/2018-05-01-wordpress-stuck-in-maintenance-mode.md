---
id: 398
title: 'WordPress stuck in Maintenance Mode'
date: '2018-05-01T20:24:02+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=398'
permalink: /2018/05/01/wordpress-stuck-in-maintenance-mode/
categories:
    - Technical
tags:
    - website
    - wordpress
---

Last day I was updating WordPress plugins on latest version. WordPress is a great Content Management System and automatically enter in maintenance mode when updating stuffs… When in maintenance mode the visitor will be presented a white page with a message saying : ***“Briefly unavailable for scheduled maintenance. Check back in a minute.”***  and no other pages are available… This is great apart the fact that something went wrong with my update and the website got stuck in maintenance mode even after that i successfully updated all the plugins… How to get out from that was relative easy, but lets see in details what happened.

To enter in maintenance mode, WordPress automatically create a “.maintenance” file in the *root site directory*. This file is just a plain text file that list the plugins that are upgrading. When the plugin finish the upgrade, WordPress should clean itself and remove that file. However something when wrong and the file stayed there. The solution was to manually delete that file.

If you manage your own server, than you can just ssh into it and remove it otherwise you can use “Filezilla” if you use FTP or “CPanel” if you use hosting services.  
Remember that is a hidden file, so you need to use “ls -a” to show it (or equivalent).  
Once removed that file, the site was up and running again…

If you do want to put your site in maintenance mode, instead of manually create that file, you can just install plugin called “WP Maintenance Mode” (or similar) that allows you to enable or disable maintenance modes with a click and easily configure the splash message displayed to the visitors.