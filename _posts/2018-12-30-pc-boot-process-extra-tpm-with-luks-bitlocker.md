---
id: 528
title: 'PC boot process – Extra: TPM with Luks / Bitlocker'
date: '2018-12-30T19:37:11+01:00'
author: Lord_evron
layout: post
permalink: /2018/12/30/pc-boot-process-extra-tpm-with-luks-bitlocker/
categories:
    - Technical
tags:
    - technology
    - boot
    - linux
    - tpm
    - uefi
---

This article extends the previous discussion on the boot process, covering technologies like BitLocker, LUKS, and TPM (Trusted Platform Module),
which, while not strictly required, are often used, especially for encryption.
Windows 8/10 Pro offers full-disk encryption with BitLocker, while Linux provides LUKS with similar functionality. 
LUKS encrypts data using a master key, which is itself encrypted with a user-provided passphrase. 
This allows multiple passphrases to unlock the same drive (LUKS supports up to 7). BitLocker, without a TPM, works similarly, 
encrypting the master key with a PIN.


However, BitLocker's most interesting use case involves the TPM. 
The TPM is a physical chip found on many high-end PCs.  It can store secrets and release them only under specific conditions. 
We'll focus on its "integrity verification" and secret storage capabilities, as used by BitLocker (and sometimes LUKS). 
The TPM has two modes: SRTM (Static Root of Trust for Measurements) and DRTM (Dynamic Root of Trust for Measurements). We'll concentrate on SRTM.

When your PC starts, the UEFI code executes, followed by the bootloader and then the OS. 
But how can you be sure that this chain of events hasn't been tampered with? The TPM addresses this by measuring each step. 
The TPM has Platform Configuration Registers (PCRs), which store these measurements. 
However, measurements aren't simply overwritten; they are extended using a cryptographic hash function:

`new_value = Hash(old_value || new_measurement)`

This prevents forging a specific PCR state.

When a TPM-equipped system starts, a small, immutable code called the Core Root of Trust for Measurements (CRTM) executes. 
This code (part of the UEFI or in a dedicated chip) does the following:

- Resets the PCRs to a known state.
- Measures the UEFI code.
- Extends the PCR0 value with the UEFI measurement.

Then, control is passed to the UEFI. The UEFI continues the boot process, performing POSTs and hardware checks, 
adding measurements to PCRs 0-7 at each step. Before launching the bootloader, it measures the bootloader and stores the measurement in a PCR. 
The bootloader can also perform measurements and store them in PCRs.
The TPM helps maintain a measurable system state that cannot be easily forged. It's important to distinguish between Secure Boot and TPM. 
They are related but separate.
Secure Boot is about verifying the signature of the boot code, while TPM is about measuring the integrity of the boot process. 
Also, note that the TPM stores measurements; it doesn't perform them.
The TPM offers two key functions:

- Seal: Store a key.
- Unseal: Retrieve a key (only if the PCRs are in the same state as when the key was sealed).

BitLocker uses the "Seal" function of the tpm to store the encryption key on the TPM during initial setup. 
At each subsequent boot, it uses "Unseal" to retrieve the key. The TPM only releases the key if the PCR state matches 
the state when the key was sealed. It's as if the TPM stores the PCR values along with the key.


With BitLocker and a TPM, the key is automatically unsealed at boot (transparent encryption) if the PCR values match. 
However, it's recommended to also use a password, which is requested before the TPM is asked to unseal the key.

LUKS can also be configured to use the TPM, though it's more complex.

If, for example, you modify the kernel command line (`init=/bin/sh`), the PCR values will change, and the TPM won't release the key. 
This also happens if you update the BIOS or make other configuration changes that affect the measurements. 
BitLocker will then require the recovery key.

For example, in a dual-boot system, booting Windows directly from the UEFI menu works fine (correct PCR values). 
However, booting Windows through GRUB (chain-loading) will likely result in different PCR values, preventing the TPM 
from releasing the key and requiring the BitLocker recovery key.

Finally, a word about the TPM modes. The scenario described here uses SRTM, where measurements are sequential and predictable. 
DRTM is used for measuring the system after it has started (within the OS), which is more complex due to dynamic loading of libraries and modules. 
DRTM is a more advanced topic.

This topic is complex, but hopefully, this explanation was helpful.

