---
id: 398
title: 'WordPress stuck in Maintenance Mode'
date: '2018-05-01T20:24:02+01:00'
author: Lord_evron
layout: post
permalink: /2018/05/01/wordpress-stuck-in-maintenance-mode/
categories:
    - Technical
tags:
    - technology
    - wordpress
---

I recently updated my WordPress plugins to the latest versions. WordPress, a fantastic Content Management System,
automatically enters maintenance mode during updates, displaying a "Briefly unavailable for scheduled maintenance.
Check back in a minute" message to visitors.  This is normally a smooth process, but this time, something went wrong. 
My site remained stuck in maintenance mode even after the updates were complete.  While resolving the issue was relatively straightforward, 
let's explore what happened.


WordPress enters maintenance mode by creating a `.maintenance` file in the website's root directory. 
This simple text file lists the plugins being updated. Upon successful completion, WordPress should automatically delete this file, exiting maintenance mode. 
However, in my case, the file remained, keeping the site offline. The solution was to manually delete the .maintenance file.
If you manage your own server, you can SSH into it and remove the file directly. 
Alternatively, you can use an FTP client like Filezilla or your hosting service's control panel (like cPanel). 
Remember that the .maintenance file is often hidden, so you might need to use a command like ls -a (or the equivalent in your file manager) to see it. 
Once the file is deleted, your site should be back online.

For a more convenient way to manage maintenance mode, consider using a plugin like "WP Maintenance Mode" (or similar). 
These plugins allow you to easily enable and disable maintenance mode with a single click and customize the message displayed to visitors.

