---
id: 514
title: 'PC boot process – UEFI with GPT'
date: '2018-12-14T16:36:09+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=514'
permalink: /2018/12/14/pc-boot-process-uefi-with-gpt/
categories:
    - Technical
tags:
    - boot
    - gpt
    - linux
    - uefi
---

In the [previous article](http://localhost:8080/2018/12/13/pc-boot-process-mbr/), I presented the boot process of BIOS based system with MBR disk. Today we will move forward and we will see the changes introduced with UEFI and GPT disks. I also have another article in plan where I will discuss mixed versions, secure boot and TPM. Anyway.. Let’s continue from where we left. The MBR structure was introduced in early 80s and we already saw that it suffers from many limitations. Before we start we need to understand one important point: UEFI is the “next generation” of the BIOS while GPT replace the MBR disk structure. So, ideally UEFI and GPT are two different and independent “upgrades” of two completely different systems. Indeed is possible to have UEFI boot with MBR disks, or BIOS boot with GPT disk (which we will see in the next article). However UEFI/GPT work so well together that they are often confused and considered as one single improvement.. but keep in mind they are not.

So lets start with the GPT table. GPT stands for <span class="ILfuVd">GUID Partition Table and is actually a part of the UEFI standard too</span>. The GPT substitute the MBR by redefining the partition table format. It overcome the limitation of MBR while trying to keep compatibility at the same time. Let’s see in details its structure reported in figure 1.

<figure aria-describedby="caption-attachment-323" class="wp-caption aligncenter" id="attachment_323" style="width: 375px">![](http://localhost:8080/wp-content/uploads/2018/12/GPT_table.png)<figcaption class="wp-caption-text" id="caption-attachment-323">Figure 1: GPT Scheme \[source:[wikimedia](https://upload.wikimedia.org/wikipedia/commons/0/07/GUID_Partition_Table_Scheme.svg)\]</figcaption></figure>

As we can see there are a lot of new features here. Firstly, GPT uses Logical Block Addressing (LBA), a more modern way to define hard disk sectors rather than the old Cylinder, Head, Sector (CHS) used in MBR disks. Size of a LBA is also de-facto set to 512 bytes similar to a CHS sector. So we can notice that in GPT we do have much more “space” associated with the table itself. Indeed in this case we have reserved 33-LBAs in the beginning of the disk and 32 LBAs in the end of this disk (secondary GPT) (LBA0 is not copied to the end). This secondary GPT is just a duplicate of the primary GPT and is used as redundancy and backup in case that the Primary GPT gets corrupted. The first LBA (LBA-0) is called Protective MBR and is used as protection. Indeed many of the MBR tools used to fix the boot sectors, were developed before the GPT and because of that are not aware of GPT disks and they could try to overwrite/ destroy the GPT partition table. Because of that, the GPT standard reserved the LBA0 as protective and marked the whole GPT table as “***eeh***” partition. These MBR tools will see that the MBR space is occupied by a partition with an unknown file system and they will hopefully not touch it.

In the LBA1 it start the real GPT data with a header that contain a some information such as the disk uid, the UEFI signature, CRCs, Uefi version etc; nothing that we are really interested on.  
In the LBA2 to LBA33 is where the partition entries are stored. Each of those LBAx contain 4 entries of 128 Byte each (remember that LBA are 512Bytes in size).  
Each of those field represent a possible partition entry. So since we have 32 LBA and space for 4 partition entry to each of those, it means that the GPT standard has (in its default definition) space for 128 partitions entries.

Each of those 128 byte fields, store information regarding the partition itself, where it start, where it stop and so on. Here there is the full table adapted from Wikipedia:

Byte 0 to 15 –&gt; (0x00) 16 bytes Partition type GUID  
Byte 15 to 31 –&gt; (0x10) 16 bytes Unique partition GUID  
Byte 32 to 39 –&gt;(0x20) 8 bytes First LBA (little endian)  
Byte 40 to 47 –&gt; (0x28) 8 bytes Last LBA (inclusive, usually odd)  
Byte 48 to 55 –&gt;(0x30) 8 bytes Attribute flags (e.g. bit 60 denotes read-only)  
Byte 56 to 128 –&gt; (0x38) 72 bytes Partition name (36 UTF-16LE code units)

It is worth to spent few world to the partition type GUID and unique partition GUID. The first value is a standard 16byte value that uniquely identify the partition type. For example all the EFI partition will have the same Partition type GUID.The second GUID is the unique partition GUID and this is a 16 byte id that uniquely identify your partition and is not shared with anything else. Another important field here is the Attribute flags. Here are stored important attribute that are set for the partitions. I will not report all of them, but from here you can see if a partition is read only, or if is hidden, with no auto-mount set (letter assignment in window), or for example if is MBR bootable or not (equivalent to “Active Partition” flag in MBR systems).  
Also we can see that because we reserve 8 bytes for storing LBAs, that we can address disks up to 9.4 ZettaByte ZB in size (2^64 sectors)… this is equivalent to 9.4 Billions Terabytes, so should be enough for a while.

So now that we dug into the GPT, we can see what happen when we press the “ON” Button within a UEFI based system. As we know the UEFI is more complex software (it even support mouse in the menu) and it has replaced the BIOS. However, because many people still call the “UEFI” systems as “BIOS”, so, the “old BIOS” has been unofficially renamed as “Legacy Bios”.  
So the main difference of UEFI vs Bios is that the *<span style="text-decoration: underline;">new firmware is capable of understanding partition tables and some File Systems. </span>*This is a major innovation because allows the UEFI to read the hard disk partition table, look for some special partition, read the files in it and execute one of them! And this is more or less what happen.

So when we press a start button the UEFI get executed. Similar to legacy bios, it initialize some peripherals, does some checks. But then come the new part. After the initialization is completed, it checks the EFI variables stored in the NVRAM. These variables store user-specific/OS-specific/[CIA-specific](https://wikileaks.org/ciav7p1/cms/page_26968097.html) configurations. They can still be accessed and modified from root users (eg. using #efibootmgr -v). Example of this variable are \[adapted from mageia\]:

**BootCurrent**: 0000  
**Timeout**: 5 seconds  
**BootOrder**: 0001,0000  
**Boot0000** Ubuntu HD(2,c8800,96000,cabda21a-3435-4869-93bd-9f550b7ea29a)File(\\EFI\\Ubuntu\\grubx64.efi)  
**Boot0001**\* Windows Boot Manager HD(2,c8800,96000,cabda21a-3435-4869-93bd-9f550b7ea29a)File(\\EFI\\Microsoft\\Boot\\bootmgfw.efi)WINDOWS………x…B.C.D.O.B.J.E.C.T.=.

so we can see that (along other things) store information of the boot order, boot entries with relative path to the boot loaders and so on.  
So after loading this variables, the UEFI look for a EFI System Partition (ESP). This is a very special partition usually formatted as FAT32. size of this partition is around 300MB-500MB. Inside this partition are stored all the bootloaders for all the OS present on the system. For example it could look like this:

\# tree /boot/efi/EFI  
/boot/efi/EFI  
├── Boot  
│ ├── bootx64.efi \[The default bootloader\]  
│ ├── bootx64.OEM \[Backup of same as delivered\]  
├  
├── ubuntu  
│ └── grubx64.efi  
├  
├── Microsoft  
│ └── Boot  
│ ├── bootmgfw.efi \[The standard Win8 bootloader\]  
│ ├── bootmgr.efi

and these are the path also present in the NVRAM variables.  
So the UEFI will look for the ESP partition and launch the relative bootloader as configured in the NVRAM variables.  
Notice that this is only possible because now the UEFI can understand the FAT32 filesystem.

So when you install a new Operative System, what it actually does is to copy a bootloader in the ESP partition (eg “EFI/ubuntu/grubx64.efi”) and add a new variable entry in the NVRAM. The UEFI will then “see” that there is a new bootloader and launch it if selected. The bootloader will then take care of starting up the OS.

So I want to remark few things. EFI will recognize a valid ISO DVD or USB stick to boot from because its standard way to have an ESP partition.Strictly speaking if you are very lazy, you can avoid to create a NVRAM entry for your bootloader and UEFI should be able to find it out by itself (similar to what happens to bootable media). However is not considered a good things to do. Also you may have some NVRAM variables pointing to some non existing bootloaders (eg if you uninstalled windows or linux). In this case, is not a problem. The only things that will happen is that IF you try to launch it, the UEFI will not find the bootloader and move to the next entry in the boot order list.

Over all, the UEFI system is a much better way for handling the booting system, because you can have virtually unlimited OS installed. They simply add their Bootloader in the EFI partion and add an entry in the NVRAM.

And this is all for now. I do have plan to write one or two more articles on this topic for example explaining how BIOS work with GPT or UEFI with MBR. I want also to present some more advanced usage on how to install multiple OS (of the same type) with UEFI, and see the implication of secure boot and Trusted Platform Modules… Stay tuned!