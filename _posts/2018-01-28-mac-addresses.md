---
id: 188
title: 'MAC addresses'
date: '2018-01-28T19:00:39+01:00'
author: Lord_evron
layout: post
guid: 'http://presspi/?p=188'
permalink: /2018/01/28/mac-addresses/
categories:
    - Technical
tags:
    - code
    - mac
    - python
---

When working with Gateways, RPI (but also normal PCs), I often have the need to use a unique identifier of the device… The reason can be anything: for logging purposes to automatic authentication, to send “I Am Alive” messages to keep track of which devices are working properly.

So, it is nice to have a unique id which is more or less reliable: The mac address. Today I want to show 2 usefully snippets condensed in the same code. The first one is simply a function that return your mac address as standard format “xx:xx:xx:xx:xx:xx”. The second snippet is to “count” from 00 to FF.

I combined the two by making a small script that take your mac (eg “11:22:33:44:55:66”) and then generate 256 combination by substituting the last two values from 00 to FF (eg: “11:22:33:44:55:00”, “11:22:33:44:55:01”, “11:22:33:44:55:02″… “11:22:33:44:55:FF”)

Here is the code..Part as been re-adapted from a stack overflow answer.  
I used range() instead of xrange() for keeping compatibility between python2 and python3.

<div class="wp-block-syntaxhighlighter-code ">```

#we need to import a library
from uuid import getnode as get_mac #library for returning mac address

#return a HEX version (standard format) of the MAC address
def mymac():
    mac= ':'.join('%02X' % ((get_mac() >> 8*i) & 0xff) for i in reversed(range(6)))
    return mac


#Generate and print 256 mac address starting from your own MAC and substituting the last two values from 00 to FF
def generate():
    basemac=mymac()[:-2]
    for i in range(256):
        print (basemac + hex(i)[2:].zfill(2).upper())


if __name__ == "__main__":
    generate()


```

</div>