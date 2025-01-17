---
id: 526
title: 'PC boot process &#8211; Compatibility mode and secure boot'
date: '2018-12-24T16:05:38+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=526'
permalink: /2018/12/24/pc-boot-process-compatibility-mode-and-secure-boot/
categories:
    - Technical
tags:
    - bios
    - boot
    - uefi
---

This is the last article of the “PC booting process” series and i want to quickly present few missing concepts that you may incur related to this topic. Again, my task is not to make you an expert, but just to give you a good understanding on what is happening when you push your “on button” on your pc. So let’s start from where we left…

So we already discussed the [Legacy Bios/MBR](http://localhost:8080/2018/12/13/pc-boot-process-mbr/) and the[ UEFI/GPT](http://localhost:8080/2018/12/14/pc-boot-process-uefi-with-gpt/) booting processes. I already mentioned that even if those two combination work so well together, there are still cases where Legacy bios system use GPT partition or where UEFI bios uses MBR disks. Lets start from the latter case. Part of the UEFI specification is the hold compatibility with MBR based disks. This is done by the “Compatibility Support Module (CSM) ” in the UEFI firmware that provide compatibility similar to legacy Bios. When the CSM is activated, the UEFI ignores the ESP partition and rely only to the Master boot record sector. Everything then works similar to BIOS/MBR case.

The other combination is to use GPT disk with old BIOS system and this is more tricky. The reason is that the BIOS does not understand the ESP filesystem or the new GPT partition table. Furthermore, windows does not support Uefi-bootloader install from Legacy Bios system. The solution is a little tricky and involve to use another boot-loader that simulate the UEFI firmware and chain load your windows boot-loader. “Clover boot loader” and “GRUB” are two example of boot-loaders capable of doing this. A full guide on how to do that is beyond the scope of this small article. It is enough to know that is somehow a little trickier but still possible (and you can easily find guides online!)

So UEFI also introduced another “potentially” nice feature: Secure Boot. Despite it had a lot of criticism, the basic idea behind it is nice. Normally, BIOS/UEFI firmware would just boot whatever code, without doing any check. Unfortunately it could happen that the boot loader has been compromised for example by a rootkit, that will replace your bootloader with a malicious version and then boot transparently your OS (keeping full control of your system). So for solving this, the UEFI standard implemented a security check at startup. Basically only the bootloaders that are signed with a valid key can be executed. So if a rootkit would try to tamper and or replace the bootloader, it would not get executed by the the UEFI firmware since does not hold a valid signature. For holding keys and signatures, the secure boot implementation describe three databases stored in the NVRAM at manufacturing time and they are:

1 .The signature database (db) that store hashed of valid bootloaders, drivers, etc that can be executed at boot time.  
2\. The revoked signatures database (dbx) is similar to the 1, however it hold the hashes of blacklisted signature that were valid but now are revoked. Entry here have precedence respect to the db 1.  
3\. The Key Enrollment Key database (KEK) holding signing keys that can be used to update the signature database and revoked signatures database.

So the idea is nice…but who sign the bootloaders? well, here is where the S\*it happen. Short answer: Microsoft. So they forced hardware producer to embed their key in the “signature db” and “KEK”. By doing this they ensured that their bootloaders are working with secure boot. Also with the KEK key they can add new bootloader entries (for example for another os) in the signature db. Basically they have full control of what is happening… The producers in return (of giving full control to Microsoft), get a nice paper sticker saying “windows 8/10 approved device”.

So what if i want to install linux?.. It is easy.. is enough to beg Microsoft to sign your bootloader with their private keys so it will hold a valid signature. After this step, the new bootloader can get executed by the UEFI firmware. For example Ubuntu uses the “shim-signed” .efi file that contains a Microsoft signed bootloader compatible with secure boot. And what if Microsoft do not want to sign it? well then it can be a problem. Luckily for now you can still disable the secure boot from the uefi menu. The possibility for the user to disable secure boot was a requirement for window 8 pc. However for windows 10 pc, this is not required anymore and thus the manufacturers can decide to not include that option anymore on the uefi entry and de-facto preventing any other os to ever boot on your pc.. ever… However I hope that they will still give the user the choice to disable this “potentially but not yet nice” feature.

As last i want to answer a question that i got from one my friend regarding UEFI bootloaders: He wanted to install multiple version of the same linux distro. The problem is that when he was installing the second version, he ended up replacing the old efi bootloader, making the fist disto unbootable from efi menu. This is happening because OS stores their bootloader always in a specific path in the ESP partition. For example for ubuntu is `/boot/efi/EFI/ubuntu`. When you install a new ubuntu, it will overwrite this file, making the previous version unbootable from Uefi. So the solution is easy: After you installed the first version of the OS, just rename the efi path to something else eg: `/boot/efi/EFI/ubuntu_ver1`, and set the NVRAM variable accordingly (eg using “efibootmgr”). Only then install the second version (that will end up in the `/boot/efi/EFI/ubuntu`). By doing this you will keep both the .efi booloaders for the two ubuntu system and each of them will launch the correct version. Alternatively, even if one of your bootloader will get overwritten, you can still boot the other system because GRUB will mostly likely “see also the other OS”. So from UEFI you chose ubuntu2 ( because 1 got overwritten and is not there anymore) and then from the GRUB menu of ubuntu2 you can still start ubuntu1, because grub can see that there is another ubuntu os installed in another partition (similar to when you launch windows).

There are some more stuff that are worth to discuss related to the booting process and this is Luks, Bitlocker and TPM. However i will hold those topics for the next article.