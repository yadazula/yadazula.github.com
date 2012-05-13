---
title: Hi.
layout: index
bodyclass: blog
permalink: /blog/index.html
---

*I'm [Gokhan](/about/). This is my blog where I talk about software.  [Subscribe](/feed.xml).*

<ul class="archive">
{% for post in site.posts %}
  <li>
      <time>{{ post.date | date: "%A, %B %d, %Y" }}</time>
      <a href="{{ post.url }}">{{ post.title }}</a>      
  </li>
{% endfor %}
</ul>
