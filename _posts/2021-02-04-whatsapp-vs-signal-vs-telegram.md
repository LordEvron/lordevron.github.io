---
id: 838
title: 'Whatsapp vs Signal vs Telegram'
date: '2021-02-04T17:46:43+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=838'
permalink: /2021/02/04/whatsapp-vs-signal-vs-telegram/
yasr_schema_additional_fields:
    - 'a:39:{s:17:"yasr_schema_title";s:0:"";s:16:"yasr_book_author";s:0:"";s:21:"yasr_book_bookedition";s:0:"";s:20:"yasr_book_bookformat";s:15:"AudiobookFormat";s:14:"yasr_book_isbn";s:0:"";s:25:"yasr_book_number_of_pages";s:0:"";s:16:"yasr_movie_actor";s:0:"";s:19:"yasr_movie_director";s:0:"";s:19:"yasr_movie_duration";s:0:"";s:22:"yasr_movie_datecreated";s:0:"";s:18:"yasr_product_brand";s:0:"";s:16:"yasr_product_sku";s:0:"";s:37:"yasr_product_global_identifier_select";s:5:"gtin8";s:36:"yasr_product_global_identifier_value";s:0:"";s:18:"yasr_product_price";s:0:"";s:27:"yasr_product_price_currency";s:0:"";s:30:"yasr_product_price_valid_until";s:0:"";s:31:"yasr_product_price_availability";s:12:"Discontinued";s:22:"yasr_product_price_url";s:0:"";s:26:"yasr_localbusiness_address";s:0:"";s:29:"yasr_localbusiness_pricerange";s:0:"";s:28:"yasr_localbusiness_telephone";s:0:"";s:20:"yasr_recipe_cooktime";s:0:"";s:23:"yasr_recipe_description";s:0:"";s:20:"yasr_recipe_keywords";s:0:"";s:21:"yasr_recipe_nutrition";s:0:"";s:20:"yasr_recipe_preptime";s:0:"";s:26:"yasr_recipe_recipecategory";s:0:"";s:25:"yasr_recipe_recipecuisine";s:0:"";s:28:"yasr_recipe_recipeingredient";s:0:"";s:30:"yasr_recipe_recipeinstructions";s:0:"";s:17:"yasr_recipe_video";s:0:"";s:25:"yasr_software_application";s:0:"";s:16:"yasr_software_os";s:0:"";s:19:"yasr_software_price";s:0:"";s:28:"yasr_software_price_currency";s:0:"";s:31:"yasr_software_price_valid_until";s:0:"";s:32:"yasr_software_price_availability";s:12:"Discontinued";s:23:"yasr_software_price_url";s:0:"";}'
categories:
    - Technical
tags:
    - security
    - signal
    - 'telegram messaging'
    - whatsapp
---

The recent privacy policy changes by Whatsapp has triggered a big migration towards similar platforms such as Signal and Telegram. But are those really better? Why? In this article we will see what are the strong and weak points of each of them from a privacy prospective.

So lets start to explore three basic concepts. Of course these definitions are quite simplified and generalized :

- Open source: when a code is open source it means, that the code is public and everyone can read it and understand not only what it does but also how it does it.
- End-to-end encryption. When a message is encrypted end to end, it means that the sender encrypt a message that only the receiver device can decrypt. None in the middle (including servers, hackers, or law enforcement) can in theory read or decrypt the messages.
- Encryption protocols: this define how the data gets encrypted. some protocols are more secure (eg harder to break) then others.

So the three apps differentiate each other on these three aspects. Lets see one by one:

## Whatsapp

Whatsapp is a closed source app owned by Facebook. This means that you cannot be sure of what the app does in reality. The only thing you can do is to trust them and their documentation. Unfortunately, in security, trust is BAD… Like, really Bad… So not a good start.. but lets see what they are suppose to do: They claim that all the messages are end to end encrypted (good) and it is “on” by default. This means that as soon as you start a new chat, it it automatically e2e encrypted.. As Encryption protocol they (claim to) use the Signal protocol, an open source encryption protocol developed by Open Whisper System.

## Telegram

Telegram is also owned by a for-profit Russian company, and is “kind” of open source. I said kind of because the APP is open source but the server side code is proprietary. When you use telegram your chat are NOT end-to-end encrypted by default, and the encryption keys are stored in their server, meaning that potentially, they can read all your conversations. You can enable the e2e encryption using “Secret-Chats”. As encryption protocol they use a custom made protocol that they developed. This is something that is really bad, since the first rule of security is “do not come with your new cool algorithm but use what has been already proven to be good”

## Signal

Signal is a truly open source project, where both the server side and the app side is open source. They are also the one developing (and using) the Signal encryption protocol that Whatsapp (and many more) uses. They are owned by “Signal Foundation” (successor of Open Whisper) that is a no-profit organization. The chats always are end-to-end protected and you can even add the functionality to auto-delete messages after a certain time.

## Comparison

So now that we have an overview of the main features and their *Owners* , we can discuss pros and cons of each of them. Whatsapp is completely closed source so, as i mention before, you cannot really know if they introduced a backdoor in the code that allows them to decrypt all the messages with a single key. So, if you are concerned about your messages to remain secret, you really need to trust them.. but who does not trust Facebook with regards of privacy? Signal on the other hands, is completely open source, and its code has been audited several times. This is the best way to earn trust! Telegram on the other hands lies in the middle. The reason is that they have a open source app (and that is the most important), however the server code is closed. we will get back to this in a sec.

Regarding the e2e encryption.. Whatsapp **claims** that is doing it, signal definitely do it. Telegram again lies in the middle. You COULD activate it, but is not there by default. It means that if you just start a normal chat, they server holds the keys for decrypting you chat…and the server code is closed source! So again they can do whatever with your messages. This to me sound super stupid, like locking your door with a super-safe door and leaving the key under the carpet..

The encryption algorithm.. The Signal one is developed by open Whispers based on known mathematical algorithms (good), while the one in telegram is custom made.. This does not necessary means is bad (but usually is..). They are simply using something that is not mathematically proved to be unbreakable. And the strange thing is that they had available better alternatives.

So you need to simply chose between:   
1\. Whatsapp that **Claims** that is doing things properly (but it does not show it)  
2\. Telegram, that showing things done in a suspiciously non optimal way.   
3\. Signal, that has been proven to fulfill all the basic security requirements.

## Metadata and Phone number

It is important to mention that the e2e encryption only protect the content of your message but not the metadata. This means that third parties cannot see the content of the messages that Alice sent to Bob, but they can see the size of it, when was sent, when was received, how often do they talk, who Alice talk to, common contacts, etc… These data gives up a lot of information about yourself, including your friend network. Often you do not need to read the message content to be able to know what two people talks about 🙂 …

Another big drawbacks present in the the requirements of phone number for registration.. This is what actually makes the metadata collected to be associated with your real identity. Ideally you would not need any phone number to register in order to preserve your privacy.

So in conclusion, my advise is to switch to signal to talk with your friends.. or use only “Secret chats” in telegram. Despite some questionable choices, Telegram support bots, super groups, channels, and these features alone makes it worth to be installed.

I hope you learned something new.. Happy texting!