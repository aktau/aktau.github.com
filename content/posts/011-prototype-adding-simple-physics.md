---
title: Prototype engine, implementing simple physics
created_at: 2014-02-21
description: in this article I try to explain my first foray into game physics
kind: article
tags: [games, physics]
draft: true
---

Game physics, a harsh mistress.

<!-- more -->

Newtonian physics
-----------------

Most people will be familiar with these equations:

$$
\begin{align}
F(t) = m \cdot a(t) \\
v(t) = \int{a(t)~dt} \\
s(t) = \int{v(t)~dt} \\
\end{align}
$$

Sometimes the force is known, sometimes the acceleration is known (e.g.:
gravity), other times you want to specify the velocity. From all these
things, the position at some point in time needs to be calculated.

There are several ways to calculate the position if force or
acceleration are known, ranging from the exact analytical solution to
various numerical approximations. In most game engines, numerical
approximations are used, but it is [possible to mix
both](http://physicsforgames.blogspot.de/2010/02/kinematic-integration.html)
to get the most accurate result possible. It's not
common is because it's not usually necessary for games, the accuracy of
a good numerical integrator is good enough, even when an analytical
solution could be worked out.

In this article, we'll discuss some analytical solutions as well as a
few well-known numerical integrators along with their pro's and con's as
they relate to game development.

### the joys of constant acceleration

In the case of constant force or acceleration, things can be simplified
quite a bit. Gravity is a good example of this, as it is -- for our
purposes -- constant in time and space. This independence of time means
that the equations above become trivial to solve analytically.

With constant acceleration, the velocity becomes:

$$
\begin{align}
v(t) =& \int{a~dt} \\
     =& v_0 + a \cdot t
\end{align}
$$

Note that even though the acceleration is constant, velocity is not.
Next, we can use the explicit formula of the velocity to get the
position:

$$
\begin{align}
s(t) =& \int{v(t)~dt} = \int{(v_0 + at)~dt} \\
     =& s_0 + v_{0}t + a\frac{t^2}{2}
\end{align}
$$

So if the cumulative force acting on an object is constant, we could use
a formula like this instead of numerical methods, and it would always be
100% accurate. Even if the force is not always constant, this method
could be used for the intervals in which it *is* constant.

Numerical integration
---------------------

[Numerical
integration](http://en.wikipedia.org/wiki/Numerical_integration) is the
process of integrating in discrete steps instead of trying to work out
an analytic solution. There are several reasons for doing this:

* The acceleration is known but not a constant, making an analytic solution
  difficult or unwieldy.
* The acceleration is only known at the current time, making an analytic
  solution impossible.
* The cumulative force is a combination of many different forces for
  which an analytic solution is known, but combining them sounds like a
  chore.
* The programmer is too lazy or prefers the simplicity of having a
  "one size fits all" approach: numerical integration for everything.

It's useful to note that to get the position, acceleration has to be
integrated twice. Since all integration methods that I know of just
integrate once (save for Verlet), this can lead to naming confusion.
It's entirely possible to use forward Euler for integrating velocity and
backward Euler for position (this is called semi-implicit Euler). Or
forward Euler for integrating acceleration, but Runge-Kutta 4 for
integrating velocity.  That said, when gamedevs talk about using RK4,
they mean that both velocity and position are calculated with RK4. I'm
not entirely sure what the effect would be of, for example, using a
first-order method for velocity and a second-order method for position.
My best guess is that the total would degrade to first-order. Yet
another thing for the todo list...

To add to the confusion, many methods go by several different names, and
have various disparate formulations. These don't usually look like the
same thing to the naked eye. That's why I will note under each method
any alternative names that I know of. Beware though, it's entirely
possible that I've made a mistake. The amount of paradoxical statements
on the internet concerning which method is what is sufficient drive one
to drink. Corrections are most welcome, after all I wrote this article
to try to get a handle on things in the first place.

### Timestep size

In general, [every method of numerical integration has an ideal
stepsize](http://beltoforion.de/pendulum_revisited/pendulum_revisited_en.html).
The higher the order of the method, the larger you can (and should) make
the step size. This also offsets the added calculation costs of
higher-order methods.

### Static or dynamic timestep

Glenn Fiedler has famously written about [the benefits of a static
timestep](http://gafferongames.com/game-physics/fix-your-timestep/).
Some methods require a static timestep (Verlet? Where did I read this?
It doesn't make sense at first glance).

### Energy conservation

Some numerical integration methods lose energy (e.g.: implicit Euler), others
add it (e.g.: explicit Euler) and others still keep it more or less
table (e.g.: semi-implicit Euler). Such an energy-conserving integrator
is often called *symplectic*. The two properites are not entirely
synonymous[^1], but often sufficiently so.

Many argue that for games, it's not really necessary to have a
symplectic integrator. Usually there is damping force being applied by
the programmer already (friction, drag, ...). This will often keep
energy-adding integrators in check, like a counterbalance. For
energy-losing integrators, their energy losses get lost in the noise of
the drag/friction forces.

However, for some types of simulations, such as planetary systems or
molecular simulations, it's often useful to have energy conservation.
Otherwise planets can drop out of orbit or slingshot into space. A good
illustration of this is one of the earliest computer games ever: [Space
War](http://blogs.mathworks.com/cleve/2012/06/19/symplectic-spacewar/),
which -- perhaps unknowingly -- used a symplectic integrator to good
effect.

### Clamping

In games, stability is often enforced by *clamping* the velocity. This
might not provide the most physically accurate results, but can look
good regardless. To quote the famouse gamedev saying: "when it looks
right, it is right." Clamping even allows the use of explicit Euler
without fear of everything exploding.

### Methods

In the following discussion, it is always assumed that the values of
acceleration, velocity and position of step *t* and before are known,
and that we need to calculate the values of step *t+1*. The time
difference passed to the integration function is $ \Delta t $.

Most methods presented here only require values from the last step, but
some require keeping around values from earlier iterations as well.

#### Explicit Euler (first-order)

**Alternative name**: forward Euler

$$
\begin{align}
v_{t+1} = v_t + a_t \Delta t \\
s_{t+1} = s_t + v_t \Delta t
\end{align}
$$

The explicit Euler method is one of those which are very intuitive and
simple. Sadly, it's also one of the worst numerical integrators.

Note that the calculation of the position and velocity of the next step
are independent of each other. The position of the next step only uses
the velocity of the current step for its update. Both acceleration and
velocity are being integrated by with explicit Euler.

There's [a couple of ways to derive Euler
integration](http://en.wikipedia.org/wiki/Euler_method#Derivation).

A serious disadvantage of explicit Euler is that it adds energy into the
system. Meaning that if no drag or friction is added by the programmer,
the system will become unstable over time.

#### Implicit Euler (first-order)

**Alternative name**: backward Euler

$$
\begin{align}
v_{t+1} = v_t + a_{t+1} \Delta t \\
s_{t+1} = s_t + v_{t+1} \Delta t
\end{align}
$$

Some articles propose the [implicit Euler
method](http://en.wikipedia.org/wiki/Backward_Euler_method) when related
to gamedev as being similar to the explicit Euler method save for the
fact that it uses the velocity of the next step to update the position.
This approach is [NOT the implicit Euler
method](http://www.gamedev.net/topic/378497-difference-between-euler-and-forward-explicit-euler/)
but the semi-implicit or symplectic Euler method, described later.

The equations listed above cannot be used directly in a program, as the
acceleration at time *t+1* is not available at time *t*. In general it's
more difficult to solve implicit numerical integration method: one needs
to solve a system of equations. I'm not going to discuss how to do that
here but
[OpenCloth](https://code.google.com/p/opencloth/source/browse/trunk/OpenCloth_ImplicitEuler/OpenCloth_ImplicitEuler/main.cpp)
has some example implementations.

In contrast to explicit Euler, implicit Euler dissipates energy from the
system. This makes it look like there's some sort of friction, which is
usually what the game developer wants anyway.

#### Semi-Implicit Euler (first-order)

**Alternative name**: symplectic Euler, Euler-Cromer method, sometimes
called Newton-Störmer-Verlet (e.g.: in
[[1](https://web.archive.org/web/20120713004111/http://wiki.vdrift.net/Numerical_Integration#Newton-Stormer-Verlet_.28NSV.29_.2F_Symplectic_Euler_.2F_Euler.E2.80.93Cromer_algorithm)]
and
[[2](http://encinographic.blogspot.de/2013/05/simulation-class-euler-cromer-time-step.html)])
althrough I've also seen this name applied to regular Verlet, which is
discussed later (to ascertain I'd have to check Newton's Principia).

$$
\begin{align}
v_{t+1} = v_t + a_t \Delta t \\
s_{t+1} = s_t + v_{t+1} \Delta t
\end{align}
$$

The name semi-implicit Euler is perhaps poorly chosen as it is an
explicit method. This is easy to see by the fact that we don't have to
solve a system of equations to use it.

I believe the naming is motivated by the fact that the acceleration is
integrated with the explicit Euler method, but the position is
integrated with the implicit Euler method. So the only difference with
explicit Euler is that the velocity of the next step is used, instead of
the velocity of the current step.

With explicit Euler, the velocity and position could be calculated in
parallel. However for semi-implicit Euler the velocity has to be
calculated first, as it will be used for the position.

Semi-implicit Euler is a symplectic integrator, which can be a very
positive trait and makes it preferred over explicit Euler as a
first-order method.

This is a very popular integrator in game engines because it is very
cheap to calculate yet shows good properties in general. It is the best
first-order method I know of.

#### Verlet (second-to-fourth-order)

**Alternative name**: explicit central difference method,
Newton-Störmer-Verlet (possibly wrong as I've seen the name applied to
semi-implicit Euler as well)

$$
\begin{align}
s_{t+1} = 2s_t - s_{t-1} + a_{t} \Delta t^2
\end{align}
$$

This method calculates the position from the two last positions and the
current acceleration, omitting the velocity. Of course, the velocity at
some point can be estimated by [subtracting the last two positions and
dividing by the timestep
taken](http://en.wikipedia.org/wiki/Verlet_integration#Computing_velocities_.E2.80.93_St.C3.B6rmer.E2.80.93Verlet_method):

$$
\begin{align}
\tilde{v}{}_{t+1} = \frac{s_{t+1} - s_t}{2}
\end{align}
$$

The absence of velocity makes it difficult to use Verlet integration
when the acceleration is dependent on velocity, such as with dampers.
If that's the case, it's probably better to use Velocity Verlet, there's
a [good explanation on gamedev
overflow](http://gamedev.stackexchange.com/a/41917/10164) and it will be
discussed later in this article.

In this formulation, [the position at *t-1* is
required](http://www.cs.uu.nl/docs/vakken/mgp/lectures/lecture%205%20Numerical%20Integration.pdf),
so it has to be kept around from earlier iterations. If it's not
available yet -- for example the simulation has just started -- use
another integrator in the first step (RK4, ...) and switch to Verlet
when there's enough data.

It has been reported that the accuracy of these starting conditions has
a large effect on the global accuracy of the method. So it's a good idea
to use a locally accurate integrator like RK4 for the first iteration.
Alternatively, there's a modified first Verlet step that only requires
the first position, velocity and acceleration (basically a second-degree
Taylor polynomial):

$$
\begin{align}
s_{1} = s_0 + v_0 \Delta t + \frac{a_0}{2} \Delta t^2
\end{align}
$$

The verlet method is symplectic, so it does a good job of conserving
energy. It is also time-reversible, which means it can be ran backwards
and you will get the same results, history can be rewound! Especially
the last one can be a very useful property in gamedev.

It is common belief that Verlet is a good choice when it comes to
[implementing constraints between
objects](http://en.wikipedia.org/wiki/Verlet_integration#Constraints).
Because you can set the position yourself, and let the simulation derive
the velocities instead of fiddling around with the velocities manually.
How to make good use of this effect is discussed
[here](http://blog.2and2.com.au/?p=883), another great example is [this
tearable cloth simulation](http://codepen.io/suffick/pen/KrAwx).

This ease of specifying constraints is one of the prime reasons why
Verlet is preferred for physics based games. Add to that the fact that
it's also very cheap to calculate and you have a winner. Also look at
this cool way of [simulating ragdolls with
Verlet](http://gamedevelopment.tutsplus.com/tutorials/simulate-fabric-and-ragdolls-with-simple-verlet-integration--gamedev-519)
and the [article it is based on
(Jakobsen)](http://www.gotoandplay.it/_articles/2005/08/advCharPhysics.php).

Some will have noticed that Verlet is classified as a variable-order
method. [Under the right conditions, Verlet integration can be a
fourth-order
integrator](http://archive.gamedev.net/archive/reference/programming/features/verlet/default.html),
which is incredible (I have not verified this myself, but have
encountered it twice on the internet). Sadly I haven't been able to find
what all of those conditions are. However, I'm sure that one of them is
a uniform timestep. So if you want your Verlet integrator to perform
better, use a constant timestep. If the conditions are not met, Verlet
definitely becomes a second-order symplectic integrator, which is still
good.

#### Velocity Verlet (second-to-fourth-order)

**Alternative name**: very similar but not identical to [leapfrog
method](http://en.wikipedia.org/wiki/Leapfrog_integration), a good
explanation of the subtle differences
[here](http://young.physics.ucsc.edu/115/leapfrog.pdf).

An even [better
explanation](http://physics.bu.edu/py502/lectures3/cmotion.pdf), which
also explains that the leapfrog method is potentially cheaper to
calculate and has less error in its velocity step, though the error for
position is the same.

{::comment}
$$
\begin{align}
v_{t+1} =& v_t + a_{t+\frac{1}{2}} \Delta t \approx v_t + \frac{a_t + a_{t+1}}{2} \Delta t \\
s_{t+1} =& s_t + v_{t+\frac{1}{2}} \Delta t \approx s_t + \frac{v_t + v_{t+1}}{2} \Delta t
\end{align}
$$
{:/comment}

A formulation of Velocity Verlet as found in
[[1](http://en.wikipedia.org/wiki/Verlet_integration#Velocity_Verlet)],
[[2](https://www.math.ethz.ch/education/bachelor/seminars/fs2008/nas/crivelli.pdf)]
and [[3](http://cds.cern.ch/record/331170/files/9707008.pdf)]:

$$
\begin{align}
v_{t+1} =& v_t + \frac{a_t + a_{t+1}}{2} \Delta t \\
s_{t+1} =& s_t + (v_t + a_t \frac{\Delta t}{2}) \Delta t \\
        =& s_t + v_t \Delta t + a_t \frac{\Delta t^2}{2}
\end{align}
$$

There's a simplification when the acceleration is constant:
http://gamedev.stackexchange.com/questions/15708/how-can-i-implement-gravity
(he also suggest a way of calculating that's cheap). This answer is a
*MUST* read, because it also suggests a variant with a correction which
doesn't evaluate acceleration an extra time but does give extra
accuracy. Awesome.

I've encountered one [alternative
formulation](https://web.archive.org/web/20120713004111/http://wiki.vdrift.net/Numerical_Integration#Basic_Verlet.2FVelocity_Verlet)
that -- near as I can tell -- is not identical to the formulation above.
It looks like [leapfrog
integration](http://en.wikipedia.org/wiki/Leapfrog_integration), which
is a close relative of Velocity Verlet.

*TODO*: For constant acceleration, I've verified that Improved Euler and
Velocity Verlet are the same. But is this also the case for non-constant
accelerations? On first inspection it looks like it won't be the same,
Velocity Verlet seems to be have a more accurate velocity calculation
(it averages with the trapezoidal rule instead of using a forward Euler
step like imrpoved Euler).

Sometimes the Verlet method is also formulated as the *Velocity Verlet*
method, which explicitly calculates the velocity as opposed to regular
Verlet.  It is [mathematically
identical](http://www.physics.udel.edu/~bnikolic/teaching/phys660/numerical_ode/node5.html)
to regular Verlet but minimizes roundoff error, is self-starting and
keeps no memory from past steps, which is why it is sometimes preferred.

*NOTE*: in [this
presentation](http://www.richardlord.net/presentations/physics-for-flash-games)
it seems like there is a large stability difference between
Time-Corrected Verlet and Velocity Verlet (improved Euler). Perhaps
because of different ways of calculating the initial conditions, or the
time correction. This should definitely be checked since I could find no
flaw in the aforementioned proof of mathematical identity, something
smells funny...

Velocity Verlet -- like regular Verlet -- has great accuracy. In this
formulation it's easier to see why this might be the case. It averages
two accelerations to find the velocity (using the [trapezoidal
rule](http://en.wikipedia.org/wiki/Trapezoidal_rule)). This is a major
boost to accuracy over just using one acceleration sample like the
first-order methods. Then there's another (smaller) accuracy improvement
by correcting the position with the acceleration in addition to the
velocity. It's smaller because it's multiplied by the square of the
timestep, which is almost always going to be a very small number.

Some may have noticed that this method is mathematically identical to
the exact solution for the case of constant acceleration. So no matter
what the timestep, Verlet will determine the position of a constantly
accelerated object exactly. Even for non-constant acceleration Verlet
performs quite well -- definitely enough so for game physics -- though
it is not exact.

Note that the acceleration from the next step is needed to calculate the
velocity. If the acceleration depends on the position (such as for
spring forces), then the position can be calculated first, after which
the acceleration for that position can be queried:

$$
\begin{align}
\tilde{s}{}_{t+1} =& s_t + v_t \Delta t + a_t \frac{\Delta t^2}{2} \\
a_{t+1} =& acceleration(\tilde{s}{}_{t+1}) \\
\end{align}
$$

This would provide the next acceleration to calculate the velocity. When
then velocity for the next step is known, we can use it to correct the
position value:

$$
\begin{align}
v_{t+1} =& v_t + \frac{a_t + a_{t+1}}{2} \Delta t \\
s_{t+1} =& s_t + v_{t+1} \Delta t
\end{align}
$$

This approach won't work if the acceleration also depends on the
velocity, of course. The correction is [sometimes
omitted](https://web.archive.org/web/20120713004111/http://wiki.vdrift.net/Numerical_Integration#Newton-Stormer-Verlet_.28NSV.29_.2F_Symplectic_Euler_.2F_Euler.E2.80.93Cromer_algorithm),
at some point I'm going to test whether the correction actually improves
things or not (perhaps an average between both would be better? I'd also
try dividing the contribution of the midpoint acceleration in the
corrected position by two, to get a similar "factor" as the first
estimate with hopefully more accuracy).

You can keep thecalculated acceleration at step *t+1* around for the
next iteration, which means there only needs to be one calculation of
force/acceleration per Verlet iteration. This makes Verlet integration
almost as cheap as any first-order method wile being way more accurate.
Seen in this light, there's no real excuse not to use it.

#### Time-corrected Verlet (second-to-fourth-order)

As described [here](http://lonesock.net/article/verlet.html), the Verlet
and Velocity Verlet methods work best with a fixed timestep. So if
you're getting bad results it might be because your timesteps are not
uniform. When it's impossible to [fix your
timestep](http://gafferongames.com/game-physics/fix-your-timestep/),
there's a slight variation on Verlet integration you can use:

$$
\begin{align}
s_{t+1} = s_t + (s_t + s_{t-1}) \frac{\Delta t_t}{\Delta t_{t-1}} + a_{t} \Delta t^2
\end{align}
$$

It's easy to see that this method reduces to regular Verlet in case the
timesteps are in fact constant.

#### Newton-Störmer-Verlet (NSV) (second-order)

**Alternative name**: leapfrog method (don't think so...)

$$
\begin{align}
s_{t+\frac{1}{2}} = s_t + \frac{v_t}{2} \Delta t \\
v_{t+1} = v_t + a_{t+\frac{1}{2}} \Delta t \\
s_{t+1} = s_{t+\frac{1}{2}} + \frac{v_{t+1}}{2} \Delta t
\end{align}
$$

Alternative
[formulation](https://www.math.ethz.ch/education/bachelor/seminars/fs2008/nas/crivelli.pdf):

$$
\begin{align}
v_{t+1} =& v_t + \frac{a_t + a_{t+1}}{2} \Delta t \\
s_{t+1} =& s_t + (v_t + a_t \frac{\Delta t}{2}) \Delta t \\
        =& s_t + v_t \Delta t + a_t \frac{\Delta t^2}{2}
\end{align}
$$

A middle ground between explicit Euler and semi-implicit Euler.

The [NSV method is symplectic
](https://www.math.ethz.ch/education/bachelor/seminars/fs2008/nas/crivelli.pd://www.math.ethz.ch/education/bachelor/seminars/fs2008/nas/crivelli.pdf).

#### Midpoint method (second-order)


The main idea behind the midpoint method is that the derivative at the
midpoint is a better estimate of the "true" derivative than the
derivative at either the beginning (explicit Euler) or the end (implicit
Euler) of the time step. An in-depth explanation can be found
[here](http://www.darwin3d.com/gamedev/articles/col0499.pdf).

Of course you don't have the exact midpoint, so you estimate that too by
taking a half-step. Then you compute the derivative at the midpoint and
use this to take the full step.

#### Heun's method (first-to-second-order)

**Alternative names**: improved Euler, modified Euler

$$
\begin{align}
v_{t+1} = v_t + a_t \Delta t \\
s_{t+1} = s_t + (\frac{v_t + v_{t+1}}{2}) \Delta t
\end{align}
$$

**TODO**: this does not appear to be the true Heun method (_or_ improved
Euler is different). Someone has suggested that Heun is a true RK2
because heun also takes the midpoint velocity each time instead of the
version mentioned above, which does just forward Euler every time. This
would not mean that you would need to evaluate acceleration twice for
this midpoint version, as you could just pass in the acceleration from
the last step as an optimization.

Heun's method is a refinement of explicit Euler. It looks like another
combination  of implicit and explicit Euler. The estimated derivative of
the position is the average of the current velocity (like explicit
Euler) and the velocity of the next step (like implicit Euler).

Alternatively, one could say the the acceleration is being integrated
with an explicit Euler step, while the velocity is integrated with some
sort of [trapezoidal
rule](http://en.wikipedia.org/wiki/Trapezoidal_rule_(differential_equations)).
The trapezoidal rule is usually implicit, but it's explicit in this
instance because we made an estimate of the velocity at *t+1* with
explicit Euler.

The trapezoidal rule for single integration is a second-order Runge Kutta
method, just like the midpoint method. However, because the first
integration step happens with explicit Euler, which is first-order, I
believe the total result will be first-order. This needs to be verified
though.

Often, improved Euler is defined as using the trapezoidal or midpoint
rule for *both* velocity and position. In that case, the improved Euler
method is identical to Velocity Verlet (easy to work out yourself). This
is confusing indeed, but at least now you'll know how to recognize it.
It gets even more confusing when some example code assumes that
acceleration is locally constant, which makes even the naive improved
Euler as specified above and Velocity Verlet identical.

In all events, (Velocity) Verlet integration can be made almost as cheap
as this version of improved Euler and yields far better results. It is
better to use Verlet instead.

*NOTE*: [Some
authors](http://books.google.be/books?id=wJAOj6fG4q8C&lpg=PR2&pg=PA136#v=onepage&q&f=false)
change the usage of the trapezoidal rule with the [midpoint
rule](http://en.wikipedia.org/wiki/Midpoint_method). Yielding another
version of improved Euler with similar characteristics. When you see the
name Heun's method attached to it, it definitely refers to the
trapezoidal version and not the midpoint one.

The midpoint version could look like this:

$$
\begin{align}
v_{t+\frac{1}{2}} =& v_t + a_t \frac{\Delta t}{2} \\
s_{t+1} =& s_t + v_{t+\frac{1}{2}} \Delta t \\
v_{t+1} =& v_t + a_t \Delta t
\end{align}
$$

#### Runge Kutta 4

When looking closely at [Simpson's
rule](http://en.wikipedia.org/wiki/Simpson's_rule#Averaging_the_midpoint_and_the_trapezoidal_rules),
it becomes clear where one of the possible derivations for Runge-Kutta 4
lies.

The works!

As mentioned on Stack Overflow, It is [slightly
dissipative](http://stackoverflow.com/a/2770564/558819). If you don't
want that, then perhaps Verlet integration will suit your needs better.

Note that RK4 as commonly specified is *NOT* symplectic and will lose
energy after a while. As mentioned before, this is usually not a big
deal. There are symplectic higher order method, but I haven't been able
to track down a good description of them and they don't seem to be
widely used for games. David Whysong has made a few [symplectic
higher-order integrators](http://www.projectpluto.com/symp.cpp) ([Gist
mirror](https://gist.github.com/aktau/9195266)) available as
open-source.

Conclusion
----------

In essence, both Verlet and RK4 methods seem to be good, each with their
own [pro's and con's](http://gamedev.stackexchange.com/a/33835/10164).

If everything just coasts along in a linear way, it wouldn't matter what
method you used, but when something interesting (i.e. non-linear)
happens, you need to look more carefully, either by considering the
non-linearity directly (verlet) or by taking smaller timesteps (rk4).

|-------------------+------------+---------------------+---------------------|
| Integrator        | Order      | Energy conserving?  | Best order-n method |
|-------------------|------------|---------------------|---------------------|
| Implicit Euler    | 1          | No                  | No                  |
| Explicit Euler    | 1          | No                  | No                  |
| Semi-Impl. Euler  | 1          | **Yes**             | Yes                 |
| Heun              | 2          | No                  | No                  |
| Midpoint          | 2          | No                  | No                  |
| Verlet (+ related)| 2-4        | **Yes**             | Yes                 |
| Runge Kutta 4     | 4          | No                  | Yes [^2]            |
|-------------------+------------+---------------------|---------------------|

Unanswered questions
--------------------

There's two big topics in game physics that have yet to be covered:
rotation, collisions and how to handle fast or really small objects like
bullets. Until I get the time to write about them, there are some good
resources on the internet about them:

1. [Physics for Games by Burak
Kanber](http://buildnewgames.com/gamephysics/), the easiest explanation
of rotation and collisions in game physics I've seen yet. Als mentions
contiuous integration for fast or small objects.
2. [SO: best way to handle simultaneous
collisions](http://gamedev.stackexchange.com/questions/32611/what-is-the-best-way-to-handle-simultaneous-collisions-in-a-physics-engine)
3. [An extensive paper written by a Master's
student](http://eudiers.free.fr/Masters_Project/Physics_Paper.pdf) which
compiles some common game physics knowledge in the gamedev community. It
talks about simulation and collisions and even has a chapter about
deformable bodies.
4. [A reddit comment about collision handling, broad- and
narrowphase](http://www.reddit.com/r/gamedev/comments/1xl9rq/verlet_physics_collision_etc/)

A more advanced implementation
------------------------------

The [kinematic
integrator](http://physicsforgames.blogspot.de/2010/02/kinematic-integration.html),
is just a plain good idea, use it or lose it!

Research
--------

1. [Physics for flash games](http://www.richardlord.net/presentations/physics-for-flash-games)
2. [SO: why use RK4 over improved Euler?](http://gamedev.stackexchange.com/questions/25300/why-use-runge-kutta-integration-over-improved-euler-integration#)
3. [Advanced Character Physics (Jakobsen, PDF)](http://www.pagines.ma1.upc.edu/~susin/files/AdvancedCharacterPhysics.pdf)
4. [Comparison of Simulation Techniques using Particle Systems](http://www.cs.rpi.edu/~cutler/classes/advancedgraphics/F05/assignments/final_projects/mccarj7/index.html)
5. [Simple time-corrected Verlet](http://lonesock.net/article/verlet.html)
6. [Comparison of different integrators](https://web.archive.org/web/20120713004111/http://wiki.vdrift.net/Numerical_Integration)
7. [Combining numeric and exact integrators, for variable and constant forces respectively ](http://physicsforgames.blogspot.de/2010/02/kinematic-integration.html)
8. [The pendulum revisited, comparison of global and local error of numerical integration methods](http://beltoforion.de/pendulum_revisited/pendulum_revisited_en.html)
9. [OpenGL insights, implementing tearable cloth on the GPU with Verlet](http://books.google.be/books?id=CCVenzOGjpcC&pg=PA236&lpg=PA236&dq=is+verlet+integration+4th+order&source=bl&ots=pbx2CogVJE&sig=TPUUgZ1vUczVQCKzdYMNW35Lh_I&hl=en&sa=X&ei=KMELU5PNB8HWtQam5oD4Bg&ved=0CFwQ6AEwBg#v=onepage&q=is%20verlet%20integration%204th%20order&f=false)

[^1]:
    Scrolling down in [this Reddit
    thread](http://www.reddit.com/r/programming/comments/15f4qc/on_using_rk4_over_euler_to_integrate_for_physics/)
    can provide some insight into why symplecticity doesn't exactly mean
    energy conversation. Strictly put: an integrator conserves energy
    when it is both symplectic and the Hamiltonian of the system is
    time-independent. Another definition and proof can be found
    [here](https://www.math.ethz.ch/education/bachelor/seminars/fs2008/nas/crivelli.pdf).

[^2]:
    Only one fourth-order method was discussed, making  it the best by
    default.
