---
id: 849
title: 'Socket Families'
date: '2021-05-27T16:47:59+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=849'
permalink: /2021/05/27/socket-families/
categories:
    - Technical
tags:
    - programming
    - python
    - socket
---

This article clarifies some aspects of sockets in Python, a topic that can be confusing, 
especially for advanced use cases. Let's start with the basics.
A socket is an endpoint for two-way communication. Network sockets are defined by three parameters:

1. IP Address 
2. Port
3. Protocol

Servers typically bind a socket to a port and listen for incoming connections. 
Clients then connect to the server's hostname:port to initiate communication.

Python's socket class provides access to these low-level features, but its usage can be initially confusing.

The Python socket class mirrors the Linux socket class. You create a new socket using `socket.socket()`, 
which accepts three main parameters: socket family, socket type, and socket protocol.

Possible values for these parameters are defined as constants in the class, categorized as `AF_XXXX` (address families) and `PF_XXXX` (protocol families). 
Here's a quick overview of address families:

- `AF_INET`, `AF_INET6`, `AF_UNIX`: Used for communication over TCP or UDP.
- `AF_PACKET`: Used for accessing raw network card data (e.g., for custom protocol implementation). Requires root privileges or `CAP_NET_RAW` capabilities and operates at OSI layer 2.

Socket type parameters include:

- `SOCK_STREAM`: Connection-based protocol (connection persists) that terminates when either party closes it or an error occurs. Typically used with TCP.
- `SOCK_DGRAM`: Single datagram transmission. A datagram is sent, a response is received, and the connection closes. Typically used with UDP.
- `SOCK_RAW`: Accesses raw packets, including the link-level header (but not the physical layer header). Operates at a lower level than `SOCK_STREAM` and `SOCK_DGRAM`.
- `SOCK_RDM`, `SOCK_SEQPACKET`: Less commonly used.

The protocol parameter can usually be omitted for standard TCP or UDP. Otherwise, you can specify the protocol (e.g., `IPPROTO_IP`).

If you use `AF_PACKET`, you bind to an interface (e.g., wlan0) rather than an IP address, as you're operating at OSI layer 2. 
You also can't use `sendto()` (which requires a destination address); use `send()` instead.

Regarding `connect()` and `bind()`, it can be confusing to know when to use each. `bind()` is usually called on the server side, 
and `connect()` on the client side, but this is not mandatory. `bind()` starts listening on a port, while `connect()` initiates a connection to the other party. 
For example, if two clients are randomly sending UDP datagrams to each other, both need to call `bind()` and then `connect()` when they want to transmit. 
In persistent communication scenarios, one side can listen (`bind()`) and the other connect (`connect()`), and then reuse that connection.


Socket connections are bidirectional, allowing simultaneous transmission and reception. Advanced options like TTL can be set using `setsockopt()`.

Working with lower-level sockets requires more knowledge and skill than using higher-level libraries. 
So congratulation to be in the elite team 🙂 

