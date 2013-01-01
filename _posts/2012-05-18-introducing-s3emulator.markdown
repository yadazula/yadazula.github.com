---
title: Introducing S3Emulator
tags:  []
categories: [aws, s3]
layout: post
description: Introducing S3Emulator
keywords: s3 emulator, s3emulator, amazon s3 emulator, amazon s3emulator, testing s3, mocking s3, faking s3
comments: true
---

[Amazon S3][s3] is a great online storage service for cloud which designed to provide scalability, high availability and low latency. 
However it can be painful to work locally for development and testing purposes. 
For example suppose that you need to run stress tests for your app and started to playing with large number of objects. 
For every S3 operation you will hit the network which costs time and money. 
Or you need to separate your development and production environments, 
you would double your buckets or worse you would create buckets for each individual developer. 
Or it's not very common but you need to develop on your laptop while midair on a flight ? 

When I google about these problems, I found another cloud provider Windows Azure already [has built-in local storage emulator][azure] 
which lets you code against a local storage system. I thougth a simular emulator for S3 which enables to work locally would be helpful. 
So I started [S3Emulator as an open source project on github][github]. Currently common operations like put, delete, list etc. on buckets and objects are supported.

Features
--------
- enable to work in memory or on disk
- bandwidth throttling for testing different network conditions
- [sub-domain style bucket names][bucketname]
- https support

How to use ?
------------
Download the binaries from [here][download]. 
Open a command promt window and enter : 

	S3Emulator
	
When started with default options, all the requests made to "s3.amazonaws.com" will be redirected to S3Emulator.
You can see the full list of options by entering 

	S3Emulator -help

For more info, you can check [github project page][github].

On the Shoulders of Giants
--------------------------
I think development becoming much more fun in those days with the raising number of the open source projects out there. 
Often you would find more than one project for your need, which is great. I used,

- [FiddlerCore][fiddler] for proxying 
- [Nancy][nancy] for the http stack
- [RavenDB][ravendb] for the storage operations

I should say I really liked RavenDB's architecture. It's very easy to get familiar with, and it works blazingly fast.


Please take time to play and test. Any feedback would be appreciated.


[s3]: http://aws.amazon.com/s3/
[azure]: http://msdn.microsoft.com/en-us/library/windowsazure/ff683674.aspx
[github]: https://github.com/yadazula/S3Emulator
[download]: http://github.com/yadazula/S3Emulator/downloads
[bucketname]: http://docs.amazonwebservices.com/AmazonS3/latest/dev/VirtualHosting.html#VirtualHostingSpecifyBucket
[fiddler]: http://www.fiddler2.com/Fiddler/Core/
[nancy]: https://github.com/NancyFx/Nancy
[ravendb]: http://ravendb.net/