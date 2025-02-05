---
id: 864
title: 'Sony Bluetooth Headsets on Linux'
date: '2022-03-01T16:42:55+01:00'
author: Lord_evron
layout: post
permalink: /2022/03/01/sony-bluetooth-headsets-on-linux/
categories:
    - Technical
tags:
    - hardware
    - bluetooth
    - linux
    - pulseaudio
---

If you are a Linux user, and you have a Bluetooth headset, then you know how frustrating can be to set it up properly. 
In this article, I will explain what the problem I faced and how can be partially solved.


Once that you pair your Bluetooth headset with your Linux distro, you will notice that you can choose two different profiles. 
One is called HSP/HFP, and the other one is A2DP.  
HSP (Handset Profile) / HFP (Hands Free Profile) Bluetooth profiles are those required for typical, mono Bluetooth headset operations; 
A2DP (Advanced Audio Distribution Profile) on the other hand, allows to stream high quality audio but unfortunately is not a bidirectional profile 
(so you cannot use the Microphone with it). In order to make A2DP bidirectional, non trivial changes to the kernel are required and are not going to happen soon.  
So the only profile that allows us to use our Bluetooth headset for meetings is the HSP/HFP profile. 
Unfortunately this profile, uses audio encoded in 64 kbit/s which is quite low quality and sound like a phone from 1950s . 
New standard of the HFP is using mSBC codec, which will improve sound quality quite a bit, but is still not yet supported from PulseAudio. 
I will not comment on how pulseAudio banned the guy that fixed this problem 2 years ago, and never merged his pull request. 
The reason they banned him was because he pointed out how idiot they were and apparently is not allowed by their retarded 
code of conduct ([you can read more here.](https://gitlab.freedesktop.org/pulseaudio/pulseaudio/-/merge_requests/227)). 
Anyway, pipewire (wich is basically a replacement for pulseaudio) already fixed this problem, so you could unistall pulseaudio and install pipewire.
However when i tried to do so on my Linux Mint Distribution, I ended up with a broken Desktop, and I had to reinstall Cinnamon because 
it depended by pulseaudio (and I also manually reinstalled pulseaudio-bluetooth package to make your Bluetooth work again.)

So starting to get pissed off, I decided that for me was enough to use A2DP profile while listening music and watching video,
and keep the crappy HSP profile when I was on calls. So the first thing that i tried to do is to change the pulseaudio configuration `/etc/pulse/default.pa` file to

```bash
load-module module-bluetooth-policy auto_switch=2
```

which supposedly should automatically switch profile when detect some application using the microphone, 
however the `auto_switch=2` was creating problem and not behaving as expected especially with Firefox and google meet. 
So I ***removed*** the auto switch feature and looked for another solution.

It turns out that pulseaudio sinks can be controlled by pactl commands. So we can switch between A2DP and HSP with a shell command,
and that is nice. In order to do so after pairing our Bluetooth device we can check the available audio cards with:

```bash
pactl list cards | grep Name
```

  
You should see one of the card of the format:

```bash
bluez_card.E4_1B_22_4A_23_FD
```

 Keep note of that. Then we can just set that card as A2DP with

```bash
pactl set-card-profile bluez_card.E4_1B_22_4A_23_FD a2dp_sink
```

and swich it back to H2P profile with:

```bash
pactl set-card-profile bluez_card.E4_1B_22_4A_23_FD headset_head_unit
```
  
This is super nice since we can already have in the desktop some link to launch the command and switch whenever we need it… 
but I was not satisfied and wanted more. In particular, I wanted to have it a simple way to switch between profiles on the system tray. 
So I found a repo that does exactly this! I recompiled the small software in Go and upload the new binary for convenience so you do not need to recompile it 
(You can find the [new binary here](https://github.com/LordEvron/bt_profile) under `/ubunt-mint` if you use ubuntu or under `/archlinux` if you use archlinux).

So, just download the binary files into a path `/opt/blt\_switcher` and add an entry to cron to automatically start that software at startup with 
the following command:

```bash
/opt/blt_switcher -sink "bluez_card.E4_1B_22_4A_23_FD"
```

I also added a small 10 seconds delay at startup to make sure everything was up and running before starting this tiny program...
And voilà I can now switch between profiles when i need it as show here

<div style="width: 100%; max-width: 500px; margin: 2rem auto; padding: 0 10px; box-sizing: border-box;">
  <img src="https://github.com/LordEvron/bt_profile/raw/master/bt_profile.png?raw=true" 
       alt="bt_profile" 
       style="width: 100%; height: auto; display: block;">
  <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
    BLT profile switcher
  </div>
</div>

  
This works very well for me... I hope that pulseaudio 15 will remove the need of this small hack…

Thanks for reading and see you at next article!
