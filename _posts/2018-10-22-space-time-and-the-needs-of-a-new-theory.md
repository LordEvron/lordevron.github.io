---
id: 477
title: 'Space, time and the needs of a new theory'
date: '2018-10-22T15:40:25+01:00'
author: Lord_evron
layout: post
permalink: /2018/10/22/space-time-and-the-needs-of-a-new-theory/
categories:
    - 'Mathandphysics'
tags:
    - physics
    - relativity
---
This is the third article in the [relativity](/_tags/physics.html) series. It took me some time to write down because 
I wanted to give priority to technology focused articles.  
I also sometimes wonder if anyone is actually reading these posts, but I'll continue regardless.  
Let's dive into some fundamental concepts.

A common question for newcomers to relativity is: why all this complexity? 
Isn't Newtonian mechanics enough to explain the world around us, including gravity, acceleration and distances? 
The answer, surprisingly, is no. Let's see why.

## The Newtonian picture

Newton's laws are intuitive, and they work very well as long as things move much slower than light.
They treat space and time as two separate things, which matches our everyday experience.

Imagine you are on a train travelling at 100 km/h, and you fire a bullet forward at 200 km/h (relative to the train).
Someone standing on the ground sees the bullet moving at 300 km/h: the two speeds simply add up. Simple and understandable.

In this Newtonian world, all observers (on the train, on the ground, in a spaceship passing by) agree on:

- **When** the bullet was fired.
- **When** the bullet hit the target.
- **How much time** passed between the two events.
- **How long** things are: the length of the train, or the distance between the gun and the target at a given moment.

Time and lengths, are the same for everybody. There is one universal clock and one universal ruler.

## Where it breaks

This picture is an approximation that only works at low speeds. Even at 100 km/h it is slightly wrong, but the error is so tiny that no everyday instrument could measure it.

To see the problem, repeat the experiment with a beam of light instead of a bullet. Light travels at `c`, roughly 300,000 km/s.
Following Newton's logic, the person on the ground should see the light moving at `c + 100 km/h`. But that's not what happens.
Every measurement ever made gives exactly `c`, for every observer, no matter how fast they are moving relative to the source.
The speed of light is the same for everyone. This is not a theory: it is an experimental fact, first hinted at by the Michelson–Morley
experiment in 1887, and confirmed countless times since.
Furthermore, speeds never add up beyond `c`. If the train moved at 0.6c and fired a bullet at 0.6c, the ground observer would not see 1.2c, but about 0.88c.

If everyone measures the same speed for light, and speed is distance divided by time, then something has to give.
Einstein's answer was: **distance and time** themselves are not the same for everybody. At high speeds, observers disagree on:

- When the shot was fired.
- When the shot hit the target.
- How much time passed between the two events (*time dilation*).
- The distance between objects, and therefore how long things are (*length contraction*).
- Even, in some cases, **which of two events happened first**.

The crucial point is that **all of them are right**, each in their own frame of reference. There is no "true" observer and no "true" clock:
each measurement is correct from the point of view of whoever made it.

This might sound bizarre, but it's how the universe works. These are not theoretical curiosities; they are measured facts.
GPS satellites, for example, have to correct their clocks for these effects every day, otherwise your position would drift by kilometres.

## What everybody agrees on: the space-time interval

So if observers disagree on "when" and "where", and sometimes even on the order of events, is there anything left that they all agree on?

Yes. It's called the **space-time interval**. Take two events, A and B (for example: "the gun fires" and "the bullet hits the target").
Each observer measures the distance between them, `Δx`, and the time between them, `Δt`. These two numbers will be different for different observers.
But if each of them computes this combination:

**s² = (Δx)² – (cΔt)²**

they all get **exactly the same number**. (For simplicity I'm using a single space direction `x`; in 3D, `(Δx)²` becomes `(Δx)² + (Δy)² + (Δz)²`.)

An analogy helps here. Imagine two people drawing a map of the same city, but one rotates their grid a bit compared to the other.
They will give different `x` and `y` coordinates to the church and to the train station, but if they both compute the distance
between the two buildings with Pythagoras, `√((Δx)² + (Δy)²)`, they get the same answer. The distance is real; the coordinates are just a choice.

Relativity says the same thing about space and time: moving at a different speed is like "rotating" your grid in space-time.
You change your `Δx` and `Δt`, but the interval `s²` stays the same. The only difference from the map is that minus sign in front of the time part,
and that minus sign is responsible for all the weirdness of relativity.

## The interval and causality

The minus sign also means `s²` can be positive, negative or zero, and each case has a precise meaning:

- **`s²` < 0** (*time-like*): the time separation wins. A signal slower than light could travel from A to B, so **A can influence B**. 
  All observers agree on which event came first.
- **`s²` = 0** (*light-like*): only a beam of light could connect A and B. For light, `Δx = cΔt`, so the interval is zero, for everyone.
  (That's the constant speed of light, written in a different way.)
- **`s²` > 0** (*space-like*): the events are too far apart in space for anything, even light, to travel between them in time. 
  **A cannot influence B**, and B cannot influence A. These are the only events whose order can be different for different observers.

Because `s²` is the same for everybody, everybody also agrees on which events *can* cause which. Even if two observers disagree on when things happened,
they will never disagree on cause and effect: nobody will ever see the bullet hit the target before it was fired.
In more mathematical terms, the space-time interval is an *invariant*: a quantity that doesn't change when you switch from one frame of reference to another.

## Towards space-time

Look again at the formula. Apart from the minus sign, it looks just like Pythagoras' distance formula, with time acting as an extra coordinate.
This was Hermann Minkowski's insight in 1908: maybe space and time are not two separate things, but two aspects of a single four-dimensional
"space", where the interval plays the role of distance. He called it **space-time**, and the points in it are called **events**:
something that happens at a specific place, at a specific time.

This will be the subject of the next article, where we'll explore Minkowski space and space-time diagrams. Stay tuned!
