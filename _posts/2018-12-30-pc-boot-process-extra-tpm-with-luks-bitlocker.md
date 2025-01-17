---
id: 528
title: 'PC boot process – Extra: TPM with Luks / Bitlocker'
date: '2018-12-30T19:37:11+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=528'
permalink: /2018/12/30/pc-boot-process-extra-tpm-with-luks-bitlocker/
categories:
    - Technical
tags:
    - bitlocker
    - boot
    - luks
    - tpm
    - uefi
---

In this quick article I want to extend the previous article on booting process and discuss few missing technologies that can play some role in the startup process. Those are not strictly required to your PC to work, but you may are already using them for example if you enabled encryption.

If you have windows 8-10 Pro, you can enable a full disk encryption with a software called Bitlocker. Similarly if you are under linux, there is Luks, that provide similar features. So when you encrypt data using for example Luks , it generates a (hopefully) random key that is used to encrypt your data. Ideally your should remember this 64 random alfanumeric string and insert it at each reboot. However, because we are not good at remembering stuffs, what Luks does it to encrypt this Master key with a passphrase. So when in Luks you insert you password to unlock your drive, what is actually happening is that you are using your passphrase to unlock the master key used to decrypt the drive. By doing this, you can have multiple passphrases encrypting the same master key. LUKS provide you with 7 slots, meaning that you can have up to 7 passwords for unlocking the same drive. And bitlocker? Bitlocker is a little different. For system that they do not have a TPM, you must enable it from the windows policies to use Bitlocker without a TPM. Then it behave similar to LUKS by encrypting the master password with your Pin.

However we are interested to know what happen when bitlocker is used together with TPM. Indeed, among the other things TPM is able to store secrets and release them afterward only if certain conditions are met. But lets see in details what the TPM is.

The Trusted Platform Module (TPM) is a physical chip that is in general present on the high end PCs. For a full explanation of all its features, we would need to write a full book, however, in this article I will keep it simple and focus mostly on the “integrity verification” and the storage of secrets as used by bitolocker (and sometimes Luks). Also The TPM chip has “two working mode”:

1. SRTM (Static Root of Trust for Measurements) and
2. DRTM (Dynamic Root of Trust for Measurements).

Again, to make stuff simple, i will only discuss the SRTM, briefly mentioning the DRTM at the end.

So when your pc start, the UEFI code get executed and then your bootloader get executed and finally your OS get launched.. But are you sure that this chain of event is the same as last time? Are you sure that nothing has been tampered in between between different reboots (a virus maybe)? This is what the TPM try to solve and it does it in quite smart way: by measuring it. Indeed, one of the key components of the TPM are the <span class="st">Platform Configuration *Registers*</span> (PCR). PCR are a set of 24 registers can hold measurements that are sent to them. Users can also retrieve those measurement back when requested. So we can simply ask the TPM to store a measurement and it will store it in a PCR. However here is the catch: This measurement it does not overwrite the old one… but it “extend” its value with the new one.. How? with this formula

`new_value = Hash(old_value || new_measurement)`

In this way, we cannot just to forge a state because if we want that a PCR hold a value “ffff” we cannot just push the “ffff” to it because that value will get combined and get hashed with the old value and thus the new value would be some something completely different. Basically the TPM has some registers and those registers can contain values. Every time we store a new value, what we actually do is to extend the old value with the new value, so we cannot just set the PCR to arbitrary values.. Now that we know that we can start to see what happen when we boot the system with a TPM.

So when a system with a TPM is started, an ***immutable*** tiny code is executed. This code can be part of the UEFI code itself (Bios Boot Block) or stored it in a dedicated chip. This code is called Core Root of Trust for Measurements (CRTM) and the scope of this code is mainly to :

1\. Reset the PCR values to a know state  
2\. Measure the UEFI code  
3\. store (extend) the value measured in 2. into the PCR-0 register.

Once done that it load and pass the control to the Uefi. Here the Uefi code continue the booting process, by doing POSTS, checking hardware, etc, and at each step add more measurement to the TPM that get stored in the PCR 0 to PCR-7. Notice that there is no limit on how many measurement you can do, since, the value get extended every time. The process continue, and before launching the Bootloader, it measures it and store the value in a PCR. Then the bootloader gets control and thus can continue making measurement and storing it into the PCRs.

So the TPM help the system to be in measurable state, that cannot be forged or faked. It is important to notice that the TPM does not do any measurement… it just store the one that it gets and return it when asked for it.

So among the other features, the TPM provide two interesting functions:

1. Seal -&gt; store a key.
2. Unseal -&gt; retrieve the key. The key is only released if the PCR are in the same state as 1

So the “Seal” Function is used for storing a secret. In this case, when bitlocker is enabled the fist time, it “seal” the key on the TPM.  
At next reboot, when bitlocker is enabled it will call the “Unseal” function on the TPM to retrieve the Master password to decrypt your system. ***However, the TPM release the password ONLY if the state of its PCR is the same of when the key was SEALED.*** .You can think it like the TPM store the PCR value together with the key during the seal function. When unsealing it, it compare the current PCR value with the stored one and it only releases it if they are the same… (however keep in mind that in reality the old PCR value does not really get stored anywhere).

So when you enable bitlocker, it seal your key. At the next reboot, since nothing as changed, the key is automatically unsealed and the drive is automatically decrypted without that the user insert any password. This is what is known as transparent encryption. However, from the window policies, it is possible (and you should) add a password together with TPM. In this case, the password is asked before bitlocker ask the TPM to unseal the password.

For LUKS, is not straight forward but it should be possible (I saw several guides) to make it using the TPM too (I never tried that), and make it behave like bitlocker.

So what happen if for instance i add `init=/bin/sh` to kernel command at startup? Simply the Value of PCR will not be the same anymore and thus, the TPM will not release the key!

This happen also if you upgrade your BIOS, or change anything in the configuration that will alter a PCR measurement in the chain. So for Bitlocker, what it will happen is that you will need to insert your recovery key.  
So a practical example, i have a double boot system. if i start the windows bootloader directly from uefi menu, it just start fine (PCR with the correct value). However, if i launch windows bootloader from the GRUB menu (chain-loader) then the PCR are not in the same state of when i encrypted my hard drive and thus, the TPM will not release the key, forcing me to insert the long bitlocker recovery key at each reboot.

Last few word about the two mode of TPM. in this case, the tpm is working as SRTM . The reason is that each step is sequential and predictable, and thus the masurements will be appended one after the other one. Also changes at uefi level or bootloader lever are very seldom. However, TPM also include some way to measure a system after that has started (inside the OS itself). Here it requires a completely different approach, because libraries, module etc get updated frequently. Also the starting order may not be always the same, some programs being randomly faster on some boot ending up getting appended to the PCR before others and thus messing up all the chain. DRMT is a proposed way to overcoming this problems. However is a topic that i am not very familiar with, nor is very popular, so i will leave it here for now.

I know was a little messy topic, but i hope that was still useful.