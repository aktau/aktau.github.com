---
title: Pipelines in Golang
created_at: 2014-07-13
description: Presents several ways to create a processing pipeline in Go
kind: article
tags: [pipeline, golang]
draft: true
---

Ever wanted to push a bunch of values through a pipeline, to be worked
on by different functions (stages), in parallel or sequentially? In Go
there are a few ways to accomplish that. This article summarizes and
constrasts a few known approaches.

<!-- more -->

To be clear, this article isn't about emulating [Unix shell pipelines in
Go](http://labix.org/pipe). I consider the package that link points to
as the go-to solution if you want to build a Unix pipeline in Go.

What's in a pipeline?
---------------------

Why would you need a pipeline? If you want to work on a value and pass
it from stage to stage, what could be simpler than:

~~~
#!go
func main() {
  for i := 0; i < 10; i++ {
    result := start("my-value")  // could be anything, really
    fmt.Println("The result is:", result)
  }
}

func start(val string) string {
  val1 := stage1(val)
  val2 := stage2(val1)
  val3 := stage3(val2)
  return val3
}

// dummy functions
func stage1(val string) string {
  return val + " -> stage 1"
}

func stage2(val string) string {
  return val + " -> stage 2"
}

func stage3(val string) string {
  return val + " -> stage 3"
}
~~~

There's, that's just regular, imperative programming. It's simple, it's
easy, it's great. There's no error handling, I left it out to keep
things short, but you should definitely do that. Now, what if you want to
run things in parallel? A first thought might be to do something like
this:

~~~
#!go
func main() {
  // input and output channels for the pipeline
  input := make(chan string)
  output := make(chan string)
  go start(input, output)  // run start() as a goroutine
  for i := 0; i < 10; i++ {
    input <- "my-value"
    fmt.Println("The result is:", <-output)
  }

  // close the input channel so start() will exit and can clean up after
  // itself if it so wishes.
  close(input)
}

func start(input <-chan string, output chan<- string) {
  // will loop until input is closed
  for i := range input {
    val1 := stage1(i)
    val2 := stage2(val1)
    val3 := stage3(val2)
    output <- val3
  }
}
~~~

Whew, now we're using goroutines and channels, two of the things Go is
known for. Yet we have not gained any efficiency. We've merely increased
the complexity of the solution. There's two big reasons for that:

1. We've moved all calculations from one goroutine (the main goroutine)
to just one other goroutine: `start()`. This can't possibly make
things any faster. **Possible solution**: start more goroutines.
2. We immediately demand output after supplying input. This allows only
one value to be in-flight. Yet we can't split up the loop into an input
loop and an output loop. It would deadlock! The `start()` goroutine
would be blocked on the `output <- val3` channel send after the first
iteration of the input loop. Thus, even if we applied the solution to
problem #1, everything would still be sequential. **Possible solution**:
use buffered channels to allow more values to be in-flight.

Let's apply the proposed solutions and see what we get:

~~~
#!go
func main() {
  // input and output channels for the pipeline
  nvals := 10
  input := make(chan string, nvals)
  output := make(chan string, nvals)
  for i := 0; i < nvals; i++ {
    go start(input, output)
  }
  for i := 0; i < nvals; i++ {
    input <- "my-value"
  }
  close(input)
  for i := 0; i < nvals; i++ {
    fmt.Println("The result is:", <-output)
  }
}

func start(input <-chan string, output chan<- string) {
  // will loop until input is closed
  for i := range input {
    val1 := stage1(i)
    val2 := stage2(val1)
    val3 := stage3(val2)
    output <- val3
  }
}
~~~

Now we're calculating in parallel. However, though we can decrease the
number of goroutines, we're still required to construct channels as
large as the number of values we're going to pass in. And if we decrease
the channel buffers, we need more goroutines to "buffer up" more values
(which is even worse). So we either have O(N) goroutines or channels
with an O(N)-buffer. That's no good. Perhaps by using another go
construct, we can do better. Enter `select`:

~~~
#!go
func main() {
  // input and output channels for the pipeline
  nvals := 10
  input := make(chan string)
  output := make(chan string)
  for i := 0; i < 2; i++ {
    go start(input, output)
  }
  for i := 0; i < nvals; {
    select {
    case input <- "my-value":
      // succesfully input value
    case res := <-output:
      fmt.Println("The result is:", res)
      i++
    }
  }
  close(input)
}

func start(input <-chan string, output chan<- string) {
  // will loop until input is closed
  for i := range input {
    val1 := stage1(i)
    val2 := stage2(val1)
    val3 := stage3(val2)
    output <- val3
  }
}
~~~

We can vary the number of goroutines and the buffers independently (and
measure how we get the best performance). By combining this with
`runtime.GOMAXPROCS(runtime.NumCPU())`, all cores can be used:

~~~
#!go
cpus := runtime.NumCPU()
runtime.GOMAXPROCS(cpus)
// start as much workers as we have cpus
for i := 0; i < cpus; i++ {
  go start(input, output)
}
~~~

Yet, we haven't really been focusing on the pipeline at all. What we've
created is just a primitive [worker
pool](https://groups.google.com/forum/#!msg/golang-nuts/o84ISlVWG9g/aXaIW3V8yTAJ).
If a bit more queueing logic is added, a perfectly fine and usable
worker queue comes out.

> The concept of worker queues is probably well-known among those who
> follow how big web companies are performing their heavy processing
> tasks. Projects like [resque](https://github.com/resque/resque) and
> [celery](http://www.celeryproject.org/) provide a means to abstract a
> worker queue from the programming language used. Sometimes they do this
> by using a database/message broker like [redis](http://redis.io/) and
> consorts as intermediaries.

I've found it helpful to imagine a pipeline as a sequence of worker
pools passing values to each other. Each worker pool is called a
**stage**. It's possible for a worker pool to have just one worker, in
which case that stage would run in sequence and won't need
synchronization.

To turn our earlier example into a true pipeline, we need to break out
the stages and let them run in their own worker pool:

~~~
#!go

func main() {
  // input and output channels for the pipeline
  nvals := 10

  ncpu := runtime.NumCPU()
  runtime.GOMAXPROCS(ncpu)

  stages := []func(<-chan string, chan<- string){
    stage1,
    stage2,
  }

  input := make(chan string)
  in := input
  for _, stage := range stages {
    out := make(chan string)
    go stage(in, out)  // run start() as a goroutine
    in = out  // the output of one stage is the input of the next one
  }
  output := in // the output of the last stage

  for i := 0; i < nvals; {
    select {
    case input <- "my-value":
      // succesfully input value
    case res := <-output:
      fmt.Println("The result is:", res)
      i++
    }
  }
  close(input)
}

func stage1(input <-chan string, output chan<- string) {
  // propagate the closing of the input channel
  defer close(output)
  for i := range input {
    output <- stage1fn(i)
  }
}

func stage2(input <-chan string, output chan<- string) {
  // propagate the closing of the input channel
  defer close(output)
  for i := range input {
    output <- stage2fn(i)
  }
}

func stage1fn(val string) string {
  return val + " -> stage 1"
}

func stage2fn(val string) string {
  return val + " -> stage 2"
}
~~~

Very groovy. But the astute reader will notice that we've regressed
quite a bit: we only start as many goroutines as we have stages and all
stages naturally run in sequence. This means that the performance will
be on par with the very first example, which was just a sequence of
plain function calls. In fact, performance will be worse, as we get
goroutine creation and channel sync overhead. It's also unclear what
advantages, if any, this approach has over regular function calls. It
just seems more complex.

Perhaps it's time to stop dabbling around and provide some powerful
helper functions that will let us compose pipelines that use

TODO: Wide/Batch/Single/...

Now we can also see what advantages this might pose over just starting
`#cpus` workers and letting each of them run all the stages until the
input is exhausted, as was proposed near the beginning of the article:

- More granular control over parallelism
- Work stealing (contrast web vs parallel lines approach, graphic?).
  This can equal more efficient system resource utilization. Imagine
  that stage #1 is reponsible for reading files from storage, and stage
  #2 for processing them (like computing MD5's). In the single worker
  pool approach, when a worker is busy calculating an MD5, it's not busy
  reading a file. Yet these are usually things that can be done in
  parallel, the kernel issues a DMA request to wherever the request
  contents are and the requesting thread can go do something else (this
  approach is enshrined in the `epoll/kqueue/...` APIs). When using
  pipelines, utilization is higher, because all workers for stage 2 can
  be busy calculating MD5's and all workers for stage 1 can have a
  storage request underway. That way there's less downtime and thus
  lower latency at little extra CPU cost.

This also indicates that it's a good idea to split up IO tasks from
CPU-heavy tasks and put them in separate stages. On the flipside,
splitting a CPU-heavy task into multiple stages might not yield any
gains at all (it might actually decrease performance because of cache
efficiency losses).

Yet when we know we're working with Go, we can simplify and generalize
this concept. Enter the pipeline.

Queues have a nice analogue in Go: channels. They provide some of the
semantics we are looking for:

- Safe to use from multiple goroutines
- First-in First-out (FIFO)

There's one little catch: channels are bounded by their capacity. This
is true for any queue. This can be a good thing: sending into a full
channel will block until there is room, so it's a natural backpressure
mechanism. Clever ways can be thought of to deal with this backpressure,
such as throwing away the work, or starting up another pipeline.
However, to truly emulate queue's such as those represented by redis'
LISTs better, one could prepend a pipeline stage that uses an [infinite
channel](https://github.com/eapache/channels) to buffer up all input.
Making it seem to the caller that there is no backpressure. The caveat
being that it's possible for the system to run out of memory and thus
make the program fail. It's possible to build safeguards for this but
they're not as "convenient" as checking for `NULL` from `malloc()`.

Why would one want to use a pipeline instead of just straight-line code
or starting a goroutine for every item you want to process in parallel
(and then waiting on a
[sync.WaitGroup](http://golang.org/pkg/sync/#WaitGroup) or extracting N
values from a channel)?

1. Bounded parallelism: avoid spawning 1000's of goroutines when it's
not necessary (you most likely don't have 1000's of processors).
Goroutines are cheap, but they're not that cheap. [^1]
2. Some pipelines support cancellation, freeing you from building it
yourself in an ad-hoc way everytime.
3. You can pass some pipelines around. This allows inputting values into
an already running pipeline without worrying. This makes sure the end
results are sequenced correctly in time (after other calls), yet they
don't have to block until the work is done.
4. Batching: (combine results into big INSERT statements), difficult to
do with many parallel pipelines (worker pools) as in the beginning of
the article.

Some links describing possible instances of pipeline:

1. [Go blog: pipelines](http://blog.golang.org/pipelines)
2. [Dimitri Vyukov's pipeline](https://groups.google.com/forum/#!topic/golang-nuts/cHvGb_wOExw)

Use cases
---------

Streaming pipeline
------------------

TCP sockets can be seen as an instance of a streaming pipeline.

Value pipeline
--------------

Inside of the boundaries of a programming language, it's often easiest
to think of a pipeline as a bunch of values to be passed through a few
stages and spit out at the end. Contrast this with a stream of values
where one has to make an effort to discern the logical pieces
(messages).

When working with one language, this is jut not necessary. We already
have a perfectly fine way to delimit a message: types. To make things
generic, it seems like we'd have to pass `interface{}` values.

Ad-hoc pipeline
---------------

Go blog approach.

Function pipeline
-----------------

Dimitri's approach.

[^1]:
    At the moment of speaking (Go 1.3), creating a goroutine costs around 5000
    bytes.

[^2]:
    Only one fourth-order method was discussed, making  it the best by
    default.
