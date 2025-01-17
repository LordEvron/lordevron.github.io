---
id: 835
title: 'Run a GUI program at Startup on LXDE'
date: '2020-12-09T19:55:18+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=835'
permalink: /2020/12/09/run-a-gui-program-on-startup-on-lxde/
yasr_schema_additional_fields:
    - 'a:39:{s:17:"yasr_schema_title";s:0:"";s:16:"yasr_book_author";s:0:"";s:21:"yasr_book_bookedition";s:0:"";s:20:"yasr_book_bookformat";s:15:"AudiobookFormat";s:14:"yasr_book_isbn";s:0:"";s:25:"yasr_book_number_of_pages";s:0:"";s:16:"yasr_movie_actor";s:0:"";s:19:"yasr_movie_director";s:0:"";s:19:"yasr_movie_duration";s:0:"";s:22:"yasr_movie_datecreated";s:0:"";s:18:"yasr_product_brand";s:0:"";s:16:"yasr_product_sku";s:0:"";s:37:"yasr_product_global_identifier_select";s:5:"gtin8";s:36:"yasr_product_global_identifier_value";s:0:"";s:18:"yasr_product_price";s:0:"";s:27:"yasr_product_price_currency";s:0:"";s:30:"yasr_product_price_valid_until";s:0:"";s:31:"yasr_product_price_availability";s:12:"Discontinued";s:22:"yasr_product_price_url";s:0:"";s:26:"yasr_localbusiness_address";s:0:"";s:29:"yasr_localbusiness_pricerange";s:0:"";s:28:"yasr_localbusiness_telephone";s:0:"";s:20:"yasr_recipe_cooktime";s:0:"";s:23:"yasr_recipe_description";s:0:"";s:20:"yasr_recipe_keywords";s:0:"";s:21:"yasr_recipe_nutrition";s:0:"";s:20:"yasr_recipe_preptime";s:0:"";s:26:"yasr_recipe_recipecategory";s:0:"";s:25:"yasr_recipe_recipecuisine";s:0:"";s:28:"yasr_recipe_recipeingredient";s:0:"";s:30:"yasr_recipe_recipeinstructions";s:0:"";s:17:"yasr_recipe_video";s:0:"";s:25:"yasr_software_application";s:0:"";s:16:"yasr_software_os";s:0:"";s:19:"yasr_software_price";s:0:"";s:28:"yasr_software_price_currency";s:0:"";s:31:"yasr_software_price_valid_until";s:0:"";s:32:"yasr_software_price_availability";s:12:"Discontinued";s:23:"yasr_software_price_url";s:0:"";}'
categories:
    - Technical
tags:
    - code
    - linux
    - startup
---

Have you ever needed to launch a GUI program that run at startup and goes directly into full screen mode? Probably not.. but if you do, just continue reading this post..

So.. what I wanted to do was to make my RPI to start a full screen software at startup. Why? not you business 😀 but can be useful for example if you want to use your RPI to show a calendar application or a clock or any other similar application and you do now want to manually launch it every time! So lets see how to do that.. The most common approach is to use cron (@startup). This works great for shell scripts and other Gui-less programs.. but it does not work if your program has a GUI interface and need the X-Window already loaded. If that is the case, cron is not a good choice. Of course you can try to do some hacks such as *“@startup sleep 400&amp;&amp;commands..”* but is quite ugly.. lets be professional… .

A better way that does exactly what we want is to leverage auto start feature of LDXE desktop environment. If you have already created a .desktop file for your software is enough to copy it into

<div class="wp-block-syntaxhighlighter-code ">```

home/pi/.config/autostart
```

</div>(create the autostart folder if is not already there). Don’t you know what is a desktop file? well is just a shortcut for lancing the application in linux (basically the icon that you have on your desktop). For creating one is quite easy.. Just create a text file with the extension .desktop. for example “leafpad.desktop” . The the content of the file is just:

<div class="wp-block-syntaxhighlighter-code ">```

[Desktop Entry]
Type=Application
Name=Leafpad
Exec=/usr/bin/leafpad
```

</div>This will create a shortcut to leafpad. You can click it and test that actually opens leafpad (make sure that the path is correct and you have installed it.)

So for starting it in full screen at startup is enough to copy/move that file inside home/pi/.config/autostart and you are done!

So at startup, LDXE will first try to run scripts that are in the “*/home/pi/.config/lxsession/LXDE-pi/autostart*” (the actual path may be a little different) and then launch any .desktop application that in the “*home/pi/.config/autostart”* folder*.*

So reboot your system and voilà.. leafpad starts at startup..

Now.. some of you smart-ass can ask: “*Can I use systemd services instead?* “. The answer is of course YES, but you need to make the service, configure the service, enable the service, start the service.. too much work 😀 .. (Also is cool to learn that also LXDE has autorun features.. )

I hope that is informative… and thanks for reading!