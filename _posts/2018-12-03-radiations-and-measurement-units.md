---
id: 494
title: 'Radiations and measurement units.'
date: '2018-12-03T01:29:28+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=494'
permalink: /2018/12/03/radiations-and-measurement-units/
categories:
    - 'Math&amp;Physics'
tags:
    - measurement
    - Physics
    - radiation
    - radioactive
---

Yesterday I was playing with a Radon sensor. I got a little confused when I wanted to convert the dose from Becquerel /meter ^3 to Sievert, so this gave me the inspiration to write this small article on radiation types and measurement unit used to define them.

The first thing to define is what is a radiation. Physic definition of radiation is quite broad, and it is defined as “emission or transmission of energy in the form of waves or particles through space or through a material medium.” This include also light, sound, etc. So when for example light hit a material (Eg Glass), it transfer its energy to target. This energy is usually absorbed by the material as electron excitation. Basically when the photon hit the material atom, it will make an electron to jump to the next energy level. This electron can eventually jump back to the original position and re-emit a new photon. However if we do increase the energy of the photon, it can happen that when it hits the atom, it will be able to kick out completely one electron creating a ion. The energy carried by visible light, or sound is in general not high enough for this to happen. However some other type of radiation that we will soon explain have enough energy to ionize the medium where they pass trough. This is why we refer to them as”ionizing radiation”. This means that the energy of the incoming radiation is so high, that is able to kick out electrons and ionize atoms of molecules. Example of ionizing radiation are Alfa particle, Beta Particles, Gamma Rays, Neutrons, X-rays, positrons, etc.

However, lets focus to the main 5 types which are:

1\. Alpha particle: This mainly consist of fast moving Helium nucleus  
2\. Beta particles: This mainly consist of fast moving electrons  
3\. Gamma rays: This are high energy photons.  
4\. X-Rays : similar to gamma rays are high energy photons.  
5- Neutrons: This are high energy neutrons

In terms of penetration alpha particles are stopped by almost all the materials. Even your skin layer is enough to stop them. So sitting close to a alpha radiation source is quite safe, as long as you do not eat it or inhale it. In that case the radiation will end up irradiating some active tissues (eg lungs) and cause problems.

Thanks to the smaller mass, Beta radiation can penetrate more and can easily pass your first skin layer or a paper layer. However can be easily stopped by a thin layer of wood, plastic, or any denser material.

X-Rays and Gamma radiation are both high energy photons. since they are mass-less, they can travel further in the air, and can also pass thought wood, paper etc. they can only be stopped by a thick layer of heavy metal plates such as lead. It should be noticed that even if photons can directly ionize atoms with the photoelectric and Compton effect, mostly of the ionization is actually indirect ionization. you can refer to “secondary beta particles” if you want to know more.

Neutron are the last in the list and they are also an indirectly ionizing source. the reason is that similar to photons, they do not have a charge so they do not directly ionize other materials, but they can be absorbed by a stable atom, making it unstable and thus when they will decay, will emit other type of radiation. Indeed, neutrons are the only type of radiation that can transform other material into radioactive. Neutrons can penetrate mostly of the materials the only effective shield consist of a thick later of hydrogen rich material such as water or concrete.

Ok so now we know that “radiation” (in the common used term) are actually particles (or waves) emitted by atoms. How do we measure them?

Firstly we need to define **what we are going to measure**. The answer to this question is more complex of what apparently seems (and here is also where i got confused!). The four main quantities that we may be interested to measure in relation to radiation are:

1- Activity  
2-Absorbed dose  
3-Equivalent dose  
4-Effective dose

There are also more quantities that are related such as exposure and fluence, but for sake of simplicity we are going to focus on this four.

***Activity*** is measured in Becquerel (Bq) and represent 1 decay event (radiation emission) per second. So this describe how active is our radioactive source material. So the radon sensor that I have, it reports this value. The number of radioactive events that happen in a second in a cubic meter of air. (Bq/m^3). Notice that this is only referring to the material itself and it can be easily calculated once mass and material type are settled. For example one gram of potassium has (more or less) 30 Bq.

But how much of that doses actually get absorbed?

***Absorbed Dose*** is measured in Gray (Gy) and correspond to the amount of Joule absorbed by a kg of matter. So 1 Gray is 1 Joule/1 kg. Now we can notice the difference between Bq and Gray. In this case we are measuring the radiation that is deposited to the target material and is independent from the source. Is a physical dose of radiation that is absorbed by a material.

So the two point described only deal with the physic of the material, not with the “living things”. Indeed different type of radiation can have very different effect on the human body. 1Gray of alpha radiation is 20 times more dangerous than a 1 Gray of beta radiation. How to take into account that?

With the **Equivalent Dose** we do actually take into account the effect of the various radiations types and the effect they will have on the body. The measurement unit is Sievert (Sv) and like the Gray is also equivalent to Joule/Kg . Basically is like the absorbed dose, but with a extra factor that describe how dangerous is that type of radiation for the human body.  
So for example 1 Gy of Alpha radiation is 20 Sv while 1 Gy of gamma radiation is 1 Sv. 1 Gy of beta radiation is also 1 Sv.

But the human body is not all the same.. skin is less sensitive to radiation of other parts such as lung! So?

Then we need another quantity to measure and that is the **Effective dose**. It is also measured in Sievert, so it consist of the same Equivalent dose but multiplied by a “risk factor” (or effectiveness factor). For example the “risk factor” (Wt) for the skin is 0.01 while for ovaries is 0.2. So keeping the example before, 1 Gray of beta radiation on the skin will give us a 1 Sv of equivalent dose and 0.01 Sv of Effective dose. If we do have 1 Gray of Alpha radiation of the ovaries, this will give us a 20 Sv of equivalent dose and 4 Sv of effective dose (400x more than the skin example)!!!

So I hope this clarified a little the difference of measurement quantities that can be chosen when talking about radiation.

And regarding my question, i could not just transform from Bq to Sv, without defining all the other parameters in between. So, conversion dose coefficient (inhalation) recommended by ICRP is 0.017 mSv/y for 1 Bq/m3.