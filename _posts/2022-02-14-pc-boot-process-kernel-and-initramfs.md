---
id: 861
title: 'PC boot process – Kernel and Initramfs'
date: '2022-02-14T16:52:13+01:00'
author: Lord_evron
layout: post
permalink: /2022/02/14/pc-boot-process-kernel-and-initramfs/
categories:
    - Technical
tags:
    - boot
    - linux
---

Welcome to another article on the PC boot process! This article will continue our exploration of the boot process, 
building upon our previous discussion of UEFI and GPT partitioning In particular I am assuming that you are familiar with UEFI and GPT partition 
as explained in details in [my previous post](/2018/12/14/pc-boot-process-uefi-with-gpt/). This article dives deeper into the process, specifically 
focusing on systems with Secure Boot enabled and running Linux distributions like Ubuntu


### The UEFI Firmware


The first thing that the PC does when you press the power button is to run a UEFI firmware. 
This is vendor specific code, so ether they load the code directly from the memory location of the stored UEFI firmware, 
or they use another read only firmware (stored in some eeprom) to start the real UEFI. 

As I discussed in previous posts, the UEFI firmware is capable of understanding partition tables and some file systems, so, when executed, 
it will look for a special partition called Efi System Partition (ESP), and uses NVRAM variables to select and launch bootloaders. 
If Secure Boot is enabled, additional security checks are performed before launching any bootloaders. Let's see them in details. 

### Secure boot and Linux Distributions:
Secure Boot is a firmware-level security feature that ensures only trusted software can execute during the boot process. 
It achieves this by verifying the digital signatures of bootloaders against a trusted list of keys stored in the system's firmware.
So, if secure boot is active, the signature of your bootloader must be valid and the signing key must be present in the UEFI signature database (
refer to secure boot article for more info). Manufacturers typically pre-populate the trusted key list primarily with keys for Windows bootloaders. 
so when your uefi will try to launch linux bootloaders such as `grubx64.efi` that are not signed with keys included in the default key list,
their execution will be blocked by Secure Boot.
For this reason a workaround has been found: *The "shimx64.efi" Solution*.
`shimx64.efi` is a small, Microsoft-signed program specifically designed to work with Linux distributions on systems with Secure Boot enabled.
It acts as an intermediary between the UEFI firmware and the Linux bootloader (eg. `grubx64.efi`).
`shimx64.efi` verifies the signature of `grubx64.efi` against the keys specific to the Linux distribution (e.g., Canonical keys for Ubuntu).
If the signature is valid, `shimx64.efi` then allows `grubx64.efi` to load and initiate the boot process for the Linux distribution.

So basically is just a wrapper around grub64 bootloader that perform signature verification and key managements.

### GRUB Boot Process:

Once executed, `grubx64.efi` loads the `normal.mod` module, located at `/boot/grub/x86_64-efi/normal.mod`. 
This file path is determined by the partition configuration set during "grub-install." 
If this partition changes, GRUB will fail to find `normal.mod` and present the user with the GRUB Rescue Shell.
Once loaded in memory, `normal.mod` loads any necessary extra modules (e.g., for a graphical menu) and parses the configuration file, `/boot/grub/grub.cfg`. 
This file contains information about installed kernels, the corresponding initramfs images, and their locations on the disk. 
Kernel files, typically named `vmlinuz-x.xx.xxx`, are compressed kernel images. Each kernel has an associated initramfs image, 
usually named `initrd.img-xxxx.x.xx`. GRUB loads the selected kernel and its corresponding initramfs image into memory.


### initramfs

The kernel then examines the first block of the loaded initramfs image to determine its format: "initrd" or "initramfs."
 Let stop a second to see what those files are and why they are needed. When the kernel starts, it has no idea what hardware is running onto, 
what peripherals are available, what drivers are needed etc. All this must be figured out before the user can use the pc. 
The idea of these files, is to provide the kernel with a early user space; basically a filesystem mounted in memory which include 
all the required folders (eg. /proc, /sbin, /sys etc.) and files. 
These files will help the kernel to perform all that hardware discovery process that has to be done.

The difference between the two schema is:

- ***initrd*** is a simple disk image copied into memory and mounted as a file system. is not so in use anymore
- ***initramfs*** (the one ubuntu uses) is just a “[**cpio**](https://en.wikipedia.org/wiki/Cpio)” archive (zipped files), 
containing modules needed by the kernel. This is what is normally used todays

So in case the kernel finds out that the schema is a *initrd*, then it will just mount the images on a specific path, otherwise if is a *initramfs* schema, 
it will unzip the folders in a special instance of [TMPFS]("https://en.wikipedia.org/wiki/Tmpfs") 
that will become the initial file root system. So, the initramfs provides the kernel with an initial, in-memory file system 
(including directories like */proc*, */sbin*, and */sys*). This temporary file system allows the kernel to gather information about the 
system's hardware and load necessary drivers before transitioning to the main operating system.

So, what modules are inside the *initramfs*? The specific contents of *initramfs* vary significantly depending on the Linux distribution 
and its configuration. Distributions can adopt two primary approaches to *initramfs* creation:

- Tailored *initramfs*: This approach prioritizes efficiency by including only the bare minimum of drivers and utilities 
necessary to boot the system on a specific hardware configuration. This results in smaller *initramfs* images,
which can potentially lead to faster boot times. However, this approach limits compatibility, as the *initramfs* 
may not contain the necessary components for different hardware setups.

- Generic *initramfs*: This approach aims for broader compatibility by including a wider range of drivers, utilities, 
and scripts within the *initramfs* image. This allows the system to potentially boot on a wider variety of hardware configurations. 
However, this generality comes at a cost. The kernel needs to perform extensive hardware detection and driver loading checks to determine which 
modules are actually required, which can increase boot time and system complexity.

For example, systems utilizing Logical Volume Management (LVM) require the *initramfs* to include the necessary LVM utilities to recognize and manage 
the logical volumes. Similarly, systems with encrypted root filesystems (such as those using LUKS) must have the *initramfs* 
contain the scripts and tools to decrypt the file system before the main operating system can access it.

The choice between a tailored and a generic *initramfs* approach involves a trade-off between compatibility, boot speed, and system complexity. 
For some distribution such as Debian, initramfs is very tailored to a specific machine, containing only modules required by that pc.
Other distribution, such as ubuntu, makes the initramfs more generic and they zip inside a little of everything, that can be useful to boot in a bunch 
of different machines… Just notice that in this second case, the software must perform a lot of more hardware checks to make sure it loads all and only the required drivers and kernel modules. For example for LVM volumes, lvm utilities must be started; for encrypted drives, decrypting script must be invoked, etc.


In an ideal scenario where all necessary hardware drivers are statically compiled into the kernel, and the system configuration is relatively standard 
(lacking features like LVM or encrypted drives), it might be theoretically possible to omit the *initramfs* file. 
However, statically compiling all drivers into the kernel has several drawbacks:

- Kernel Size and Maintainability: Static kernel compilation leads to significantly larger kernel images. 
This makes it challenging to add or remove hardware support, as kernel recompilation becomes necessary for every change.
- Limited Applicability: Static kernel compilation is primarily suitable for specialized systems with well-defined and unchanging hardware configurations, 
such as embedded systems or single-board computers like the Raspberry Pi.

For most general-purpose systems, especially those with advanced features like LVM or encrypted drives, the *initramfs* is indispensable. 
These features require early user-space operations, such as decrypting drives or managing logical volumes, 
which cannot be handled directly by the kernel itself. The *initramfs* provides the necessary environment for these critical tasks to be executed before 
the main file system is mounted and the system fully boots.

### Init Process
Once the kernel has successfully loaded and mounted the early user space (*initramfs* file system), it initiates the "init" process. Located in `/usr/sbin/init`,
this process will be the "parent" of all other processes within the system, uniquely identified by the process ID (PID) 1. 
The stability of the entire system will depend on from this single process. If the "init" process terminates unexpectedly, it typically results in a kernel panic, effectively crashing the system.

The init process will then performs a series of steps to transition to the final userspace:

- Mounting the Root Filesystem: "init" proceeds to mount the actual root filesystem of the operating system (e.g., an ext4 partition on a hard drive).
- "pivot_root" System Call: A crucial step is the use of the pivot_root system call. 
This call effectively shifts the root file system of the running process from the temporary "initramfs" environment to the newly mounted root filesystem.
- "init" in the Final Userspace: After the successful "pivot_root" operation, the "init" process continues to execute within the context of 
the newly mounted root filesystem. It then proceeds to start the remaining system services, such as starting the network, 
mounting user partitions, and launching the login manager.

Traditionally, the "init" process relied on the `/etc/inittab` file for configuration and process management. 
However, modern systems, utilizing systemd as the init system, have moved away from this approach. In systemd, services 
are automatically started concurrently, streamlining the system startup process. Regardless of the specific implementation, 
the "init" system plays a vital role in bringing up and maintaining the user-space services that form the foundation of the operating system.


This article was quite technical but I hope you learn something new by reading it!