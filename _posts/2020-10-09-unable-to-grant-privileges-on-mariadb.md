---
id: 825
title: 'Unable to Grant Privileges on MariaDB'
date: '2020-10-09T09:51:27+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=825'
permalink: /2020/10/09/unable-to-grant-privileges-on-mariadb/
yasr_schema_additional_fields:
    - 'a:39:{s:17:"yasr_schema_title";s:0:"";s:16:"yasr_book_author";s:0:"";s:21:"yasr_book_bookedition";s:0:"";s:20:"yasr_book_bookformat";s:15:"AudiobookFormat";s:14:"yasr_book_isbn";s:0:"";s:25:"yasr_book_number_of_pages";s:0:"";s:16:"yasr_movie_actor";s:0:"";s:19:"yasr_movie_director";s:0:"";s:19:"yasr_movie_duration";s:0:"";s:22:"yasr_movie_datecreated";s:0:"";s:18:"yasr_product_brand";s:0:"";s:16:"yasr_product_sku";s:0:"";s:37:"yasr_product_global_identifier_select";s:5:"gtin8";s:36:"yasr_product_global_identifier_value";s:0:"";s:18:"yasr_product_price";s:0:"";s:27:"yasr_product_price_currency";s:0:"";s:30:"yasr_product_price_valid_until";s:0:"";s:31:"yasr_product_price_availability";s:12:"Discontinued";s:22:"yasr_product_price_url";s:0:"";s:26:"yasr_localbusiness_address";s:0:"";s:29:"yasr_localbusiness_pricerange";s:0:"";s:28:"yasr_localbusiness_telephone";s:0:"";s:20:"yasr_recipe_cooktime";s:0:"";s:23:"yasr_recipe_description";s:0:"";s:20:"yasr_recipe_keywords";s:0:"";s:21:"yasr_recipe_nutrition";s:0:"";s:20:"yasr_recipe_preptime";s:0:"";s:26:"yasr_recipe_recipecategory";s:0:"";s:25:"yasr_recipe_recipecuisine";s:0:"";s:28:"yasr_recipe_recipeingredient";s:0:"";s:30:"yasr_recipe_recipeinstructions";s:0:"";s:17:"yasr_recipe_video";s:0:"";s:25:"yasr_software_application";s:0:"";s:16:"yasr_software_os";s:0:"";s:19:"yasr_software_price";s:0:"";s:28:"yasr_software_price_currency";s:0:"";s:31:"yasr_software_price_valid_until";s:0:"";s:32:"yasr_software_price_availability";s:12:"Discontinued";s:23:"yasr_software_price_url";s:0:"";}'
categories:
    - Technical
tags:
    - mariadb
    - mysql
    - wordpress
---

WordPress requires an SQL like database. On RPI there is no MySQL database, but there is an equivalent fully compatible DB called MariaDB. After a fresh install there’s no password set up initially for the user root, so is very important to fix that. You should use the secure installation script that come along.

```
sudo mysql_secure_installation
```

However, I wanted to fix that manually, so i typed:

```
DROP USER 'root'@'localhost';
CREATE USER 'root'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
```

Where basically I dropped the local user “root”, and created a new user root with a password. I also made sure that i granted all the privilege to it. You can Even add a “flush privilege” as ending command.

So after securing the root password in the DB, is a good practice to create a new user for each of your WordPress installation (Especially if you are hosting multiple site). The reason is easy. If one of the website gets compromised and you use the same db account for all the websites, then the attacked also compromised all the other Databases! However if each website has its own associated user with permission only on the specific database, then an attacker controlling that user cannot “see” or modify other tables in other databases.

Anyway, after login with the new root account, I created a new user and then a new table for the website and then I tried to give privilege on the new DB to the new account!:

```
CREATE USER 'wordpress'@'localhost' IDENTIFIED BY 'password';
CREATE DATABASE wordpress;
GRANT ALL ON wordpress.* TO 'wordpress'@'localhost';
```

Anyway the last command was failing saying that i did not had permission to WordPress database! This was very strange because I had just created it and i could list table create new entries in it and so on.. So after some investigation i found out that the problem was that when i granted \*.\* privileges to user root, the “GRANT OPTION” was not set. This was a problem because I had already dropped the other user “root”. So in order to fix that I need to manually edit the mysql.user table in the DB. My user could not issue grants, but it still had full power on all the Databases. So firstly i made sure that the grant privilege flag was not set with:

```
SELECT host,user,password,Grant_priv,Super_priv FROM mysql.user;
```

and indeed was showing “N” to the grant\_priv column. That had to be changed to “Y”.. for doing that i just typed:

```
UPDATE mysql.user SET Grant_priv='Y', Super_priv='Y' WHERE User='root';
FLUSH PRIVILEGES;
```

With after fixing that and logging off and on again, i was finally able to grant all the permission to the new created user for the WordPress database!

```
GRANT ALL ON wordpress.* TO 'wordpress'@'localhost';
```

I hope that this small guide will help you to fix this annoying issue. Also I hope makes you understand why using the user root for your WordPress installation is a really bad idea. They can access MySQL.user table and basically control all the users privileges, passwords etc. They can create new root users, revoke permission, granting them-self more permissions and so on.. So just create a new user for each installation and give permission just to the specific DB.