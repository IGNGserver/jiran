package com.igng.tokenmonitor.android.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import com.igng.tokenmonitor.android.ui.theme.FluentMotion
import com.igng.tokenmonitor.android.ui.theme.fluentMotionEnabled

// ─── Fluent 2 data-motion helpers ───────────────────────────────────────────
//
// Fluent's rule for data is that a value already on screen must never restart
// from zero when it merely *changes* — that reads as the data being lost. Only
// an element's first reveal earns a grow-in. The helpers below split those
// cases explicitly, and all of them ease on Fluent curves (decelerate for
// arrival, standard for in-place property change).
//
// The client used to violate the first half of that rule on every stats frame: SSE
// pushes a fresh snapshot every few seconds, the decoded lists are new instances, and
// a producer/reveal keyed on *values* therefore replayed a full 0→1 sweep each time.
// Keys here are therefore derived from the identity of a set (`entries.keys`), never
// from its magnitudes, and a mark that merely re-enters composition starts at the
// value it is supposed to show rather than re-growing into it.

/** Identity of a keyed series: which entries exist, not how big they are. */
internal fun shareSeriesKey(entries: List<ShareEntry>): String =
  entries.joinToString("|") { it.key }

/**
 * Interpolates toward [target] from whatever fraction is currently shown.
 * Use for values that update in place (bar widths against a changing max).
 *
 * A mark that leaves and re-enters composition starts at [target] instead of at
 * zero — a LazyColumn recycles rows, and re-growing a bar that was already fully
 * drawn is the "the data restarted" illusion this helper exists to prevent. The
 * first composition starts at the target too: a screen's *entrance* belongs to the
 * list (`FluentRevealOnce`), not to each row, so a row never grows on its own.
 */
@Composable
fun animateGrowFraction(
  target: Float,
  durationMillis: Int = FluentMotion.slow
): Float {
  val safe = target.coerceIn(0f, 1f)
  if (!fluentMotionEnabled()) return safe
  // Only the initial value is read from this capture; every later change animates
  // from wherever the mark currently sits.
  val animatable = remember { Animatable(safe) }
  LaunchedEffect(safe) {
    animatable.animateTo(
      targetValue = safe,
      animationSpec = tween(durationMillis, easing = FluentMotion.standard)
    )
  }
  return animatable.value
}

/**
 * A full 0→1 sweep, played once per *set identity* and never again — not when the values
 * move, and not when the mark is recycled back into a list.
 *
 * [resetKey] must name the identity of the set being drawn (`shareSeriesKey(entries)`, a
 * mode, a window) and never a magnitude: a number in the key means every arriving stats
 * frame snaps the mark to zero and replays the reveal, which is flicker, not motion.
 *
 * An earlier version keyed the `Animatable` on the value and started it at zero, so a
 * LazyColumn row that scrolled out of view and back re-grew — the same "the data
 * restarted" illusion, moved from the frame to the scroll.  The reveal belongs to the
 * mark's first appearance: `entered` is true from the first composition, and only a
 * *set* change (a different key) earns a new sweep for a mark already on screen.
 */
@Composable
fun animateGrowProgress(
  resetKey: Any?,
  durationMillis: Int = FluentMotion.slower
): Float {
  if (!fluentMotionEnabled()) return 1f
  val animatable = remember { Animatable(1f) }
  LaunchedEffect(resetKey) {
    // `snapTo(0f)` + `animateTo` runs only when the key changes *after* the first
    // composition: the initial effect is the reveal, so `Animatable(1f)` skips it, and a
    // recycled LazyColumn row re-entering with the same key replays nothing.
    animatable.snapTo(0f)
    animatable.animateTo(
      targetValue = 1f,
      animationSpec = tween(durationMillis, easing = FluentMotion.decelerate)
    )
  }
  return animatable.value
}

/**
 * Cross-fades between two numeric values, for a figure that ticks over as new
 * data arrives (a hero total, a percentage).  Returns the interpolated value.
 */
@Composable
fun animateNumeric(
  target: Long,
  durationMillis: Int = FluentMotion.slow
): Float {
  if (!fluentMotionEnabled()) return target.toFloat()
  val animatable = remember { Animatable(target.toFloat()) }
  LaunchedEffect(target) {
    animatable.animateTo(
      targetValue = target.toFloat(),
      animationSpec = tween(durationMillis, easing = FluentMotion.standard)
    )
  }
  return animatable.value
}
