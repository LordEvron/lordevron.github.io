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
    - audio
    - hardware
---

In the last article I showed a small hack on diskettes. Now I want to present a more complex device that I build. But as always, lets start with a small background first..

In the end of 90s despite Walkman were still used, the portable cd player were becoming more and more popular. At that time I bought a Sony Cd Player with 10 second anti shock technology (Anti-Shock, also called Electronic Skip Protection was a data buffer used in those devices so that audio would not skip while the disk could not be read due to movement). It was nice to hear to my cds while was walking or in the car over the headphones… However I wanted to hear my cd also in the car speakers, and not only from my headphones… My father car had only a cheap music cassette readers, with no Aux input ( it didn’t had neither the auto-reverse function)!  
So cd readers for car were expensive and I could not afford to buy a new one for my father car..But i still wanted to listen the cd in the car speakers.. How to do that?

The solution was to reuse one piece of the Walkman. The Walkman had a small head that was touching and reading the magnetic field stored on the magnet tape of the audio-cassette. Here there is a picture with a red circle around the interesting part.

![](http://localhost:8080/wp-content/uploads/2018/04/walkman.jpg)

That part is a magnetic transducer: convert the magnetic field into a electric signal… Now the interesting part is: that component is bidirectional….If you provide a small electric signal, it will be converted into a magnetic field!!!

Well that is nice.. so basically if we have a cassette reader, that component reads from the magnetic tape of the cassette. But if we remove the tape and substitute it with another transducer and we supply a signal to that transducer, than we can attach the CD reader to the car.

For the fabrication of the device, i had one old broken Walkman that i could disassemble and steal the transducer. I soldered a 1 mt wires with an audio Jack and mounted everything in a cassette frame. A picture is worth more than 1000 word.

![](http://localhost:8080/wp-content/uploads/2018/04/20180326_235855.jpg)

As you can see I removed the tape, and mounted the transducer to the center. I remember that alignment was extremely difficult, because it had to barely touch the other one in the reader.. If I mounted too deep, it would not touch and no sound would come, if i mounted too shallow, it would damage the reader. I end up using some flexible plastics, and some glue to make it movable like a spring. The transducer had the two R-L channels and the ground that I connected to a 2.5mm jack using a standard audio cable… and that was it.

So basically to make it work, I would insert the jack in the headphone output of the CD player, and the modified cassette inside the cassette reader of the car… When i pressed play the CD was sending the electric signal of the sound to the first transducer (the one on the cassette). This transducer converted the signal on magnetic field that was then picked up by the car reader transducer and reproduced on the speaker.

The system was working great and i used for several years. The quality of the sound was also really good.. A small note on the auto-reverse: I had some problem with some radio with autoreverse that i fixed somehow.. I do nor remember if glued one of the wheels or i used a small rubber band to connect them together (I was probably 15 years old at that time so has passed some time since then!).

Last note regarding the modified cassette that i build. Few years later I found it a commercial version in a electronic shop… So someone actually made it a commercial product out of it!

Well that is it. I found a shitload of other stuffs in that drawer including a fake fire simulator with LED and transistors, variable power chargers, earthquake detectors with alarms, etc … but the one i presented I particularly liked.