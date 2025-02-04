---
id: 870
title: 'Manual Setting GPG as SSH agent'
date: '2022-08-09T15:14:42+01:00'
author: Lord_evron
layout: post
permalink: /2022/08/09/manual-setting-gpg-as-ssh-agent/
categories:
    - Technical
tags:
    - technical
    - linux
    - ssh
---

In this article i will explain the manual configuration of your SSH client to utilize your GPG keys for authentication. 
This is particularly useful if your GPG keys are stored on a hardware device like a YubiKey.


For detailed instructions on YubiKey configuration, please refer to my previous article on [hardware-based authentication](/2019/07/06/hardware-based-authentication-yubikey-configuration/)

This guide assumes that your private GPG key is stored on a secure device, such as a smart card or a YubiKey. 
However, the instructions should also be applicable if your private key is stored directly within a key management application like Kleopatra or a similar keyring.

Before proceeding, it's crucial to understand the distinction between the following:

1. **SSH Daemon** (sshd): The server-side software responsible for handling SSH connections.
2. **SSH Client** (ssh): The client-side software used to initiate SSH connections
3. **SSH Agent**: A background process that securely stores and manages SSH private keys, reducing the need to repeatedly enter your passphrase.

This difference is quite important to understand what is going on.

The **OpenSSH SSH daemon** (sshd) is the server-side component responsible for accepting incoming SSH connections. 
It typically runs exclusively on the server machine and retrieves its configuration settings from the `/etc/ssh/sshd_config` file. 
If you have previously configured SSH server access, you are likely familiar with this file. 
However, for the purposes of this article, we will focus only on client-side configurations and therefore disregard the server-side configuration.


The **OpenSSH SSH Client** is the software you typically use to connect to remote servers via the SSH protocol. 
This client is typically the `/usr/bin/ssh` executable, which you invoke by typing "ssh" in your terminal.


The **SSH Agent** is a helper application that securely stores and manages your SSH private keys and their associated passphrases. 
This eliminates the need to repeatedly enter your passphrase for each SSH connection. In most Linux distributions, 
the default SSH Agent is named (guess what?) `ssh-agent`.

By default, when you execute `ssh-agent` in your shell, it outputs a series of commands. These commands, primarily focused on 
setting two crucial environment variables, are designed to facilitate interaction with the ssh-agent process:

- SSH_AUTH_SOCK: This environment variable specifies the path to the Unix domain socket used for communication between your shell and the running ssh-agent process.
- SSH_AGENT_PID: This variable stores the process ID (PID) of the running ssh-agent process.

***Important Note***: Executing ssh-agent itself does not automatically set these environment variables. It simply displays 
the commands required to set them. To actually utilize the ssh-agent, you must execute the displayed commands within your shell.

To verify if these environment variables are currently set, you can use the `env` command to list your current environment variables.

The OpenSSH client typically utilizes a helper script located at `/usr/lib/openssh/agent-launch`. 
This script first checks if the `SSH_AUTH_SOCK` environment variable is already defined. If not, it proceeds to start a new instance of 
the ssh-agent process and sets the `SSH_AUTH_SOCK` environment variable to the path of the newly created default socket.
Subsequently, when attempting to authenticate with a remote server, the OpenSSH client reads the value of the `SSH_AUTH_SOCK` environment variable. 
This information allows the client to establish a communication channel with the running SSH Agent via the specified socket

During a typical GPG installation, a system service is created and automatically started. 
Concurrently, a script named `gpg-agent` is installed in the `/usr/lib/systemd/user-environment-generators/xxgpg-agent` directory. 
This script checks for the `enable-ssh-support` flag within the GPG agent's configuration. 
If this flag is enabled, the script automatically sets the `SSH_AUTH_SOCK` environment variable to point to the GPG agent's communication socket.

By default, the GPG program does not have SSH agent support enabled. To enable this functionality, execute the following command:

```bash
$ echo enable-ssh-support >> .gnupg/gpg-agent.conf
```

This will add a line to the gnupg configuration file. Restart gpg and its agent will be up and running. You can check that is actually running by typing

```bash
$ ps -aux | grep gpg-agent
```

This configuration should be sufficient, as the systemd generator should automatically set the `SSH_AUTH_SOCK` environment variable to the correct path 
of the GPG Agent socket.
To verify this, check your current environment variables using the `env` command. You may need to reboot your system for the changes to take effect fully.
If the `SSH_AUTH_SOCK` variable is still not set correctly after rebooting, you can manually set it. Since we intend to utilize GPG as the 
SSH Agent, we need to determine the correct path to the GPG Agent socket.
To obtain this path, execute the following command:


```bash
$ gpgconf --list-dirs agent-ssh-socket
```
This command will display the path to your GPG SSH Agent socket. To utilize this path, you can add the following lines to your .bashrc file:

```bash
export SSH_AUTH_SOCK=$(gpgconf --list-dirs agent-ssh-socket)
export SSH_AGENT_PID=$(ps aux | grep gpg-agent | awk '{print $2}')
```
These lines will set the SSH_AUTH_SOCK environment variable to the path of the GPG Agent socket and the SSH_AGENT_PID 
environment variable to the process ID (PID) of the running GPG Agent process.

With these configurations in place, you should now be able to successfully authenticate to remote servers using your GPG keys. 
If your private key is stored on a hardware token (like a YubiKey), you will be prompted to insert and touch the token during the authentication process.

In case it does not work, here some useful debug list:

1. Make sure your gpg-agent is running with `$ **ps -aux | gpg-agent**`
2. Make sure your `SSH_AUTH_SOCK` is set to the same value of gpg auth socket
3. Make sure your server has the correct public key configured.

If you continue running into problems, try to set the env variable to this `GPG_AGENT_INFO=/run/user/1000/gnupg/S.gpg-agent:0:1` . 
Basically is the same path of the agent, but ending with `:0:1` instead of `.ssh`. Also make sure you replace 1000 with your <user_id> if different.


And this is it 🙂 I hope this was informative.