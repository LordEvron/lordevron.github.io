---
id: 562
title: 'Hardware-based authentication: Yubikey overview'
date: '2019-05-06T11:20:55+01:00'
author: Lord_evron
layout: post
permalink: /2019/05/06/hardware-based-authentication-yubikey-overview/
categories:
    - Technical
tags:
    - technology
    - hardware
    - yubikey
---

This article series will explain hardware-based authentication and how to configure a YubiKey (a popular security token) 
to secure your accounts and manage your SSH/GPG keys.


Security tokens significantly enhance user authentication.  Compromising an account requires not just a username and password,
but also physical possession of the hardware token, which must be inserted and activated (button press, code reading).  
When implemented correctly, this virtually eliminates remote attacks, leaving only physical access as a potential vulnerability. 
This is why banks use one-time passwords.
Many security tokens exist, from those popularized by the Bitcoin boom (like Trezor) to simple time-based code generators (used by banks) 
and more complex tokens like the YubiKey. This series focuses on the YubiKey due to its flexibility.


A YubiKey is a small USB device with multiple uses, including authentication and encryption. It has many features, 
but its documentation can be challenging.  (I did read the manual, though!).  YubiKeys come in various versions, differing in form factor, 
key storage capacity, NFC support, etc.  We'll focus on the YubiKey 4, but the information should be generally applicable.
YubiKeys use different USB interfaces (protocols) depending on the function:

- CCID (Chip Card Interface Device): Allows the YubiKey to act like a smart card, using a standard protocol.
- HID (Human Interface Device): Used for input devices like mice and keyboards. The YubiKey uses this (simulating a keyboard) to send OTPs or static passwords.
- FIDO (Fast IDentity Online) U2F: Used for two-factor authentication on websites (Google, Bitbucket, etc.).

Now, let's dive into the YubiKey's applications:

- OTP (One-Time Password): The YubiKey has two configurable slots for different OTP implementations:
    - Yubico OTP 
    - HMAC-SHA1 Challenge-Response
    - Static Password
    - OATH-HOTP

    By default, Slot 1 is configured with Yubico OTP, and Slot 2 is empty. Reconfiguring slots can change the YubiKey's internal code (e.g., from "ccc" to "vvv"), but this doesn't affect functionality. This applet uses the HID interface.

- OATH:  The YubiKey can store up to 32 OATH credentials. This usually requires integration with the Yubico Authenticator service and is less commonly used.
- U2F: Used for two-factor authentication on supported websites.  The same YubiKey can be registered with numerous sites.  
However, the YubiKey itself doesn't indicate which sites it's registered with. This uses the FIDO protocol.
- OpenPGP (Smart Card):  This is very useful.  It implements the smart card interface, allowing the YubiKey to act as a smart card. 
It can store multiple keys and generate keys directly on the device (or import externally generated keys).  The YubiKey 4 supports RSA keys up to 4096 bits. This applet is also used for SSH authentication. It uses the CCID interface.
- PIV: Simulates a smart card for personal identification (Windows login, Docker signatures).  Older YubiKeys (NEO and earlier) don't implement PKCS#11 
and can't be used for Docker image signing. This also uses the CCID interface.

This concludes the overview of YubiKey features. The next article will cover configuring the OpenPGP applet and using the key for SSH.

