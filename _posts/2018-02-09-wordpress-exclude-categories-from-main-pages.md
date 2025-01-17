---
id: 272
title: 'WordPress Exclude Categories from main pages'
date: '2018-02-09T16:18:47+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=272'
permalink: /2018/02/09/wordpress-exclude-categories-from-main-pages/
categories:
    - Technical
tags:
    - code
    - php
    - site
    - wordpress
---

Today I wanted to restructure this website, by excluding the Articles from Blog Section… I using worpress (Yeah, I am Lazy..) . So It turns out there is an easy solution for that:

1\. Go on Posts-&gt;Categories .

2\. Hover the mouse over the categories that you want to hide from the main blog page and look at the ID in the shown URL.

![](http://localhost:8080/wp-content/uploads/2018/02/Category-wordpress-300x167.jpg)

3 Now that you have the category ID you can edit the PHP file.. Go on Apperance–&gt;Editor, and locate the “***functions.php”*** File of your Template.

4\. Add this line of code in the end, substituting the categories that you want to exclude. In the example below i am excluding the categories 21 and 29. You can exclude more categories by adding more comma separated values.

<div class="wp-block-syntaxhighlighter-code ">```

#function exclude_category( $query ) {
  if ( $query->is_home() && $query->is_main_query() ) {
        $query->set( 'cat', '-21, -29' );
        }
  }
add_action( 'pre_get_posts', 'exclude_category' );
```

</div>5\. Save and reload… The selected categories now should not appear anymore on the main blog page.

ExtraTip: If you write *21, 29 (without the minus sign)* then you will ONLY show the categories 21 and 29 in the main page (hiding all the others).

I hope that was useful!