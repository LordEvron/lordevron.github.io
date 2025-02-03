---
id: 825
title: 'Unable to Grant Privileges on MariaDB'
date: '2020-10-09T09:51:27+01:00'
author: Lord_evron
layout: post
permalink: /2020/10/09/unable-to-grant-privileges-on-mariadb/
categories:
    - Technical
tags:
    - technology
    - database
    - wordpress
---

WordPress needs an SQL-like database.  While a fresh Raspberry Pi install doesn't include MySQL, MariaDB, a fully 
compatible equivalent, is available.  Critically, the root user in MariaDB has no initial password, requiring immediate attention. 
The recommended approach is using the secure installation script:

```bash
sudo mysql_secure_installation
```

However, I opted for a manual approach:

```sql
DROP USER 'root'@'localhost';
CREATE USER 'root'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
```

This involved dropping the existing root user for localhost, creating a new root user with a password 
(which should not be 'password' in a real-world scenario!), and granting all privileges. 
Adding FLUSH PRIVILEGES; at the end is also good practice.

With the root password secured, creating a separate database user for each WordPress installation 
(especially if hosting multiple sites) is highly recommended. 
If all sites share the same database account and one site is compromised, all databases are vulnerable. 
Isolating each site with its own user, granted privileges only on its specific database, limits the damage from a compromised account.

After logging in with the secured root account, I created a new database user and a new database for the website. 
The next step was to grant the new user appropriate privileges on the new database.

```sql
CREATE USER 'wordpress'@'localhost' IDENTIFIED BY 'password';
CREATE DATABASE wordpress;
GRANT ALL ON wordpress.* TO 'wordpress'@'localhost';
```

The final command to grant privileges to the new WordPress database user failed, citing insufficient permissions. 
This was unexpected, as the database had just been created, and basic operations like listing tables and inserting data were possible.
After some investigation, the root cause was identified: while the root user had been granted `*.*` privileges, 
the `GRANT OPTION` was missing.  This was a problem because the original root user had already been dropped. 
The solution involved directly editing the `mysql.user` table.  Although the current root user couldn't issue grants, 
it still had full access to all databases.  The first step was to confirm that the grant privilege flag was indeed not set:

```sql
SELECT host,user,password,Grant_priv,Super_priv FROM mysql.user;
```

and indeed was showing `“N”` to the `grant_priv` column. That had to be changed to `“Y”`... to do so:

```sql
UPDATE mysql.user SET Grant_priv='Y', Super_priv='Y' WHERE User='root';
FLUSH PRIVILEGES;
```

After correcting the grant privileges issue, and logging out and back in, 
the new user was finally granted all necessary permissions on the WordPress database.

```sql
GRANT ALL ON wordpress.* TO 'wordpress'@'localhost';
```

I hope this short guide helps you resolve this frustrating issue. More importantly, I hope it illustrates why using the 
root user for your WordPress installation is a very bad idea.  The root user has access to the `mysql.user` table, 
giving them complete control over all users, privileges, passwords, and more. They can create new root users, 
revoke permissions, grant themselves additional permissions, and so on.  The best practice is to create a separate user 
for each WordPress installation, granting them privileges only on the relevant database.

