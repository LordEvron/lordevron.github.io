---
title: 'How Bitnami Betrayed the Open Source Community'
date: '2025-09-30'
author: Lord_evron
layout: post
permalink: /2025/09/30/the-great-bitnami-betrayal/
categories:
    - Technical
tags:
    - secops
    - docker
    - technology
---
For years, Bitnami was the quiet backbone of Kubernetes deployments. 
Their Helm charts and container images were a trusted, stable foundation for developers, startups, and even enterprise teams running production systems. 
If you wanted something that "just worked", secure, well-maintained, and up-to-date, Bitnami was where you went.
Over the years, they delivered high-quality, production ready software that countless people came to depend on.

But now, under the ownership of `Broadcom`, all that trust has been taken down. Instead of continuing their open source legacy, they’ve decided to cash in at the expense of the very community that made Bitnami what it was.

Broadcom has launched a new `“Secure Images”` subscription product and, in the process, effectively pulled the rug out from under thousands of developers and companies worldwide.

This wasn’t a simple “end of life” notice. That was an act that ensured maximum pain and minimal time for users to react.

## The Deprecation That Destroys

Effective August 28th, 2025, Bitnami did not just stop updates to their free tier; they actively purged all versioned, stable image tags from the main `docker.io/bitnami` repository and moved to a new repository: `docker.io/bitnamilegacy`. In doing so, many tags were renamed or altered, breaking automated deployments and making migration intentionally more painful.

For teams that followed best practices by pinning versions to avoid surprises,  this change turned stable systems into time bombs.
Overnight, critical services that had been running fine for years were suddenly failing  in the attempts to pull a versioned image from the old path (e.g., `docker.io/bitnami/postgresql:13.7.0`), getting `ImagePullBackOff` or `ErrImagePull` errors.

And if you wanted an “easy fix”? Well, Broadcom has a solution: pay for their new subscription service, that is reportedly priced in the **_tens of thousands of dollars annually_**. The message is basically "pay us or break".

## Quick fix
To stop the immediate, bleeding in your systems, you are forced to use the legacy images in your Helm chart configurations. For example in case of `docker.io/bitnami/postgresql:13.7.0`  you can use `docker.io/bitnamilegacy/postgresql:13.7.0`. Just make sure the tag is present in the new repo. The change is simple in syntax but do not rely on for long-term since those images are static and will have long term security implications.

## The Path Forward: Migrate and Never Look Back

Bitnami and Broadcom have made their intentions clear: they are no longer interested in the community that built them up. They are only interested in extracting maximum profit from enterprises caught in the migration trap.

The real fix is simple: migrate away completely.

* Audit all your Bitnami Dependencies: 
```bash
kubectl get pods -A -o json | jq -r '..|.image? // empty' | sort -u | grep -i bitnami 
```

* Embrace Community Alternatives: Look to official upstream projects, the Kubernetes Community Helm Charts, or trusted vendors not owned by broadcom that value the open-source spirit.

# Final Takeaway
This is a textbook example of vendor lock-in, where the vendor waits until you are fully reliant, then flips the switch to a massive paywall.
The Bitnami deprecation is a business maneuver that provides a clear warning: do not build your production on a foundation controlled by a company that has proven it will break your systems for profit.

The real takeaway? Keep your SecOps and DevOps teams sharp (and well payed :P). Their skill is the only thing that will fix this mess without forcing you to surrender to the Bitnami pay-or-break blackmail.

