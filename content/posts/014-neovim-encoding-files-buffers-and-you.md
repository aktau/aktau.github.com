---
title: "Neovim: input encoding and you"
created_at: 2014-11-04
description: Try to explain how vim and neovim handle input encoding
kind: article
tags: [neovim, vim, encoding]
draft: false
---

In my guise as a Neovim developer, I was recently looking at how vim
handles character encoding. This lead me down a rabbit hole that I
haven't seen the end of yet. This article describes what I've learned
and what's left to discover.

<!-- more -->

*Disclaimer: when I talk about Vim I will sometimes refer to Vim as
opposed to Neovim, and sometimes to mean both Vim and Neovim. The
context should hopefully make clear which one I mean.*

The impetus
-----------

It all started when I was reading over the changes of PR
[#1357](https://github.com/neovim/neovim/pull/1357) [^1]. I've always
wanted to know more about how Vim does character encoding, and there was
a commit in this PR that started me on the path: [input/job: process
ctrl+c and do conversion in the read
callback](https://github.com/tarruda/neovim/commit/4fd9ee4a6b908d86815f08c8880db73d9dda13dc).
I got curious, what does `convert_input()` do? Does it have anything to
do with encoding? Let's investigate.

Input encoding
--------------

The function is short enough to paste below. It is pretty unique to
Neovim, as it was wrought for its brand new event-oriented nature:

~~~
#!c
struct rbuffer {
  char *data;
  size_t capacity, rpos, wpos;
  RStream *rstream;
};

typedef struct rbuffer RBuffer;

static RBuffer *read_buffer, *input_buffer;

static void convert_input(void)
{
  if (embedded_mode || !rbuffer_available(input_buffer)) {
    // No input buffer space
    return;
  }

  bool convert = input_conv.vc_type != CONV_NONE;
  // Set unconverted data/length
  char *data = rbuffer_read_ptr(read_buffer);
  size_t data_length = rbuffer_pending(read_buffer);
  size_t converted_length = data_length;

  if (convert) {
    // Perform input conversion according to `input_conv`
    size_t unconverted_length = 0;
    data = (char *)string_convert_ext(&input_conv,
                                      (uint8_t *)data,
                                      (int *)&converted_length,
                                      (int *)&unconverted_length);
    data_length -= unconverted_length;
  }

  // The conversion code will be gone eventually, for now assume `input_buffer`
  // always has space for the converted data(it's many times the size of
  // `read_buffer`, so it's hard to imagine a scenario where the converted data
  // doesn't fit)
  assert(converted_length <= rbuffer_available(input_buffer));
  // Write processed data to input buffer.
  (void)rbuffer_write(input_buffer, data, converted_length);
  // Adjust raw buffer pointers
  rbuffer_consumed(read_buffer, data_length);

  if (convert) {
    // data points to memory allocated by `string_convert_ext`, free it.
    free(data);
  }
}
~~~

To summarize, this function copies bytes from the `read_buffer` to the
`input_buffer`. note: The `read_buffer` is filled every time there is
data available on stdin in another part of the code.

If `input_conv.vc_type` is `CONV_NONE`, copying is all it really does
(`rbuffer_write()` is basically `memcpy()`). The interesting part comes
when it isn't `CONV_NONE`: `string_convert_ext()` gets called to
supposedly convert the character encoding into the desired format.

What's the desired format? How does that get decided? For that we have
to search to where `input_conv` is initialized. Before looking at the
code, my assumption was that it had to with either the Vim options
`encoding`, `termencoding` or both. Abridged version of the help:

> **encoding**: Sets the character encoding used inside Vim. It applies
> to text in the buffers, registers, Strings in expressions, text stored
> in the viminfo file, etc.  It sets the kind of characters which Vim
> can work with.  See |encoding-names| for the possible values.

> **termencoding**: Encoding used for the terminal.  This specifies what
> character encoding the keyboard produces and the display will
> understand. For the GUI it only applies to the keyboard ( 'encoding'
> is used for the display).

I will refer to `encoding` as the **internal encoding**, and to
`termencoding` as the **terminal encoding**.

Indeed, in
[option.c](https://github.com/neovim/neovim/blob/04633e3e6bb0da1489050fee2c7514f9a1808327/src/nvim/option.c)
we find the most important of only two places where `input_conv` is set.
It's in `did_set_string_option()`, which gets called whenever an option
is changed. The part that governs the `*encoding` options reads like
this (ignoring `printencoding`):

~~~
#!c
/* handle setting 'encoding', 'fileencoding' and 'termecoding' */
else if (varp == &p_enc || gvarp == &p_fenc || varp == &p_tenc) {
    if (gvarp == &p_fenc) {
      if (!curbuf->b_p_ma && opt_flags != OPT_GLOBAL)
        errmsg = e_modifiable;
      else if (vim_strchr(*varp, ',') != NULL)
        /* No comma allowed in 'fileencoding'; catches confusing it
         * with 'fileencodings'. */
        errmsg = e_invarg;
      else {
        /* May show a "+" in the title now. */
        redraw_titles();
        /* Add 'fileencoding' to the swap file. */
        ml_setflags(curbuf);
      }
    }

    if (errmsg == NULL) {
      /* canonize the value, so that STRCMP() can be used on it */
      p = enc_canonize(*varp);
      free(*varp);
      *varp = p;
      if (varp == &p_enc) {
        errmsg = mb_init();
        redraw_titles();
      }
    }


    if (errmsg == NULL) {
      /* When 'keymap' is used and 'encoding' changes, reload the keymap
       * (with another encoding). */
      if (varp == &p_enc && *curbuf->b_p_keymap != NUL)
        (void)keymap_init();

      /* When 'termencoding' is not empty and 'encoding' changes or when
       * 'termencoding' changes, need to setup for keyboard input and
       * display output conversion. */
      if (((varp == &p_enc && *p_tenc != NUL) || varp == &p_tenc)) {
        convert_setup(&input_conv, p_tenc, p_enc);
        convert_setup(&output_conv, p_enc, p_tenc);
      }

    }
  }
~~~

Luckily, the three encoding options are more or less handled in one
block, as they're intertwined. The first part only applies to
`fileencoding` so we can skip it for now. The second part canonizes the
name of the encoding via `enc_canonize()`, and if the option in question
was `encoding` then Vim changes its internal encoding by calling
`mb_init()`.

Changing `encoding` means Vim handles all internal text buffers
differently. `mb_init()` does not change the encoding of text already
loaded into Vim, it merely makes Vim interpret it differently. This is
also why the Vim help advises to set it only during startup as setting
it after loading files could have strange effects. Especially when going
from a more capable encoding like UTF-8 to a less capable one like
latin-1, expect a lot of very strange symbols. Quoting the Vim help:

> **encoding**: ... Changing this option will not change the encoding of
> the existing text in Vim.  It may cause non-ASCII text to become
> invalid.  It should normally be kept at its default value, or set when
> Vim starts up.  See |multibyte|.  To reload the menus see
> |:menutrans|.

The last part of the code in **options.c** is the one I was originally
looking for, as it pertains to input encoding. To repeat the most
interesting part:

~~~
#!c
/* When 'termencoding' is not empty and 'encoding' changes or when
 * 'termencoding' changes, need to setup for keyboard input and
 * display output conversion. */
if (((varp == &p_enc && *p_tenc != NUL) || varp == &p_tenc)) {
  convert_setup(&input_conv, p_tenc, p_enc);
  convert_setup(&output_conv, p_enc, p_tenc);
}
~~~

So, if `encoding` has changed and `termencoding` is non-empty, **OR**
the `termencoding` has changed, the conversion structures `input_conv`
and `output_conv` are set up.

- On the **input side**, i.e. what you type on the keyboard, a
  conversion from the terminal encoding to the internal encoding is
  done.
- On the **output side**, i.e. what you see in the terminal, a
  conversion from the internal encoding to the terminal encoding is
  done.

That makes perfect sense, of course. It would appear that
`convert_setup()` is a pretty important function, let's have a look.

~~~
#!c
/*
 * Setup "vcp" for conversion from "from" to "to".
 * The names must have been made canonical with enc_canonize().
 * vcp->vc_type must have been initialized to CONV_NONE.
 * Note: cannot be used for conversion from/to ucs-2 and ucs-4 (will use utf-8
 * instead).
 * Afterwards invoke with "from" and "to" equal to NULL to cleanup.
 * Return FAIL when conversion is not supported, OK otherwise.
 */
int convert_setup(vimconv_T *vcp, char_u *from, char_u *to)
{
  return convert_setup_ext(vcp, from, true, to, true);
}

/*
 * As convert_setup(), but only when from_unicode_is_utf8 is TRUE will all
 * "from" unicode charsets be considered utf-8.  Same for "to".
 */
int convert_setup_ext(vimconv_T *vcp, char_u *from, bool from_unicode_is_utf8,
                      char_u *to, bool to_unicode_is_utf8)
{
  int from_prop;
  int to_prop;
  int from_is_utf8;
  int to_is_utf8;

  /* Reset to no conversion. */
# ifdef USE_ICONV
  if (vcp->vc_type == CONV_ICONV && vcp->vc_fd != (iconv_t)-1)
    iconv_close(vcp->vc_fd);
# endif
  vcp->vc_type = CONV_NONE;
  vcp->vc_factor = 1;
  vcp->vc_fail = false;

  /* No conversion when one of the names is empty or they are equal. */
  if (from == NULL || *from == NUL || to == NULL || *to == NUL
      || STRCMP(from, to) == 0)
    return OK;

  from_prop = enc_canon_props(from);
  to_prop = enc_canon_props(to);
  if (from_unicode_is_utf8)
    from_is_utf8 = from_prop & ENC_UNICODE;
  else
    from_is_utf8 = from_prop == ENC_UNICODE;
  if (to_unicode_is_utf8)
    to_is_utf8 = to_prop & ENC_UNICODE;
  else
    to_is_utf8 = to_prop == ENC_UNICODE;

  if ((from_prop & ENC_LATIN1) && to_is_utf8) {
    /* Internal latin1 -> utf-8 conversion. */
    vcp->vc_type = CONV_TO_UTF8;
    vcp->vc_factor = 2;         /* up to twice as long */
  } else if ((from_prop & ENC_LATIN9) && to_is_utf8) {
    /* Internal latin9 -> utf-8 conversion. */
    vcp->vc_type = CONV_9_TO_UTF8;
    vcp->vc_factor = 3;         /* up to three as long (euro sign) */
  } else if (from_is_utf8 && (to_prop & ENC_LATIN1)) {
    /* Internal utf-8 -> latin1 conversion. */
    vcp->vc_type = CONV_TO_LATIN1;
  } else if (from_is_utf8 && (to_prop & ENC_LATIN9)) {
    /* Internal utf-8 -> latin9 conversion. */
    vcp->vc_type = CONV_TO_LATIN9;
  }
# ifdef USE_ICONV
  else {
    /* Use iconv() for conversion. */
    vcp->vc_fd = (iconv_t)my_iconv_open(
        to_is_utf8 ? (char_u *)"utf-8" : to,
        from_is_utf8 ? (char_u *)"utf-8" : from);
    if (vcp->vc_fd != (iconv_t)-1) {
      vcp->vc_type = CONV_ICONV;
      vcp->vc_factor = 4;       /* could be longer too... */
    }
  }
# endif
  if (vcp->vc_type == CONV_NONE)
    return FAIL;

  return OK;
}
~~~

So, `convert_setup()` redirects to `convert_setup_ex()`. That reminds me
of my Windows days where I often encountered ['*Ex'
functions](http://stackoverflow.com/questions/3963374/what-does-it-mean-when-ex-is-added-to-a-function-method-name)
that were more challenging to understand.

Despite the spaghetti-like qualities of the code, there's only 3 major
phases:

1. If one either the source or destination encoding are blank, or they
  are identical, then assign the no-op encoding and exit.
2. Determine the properties of the encodings and do a few tests to see if
  any of the natively provided encodings can be used: **latin-1 to
  UTF-8** (+ reversed) and **latin-9 to UTF-8** (+ reversed). These
  encodings can apparently be used without outside help. If that fails,
  go to the next step.
3. Check if `USE_ICONV` has been defined, and if so, open an iconv handle
  for the requested encoding pair. It's quite likely that iconv is
  capable of translating the exotic requests of the user. Iconv thus
  acts as a fallback if it's available.

The fact that Vim provides some native encodings is probably why no
Neovim user has complained up until now (iconv is temporarily disabled
in Neovim, this is being fixed [^2]). Apparently, not many use an exotic
encoding for input. I surmise that UTF-8 is good enough for most. Point
1 also implies that the `*p_tenc != NUL` check in
`did_set_string_option()` is likely redundant.

**NOTE**: interestingly the `vc_factor` member of the `vimconv_T` struct
structure is written to in `convert_setup_ext()` but never read anywhere
else in the codebase. More about that later.

So that explains how the `input_conv` variable is set up. Let's pick up
where we left off: how it is used. The relevant part of
`convert_input()` is shown below:

~~~
#!c
if (convert) {
  // Perform input conversion according to `input_conv`
  size_t unconverted_length = 0;
  data = (char *)string_convert_ext(&input_conv,
                                    (uint8_t *)data,
                                    (int *)&converted_length,
                                    (int *)&unconverted_length);
  data_length -= unconverted_length;
}
~~~

Looking into `string_convert_ext()`, we find a function that looks
daunting but really isn't:

~~~
#!c
/*
 * Like string_convert(), but when "unconvlenp" is not NULL and there are is
 * an incomplete sequence at the end it is not converted and "*unconvlenp" is
 * set to the number of remaining bytes.
 */
char_u * string_convert_ext(vimconv_T *vcp, char_u *ptr, int *lenp,
                            int *unconvlenp)
{
  char_u      *retval = NULL;
  char_u      *d;
  int len;
  int i;
  int l;
  int c;

  if (lenp == NULL)
    len = (int)STRLEN(ptr);
  else
    len = *lenp;
  if (len == 0)
    return vim_strsave((char_u *)"");

  switch (vcp->vc_type) {
    case CONV_TO_UTF8:            /* latin1 to utf-8 conversion */
      retval = xmalloc(len * 2 + 1);
      d = retval;
      for (i = 0; i < len; ++i) {
        c = ptr[i];
        if (c < 0x80)
          *d++ = c;
        else {
          *d++ = 0xc0 + ((unsigned)c >> 6);
          *d++ = 0x80 + (c & 0x3f);
        }
      }
      *d = NUL;
      if (lenp != NULL)
        *lenp = (int)(d - retval);
      break;

    case CONV_9_TO_UTF8:          /* latin9 to utf-8 conversion */
      retval = xmalloc(len * 3 + 1);
      d = retval;
      for (i = 0; i < len; ++i) {
        c = ptr[i];
        switch (c) {
          case 0xa4: c = 0x20ac; break;                 /* euro */
          case 0xa6: c = 0x0160; break;                 /* S hat */
          case 0xa8: c = 0x0161; break;                 /* S -hat */
          case 0xb4: c = 0x017d; break;                 /* Z hat */
          case 0xb8: c = 0x017e; break;                 /* Z -hat */
          case 0xbc: c = 0x0152; break;                 /* OE */
          case 0xbd: c = 0x0153; break;                 /* oe */
          case 0xbe: c = 0x0178; break;                 /* Y */
        }
        d += utf_char2bytes(c, d);
      }
      *d = NUL;
      if (lenp != NULL)
        *lenp = (int)(d - retval);
      break;

    case CONV_TO_LATIN1:          /* utf-8 to latin1 conversion */
    case CONV_TO_LATIN9:          /* utf-8 to latin9 conversion */
      retval = xmalloc(len + 1);
      d = retval;
      for (i = 0; i < len; ++i) {
        l = utf_ptr2len_len(ptr + i, len - i);
        if (l == 0)
          *d++ = NUL;
        else if (l == 1) {
          int l_w = utf8len_tab_zero[ptr[i]];

          if (l_w == 0) {
            /* Illegal utf-8 byte cannot be converted */
            free(retval);
            return NULL;
          }
          if (unconvlenp != NULL && l_w > len - i) {
            /* Incomplete sequence at the end. */
            *unconvlenp = len - i;
            break;
          }
          *d++ = ptr[i];
        } else {
          c = utf_ptr2char(ptr + i);
          if (vcp->vc_type == CONV_TO_LATIN9)
            switch (c) {
              case 0x20ac: c = 0xa4; break;                     /* euro */
              case 0x0160: c = 0xa6; break;                     /* S hat */
              case 0x0161: c = 0xa8; break;                     /* S -hat */
              case 0x017d: c = 0xb4; break;                     /* Z hat */
              case 0x017e: c = 0xb8; break;                     /* Z -hat */
              case 0x0152: c = 0xbc; break;                     /* OE */
              case 0x0153: c = 0xbd; break;                     /* oe */
              case 0x0178: c = 0xbe; break;                     /* Y */
              case 0xa4:
              case 0xa6:
              case 0xa8:
              case 0xb4:
              case 0xb8:
              case 0xbc:
              case 0xbd:
              case 0xbe: c = 0x100; break;                   /* not in latin9 */
            }
          if (!utf_iscomposing(c)) {              /* skip composing chars */
            if (c < 0x100)
              *d++ = c;
            else if (vcp->vc_fail) {
              free(retval);
              return NULL;
            } else {
              *d++ = 0xbf;
              if (utf_char2cells(c) > 1)
                *d++ = '?';
            }
          }
          i += l - 1;
        }
      }
      *d = NUL;
      if (lenp != NULL)
        *lenp = (int)(d - retval);
      break;

# ifdef USE_ICONV
    case CONV_ICONV:              /* conversion with output_conv.vc_fd */
      retval = iconv_string(vcp, ptr, len, unconvlenp, lenp);
      break;
# endif
  }

  return retval;
}
~~~

In the end it's just a switch that looks up a conversion method by
looking at the `vc_type` member that was set up earlier in
`convert_setup()`. Apparently Bram decided that it was simpler to have
the conversion code inline in the switch. I must say, they are
wonderfully compact (and quite simple, if you read up on the encodings).
Still, I think it would be better if these various converters were
extracted into their own little functions (I'm working on that).

On success, the function returns allocated memory with the converted
bytes in it. This is neat, but it would be nice of the function allowed
to pass an output buffer. To avoid allocations when they're not
necessary. Case in point, the snippet that started this entire article
could make use of this. Data from `read_buffer` is converted (read:
allocated), and then copied to `input_buffer`. It would be more elegant
if the data could just be written to `input_buffer` by
`string_convert_ext()`.

That raises a question though: how should the caller determine how large
the output buffer should be? It turns out iconv has this exact same
problem:

~~~
#!c
size_t iconv (iconv_t cd,
              char **restrict inbuf, size_t *restrict inbytesleft,
              char **restrict outbuf, size_t *restrict outbytesleft);
~~~

It has basically the interface I just described for a hypothetically
improved `string_convert_ext()`. The solution iconv uses is to return -1
with `errno` set to `E2BIG`. After which you're supposed to enlarge your
buffer and try again. This is a decent strategy, and we could make it
even better.

As mentioned above, `vimconv_T` has a seemingly unused field called
`vc_expand` which records a factor by which a byte stream can expand if
converted with said parameters. Check it out in `convert_setup()`'s code
above. Example: for latin-1 to UTF-8 this factor is 2. Meaning that by
allocating a buffer twice as large as the input buffer, there would be
no risk of receiving `E2BIG`. This is incidentally also the size passed
to `xmalloc()` in the current incarnation of `string_convert_ext()`:

~~~
#!c
case CONV_TO_UTF8:            /* latin1 to utf-8 conversion */
  retval = xmalloc(len * 2 + 1);
~~~

When Vim uses iconv, the situation is more difficult since the expansion
factor is a potential unknown. The user could choose any number of
exotic variants, including one that expands to 8 times the original
size. Vim assigns **4** by default, but notes in the comments that it
could possibly be larger. In conclusion, `vc_factor` is a nice yardstick
by which to scale the output buffer, but it's not conclusive for all
cases. Multiplying the input buffer by `vc_factor` would ensure that
we're not likely to encounter `E2BIG`.

That about wraps up input encoding the keyboard. Something tells me that
this is not the end of the story.  For the next installment, I will
discuss file encoding.

[^1]: Code review is not only massively important for a rapidly changing
    project like Neovim, it also helps me get to grips with some internals
    that I haven't had the pleasure to alter myself.

    Recently there have been too few reviewers and some changes were
    perhaps merged prematurely. Luckily this is all quickly rectified by
    the combination of swift bug reports and coverity scans. On second
    thought, perhaps "premature" is not right. In a quickly moving
    project like Neovim it might be very useful to jumpstart a
    discussion after a lull. After all, we're only in alpha. I'm also
    guilty of reviewing after the fact (read: merge), but for now it's
    not causing the world to implode.

[^2]: After seeing all the `USE_ICONV` conditional parts in the source, I
    started to wonder when [libiconv](http://en.wikipedia.org/wiki/Iconv) was
    actually activated and used.

    A short investigation revealed that iconv was never enabled for Neovim,
    even though most of the code was perfectly functional. Supposedly,
    something happened during the migration from autoconf (Vim) to cmake
    (Neovim) and `USE_ICONV` was never set. I submitted PR
    [#1370](https://github.com/neovim/neovim/pull/1370) to rectify this. The
    relevant source hadn't diverged that much and no `USE_ICONV` block had
    been removed by the unifdeffening so that was a piece of cake.
