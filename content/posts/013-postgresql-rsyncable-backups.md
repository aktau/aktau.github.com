---
title: pg_dump and pigz, easy rsyncable backups with PostgreSQL
created_at: 2014-10-23
description: Research about the best way to create rsyncable backups with pg_dump
kind: article
tags: [postgres, pigz, rsync, sysadmin]
draft: false
---

Some time ago, I created an ad-hoc offsite backup solution for a MySQL
database after I recovered it. This happened after a client contacted me
when one of their legacy databases blew up. The recovery process was
quite painful because the backups that they had were corrupted and
incomplete (a monthly cronjob). I ended up with a simple setup that used
*mysqldump*, *gzip* and *rsnapshot* to great effect. This article talks
about effectively using a similar backup method with PostgreSQL.

<!-- more -->

The solution in MySQL-space
---------------------------

When preparing to deploy a solution I had made into production, I knew I
needed backups. Its main data store was a PostgreSQL 9.3 database, so I
remembered my MySQL adventure and went looking for similar tools to the
ones I used before. The core of the earlier MySQL solution
looked like this:

~~~
#!bash
# omitting all the rotation logic
mysqldump $OPTIONS --user=$USER --password=$PWD $DB --routines --no-data --add-drop-database --database $DB | gzip --rsyncable > "$DIR/schema.sql.gz"

TABLES=$(mysql --user=$USER --password=$PWD -Bse 'show tables' $DB)
for TABLE in $TABLES
do
    BACKUP_FILE="$DIR/${TABLE}.sql.gz"
    echo "dumping $TABLE into $BACKUP_FILE"
    mysqldump $OPTIONS --user=$USER --password=$PWD $DB $TABLE | gzip --rsyncable > "$BACKUP_FILE"
done
~~~

This dumps the database as separate files: `schema.sql.gz` to setup the
schema and `$TABLE.sql.gz` for the row data of each table. This allows
restoring of partial sets of data easily.

[mysqldump](dev.mysql.com/doc/en/mysqldump.html) outputs SQL on stdout
by default, which makes it easy to pipe to `gzip` to create compressed
archives. Data stored in databases is usually quite compressible, so
piping to *gzip* saves a lot of space.

There's a catch though. Regular *gzip* with no flags has a serious
disadvantage for offsite backup: a small change in the raw data provokes
a large change in the compressed data. This means that every time we
*rsync* the latest backup over, it will transfer the entire lot. Said in
another way, the speedup factor reported with the `--stats` flag is more
or less 1.00. Classic doubleplusungood.

That's why we supply the `--rsyncable` flag when compressing the data
with *gzip*. This resets the compression dictionary from time to time
such that the blocks are compressed independently. A small change in the
source will thus not change the entire compressed archive and the rsync
delta encoding algorithm can work its magic even on gzipped files!

Sadly, the `--rsyncable` flag is not mainline, it's a custom patch
carried by debian (and ubuntu). To top it off, it [seems that the patch
was misapplied for Debian
Wheezy](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=708423). It
doesn't even error out when using that flag for some reason, so I hadn't
noticed until a few days ago. This effectively brought my rsync speedup
factor to 1.00, poor backup server.

I went looking for alternatives. One could go for backports, testing
repositories or even custom packages but I'm always apprehensive of such
things in production servers. I looked at *lz4* (not available in Debian
Wheezy), *bzip2* (slow, large blocks), *xz/lzma* until finding what
appeared to be the solution: [pigz](http://zlib.net/pigz/). It's a
parallel implementation of *gzip*. It has mainlined support of
`--rsyncable` and is in the Wheezy repository.

Backing up with Postgres
------------------------

*mysqldump*'s equivalent in the Postgres world is
[pg_dump](http://www.postgresql.org/docs/devel/static/app-pgdump.html).
I like *pg_dump* better because it allows dumping in several formats
with accompanying up- and downsides. It also has a sister command
[pg_restore](http://www.postgresql.org/docs/devel/static/app-pgrestore.html)
allowing much more flexibility when restoring a backup. The 4 output
formats available at the moment of writing are (if you already know them
you can skip the list, it's mostly from the Postgres docs):

plain
: Like *mysqldump*, mostly SQL queries but with faster data
  loading (no `INSERT` statements but loading from heredoc-like
  buffers). This is the default. The big advantage of this format is
  that it is human-readable.

custom
: Output a custom-format archive suitable for input into
  pg_restore. Together with the directory output format, this is the
  most flexible output format in that it allows manual selection and
  reordering of archived items during restore. This format is also
  compressed by default. It's not human-readable though, unless you turn
  off compression with `-Z0`, in which case opening it in a text editor
  will allow one to make sense of a lot of things.

directory
: Output a directory-format archive suitable for input
  into *pg_restore*. This will create a directory with one file for each
  table and blob being dumped, plus a so-called Table of Contents file
  describing the dumped objects in a machine-readable format that
  *pg_restore* can read. A directory format archive can be manipulated
  with standard Unix tools; for example, files in an uncompressed
  archive can be compressed with the gzip tool. This format is
  compressed by default and also supports parallel dumps. This is most
  similar to what I had been forcing *mysqldump* to do, except that with
  *pg_dump* you only need one command.

tar
: Output a tar-format archive suitable for input into
  pg_restore.  The tar-format is compatible with the directory-format;
  extracting a tar-format archive produces a valid directory-format
  archive. However, the tar-format does not support compression and has
  a limit of 8 GB on the size of individual tables. Also, the relative
  order of table data items cannot be changed during restore. try not to
  use this as can use [a lot of temporary space on your
  harddrive](http://serverfault.com/questions/267616/pg-dump-fails-due-to-mistaken-low-disk-space).
  This might not only wear the underlying HD out and consume needless
  space but also thrash the disk page cache.

**NOTE**: If you're using the directory output format the nifty flag
`--jobs` becomes available, allowing parallel dumping.

It seems that we can get the flexibility of partially restoring a
database without requesting the tables first by choosing the *custom* or
*directory* methods.

The *directory* method creates a folder with some files in it:
`2298.dat.gz`, `2300.dat.gz`, ... and finally `toc.dat`. They are
compressed by default, but it's possible to turn this off by passing the
`-Z0` flag to `pg_dump`. This allows compressing those files
with an rsync-friendly method afterwards. The downside is that all those
uncompressed bytes will get written to disk (and into the page cache).
The larger your DB, the worse this will become for your system.

For this reason, the *custom* format seems like the best of both worlds.
The output can be piped straight into a compress filter. Curious as to
the performance and rsyncability of a few variations on this theme, I
started benchmarking. The most up-to-date scripts I used are available
in a [gist](https://gist.github.com/aktau/8e19977f96d56000aa95),
possibly outdated versions are shown below:

The first script generates a dump of the database in several formats (my
database is called *m2d*, adjust accordingly):

~~~
#!bash
# gen.sh
DIR="$1"

[ -d "$DIR" ] || mkdir -p "$DIR"

# -Z0 is to force no compression, we supply this flag when we pipe to
# our own compressor
pg_dump -Fc m2d > "$DIR/m2d.compr.dump"
pg_dump -Z0 -Fc m2d > "$DIR/m2d.raw.dump"
pg_dump -Z0 -Fc m2d | pigz > "$DIR/m2d.pigz.dump.gz"
pg_dump -Z0 -Fc m2d | gzip > "$DIR/m2d.gzip.dump.gz"
pg_dump -Z0 -Fc m2d | pigz --rsyncable > "$DIR/m2d.arsync.dump.gz"
~~~

The script will generate a few files corresponding to some different
ways of compressing (or not) the output. Run it once to supply a
baseline, make some edits to the database and export again:

~~~
#!bash
$ ./gen.sh orig
$ psql m2d
# make some changes to the database, try to make a small change in the largest tables
$ ./gen.sh changed
~~~

Time to test the rsyncability. I switched to another host and used a
script to rsync every file separately so that I could clearly see the
speedup factor.

~~~
#!bash
# look out for the speedup factors reported by rsync
#
# NOTE
#  you'll have to change the HOST variable below to
#  point to the host + folder to fetch the files from

HOST="vagrant:/home/vagrant/pgdumptests"

ORIG="$1"
NEW="$2"

rsync -avh --stats --progress $HOST/$ORIG/ data/
rsync -avh --stats --progress $HOST/$NEW/m2d.arsync.dump.gz data/
rsync -avh --stats --progress $HOST/$NEW/m2d.compr.dump data/
rsync -avh --stats --progress $HOST/$NEW/m2d.gzip.dump.gz data/
rsync -avh --stats --progress $HOST/$NEW/m2d.pigz.dump.gz data/
rsync -avh --stats --progress $HOST/$NEW/m2d.raw.dump data/
~~~

I ran it on the other host like this:

~~~
#!bash
$ bench.sh orig changed
~~~

The result:

|-----------------------+----------------+---------------+--------------|
| Method                | File size      | Speedup       | Bytes sent   |
|-----------------------|----------------|---------------|--------------|
| uncompressed          | 6.40MB         | 132.77        |  33.01KB     |
| **pigz --rsyncable**  | **723.35KB**   | **15.22**     | **42.37KB**  |
| pg_dump compress      | 716.49KB       | 1.17          | 608.14KB     |
| pigz                  | 686.26KB       | 1.05          | 646.27KB     |
| gzip                  | 689.76KB       | 0.99          | 688.32KB     |
|-----------------------+----------------+---------------|--------------|

Conclusion
----------

It seems that if you're only concerned about bandwidth, the uncompressed
variant is actually best in combination with *rsync*). Yet the file size
of my tiny database in uncompressed is **9x** the size of the compressed
variant. Since I also like to keep backups on the same server as the DB,
that becomes a bit hard to stomach for the relatively small servers I'm
working with.

The sweet spot between simplicity, low bandwidth off-site backup and low
disk space usage seems to fall straight into the camp of piping the
output of `pg_dump` into `pigz --rsyncable`. Very respectable delta
encoding speedups (**15x**) and file size (**9x smaller**) are within
reach. Take these numbers with a grain of salt because it obviously
depends on what's in the database. If you're just storing large binary
blobs in the database, this obviously won't work nearly as well.

Since this article is already getting a bit long in the tooth, the
implementation of the off-site backup server with
[rsnapshot](http://www.rsnapshot.org/) is left up to the reader.

Further benefits & ideas
------------------------

On the side of the backup server, it becomes advantageous to use
something like [rdiff-backup](http://www.nongnu.org/rdiff-backup/) to be
able to keep an incredible amount of backups using minimal amounts of
space using the same delta encoding as `rsync`.

The astute reader will notice that it might be a good idea to decompress
the backups before handing them over to `rdiff-backup`. From the table
above we can see that the uncompressed format has the highest delta
encoding efficiency. This added efficiency *might* cause an
`rdiff-backup` based solution to use even less space than the compressed
variant, because the delta's could be smaller (look at the *bytes sent*
column). It depends on the churn rate and the type of data in the
database though.
