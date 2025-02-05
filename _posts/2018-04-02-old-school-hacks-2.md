---
id: 326
title: 'Old School Hacks/2'
date: '2018-04-02T22:48:44+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=326'
permalink: /2018/04/02/old-school-hacks-2/
categories:
    - Technical
tags:
    - technology
    - hardware
---

My previous post detailed a simple floppy disk hack. Now, I'll showcase a more intricate device I built. But first, a bit of context...

In the late 90s, while Walkmans were still common, portable CD players were gaining traction. 
I owned a Sony CD player with 10-second anti-shock (Electronic Skip Protection, a data buffer that prevented audio skipping during movement). 
It was great for listening to CDs while walking or in the car.  However, I wanted to play my CDs through the car speakers, not just headphones. 
My father's car only had a basic cassette player, no aux input, not even auto-reverse!
Car CD players were expensive, beyond my budget.  But I was determined to listen to my CDs through the car's speakers.  How?
The solution involved repurposing a component from a Walkman. The Walkman had a small head that read the magnetic 
field on the cassette tape (circled in red in the image).

<div style="width: 100%; max-width: 500px; margin: 2rem auto; padding: 0 10px; box-sizing: border-box;">
  <img src="{{ site.baseurl }}/assets/images/2018/04/walkman.jpg" 
       alt="Walkman" 
       style="width: 100%; height: auto; display: block;">
  <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
    Modified Walkman
  </div>
</div>


That component is a magnetic transducer, and it converts a magnetic field into an electrical signal. 
Crucially, it's bidirectional: feed it a small electrical signal, and it generates a magnetic field!
So, a cassette player uses this component to read the magnetic tape.  
But if we remove the tape, replace it with another transducer, and supply a signal to that transducer, 
we can effectively connect the CD player to the car's audio system.

To build this device, I scavenged a transducer from an old, broken Walkman. 
I soldered a 1-meter wire with an audio jack to it and mounted everything inside an empty cassette shell. 
A picture is worth a thousand words, as they say.

<div style="width: 100%; max-width: 500px; margin: 2rem auto; padding: 0 10px; box-sizing: border-box;">
  <img src="{{ site.baseurl }}/assets/images/2018/04/20180326_235855.jpg" 
       alt="Modified Cassette" 
       style="width: 100%; height: auto; display: block;">
  <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
    Modified Audio Cassette
  </div>
</div>

As you can see, I removed the tape and mounted the transducer in the center of the cassette shell. 
Alignment was a real challenge; it had to just touch the corresponding transducer in the car's cassette player. 
Too deep, and it wouldn't make contact, resulting in silence. Too shallow, and it risked damaging the player. I eventually used flexible plastic and glue to create a spring-like mechanism for adjustability. 
The transducer's two channels (left and right) and ground were connected to a 2.5mm jack using a standard audio cable. And that was it!
To use it, I'd plug the jack into the CD player's headphone output and insert the modified cassette into the car's cassette deck. 
Pressing "play" on the CD player sent the audio signal to the transducer in the cassette. 
This transducer converted the electrical signal into a magnetic field, which was then picked up by the car's cassette player and amplified through the speakers.
The system worked beautifully for years, and the sound quality was surprisingly good. 
I did encounter some issues with auto-reverse on certain car radios, which I eventually resolved. 
I can't recall exactly how, perhaps gluing a wheel or using a rubber band to connect them (I was only 15 at the time, so it's been a while!).
Interestingly, years later, I saw a commercial version of my modified cassette in an electronics store! Someone had actually turned it into a product.

That's the story of the cassette adapter. I found a ton of other projects in that drawer: a fake fire simulator with LEDs and transistors, variable power chargers, 
an earthquake detector with an alarm, and more. But this particular hack was one of my favorites.
