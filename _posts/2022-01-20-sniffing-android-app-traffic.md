---
id: 854
title: 'Sniffing Android App Traffic'
date: '2022-01-20T17:34:41+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=854'
permalink: /2022/01/20/sniffing-android-app-traffic/
yasr_schema_additional_fields:
    - 'a:1:{s:17:"yasr_schema_title";s:0:"";}'
ao_post_optimize:
    - 'a:5:{s:16:"ao_post_optimize";s:2:"on";s:19:"ao_post_js_optimize";s:2:"on";s:20:"ao_post_css_optimize";s:2:"on";s:12:"ao_post_ccss";s:2:"on";s:16:"ao_post_lazyload";s:2:"on";}'
categories:
    - Technical
tags:
    - Android
    - APP
    - linux
    - MITM
---

Have you ever installed an app on your phone and wondered what type of data is reporting? Or maybe you wanted to reverse engineer an APP or an API and wanted to discover the format of the data sent? Well then you need to read this post.

The reason someone wants sniff the traffic that can vary a lot, for example for performing Man In The Middle (MITM) malicious attacks (illegal), app cracking (illegal), or replacing an app with a custom version (legal ). No need to say that my case is the last one 🙂 . In particular, I have an app that sync some of my sensors with online cloud storage. However, instead of using the app, i just wanted to use a python script (running for example on a RPI) to submit the data manually, without using their proprietary app. The problem was that i did not knew what to submit and where to submit it! So the solution was to sniff traffic.

In order to perfmorm a MITM attack, there are many tools available such as Burp, Ettercap, proxy.py, etc, that also works quite well, however i used [MITMProxy](https://mitmproxy.org/), because it works out of the box and is available over docker image. Indeed, since I had a laptop with docker installed, I could just start it using:

```
<span class="tadv-color" style="color:#00d084">docker run --rm -it -p 8080:8080 -p 127.0.0.1:8081:8081 mitmproxy/mitmproxy mitmweb --web-host 0.0.0.0</span>
```

This starts both the MITM traffic interface on port 8080 and the web interface on 8081. Then you can just navigate on your browser on localhost:8081 and it should show the MITM interface.

 Now that MITMproxy is up and running, you need to configure your android device to use your pc as a proxy. First keep note of your pc IP address. Then Open your Android’s **Settings**, Tap **Wi-Fi**, Tap and hold the Wi-Fi **Network Name**, Select **Modify Network**, Click **AdvancedOptions,** Tap **Manual.**  Now you should see add proxy. So you just need to add your PC IP address as IP and 8080 as port. With this configuration, you are basically telling your phone to use your pc as Proxy server. The traffic will be then intercepted by MITM proxy and forwarded to final destination. There is still one passage to be done and is to install the mitm certificate. Indeed, the traffic leaving your phone is most likely using TLS encryption, so you need to install the mitm certificate on your browser. To do so, from your phone browswer just navigate to [mitm.it ](http://mitm.it/) and download and install the certificate (it will get installed as User Certificate)…**After that you will start see the Traffic in the MITM web interface opened to the PC**. However, I was expecting to be able to see all my traffic, but I was WRONG… for some strange reason i was only able to see traffic from my browser and not from my APPs.

 The reason is that starting from Android 7, ***User certificate are not accepted anymore by default from the APPS.*** *Using an older Android phone worked like a charm (and that is what i did).*

For android with version &gt; 7, the app need to be compiled with special flags to accept user certificates… So, what is the solution? For ROOTED Android device &gt; 7 , then the easiest solution is to copy the certificate file directly into the system store (set permission to 644)

<span class="tadv-color" style="color:#00d084">“`system/etc/security/cace`</span>`<span class="tadv-color" style="color:#00d084">rts"</span>`

This will trick android system believing that is a system certificate and will be accepted also by the app.

Alternatively, you can get somehow the hands on the apk file of the app (using an apk dowloader) and then using this[ apk-mitm](https://github.com/shroudedcode/apk-mitm) tool. The tool simply remove all the certificate pinning from the app and makes it accept user certificates. So reinstall the new modded version of the app, and you should be able to see all its traffic.

There are some alternative ways, using FRIDA, Fiddler, etc but I have never tried those methods.

Of course, is worth to mention that all this works perfectly fine also with a Virtual Android Device (emulator), and is even easier to root it :-D.

At the end, do not forget to remove your MITMPROXY certificates!

Hope that this is useful and you enjoyed the reading!. Feel free to leave a comment 🙂