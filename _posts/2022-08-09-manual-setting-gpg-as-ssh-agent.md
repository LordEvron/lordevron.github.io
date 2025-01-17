---
id: 870
title: 'Manual Setting GPG as SSH agent'
date: '2022-08-09T15:14:42+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=870'
permalink: /2022/08/09/manual-setting-gpg-as-ssh-agent/
yasr_schema_additional_fields:
    - 'a:1:{s:17:"yasr_schema_title";s:0:"";}'
ao_post_optimize:
    - 'a:6:{s:16:"ao_post_optimize";s:2:"on";s:19:"ao_post_js_optimize";s:2:"on";s:20:"ao_post_css_optimize";s:2:"on";s:12:"ao_post_ccss";s:2:"on";s:16:"ao_post_lazyload";s:2:"on";s:15:"ao_post_preload";s:0:"";}'
categories:
    - Technical
tags:
    - gpg
    - linux
    - ssh
---

In this article i will explain how to manual setup your ssh client to use your gpg keys. The reason for doing that is that you may have your GPG keys stored on a yubikey and you want to use those keys as private ssh keys.. If you want to know more about yubikey configuration, you can read my [previ](http://localhost:8080/2019/07/06/hardware-based-authentication-yubikey-configuration/)[o](http://localhost:8080/2019/07/06/hardware-based-authentication-yubikey-configuration/)[us article ](http://localhost:8080/2019/07/06/hardware-based-authentication-yubikey-configuration/)on that

So I am assuming that you have your private GPG key stored on a smart card or on a token such as yubikey. Anyway, the guide should also work if you have your private key directly on kleopatra or any other key-ring.

Before we start i want to clarify the difference between:

1. SSH Daemon (sshd)
2. SSH Client (ssh)
3. SSH Agent

This difference is quite important to understand what is going on.

So the OpenSSH SSH daemon (sshd) is the service listening for **incoming connections**. This daemon normally run only on the server and it reads the configuration file from /etc/*ssh*/sshd\_config . If you have configured ssh access on the server then you are familiar with this file. So for this article we will ignore it, since we are interested to client side configurations.

The OpenSSH SSH Client is the Client that you are (normally) using to connect to the server. This client is basically the “**/usr/bin/ssh”** binary that you use when you type “ssh” in the shell.

The SSH Agent is a helper program that holds the identity key files (private keys) or user passphrases and help you to manage it. By default in most of the linux distro, the default program is called (guess what) “ssh-agent” .

By default, if in your shell you type “ssh-agent”, it will output a series of interesting information, in particular the value of two variables: SSH\_AUTH\_SOCK and SSH\_PID. Those are respectively the path of the Linux Sock used to communicate with other processes and the PID of the running ssh-agent process. One thing to notice is that by running ssh-agent, those variables are not SET. <mark>They are just showing the setting you should have in case you want to use “ssh-agent” as ssh agent</mark>. If you want to see if those variables are set or not you need check your environment variables, for example with “env” commands.

Normally OpenSSH client will run a script in this location –&gt;  **/usr/lib/openssh/agent-launch**. That script check if the SSH\_AUTH\_SOCK variable is set.. if not then it set it to the default ssh-agent socket.

So when we try to authenticate to a server, the OpenSSh Client will read the value of the SSH\_AUTH\_SOCK env variable and use the socket to communicate with the agent.

Usually when you install gpg, it will create a service and autostarts it. The installation process also install a file in this location –&gt; **/usr/lib/systemd/user-environment-generators/xxgpg-agent**. This script check if the gpg-agent is enabled (eg the “enable-ssh-support” flag is present) and if it is, then it set the SSH\_AUTH\_SOCK to the gpg-agent socket. This should happen automatically. By default gpg program does not enable its own ssh-agent. In order to enable it, is enough to run

<div class="wp-block-syntaxhighlighter-code ">```

$ echo enable-ssh-support >> .gnupg/gpg-agent.conf
```

</div>This will add a line to the gnupg configuration file. Restart gpg and its agent will be up and running. You can check that is actually running by typing

<div class="wp-block-syntaxhighlighter-code ">```

$ ps -aux | grep gpg-agent
```

</div>This should be enought, since the systemd generator should set the SSH\_AUTH\_SOCK to its correct gpg-agent path. Make sure of that by checking your env Variables (try to reboot your pc). Everything should work.. if not, continue reading…

If your variable is still not set after this, then you can force it manually.In this case we want to use gpg as ssh agent, so we just need to setup the new value of the SSH\_AUTH\_SOCK variable pointing to the GPG socket! .

So the next step is to find the correct path of this new agent. For doing so we can type:

<div class="wp-block-syntaxhighlighter-code ">```

$ ﻿gpgconf --list-dirs agent-ssh-socket
```

</div>This will print the path of your gpg ssh agent. We can then set that path to the SSH\_AUTH\_SOCK, for example by adding these line at the end of your .bashrc file:

<div class="wp-block-syntaxhighlighter-code ">```

export SSH_AUTH_SOCK=$(gpgconf --list-dirs agent-ssh-socket)
```

</div>Reboot your pc and now you should be able to check your available key with (add the key with “ssh-add” if necessary):

<div class="wp-block-syntaxhighlighter-code ">```

$ ssh-add -L
```

</div>This is it.. if you try to login to a server with your pub key configured, the GPG should use your private key (or prompt you for the physical token if your private key is on a token. )

In case it does not work, here some useful debug list:

1. Make sure your gpg-agent is running with “$ **ps -aux | gpg-agent**”
2. Make sure your SSH\_AUTH\_SOCK is set to the same value of gpg auth socket
3. Make sure you can list your keys with “$ **ssh-add -L”**
4. Make sure your server has the correct public key configured.

If you continue running into problems, try to set the GPG\_AGENT\_INFO=/run/user/1000/gnupg/S.gpg-agent:0:1 env variable to a value similar to the one i pasted. Basically is the same path of the agent, but ending with :0:1 instead of .ssh

And this is it 🙂 I hope this was informative.