---
id: 854
title: 'Sniffing Android App Traffic'
date: '2022-01-20T17:34:41+01:00'
author: Lord_evron
layout: post
permalink: /2022/01/20/sniffing-android-app-traffic/
categories:
    - Technical
tags:
    - android
    - technology
    - linux
    - hack
---

Have you ever installed an app on your phone and wondered what kind of data it's sending? 
Or maybe you've wanted to reverse engineer an app or API to understand its data communication? If so, this post might be helpful.

Traffic sniffing can be used for various purposes, including (but not limited to):  performing Man In The Middle (MITM) malicious attacks (illegal), 
app cracking (illegal), or replacing an app with a custom version (legal). No need to say that my case is the last one 🙂 . 
In particular, I had an app that synced sensor data to their proprietary cloud service. I wanted to replicate this functionality with my own Python script,
but I lacked information about the endpoints, data format and communication protocol. Traffic sniffing provided the necessary missing information.


While tools like Burp, Ettercap, and proxy.py are effective for traffic interception, 
I chose [MITMProxy](https://mitmproxy.org/), because it is easy to use and available as a Docker image. 
With Docker installed, I simply started MITMProxy using:

```bash
docker run --rm -it -p 8080:8080 -p 127.0.0.1:8081:8081 mitmproxy/mitmproxy mitmweb --web-host 0.0.0.0
```

This starts both the MITM traffic interface on port 8080 and the web interface on 8081. Then you can just navigate on your browser on localhost:8081 and 
it should show the MITM interface. Now that MITMproxy is up and running, you need to configure your android device to use your pc as a proxy. For doing so: 

1. Find your PC's IP address.
2. Configure Android's Wi-Fi settings:
     - Go to Settings > Wi-Fi.
     - Tap and hold your Wi-Fi Network Name.
     - Select Modify Network.
     - Click Advanced Options.
     - Tap Manual.
     - Add your PC's IP address as the Proxy and 8080 as the Port.

This routes your phone's internet traffic through your PC, allowing MITMProxy to intercept it.

Next, install the MITMProxy certificate on your Android device:

1. Open your phone's browser and navigate to mitm.it.
2. Download and install the certificate as instructed.

After these steps, you should be able to see traffic from your browser in the MITMProxy web interface. 
However, I encountered an unexpected issue: only browser traffic was visible, not traffic from other apps.


The reason was that starting with Android 7, apps by default do not trust user-installed certificates. 
This meant that if used with older Android certificate injection device were successful, but newer versions presented a challenge.
In my specific case, I successfully used an Android 6 device, which did not require any additional configuration to accept user-installed certificates. 

To overcome this limitation on newer Android devices you need to:

- **use a Rooted Devices**: The easiest solution is to manually install the MITMProxy CA certificate into the system's trusted certificate store. 
This requires root access and involves copying the certificate file to `/system/etc/security/cacerts` with appropriate permissions (e.g., chmod 644).
Before copying files, you may need to remount the Android file system in read-write mode. Use the following command: `mount -o rw,remount /`
I worth to mentions, that Emulators (like Android Studio's emulator) are generally easier to root and work great for testing purposes.

- **For Non-Rooted Devices**: Consider using tools like [apk-mitm](https://github.com/shroudedcode/apk-mitm), which can modify the app's APK file 
to bypass certificate pinning restrictions. So reinstall the new modded version of the app, and you should be able to see all its traffic.

Alternative methods, such as using tools like Frida or Fiddler, may also be effective for traffic interception. However, I have not tried these options.

When finished, remember to remove the MITMProxy certificate from your device after completing your analysis to maintain system security.

Hope that this is useful and you enjoyed the reading!. Feel free to leave a comment 🙂
