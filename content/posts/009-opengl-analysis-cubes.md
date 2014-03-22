---
title: OpenGL analysis, WebGL cubes
created_at: 2014-02-20
description: A small analysis of the WebGL cubes demo as seen on Google Chrome Experiments
kind: article
tags: [opengl, webgl]
draft: true
---

When I first saw the WebGL demo for spinning cubes, I was a bit amazed
at how smooth it was, so naturally I went for the "View Page Source"
menu and had a look.

<!-- more -->

My first hunch was that it used instanced rendering so as to tax the GPU
as little as possible. However WebGL doesn't support instanced
rendering.[^1] So how does it do what it does?

First of all, if you ever encounter a WebGL demo where you want to a
quick overview of what is happening, or don't want to learn a framework
yet want to know how it does it's magic? In that case you can use the
[WebGL Inspector](http://benvanik.github.io/WebGL-Inspector/). It is an
absolutely indispensable tool for the intrepid graphics developer. It's
often the first thing I activate when I find something new.

First it creates 3 big arrays to hold the position, normal and color
values of each triangle. Each face of a cube consists of 2 triangles,
and each cube consists of 6 faces, which

~~~
#!javascript
var triangles = 12 * 150000;
var geometry = new THREE.BufferGeometry();

function hw() {
    console.log("Hello, graphics language world");
}
~~~

Research
--------

1. Google I/O, WebGL optimized drawing of 10000 objects - http://www.youtube.com/watch?v=rfQ8rKGTVlg

[^1]: Not really true, there is an extension called [ANGLE_instanced_arrays](http://blog.tojicode.com/2013/07/webgl-instancing-with.html) which allows you to do instancing even in WebGL.
