package com.igng.tokenmonitor.android.ui.theme

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.AnimatedContentTransitionScope.SlideDirection
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.Easing
import androidx.compose.animation.core.InfiniteTransition
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.TransformOrigin
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

// ─── Fluent 2 motion tokens ─────────────────────────────────────────────────
//
// Durations and curves are the official `duration*` / `curve*` web tokens.
// Two rules from the spec shape everything below:
//
//   1. An arriving element is always slower than a leaving one.  A screen that
//      exits in 150ms and enters in 250ms reads as settling; symmetric timing
//      reads as bouncing.
//   2. Direction encodes hierarchy.  Lateral micro-travel is for siblings
//      (tab switches), vertical travel for a pushed layer, scale for modality.
//      Reusing one grammar for both makes a tab switch feel like a drill-in.
//   3. A gesture owns the axis it travels on.  A pop *is* a back gesture, so it
//      takes the platform's own surface grammar — the leaving layer recedes by
//      scale and fade — instead of sliding down a vertical axis the finger never
//      moved along.  See `fluentContentPopExit` for why a pop must not translate
//      horizontally either.

object FluentMotion {
  const val ultraFast = 50     // durationUltraFast — micro feedback
  const val faster = 100       // durationFaster
  const val fast = 150         // durationFast — exits, collapse
  const val normal = 200       // durationNormal — default
  const val gentle = 250       // durationGentle
  const val slow = 300         // durationSlow
  const val slower = 400       // durationSlower
  const val ultraSlow = 500    // durationUltraSlow

  // curveDecelerateMid — entering
  val decelerate: Easing = CubicBezierEasing(0f, 0f, 0f, 1f)
  // curveAccelerateMid — exiting
  val accelerate: Easing = CubicBezierEasing(1f, 0f, 1f, 1f)
  // curveEasyEaseMax — in-place property change
  val standard: Easing = CubicBezierEasing(0.8f, 0f, 0.2f, 1f)
  // curveDecelerateMax — large / hero entrance
  val max: Easing = CubicBezierEasing(0.1f, 0.9f, 0.2f, 1f)
  // curveEasyEase — the gentler general-purpose curve
  val easyEase: Easing = CubicBezierEasing(0.33f, 0f, 0.67f, 1f)

  // Travel is a fraction of the container so it scales with window width.
  const val pageTravelFraction = 0.22f
  const val microTravelFraction = 0.06f

  // The pop's own two numbers.  Scale, not translation: the leaving layer shrinks
  // and fades while the layer it uncovers comes forward — see
  // `fluentContentPopExit` for why a pop must not slide.
  const val popExitScale = 0.92f
  const val popEnterScale = 1.04f

  const val listItemStagger = 30
  const val listItemMaxStaggered = 8
}

private fun enterFade(duration: Int, easing: Easing = FluentMotion.decelerate) =
  fadeIn(animationSpec = tween(duration, easing = easing))

private fun exitFade(duration: Int, easing: Easing = FluentMotion.accelerate) =
  fadeOut(animationSpec = tween(duration, easing = easing))

// ─── Siblings: tab switches travel laterally, in the order of the bar ───────
//
// The strip moves as one piece, so the direction belongs to the *pair* of tabs, not
// to the transition: switching to a later tab pushes the strip end-ward (the new tab
// arrives from the end side) and switching back pulls it start-ward.  The client
// used to slide every switch the same way, which animated "更多 → 总览" as if the
// user had advanced.  `SlideDirection.Start`/`End` rather than a signed raw offset is
// deliberate: the transition resolves them against layout direction, so an RTL locale
// mirrors the strip without a second rule to keep in sync.

/**
 * [arrival] is the side the incoming tab arrives from; the outgoing tab leaves toward
 * the opposite side, because both tabs ride the same strip.
 */
fun AnimatedContentTransitionScope<*>.fluentTabEnter(arrival: SlideDirection): EnterTransition =
  slideIntoContainer(
    towards = arrival,
    animationSpec = tween(FluentMotion.normal, easing = FluentMotion.decelerate),
    initialOffset = { (it * FluentMotion.microTravelFraction).toInt() }
  ) + enterFade(FluentMotion.normal)

fun AnimatedContentTransitionScope<*>.fluentTabExit(arrival: SlideDirection): ExitTransition =
  slideOutOfContainer(
    towards = arrival.opposite(),
    animationSpec = tween(FluentMotion.fast, easing = FluentMotion.accelerate),
    targetOffset = { (it * FluentMotion.microTravelFraction).toInt() }
  ) + exitFade(FluentMotion.fast)

private fun SlideDirection.opposite(): SlideDirection = when (this) {
  SlideDirection.Start -> SlideDirection.End
  SlideDirection.End -> SlideDirection.Start
  SlideDirection.Left -> SlideDirection.Right
  SlideDirection.Right -> SlideDirection.Left
  else -> this
}

// ─── Depth: a push travels, a pop recedes ───────────────────────────────────

fun fluentContentPushEnter(): EnterTransition = slideInVertically(
  animationSpec = tween(FluentMotion.gentle, easing = FluentMotion.max),
  initialOffsetY = { (it * FluentMotion.pageTravelFraction).toInt() }
) + enterFade(FluentMotion.gentle)

fun fluentContentPushExit(): ExitTransition = slideOutVertically(
  animationSpec = tween(FluentMotion.fast, easing = FluentMotion.accelerate),
  targetOffsetY = { (-it * FluentMotion.microTravelFraction).toInt() }
) + exitFade(FluentMotion.fast)

/**
 * The pop is the platform's own back gesture, so it takes the platform's own surface
 * grammar: the leaving layer shrinks and fades, the layer underneath settles back into
 * place.  It deliberately does *not* translate, for two reasons that are not taste:
 *
 *   1. The system's window-level back animation is mirrored to the swipe edge
 *      (`EDGE_LEFT` moves the surface the other way from `EDGE_RIGHT`), and
 *      Navigation Compose at this toolchain cannot hand the edge to the transition —
 *      the predictive path reuses these two lambdas, and a second back callback would
 *      consume the gesture instead of seeking it.  A fixed horizontal direction is
 *      therefore wrong for one of the two edges, which is exactly the "the page went
 *      the wrong way" defect this change exists to remove.  Scale is edge- and
 *      RTL-agnostic by construction.
 *   2. Gesture and toolbar back share these specs, so the seek and the cancel replay
 *      one curve.  A separate gesture-only spec is how a cancel ends up disagreeing
 *      with the drag it is undoing.
 *
 * The exit easing is the decelerating one the platform prescribes for a back preview
 * (its `PathInterpolator(0, 0, 0, 1)` is this token), not the accelerate curve exits
 * otherwise use: feedback has to be legible at the *start* of a drag.
 */
fun fluentContentPopEnter(): EnterTransition = scaleIn(
  animationSpec = tween(FluentMotion.normal, easing = FluentMotion.decelerate),
  initialScale = FluentMotion.popEnterScale,
  transformOrigin = TransformOrigin.Center
) + enterFade(FluentMotion.normal)

fun fluentContentPopExit(): ExitTransition = scaleOut(
  animationSpec = tween(FluentMotion.gentle, easing = FluentMotion.decelerate),
  targetScale = FluentMotion.popExitScale,
  transformOrigin = TransformOrigin.Center
) + exitFade(FluentMotion.gentle, FluentMotion.decelerate)

// ─── Shared ambient sweep ───────────────────────────────────────────────────
//
// A Fluent ProgressRing / skeleton shimmer is a *loop*, and the client used to give every
// instance its own `rememberInfiniteTransition`.  That is fine while one is on screen and
// wrong the moment a dashboard renders fifteen of them: each loop kept its own frame clock
// and its own phase, so identical glyphs read as flickering rather than as one ambient
// pulse — and an SSE frame that recreated the composables behind them restarted each loop
// at an unrelated time.
//
// One transition for the app, handed down through a CompositionLocal, gives every loop a
// single clock: N rings cost one animation and share a phase.  The transition is not
// gated on a subscriber count, because it does not need to be: `InfiniteTransition` runs
// only while it has registered animations, and each consumer registers one by calling
// `phase()` — so the last mark leaving composition stops the loop by construction.
// Nothing here should add a flag on top of that; a flag that duplicates framework
// bookkeeping is one that can disagree with it.

/**
 * The shared clock.  A class rather than a bare `InfiniteTransition` so call sites read
 * `ambient.phase(period)` and cannot accidentally register on a private transition.
 */
@Immutable
class AmbientMotion internal constructor(private val transition: InfiniteTransition) {
  /** The 0f..1f loop every ambient mark on screen reads, in step. */
  @Composable
  fun phase(periodMillis: Int): Float = transition.animateFloat(
    initialValue = 0f,
    targetValue = 1f,
    animationSpec = infiniteRepeatable(
      animation = tween(periodMillis, easing = LinearEasing),
      repeatMode = RepeatMode.Restart
    ),
    label = "ambientPhase"
  ).value
}

private val LocalAmbientMotion = compositionLocalOf<AmbientMotion?> { null }

/**
 * Hosts the single app-wide [InfiniteTransition].  Call once at the root; every
 * [rememberAmbientMotion] below it returns the same clock, so N shimmering marks cost one
 * animation instead of N and share a phase instead of drifting apart.
 */
@Composable
fun ProvideAmbientMotion(content: @Composable () -> Unit) {
  val transition = rememberInfiniteTransition(label = "ambientSweep")
  val motion = remember(transition) { AmbientMotion(transition) }
  CompositionLocalProvider(LocalAmbientMotion provides motion, content = content)
}

/**
 * The shared clock, or null when the caller sits above [ProvideAmbientMotion] (a preview,
 * or a test that renders one component in isolation).  Callers fall back to a private
 * transition in that case, which keeps every component usable on its own.
 */
@Composable
fun rememberAmbientMotion(): AmbientMotion? = LocalAmbientMotion.current
