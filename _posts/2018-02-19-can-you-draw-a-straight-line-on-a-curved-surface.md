---
id: 305
title: 'Can you draw a straight line on a curved surface?'
date: '2018-02-19T17:03:10+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=305'
permalink: /2018/02/19/can-you-draw-a-straight-line-on-a-curved-surface/
categories:
    - 'MathAndPhysics'
tags:
    - Curvature
    - physics
    - relativity
---

Picking up from my previous post on Inertial Frames of Reference, I want to outline the broader scope of this series on general relativity (GR) and explain my motivation for writing it.

GR often gets a reputation for being mathematically impenetrable, but that's a misconception.  
A straightforward, qualitative understanding is entirely possible through a geometrical approach. 
We can model spacetime as a 4D volume within which matter moves—more on that later.  
For now, it's crucial to grasp that GR concepts have geometric counterparts.
This series aims to demystify general relativity from a purely geometrical perspective.  I may even follow up with a series exploring Einstein's Field Equations.
Today's focus is on straight lines and curved spaces. Drawing a straight line on paper is trivial, but what about drawing one on a sphere? Does that even make sense?
Before we can answer, we need to clarify some seemingly obvious, yet subtle, concepts.  
What exactly is straightness, and what distinguishes a straight line from a curved one?
What makes line A straight while line B, in this image, is not?

<div class="image-container">
  <img src="{{ site.baseurl }}/assets/images/2018/02/Line.jpg" 
       alt="Straight lines" 
       class="img-responsive" 
       style="display: block; margin: 0 auto; max-width: 500px;">
        <figcaption class="caption" 
              style="display: block; text-align: center; margin-top: 10px;">
    
  </figcaption>
</div>


Well it turns out that mathematicians have long understood how to define "straightness," and it involves the concept of parallel transport of a vector.  
Parallel transport simply means taking a vector and moving it along a curve while keeping it parallel to its original direction.

We can determine if line "A" is straight by:

1. Calculating the tangent vector parallel to line "A" and then parallel transporting it along line "A."
2. If the tangent vector remains parallel to line "A" throughout the journey, then the line is straight. Otherwise, it's not.

Applying this to our example, line A is straight. However, the tangent vector of line B doesn't remain parallel to the line, indicating that B is curved.

So, we have a method for identifying straight lines. But how do we extend this to curved spaces?  
Imagine trying to walk a straight line on Earth. The trick is to divide the Earth's surface into infinitely small patches, approximating each as a flat surface. 
(Alternatively, you can draw a tangent vector to the curve on each patch and then project it onto the surface).  
We can then apply the same tangent vector principle.  If the vector remains tangent to the curve, the line is considered "straight" (by our definition); 
otherwise, it's not.

On a sphere, the only "straight" lines are great circles (circles whose center coincides with the sphere's center), like the equator and meridians. 
Moving along these lines is analogous to moving in a straight line on a flat surface.  
To distinguish them from straight lines in flat spaces, we call them geodesics.  Are geodesics always the shortest distance? Not necessarily. 
The shortest path from Greenwich to the North Pole is along the meridian, but you could also reach the North Pole by traveling around the world 
(passing the South Pole!). That's a much longer path, but both paths are geodesics. So, defining geodesics as "shortest paths" isn't quite accurate. 
However, the tangent vector method always works!

Now we know how to define straight lines in curved spaces, but how do we determine if a space is flat or curved? Again, parallel transport comes to the rescue:

1. Parallel transport a vector along a closed curve.
2. If the vector returns to its original orientation, the space is flat. If it's rotated, the space is curved.

Try this on Earth's surface, and you'll see that the vector is rotated by an angle dependent on the path. This provides evidence that Earth's surface is curved.
Another way to think about it involves geodesics. Start with two parallel geodesics and extend them indefinitely. If they eventually intersect, the space is curved. If they remain parallel, it's flat.  
Meridians on Earth are a perfect example: they start parallel at the equator but converge at the North Pole, demonstrating Earth's curvature.
Finally, don't confuse topology with curvature. A cylinder's surface is flat, even though it's wrapped around.  If you draw two parallel lines on a piece of paper and then roll it into a cylinder, the lines remain parallel.  
Topology is a global property but curvature, is a local property!
We'll build on these concepts to understand why gravity isn't a true force but rather a consequence of spacetime curvature. Stay tuned!

