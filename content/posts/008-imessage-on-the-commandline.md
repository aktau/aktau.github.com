---
title: Send iMessages via the commandline on OSX, even to yourself
created_at: 2014-02-12
description: this little applescript allows one to easily send an
 iMessage to anyone in your contact list by communicating with
 Messages.app
kind: article
tags: [imessage,osx,applescript]
---

Today on HN someone posted a small ruby utility to send iMessages via
the commandline, which piqued my interest. I would love to send messages
to my phone when one of my cronscripts discovers something interesting.
However, the utility doesn't allow sending to self.

So I looked around and found a way to get around this restriction, and
it doesn't even require ruby anymore!

<!-- more -->

After realizing the utility worked through applescript [^1], I perused
google to find a way to circumvent the inability to send to self. Lo and
behold, [Stack Overflow has the
answer](http://stackoverflow.com/questions/11812184/how-to-send-an-imessage-text-with-applescript-only-in-provided-service)!

I didn't like typing: `osascript "script" "number" "message"` all the
time, so I looked for [a way to use it like a normal UNIX
script](http://hints.macworld.com/article.php?story=20060425140531375).
With this unholy shebang hack, it now looks like this:

~~~~~~~~
#!applescript
#!/bin/sh
exec <"$0" || exit; read v; read v; exec /usr/bin/osascript - "$@"; exit

on run {targetBuddyPhone, targetMessage}
    tell application "Messages"
        set targetService to 1st service whose service type = iMessage
        set targetBuddy to buddy targetBuddyPhone of targetService
        send targetMessage to targetBuddy
    end tell
end run
~~~~~~~~

Gist version [here](https://gist.github.com/aktau/8958054). Paste that
in a file, make it executable with `chmod u+x "thefilename"` and you're
good to go. It doesn't even require Ruby, so you can just drop the
script in some folder in your `$PATH` and use it like this:

~~~~~~~~
#!bash
$ imessage 0487198747 "gofinance: your stock AAPL has gone up by 20%"
$ imessage 0495876923 "knock knock!"
~~~~~~~~

Those are not actual telephone numbers (that I know of), by the way.

[^1]: the ruby utility can be found on [github](https://github.com/chrisfsampaio/imsg)
