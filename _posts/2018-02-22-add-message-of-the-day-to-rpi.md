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
    - technology
    - bash
    - code
---

I recently decided to implement a message of the day (MOTD) on my Raspberry Pi.  
My goal was to have certain information displayed upon each login, similar to what's shown in the image.

<div class="image-container">
  <img src="{{ site.baseurl }}/assets/images/2018/02/Message-of-the-Day-1.jpg" 
       alt="Message of the Day" 
       class="img-responsive" 
       style="display: block; margin: 0 auto; max-width: 700px;">
        <figcaption class="caption" 
              style="display: block; text-align: center; margin-top: 10px;">
    Message of the Day
  </figcaption>
</div>

This can be accomplished by adding commands to the `~/bash\_profile` file, which is executed when an interactive login shell is started (like when you SSH into the Pi).

 I found a sample script on the Raspberry Pi website, but it displayed temperatures in Fahrenheit. I quickly converted it to Celsius, made a few other adjustments (like location settings), but it still failed to retrieve the temperature. After some debugging, I discovered that the regular expression in the `sed` command wasn't correctly parsing the minus sign for sub-zero temperatures (a common occurrence in Oslo!).  I've fixed that as well.  The final, working script is below. Just append it to your `~/.bash_profile` file.
```bash
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

