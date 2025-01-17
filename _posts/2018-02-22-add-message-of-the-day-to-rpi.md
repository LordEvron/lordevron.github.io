---
id: 312
title: 'Add Message of the day to RPI'
date: '2018-02-22T16:10:34+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=312'
permalink: /2018/02/22/add-message-of-the-day-to-rpi/
categories:
    - Technical
tags:
    - linux
    - Message
    - MOTD
    - shell
    - ssh
---

Recently I wanted to add a message of the day (MOTD) to my RPI. Basically every time I login i want to see the some info as shown in the picture.

![](http://localhost:8080/wp-content/uploads/2018/02/Message-of-the-Day-1.jpg)

The way how to do that is to add some code to the “*~/bash\_profile*” file, so it is executed when an interactive login shell is launched (like when you ssh into it).

I found one example on the RPI website, but was showing the temperatures in “Fahrenheit” degree! So i quickly changed that to show the degree in “Celsius”. So I fixed few other things in the script (such as locations) but it was still failing to get the temperature! After some quick debugging, i discovered the the regex in the “SED” function was not parsing the minus sign in front of the weather forecast string (And in Oslo we are often below 0\*C). So I fixed also that.. Here there is the final code.. Just append it to you “*~/bash\_profile*” and should work…

```
let upSeconds="$(/usr/bin/cut -d. -f1 /proc/uptime)"
let secs=$((${upSeconds}%60))
let mins=$((${upSeconds}/60%60))
let hours=$((${upSeconds}/3600%24))
let days=$((${upSeconds}/86400))
UPTIME=`printf "%d days, %02dh%02dm%02ds" "$days" "$hours" "$mins" "$secs"`

# get the load averages
read one five fifteen rest < /proc/loadavg

echo "$(tput setaf 2)
   .~~.   .~~.    `date +"%A, %e %B %Y, %r"`
  '. \ ' ' / .'   `uname -srmo`$(tput setaf 1)
   .~ .~~~..~.
  : .~.'~'.~. :   $(tput setaf 3)Uptime.............: $(tput sgr0)${UPTIME}$(tput setaf 1)
 ~ (   ) (   ) ~  $(tput setaf 3)Memory.............: $(tput sgr0)`cat /proc/meminfo | grep MemFree | awk {'print $2'}`kB (Free) / `cat /proc/meminfo | grep MemTotal | awk {'print $2'}`kB (Total)$(tput setaf 1)
( : '~'.~.'~' : ) $(tput setaf 3)Load Averages......: $(tput sgr0)${one}, ${five}, ${fifteen} (1, 5, 15 min)$(tput setaf 1)
 ~ .~ (   ) ~. ~  $(tput setaf 3)Running Processes..: $(tput sgr0)`ps ax | wc -l | tr -d " "`$(tput setaf 1)
  (  : '~' :  )   $(tput setaf 3)IP Addresses.......: $(tput sgr0)`/sbin/ifconfig eth0 | /bin/grep "inet addr" | /usr/bin/cut -d ":" -f 2 | /usr/bin/cut -d " " -f 1` and `wget -q -O - http://icanhazip.com/ | tail`$(tput setaf 1)
   '~ .~~~. ~'    $(tput setaf 3)Weather............: $(tput sgr0)`curl -s "http://rss.accuweather.com/rss/liveweather_rss.asp?metric=1&locCode=EUR|NO|OSLO|OSLO|" | sed -n '/Currently:/ s/.*: \(.*\): \(.[0-9]*\)\([CF]\).*/\2°\3, \1/p'`$(tput setaf 1)
       '~'        $(tput setaf 3)CPU Temp...........: $(tput sgr0)`awk '{printf("%.1f °C\n",$1*1.0/1e3)}' /sys/class/thermal/thermal_zone0/temp`
$(tput sgr0)"
```