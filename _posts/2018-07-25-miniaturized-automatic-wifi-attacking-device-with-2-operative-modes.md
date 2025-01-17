---
id: 258
title: 'Miniaturized Automatic WiFi attacking device with 2 operative modes&#8230;'
date: '2018-07-25T11:15:33+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=258'
permalink: /2018/07/25/miniaturized-automatic-wifi-attacking-device-with-2-operative-modes/
categories:
    - Technical
tags:
    - Arduino
    - ESP12
    - ESP8266
    - flash
    - MCU
    - Wifi
---

I want to continue the discussion about the ESP12 that i started last time… Short resume: I found a ESP8266 wifi module and I accidentally discovered that can be used to send free wifi packages. This was enough to fully catch my attention and try to do some cool stuffs with it…  
In particular i decided to build a wifi portable de-authentication device. So but this bad things were so obvious that someone else had to have already done it… A quick search on github and i found [death-attack implemented on a 8266-ESP12](https://github.com/spacehuhn/esp8266_deauther) which implemented a targeted deauth attack towards a *<span style="text-decoration: underline;">specific Client</span>*… Well not what i was looking for but close enough.. Anyway back to the original track..I originally started by just wide sending broadcast de-authentication attacks… This did not work properly since mostly of the new devices, actually ignore broadcast messages. So I had to find a way around. Luckily the code that i found had some function to list specific clients. So that was it. I programmed the code to loop for each network and store all the client connected to it. Then the attack could start by sending 3 client-targeted deauthenticated frames. once reached the end, the loop restarts, regenerating the new client lists and resending attacks… It works like a charm effectively jamming all the wifi 2.4GHz channels (not the 5GHz!). while is on, no device is able to connect or use the wifi..

Not happy i also wanted to implement a second cool feature. Fake BSSID! Since we can send forged frames, than we can make it simulate fake Access points! since i had still free space on the flash of the device, i decided to implement this attack on the side, and then select which attack we want to perform by toggling a pin HIGH or LOW. In this second attack mode, the devices will generate 150 access points each with its own name and MAC, that will be visible from any client around it. I wanted to generate 255 but unfortunately the core speed is not so fast, so it takes pretty long to send out beacons, so if you increase too much the number of access point, the beacon/sec rate for each access point drops too much and do not get picked up as access point. Around 50 is the optimal number. You can set up this number in the code.

So resuming the device that can perform TWO type of attacks: The device does not need any control or start. Just power it up and it start working right away. By having GPIO16 to GND or to VCC you can select one of the two attack modes:

1- Wide Band Death attack (Selected with GPIO16 to GND) … This will make deautenticate all the client within few meters from the devices. Until the device is powered, no client is able to connect to any network. Clients already connected will be disconnected.  
2- Fake SSID flooder (Selected with the GPIO16 to VCC) … This will create 150 different fake access points. The fake access points will be visible from any client around it.

The full code with more detailed instructions,[ can be found on my git page](https://github.com/luca85/ESP_wifi_fun).

I also want to include a small disclaimer: THIS IS FOR TESTING PURPOSE ONLY. I AM not RESPONSIBLE FOR ANY MISSUSES OF THE CODE. USE IT ONLY IN ISOLATED ENVIRONMENT AND FOR TESTING AND UNDERSTANDING THE 802.11 PROTOCOL. The effect of this code can be easily reproduced with a simple command in AirCrack-ng tool, so there is nothing new on the table. Just another way to do it.

Few final remarks:

1\. notice that the device only work with 2.4GHz and not with 5GHz!

2\. . The device has limited speed capabilities. It take around 1.3 seconds to loop around all 150 SSIDs. This means that the client will get 2 beacon every 1.3 seconds for each fake SSID. This 10 time lower frequencies than what is normal.

3\. [Read my previous post on how to flash code on the ESP-12](http://localhost:8080/2018/02/08/flash-code-to-esp8266-esp-12-module-step-by-step-guide/)

Also, since it was just a quick test, i just spent few hours on it, the bare minimum to make it work. So the code look really messy!!! But it works and that is the important part 🙂 !  
I hope you enjoyed the reading.