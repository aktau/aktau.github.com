---
title: Introduction
created_at: 2013-08-06
description: Introduction
kind: article
tags: [introduction, nanoc, pygments, github]
---
Welcome to my brand new page, this will hopefully be the least interesting of all the things I write here. So what will I write about?

- **programming**: when I've got something to say about the open-source software I write, or want to illustrate a technique I utilised while writing closed-source software.

The blog is hosted (for now) on [github](https://github.com/), and statically generated with [nanoc](http://nanoc.ws/). At first I thought that -- not exactly being a rubyist -- it would be quite hard to get started, but I managed to set it all up in a day. It's not that difficult after all. The most difficult thing was probably to get [pygments](http://pygments.org/) to work for code highlighting and choosing an apprioprate style, I chose to emulate github.

There are plenty of tutorials on how to get started, but here's a nudge if you're on OSX:

~~~~~~~~
#!bash
# get the latest and greatest ruby
$ brew install ruby

# make sure the local ruby and gem paths are added to $PAH, make sure
# `which gem` gives the local gem executable
# instead of the system default
$ edit ~/.zshrc # or ~/.bashrc ...

$ gem install bundler

# clone this repo or your own or start from scratch
# the repo has a gemfile with most of the things you
# need to get started
$ git clone ...

# if you want code highlighting, install pygments
# (alternatively you can use the built-in CodeRay)
$ sudo easy_install Pygments

$ cd aktau.github.com

# make sure bundler exports its executables to /usr/local/bin
$ export BUNDLE_BIN="/usr/local/bin"
$ bundle install

# compile with nanoc
$ nanoc # (or bundle exec nanoc, if you want to be specific about versions)

# if you want to have guard watch your folders and automatically
# recompile while you're editing, which is really handy, just
# do this once:
$ bundle exec guard init nanoc

#start watching:
$ bundle exec guard

# run nanoc's internal webserver to preview what you just did
$ nanoc view
~~~~~~~~
