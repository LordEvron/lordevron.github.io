---
id: 494
title: 'Radiations and measurement units.'
date: '2018-12-03T01:29:28+01:00'
author: Lord_evron
layout: post

permalink: /2018/12/03/radiations-and-measurement-units/
categories:
    - 'Mathandphysics'
tags:
    - physics
    - radiation
---

Yesterday I was playing with a Radon sensor. I encountered some confusion while working with it, specifically when trying to convert the reading from 
Becquerel per cubic meter (Bq/m³) to Sieverts (Sv). This prompted me to write this brief overview of radiation types and their associated units of measurement.


Radiation, broadly defined, is the emission or transmission of energy in the form of waves or particles. 
This includes familiar phenomena like light and sound.  For instance, when light strikes glass, it transfers energy, 
typically causing electrons in the glass atoms to jump to higher energy levels. These electrons can then return to their original state, 
re-emitting a photon. However, if the photon's energy is high enough, it can completely eject an electron from the atom, creating an ion. 
Visible light and sound generally lack the energy for this ionization process. Other types of radiation, which we'll discuss shortly, possess sufficient 
energy to ionize the medium they pass through. These are termed "ionizing radiation." This means that the energy of the incoming radiation is 
so high that it is able to kick out electrons and ionize atoms or molecules and create damages on biological tissues. 
it's worth noting that some non-ionizing radiation can still have biological effects (e.g., UV radiation can cause sunburn and skin cancer). 
The key difference is the mechanism of interaction with biological tissue. 
Ionizing radiation directly knocks electrons off atoms, while non-ionizing radiation typically causes other types of molecular changes.
Examples of ionizing radiation include alpha particles, beta particles, 
gamma rays, neutrons, X-rays, and positrons.


Let's focus on five key types:

1. **Alpha particles**: Consist of fast-moving helium nuclei.
2. **Beta particles**: Consist of fast-moving electrons.
3. **Gamma rays**: High-energy photons originated from nuclear transitions.
4. **X-rays**: Also high-energy photons, similar to gamma rays produced by the acceleration of electrons (e.g., in an X-ray tube).
5. **Neutrons**: High-energy neutrons (indirectly ionizing, and their interaction with matter can create radioactive isotopes, which then decay and emit other types of radiation)

In terms of penetration alpha particles are stopped by almost all the materials. Even your skin layer is enough to stop them. 
So sitting close to a alpha radiation source is quite safe, as long as you do not eat it or inhale it. 
In that case the radiation will end up irradiating some active tissues (eg lungs) and cause problems.

Thanks to the smaller mass, Beta radiation can penetrate more and can easily pass your first skin layer or a paper layer. 
However can be easily stopped by a thin layer of wood, plastic, or any denser material.

X-Rays and Gamma radiation are both high energy photons. since they are mass-less, they can travel further in the air, 
and can also pass thought wood, paper etc. they can only be stopped by a thick layer of heavy metal plates such as lead. 
It should be noticed that even if photons can directly ionize atoms with the photoelectric and Compton effect, mostly 
of the ionization is actually indirect ionization. you can refer to “secondary beta particles” if you want to know more.

Neutron are the last in the list and they are also an indirectly ionizing source. the reason is that similar to photons, 
they do not have a charge so they do not directly ionize other materials, but they can be absorbed by a stable atom, 
making it unstable and thus when they will decay, will emit other type of radiation. Indeed, neutrons are the only type of radiation 
that can transform other material into radioactive. Neutrons can penetrate mostly of the materials the only effective shield consist of a 
thick later of hydrogen rich material such as water or concrete.

Now that we understand what "radiation" is (particles or waves emitted by atoms), how do we measure it?

Defining what we're measuring is more complex than it seems (and where I initially got confused!).  Four key quantities are of interest:

1. Activity
2. Absorbed dose
3. Equivalent dose
4. Effective dose

Other related quantities exist, like exposure and fluence, but we'll focus on these four for simplicity.

- **Activity**, measured in Becquerel (Bq), represents one decay event (radiation emission) per second. It describes how "active" a radioactive source is.  
My radon sensor reports activity in Bq/m³, indicating the number of radioactive decays per second in a cubic meter of air.  
Activity relates to the source material itself and can be calculated based on mass and material type. For example, one gram of potassium has approximately 30 Bq.


But how much of that radiation is actually absorbed?

- **Absorbed dose**, measured in Gray (Gy), represents the amount of energy (in Joules) absorbed per kilogram of matter.  
One Gray equals one Joule per kilogram.  This differs from activity; it measures the radiation deposited in the target material, independent of the source. 
It is a physical dose of radiation absorbed by a material.

These two quantities describe the physics of the material, not the impact on living organisms. 
Different radiation types have varying effects on the human body. One Gray of alpha radiation is about 20 times more harmful than one Gray of beta radiation. 
How do we account for this?

- The **equivalent dose** takes into account the biological impact of different radiation types.  Measured in Sievert (Sv), 
it's also expressed in Joules per kilogram.  It's similar to the absorbed dose but includes a weighting factor reflecting 
the radiation's biological effectiveness. For example, 1 Gy of alpha radiation is equivalent to 20 Sv, while 1 Gy of gamma radiation is 1 Sv.  
1 Gy of beta radiation is also 1 Sv.


However, the human body isn't uniformly sensitive to radiation. Skin is less sensitive than organs like the lungs.  Therefore, we need another quantity:

- The **effective dose**, also measured in Sievert, accounts for the varying sensitivity of different tissues. 
It's the equivalent dose multiplied by a "risk factor" or "weighting factor" (Wt) specific to each tissue. 
For example, the Wt for skin is 0.01, while for ovaries it's 0.2. So, 1 Gy of beta radiation to the skin results in 1 Sv 
equivalent dose and 0.01 Sv effective dose.  1 Gy of alpha radiation to the ovaries yields 20 Sv equivalent dose and 4 Sv effective dose 
(400 times greater than the skin example!).

Hopefully, this clarifies the different radiation measurement quantities.

Regarding my original question, I couldn't directly convert Bq to Sv without considering the other factors. 
The ICRP (International Commission on Radiological Protection) recommends a conversion factor for inhalation of 0.017 mSv/year per 1 Bq/m³.
