package com.igng.tokenmonitor.android.ui.theme

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
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.slideOutVertically
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.remember
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
//   2. Direction encodes hierarchy.  Lateral motion is for siblings (tab
//      switches), vertical for depth (push/pop), scale for modality.  Reusing
//      one grammar for both makes a tab switch feel like a drill-in.

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

  const val listItemStagger = 30
  const val listItemMaxStaggered = 8
}

private fun enterFade(duration: Int) =
  fadeIn(animationSpec = tween(duration, easing = FluentMotion.decelerate))

private fun exitFade(duration: Int) =
  fadeOut(animationSpec = tween(duration, easing = FluentMotion.accelerate))

// ─── Siblings: tab switches travel laterally ────────────────────────────────

fun fluentTabEnter(): EnterTransition = slideInHorizontally(
  animationSpec = tween(FluentMotion.normal, easing = FluentMotion.decelerate),
  initialOffsetX = { (it * FluentMotion.microTravelFraction).toInt() }
) + enterFade(FluentMotion.normal)

fun fluentTabExit(): ExitTransition = slideOutHorizontally(
  animationSpec = tween(FluentMotion.fast, easing = FluentMotion.accelerate),
  targetOffsetX = { (-it * FluentMotion.microTravelFraction).toInt() }
) + exitFade(FluentMotion.fast)

// ─── Depth: push and pop travel vertically, asymmetric timing ───────────────

fun fluentContentPushEnter(): EnterTransition = slideInVertically(
  animationSpec = tween(FluentMotion.gentle, easing = FluentMotion.max),
  initialOffsetY = { (it * FluentMotion.pageTravelFraction).toInt() }
) + enterFade(FluentMotion.gentle)

fun fluentContentPushExit(): ExitTransition = slideOutVertically(
  animationSpec = tween(FluentMotion.fast, easing = FluentMotion.accelerate),
  targetOffsetY = { (-it * FluentMotion.microTravelFraction).toInt() }
) + exitFade(FluentMotion.fast)

fun fluentContentPopEnter(): EnterTransition = slideInVertically(
  animationSpec = tween(FluentMotion.normal, easing = FluentMotion.decelerate),
  initialOffsetY = { (-it * FluentMotion.microTravelFraction).toInt() }
) + enterFade(FluentMotion.normal)

fun fluentContentPopExit(): ExitTransition = slideOutVertically(
  animationSpec = tween(FluentMotion.gentle, easing = FluentMotion.accelerate),
  targetOffsetY = { (it * FluentMotion.pageTravelFraction).toInt() }
) + exitFade(FluentMotion.gentle)

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
