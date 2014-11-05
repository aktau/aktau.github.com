---
title: "Neovim: file encoding and you"
created_at: 2014-11-04
description: Try to explain how vim and neovim handle file encoding
kind: article
tags: [neovim, vim, encoding]
draft: true
---

We'll pick up where we left off last time, file encoding.

<!-- more -->

*Disclaimer: when I talk about Vim I will sometimes refer to Vim as
opposed to Neovim, and sometimes to mean both Vim and Neovim. The
context should hopefully make clear which one I mean.*

File encoding
-------------

File encoding is governed by the buffer-local `fileencoding` flag (which
for new files is set to the global `fileencoding` option). This means
that changing the global `fileencoding` flag doesn't have an immediate
effect. We'll have to look elsewhere this time.

How do we convert
-----------------

TODO:
- describe where `charconvert` fits in
