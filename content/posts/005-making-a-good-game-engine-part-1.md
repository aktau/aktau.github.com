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

### 3D Math

Any game engine will need to perform a whole lot of mathematics.
Physics, translations, rotations, projections, skinning, ...: you name it,
the engine does it. If you're like me, you have always had this desire
to craft really performant code (where it matters, and sometimes
where it doesn't). As it happens, even when I was not busy actually
writing a graphics engine, I was at times amusing myself by
reading articles about it. One thing that caught my attention was
_template metaprogramming_ in C++. This was back when I still believed C++
was a good idea, mostly because all game engines were written in it.
It promised to deliver the
performance-conscious programmer from the hell of temporary allocations
and inefficient code. All this by making the compiler do all the work
thanks to the notably Turing-complete templates C++ offers. The price,
was a serious increase in complexity. But only on the inside, said
the proponents of this approach. Only the templates are complex, the
client code doesn't have to care that it's so complex.

While this may be true, there are two concerns I would like to note:

1. I don't particularly like using a piece of code that I couldn't
understand without an enormous effort. Template-based code seems to be
very *write once* in nature. After a while, not even the author might
understand it. (Granted, one could say the same about including LuaJIT
in one's codebase, but I feel that it's somehow different. Though
perhaps I'm just being arbitratry here).
2. It increases compile times a lot. C++ is already a slouch,
espcially when you're also using the STL, but template metaprogramming
magic doesn't help, at all. If there's one thing I hate when I'm working
on something, it's a long edit-inspect cycle. I want to be able to see
my changes a second after I make them. When I don't, I tend to either
lose my concentration or become frustrated.

But is there an alternative for intrepid performance-conscious
developers such as ourselves? Certainly, just use intrinsics, wrap them
in a nice function and let the compiler sort it all out -- quickly I
might add! A good example of this is the incomplete but functional
[threedee-simd library](https://github.com/rikusalminen/threedee-simd).
It is small and lean and compile very quickly, produces extremely
performant code and is (with less effor than templates) understandable.

To understand it you'd have to get the hang of some SIMD intrinsics first,
but after that it all becomes quite obvious. A good tip is working it
out on paper, because all the shuffling be consusing. The actual
difficult thing, once you get the hang of it and want to add parts to
the library, is to get the absolute last inch of performance out of it.
It's one thing to be able to write correct code with intrinsics, but
it's another entirely for that to satisfy the CPU's desires. There are
many SIMD functions and some combinations are better than others. Some
might even lead to performance no better than pure scala code. So you
might you as well write it in a scalar fashion.

That's the nice thing about threedee-simd, you can just write your
function scalar-style first if it doesn't exist yet. If it proves
to be oft-used, you can optimize the snot out of it and just replace the
call from the entrypoint with your shiny new implementation. Actually,
advanced compiler vectorizers like Clangs'
[SLP vectorizer](http://llvm.org/docs/Vectorizers.html#the-slp-vectorizer)
do a pretty good job of automatically vectorizing a lot of code, if you
give it the right nudge.

The right nudge in this case is usually two things:

1. The data has to be aligned on a SIMD boundary (16 bytes = 4 floats in
this case)
2. The loop in which the data is used has to have a constant number of
iterations or be manually unrolled.
3. You have to tell the compiler what can change and what pointers can
alias each other. The C99
[restrict](http://en.wikipedia.org/wiki/Restrict) keyword can be very
helpful with this, in conjunction with const.

After these simple things, you already have a decent chance the the
compiler will produce some pretty performant code. These requirements
are easy, for alignment it's enough to use a special typedef that
enforces alignment. If you dynamically allocate memory for these types,
you have to tell your `malloc` variant to give you 16-byte aligned
memory though. These are the types from threedee-simd:

~~~
#!c
typedef float vec4 __attribute__((vector_size(16)));
typedef float scalar;

struct mat4_t
{
      vec4 cols[4];
} __attribute__((aligned(16)));

typedef struct mat4_t mat4;
~~~

When you use these types, any on-stack variables with these types will
be aligned correctly. What's more, when you pass these variables to
function, the compiler can assume they are aligned correctly, which
makes it easier to vectorize.

~~~
#!c
/**
 * convert an axis-angle vector to a quaternion
 * angle in radians
 *
 * [axis.x, axis.y, axis.z, angle] => quaternion
 */
static inline vec4 quat_axisangle_shuf(vec4 axisangle) __attribute__((always_inline));
static inline vec4 quat_axisangle_shuf(vec4 axisangle) {
    vec4 vsn, vcs;
    vsincos(vsplat(axisangle * vscalar(0.5f), 3), &vsn, &vcs);

    vec4 sincos = vshuffle(vsn, vcs, 0, 0, 0, 0);
    return vxyz1(axisangle) * vshuffle(sincos, sincos, 0, 0, 0, 2);
}

/**
 * a little bit faster, especially when you have FMA instructions, but
 * less readable too
 */
static inline vec4 quat_axisangle_clever(vec4 axisangle) __attribute__((always_inline));
static inline vec4 quat_axisangle_clever(vec4 axisangle) {
    return vxyz1(axisangle) * vsin(vmadd(vsplat(axisangle, 3), vscalar(0.5f), vec(0, 0, 0, M_PI_F * 0.5f)));
}
~~~

[^1]: Also known as "*Achting die Kurve!*"
[^2]: Years later, I encountered [everything](http://www.voidtools.com/), which did what my tool did, only way better. I was just using a linked list and looped through it and he had a fancy data structure for searching! In retrospect and given my current knowledge of algorithms, my app sucked (a lot). But, even if it was poorly designed, it ran blazing fast, I never noticed any slowdown. This was because I coded it in C, and C is fast, *real* fast. This is actually what started a long lasting love affair between me and C. I guess my young self already realized that my code was a bit poor, but that C was making up for it and that I could use my app and be happy.
