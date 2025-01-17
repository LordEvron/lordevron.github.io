---
id: 254
title: 'Flash code to ESP8266 ESP-12 Module &#8211; Step-by-step guide&#8230;'
date: '2018-02-08T20:57:34+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=254'
permalink: /2018/02/08/flash-code-to-esp8266-esp-12-module-step-by-step-guide/
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

Recently I found a box in the shared hardware lab… That box has been there forgotten by everyone else for some years.. I looked inside and together with some useless crap, there was a small chip-module about 1 x 2cm in size labelled as “ESP8266” … I thought: “*Probably*

someone bought as part of larger packages and not able to use it.. or was part of some discovery kit…”. well anyway I thought was just another WiFi module.. People normally use these simple modules for giving connectivity to their Arduino boards.. But at that point I also noticed few GPIO pins and a build it antenna: Cool, **this meant that I could reprogram the MCU and use It as stand alone** <span style="font-size: 1rem;">**module!** Basically like an arduino but just much smaller… OK it got my attention –at least worth to do a quick google search.. </span>

After reading a couple of pages i stumble on a library that implemented a function `"wifi_send_pkt_freedom()"` developed by the chip producer “Espressif” … WOW that was a FULL JACKPOT!!… things started to get interesting.. Basically that function allows you to send ANY data over wi-fi… and with any data I mean you own low level package… Basically you could manually create a wifi frame and send it over the air.. How cool is that? I thought: “wow I can do a bunch of nasty stuff with that.. from creating fake Access points to wide spread De-authentication attacks” (of course just for purely educational/test purposes..)!!! .. But I will discuss this in a separate article… Lets go back to the original topic..

Now lets clarify few things first. The ESP8266 is just the chip itself produced by Espressif that include MCU and wifi module and Full Tcp Stack inside. AI-Thinker is the producer of the <span style="text-decoration: underline;">module</span> that has the ESP8266 chip onboard. AI-Thinker has made around 20 different variations of the module, each one differing from the pinout, dimensions, Integrated antennas and so on. They named those modules as ESP-XX.

<figure aria-describedby="caption-attachment-261" class="wp-caption aligncenter" id="attachment_261" style="width: 300px">![](http://localhost:8080/wp-content/uploads/2018/02/ESP8266-300x300.jpg)<figcaption class="wp-caption-text" id="caption-attachment-261">ESP8266 – AI-Thinker ESP12</figcaption></figure>

In addition there are DEV-Boards that include a nice USB connector ready to be plugged to your pc. This is really nice and most of the tutorial out there actually refer to this.. But mine did not had any USB, so how to connect it to the PC and flash the firmware? the answer is FTDI. Ftdi is a small USB-to-Serial converter. Everyone working with electronic should already know it. Basically you attach it to the PC and it pops up as COM port (or TTY port if you are on Linux). So lets start with the hardware connections.

###  **HARDWARE**

This is the pinout of the module.

<figure aria-describedby="caption-attachment-260" class="wp-caption aligncenter" id="attachment_260" style="width: 401px">![](http://localhost:8080/wp-content/uploads/2018/02/ESP_8266-PinOut.jpg)<figcaption class="wp-caption-text" id="caption-attachment-260">ESP12 Pinout</figcaption></figure>

For flashing mode:  
<span style="font-size: 1rem;">1. SERIAL: You need a FTDI-USB converter (or a very old pc with a physical serial port 😀 (LOL I am so funny…) ) –&gt; connect the FTDI\_RX to TXD and the FTDI\_TX to the RXD of the module.  
2\. POWER: Supply the module with VCC-&gt;3.3V and GND.  
3\. Gpio15: Connect the GPIO15 to GND using a 10 KOhm Resistor.  
4\. Connect GPIO0 to Ground with a 10Kohm resistor. This make the ESP entering in FLASHING mode.  
5\. If your chip has an ENABLE (or CH\_EN) pull it High using a 10kohm resistor…(mine didn’t)</span>

***Please notice that AFTER that GPIO0 is pulled LOW you must RESET the MCU for entering in Flash mode..***

Unfortunately, despite I had all in place the flashing was still failing. After many attempt I suspected that had to be a power issue. So the FTDI chip WAS not ABLE to supply enough power for the flashing stage. So I used an external 3.3V (using the 3.3v output of an Arduino) and connected the FTDI ground together with the other grounds (leaving the 3.3V output of the FTDI disconnected). And Voila’ that was it…

###  **SOFTWARE**

The ESP can actually be flashed using the Arduino IDE but some more settings are required which i found on internet. In Particular:

1. Go to File &gt; Preferences
2. <span style="font-size: 1rem;">Add http://arduino.esp8266.com/stable/package\_esp8266com\_index.json to the Additional Boards Manager URLs. (source: https://github.com/esp8266/Arduino)</span>
3. <span style="font-size: 1rem;"> Go to Tools &gt; Board &gt; Boards Manager and look for </span><span style="font-size: 1rem;">esp8266</span>
4. <span style="font-size: 1rem;"> Select the version that best suite you and install. **Notice that if you want the `"wifi_send_pkt_freedom()"` than you must install the 2.0.0 .** I tried with the latest version but does not work.. **ALSO <span style="text-decoration: underline;">Notice that for using that functions more settings are required</span>.** I will have another Article explaining better what to do with code and such. This time we are just flashing “hello world” code… </span>

Well After this is done, from Tools–&gt; Board you will see the ESP8266 sections.. You can either select the ESP12 or the generic. I have this settings:

![](http://localhost:8080/wp-content/uploads/2018/02/ESP8266_Arduino_settings.jpg)

Just select the correct COM/tty Port and should work!!! You can try flash any Arduino code…

**ONCE that you Flashed the code, CHANGE GPIO0 to VCC and RESTART the MCU, so it will run the new firmware.** If you do not switch to VCC, the module will still be in flash mode, and your code will not run on reset…

Obviously you can also Monitor the Serial Port to read the message printed by your code just like an Arduino!

If you experience problems make sure this two things:

1. The MCU is properly supplied
2. You remember to reset the MCU after switching GPIO0 to LOW/HIGH

Well that is it.. Next time we will use this module to do some cool Stuffs!