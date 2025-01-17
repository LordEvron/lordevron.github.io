---
id: 458
title: 'Variables in Bash'
date: '2020-05-20T15:59:36+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=458'
permalink: /2020/05/20/variables-in-bash/
yasr_schema_additional_fields:
    - 'a:22:{s:18:"yasr_product_brand";s:0:"";s:16:"yasr_product_sku";s:0:"";s:37:"yasr_product_global_identifier_select";s:5:"gtin8";s:36:"yasr_product_global_identifier_value";s:0:"";s:18:"yasr_product_price";s:0:"";s:27:"yasr_product_price_currency";s:0:"";s:30:"yasr_product_price_valid_until";s:0:"";s:31:"yasr_product_price_availability";s:12:"Discontinued";s:22:"yasr_product_price_url";s:0:"";s:26:"yasr_localbusiness_address";s:0:"";s:29:"yasr_localbusiness_pricerange";s:0:"";s:28:"yasr_localbusiness_telephone";s:0:"";s:20:"yasr_recipe_cooktime";s:0:"";s:23:"yasr_recipe_description";s:0:"";s:20:"yasr_recipe_keywords";s:0:"";s:21:"yasr_recipe_nutrition";s:0:"";s:20:"yasr_recipe_preptime";s:0:"";s:26:"yasr_recipe_recipecategory";s:0:"";s:25:"yasr_recipe_recipecuisine";s:0:"";s:28:"yasr_recipe_recipeingredient";s:0:"";s:30:"yasr_recipe_recipeinstructions";s:0:"";s:17:"yasr_recipe_video";s:0:"";}'
categories:
    - Technical
tags:
    - bash
    - code
    - linux
    - variables
---

Lets talk about variables in bash scripts. Nothing super technical, but this is just a small clarification article for a such useful features. But lets start from the beginning. .. What are bash variable and why a user or developer should care about it?

The answer is easy.. as the name suggest they are just variable that programs can access and read the value. The cool things, is that some of them are set by default and are called environmental variables. For example, suppose that your script/ software needs to read data from your local home folder. Usually this folder in linux system is “/home/USERNAME”. Of course you could hard-code that path for your special case, but this not a good approach, since it will only work for a specific username. How can you access that path without knowing the specific username (a part from ~)? One possible solution is by using env variable. For example linux env variable “HOME”. So from your shell script you can just access $HOME and that will resolve to the correct path. But if you are reading this article you already know all this.. lets move on.

## Shell scripting

If you have been shell scripting you probably noticed few things: for example what is the difference between:

<div class="wp-block-syntaxhighlighter-code ">```

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

</div>Lets see what each of those does, in particular, Lets start to see the effect on adding a single quote –&gt; echo ‘$GREET’  
In this case, bash threat the characters in between quotes as string and will not try to interpret it. So, echo ‘$GREET’ will print “$GREET”. So use single quotes IF you do not want any bash substitution. What about the other three commands?

With the double quotes, bash will try to substitute the variable in the string. So lets see this example:

<div class="wp-block-syntaxhighlighter-code ">```

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

</div>The command without quotes will raise an error since bash will actually use the | to pipe the two command together (“pipe” and “is”). the second example will print “pipe | is used to connect output in $SHELL”, while the third echo will print “pipe | is used to connect output in bash”. Also notice that in bash, string without quotes is subject to word splitting and globbing ***So double quotes are often the one you are meant to use***. Also we can explicitly tell bash to skip the substitution for a specific variable by using the backslash. For example:

<div class="wp-block-syntaxhighlighter-code ">```

SHELL=bash 
# We can escape the substitution with \
echo "\$SHELL is set to $SHELL"
>$SHELL is set to bash

```

</div>It will print “*$SHELL is set to bash*“  
Ok.. what about the curly braces? Well those are for isolating the Variable name in case you have long sentences. For example

<div class="wp-block-syntaxhighlighter-code ">```

GREET="Hello_"
# $GREETWorld is not set!
echo "$GREETWorld"
>
# Correct way
echo "${GREET}World"
>Hello_World
```

</div>In the first echo, bash will try to resolve a variable called *GREETWorld*, and by not finding it, it will return an empty string. In the second echo, the variable is correctly resolved and *“Hello\_world*” is printed.

## SOURCE and EXPORT

Few words about the two keywords, “source” and “export”. So it may have happened to lauch some scripts using those keywords without really knowing why. So by default when you launch a script it will be executed in a new (child) shell. So why you should care? Well because the variable for that new shell may be different. For example suppose that you do something like this:

<div class="wp-block-syntaxhighlighter-code ">```

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

</div>As you can see, you create a script that echo the variable VAR (notice the single quotes before &gt;&gt; ). Then you set VAR in the current shell and you can access that value with echo. However when you launch the script, it will not print the value. This happen because the script is launched in a new shell automatically and thus the value VAR is NOT defined in the new shell. However we can tell bash to run the script in the current shell with the “source” command. In this case, the script is run from the CURRENT SHELL, and thus it can access the variable VAR. The source command is also equivalent to “.” command. NOTICE THAT .=source but those are not the same as ./ (which basically is just specifying the path).

So what if I want to access the VAR also from the new child shell? then the EXPORT command comes in. With export you are telling bash to “export” that variable to all the child processes. So you can do this:

<div class="wp-block-syntaxhighlighter-code ">```

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

</div>Similar to what we have done before, we define a VAR2 variable and we echo that from a script. The first time that we call a script we get the empty string printed, however, after we export the variable VAR, and call again the script, it correcly print “Hello” since it can be accessed also from the new shell. Of course the current shell also retains it as you can see by calling “source ./myscript.sh”

## EVAL

Eval is another nice command that deserve its own small paragraph. Lets retake the example of our small echo command of the script, and lets do something different.

<div class="wp-block-syntaxhighlighter-code ">```

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

</div>So we create a txt file with “hello\_word” as text. Then we create a var name called COMMAND that hold a cat command and a $MYFILE. Because we are using single quotes, this is not resolved from bash, keeping it as $MYFILE. We then define this MYFILE as the text that we created in the beginning.

Look what happen when we try to launch $COMMAND… This will resolve to “cat $MYFILE” and there is no file called $MYFILE, thus raising an error. But when we use EVAL, the content of the COMMAND get reevaluated and $MYFILE var get substituted and the cat command succeed!. This can be useful if you have Variable names inside other variable names. However notice that the use of “eval” is not recommended because can easily lead to errors, however is a nice to know tool anyway and could be useful sometimes.

We can And that is it for now… Happy Bash Coding…