---
id: 473
title: 'Hardware hacks and SuperMicro motherboards'
date: '2018-10-17T12:55:26+01:00'
author: Lord_evron
layout: post
permalink: /2018/10/17/hardware-hack-and-supermicro-motherboards/
categories:
    - Technical
tags:
    - hacking
    - hardware
    - technology
---

Recent security news highlighted a significant hardware hack involving Supermicro. 
Bloomberg reported that in 2015, Amazon, while evaluating Elemental Technologies (a video streaming company), 
commissioned a third-party inspection of their hardware.  This inspection uncovered a tiny, previously undocumented chip, about the size of a grain of rice, 
embedded on the motherboard.  X-ray analysis revealed its true nature: a sophisticated system capable of manipulating data flowing between the memory and CPU, 
effectively granting complete system control.  The chip could connect to external servers, download, and execute code, facilitated by its 
direct connection to the Baseboard Management Controller (BMC). The BMC is a separate system that provides administrators with powerful out-of-band management 
capabilities, even when the main system is powered off.
The presence of such a powerful BMC, capable of overriding core system security, raises questions in itself.  But the central issue is: who is responsible?
While Elemental owned the servers, they were manufactured and assembled by Supermicro, a major electronics company with a significant market share. 
This widespread use of Supermicro hardware amplifies the potential impact of such a vulnerability.
According to US intelligence sources cited by Bloomberg, Chinese spies allegedly bribed or coerced Chinese factory workers to install these chips during 
the manufacturing process.  The technical skill required to accomplish this is remarkable, especially considering the complexities of motherboard design, 
including impedance, line length, and clock skew.
This wasn't an isolated incident. The same chip was found in servers belonging to multiple customers.  Did Supermicro's US headquarters know about this?  
While the answer remains unclear, it's difficult to believe that such modifications could occur without at least some level of awareness within the company.  
Inspecting returned boards after manufacturing is a standard practice.
The damage was substantial.  Once the first chip was discovered, investigators were able to trace the stolen data to (allegedly) Chinese servers and
identify other compromised motherboards.  At least 30 major US companies were affected.  While officials claim there's no evidence of user data being compromised, this remains a point of contention.
Was the Chinese government involved?  US officials assert they were (which is hardly surprising).  
Without delving into geopolitics, it's clear that a tech war exists between the US and China.  
China's dominance in electronics manufacturing and its large population, combined with the US's tech giants and intelligence agencies, 
create a complex landscape. Both sides possess vast resources, making it a seemingly "fair" fight.
While sophisticated, this hardware attack isn't entirely novel.  The Snowden leaks revealed hardware devices used to tamper with LAN cables, 
Wi-Fi, and other technologies.  Even earlier, in the 1980s, the Russians used similar techniques to steal secrets from hacked typewriters.
The key difference in this case is the scale.  The attackers compromised a major supplier, making detection incredibly difficult and 
impacting numerous companies simultaneously.
This incident highlights the risks of outsourcing. 
Keeping critical knowledge and processes in-house offers greater control and security.

