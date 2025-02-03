---
id: 838
title: 'Whatsapp vs Signal vs Telegram'
date: '2021-02-04T17:46:43+01:00'
author: Lord_evron
layout: post
permalink: /2021/02/04/whatsapp-vs-signal-vs-telegram/
categories:
    - Technical
tags:
    - security
    - signal
    - 'telegram messaging'
    - whatsapp
---

WhatsApp's recent privacy policy changes have spurred a mass migration to platforms like Signal and Telegram. 
But are these alternatives truly better? This article examines the strengths and weaknesses of each from a privacy perspective.

Let's define three key concepts (simplified for clarity):

- Open Source: Open-source code is publicly available, allowing anyone to read and understand its functionality.
- End-to-End Encryption (E2EE): E2EE ensures that only the sender and recipient can decrypt messages. No intermediary, including servers, can read them.
- Encryption Protocols: These define the data encryption methods. Some are more secure than others.

These three apps differ in these areas:

# WhatsApp

WhatsApp, owned by Facebook, is closed source.  This means its inner workings are opaque.  We must rely on their claims 
and documentation, which, in security, is problematic. They claim all messages are E2EE by default, using the Signal Protocol 
(an open-source protocol developed by Open Whisper Systems).

# Telegram

Telegram, owned by a Russian for-profit company, is "kind of" open source. The app is open source, but the server-side code 
is proprietary.  Regular chats are not E2EE by default; encryption keys are stored on their servers. 
E2EE is only available in "Secret Chats." They use a custom-built encryption protocol, which is generally discouraged in 
security best practices.

# Signal

Signal is fully open source, both server and client-side. Developed by the non-profit Signal Foundation 
(formerly Open Whisper Systems), it uses the Signal Protocol (which they also developed).
Chats are always E2EE, with an option for auto-deleting messages.

# Comparison

WhatsApp's closed source nature makes it impossible to verify their claims about security. Trust is a significant vulnerability. 
Signal's open-source code has been audited, establishing greater trust. Telegram falls in between, with an open-source app but closed-source servers.

Regarding E2EE, WhatsApp claims to use it, Signal definitely does, and Telegram offers it optionally. 
Telegram's default lack of E2EE means they potentially have access to conversations.

For encryption, WhatsApp (supposedly) uses the well-regarded Signal Protocol, while Telegram uses a custom protocol. 
Custom protocols are generally viewed with suspicion in the security community.

The choice boils down to:

- WhatsApp: Claims to be secure (but offers no proof).
- Telegram: Implements security in a questionable way.
- Signal: Proven to meet basic security requirements.

# Metadata and Phone Numbers

E2EE only protects message content, not metadata. Metadata includes message size, timestamps, frequency of communication, 
and contact information. This data can reveal a lot.
Requiring a phone number for registration is another privacy concern. 
It links metadata to your real-world identity.  Ideally, registration wouldn't require a phone number.

In conclusion, switching to Signal is advisable for private conversations. 
Telegram's "Secret Chats" are an alternative.  Despite some shortcomings, Telegram's features like bots, supergroups, 
and channels make it a worthwhile app to have.

I hope you learned something new.. Happy texting!

