---
id: 305
title: 'Can you draw a straight line on a curved surface?'
date: '2018-02-19T17:03:10+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=305'
permalink: /2018/02/19/can-you-draw-a-straight-line-on-a-curved-surface/
categories:
    - 'Math&amp;physics'
tags:
    - Curvature
    - physics
    - relativity
---

Today I will continue the discussion on general relativity that I introduced in my previous article on [Inertial Frame of references](http://localhost:8080/2018/02/04/inertial-frames-in-general-relativity/). But this time i also want to illustrate the bigger plan that I have and the reason to publish this series of articles.  
When people hear about general relativity (GR) they usually think about very complex math impossible to understand. this is not true and there is a simple qualitative approach to fully understand GR: the geometrical approach. In particular using this approach we are able to model the space-time as a 4 dimensional volume where all the matter is moving… We will get to that.. for now is enough to understand that GR concepts have a geometric equivalent of the analytical.  
So aim of this series of articles is to be able to understand general relativity from a pure geometrical point of view. I will see if i will make a new series on the Einstein Field Equation formula too.

So today topic is about straight line and curved spaces… If i ask you to draw a straight line on paper is an easy task, but what i if ask you to draw to a straight line onto a sphere? does it even make sense to ask that?  
Well before we can give an answer we need to have some basic concept that seems obvious but are not… like: What is straightness and why line A is straight and line B is not?

![](http://localhost:8080/wp-content/uploads/2018/02/Line-300x167.jpg)

Well it turns out that mathematicians have known the answer to this question for a while and it involve parallel transport of a vector. Just few word about parallel transport: In general, in order to parallel transport <span style="font-size: 1rem;">a vector over a curve you</span><span style="font-size: 1rem;">:</span>

1\. Draw a vector  
<span style="font-size: 1rem;">2. Transport it (by sliding it) over the curve keeping it parallel to its initial direction. </span>

<span style="font-size: 1rem;">now, based on that we can check if the Line “A” is </span>straight<span style="font-size: 1rem;"> or not by doing the following:</span>

1- Calculate the tangent vector parallel to the line “A” and parallel transport it over the line “A”  
2- If the tangent vector stay parallel to the line “A” for the whole journey, the line is straight, otherwise is not.

So applying this concept to the example before, we can easily see that A is straight while the vector tangent to the line B does not stay parallel to the line all the time, thus is not straight… So, now we have a method to check if lines are straight… next question is: can we extend it to curved spaces? Well would be the same to ask a person to walk in a straight line on the Earth. The trick is to divide the earth surface in a infinite number of small patches and approximate each patch as flat surface (<span style="font-size: 1rem;">Alternatively, for each patch you draw the vector tangent to the curved patch and then project it to the surface) </span><span style="font-size: 1rem;">. Than we can use the same principle of tangent vector that we used in the previous example. If the vector stay tangent to the curve all the way then the line is straight (according with our definition) otherwise is not. </span>

On a sphere, it turns out that the only lines that are straight are the great circles (circles whose center coincide with the sphere center). Example of great circles are the Equator, and the Meridians. moving along those line will be equivalent of moving in a straight line in a flat space. However, for distinguishing it to the straight line flat spaces, they are called GEODESICS.. So Geodesics are just an extension of straight lines for curved spaces… Are those also the shortest distance? well not necessary. For example, from Greenwich to North Pole, you can can move north on the same meridian, and that turns out to be the shortest distance, but you can also reach the North pole by going around the earth (passing for south pole first!) and that is definitely not the shortest distance (but both the path are geodesics!). So no,<span style="font-size: 1rem;">geodesics are not well generalized by defining them as</span><span style="font-size: 1rem;"> “shortest path”, but the tangent method does always work!.</span>

So now we know how to define straight lines in curved spaces but we are still missing one thing…how to check if the space is flat or curved. Again, parallel transport works fine also in this case:

1\. Parallel transport a vector over a closed curve.  
2\. If you end up with the same vector the space is flat, otherwise is curved!

If you try to do this on the earth surface, you will see that the vector will end up to the same position rotated of a certain angle that depends from the path, thus the earth surface is a curved space.

There is an alternative definition using geodesic. Start with two parallel geodesic and extend them indefinitely. If the meet each other, the space is curved, otherwise is flat. An example of this can be easily seen with the meridians. Start at the equator with two parallel geodesic pointing north…follow them and they will meet at the north pole…meaning the earth is curved.

The last thing that i want to point out is to don’t confuse topology with curvature. For example the surface of a cylinder is a flat space, even if is wrapped around. Indeed if you draw two parallel lines on a paper ant then roll it to make a cylinder, you will see that the parallel lines will stay parallel. What has changed is the topology that is global property. Curvature and Geometry are local.

We will continue building up on this concepts to understand why gravity is not a real force but just an effect of the space-time curvature.. Stay tuned!

<span style="font-size: 1rem;"> </span>