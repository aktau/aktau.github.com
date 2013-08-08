---
title: Clean integration of Lua and C
created_at: 2013-08-08
description: A small, self-contained tutorial for how to get your C code to talk to Lua and vice versa
kind: article
tags: [lua, c, scripting, game-engine, ffi]
draft: true
---

Ever since thinking about building my own amateur game engine, I've wanted to integrate
scripting in it. Because I believe the advantages to outweigh the downsides.

<!-- more -->

- **Configuration**: You get a configuration format for free, you can just have your interpreter load some configuration files and then pull the necessary values
into the host program. Moreover you can also expose the defined values to other Lua scripts, opening the floodgates for extensive modding.
- **Security**: If you want, you can quite easily disable I/O and other functionality for scripts. Since you can easily load multiple Lua interpreters and they're very lightweight, it's a piece of cake to have both a high-privilege and low-privilege interpreter, if required.
- **Ease of use**: Lua is -- in comparison to other scripting languages -- very easy to integrate with another language. It almost feels like a pleasure to integrate both, while it can feel like a cactus eating contest to integrate other scripting languages. After this integration, you can write all non-performance critical code in Lua, which is quite a bit easier than writing it in C all the time because you don't have to worry about allocation, object ownership and you have access to easier to use data structures.

### Exemplary code, with redis

Whenever possible, I like to look at how well-written, modern projects handle this. In this case that's easy, [redis](http://redis.io/) has lua scripting! Quite a lot of things in redis are small, efficient, self-contained and liberally licensed (MIT), which makes it excellent to study and learn from.

By the way, I think it's good practice to look for ideas in other projects. The trick is to remember some projects that you can have look at, confident that the author knows what she is doing. For me, that project is redis.

The other side of the coin though is that it can stifle your creativity. So maybe a good middle ground is to only start looking at things if you can't find a solution in 20 minutes or so.

Let's take the redis scripting code as an example:

### Sandboxing

This section is based on an answer from [stack overflow](http://stackoverflow.com/questions/966162/best-way-to-omit-lua-standard-libraries), and if we look
carefully we can see that the developers of redis took the same approach in *scripting.c*.

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