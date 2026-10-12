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
or UEFI systems use MBR disks. Let's start with the latter. UEFI can actually boot from MBR disks natively: it understands MBR partition tables too, 
and the ESP can simply be an MBR partition (type `0xEF`). 
What UEFI cannot do natively is run old BIOS boot code. For that there is the Compatibility Support Module (CSM): 
when a device is booted in legacy (CSM) mode, UEFI ignores the ESP and runs the boot code in the MBR, functioning similarly to a BIOS/MBR system 
(is important to point that CSM allows UEFI to emulate a BIOS environment, but it's not exactly the same. The underlying firmware is still UEFI.). 
Note that CSM is disappearing: Intel stopped supporting it on new platforms around 2020, so most recent PCs can only boot in UEFI mode.


Using GPT disks with older BIOS systems depends on the OS.  
The BIOS doesn't understand the ESP file system or the GPT partition table, but it doesn't need to: it simply runs the boot code stored in LBA0, 
the protective MBR. For Linux this is routine: GRUB places its boot code there and stores the rest of itself in a tiny dedicated 
"BIOS boot partition" (about 1 MB, no file system), from where it can read GPT and load the kernel.  
Windows, on the other hand, doesn't support booting from a GPT disk on a legacy BIOS system. The solution involves using a bootloader 
(like Clover) that emulates the UEFI firmware and chain-loads the Windows bootloader. 
A full guide is beyond this article's scope, but it's a more involved process.

UEFI also introduced Secure Boot. While it's faced criticism, the basic idea is solid. 
Traditional BIOS/UEFI firmware boots any code without checks, making it vulnerable to rootkits that can replace the bootloader. 
Secure Boot addresses this by only executing bootloaders signed with a valid key. 
If a rootkit tampers with the bootloader, it won't execute. Secure Boot uses four sets of keys stored in NVRAM:

- **Platform Key (PK)**: The root of trust, usually owned by the hardware manufacturer. It controls who can update the KEK.
- **Key Exchange Key Database (KEK)**: Stores signing keys used to update the db and dbx.
- **Signature Database (db)**: Stores certificates and hashes of trusted bootloaders and drivers.
- **Revoked Signatures Database (dbx)**: Stores revoked certificates and hashes. Entries here have priority over the db.

The idea is good, but Microsoft controls the signing process. They require hardware manufacturers to embed their keys in the db and KEK, ensuring their bootloaders work with Secure Boot. 
Manufacturers get a "Windows approved" sticker in return.
To install Linux with the default keys, you need Microsoft to sign your bootloader. Ubuntu uses a small Microsoft-signed first-stage bootloader called shim, 
which in turn verifies GRUB, signed with Canonical's own key. 
If Microsoft refuses to sign, you might be stuck. Fortunately, you have two ways out: you can usually disable Secure Boot in the UEFI menu, 
or you can enroll your own keys (replacing PK, KEK and db, or adding them to shim's Machine Owner Key list) and sign your bootloader yourself. 
Being able to disable Secure Boot was a requirement for Windows 8 PCs, but not for Windows 10, allowing manufacturers to potentially lock out other OSes. 
Hopefully, users will retain the option to disable Secure Boot.

A friend asked about installing multiple versions of the same Linux distribution. 
The problem is that installing a second version often overwrites the first's bootloader in the ESP (e.g., `/boot/efi/EFI/ubuntu`), 
making the first version unbootable from the UEFI menu. One workaround is to rename the first version's bootloader 
directory (e.g., `/boot/efi/EFI/ubuntu_ver1`) before installing the second version, then update the NVRAM variables accordingly using efibootmgr. 
This is fragile, though: the next GRUB update of the first version will write again to `/EFI/ubuntu`. 
The more reliable solution is to let a single GRUB boot both systems: even if one bootloader is overwritten, GRUB can detect the other OS 
and allow you to boot it from its menu (similar to dual-booting Windows and Linux with GRUB). 
Since GRUB 2.06 this detection (os-prober) is disabled by default, so you need to set `GRUB_DISABLE_OS_PROBER=false` 
in `/etc/default/grub` and run `update-grub`.

There are more boot-related topics, like LUKS, Bitlocker, and TPM, which I'll cover in a future article.

