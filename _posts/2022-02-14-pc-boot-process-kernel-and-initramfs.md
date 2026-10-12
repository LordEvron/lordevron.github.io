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
building upon our previous discussion of UEFI and GPT partitioning. In particular I am assuming that you are familiar with UEFI and GPT partition 
as explained in details in [my previous post](/2018/12/14/pc-boot-process-uefi-with-gpt/). This article dives deeper into the process, specifically 
focusing on systems with Secure Boot enabled and running Linux distributions like Ubuntu.


### The UEFI Firmware


The first thing that the PC does when you press the power button is to run the UEFI firmware. 
This is vendor specific code stored in a flash chip on the motherboard (usually SPI flash). On modern machines the CPU does not blindly run it: 
a small, immutable piece of code inside the CPU or chipset (e.g., Intel Boot Guard or the AMD Platform Security Processor) first verifies the 
firmware and only then lets it execute.

As I discussed in previous posts, the UEFI firmware is capable of understanding partition tables and some file systems, so, when executed, 
it will look for a special partition called EFI System Partition (ESP), and uses NVRAM variables (`BootOrder`, `Boot0000`, ...) to select and launch bootloaders. 
If no entry works, it falls back to the default path `\EFI\BOOT\BOOTX64.EFI`.
If Secure Boot is enabled, additional security checks are performed before launching any bootloaders. Let's see them in details. 

### Secure boot and Linux Distributions:
Secure Boot is a firmware-level security feature that ensures only trusted software can execute during the boot process. 
It achieves this by verifying the digital signatures of bootloaders against a trusted list of keys stored in the system's firmware.
So, if secure boot is active, the signature of your bootloader must be valid and the signing key must be present in the UEFI signature database 
(refer to secure boot article for more info). On most PCs the manufacturers pre-populate this database with two Microsoft keys: 
one used to sign Windows bootloaders, and a second "third-party" UEFI CA that Microsoft uses to sign other vendors' boot software.
Linux distributions cannot get their own key into every PC's firmware, so a bootloader such as `grubx64.efi`, signed only with a distribution key, 
would be blocked by Secure Boot.
For this reason a workaround has been found: *The "shimx64.efi" Solution*.
`shimx64.efi` is a small first-stage bootloader, signed by Microsoft's third-party UEFI CA, specifically designed to work with Linux distributions on systems with Secure Boot enabled.
It acts as an intermediary between the UEFI firmware and the Linux bootloader (eg. `grubx64.efi`).
Shim carries the distribution's own certificate built in (e.g., Canonical's key for Ubuntu), plus a user-managed list of extra keys called MOK (Machine Owner Keys).
It verifies the signature of `grubx64.efi` against those keys and, if valid, launches it.

The chain of trust does not stop at GRUB: shim also exposes a verification service that GRUB uses to check the **kernel's** signature before booting it. 
So under Secure Boot the kernel must be signed too (and, in lockdown mode, so must any kernel module loaded later).

So basically shim is not just a wrapper around GRUB: it is the piece that extends the firmware's trust from Microsoft's key to the distribution's key, 
and from there all the way to the kernel.

*Side note*: Microsoft's original 2011 Secure Boot certificates expire in 2026 and are being replaced by new 2023 ones, 
so firmware and shim updates are rolling out to keep this chain working.

### GRUB Boot Process:

Not all `grubx64.efi` files are the same: what happens next depends on which kind of GRUB was installed on the ESP.

- **GRUB built locally by `grub-install`**: `grub-install` generates a small, unsigned core image on your machine. 
At boot it loads its modules from disk, starting with `normal.mod`, located at `/boot/grub/x86_64-efi/normal.mod`. 
The location of that folder is hard-coded into the core image when "grub-install" runs. 
If this partition changes, GRUB will fail to find `normal.mod` and present the user with the GRUB Rescue Shell. 
Being unsigned, this image is blocked when Secure Boot is enabled (unless you sign it yourself, e.g. with `sbctl`). 
This is what distributions like Arch or Gentoo install by default.

- **Pre-built GRUB signed by the distribution**: under Secure Boot, GRUB cannot load unsigned modules from disk, so the distribution ships a 
`grubx64.efi` that is a single image with all the modules it needs built in, signed with the distribution key that shim trusts. 
It reads a tiny `grub.cfg` stored on the ESP (e.g., `/EFI/ubuntu/grub.cfg`), which simply 
locates the partition containing `/boot` by its UUID and jumps to the real configuration file.

Note that the choice does not depend on whether Secure Boot is currently enabled in the firmware: on Ubuntu (and on Debian when the signed GRUB 
packages are installed), `grub-install` copies the signed `shimx64.efi` and `grubx64.efi` by default, so the same files boot 
with Secure Boot on or off. You only get a locally built GRUB if you explicitly ask for it with `grub-install --no-uefi-secure-boot`.

Either way, GRUB ends up parsing `/boot/grub/grub.cfg`. 
This file contains information about installed kernels, the corresponding initramfs images, their locations on the disk, and the kernel command line. 
Kernel files, typically named `vmlinuz-x.xx.xxx`, are compressed, self-extracting kernel images. Each kernel has an associated initramfs image, 
usually named `initrd.img-x.xx.xxx`. GRUB loads the selected kernel and its corresponding initramfs image into memory, together with the kernel 
command line (e.g., `root=UUID=... ro quiet splash`). That `root=` parameter is how the system will later know which disk holds the real root filesystem.


### initramfs

The kernel then examines the loaded image to determine its format: "initramfs" or the older "initrd."
Let's stop a second to see what those files are and why they are needed. The kernel itself is perfectly able to discover the hardware 
(it enumerates PCI, ACPI and USB devices on its own). The real problem is a chicken-and-egg one: the drivers and tools needed to reach the root filesystem 
(the storage controller driver, the filesystem module, the tools to assemble LVM or RAID, or to decrypt a LUKS volume) live... on the root filesystem.
So, the idea of initramfs files is to provide the kernel with an early user space: a small filesystem in memory that contains exactly those drivers and tools, 
plus a program called `/init` whose only job is to find and mount the real root filesystem.

The difference between the two schemes is:

- ***initrd*** is a simple disk image copied into memory (a RAM disk) and mounted as a file system. It is not much in use anymore.
- ***initramfs*** (the one Ubuntu uses) is a “[**cpio**](https://en.wikipedia.org/wiki/Cpio)” archive, usually compressed with gzip, lz4 or zstd, 
containing the `/init` program, kernel modules, a minimal set of utilities (e.g., busybox, udev) and scripts. This is what is normally used today. 
Ubuntu also prepends a small uncompressed archive holding the CPU microcode updates, so the kernel can apply them as early as possible.

So in case the kernel finds out that the image is an *initrd*, then it will mount it as a RAM disk; otherwise, if it is an *initramfs*, 
it will extract the archive into a special instance of [tmpfs](https://en.wikipedia.org/wiki/Tmpfs) (called rootfs) 
that will become the initial root filesystem. Directories like */proc*, */sys* and */dev* are just empty mount points in the archive: 
`/init` mounts the corresponding virtual filesystems on them as its first step.

So, what modules are inside the *initramfs*? The specific contents of *initramfs* vary significantly depending on the Linux distribution 
and its configuration. Distributions can adopt two primary approaches to *initramfs* creation:

- Tailored *initramfs*: This approach prioritizes efficiency by including only the bare minimum of drivers and utilities 
necessary to boot the system on a specific hardware configuration. This results in smaller *initramfs* images,
which can potentially lead to faster boot times. However, this approach limits compatibility, as the *initramfs* 
may not contain the necessary components for different hardware setups.

- Generic *initramfs*: This approach aims for broader compatibility by including a wider range of drivers, utilities, 
and scripts within the *initramfs* image. This allows the system to potentially boot on a wider variety of hardware configurations. 
However, this generality comes at a cost: a bigger image, and at boot udev (running inside the initramfs) has to match the detected devices 
against the available modules and load the right ones.

For example, systems utilizing Logical Volume Management (LVM) require the *initramfs* to include the necessary LVM utilities to recognize and manage 
the logical volumes. Similarly, systems with encrypted root filesystems (such as those using LUKS) must have the *initramfs* 
contain the scripts and tools to decrypt the file system before the main operating system can access it.

The choice between a tailored and a generic *initramfs* approach involves a trade-off between compatibility, boot speed, and system complexity. 
Debian and Ubuntu both use `initramfs-tools`, which by default builds a generic image (`MODULES=most` in `/etc/initramfs-tools/initramfs.conf`): 
a little bit of everything, so the same disk can boot on a bunch of different machines. 
Fedora and RHEL use `dracut` in "hostonly" mode, which produces an image tailored to the machine it was built on (plus a generic "rescue" entry), 
and Arch's `mkinitcpio` does the same with its `autodetect` hook, keeping a generic "fallback" image around just in case.


In an ideal scenario where all necessary hardware drivers are statically compiled into the kernel, and the system configuration is relatively standard 
(lacking features like LVM or encrypted drives), it is possible to omit the *initramfs* file entirely. 
However, statically compiling all drivers into the kernel has several drawbacks:

- Kernel Size and Maintainability: Static kernel compilation leads to significantly larger kernel images. 
This makes it challenging to add or remove hardware support, as kernel recompilation becomes necessary for every change.
- Limited Applicability: Static kernel compilation is primarily suitable for specialized systems with well-defined and unchanging hardware configurations, 
such as embedded systems or single-board computers like the Raspberry Pi.

For most general-purpose systems, especially those with advanced features like LVM or encrypted drives, the *initramfs* is indispensable. 
The kernel does contain the low-level machinery (device mapper, dm-crypt), but setting it up requires user-space work, 
such as asking for a passphrase or scanning disks for logical volumes. 
The *initramfs* provides the necessary environment for these critical tasks to be executed before 
the main file system is mounted and the system fully boots.

### Init Process
Once the kernel has unpacked the *initramfs*, it starts its first user-space program: `/init`, **inside the initramfs**. 
This process gets process ID (PID) 1 and will be the ancestor of all other processes within the system. 
The stability of the entire system depends on this single process: if PID 1 terminates, the kernel panics ("Attempted to kill init!"), effectively crashing the system.

What `/init` is depends on the distribution: on Ubuntu (`initramfs-tools`) it is a shell script, on Fedora (`dracut`) it is systemd itself. 
In both cases it performs the same steps to transition to the final userspace:

- Setting up the early environment: mounting `/proc`, `/sys` and `/dev`, then letting udev load the drivers for the detected hardware.
- Preparing the root device: assembling RAID or LVM volumes, asking for the LUKS passphrase, and so on.
- Mounting the Root Filesystem: the real root filesystem indicated by the `root=` kernel parameter (e.g., an ext4 partition on a hard drive) is mounted, usually read-only, on a temporary directory.
- "switch_root": a crucial step. It deletes everything in the initramfs (to free the memory), makes the newly mounted filesystem the new root `/`, 
and finally **executes** the real init program, `/sbin/init`, which on most distributions today is a link to systemd. 
Because it is an `exec` and not a new process, the real init replaces the initramfs one and keeps PID 1.
(You may read about `pivot_root` here: that is how the old *initrd* scheme did the switch, but it cannot be used on an initramfs.)
- "init" in the Final Userspace: the real init then proceeds to start the remaining system services, such as remounting the root filesystem read-write, 
starting the network, mounting user partitions, and launching the login manager.

If there is no initramfs at all, the kernel mounts the root filesystem itself (using `root=`) and directly looks for `/sbin/init`, `/etc/init`, `/bin/init` 
and finally `/bin/sh`, running the first one it finds. You can override this choice with the `init=` kernel parameter (or `rdinit=` for the initramfs one).

Traditionally, the "init" process (System V init) relied on the `/etc/inittab` file and on a sequence of shell scripts for configuration and process management. 
However, modern systems, utilizing systemd as the init system, have moved away from this approach. In systemd, services 
are described by unit files with explicit dependencies and are started in parallel whenever possible, streamlining the system startup process. 
Regardless of the specific implementation, the "init" system plays a vital role in bringing up and maintaining the user-space services that form the foundation of the operating system.

*Side note*: GRUB is not the only option. Many modern setups skip it entirely and use `systemd-boot`, or even a Unified Kernel Image (UKI): 
a single signed EFI file bundling kernel, initramfs and command line, which the firmware (or shim) can launch directly.


This article was quite technical but I hope you learned something new by reading it!
