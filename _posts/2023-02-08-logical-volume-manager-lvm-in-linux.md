---
id: 883
title: 'Logical Volume Manager (LVM) in Linux'
date: '2023-02-08T00:46:41+01:00'
author: Lord_evron
layout: post
permalink: /2023/02/08/logical-volume-manager-lvm-in-linux/
categories:
    - Technical
tags:
    - technical
    - linux
---

This article show fundamental concepts of Linux Volume Management (LVM) and demonstrate a practical example of expanding an 
existing logical volume by incorporating a new physical disk.


Historically, storage management in Linux has relied on physical drives and their associated partitions. 
Typically, these are represented as block devices within the **/dev/sdX** directory, where 'X' is an alphabetical identifier
(e.g., `/dev/sda` for the first drive, `/dev/sdb` for the second, and so on) etc..


Partitions are created within a specific physical drive, resulting in names like /dev/sda1, /dev/sda2, etc. 
These partitions are then assigned to specific mount points (e.g., /boot on /dev/sda1, /home on /dev/sda2).
However, this traditional approach has significant limitations:

- Limited flexibility: Partition expansion is constrained to the space available within the same physical drive. 
Increasing the size of `/boot` necessitates shrinking another partition on the same drive (e.g., `/home`), which can be complex and risky.
- Lack of inter-drive management: Adding a new drive (e.g., `/dev/sdc`) does not provide a straightforward way to expand 
existing partitions since they live in two different hard drives and there was no easy management for it.

Imagine you have two hard drives and want to combine their storage into a single, virtual drive that can be mounted at /mnt/storage.

This is where Linux Volume Manager (LVM) comes into play. LVM introduces an abstraction layer over physical storage, enabling flexible management 
through these key concepts:

1. Physical Volumes
2. Volume Groups
3. Logical Volumes


**Physical Volumes (PVs)** are individual physical drives or partitions (e.g., /dev/sdc, /dev/sdb1) made available for LVM use. 
You can list existing PVs using the `pvs` or `pvdisplay` commands.
**Volume Groups (VGs)** are collections of one or more PVs. A VG represents the combined storage capacity of its PVs. 
Volume groups can then be used to create logical volumes that are software-defined storage units,
providing greater flexibility and control over disk space allocation and management.


For instance, if you create a VG named "test-vg" using a 30GB partition (/dev/sdb1) 
and a 120GB drive (/dev/sdc), the total available space within "test-vg" would be 150GB. You can view existing VGs with the `vgs` or `vgdisplay` commands. 
New VGs can be created using the command...

```bash
$ sudo vgcreate test-vg /dev/sdb1 /dev/sdc
```

Now, we can leverage the total space within the Volume Group to create Logical Volumes (LVs). 
For instance, we could create a single 150GB LV or divide the space into two 75GB LVs. You can view existing LVs using the `lvs` or `lvdisplay` commands.

To create a new 150GB Logical Volume named "data-lv" within the "test-vg" group, you would use the following command

```bash
$ sudo lvcreate -L 150GB -n data-lv test-vg
```

Once the desired LVs are created, they can be used like any other disk partition: create a filesystem on the LV and mount it at the desired location.
This LVM architecture offers significant advantages, particularly in terms of resizing existing LVs. 
Adding more physical drives to the Volume Group allows for easy expansion of the available space for your LVs

## Practical Example – Use a new physical disk to expand an existing logical volume

Assume you have a 500GB Physical Volume (/dev/sdb1) within a Volume Group named `test-vg`. 
This volume group is used by a Logical Volume called 'data-lv', formatted with xfs and mounted at `/mnt/mydata`, and used to store a growing dataset. 
Because the dataset is growing in size, we need to increase the space to accommodate the large file size. 
We can expand `data-lv` to 1.5TB by adding a new 1TB drive (`/dev/sdc`). To do use the following steps (note that most commands require root privileges):

1. Create a new PV with the new Hard drive

```bash

$ sudo pvcreate /dev/sdc  
 Physical volume "/dev/sdc" successfully created
```
*Note* that If you intend to utilize only a portion of /dev/sdc, you must first partition /dev/sdc accordingly 
and then add only the desired partition to the Physical Volume.

You can now scan the PV to make sure is there:

```bash
$ sudo lvmdiskscan -l
```

Add the newly created PV to the Volume Group (in our case test-vg)

```bash
$ sudo vgextend  test-vg  /dev/sdc
  Volume group "test-vg" successfully extended
```

Now you need to resize the data-lv volume. We will resize to use all the new free space available, 
but you can decide to make it use only a part of it and eventually create a new LV for other purposes.

```bash

$ sudo lvm lvextend -l +100%FREE /dev/test-vg/data-lv
  Size of logical volume test-vg/data-lv changed from 500.00 GiB (10234 extents) to 1.5 TB (230336 extents).
  Logical volume data-lv successfully resized.
```

After adding the new drive, your Logical Volume will have 1.5TB of available space. However, you'll need to resize the filesystem to reflect this change.
Currently, `df -h` will still display 500GB, while `lvdisplay` will show the correct 1.5TB. 
The specific steps for filesystem expansion vary depending on the filesystem type (e.g., xfs, ext4)
If you had filesystem types ext2, ext3, or ext4 you can use `resize2fs`. 
Notice that this tool uses the LVM device as parameter usually `/dev/mapper/vgroup-logicv` (the name that appears in `df` command)

```bash
$ sudo resize2fs -p /dev/mapper/test-vg-data-lv
```

In our case we assumed that we had xfs filesystems so we need to use a different utility instead of `resizefs`:

```bash
$ sudo xfs_growfs /dev/mapper/test-vg-data-lv
```

Both utilities allow you to resize the filesystem to a specific size. However, if no size is specified, the utilities 
will expand the filesystem to the maximum capacity supported by the underlying device. 
After resizing the filesystem, the df -h command should now display 1.5TB of total space for the /mnt/mydata mount point. 
This demonstrates a key advantage of LVM: you can seamlessly increase the size of a logical volume without requiring a system reboot, 
ensuring zero downtime for applications that are actively generating data. Also, we can store files larger than any individual disk within the volume group. 
For example, you could store a 1.2 TB file on that LVM composed of two disks, one with 1 TB and the other with 0.5 TB.

## Practical Example 2 – Move/Remove a physical disk from a group

Lets assume that now you want to move the 500GB size Partition /dev/sdb1 mentioned in the example above from the test-vg group to the home-vg (where your /home is) to have some extra space on your home folder.

You can do so with only 2 commands. Firstly you need to empty the Physical volume by moving the data to the other drives of the test-vg group (/dev/sdc in our case).

Suppose you want to move the 500GB partition `/dev/sdb1` from the `test-vg` group to the `home-vg` (where your `/home` directory resides) 
to gain additional space for your home folder. This can be achieved with just two commands. 
Before proceeding, you need to ensure the Physical Volume (`/dev/sdb1`) is empty. you can do that by moving its data to other drives within the `test-vg` group:

```bash
$ sudo pvmove /dev/sdb1
```

This command will redistribute the sdb1 data to the other volumes of the group. Alternatively you can also pass a destination volume as second parameter. 
So for example to move all the data from `sdb1` to `sdc`:

```bash
$ sudo pvmove /dev/sdb1  /dev/sdc
```

Once that there is no more data in the volume you can simply remove it from the group with:

```bash
$ sudo vgreduce test-vg  /dev/sdb1
```

Once the physical volume does not belong to the group anymore, you can simply follow the step in the previous example to add the `sdb1` PV to the
`home-vg` group and expand the LV and filesystem, or remove the PV entirely if you want.


Logical Volume Manager is a great tool that add a bit of complexity to the disk management but allows great flexibility and scalability in return.

The next time you encounter the question  : 
*Do you want to create Logical Volumes or use standard partitioning?”* during a Linux installation, you'll have a better 
understanding of the implications and what they mean with that 🙂


Hope you learned something... Thanks for reading.

