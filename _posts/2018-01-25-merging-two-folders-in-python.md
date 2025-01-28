---
id: 155
title: 'Merging two folders in python.'
date: '2018-01-25T07:41:02+01:00'
author: Lord_evron
layout: post
guid: 'http://presspi/?p=155'
permalink: /2018/01/25/merging-two-folders-in-python/
categories:
    - Technical
tags:
    - code
    - technology
    - python
---

Recently I wanted to merge two folders in python and overwrite existing files in the destination folders. *Shutil* library offers a lot of high level file handling functions, however, noone of them offers offer the merging.  In particular the function `shutil.``copytree()` copy recursively the source three in the destination tree, but it requires that the destination folder must not exist.

In order to merge folders, here there is a small function that does exactly that:

```python
#recursively merge two folders including subfolders
def mergefolders(root_src_dir, root_dst_dir):
    for src_dir, dirs, files in os.walk(root_src_dir):
        dst_dir = src_dir.replace(root_src_dir, root_dst_dir, 1)
        if not os.path.exists(dst_dir):
            os.makedirs(dst_dir)
        for file_ in files:
            src_file = os.path.join(src_dir, file_)
            dst_file = os.path.join(dst_dir, file_)
            if os.path.exists(dst_file):
                os.remove(dst_file)
            shutil.copy(src_file, dst_dir)

```