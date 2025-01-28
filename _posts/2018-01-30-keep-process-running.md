---
id: 195
title: 'Keep Linux process running'
date: '2018-01-30T19:27:21+01:00'
author: Lord_evron
layout: post
guid: 'http://presspi/?p=195'
permalink: /2018/01/30/keep-process-running/
categories:
    - Technical
tags:
    - code
    - linux
    - shell
    - technology
---

Today, I wanted to show a quick Shell script in linux that make sure that my processes are always running… I know, I know… There is “Systemd” with “systemctl” command that take care of that… but what if we do not want to use Systemd or we need to manually force always running services, or we just are looking for to another alternative? how to do that?   
well, how do you normally check if a process is running? with `ps -ax` .. good and what if you need to filter only your process? well then `ps -aux | grep myprocess`… good..last question.. what is the daemon that run task at given time interval? cron.. so we can just use those ingredients to make a script that keeps myprocess always running…

First of all we define the “$process” that we want always running…this is the string that appear in the ps ax command… then we define a command that start our service (makerun).. then we create a script that every time that is invoked, check if `ps -ax | grep mycommand` return something… if it does means that our scrip is running, so it just exit, otherwise, it will launch makerun command.  
there is a small addition to it... `ps aux | grep my command` return always also the grep process… so for removing it from the list there is one of the most beautiful line of code ever: `grep -v grep` which basically return everything except grep… once that we have the shell script is enough to add a cron job invoking this script every min or so and will make sure that our process is always running…

Here is the code:

```bash
#!/bin/bash
#make-run.sh
#make sure a process is always running. ADD A CRON entry to RUN this script every 5 min or so

export DISPLAY=:0 #needed if you are running a simple gui app.

process=vitalscript.py
makerun="python /usr/local/mycode/vitalscript.py"

if ps ax | grep -v grep | grep $process > /dev/null
then
    exit
else
    $makerun &
fi

exit
```
