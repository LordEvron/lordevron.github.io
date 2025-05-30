---
id: 250207
title: 'Docker Compose: Automated Updates with Watchtower'
date: '2025-05-30'
author: Lord_evron
layout: post
permalink: /2025/05/30/automated-updates-with-watchtower/
categories:
    - Technical
tags:
    - secops
    - docker
    - technology
---
In the world where everything is running in containers, staying up-to-date with the latest image versions is mandatory for security and performance improvements. 
While Docker Compose simplifies the orchestration of multi-container applications, manually monitoring and updating the images defined in 
your `docker-compose.yml` file can become a time-consuming task. This is where Watchtower steps in as your automated guardian, 
ensuring your Docker Compose services are always running on the newest images.


# What is Watchtower?

Watchtower is a lightweight and powerful open-source Docker container that automates the process of updating your running Docker containers. 
It basically monitors your running containers and, when it detects a new version of their base image on Docker Hub (or other registry),
it gracefully stops the old container, pulls the updated image, and restarts a new container using the same configuration 
parameters (environment variables, volumes, network settings, etc.) defined in your Docker Compose file. 


Integrating Watchtower into your Docker Compose workflow offers many advantages:
* Automation: The most significant benefit is the automatic image updates. Once configured, Watchtower handles the entire update cycle without requiring manual intervention.
* Security: Regularly updating container images is an important security practice. Watchtower ensures you're always running the latest versions, which often include critical security patches.
* Staying Up-to-Date with Features: New image versions often bring performance improvements and new functionalities.


Before we start to dig deeper into Watchtower usage, I want to clarify few things first. 
While `Kubernetes` and tools like `Minikube` offer powerful orchestration for complex deployments, 
for a small home environment, Docker Compose remains significantly more convenient and easier to manage. Its simplicity in defining and running multi-container 
applications with a single docker-compose.yml file is ideal for personal projects and home servers. Watchtower perfectly complements this setup by automating image updates,
a task often manually handled in such environments. 

It's also important to note that Watchtower does not change the tag specified in your Docker Compose file; rather, it monitors 
the registry for updates to the image associated with the specified tag. 
This means that using `:latest` will trigger an update whenever a new version is pushed to the latest tag. 
However, if you specify a fixed tag like `:1.2.1`, Watchtower will only update if a new image is pushed to that exact tag 
and **will not** automatically pull versions tagged differently, such as `:1.2.2`.

Also, be aware that **Watchtower automatic upgrade come with the risk of unexpected breaking of applications** (eg latest tag moved across major version updates).
Because these potential issues it should not be used anywhere else except your home/hobby projects, as specified in their [official repo](https://github.com/containrrr/watchtower):

> Watchtower is intended to be used in homelabs, media centers, local dev environments, and similar. We do not recommend using Watchtower in a commercial or production environment. If that is you, you should be looking into using Kubernetes. If that feels like too big a step for you, please look into solutions like MicroK8s and k3s that take away a lot of the toil of running a Kubernetes cluster.
  

# How to Integrate Watchtower with Docker Compose

Imagine a typical Docker Compose setup where you have an application and a database running as services. 
In this common case, integrating Watchtower is very easy. You essentially add Watchtower as another service to your `docker-compose.yaml` file.

Here's a general example of how to configure Watchtower in your `docker-compose.yml`:

```YML
version: '3.8'

services:
  your_app:
    image: your/app:latest
    # ... other configurations for your application ...
    restart: unless-stopped
    
  your_db:
    image: your/db:10.9
    # ... other configurations for your DB ...
    restart: unless-stopped

  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      WATCHTOWER_CLEANUP: "true"
      WATCHTOWER_SCHEDULE: "0 0 4 * * *"
    command: your_app
```
Let's break down the watchtower configuration. 

* `image: containrrr/watchtower`: This specifies the official Watchtower image from Docker Hub.


* `restart: unless-stopped`: This ensures that if the Watchtower container restarts for any reason, Docker will automatically bring it back up.


* `volumes: - /var/run/docker.sock:/var/run/docker.sock`: This is crucial. It mounts the Docker socket inside the Watchtower container, 
allowing it to communicate with the Docker daemon and manage other containers.


* `environment`: This section configures Watchtower using environment variables:
    * `WATCHTOWER_CLEANUP: "true"`: This tells Watchtower to automatically remove the old containers after a successful update, keeping your system tidy.
    * `WATCHTOWER_SCHEDULE: "0 0 4 * * *"`: This configures Watchtower to run on a cron schedule. The example 0 0 4 * * * specifies that Watchtower will check for updates every day at 4:00 AM. 


* `command: your_app`: This instructs Watchtower to specifically monitor and update the container named `your_app` in the docker-compose.yml file. 
  You can list multiple service names here, separated by spaces, if you want Watchtower to manage more than one service (e.g. `command: your_app your_db`)
  if you omit this command, watchtower will manage all the container used in the docker compose file. 
  Alternatively, you can also add labels to your service and then configure watchtower to only manage container that have that label (leading to the same results). 

One final note. if you tell Watchtower to monitor your database service (e.g., your_db) and you specified a minor version tag like `:10.9`,
this will ensure it receives patch updates(eg a new image pushed with `:10.9` tag) without the risk of automatic major version upgrades that could break the database.


# Conclusion

Watchtower presents a powerful and convenient solution for automating container image updates within a home Docker Compose environment, 
simplifying its maintenance. Its ability to automatically fetch and deploy newer versions ensures you're running with the latest security patches. 
However, leveraging this automation without caution can lead to problems. For critical services like databases, 
there is a serius risk of causing data corruption or service instability. 
In these cases I recommend to carefully select the tags manged by Watchtower and limiting the latest tag for less critical internet exposed services. 
