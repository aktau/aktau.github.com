---
title: Introduction
created_at: 2013-08-06
description: Introducing my blog to the world
kind: article
tags: [introduction, nanoc, pygments, github]
---

Welcome to my brand new page, this will hopefully be the least
interesting of all the things I write here. So what do I plan to write
about?

<!-- more -->

- **programming**: when I've got something to say about the open-source
  software I write, or want to illustrate a technique I used while
  writing closed-source software.
- **investing**: currently I'm researching how to properly invest,
  seeing as having money stored away in your bank account is a losing
  proposition these days.

The blog is hosted (for now) on
[github](https://github.com/aktau/aktau.github.com), and statically
generated with [nanoc](http://nanoc.ws/). Take a look at the **nanoc**
branch if you want to see the source instead of the compiled form which
is being served.

At first I thought that -- not exactly being a rubyist -- it would be
quite hard to get started, but I managed to set it all up in a day. The
most difficult thing was probably to get
[pygments](http://pygments.org/) to work for code highlighting and
choosing an appropriate style, I chose to emulate github.

**EDIT**: I switched from the **pygments** filter to **pygments.rb**,
which sped up my compilations by more than 100x, go figure. My workflow
is way smoother now, and I only have to include **pygments.rb** in my
Gemfile and change one line in the Rules file.

There are plenty of tutorials on how to get started, but here's a nudge:
(might have to be adapted slightly if you're not on OSX)

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
$ nanoc view &
$ open localhost:3000

# alternatively use nginx instead of nanoc view
$ brew install nginx
$ ln -s /Users/Me/github/aktau/aktau.github.com/output /usr/local/var/www
$ open localhost:8080
~~~~~~~~
