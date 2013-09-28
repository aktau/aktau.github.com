---
title: Detecting interlaced video with ffmpeg
created_at: 2013-09-22
description: This small article describes how to use ffmpeg's commandline tools to detect pretty accurately whether or not a video files is interlaced
kind: article
tags: [ffmpeg]
---

Today I had to decide whether some video files are interlaced or not. This has an effect on which flags I pass to the
underlying video player ([mpv](http://mpv.io/) in this case) to enable deinterlacing and get rid of that nasty combing effect.

<!-- more -->

Searching the internet I found that many people say that you can only really see if a video is interlaced or not by looking at it
frame by frame. One can't rely on any metadata present in the video file, which you can get for example by running `mediainfo`.
It happens quite often that this metadata is just *wrong*.

While this is true, I have no patience for manually viewing each file, especially because I'm dealing with thousands of user-submitted videos.
So I kept digging and found an automated solution that, while not 100% accurate, was more than accurate enough. Anything that slipped through
the cracks will be noticed and the users will hopefully notify me.

It turns out that **ffmpeg** has a filter called **idet** that (tries to) detect interlaced frames, and in my experience is quite
good at it. You'll need a pretty recent version of ffmpeg for this (later 2012 I believe,
the one in the debian wheezy repositories is not recent enough). Here's an example of how to use it:

~~~~~~~~
#!bash
# detect interlacing with the ffmpeg "idet" filter, the more frames
# you extract, the better, though it's never 100% accurate

# flags:
# -an            = discard audio, we don't need it
# -f rawvideo    = output raw video
# -y /dev/null   = discard the output
# -i ...         = the input file to check
# -frames:v 100  = extract the first 100 frames
# -filter:v idet = insert the "idet" filter, which will output whether it has detected interlaced frames

ffmpeg -filter:v idet \
    -frames:v 100 \
    -an \
    -f rawvideo -y /dev/null \
    -i ~/Downloads/some_interlaced_video.mkv
# Example output (this is interlaced, TFF style)
# [Parsed_idet_0 @ 0x1ccf7c0] Single frame detection: TFF:167 BFF:0 Progressive:1 Undetermined:0
# [Parsed_idet_0 @ 0x1ccf7c0] Multi frame detection: TFF:168 BFF:0 Progressive:0 Undetermined:0

ffmpeg -filter:v idet \
    -frames:v 100 \
    -an \
    -f rawvideo -y /dev/null \
    -i ~/Downloads/some_non_interlaced_video.mkv
# Example output (this is not interlaced):
# [Parsed_idet_0 @ 0x1bcf720] Single frame detection: TFF:0 BFF:0 Progressive:564 Undetermined:84
# [Parsed_idet_0 @ 0x1bcf720] Multi frame detection: TFF:0 BFF:0 Progressive:623 Undetermined:25
~~~~~~~~

If you see many frames next to *TFF* or *BFF*, that means a video is interlaced, if there are many in
progressive, that means it's not interlaced. If undetermined is the majority count, I guess you better
look at the file in person, but that hasn't happened to me yet.

Armed with this new tool I thought it would be a good idea to scan my entire HD looking and check them
all with the *idet* filter:

~~~~~~~~
#!bash
# scan all files on your HD, uses GNU parallel
# I believe this works just as well with standard
# xargs though
locate -0 '.mov' | parallel -0 ./ffmpeg -filter:v idet -frames:v 100 -an -f rawvideo -y /dev/null -i {} 2>&1 | egrep 'idet|Input'
~~~~~~~~

It turns out I only had 2, interlaced content indeed is quite rare for content on a computer, luckily so.
