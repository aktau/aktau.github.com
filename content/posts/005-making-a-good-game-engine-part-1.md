---
title: Making a good game engine (part 1)
created_at: 2013-08-14
description: In this article I write about how I finally started making my own 3D game engine, and about how much it sucks.
kind: article
tags: [sdl, game-engine, open-source, data-driven]
draft: true
---

I've -- for a very long time -- wanted to make my own game engine. Worse, I want to make a good game engine. One that
would allow me to produce nice visuals with comparatively little effort while still maintaining a good framerate. That would
allow me to script it's behaviour and thus change it at runtime. An engine that makes use of the latest and greates graphics
stack (OpenGL 3.2+, for my OSX-using self). And it must have efficient and believable physics and ragdolls. Oh, and cool
water shaders like Crysis (and by now hundreds of other games). And I'd like networking too, and elegant code, and did I mention physics?
Basically, for my unexperienced self, I want to go to the end of the rainbow and tell it that the laws of nature don't apply
to me...

<!-- more -->

**DISCLAIMER**: I've never written an actual game engine before. When I was young I coded up a
[Zatacka](http://zatacka.sourceforge.net/index.php?id=screens)[^1]-clone in SDL after
following [Jari Komppa](http://sol.gfxile.net/gp/index.html)'s tutorial. I loved that falling snow! After that my game-making tapered
off a bit and I can painfully remember that I couldn't even muster up the discipline to code up a tetris-clone. I guess I liked my
win32 wildcard filename searcher better [^2]. It took many years before I wrote a simple 2D-game (also with SDL but this time drawing
with OpenGL) that was supposed to teach butterfly evolution to a bunch of pre-schoolers. I learned C++ specifically for the project
because that's what game programmers did, or so I had read once. Needless to say, this was a mistake:
new language + not experienced at game making = frantic coding to make up for lost time. It did provide me with a handle on C++ and a bit more
of an idea of what it might mean to make an engine.

But still, the idea lingered, and I wanted all those things that I wrote at the top of the page. I realized quite early that I couldn't have all those things.
It takes people far more experienced and likely also far smarter than me a lot of time to come up with engines like the one I want. How
on earth am I supposed to do it then?

Well, from my earlier experiments, I had learned two things:

1) your first attempt(s) suck.
2) every subsequent attempt gets better.
3) agonizing over design is sometimes very necessary and sometimes utter crap.

The two first points are nshrined in such common wisdom as "*practice makes perfect*", this should come as no surprise. The third one
seems to provide no value at all. I'll try to clarify. For the butterfly evolution game I needed the students to play against each other:
multiplayer. I thought about my Zatacka-clone, how I had made it and tried to add multiplayer to it after "perfecting" the singleplayer.
And how incredibly painful that was. I just couldn't get it to work right, after a short while my players would desync or have any of
a million other issues. It took about a month for me to realize that Zatacka-multiplayer was unsalvageable. The game had just not been made
with multiplayer in mind, and to shoehorn it in was the worst idea ever.

Networking: link to John Carmack's plan in which he lays out input/output. Link to tribes 2 networking design. Link to valve networking design.

This is the reason I have so much respect for (f.ex) the people that made [Multi Theft Auto](http://www.mtavc.com/): they made a networked
game out of a very complex, strictly singleplayer game, without having the source. My mind was blown. I couldn't even do that for a game
so simple a cellular automaton could have made it, and I even had the source!

I had very little experience with socket programming and perhaps less with game design, but one thing I could foresee was
that it would be absolute madness to shoehorn such a thing as multiplayer into a game designed as a

Like all things, engine design is subject to certain trends and even fads. The one that's currently (in 2013) the strongest and has been
growing for a couple of years seems to be the \textbf{data-driven engine}. Sounds pretty generic, right? Which engine isn't driven
by data? What does it mean?

### Choosing a language

C++11 looks awesome, but I find that classes distract from the true core of the data-driven religion.

### The pipeline

The point is to view your data as streaming through a pipeline

The cache, bro.

### No more trees

Trees are bad for caches... or are they?

### Tooling

Well, that's a whole different can of worms. I'm not much of a tools programmer nor do I enjoy it very much. So I'll try to reuse
as much as humanly possible in this aspect.

[^1]: Also known as "*Achting die Kurve!*"
[^2]: Years later, I encountered [everything](http://www.voidtools.com/), which did what my tool did, only way better. I was just using a linked list and looped through it and he had a fancy data structure for searching! In retrospect and given my current knowledge of algorithms, my app sucked (a lot). But, even if it was poorly designed, it ran blazing fast, I never noticed any slowdown. This was because I coded it in C, and C is fast, *real* fast. This is actually what started a long lasting love affair between me and C. I guess my young self already realized that my code was a bit poor, but that C was making up for it and that I could use my app and be happy.