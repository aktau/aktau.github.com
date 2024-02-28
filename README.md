Nicolas Hillegeer's blog
========================

Uses the `nanoc` static site generator systen, to try it out for yourself,
here are some steps you can follow on OSX/Linux:

```sh
# install a recent (and local) ruby
$ brew install ruby

# make sure the local ruby and gem paths are added to $PAH, make sure `which gem` gives the local gem executable
$ gem install --user-install bundler
$ git clone ...
$ cd aktau.github.com
$ bundle config set --local path "$HOME/.local/share/gem"
$ bundle install
$ bundle exec nanoc
$ ( cd output/ && python3 -m http.server 3334 )
```
