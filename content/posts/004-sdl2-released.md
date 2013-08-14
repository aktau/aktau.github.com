---
title: SDL2 (2.0.0) released at last!
created_at: 2013-08-13
description: The 2nd version of the ubiquitous game development library SDL was released today. Game developers everywhere rejoice
kind: article
tags: [sdl, game-engine, open-source]
---

For the impatient: [get it here](http://www.libsdl.org/) and read the [migration guide](http://wiki.libsdl.org/moin.fcg/MigrationGuide). SDL is an open-source game development library. It's been a long time coming, and some thought SDL2 was going to follow the path of Duke Nukem Forever: always a spectre on the horizon, but never being released. According to twitter it was in development for 2666 days, but the end result is beautiful.

<!-- more -->

For those of you who don't know, SDL helps developers create cross-platform games by abstracting window creation, input,
networking (with extension libraries), et cetera. In this way, there doesn't need to be icky conditional compilation based on OS, nor different
input subsystems according to different capabilities and so forth.

Copied from the mailing list, here are the most important new features:

- Full 3D hardware acceleration
- Support for OpenGL 3.0+ in various profiles (core, compatibility, debug, robust, etc)
- Support for OpenGL ES
- Support for multiple windows
- Support for multiple displays
- Support for multiple audio devices
- Android and iOS support
- Simple 2D rendering API that can use Direct3D, OpenGL, OpenGL ES, or software rendering behind the scenes
- Force Feedback available on Windows, Mac OS X and Linux
- XInput and XAudio2 support for Windows
- Atomic operations
- Power management (exposes battery life remaining, etc)
- Shaped windows
- 32-bit audio (int and float)
- Simplified Game Controller API (the Joystick API is still here, too!)
- Touch support (multitouch, gestures, etc)
- Better fullscreen support
- Better keyboard support (scancodes vs keycodes, etc).
- Message boxes
- Clipboard support
- Basic Drag'n'Drop support
- Proper unicode input and IME support
- A really powerful assert macro
- Lots of old annoyances from 1.2 are gone
- Many other things!

If you develop your code with just SDL, (optionally) OpenGL and the standard
C or C++ library, your code is immediately portable to all the operating systems which SDL supports. That includes Android and iPhone by the way. [^1]
So it pays off to use it, especially if you're in the market to develop games commercially: **write once, run on your toaster**.

SDL also features a drawing API, which is now hardware accelerated when possible thanks to SDL2. They worked very hard on this feature, though I
hardly use it. This is because I choose to perform my drawing with OpenGL. So in short, I just use SDL to open my OpenGL window(s).

I'm using SDL in my own [toy weekend-project](https://github.com/warfare/prototype) as well. Since I only started it a month ago I decided
to go with SDL2 even though it was still in release candidate status. It has worked perfectly up until now and has proved that it deserved it's **rc** status.
I keep SDL in my source tree (like redis does with its dependencies) so I manually merged the new version and found that most of the changes
were minor (except for haptics support, which I don't use).

And because I can't post and article without a bit of code, here's the `main()` method of my toy project: (yes it's ugly, but I named it prototype so it's ok). [^2]

~~~~~~~~~
#!c
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <math.h>
#include <stdint.h>
#include <limits.h>

/**
 * this is mac only, probably gl/gl3.h for linux and something else for win.
 * For win we will likely also need glew or another extension loader.
 */
#define GL3_PROTOTYPES
#include <OpenGL/gl3.h>

#include "SDL.h"

#include "util.h"
#include "vec.h"

static void printGlInfo() {
    const char *str[] = {
        "version",
        "renderer",
        "vendor",
        "shading_language_version"
    };

    const unsigned int constant[] = {
        GL_VERSION,
        GL_RENDERER,
        GL_VENDOR,
        GL_SHADING_LANGUAGE_VERSION
    };

    for (int i = 0; i < (int) ARRAY_SIZE(constant); ++i) {
        const unsigned char *info = glGetString(constant[i]);

        if (info == NULL) {
            trace("could not retrieve %s information, aborting\n", str[i]);

            exit(-1);
        }
        else {
            trace("%s: %s\n", str[i], info);
        }
    }

    GLint major;
    GLint minor;

    glGetIntegerv(GL_MAJOR_VERSION, &major);
    glGetIntegerv(GL_MINOR_VERSION, &minor);

    trace("context version double check: %d.%d\n", major, minor);
}

int main(int argc, char* argv[]) {
    int vsync     = 0;
    int doublebuf = 1;

    /* 16:9 => 704x440 */
    int width  = 800;
    int height = 600;

    SDL_Init(SDL_INIT_VIDEO);

    /* set the opengl context version, this is the latest that OSX can handle, for now... */
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 2);

    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, doublebuf);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);

    SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);

    SDL_Window *window = SDL_CreateWindow(
        "SDL2/OpenGL prototype",
        SDL_WINDOWPOS_UNDEFINED,
        SDL_WINDOWPOS_UNDEFINED,
        width, height,
        SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE
    );

    SDL_GLContext glcontext = SDL_GL_CreateContext(window);

    printGlInfo();

    /* set the background black */
    glClearColor( 0.0f, 0.0f, 0.0f, 1.0f );
    glClearDepth( 1.0f );
    glDisable(GL_DITHER);

    SDL_Event event;
    Uint8 done = 0;

    if (SDL_GL_SetSwapInterval(vsync) == -1) {
        trace("could not set desired vsync mode: %d", vsync);
    }

    trace("starting to render, vsync is %d\n", SDL_GL_GetSwapInterval());

    setupTransform(width, height);

    /* implementation not shown, lots of tutorials on the net, or check the original source */
    GLuint vtShader, fgShader, program;
    setupShaders(&vtShader, &fgShader, &program);

    GLuint vao, vbo, cbo, ibo;
    genTriangle(&vao, &vbo, &cbo, &ibo);

    while (!done) {
        while (SDL_PollEvent(&event)) {
            switch (event.type) {
                case SDL_WINDOWEVENT:
                    switch (event.window.event) {
                        case SDL_WINDOWEVENT_RESIZED:
                        {
                            int newWidth  = event.window.data1;
                            int newHeight = event.window.data2;

                            trace(
                                "Window %d resized to %dx%d\n",
                                event.window.windowID,
                                newWidth, newHeight
                            );

                            setupTransform(newWidth, newHeight);
                        }
                        break;
                    }
                    break;

                case SDL_KEYDOWN:
                    break;

                case SDL_KEYUP:
                    switch (event.key.keysym.sym) {
                        case SDLK_ESCAPE:
                            done = 1;
                        break;

                        case SDLK_v:
                            vsync = !vsync;

                            if (SDL_GL_SetSwapInterval(vsync) == -1) {
                                trace("could not set desired vsync mode: %s\n", (vsync ? "on" : "off"));
                            }
                            else {
                                trace("turned vsync %s\n", (vsync ? "on" : "off"));
                            }
                        break;

                        case SDLK_d:
                            doublebuf = !doublebuf;

                            if (SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, doublebuf) == -1) {
                                trace("could not set desired doublebuf mode: %d\n", doublebuf);
                            }
                            else {
                                trace("turned doublebuf %s\n", (doublebuf ? "on" : "off"));
                            }
                        break;
                    }
                    break;

                case SDL_QUIT:
                    done = 1;
                    break;

                // default:
                //     trace("unkown even type received: %d\n", event.type);
            }
        }

        render();

        SDL_GL_SwapWindow(window);

        diagFrameDone(window);
    }

    /* implementation not shown, lots of tutorials on the net, or check the original source */
    destroyTriangle(&vao, &vbo, &cbo, &ibo);
    destroyShaders(&vtShader, &fgShader, &program);

    SDL_GL_DeleteContext(glcontext);

    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
~~~~~~~~~

[^1]: Okay, you might have to add a bit of effort for iPhone and Android, especially if you're developing with OpenGL and you haven't restricted yourself to the OpenGL ES subset. The plaforms' respective preference for Objective-C and Java might also give some troubles, but at least SDL has been adapted to work with those.
[^2]: I realized that as an inexperienced game developer, I was going to make a crappy engine before making a decent one. So I decided to not even give my first creation a real name.