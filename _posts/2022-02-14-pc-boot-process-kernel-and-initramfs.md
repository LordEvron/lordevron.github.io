---
id: 861
title: 'PC boot process – Kernel and Initramfs'
date: '2022-02-14T16:52:13+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=861'
permalink: /2022/02/14/pc-boot-process-kernel-and-initramfs/
yasr_schema_additional_fields:
    - 'a:1:{s:17:"yasr_schema_title";s:0:"";}'
ao_post_optimize:
    - 'a:5:{s:16:"ao_post_optimize";s:2:"on";s:19:"ao_post_js_optimize";s:2:"on";s:20:"ao_post_css_optimize";s:2:"on";s:12:"ao_post_ccss";s:2:"on";s:16:"ao_post_lazyload";s:2:"on";}'
categories:
    - Technical
tags:
    - boot
    - linux
---

Welcome to another article on the PC boot process! This article will complete the booting process from where[ we left it](http://localhost:8080/tag/boot/). In particular i am assuming that you are familiar with UEFI and GPT partition as explained in details in [this post](http://localhost:8080/2018/12/14/pc-boot-process-uefi-with-gpt/).

The first thing that the PC does when you press the power button is to run a UEFI firmware. This is vendor specific code, so ether they load the code directly from the memory location of the stored UEFI firmware, or they use another read only firmware (stored in some eeprom) to start the real UEFI. As I discussed in previous posts, the UEFI firmware is capable of understanding partition tables and some file systems, so, when executed, it will look for a special partition called Efi System Partition (ESP), and based on the Value of the Uefi Variables stored in the NVRAM, it will try to start one of the bootloader. All this has been discussed in previous articles. So in this article i want to go more in details on what happens from this point on, assuming that you have secureboot active and you are running some linux distro eg. ubuntu. If secure boot is active, the signature of your bootloader must be valid and the signing key must be present in the UEFI signature database (refer to secure boot article for more info). Usually the manufacturer only adds keys for windows, so when your uefi will try to launch **“grubx64.efi”** file, it will fails saying that file does not contains a valid signature. For this reason a workaround has been found: Microsoft has signed some binaries called **“shimx64.efi”** and that is what uefi will launch. Since that is signed by Microsoft, it will be executed. The scope of that tiny wrapper is just to check the signature of the “**grubx64.efi**” to make sure that is signed with “Canonical” (ubuntu) keys and execute it. So basically is just a signed wrapper around grub64 bootloader.

When grubx64 is executed, it will load the file “`<strong>/boot/grub/x86_64-efi/normal.mod</strong>`” from the partition configured by `grub-install`. If the partition index has changed, GRUB will be unable to find the `normal.mod`, and presents the user with the GRUB Rescue Shell. After normal.mod has been loaded, it will parse the `<strong>/boot/grub/grub.cfg</strong>` file and it loads extra modules if needed (eg graphical menu). Grub.cfg file contains information on the kernels and the relative initramfs installed on the system together with their locations on disk.

Kernel files are usually zipped. Indeed if you navigate on your /boot partition you will notice the name of the format “vmlinuz-x.xx.xxx”. Those files are the zipped kernel files. Associated with them there is usually a initramfs file of the format initrd.img-xxxx.x.xx. Grub will load the selected kernel and the associated initial root file system image (initramfs) into memory and then start the kernel, passing in the memory address of the initramfs image.

The kernel will then read the first block of the passed memory address and try to understand if is “initrd” schema or “initramfs” schema. Let stop a second to see what those files are and why they are needed. When the kernel starts, it has no idea what hardware is running onto, what peripherals are available, what drivers are needed etc. All this must be figured out before the user can use the pc. The idea of these files, is to provide the kernel with a early user space; basically a filesystem mounted in memory which include all the required folders (eg. /proc, /sbin, /sys etc.) and files. These files will help the kernel to perform all that hardware discovery process that has to be done.

The difference between the two schema is:

- **“initrd”** disk is just an image of a file disk that is copied in ram and mounted as file system, .
- **“initramfs”** (the one ubuntu uses) is just a “[**cpio**](https://en.wikipedia.org/wiki/Cpio)” archive (zipped files), containing modules needed by the kernel.

So in case the kernel finds out that the schema is a “initrd”, then it will just mount the images on a specific path, otherwise if is a “initramfs” schema, it will unzip the folders in a `<strong>special instance of "<a href="https://en.wikipedia.org/wiki/Tmpfs">tempfs</a>"</strong>` that will become the initial file root system.

So, what modules are inside the “initramfs”? That depends on what software you use for making the “initramfs”.. For some distribution such as Debian, initramfs is very tailored to a specific machine, containing only modules required by that pc. Other distribution, such as ubuntu, makes the initramfs more generic and they zip inside a little of everything, that can be useful to boot in a bunch of different machines… Just notice that in this second case, the software must perform a lot of more hardware checks to make sure it loads all and only the required drivers and kernel modules. For example for LVM volumes, lvm utilities must be started; for encrypted drives, decrypting script must be invoked, etc.

Once the kernel has mounted the early user space, it can launch the init script in /usr/sbin. When this process starts, it became the first parent process of all your other processes and it has always pid=1. If init dies, you will get a kernel panic.

In old systemV, init process would parse the /etc/inittab, but newer systemd does not use /etc/inittab file anymore, but the services are automatically started in parallel. Anyway, from here, init acts as init system that brings up and maintains userspace service.

 Few remarks on initramfs and its utility. Ideally, if you have all the required modules statically compiled into kernel and your system is standard (eg no LVM, no encryption, etc), it is possible to skip the initramfs file, since the kernel has everything that needs. However, statically loading kernel modules make sense only if you have a custom kernel (so you tailor the kernel for your specific machine) or if is a know hardware (for example embedded systems or Raspberry pi do not uses initramfs). In other cases (general systems), kernel size will soon grow out of control making more difficult to remove and integrate new hardware. Furthermore, for non standard systems, for example encrypted drives on lvm, then the kernel cannot handle that without using a early user space needed to decrypt the drive before it can create a real file system.

This article was quite technical but i hope you discovered something new by reading it!