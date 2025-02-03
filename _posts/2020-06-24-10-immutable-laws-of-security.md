---
id: 812
title: '10 Immutable Laws of Security'
date: '2020-06-24T15:33:51+01:00'
author: Lord_evron
layout: post
permalink: /2020/06/24/10-immutable-laws-of-security/
categories:
    - Technical
tags:
    - technology
---

Microsoft has done two things which are perfect and neither of those is Windows or Office. 
The first one is a software called “Paint” that everyone is familiar with (Not the shitty 3D version). 
The second one is a paper that they wrote back in 2011 titled “Ten Immutable Laws of Security.” 
So this quick article is about those laws.

The laws are quite self explanatory, so i will re-post them here:

- **1. If a bad guy can persuade you to run his program on your computer, it’s not your computer anymore**
- **2. If a bad guy can alter the operating system on your computer, it’s not your computer anymore**
- **3. If a bad guy has unrestricted physical access to your computer, it’s not your computer anymore**
- **4. If you allow a bad guy to upload programs to your website, it’s not your website any more**
- **5. Weak passwords trump strong security**
- **6. A computer is only as secure as the administrator is trustworthy**
- **7. Encrypted data is only as secure as the decryption key**
- **8. An out of date virus scanner is only marginally better than no virus scanner at all**
- **9. Absolute anonymity isn’t practical, in real life or on the Web**
- **10. Technology is not a panacea**

While the laws are clear, some points need further discussion. The first three laws share a common theme: 
if someone can tamper with your PC, whether through software or hardware access, it's no longer truly yours. 
This has broad implications.  It covers obvious scenarios, like clicking on an unknown executable file or a 
technician installing a hardware keylogger or network sniffer. But it goes further. What if a malicious actor works at Microsoft? 
They could potentially tamper with your OS. The same applies to hardware manufacturers. 
This isn't just hypothetical; it has happened (e.g., the tampered 
[Supermicro motherboards](https://www.bloomberg.com/news/features/2018-10-04/the-big-hack-how-china-used-a-tiny-chip-to-infiltrate-america-s-top-companies) and 
the [Lenovo Superfish malware](https://en.wikipedia.org/wiki/Superfish)).


Law 4 extends this concept to websites. If you use libraries or add-ons, it's wise to review the source code (and verify that the 
installed version matches) to prevent issues like the "event-stream" JavaScript library incident, where malicious code was injected.

Law 6 highlights the power of system administrators. They can modify backend code, access databases and passwords 
(even changing the backend to store them in plain text!), and more. They wield significant control, as clients rarely have 
insight into the backend.

Laws 5 and 7 emphasize key security concepts. A 512-bit AES key is useless if the password is "1234." Easily guessed passwords 
(or reused compromised passwords) are the weak link that can break even the strongest encryption.

Law 8 remains relevant. With viruses spreading rapidly online, up-to-date antivirus signatures are essential.
No one tries to breach your system with a two-year-old virus! This also applies to software updates. 
Patching software promptly is crucial, as exploiting known vulnerabilities is a common attack vector.

Law 9 addresses anonymity. While tools like Tails, Tor, and Qubes exist, absolute anonymity is difficult.
A determined adversary with sufficient resources could exploit timing attacks, traffic correlation, forge certificates, 
control Tor exit nodes or backbones, install spyware, cause DNS leaks, and more.  Numerous vulnerabilities exist, and over time, 
something is likely to go wrong, compromising anonymity.

Law 10 serves as a reminder that technology isn't a silver bullet for every problem.

So, whenever you click something or ask someone to fix your PC, keep these simple rules in mind.

Happy clicking!

