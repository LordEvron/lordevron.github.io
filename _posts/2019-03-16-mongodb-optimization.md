---
id: 545
title: 'MongoDB optimization'
date: '2019-03-16T18:58:06+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=545'
permalink: /2019/03/16/mongodb-optimization/
yasr_overall_rating:
    - '0'
yasr_review_type:
    - Product
categories:
    - Technical
tags:
    - database
    - DB
    - mongo
    - mongodb
    - optimization
---

Databases are like religion. Everyone believe to withhold the ultimate best solutions… These ordered collection of data that are in the core almost all (if not all) complex systems. Even Simple website like this, have thousands of entries in a sql like database, and they never creates problems, until … one rainy day they do became slow, unresponsive, resource hungry… and that is where the pain start. Today I will give some hint on how to try to optimize a MongoDB database, by looking at its stats().

Lets start with some background. MongoDB is a non Relational Database, also called no-sql, that uses documents storage. Instead of having row, table etc, mongo uses Documents, and Collections. Basically a collection is the equivalent of SQL tables and Documents are entries in that collection. When Mongo, store new document in the collections, it uses the BSON format, a sort of json-like document in a binary format. MongoDB is scalable and can offers great performance in form of query speed, without doing any special optimization for 95% of the applications. Usually these applications have relative little data, and even in the case of million of entries, they still are only few GB in size and perfectly capable or being kept in RAM. Because mongoDB uses havly the indexs, and both the indexs and the dataset are kept in RAM, it offers really great performances in this ideal case. The problem arise when the data goes well beyond the available ram size. So what to do? In order to fix the problem, we need firstly understand what is the problem..Do we need to scale the VMs? will it help? do we need more cpu or ram?

So lets start to explain how mongoDB handle the cache. in this case, wiredTiger is the cache handler for mondoDB. By default it uses 1GB less then the half of the RAM. So for example if you machine has 16GB of ram, by default 7GB are reserved to wiredTiger. In case of 32GB RAM then the cache increase to 15GB and so on. Notice that this is only the Data cache and not the indexes. Indexed come in addition to it. So when you start to access the data, it get cached on RAM and until you access always the part of data that is held in RAM, mongoDB offers great performances. The data that you usually access plus the indexes (plus some extra memory for handling query that we will neglect), form the working set.  
So mongoDB works best when the working set can fit in RAM. **This DOES NOT MEAN THAT THE WHOLE DATASET should fit in ram.** It means that the data that usually accessed (cached) plus the index should fit in ram.

One good example is timeseries data. Suppose that you have 16GB RAM machine and you install mongodb. By default, this will reserve 7GB to wiredTiger. Now you start to store sensor data, that are 2GB for year. After 10 years data in mongoDB has grown to 20GB. Lets assume that you also have 1GB of index per year, thus adding another 10GB to the total. This sum up to 30GB, the double of your RAM. But if you normally only access data from last year, then your working set is actually only 3GB (2GB data + 1GB index) and thus your application will perform great. even if from time to time you do a query on 5 years ago data, it will be a little slower for that query, but still acceptable. However if you do start to access randomly all the data-set constantly, then you will see a huge degradation of performances, because your working set became 30GB and thus mongo will constantly need to read data from disk, and replace cache entries.

Something very important to KEEP in mind is that Mongo, compress the data when on disk, but the one in RAM is kept uncompressed. Using db.stats() you can find the two values,

“dataSize” : 55624310342, #55GB  
“storageSize” : 21345422161, #21GB

So you want to calculate the Dataset based on uncompressed data. Also from db.stats you can also check your index size.

Now the important question is: **how do I know that my data-set does not fit anymore in ram?** First hint should be from the VM stats itself. Here RAM usage will not help much, because mongoDB will tend to use all available memory and then release it when the OS request it back (basically uses <span class="st"> *memory* mapped IO</span>). But if you have high *DISK read operations* on the VM, this maybe an hint that mongo is constantly try to read data from it and move it to cache. So we can move to mongo Stats.

Mongo provides a great statistics that allows us to understand if we do have a problems with the dataset. Reading this statistic properly is key to understand how healthy our DB system is. From the db.stats() command some interesting metric are present. Some of these definition are taken from internet.

1. **ConcurrentTransaction** Metric: This metric resume the number of available connector that can perform task in parallel. When the available reach 0, then the other requests are queued waiting that one of “out” will be released. As we can see, they are all available and thus there is no problem of “too many threads” or too many processes trying to use the DB at the same time.. for example in case that a service receive 1000 query requests at the same time and each of those requests take 1 min to finish.. than we may see that that number go to 0.. but usually are not a problem.. The connectors entry look like this.

“concurrentTransactions” : {  
“write” : {  
“out” : 0,  
“available” : 128,  
“totalTickets” : 128  
},  
“read” : {  
“out” : 1,  
“available” : 127,  
“totalTickets” : 128

}

Before we continue, few useful info on wiredtiger cache and the eviction process (eviction is basically the removal/substitution of pages from cache):

**Clean (unmodified)** refers to data in the cache that is identical to the version stored on disk.

**Dirty (modified)** refers to data in the cache that has been modified and is different from the data stored in disk. This can happen for example when a document in cache is updated with new data.  
If the cache contains clean data, eviction removes the content from cache without further processing. If the cache contains dirty data, a consolidation step executes prior to eviction. This step synchronizes the data in the cache with the data on the disk.

**Eviction is triggered** by any of these conditions:

- The cache is at or beyond a specific threshold. WiredTiger attempts to keep the cache below 80% of the configured cache size. If the cache grows beyond this threshold, eviction is triggered to keep the cache at 80%. Allowing the cache to grow beyond 80% may result in stalling, especially if the cache contains a lot of dirty data, as WiredTiger must evict cache content while serving client requests at the same time .For example, if the cache is set at 1 GB, eviction starts when the cache reaches 800 MB.
- The cache contains too much dirty data. When dirty data reaches a certain percentage of the total cache size (5% by default in MongoDB 3.4), the cache eviction process starts. This trigger prevents the WiredTiger checkpoints process from having to write a large amount of dirty data, which slows down the checkpoint process and may appear to users as stalls on systems with slow disks.
- The page grows too large. Under certain workloads, such as bulk inserts of several megabyte documents or many updates to the same set of documents, the relevant in-memory page used by WiredTiger can grow beyond a set threshold (8 MB by default). To keep pages at a manageable size, the cache eviction process starts when a page grows beyond the threshold and prioritizes that page for eviction.  
    This is referred in the metrics called : “**maximum page size at eviction” “pages evicted because they exceeded the in-memory maximum”**

1. **pages-read-into-cache** and **unmodified pages evicted** metrics. High activity for those two metrics indicates that the server is cycling data through the cache, which means the working set does not fit in memory.
2. “**bytes currently in the cache**” and “**maximum bytes configured**” report statistics on the currently used level of the cache and the maximum size of the cache.
3. **“tracked dirty bytes in the cache”**, “**tracked dirty pages in the cache”** and **“bytes dirty in the cache cumulative”**. This metrics represent the dirty byte. **Dirty data** represent data in the cache that has been modified but not yet applied (flushed) to disk. If those values grow too much it could indicate that data isn’t being written to disk fast enough. Scaling out by adding more shard will help you reduce the amount of dirty data. Note that the amount of dirty data is expected to grow until the next checkpoint that in general is every 60 seconds (that is the default value)..
4. **pages-read-into-cache and pages-written-into-cache:** This two metrics reflect the IO disk level

So with this metrics you should have an overview of what is happening to the system. Notice that you may experience slow write because VM limitations. Indeed, despite many ssd disk on cloud providers have writes speed of 50MB/Sec and above, the VM itself may not provide the full I/O capacity and this can be a bottleneck for some application. For example in Azure, ssd disk provide more than 5000 io/sec and 200MB/Sec transfer rate, but the VM Standard\_E2\_v3 have only 3000io/sec, 23 MB/second as Write and 46 MB/second as read… So check the specs carefully.

So if you discover that your dataset does not fit anymore in ram, you should try to optimize your queries, by for example in case of dataseries, only accessing the latest data. So you should avoid services that for example automatically calculate statistics and query all the data every day, because this will create problems to the caching mechanism and growing your dataset beyond the RAM size. Also make a wise usage of indexes, because querying data outside indexes make it super slow, because the DB has to go thought the complete dataset to look for the requested data. In this case the MongoDB ***$Explain*** commands could provide great overview of the query performed.

I hope that this article is useful. And if you do have questions, just drop me an email of a comment in the section below!