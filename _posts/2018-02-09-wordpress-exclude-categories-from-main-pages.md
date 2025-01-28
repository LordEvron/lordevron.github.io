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

I wanted to restructure my WordPress site today, specifically to remove certain categories (my "Articles") from the main blog page.  Turns out, it's surprisingly simple:

1. Navigate to Posts → Categories.
2. Hover over the categories you want to hide and note the ID in the URL that appears.
3. With the category IDs in hand, edit your theme's functions.php file (Appearance → Editor).
4. Add the following PHP snippet to the end of the file, replacing 21 and 29 with the IDs of the categories you want to exclude.  To exclude additional categories, simply add their IDs, comma-separated, to the list.

```php
function exclude_category( $query ) {
  if ( $query->is_home() && $query->is_main_query() ) {
    $query->set( 'cat', '-21, -29' );
  }
}
add_action( 'pre_get_posts', 'exclude_category' );
```

Save the changes and refresh your site. The specified categories should now be hidden from your main blog page.

Bonus Tip:  If you list the category IDs without the minus sign (e.g., 21, 29), your main page will only display posts from those categories, effectively hiding everything else.

Hopefully this helps!
