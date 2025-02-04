---
id: 841
title: 'Debugging Go Code in docker-compose'
date: '2021-03-04T19:56:44+01:00'
author: Lord_evron
layout: post
permalink: /2021/03/04/debugging-go-code-in-docker-compose/
categories:
    - Technical
tags:
    - technology
    - code
    - go
---

This is a small guide to clarify the setup needed to debug Go code running in a container in docker-compose using dive debugger .
Basically lets suppose that you have 3 service running in three different containers:

1. A Python service with a REST interface exposed to the user
2. A service written in Go, that provide some sub-service for the python container exposed over REST too.
3. A Database that is used by both the other two containers

Let's assume that the Python service offer a service that calculate the prime factors of a number. 
When it receives a requests, it just checks in the database if has been already calculated, 
otherwise ask the Go service to calculate it. The go service factorize the number, store the factors in the DB and return 
the result to the python service that then wraps it in some html code and return it to the user.

As you can see, the three services cannot really be fully tested stand alone, since they ”need” each other in order to 
return the results. Docker-compose help you with that by starting each service in its own container and setting up 
some dns so they can find each other. If we want to debug for example the python service, than IDE like pycharm does everything 
“automagically”. The only thing you must do is to “use” the python interpreter of the running container, and you are able 
to debug/set breakpoints in your code files.

If you want to do the same with GO, then things get a little more complicated , especially for high level programmer 
that never had to compile or cross compile code for other machines. Indeed, Go source code must be compiled in binary 
format before it can run. A normal docker file for a go service is usually split in two parts: one for building and one for running. 
So it looks something like this:

```yaml
FROM golang:1.16-buster AS builder
#set workdir
WORKDIR $GOPATH/src/myGocode

#copy the source files
COPY . .
#build the executable
RUN go build -o myGocode

# Copy binary to debian
FROM debian:buster
COPY --from=builder /go/src/myGocode ~/myGocode
#set entrypoints
ENTRYPOINT ["~/myGocode"]
```

In this way the binary file is build without debugging information, so there is no way to “attach” a debugger to it.

In order to be able to debug the code, we need to tell the compiler to add the debugger symbols (like in C and C++ ). 
The way how you tell Go to compile the code with debugging option is to add `-gcflags=”all=-N -l”` flags to the build command like this:

```
RUN go build -gcflags="all=-N -l" -o myGocode
```

After fixing the compilation, we need to have Delve in the running container. 
So we need to download and build Delve to the builder container and then copy it to the final buster container. 
As last, we need to modify the Entry point to start the application using Delve.

At the end the docker file looks like this:

```yaml
FROM golang:1.16-buster AS builder
#set workdir
WORKDIR $GOPATH/src/myGocode

# Build Delve
RUN go get github.com/go-delve/delve/cmd/dlv

#copy the source files
COPY . .
#build the executable
RUN go build -gcflags="all=-N -l"  -o myGocode

# Copy binary to debian
FROM debian:buster
COPY --from=builder /go/src/myGocode ~/myGocode
COPY --from=builder /go/bin/dlv ~/dlv
#set entrypoints
ENTRYPOINT ["~/dlv", "--listen=:40000", "--headless=true", "--api-version=2", "--accept-multiclient", "exec", "~/myGocode" "-- --config /myconfig.cfg"]

```

As you can see the entrypoint is now using Delve with debugger port 40000. After the exec there is the path of the application 
that we want to debug. You could have avoided to change the ENTRYPOINT here and then overwrite it in the Docker-compose, 
but is more clear like this. Try to build and start the container as stand alone. 
your application should start just fine. If not, then there is something wrong and you must fix it before you move forward. 
Also notice i included an example on how you can pass a parameter (`-- --config Pathtofile` ) to your application. So you need to have “--” 
and everything after that is passed by Delve to your application.



If it builds and start fine, then the code is compiled with debugging information on.

Please notice that those flags allows you to debug with Delve only from **golang v1.10 and above**! 
If you want to use Delve debugger with older version of Go, then you need to compile the go code directly in Delve 
(replace the RUN go build xxx with Delve build).

 In the docker compose file we need to add a couple of more lines to allows the debugger to connect to our Go binary. 
 In particular i will comment the line that are needed for the debug in this possible docker-compose file:

```yaml
version: '3.0'
services:

 myGocode:
    container_name: myGocode
    build:
      context:.
     
    #THIS IS THE SAME AS THE ENTRYPOINT notice the --  --config for passing parameters
    command: ~/dlv --headless --listen=:40000 --api-version=2 exec ~/myGocode -- --config /myconfig.cfg    
    
    #THESE 4 LINES are IMPORTANT FOR DEBUGGING
    security_opt:
      - "seccomp:unconfined"
    cap_add:
      - SYS_PTRACE

    depends_on:
      - Python_http
      - db
    ports:
      - 80:80 
      - 40000:40000   ## THIS PORT IS THE DEBUGGER PORT THAT NEED TO BE EXPOSED.
      
 Python_http:
    container_name: httpbin
    image: kennethreitz/httpbin:latest
    hostname: httpbin
    networks:
      httpbin: {}

 db:
    image: postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: example</span>
```

You should be able to start this docker-compose file with docker compose up without problems.
So Now it comes the IDE specific Part. I have been testing Goland from IntelliJ and is a great IDE. So my guide will use that as setup.
You need to create two configurations: one to start docker-compose file and one to attach the debugger to the already running container.
Edit you configuration and add your docker compose path file and the service that you want to debug, as shown in the below


<div style="width: 100%; margin: 2rem auto; padding: 0 10px; box-sizing: border-box;">
  <img src="{{ site.baseurl }}/assets/images/2021/03/image-1.png" 
       alt="CO2 Emission Savings" 
       style="width: 100%; height: auto; display: block;">
  <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
    Golang docker compose settings
  </div>
</div>

Then add a GO remote application with the correct port that you setup, like this:

<div style="width: 100%; margin: 2rem auto; padding: 0 10px; box-sizing: border-box;">
  <img src="{{ site.baseurl }}/assets/images/2021/03/image-2.png" 
       alt="Golang. remote port debug" 
       style="width: 100%; height: auto; display: block;">
  <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
    Golang: remote port debug
  </div>
</div>

Then navigate to ***Run–&gt; debug*** and select the **remote debugger** that you created above. This will connect to localhost port 40000 to your application. You should now be able to step in your code.

While trying to break in my code, I encountered in a error **“executable doesn’t contain debug information for xxx”** In order to fix that was enough to navigate to

**File–&gt; settings –&gt; Go –&gt; Go Modules** and select both *“Enable Go module integration”* and *“Enable Vendoring support automatically”*

That fixed the problem!

So for resuming, in order to debug your go code you need to:

1. Compile your code with the right Flags.
2. Install Delve debugger in your container.
3. Lauch your application through Delve.
4. Remove some of the security (security\_opt and cap\_add ) in the docker compose file.
5. Expose the debugger ports on your localhost (done in docker-compose –&gt;port)
6. Start the docker-compose services
7. Set up your ide to connect to the debugger exposed port.

I hope this was informative, since it took me few hours to figure all these stuffs out!

Happy Go Programming!
