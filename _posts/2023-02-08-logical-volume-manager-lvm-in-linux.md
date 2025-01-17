---
id: 883
title: 'Logical Volume Manager (LVM) in Linux'
date: '2023-02-08T00:46:41+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=883'
permalink: /2023/02/08/logical-volume-manager-lvm-in-linux/
yasr_schema_additional_fields:
    - 'a:1:{s:17:"yasr_schema_title";s:0:"";}'
ao_post_optimize:
    - 'a:6:{s:16:"ao_post_optimize";s:2:"on";s:19:"ao_post_js_optimize";s:2:"on";s:20:"ao_post_css_optimize";s:2:"on";s:12:"ao_post_ccss";s:2:"on";s:16:"ao_post_lazyload";s:2:"on";s:15:"ao_post_preload";s:0:"";}'
categories:
    - Technical
tags:
    - filesystem
    - harddrive
    - linux
    - lvm
    - resize
    - volumes
---

Today I want to explain some basic concept of Linux Volume Manager and give a small example on how to enlarge an existing logical volume by adding a new physical disk.

Traditionally Storage management consist on Physical Drives and Partitions. Usually Linux systems shows block devices in the **/dev/sdX** mapped files where X is a letter starting from A. So the first physical drive is associated to **/dev/sda**, the second hard drive to **/dev/sdb** , the third hard drive to **/dev/sdc** etc..

If you create partitions it will append a number at the end. If for example you create two partitions on /dev/sda then you will have **/dev/sda1** and **/dev/sda2** . These partition can then be mounted in specific paths, so for example you could use sda1 for /boot and sda2 for /home. Creating another single partition on sdb will result in **dev/sdb1**, that you can for example mount it on /mnt/data.  
However there is a big limitations with this approach. Partitions are entirely contained within a single physical drive, so if we want to expand /boot then we cannot simply “borrow” some space from /mnt/data . Enlarging /boot partition in this case will mean to shrink the /home partition. Furthermore these operations of enlarging and shrinking are not trivial and can easily lead to data losses. If we add a new Hard Drive (eg sdc), we cannot easily use it for enlarging the existing /boot partition, since they live in two different hard drives and there was no easy management for these (quite common!) scenarios.

So Lets assume that you have 2 hard drives and you want to merge their size to create a virtual single drive that can be mounted in /mnt/storage..

How to do that? Logic Volume Manager (LVM). LVM is used to create and manage an abstraction layer on top of physical volumes . It does so by adding tree new concepts:

1. Physical Volumes
2. Volume Groups
3. Logical Volumes

Physical Volumes are just a bunch of physical hard drives (e.g. **/dev/sdc**) AND/OR partitions (eg. **/dev/sdb1**) that are available to LVM to be used. you can list existing physical volumes with the ***pvs*** command or ***pvdisplay*** command.

PVs can then be added to Volume Groups (VG). As the name suggest, VG are logical groups of multiple PVs. It is important to understand that at this stage the Volume group has the sum of the storage of all the PVs associated. In our example, if we created a VG called test-vg using sdb1 partition (eg 30GB) and sdc block device (eg 120GB), the total space of out test-vg group is 150 GB. To check the current VG you can use ***vgs*** command or ***vgdisplay*** command. Furthermore you can create new Vgroups with:

<div class="wp-block-syntaxhighlighter-code ">```

$ sudo vgcreate test-vg /dev/sdb1 /dev/sdc
```

</div>Now we can use that total space of the group and create logical volumes (LV) on top of it. We could for example create a single LV of 150GB or we could split in two LVs of 75GB each. You can display the LV with ***lvs*** command or ***lvdisplay*** command. To create a new logical volume ( data-lv) of size 150GB from the test-vg group we can use:

<div class="wp-block-syntaxhighlighter-code ">```

$ sudo lvcreate -L 150GB -n data-lv test-vg
```

</div>Once that we created the desired LVs, we can then use it normally by creating A Filesystem and mounting it as normal.

This LVM architecture makes much easier to resize existing LV by adding more physical volumes.

## Practical Example – Use a new physical disk to expand an existing logical volume

Lets suppose you have a PV (dev/sdb1) that is part of of VG group called test-vg that is 500GB in size. A single logic volume called **data-lv** is created from that group and is used to store some datasets. So data-lv is formatted as xfs, mounted in /mnt/mydata. if we type df -h we will see that the mounted data-lv has 500GB in size. Because our dataset are growing in size quite fast we want now to add a new physical driver (sdc) of 1TB in size to the data-lv to expand it to a total 1.5 TB

So I assume that you can see the new hard drive attached in /dev/sdc. The step to perform are the following (notice that most of commands require root permissions eg sudo) :

1. Create a new PV with the new Hard drive

<div class="wp-block-syntaxhighlighter-code ">```

$ sudo pvcreate /dev/sdc  
 Physical volume "/dev/sdc" successfully created
$
```

</div>Note that If you just want to add part of the SDC, then you need to first divide /dev/sdc in two (or more) partitions and then add only the desired partition to the PV.

You can now scan the PV to make sure is there:

<div class="wp-block-syntaxhighlighter-code ">```

$ sudo lvmdiskscan -l
```

</div>2\. Add the newly created PV to the Volume Group (in our case test-vg)

<div class="wp-block-syntaxhighlighter-code ">```

$ sudo vgextend  test-vg  /dev/sdc
  Volume group "test-vg" successfully extended
$

```

</div>3\. Now you need to resize the data-lv volume. We will resize to use all the new free space available, but you can decide to make it use only a part of it and eventually create a new LV for other purposes.

<div class="wp-block-syntaxhighlighter-code ">```

$ sudo lvm lvextend -l +100%FREE /dev/test-vg/data-lv
Size of logical volume test-vg/data-lv changed from 500.00 GiB (10234 extents) to 1.5 TB (230336 extents).
  Logical volume data-lv successfully resized.
$
```

</div>Once you have done this, your logical volume has 1.5TB of size available, but the Filesystem must be expanded before your OS can use it. Indeed if you now check with df -h it will continue show 500Gb in size and not 1.5Tb. However ***lvdisplay*** command shows the correct size. The FS expansion step depends from the FileSystem that you are using.

 If you had filesystem types ext2, ext3, or ext4 you can use resize2fs. Notice that this tool uses the LVM device as parameter usually **/dev/mapper/vgroup-logicv** (the one that appears in df command)

<div class="wp-block-syntaxhighlighter-code ">```

$ sudo resize2fs -p /dev/mapper/test-vg-data-lv
```

</div>In our case we assumed that we had xfs filesystems so we need to use a different utility instead of resizefs:

<div class="wp-block-syntaxhighlighter-code ">```

$ sudo xfs_growfs /dev/mapper/test-vg-data-lv
```

</div>Notice that for both the utilities is possible to resize the FS to a specific size. However if we do not pass any particular size (like in the above example), the utilities will grow the file system to the maximum size supported by the device.

if you now check again the df -h command you should see that the /mnt/mydata has now 1.5TB of total space. So we successfully increased the logical volume without a single reboot and transparently to any running application. So, in case those datasets were generated by a running software, we increased its available space without downtime.

## Practical Example 2 – Move/Remove a physical disk from a group

Lets assume that now you want to move the 500GB size Partition /dev/sdb1 mentioned in the example above from the test-vg group to the home-vg (where your /home is) to have some extra space on your home folder.

You can do so with only 2 commands. Firstly you need to empty the Physical volume by moving the data to the other drives of the test-vg group (/dev/sdc in our case).

<div class="wp-block-syntaxhighlighter-code ">```

$ sudo pvmove /dev/sdb1
```

</div>This command will redistribute the sdb1 data to the other volumes of the group. Alternatively you can also pass a destination volume as second parameter. So for example to move all the data from sdb1 to sdc:

<div class="wp-block-syntaxhighlighter-code ">```

$ sudo pvmove /dev/sdb1  /dev/sdc
```

</div>Once that there is no more data in the volume you can simply remove it from the group with:

<div class="wp-block-syntaxhighlighter-code ">```

$ sudo vgreduce test-vg  /dev/sdb1
```

</div>Once the physical volume does not belong to the group anymore, you can simply follow the step in the previous example to add the sdb1 PV to the home-vg group and expand the LV and filesystem, or remove the PV entirely if you want.

Logical Volume Manager is a great tool that add a bit of complexity to the disk management but allows great flexibility in return.

Next time that you will install a Linux Distro, I hope you will be more confident on answering the question : “Do you want to create Logical Volumes or use standard partitioning?”.. You now know what that mean 🙂

Hope you learned something.. Thanks for reading.