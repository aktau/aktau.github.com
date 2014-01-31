Nicolas Hillegeer's blog
========================

Uses the `nanoc` static site generator systen, to try it out for yourself,
here are some steps you can follow on OSX:

```sh
# install a recent (and local) ruby
$ brew install ruby

# make sure the local ruby and gem paths are added to $PAH, make sure `which gem` gives the local gem executable
$ gem install bundler
$ git clone ...
$ cd aktau.github.com
$ export BUNDLE_BIN="/usr/local/bin"
$ bundle install
$ nanoc
$ nanoc view
```
