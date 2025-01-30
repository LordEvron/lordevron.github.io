---
id: 505
title: 'PC boot process - BIOS with MBR'
date: '2018-12-13T22:57:17+01:00'
author: Lord_evron
layout: post
permalink: /2018/12/13/pc-boot-process-mbr/
categories:
    - Technical
tags:
    - technology
    - boot
    - linux
---

Aahhh the PC boot process! This magic sequence that transform your pc from a useless piece of metal and plastic in a functioning machine.  
This article (and the next) will detail this process, starting with the MBR (Master Boot Record) and then moving on to the more modern UEFI.
To understand the boot process, we first need to understand the BIOS and hard drive partition tables. Let's begin with partition tables.
Hard drives are typically divided into sections called partitions.  A single physical hard drive can be split into multiple logical sections 
(often assigned letters in Windows). The partition table, as the name suggests, is a reserved area of the hard drive that describes this partition structure. 
There are different standards for creating these tables. The traditional BIOS partition table is associated with the MBR, 
while the newer standard is the GPT (GUID Partition Table), which we'll discuss in the next article.
On an MBR-based disk, the first sector (sector 0, 512 bytes) is crucial. 
The first 446 bytes of this sector contain code that reads and interprets the partition table stored in the next 64 bytes. 
The last two bytes are a boot signature. The 64-byte partition table is divided into four 16-byte "partition entries," each containing:

- Active flag (1 byte)
- Starting head, cylinder, and sector (3 bytes)
- Filesystem descriptor (1 byte)
- Ending head, cylinder, and sector (3 bytes)
- Starting sector (4 bytes)
- Number of sectors in the partition (4 bytes)

So, sector 0 of an MBR disk contains the partition table (64 bytes) with up to four partition entries. Each entry defines the start, end, size, type, and active status of a partition.
One major limitation of MBR is the four-partition limit and the 2TB disk size limit. 
There's a workaround for the partition limit: extended partitions.  MBR supports primary and extended partitions. 
To have more than four partitions, you could create one extended partition and then create logical partitions within it. 
However, only one partition on an MBR disk can be marked as active, and it must be a primary partition. 
This will become clearer when we discuss the BIOS.
Now, let's talk about the BIOS.  On older PCs, pressing the power button initiates a small piece of code stored in a ROM chip on the motherboard. 
This is similar to how microcontrollers work. The start address of this code is fixed (e.g., 0x000), ensuring it's the first to execute. 
Because this ROM is on the motherboard, the manufacturer controls this process and tailors the code to the specific hardware. 
This firmware is known as the BIOS (Basic Input/Output System), introduced in the late 1970s.


The BIOS performs a Power On Self Test (POST).  This checks for the presence and functionality of components like the keyboard, 
RAM, CPU, disk drives, optical drives, and PCI controllers.  The BIOS is simple and doesn't understand complex file systems. 
After the POST, it loads sector 0 of the primary hard drive into memory and transfers control to it. 
As we've seen, this sector contains code that reads the partition table and identifies the active primary partition 
(some systems might use a "boot" flag or other mechanisms to designate the bootable partition).


The BIOS then jumps to the first sector of that partition and loads the Volume Boot Record (VBR). 
The VBR contains the operating system's bootstrap code, which loads the kernel and other system services.
It's crucial to differentiate between the MBR and VBR. The MBR is the first sector of the hard drive, while the VBR resides within 
a specific partition and is only executed if that partition is marked as active (or chain-loaded, a special case).


This system has several limitations. The four-partition limit is a significant issue, especially for operating systems like Linux, 
which often use multiple partitions. The 2TB disk size limit is another major constraint.
The boot process also presented challenges for dual-booting. The active partition is set during OS installation, 
meaning installing Windows after Linux would overwrite the MBR, preventing Linux from booting. Linux solved this with GRUB,
a bootloader that understands file systems and presents a boot menu, allowing users to choose between operating systems. 
GRUB could "see" the Windows partition and add it to the menu. This is why installing Linux after Windows was generally easier.
GRUB's code, due to its complexity, couldn't fit entirely within the 512 bytes of the MBR. 
It used the small, officially unused space between sector 0 and the first sector of the first partition to store the rest of its code.
Due to these limitations, the BIOS/MBR system was superseded in the 2010s by UEFI and GPT, which we'll discuss in the next article.
