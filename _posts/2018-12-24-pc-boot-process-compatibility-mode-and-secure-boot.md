---
id: 526
title: 'PC boot process - Compatibility mode and secure boot'
date: '2018-12-24T16:05:38+01:00'
author: Lord_evron
layout: post
permalink: /2018/12/24/pc-boot-process-compatibility-mode-and-secure-boot/
categories:
    - Technical
tags:
    - bios
    - technology
    - linux
    - uefi
---

This is yet another article in the PC booting process series, covering some remaining concepts. 
The goal is to provide a good understanding of what happens when you power on your PC, not to make you an expert.
We've already discussed [BIOS/MBR](/2018/12/13/pc-boot-process-mbr/) and [UEFI/GPT](/2018/12/14/pc-boot-process-uefi-with-gpt/) booting. While these combinations are common, there are cases where legacy BIOS systems use GPT partitions, 
or UEFI systems use MBR disks. Let's start with the latter. UEFI has backward compatibility with MBR disks through the Compatibility Support Module (CSM). 
When CSM is enabled, UEFI ignores the ESP partition and relies on the MBR, functioning similarly to a BIOS/MBR system (is important to point that CSM allows UEFI to emulate a BIOS environment, 
but it's not exactly the same. The underlying firmware is still UEFI.).


Using GPT disks with older BIOS systems is more complex.  
The BIOS doesn't understand the ESP file system or the GPT partition table.  
Windows also doesn't support UEFI bootloader installation from a legacy BIOS system. The solution involves using a bootloader 
(like Clover or GRUB) that emulates the UEFI firmware and chain-loads the Windows bootloader. 
A full guide is beyond this article's scope, but it's a more involved process.

UEFI also introduced Secure Boot. While it's faced criticism, the basic idea is solid. 
Traditional BIOS/UEFI firmware boots any code without checks, making it vulnerable to rootkits that can replace the bootloader. 
Secure Boot addresses this by only executing bootloaders signed with a valid key. 
If a rootkit tampers with the bootloader, it won't execute. Secure Boot uses three databases stored in NVRAM:

- **Signature Database (db)**: Stores hashes of valid bootloaders and drivers.
- **Revoked Signatures Database (dbx)**: Stores hashes of revoked signatures. Entries here have priority over the db.
- **Key Enrollment Key Database (KEK)**: Stores signing keys used to update the db and dbx.

The idea is good, but Microsoft controls the signing process. They require hardware manufacturers to embed their keys in the db and KEK, ensuring their bootloaders work with Secure Boot. 
Manufacturers get a "Windows approved" sticker in return.
To install Linux, you need Microsoft to sign your bootloader. Ubuntu uses a "shim-signed" .efi file containing a Microsoft-signed bootloader. 
If Microsoft refuses to sign, you might be stuck.  Fortunately, you can usually disable Secure Boot in the UEFI menu. 
This was a requirement for Windows 8 PCs, but not for Windows 10, allowing manufacturers to potentially lock out other OSes. 
Hopefully, users will retain the option to disable Secure Boot.

A friend asked about installing multiple versions of the same Linux distribution. 
The problem is that installing a second version often overwrites the first's bootloader in the ESP (e.g., `/boot/efi/EFI/ubuntu`), 
making the first version unbootable from the UEFI menu. The solution is to rename the first version's bootloader 
directory (e.g., `/boot/efi/EFI/ubuntu_ver1`) before installing the second version. Then, update the NVRAM variables accordingly using efibootmgr. 
Alternatively, even if one bootloader is overwritten, GRUB might still detect the other OS and allow you to boot it from its menu 
(similar to dual-booting Windows and Linux with GRUB).

There are more boot-related topics, like LUKS, Bitlocker, and TPM, which I'll cover in a future article.

