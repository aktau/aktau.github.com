---
title: Manage your app releases from the commandline with github-release
created_at: 2014-01-31
description: github-release is a small commandline app writtin in Golang
 that allows you to manage github releases -- information and artifacts
 (= binaries) -- from the comfort of the commandline.
kind: article
tags: [github,github-release,gofinance,golang,cross-compiling]
---

Recently I started on a new side-project:
[gofinance](https://github.com/aktau/gofinance). It dowloads and stores
financial data from the likes of Yahoo Finance, Bloomberg et al. It's
under heavy development but already provides me with a nice way of
viewing my stocks from the commandline. A blog post about it is underway
but I'm waiting until I can get a bit of security analysis code
commited.

Anyway, I felt the need to upload binaries when I got around to tagging
a usable release. Normally one would go to github after tagging and
pushing, and create the release manually, adding a description and
uploading the binaries.

Naturally, being a programmer, I wasn't content with this repetitive
clicking, so I automated the task, and
[github-release](https://github.com/aktau/github-release) was born.

<!-- more -->

It makes use of the rather recent [github API for managing
releases](http://developer.github.com/v3/repos/releases/), and takes
care of the dirty work for you.

It also allows you to check the current state of your releases. A small
example of some output I get out of the current version for the
`github-release` repo itself:

~~~~~~~~
#!bash
$ github-release info -u aktau -r github-release
git tags:
- v0.3 (commit: https://api.github.com/repos/aktau/github-release/commits/b30980cb2a0850689e9f68a75549e52f73893e0d)
- v0.2 (commit: https://api.github.com/repos/aktau/github-release/commits/264d2373ef74f60e94726ef37c5a7ee9164412d2)
- v0.1 (commit: https://api.github.com/repos/aktau/github-release/commits/20fa17d227789813e8a7bc24137d384f8e7e7a33)
releases:
-  v0.3, name: 'v0.3', description: 'v0.3', id: 167330, tagged: 30/01/2014 at 23:27, published: 30/01/2014 at 23:27, draft: ✔, prerelease: ✔
  - artifact: darwin-amd64-github-release.tar.bz2, downloads: 0, state: uploaded, type: application/octet-stream, size: 2.0MB, id: 68861
  - artifact: freebsd-amd64-github-release.tar.bz2, downloads: 0, state: uploaded, type: application/octet-stream, size: 2.0MB, id: 68862
  - artifact: linux-amd64-github-release.tar.bz2, downloads: 0, state: uploaded, type: application/octet-stream, size: 2.0MB, id: 68863
  - artifact: windows-amd64-github-release.zip, downloads: 0, state: uploaded, type: application/octet-stream, size: 2.1MB, id: 68864
~~~~~~~~

So there are 3 tags, and only one of them has a formal github release
(v0.3).  It has 4 artifacts, all about 2MB in size. I've automated this
entire process in a  makefile, so all I have to do is run `make release`
whenever I've made a new tag and presto, it builds all executables,
makes a formal release and uploads the artifacts. Check out the makefile
on the [project page](https://github.com/aktau/github-release).

All of this is made infinitely easier by the fact that
[golang](http://golang.org/) has awesome support for cross-compilation.
I can make a windows binary from the comfort of my OSX environment by
just issuing:

~~~~~~~~
#!bash
$ GOARCH=amd64 GOOS=windows go build
~~~~~~~~

And presto, there's a brand new `app.exe` in the directory. This,
combined with the fact that Go generates static binaries that are
entirely self-contained, makes for the easiest distribution and
deployment steps I've had in years. It's at least 1/4th of the reason
why I enjoy making stuff in Go. (others are ease of writing/reading,
speed, great standard library, ...). No more rbenv, virtualenv, pip, or
whatever shenanigans the next scripting language du jour comes up with.
