---
id: 514
title: 'PC boot process – UEFI with GPT'
date: '2018-12-14T16:36:09+01:00'
author: Lord_evron
layout: post
permalink: /2018/12/14/pc-boot-process-uefi-with-gpt/
categories:
    - Technical
tags:
    - boot
    - technology
    - linux
    - uefi
---

In the previous article, I explained the boot process for BIOS-based systems using MBR disks. Today, we'll explore the advancements 
introduced by UEFI and GPT. I also plan to cover mixed configurations, secure boot, and TPM in future articles.
Let's start with the GPT (GUID Partition Table).  GPT is part of the UEFI standard and replaces the MBR, overcoming its limitations 
while maintaining some backward compatibility.  Figure 1 illustrates the GPT structure.

<div style="width: 100%; max-width: 500px; margin: 2rem auto; padding: 0 10px; box-sizing: border-box;">
  <img src="{{ site.baseurl }}/assets/images/2018/12/GPT_table.png" 
       alt="GPT table" 
       style="width: 100%; height: auto; display: block;">
  <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
    GUID Partition Table Scheme
  </div>
</div>

GPT uses Logical Block Addressing (LBA), a modern method for addressing hard drive sectors, instead of the older Cylinder, Head, Sector (CHS) used by MBR. 
LBAs are typically 512 bytes, similar to CHS sectors.  GPT allocates more space to the partition table itself. 
It reserves 33 LBAs at the beginning and 32 at the end of the disk (secondary GPT). This secondary GPT is a backup in case the primary GPT is corrupted. 
The first LBA (LBA0) is the Protective MBR.  This is a safeguard for older MBR tools that aren't GPT-aware.  
It marks the entire GPT as a single `eeh` partition, with an unknown file system, preventing these tools from accidentally damaging the GPT.
LBA1 contains the GPT header, including information like the disk UID, UEFI signature, CRCs, and UEFI version. 
LBAs 2-33 store the partition entries. Each LBA contains four 128-byte entries, allowing for up to 128 partitions in the default GPT configuration.
Each 128-byte entry stores information about a partition:

- Bytes 0-15: Partition type GUID (16 bytes)
- Bytes 16-31: Unique partition GUID (16 bytes)
- Bytes 32-39: First LBA (8 bytes)
- Bytes 40-47: Last LBA (8 bytes)
- Bytes 48-55: Attribute flags (8 bytes)
- Bytes 56-127: Partition name (72 bytes)

The partition type GUID identifies the type of partition (e.g., EFI System Partition), while the unique partition GUID is a 
unique identifier for each partition. The attribute flags store information like read-only status, hidden status, no auto-mount, 
and whether the partition is MBR bootable.

With 8 bytes allocated for LBAs, GPT can address disks up to 9.4 zettabytes (ZB), or 9.4 billion terabytes.

Now, let's see what happens during boot on a UEFI-based system. UEFI is more sophisticated than BIOS, even supporting a mouse interface.
A key difference is that UEFI understands partition tables and some file systems.  This allows it to read the partition table, find specific partitions, 
and execute files within them.

When the power button is pressed, UEFI executes. It initializes peripherals and performs checks, similar to the legacy BIOS. 
Then, it checks EFI variables stored in NVRAM. These variables store user/OS-specific configurations, such as boot order and paths to bootloaders. An example:

```
BootCurrent: 0000
Timeout: 5 seconds
BootOrder: 0001,0000
Boot0000: Ubuntu HD(2,c8800,96000,cabda21a-3435-4869-93bd-9f550b7ea29a)File(\EFI\Ubuntu\grubx64.efi)
Boot0001: Windows Boot Manager HD(2,c8800,96000,cabda21a-3435-4869-93bd-9f550b7ea29a)File(\EFI\Microsoft\Boot\bootmgfw.efi)
```
UEFI looks for an EFI System Partition (ESP), typically formatted as FAT32 and around 300-500MB in size. 
The ESP stores bootloaders for all installed operating systems. For example:

```
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

```
UEFI then launches the bootloader specified in the NVRAM variables. This is possible because UEFI understands the FAT32 file system.
When a new OS is installed, it copies its bootloader to the ESP (e.g., `EFI/ubuntu/grubx64.efi`) and adds an entry to the NVRAM. 
UEFI detects the new bootloader and can launch it. The bootloader then starts the OS.
UEFI can recognize bootable DVDs or USB drives because they typically have an ESP. 
While it's technically possible for UEFI to find bootloaders without NVRAM entries, it's not recommended. 
NVRAM entries pointing to non-existent bootloaders (e.g., after uninstalling an OS) are not a problem; 
UEFI will simply skip them and proceed to the next boot entry. In case all fails, UEFI also includes a shell environment, 
allowing for more advanced configuration and troubleshooting. This is also a feature of UEFI.


UEFI is a significant improvement, allowing for a virtually unlimited number of installed OSes. 
Each OS simply adds its bootloader to the ESP and an entry to the NVRAM.
I plan to write more articles on this topic, covering BIOS with GPT, UEFI with MBR, advanced multi-OS installations, 
secure boot, and TPM. Stay tuned!

