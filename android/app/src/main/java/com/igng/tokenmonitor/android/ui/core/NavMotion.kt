package com.igng.tokenmonitor.android.ui.core

/**
 * Which side a lateral transition's entering content arrives from.
 *
 * A *side*, not a signed pixel offset: the side is what survives an RTL locale, because
 * the Compose transition resolves `Start`/`End` against layout direction and the decision
 * above it has to agree.  The client used to slide every tab switch in one fixed absolute
 * direction, so an RTL locale mirrored the bar but not the motion.
 */
enum class LateralArrival { FromStart, FromEnd }

/**
 * The direction policy behind the primary-tab strip.
 *
 * Two decisions, both formerly implicit in `TokenMonitorApp.kt` and both wrong in a way no
 * compiler catches:
 *
 *  - a switch between two primary tabs travels laterally; a drill-in does not;
 *  - switching to a later tab pushes the strip end-ward, so the new tab arrives from the
 *    end side and the old one leaves toward the start.  The bar has an order, so a switch
 *    backwards has to animate backwards — it used to animate as if the user had advanced.
 *
 * Plain Kotlin on purpose, like [ScopePeriod]: the Android test runner in this module
 * cannot load the Compose runtime, so anything worth asserting stays free of Compose
 * types and the Compose call site maps [LateralArrival] onto its own slide direction.
 */
object NavMotion {
  /**
   * True when a transition moves between two primary tabs.  Both endpoints must be tab
   * routes: that is exactly the case where the global nav bar stays mounted and the motion
   * should read as lateral rather than as depth.  The order of [tabRoutes] is the bar's.
   */
  fun isTabSwitch(from: String?, to: String?, tabRoutes: List<String>): Boolean =
    from != null && to != null && from in tabRoutes && to in tabRoutes

  /**
   * Where the entering tab arrives from, given the bar's order.
   *
   * A route that is not on the bar (or an unknown index) has no order to honour, so it
   * arrives from the end side — the direction the strip moves when it advances, which is
   * the only defensible default for "I cannot tell where this came from".
   */
  fun tabArrival(from: String?, to: String?, tabRoutes: List<String>): LateralArrival {
    val fromIndex = tabRoutes.indexOf(from)
    val toIndex = tabRoutes.indexOf(to)
    return if (fromIndex >= 0 && toIndex in 0 until fromIndex) {
      LateralArrival.FromStart
    } else {
      LateralArrival.FromEnd
    }
  }
}
