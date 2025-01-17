---
id: 562
title: 'Hardware-based authentication: Yubikey overview'
date: '2019-05-06T11:20:55+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=562'
permalink: /2019/05/06/hardware-based-authentication-yubikey-overview/
yasr_overall_rating:
    - '0'
yasr_review_type:
    - Product
categories:
    - Technical
tags:
    - 2fa
    - authentication
    - token
    - u2f
    - yubikey
---

In this article series, I am going to explain what is an hardware based authentication and how to configure one of the most famous (the yubikey) to work with your accounts and hold your ssh /gpg keys .

So before we dig into the topic, lets spent few word on the security token itself. Security tokens are great, since they usually boost user authentication security to a completely new level. To compromise and account, is not enough to steal a username and password. You need (in addition) to physically have the hardware token, insert it into a usb port and press a button (or read a code from it). So, when implemented correctly, this system automatically exclude 99.9% or potential attacks from people not physically interacting with you (so you only need to pay attention to your spose/family/friend/coworker 🙂 ). Sounds great right? Indeed it is. this is why banks are now using one time password to verify that is really you!

So, there are many security token around, some of them got famous with the bitcoin bubble like the trezor, other simple code generator using a time based changing code (banks), other more complex and more focused on personal/business usage such as the yubikey. Today I will focus on the yubikey (also because is the most flexible and interesting token)

Yubikey it consist of a small usb device that can be used for multiple purposes such as authentication or encryption. It has many many different features but the documentation literary sucks so this created me a lot of problem (especially when i started to use it several years ago!).. Anyway, I was able to figure it out by myself a lot of the features (I RTFM anyway). So there are many version of the key, and mostly they differ from form factors, the size or RSA key that you can store, NFC technology and so on. I will focus on the yubikey 4 but the info should be quite general (especially because i will be using the common features.)

Before we describe the key, we also need to understand the different interfaces that this keys can have. An interface is the protocol used over the usb port to communicate with the PC. They yubikey has 3 different interfaces (CCID, FIDO, HID), depending of the usage.

CCID stands for (chip card interface device) and is a USB protocol that allows as smartcards to be connected to a pc without the need for each manufacturer of smartcards to provide its own reader or protocol. So when the yubikey is inserted it can behave like a smartcard.

HID is a Human interface Devices, basically used by mouses, keyboard and any other input devices. The yubikey use this protocol (by simulating a keyboard) when sending otp or static key to the pc.

<span class="st">FIDO </span>(Fast IDentity Online) <span class="st">*U2F*</span> is a protocol used for 2 Factor Authentication and it implement the U2F protocol. As the name suggest is used when a 2 factor authentication is used for example in website such as google or bitbucket.

So until now we just presented pure usb protocols and are independent of the yubikey.Now we can start to dig into the the hardware token itself.

So the yubikey can hold multiple applications within the key itself. More in details the yubikey 4 can hold up to 5 applets that are:

1\. OTP . This applet is used for the One Time Password. because there are many ways to do that, the OTP applet has 2 configurable slots to “decide” what version of the OTP implementation you want to use. You can choose between this versions:

- - - Yubico OTP
        - HMAC-SHA1 Challenge-Response
        - Static Password
        - OATH-HOTP

So, by default, the yubikey is configured with the yubico OTP on slot 1 and slot2 empty. You can reconfigure your slot as you wish, but notice that if you remove the yubico OTP from slot 1 and then you decide to reinstall it back, it will change your yubikey code (it will start with vvv instead of ccc ). However this is changes does not affect any of the yubikey functionality. This applet uses the HID interface.

2\. OATH : the yubikey can hold up to 32 authentication credentials. however for using this functionality you need to cable up your api to the yubico authenticator service. So is normally not very used.

3\. U2F: Universal 2 factor authentication is (guess what ? ) used for 2 factor authentication on supported websites such as google, bitbucket, github, etc. the list is quite long. You can use the same yubikey for registering to infinite website. However, from the yubikey itself you do not know in which website it was registered so you need to keep track on which yubikey is registered to which service. This service uses the FIDO protocol.

4\. open PGP(Smart Card) : This applet is the very useful and is implement the smartcard interface to make the yubikey act like a smartcard. It can hold different keys. Also it can generate key directly on the key itself or you can generate it locally and then pass it on the key itself. yubikey 4 can hold RSA up to 4096 bit. We can also use the same applet for SSH authentication. For implementing this CCID interface is used

5\. PIV. This also simulate a smart card but is used as personal identification such as for login to windows or docker signature. Notice that the yubikey NEO and previous version do not implement the PKCS11 and thus cannot be used for docker image signature. Also this applet uses the CCID interface.

This is it for now.. The next article we will actually see how to configure the PGP and how to use the key for ssh purposes.