---
id: 505
title: 'PC boot process &#8211; BIOS with MBR'
date: '2018-12-13T22:57:17+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=505'
permalink: /2018/12/13/pc-boot-process-mbr/
categories:
    - Technical
tags:
    - bios
    - boot
    - linux
    - mbr
    - pc
---

Aahhh the PC boot process! This magic sequence that transform your pc from a useless piece of metal and plastic in a fastastic machine capable (in the right hands) of opening any door around the world! Have you have wondered how this happen? well in this article (and in the next one) I want to explain in details how the PC boot process works. In particular we will start from MBR (still used in some older system).. and in the next we will move to UEFI.

In order to understand properly this sequence we need to fist understand what the BIOS is/does and the different hard drives partition table layouts. So lets start with partition tables.

Hard Drives are in general divided into slices, or partitions. Basically, you can have only one physical hard drive but divided in many sections (widows in general assign letters to it). So, the partition table, as the name suggest, is just a reserved part of the hard drive, where the hard disk partition structure is described. There are different standards on how to make this table. The standard BIOS partition table is the one associated with MBR (Master Boot Record). The newer standard of partition table is the GPT (GUID Partition Table) that we will describe in details in the next article.

So, in a MBR based disk, the first sector of the disk (sector 0; 512 bytes) is a really important and special sector. The first 446 bytes of this sector, consist of an efficient code capable of reading and understanding the partition table stored in the next 64 bytes while the last 2 bytes of the sector 0 are just a boot signature. The 64 bytes of the table are organized in 4 groups of 16 bytes. Each of this 16 bytes represent a “partition entry” and it stores six items:  
1\. The active flag(one byte); 2. the starting head, cylinder and sector (three bytes); 3. the filesystem descriptor (one byte); 4. the ending head, cylinder and sector (three bytes); 5. the starting sector relative to the disk beginning (four bytes); 6. The number of sectors in the partition (four bytes).  
So, resuming, sector 0 of MBR disk, consist of 512 bytes. In 64 of those bytes is stored the partition table. This partition table contains up to 4 partition entries. Each of this entry contain information on the where the partition starts, where it ends, how large it is, what type it is and if marked as active or not.  
At this point you probably noticed one of the biggest limitation of the MBR, that only support up to 4 partitions and disks up to 2TB.  
In reality there is a trick to bypass the 4 partition limit. Indeed, there are two types of partitions. The first is called PRIMARY partitions, while the other are EXTENDED partitions. So if you wanted to have more than 4 partitions on MBR disk, was possible by having one EXTENDED (and then add more virtual partition within that partition). However EXTENDED partition could not be marked as active. In particular in MBR ONLY 1 partition CAN be MARKED as active and must be a PRIMARY partition. Everything will be more clear when we will see how to BIOS use this. So lets talk about the BIOS now..

If you have a older PC, when you press “on” button, the motherboard gets powered up, and a tiny code that reside in a ROM memory is executed. Similar to what happen to micro-controllers, the start of this code is stored in a particular address (eg. 0x000 ) and is always the first of getting loaded. Since this ROM memory is a physical chip of the motherboard, the manufacturer has full control of this process, so they are responsible of this code to properly work since it tailor made for a specific motherboard. Different motherboards (even from same vendor) requires different firmware, because the hardware is different. This firmware code is know as BIOS as acronym of the Basic Input/Output System and was firstly introduced in late 70s.  
When this code gets executed it does a Power On Self Test (POST). This sequence is just a set of passages that ensure for example the presence of keyboards, RAM, CPU, Disk Drives, optical Drives, PCI controllers, etc and make sure that all this elements are working as expected. Because the BIOS code is simple, it has no understanding of even the simplest filesystem, so once the POST process is completed, the BIOS, load the sector 0 of the primary Hard Drive into memory and pass the control to it. As we just saw, this sector contains a code able to read and understand the partition table. So what it does, it just read that table and see which PRIMARY partition is marked as ACTIVE. Once found it, it just jump to the first sector of that partition and load the Volume Boot Record of that partitions, So in the Volume Boot Record, it reside the bootstrap code of the OS itself. Indeed here we are already inside the OS specific code, so from here it load the kernels, and then the rest of the services.

It is important to understand the difference between MBR and VBR. The MBR is the first sector of the Hard drive, while the VBR reside inside the specific partition and is ONLY executed if that partition is marked as active (or if is chain loaded but this is special case).

So now we start to discuss about the problems of this system. As we already said, the limit of only 4 partition was a big issues, considering that in linux could requires different partition for / , /boot , /home, /var/log /swap and is already more than 4! In addition you may want to have also windows 7 or above and they also started to have the boot partition as separate from system partition.

Second big limitation is the the 2TB disk limit due to the 16byte entry in the partition table.

Third limitation was relative to double boot. Indeed, in the chain there is no way to dynamically “Select” what partition to start and whoever controlled the MBR sector, controlled the system. The ACTIVE byte in the partition table is set during OS installation. So if you had linux installed and you tried to install also windows, the Microsoft OS was just overwriting the MBR sector to make it boot itself and preventing linux to boot. Luckily Linux was (and still is) much smarter. Indeed when you installed Linux, it was overwriting the MBR with the GRUB, a smarter boot-loader capable of understanding the filesystem and able to launch a selection menu during boot time, where you could decide if to continue with linux or launch windows (basically jumping to Linux VBR or Windows VBR). This is why was easier to install Linux after windows, because grub was able to “see” the window partition there and add it to the menu (while windows installation was just setting the MBR to boot himself).

Here there is a small curiosity: because the GRUB code had to present a menu, a selection process, had to be aware of File Systems and so on, its code could not fit all in the 512 bytes of the sector 0 of the MBR. However luckily, there was some space that was “noone land” between the sector 0 and the first sector of the first partition. basically the partition 1 was not starting to sector 1 but there was always some extra space left. This space was not supposed to be officially used by anything, however GRUB used it to store himself there and be able to provide you with boot selection process.

Mainly due to the previously explained limitations, the BIOS and MBR system was abandoned in 2010 in favour of UEFI and GPT system. But this is the argument of the next article… Stay Tuned!