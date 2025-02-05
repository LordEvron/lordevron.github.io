---
id: 258
title: 'Miniaturized Automatic WiFi attacking device with 2 operative modes'
date: '2018-07-25T11:15:33+01:00'
author: Lord_evron
layout: post
permalink: /2018/07/25/miniaturized-automatic-wifi-attacking-device-with-2-operative-modes/
categories:
    - Technical
tags:
    - arduino
    - ESP12
    - ESP8266
    - hardware
    - technology
---

I'm continuing my exploration of the ESP12. To recap, I discovered that this ESP8266 Wi-Fi module can be used to send free Wi-Fi packets, 
sparking my interest in building something cool.

My goal was to create a portable Wi-Fi deauthentication device.  Suspecting this had been done before, 
I searched GitHub and found a project called [esp8266_deauther](https://github.com/spacehuhn/esp8266_deauther) that implemented a 
targeted deauthentication attack against a specific client.  While not exactly what I was looking for, it was a useful starting point.

Initially, I tried broadcasting deauthentication attacks, but most modern devices ignore broadcast messages. 
Fortunately, the code I found included functions for listing connected clients.  
I adapted the code to loop through each network, storing all connected clients. The attack then sends three targeted deauthentication frames to each client.  
After completing the loop, it regenerates the client list and repeats the attack. This effectively jams all 2.4GHz Wi-Fi channels (though not 5GHz).  
While active, the device prevents new connections and disrupts existing ones.
I also wanted to add a fake BSSID feature.  Since the device can forge frames, it can simulate fake access points.  
With remaining flash memory, I implemented this attack as a secondary mode, selectable via a GPIO pin. 
In this mode, the device generates 150 fake access points, each with its own name and MAC address, visible to any nearby client.  
I originally aimed for 255 access points, but the ESP8266's processing speed limits the beacon rate. 
Generating too many access points reduces the beacon rate per access point, making them undetectable. 
Around 150 proved to be optimal, a number configurable in the code.

In summary, the device performs two types of attacks: It requires no user interaction after being powered on. GPIO16 controls the attack mode:

1. **Wide Band Deauthentication Attack** (GPIO16 to GND): Deauthenticates all clients within range, preventing connections and 
disrupting existing ones until the device is powered off.
2. **Fake SSID Flooder** (GPIO16 to VCC): Creates 150 fake access points, visible to any nearby client.


The complete code, along with detailed instructions, is available on my [GitHub page](https://github.com/LordEvron/ESP_wifi_fun).

**Disclaimer**: This code is for testing purposes only. I am not responsible for any misuse. Use it only in isolated environments for testing and understanding the 802.11 protocol. The effects of this code can be easily replicated with a simple command in AirCrack-ng; this is simply another implementation.


Final Remarks:

1. This device only works with 2.4GHz Wi-Fi, not 5GHz.
2. The device has limited processing power. It takes approximately 1.3 seconds to cycle through all 150 SSIDs. 
This results in each fake SSID receiving only two beacons every 1.3 seconds, a much lower frequency than normal.
3. For instructions on flashing code to the ESP-12, see my [previous post](/2018/02/08/flash-code-to-esp8266-esp-12-module-step-by-step-guide/).

This project was a quick test, and the code reflects that it's functional but admittedly messy. I hope you found this interesting.
