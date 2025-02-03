---
id: 458
title: 'Variables in Bash'
date: '2020-05-20T15:59:36+01:00'
author: Lord_evron
layout: post
permalink: /2020/05/20/variables-in-bash/
categories:
    - Technical
tags:
    - bash
    - code
    - linux
    - technology
---

Let's talk about variables in bash scripts. This isn't a deep dive, but rather a clarification on this useful feature. 
What are bash variables, and why should a user or developer care?
Simply put, they are variables that programs can access and read. Some are set by default and are called environmental variables. 
For example, if your script needs to access your home directory in Linux, which is usually `/home/USERNAME`, 
you could hardcode that path. However, this isn't ideal, as it only works for one specific username. 
How can you access the path without knowing the username (besides using `~`)?  One solution is using the `HOME` environment variable. 
In your shell script, you can use `$HOME`, which will resolve to the correct path. 
But since you're reading this, you probably already know this, so let's move on.

## Shell scripting

If you've done any shell scripting, you've likely encountered some nuances. For instance, what's the difference between these:

```bash
GREET="Hello_"
# with no quotes
echo $GREET
>Hello_
# with single quotes
echo '$GREET'
>$GREET
# with double quotes
echo "$GREET"
>Hello_
# with curly braces
echo ${GREET}
>Hello_

```

Let's examine each one, starting with the single quote example: `echo '$GREET'`. 
Bash treats characters within single quotes literally as a string, without attempting any interpretation.  
So, `echo '$GREET'` prints *$GREET*. Use single quotes when you want to prevent any bash substitution. 
What about the other three commands?

With double quotes, bash does attempt variable substitution within the string. Consider this example:

```bash
SHELL=bash
# with no quotes we get error
echo pipe | is used to connect output in $SHELL
>Error
# with single quotes-- SHELL is not substituted
echo 'pipe | is used to connect output in $SHELL'
>pipe | is used to connect output in $SHELL
# with double quotes-- SHELL get substituted
echo "pipe | is used to connect output in $SHELL"
>pipe | is used to connect output in bash

```

The unquoted command results in an error because bash tries to pipe the commands "pipe" and "is" together using the `|` character. 
The single-quoted example prints the string literally, including "$SHELL". Only the double-quoted version substitutes the variable, 
printing "pipe | is used to connect output in bash". Also, be aware that unquoted strings in bash are subject to word 
splitting and globbing. **Double quotes are often the correct choice.** You can also prevent substitution for a specific variable
using a backslash:

```bash
SHELL=bash 
# We can escape the substitution with \
echo "\$SHELL is set to $SHELL"
>$SHELL is set to bash
```

This will print "$SHELL is set to bash".
What about curly braces? They're used to isolate variable names, especially in longer strings. For example:

```bash
GREET="Hello_"
# $GREETWorld is not set!
echo "$GREETWorld"
>
# Correct way
echo "${GREET}World"
>Hello_World
```

In the first `echo`, bash looks for a variable named `GREETWorld`, which doesn't exist, resulting in an empty string. 
The second `echo` correctly uses curly braces to isolate the `GREET` variable, printing "Hello_World".

## SOURCE and EXPORT

Let's discuss "source" and "export." You might have used these keywords without fully understanding them. 
When you run a script, it's executed in a new (child) shell. Why does this matter? 
Because variables in the child shell might be different. For instance:

```bash
# Create myscript.sh that echo VAR variable
echo 'echo $VAR' >> myscript.sh
# Create the VAR variable and make sure is there
VAR="Hello"
echo $VAR
>Hello
# Lets try to launch the script
./myscript.sh
>
# Lets try to use source to launch the script
source myscript.sh
>Hello
# . acts like source
. myscript.sh
>Hello
# . is not the same as ./
. ./myscript.sh
>Hello
```
We create a script that echoes the `VAR` variable (note the single quotes). We then set `VAR` in the current shell. 
However, when we execute the script normally (`./myscript.sh`), it doesn't print the value because it's running 
in a new shell where VAR is not defined.  Using "source" (or `.`) runs the script in the current shell, allowing it to access `VAR`. 
Note that `.` is equivalent to `source`, but `.` (or `source`) is not the same as `./`, which specifies a path and creates a subshell.

What if you want to access `VAR` from the child shell as well? That's where "export" comes in. "export" makes a variable available 
to all child processes:

```bash
# Create myscript.sh that echo VAR2 variable
echo 'echo $VAR2' >> myscript.sh
# Set VAR2 and make sure that is there
VAR2="Hello"
echo $VAR2
>Hello
# Launch the script.. nothing is printed!
./myscript.sh
>
# Lets export the variable and try again! This time it works!
export VAR2
./myscript.sh
>Hello
# of course source still works as before
source ./myscript.sh
>Hello
```

We define `VAR2` and echo it from a script. The first execution prints nothing. After exporting `VAR2`, the script correctly prints 
"Hello" because the child shell can now access it. `source` still works as before, as the current shell also retains the variable.

## EVAL

"eval" is another useful command. Let's revisit our script example and try something different:

```bash
# Lets create a txt file with a simple text
echo "Hello_world" >> hello.txt
# we create a variable that contains another variable. 
# MYFILE is not resolved because the single quotes
COMMAND='cat $MYFILE'
# Lets define MYFILE var
MYFILE="hello.txt"
# If we call COMMAND resolve to cat $MYFILE
$COMMAND
>cat: '$MYFILE': No such file or directory
# While this resolve to cat hello.txt
eval $COMMAND
>Hello_world
```

We create a text file "hello.txt" containing "Hello_world". `COMMAND` stores the string "cat $MYFILE". 
Because of the single quotes, `$MYFILE` is not immediately resolved. We then define `MYFILE` as "hello.txt".

When we try to execute `$COMMAND`, it resolves to `cat $MYFILE`, which results in an error because there's no file named literally 
`$MYFILE`.  However, `eval $COMMAND` re-evaluates the content of `COMMAND`. This time, `$MYFILE` is substituted with "hello.txt," 
and the cat command successfully prints "Hello_world".  This is useful when you have variable names stored within other variables. 
However, be aware that "eval" can be risky if not used carefully, as it can lead to unexpected behavior (also never use it with untrusted sources). 
It's a powerful tool, but use it with caution.

We can And that is it for now… Happy Bash Coding…
