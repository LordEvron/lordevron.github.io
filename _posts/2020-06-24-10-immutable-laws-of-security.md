---
id: 812
title: '10 Immutable Laws of Security'
date: '2020-06-24T15:33:51+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=812'
permalink: /2020/06/24/10-immutable-laws-of-security/
yasr_schema_additional_fields:
    - 'a:3:{s:17:"yasr_schema_title";s:0:"";s:37:"yasr_product_global_identifier_select";s:5:"gtin8";s:31:"yasr_product_price_availability";s:12:"Discontinued";}'
ao_post_optimize:
    - 'a:5:{s:16:"ao_post_optimize";s:2:"on";s:19:"ao_post_js_optimize";s:2:"on";s:20:"ao_post_css_optimize";s:2:"on";s:12:"ao_post_ccss";s:2:"on";s:16:"ao_post_lazyload";s:2:"on";}'
categories:
    - Technical
---

Microsoft has done two things which are really good and neither of those is Windows or Office. The first one is a software called “Paint” that everyone is familiar with (Not the shitty 3D version). The second one is a paper that they wrote back in 2011 titled “Ten Immutable Laws of Security.” So this quick article is about those laws.

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

Despite the laws are quite clear, i want to add a quick discussion for clarify some points. The first 3 laws, withhold similar concept: if someone can tamper with your pc either by running some software or by accessing the hardware, than is not your pc anymore. The implication of these law are quite deep. These law cover obvious cases, where you click on that unknown exe .. or when your trusted technician install hardware keylogger in your pc or a network sniffers on your card. . But the cases does not necessary stop there.. What if a bad guy works at Microsoft, then potentially can tamper with your OS, thus, owning all your pc. Same concept with hardware producers. If you think that this is impossible, than think again because has already happened in the past (for example tampered [Supermicro ](http://localhost:8080/2018/10/17/hardware-hack-and-supermicro-motherboards/)motherboards or [Lenovo Superfish](https://en.wikipedia.org/wiki/Superfish) malware).

Law n.4 is just a slight extension of the other 3 but with reference to website. So if you use Libraries, add-ons and so on, is always a good idea to have a look at the source code (and make sure that the installed version actually contains the same code), to avoid problem like the “event-stream” javascript library that got infected by cryptoshit stealing code.

Law 6 remarks the power of Sys admin that can change the back-end code, access directly databases, passwords (changing back-end to store it in clear!) and so on. They hold the ultimate power, since usually clients have no overview of the back-end code.

Law 5 and 7 are also quite important. They clarify some concept of security. Indeed is useless to have a 512 bit AES key if then the password set is 1234. Easily guessable keys (or reusing compromised passwords) are the weak link in breaking hard encryption.

Law 8 is still very valid, with the viruses spreading over the internet quickly, it is important to include newest AV signatures as soon as possible. No-one is trying to break in your system with a 2 years old virus! This is also true for Software Updates. So Together with antivirus you should patch asap all your software, since exploiting known vulnerability are the easiest way in a system.

Law 9 may come with a little disappointment. Yes you could use Tails, Tor, Qubes, etc, but still..if someone want to really control you (and have enough resources), they could exploit timing, traffic correlations, forge fake certificate, control tor exit nodes, control backbones, install spywares, dns leakages, etc. So many potential weakness that over a long period, something will go wrong and you will loose your anonymity.

Rule number 10 is just thrown there to remind that for many problems, technology may not be the best solution after all..

So whenever you click on something or ask someone to fix your pc, keep in mind those simple rules!

Happy clicking!