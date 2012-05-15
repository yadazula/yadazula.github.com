---
title: Introducing S3Emulator
tags:  []
categories: [aws, s3]
layout: post
description: 
---

[Amazon S3][s3] is a great online storage service for cloud which designed to provide scalability, high availability and low latency. The service aims to maximize benefits of scale and to pass those benefits on to developers. Like many of Amazon's Web services, S3 is designed as a developer tool, leaving it to you to create compelling applications.

However it can be painful to work locally for development and testing purposes. For example if you need to separate development and production environments, you would double your buckets or worse you would create buckets for each individual developer. Or you need to run stress tests for your app and start playing with large number of objects. For every S3 operation you will hit the network which costs time and money. Or it's not very common but you need to develop on your laptop while midair on a flight ? When I google about these problems, I found another cloud provider Windows Azure already [has built-in local storage emulator][azure] which lets you code against a local storage system.


[s3]: http://aws.amazon.com/s3/
[azure]: http://msdn.microsoft.com/en-us/library/windowsazure/ff683674.aspx