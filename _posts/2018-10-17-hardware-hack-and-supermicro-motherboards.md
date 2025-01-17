---
id: 473
title: 'Hardware hacks and SuperMicro motherboards'
date: '2018-10-17T12:55:26+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=473'
permalink: /2018/10/17/hardware-hack-and-supermicro-motherboards/
yasr_overall_rating:
    - '5'
yasr_review_type:
    - Product
categories:
    - Technical
tags:
    - hacks
    - hardware
    - news
    - supermicro
---

If you follow up the security news, have definitely heard about the latest hack where SuperMicro was involved. So lets see what it happened there… According with bloomberg.com, in 2015 amazon was evaluating the acquisition of a small company developing video streaming technologies: Elemental Technologies (not to be confused with Emmental Swiss cheese). Part of the evaluation process, involved a closer look at their hardware and server… So Elemental provided some of its server to a third party company for independent inspection, and guess what? The third parties company found a tiny extra chip of a rice grain size not present on the schematic (pretty good at doing their job I would say!). The extra chip attached to the motherboard, looked like a capacitor but an x-ray inspection reveal the real nature of it. Basically it consisted in a small system able to tamper with the byte flowing from Memory to CPU, and thus being able to own the complete system. More in detail, it was able to connect to external servers and download and execute code from them. This was possible because it was directly connected to the BaseBoard Management Controller (BBMC). This is the controller that works in parallel with the normal system and give “infinite” power to the system since is normally used by administrator and such to extract logs and execute command even when the system is shut down (indeed it uses a parallel architecture instead of the main one).  
Now, without commenting the technical bullshit of having a BBMC that able to override all the security of the complex system, we can ask the question.. Who is to blame?

Well, the servers where owned by Elemental but they were build and assembled by SuperMicro, one of the largest electronic company in the word. The market share of SuperMicro is huge so this should rise some concern about the topic.  
So, according with some American Intelligence info (which i still got from Bloomberg website), the Chinese “spy” bribed and/ or threatened the Chinese factories responsible for producing/assembling the motherboards forcing them to add the extra chip.  
Now, the technician involved in it deserve a metal only for being able to do that.. I mean, once i had to do a tiny change from a simple board that i designed, by routing out one extra MCU pin and it took me a week to do that. You can imagine doing the same on a motherboard data bus, where you need to take in consideration, impedance, line length, clock skews, etc. Again, “good job!”, to whoever did that…

Funny thing, is that the same things happened in multiple factories, and for different customers. So the question is: did SuperMicro headquarter (US based) knew about that? Well i do not have the answer, but my feeling is that more than someone had to agree to the changes. I mean, if i submit a design for production and i get back a board, the minimum that i can do is to check that I get back the board that I’ve ordered!

Anyway, how big was the damage? Well for the American investigators, once that they discovered the first chip, it was pretty straight forward to follow the stolen data to the (according to them) “Chinese” servers, and track back the other compromised motherboard. Results? at least another 30 major US company were affected by the hardware hack…(but don’t worry your data is safe :P, because there are no evidence that user data has been…blabla )

 So, is the Chinese government involved? According to the American yes (seriously, could have been stating otherwise? ). But without entering in political discussion (subject that I really don’t care), I would say that it does not really matter. Technology war between US and China has been ongoing for a while and is not a secret. In one side, we have china that is one of the major producer of all the electronics around the word and is the most populated country, on the other side we have US, that host the major tech companies, and with its agencies NSA and such have draw shitloads of money from the US budget. So, if you ask me, both the side have pretty much infinite resources, so is a fair battle.

The question is how innovative is the hardware attack and why is hitting the news? Despite is really well done, is not very innovative. Indeed from the Snowden leaked documents, you can find tracks of hardware devices used to tamper with LAN cables, WiFi and other technologies, and this is not much different, just more integrated!. But neither US were the first one. Already in 80s the Russians were stealing US and French secrets by encoding and transmitting over radio frequencies, all the data coming from hacked typewriter ([more info here](https://qz.com/932448/forget-smart-tvs-in-the-1980s-spies-were-hacking-typewriters/))!

What is different this time is the scale. Whoever did this was able to modify and tamper with a large scale supplier in a way that was nearly impossible to detect, affecting dozens of companies at once.

So, outsourcing knowledge always expose you to some risks… it’s way better to have it in house 🙂