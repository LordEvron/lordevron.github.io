---
id: 568
title: 'Hardware-based authentication: Yubikey configuration'
date: '2019-07-06T21:07:18+01:00'
author: Lord_evron
layout: post
permalink: /2019/07/06/hardware-based-authentication-yubikey-configuration/
categories:
    - Technical
tags:
    - technology
    - hardware
    - yubikey
---

In [the last article](/2019/05/06/hardware-based-authentication-yubikey-overview/) I gave a quick overview of the hardware tokens and the yubikey. 
Today we will go more in details, and we will see how to set and use GPG keys on the yubikey. 
Basically, this guide will show how to create the GPG KEYS on your pc and then move it to yubikey…Some of the information i got it from some forums. 
I tested those commands multiple times so they should work fine. Leave a comment if you run into problems.


Before you start, notice there is an easier way to generate the key directly on the yubikey, but this will give in my opinion two disadvantages:
1. I do not trust the yubikey applet to generate random keys. better to use the one from a linux distro.
2.  You cannot backup the key, so if you generate onboard, and you destroy the key there is not copy of the key (it can also be seen as an advantage)

In this post, I will also show how to export the SSH pub key out of the GPG certificate.
So Before you start, you will need the gpg package installed. If you use windows use, install “gpg4win” software. During the installation, select also kleopatra, that is a KeyRing holder for your keys and certificates.
Final note before we start: some key backup are redundant, feel free skip it.


TO CREATE A GPG KEY:  
1. Generate master key with:

```bash
$gpg2 --gen-key
```

Choose RSA sign only and fill up the size (4096), name, email and comments… chose if to use a passphrase or not.. validity I use 5 years..  
2. MAKE A BACKUP OF THE MASTER KEY... I called it `master_only.asc` you can do that from “kleopatra” interface

3. create a revocation certificate (adjust path)

```bash
$gpg --output PATH/revocation-certificate.txt --gen-revoke 2A5B4888
```

as reason, you can put *“key as been compromised”* and comment something like: *“Created during key creation, emergency use only.*” 
This certificate is useful in case that someone steal your master key and start to use for signing your documents impersonating you. 
Then you can upload the revocation certificate to a server and this will inform all the users connected to the gpg servers that key is invalid.

4. Print that certificate in paper and store it in a safe.

5. Let's start to create subkeys: Subkeys are key that are child of the master key. Usually the master key is too powerful. So is good practice to have a separation of key powers. So we will have one subkey for encrypting, one for certification, and one for signing.

```bash
$gpg --expert --edit-key 2A5B4888
$addkey
```

ADD 3 keys... one only for RSA signing (option 4), one for only encrypting (option 6) and one for only certification ( option 8… set your own capability)– all the key are 4096 and 5 years expiring date
At the end you can write save and exit from the edit-key menu….

```bash
$save
```

6. now you should be able to see all your key and secret key with:

```bash
$gpg --list-key
$gpg --list-secret-key
```

At this point all the key are on your local pc. The keywords **sec** and **ssb** means the main key and the subkeys are available locally. 
If the keyring contained only stubs for the private keys (meaning that the key are not present locally but are just a link to the card), 
it would be shown as **sec** and **sec#** or **pub.**

7. MAKE A BACKUP OF ALL THE KEY.. use kleopatra for this as in point 2…i called it `with_subkey.asc`

8. CONFIGURE THE YUBIKEY : this next steps will set up a pin code to your yubikey

```bash
$gpg --card-edit
$gpg/card>admin
$gpg/card>passwd
```

change the pin and the master pin according with your need. Also change the other info in the card.

```bash
$gpg/card> name
$gpg/card> lang
$gpg/card> url
$gpg/card> sex
$quit
```

9. EXPORT CERTIFICATE (backup) from kleopatra “certificate.asc”

10. At this point, we need to move the subkeys to the card. We will not move the master key, but only the three subkeys. 
this is a good practice, because we can use the master key to revoke the existent subkeys, or generate new subkeys in case we need it. 
Please substitute the correct key id in the following commands.

```bash
$gpg --edit-key 1B2C4417
$gpg> toggle
$gpg> key 1
```

this will select the *key 1*… you will see a star near the selected key like this

*sec 3744R/1B2C4417created: 2014-06-18 expires: 2014-09-26*  
*ssb**\*** 2048R/72C5235B created: 2014-06-18 expires: never*   
*ssb 2048R/A21E44F2 created: 2014-06-18 expires: never*

```bash
gpg> keytocard
gpg> key 1  # we need to deselect the key 1 before we select key 2
gpg> key 2
gpg> keytocard
gpg> key 2
gpg> key 3
gpg> keytocard
gpg> save
```

Now the subkeys are in the card and not present on your pc anymore. if you type:

```bash
$gpg --list-key
$gpg --list-secret-key
```

you will see that now the keys contains only stubs as explained in point 6.

11. EXPORT AGAIN the cerificate “certificate\_stub.asc” now, this will contain only the link to the key and not the private keys. to be sure delete all the certificates from kleopatra and reimport “certificate\_stub.asc”. If you try to encrypt something, it will ask for the key.

12. when you import the public keys (certificate\_stub.asc), klepatra does not know where your private key is stored (because is not in the certificate itself.). In order to inform kleopatra that the key is on your yubikey, insert the yubikey into the usb and type:

```bash
$gpg --card-status
```

This will print info of the card (yubikey) and inform kleopatra that the private key is available on the hardware.

Done… Now you can start using the yubikey for encrypting and decrypting emails and files.

## ——– Export SSH pub key from GPG certificate ——–

You can export the key from kleopatra Ui. Navtigate to the your Key, click details and on the authentication subkey you will see the export ssh key. 
Alternatively, to export SSH key with terminal you can use the –export-ssh-key functions directly from gpg command line... 
Firstly take note of the authentication key id 

```bash
$gpg2 --list-key
```

Then you can just generate the ssh public key with the following command:

```bash
$gpg2 --export-ssh-key 23YOURKEYID343
```

Now you have also the ssh.pub file that contains your public ssh key.

Next step, if you are under windows you need to configure putty

## ———-putty ssh configuration on Windows——–

0. Install putty if you do not have it.

1. Create gpg-agent.conf file in this location

**%APPDATA%\\gnupg\\gpg-agent.conf**

2. Add this line with NO quotes:

`enable-putty-support`

3. restart gpg-agent

```bash
gpg-connect-agent killagent /bye
gpg-connect-agent /bye
```

4. Add A ENV variable called: `GIT_SSH`
5. Make it link to the plink → `C:\\Program Files\\PuTTY\\plink.exe`

## ———-Final note for windows users: Solve problems——–

Often under windows, your yubikey is not recognized. To simply check that type `$gpg –card-status` . You should always see the card information. 
If you see that, it means that gpg can read the key properly and thus the problem is somewhere else for example in the putty configuration. 
If `$gpg –card-status` shows “no card available”, then the problem is that windows/gpg cannot read the card, so is not a putty problem. This is easily fixed by resetting the gpg daemons with:

```
$gpg-connect-agent killagent /bye
$gpg-connect-agent /bye
```

I have it in a script so i just need to launch when i run into problems.

So that is it, i hope that was useful.