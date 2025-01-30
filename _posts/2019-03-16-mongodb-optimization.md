---
id: 545
title: 'MongoDB optimization'
date: '2019-03-16T18:58:06+01:00'
author: Lord_evron
layout: post
permalink: /2019/03/16/mongodb-optimization/
categories:
    - Technical
tags:
    - database
    - technology
    - mongodb
---

Databases are like religions; everyone believes theirs offers the ultimate solution. 
These organized collections of data are at the heart of almost every complex system. 
Even simple wordpress websites like this one have thousands of entries in a SQL-like database, 
usually running smoothly until one day they become slow, unresponsive, and resource-hungry. 
This article provides some tips on optimizing MongoDB databases by analyzing their statistics.


MongoDB is a NoSQL database that uses a document-oriented storage model. Instead of tables and rows, it uses collections and documents.
Collections are analogous to SQL tables, while documents are like entries within those tables. MongoDB stores data in BSON, a binary format similar to JSON.
It's scalable and generally offers excellent performance without any special optimization for most applications. 
These applications typically have relatively small datasets that fit comfortably in RAM, along with the indexes. 
Because MongoDB relies heavily on indexes, and both data and indexes are cached in RAM, performance is great in this ideal scenario.
Problems arise when the data outgrows the available RAM.

MongoDB utilizes WiredTiger as its storage engine. By default, WiredTiger's cache uses 1GB less than half of the available RAM. 
For instance, on a 16GB RAM machine, 7GB is allocated to the WiredTiger cache. This is just for data, not indexes, which consume additional memory. 
As you access data, it's cached in RAM. As long as you primarily work with this cached data, MongoDB performs very well. The frequently accessed data, indexes, 
and some memory for query processing constitute the "working set."
MongoDB's performance is optimal when the working set fits in RAM. This doesn't mean the entire dataset needs to fit in RAM,
just the frequently accessed data and indexes.

Consider time-series data as an example. On a 16GB RAM machine with MongoDB, the WiredTiger cache is 7GB. You store 2GB of sensor data per year. 
After 10 years, the data grows to 20GB, plus 10GB for indexes (1GB per year), totaling 30GB. 
If you primarily access data from the last year, your working set is only 3GB (2GB data + 1GB index), and performance remains excellent. 
Occasional queries on older data might be slower but still acceptable. However, if you constantly access the entire dataset randomly, 
performance will degrade significantly because the working set becomes 30GB, forcing MongoDB to constantly read data from disk and replace cache entries.

Remember that MongoDB compresses data on disk, but it's uncompressed in RAM. Use db.stats() to check the dataSize (uncompressed) 
and storageSize (compressed) to understand your true dataset size.  For example:
```json
{
  "dataSize" : 55624310342, // 55GB (uncompressed)
  "storageSize" : 21345422161, // 21GB (compressed)
  // ... other stats
}
```

You can also check index size with `db.stats()`.

How do you know if your data no longer fits in RAM? The first hint might come from the VM's disk I/O. High disk read activity suggests 
MongoDB is frequently reading from disk to populate the cache. MongoDB also provides statistics to help diagnose this. 
The `db.stats()` command provides several useful metrics:

- `ConcurrentTransactions`: Shows the number of available connections that can perform tasks concurrently. 
If this reaches zero, new requests are queued. This metric helps identify if there are too many concurrent requests. 
For example, if a service receives 1000 queries simultaneously, and each takes 1 minute, you might see this number drop to 0. 
A typical output might look like:

```json
"concurrentTransactions" : {
  "write" : {
    "out" : 0,
    "available" : 128,
    "totalTickets" : 128
  },
  "read" : {
    "out" : 1,
    "available" : 127,
    "totalTickets" : 128
  }
}
```


Before we proceed, let's understand WiredTiger cache eviction (removing data from the cache):

- Clean data: Unmodified data in the cache, identical to the disk version.
- Dirty data: Modified data in the cache, different from the disk version.

Eviction is triggered when:

- The cache exceeds 80% of its configured size.
- Dirty data exceeds a certain percentage of the cache (5% by default).
- A page grows too large (8MB by default). This is reflected in metrics like "maximum page size at eviction" and "pages evicted 
because they exceeded the in-memory maximum".

Now, back to the metrics:

- `pages-read-into-cache` and `unmodified pages evicted`: High values indicate data is cycling through the cache, suggesting the working set doesn't fit in RAM.
- `bytes currently in the cache` and `maximum bytes configured`: Show current and maximum cache usage.
- `tracked dirty bytes in the cache`, `tracked dirty pages in the cache`, and `bytes dirty in the cache cumulative`: Represent modified data not yet written to disk. High values might indicate slow writes.
- `pages-read-into-cache` and `pages-written-into-cache`: Reflect disk I/O activity.

With these metrics, you should have an overview of what is happening to the system. Notice that you may experience slow writes because of VM limitations. 
Indeed, despite many SSD disks on cloud providers having write speeds of 50MB/sec and above, the VM itself may not provide the full I/O capacity, 
and this can be a bottleneck for some applications. For example, in Azure, SSD disks provide more than *5000 IOPS* and *200MB/sec* transfer rate, 
but a VM like *Standard_E2_v3* might only have *3000 IOPS*, *23 MB/second* write, and *46 MB/second* read. So check the specs carefully.

If you discover that your dataset doesn't fit in RAM, you should try to optimize your queries, for example, in the case of time series, 
only accessing the latest data. So you should avoid services that, for example, automatically calculate statistics and query all the data every day, 
because this will create problems to the caching mechanism and growing your dataset beyond the RAM size. Also, make wise use of indexes because 
querying data outside indexes makes it super slow because the DB has to go through the complete dataset to look for the requested data. 
In this case, the MongoDB `$explain` command could provide a great overview of the query performed.

I hope that this article is useful. And if you do have questions, just drop me an email or a comment in the section below!

