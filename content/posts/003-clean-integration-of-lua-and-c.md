---
title: Clean integration of Lua and C
created_at: 2013-08-08
description: A small, self-contained tutorial for how to get your C code to talk to Lua and vice versa
kind: article
tags: [lua, c, scripting]
---

Ever since thinking about building my own amateur game engine, I've wanted to integrate
scripting in it. Because I believe the advantages to outweigh the downsides.

<!-- more -->

So what are the advantages?

- You get a configuration format for free, you can just have your interpreter load some configuration files and then pull the necessary values
into the host program. Moreover you can also expose the defined values to other Lua scripts, opening the floodgates for modding.
- Security (sandboxing) if you want, you can quite easily disable I/O and other functionality for scripts. Since you can easily load multiple Lua interpreters and they're very lightweight, it's a piece of cake to have both a high-privilege and low-privilege interpreter, if required.
- Lua is -- in comparison to other scripting languages -- very easy to integrate with another language. It almost feels like a pleasure to integrate both, while it can feel like a cactus eating contest to integrate other scripting languages.

### Exemplary code, with redis

Whenever possible, I like to look at how well-written, modern projects handle this. In this case that's easy, [redis](http://redis.io/) has lua scripting! Quite a lot of things in redis are small, efficient, self-contained and liberally licensed (MIT), which makes it excellent to study and learn from. By the way, I think it's a good practice to look for ideas in other projects. The trick is to find some projects that you can easily go to and have a look at, confident that the author knows what she is doing. For me that project is redis.

Let's take the redis scripting code as an example:

Some other tutorials if you still have questions:

- [Using Lua with C++ — A short tutorial](http://csl.sublevel3.org/lua/)
- [IBM DeveloperWorks - Embed Lua for scriptable apps](http://www.ibm.com/developerworks/library/l-embed-lua/)

Alternatives to Lua to consider, that share some of its advantages (easy integration, ...):

- [Squirrel](http://www.squirrel-lang.org/)
- [AngelScript](http://www.angelcode.com/angelscript/)

Suggestions, comments? Feel free to send me a mail and if possible I'll amend the article or just write a Part II.

<!--
    TODO: sandboxing, luaL_openlibs(L) opens all libraries, even IO, shouldn't do that
    TODO: more sandboxing, separating interpreteters, one for GUI, one for AI, ...
-->