---
title: PowerShell and Turkish i problem
tags:  []
categories: [powershell, tips-tricks]
layout: post
description: PowerShell and Turkish i problem
comments: true
---

I have been using [psake][psake] for a long time without a problem. In case you haven't heard, [psake][psake] is a tiny, 
easy to use build automation tool written in PowerShell. Lately, I read [haacked's post about turkish i problem][haacked] 
which reminds me a bug I encountered when playing with psake :

	The term 'invoke-psake' is not recognized as the name of a cmdlet, function, 
	script file, or operable program. Check the spelling of the name, 
	or if a path was included, verify that the path is correct and try again.

If you're using Turkish culture, PowerShell is failing to find a function named 'invoke-psake' which in fact named as 'Invoke-psake'. 
So you can overcome it easily by setting current culture to a different one before calling any function. 
For psake, I chose to set current culture to invariant for minumum code change.	

	$currentThread = [System.Threading.Thread]::CurrentThread
	$invariantCulture = [System.Globalization.CultureInfo]::InvariantCulture
	$currentThread.CurrentCulture = $invariantCulture
	$currentThread.CurrentUICulture = $invariantCulture


Hope this helps.
[psake]: https://github.com/psake/psake
[haacked]: http://haacked.com/archive/2012/07/05/turkish-i-problem-and-why-you-should-care.aspx
