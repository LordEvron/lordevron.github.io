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

This is a short article to clarify few things on sockets. I had to do some research to work with those classes, especially when you do some more advance uses. Lets start with some basic.

A socket is defined as an endpoint of a two way communication. The socket used in networking are fully determined by three parameters:

1. Ip Address
2. Port
3. Protocol

Usually servers binds the socket on a port and wait for incoming connections. The clients then try to connect to the server hostname:port and they can start the communication.

Python provides a quite nice and exhaustive socket class that provide all these low level features. However their usage can be a little confusing in the beginning.

Lets start to say that the python socket class mirror the linux socket class. So you can simply create a new socket with `socket.socket()` call. This call accept three main parametes that are socket family, socket type and socket protocol.

The definition are of those possible values are also defined as constants in the class and are two types: AF\_XXXX where define address families and PF\_XXXX which are protocol families. Here a quick overview of the address families:

- **AF\_INET , AF\_INET6, AF\_UNIX** etc, are used when you want to communicate using either TCP or UDP protocols.
- **AF\_PACKET** is used when you want to access the raw data of the network card, for example for implementing your own protocol. In this case you need root permission or **CAP\_NET\_RAW** capabilities to do that. In this case you operate at level 2 of the osi layer.

For the socket type parameters you can chose one between these:

- **SOCK\_STREAM** : is a connection based protocol (connection stays on) where the connection is terminated either when a parties close the connection or when an error occur. *Usually you chose this if you are using TCP protocol*
- **SOCK\_DGRAM** : is a single datagram transmission. You send a datagram and get a response and the connection is closed. *Usually you chose this if you are using UDP protocol.*
- **SOCK\_RAW**: when you need to get the raw packets including the link level header (but not the physical layer header that is removed). This operate in a lower level then the previous two, where the link headers are removed.
- **SOCK\_RDM, SOCK\_SEQPACKET** : They are not really used.

For the protocol parameter, you can usually omit it if you are working with standard TCP or UDP, otherwise you can define the one you are using for example **IPPROTO\_IP** .

Just keep in mind that if you use **AF\_PACKET** then you need to bind to a interface (eg. wlan0) rather than an ip because you are operating at level 2 of osi. Also you cannot neighter use the sent\_to() function since it requires a destination address (you can simply use the send() function that normally is used for established connections.).

As last i want to mentions a couple of things regarding the methods connect() and bind(). It can be a little confusing to define when to use bind() and when connect(). Usually you call bind() on the server side and connect() in the client side but is not mandatory. The difference betewen the two is that bind() it start listening to the given port, while connect() it is used to start a new connection toward the other side. If for example you have two client that randomly start transmitting to each other using UDP, then you need to call bind() to both of them and call connect() when you want to transmit. On the other hand if the communication is always on, then you could for example chose one to listen and one to connect and then reuse the same connection over and over.

Just a final remark, that the socket connection are bidirectional, so on the same socket you can transmit and receive at the same time. Also you can set up advanced options such as TTL with the call `setsockopt()`

I hope that this was informative. Working with lower level socket takes much more knowledge and skill than using higher level libraries.. So congratulation to be in the elite team 🙂