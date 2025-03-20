---
title: OpenGL analysis, spherical normal mapping
created_at: 2014-02-21
description: A small analysis of the WebGL sperical normal mapping demo as seen on ClickToRelease
kind: article
tags: [opengl, webgl]
draft: true
---

Deep in the vast reaches of the twitterspace, [this little
beauty](http://www.clicktorelease.com/code/spherical-normal-mapping/)
popped up on my monitor. Steeped in the cold, hard light of the monitor,
my eyes glazed over, and I knew I wanted it in my toy engine.

For a long time, any engine worth its iodine-enhanced salt has supported
environment and normal mapping (almost like bump mapping). After this
article, my fledgling engine will, too!

<!-- more -->

Before we start discussing what's actually implemented in the demo let's
get some terminology out of the way.

Difference between normal mapping, bump mapping, et cetera
----------------------------------------------------------

There is some confusion about this, for some, they're not different. For
others, bump mapping happens with a greyscale *heightmap* from which you
calculate the new surface normals from the old ones (like an offset), and normal
mapping uses a RGB map which has pre-computed normals.

Then there are those who think of bump-mapping as a catch-all term for
faking geometry (in this case faking relief) on a mesh. For them, the
greyscale heightmap approach, the RGB normal map and even RGBA parallax
maps are instances of the same technique, with slightly different
approaches.

To sum it up:

1. A single-channel (greyscale) heightmap, commonly referred to as a
**bump map**.
2. A RGB map (like a regular color texture), usually called a **normal
map**.
3. A RGBA map (like a color texture with transparancy), usually called a
**parallax map**. This is actually a combination of a **bump map** and a
**normal map**.

~~~
#!javascript
// code here
~~~

Research
--------

1. [gamedev.net forum: the differen between bump-mapping and
   normal-mapping](http://www.gamedev.net/topic/567076-difference-between-bump-mapping-and-normal-mapping/)
2. [poorvaj/io: exploring bump-mapping with
   WebGL](https://apoorvaj.io/exploring-bump-mapping-with-webgl): compares
   normal mapping and (steep) parallax mapping, with open-source assets.
