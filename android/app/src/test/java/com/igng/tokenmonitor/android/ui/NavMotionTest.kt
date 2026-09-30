package com.igng.tokenmonitor.android.ui

import com.igng.tokenmonitor.android.ui.core.LateralArrival
import com.igng.tokenmonitor.android.ui.core.NavMotion
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The navigation direction policy behind the tab strip.
 *
 * JVM-only on purpose: the Android test runner in this module cannot load the Compose
 * runtime (see the note in `ScopeAndProvenanceTest`), so the decision lives in
 * `ui/core/NavMotion.kt` free of Compose types and the call site only maps its result
 * onto a Compose slide direction.
 */
class NavMotionTest {
  /** The bar's order is the input, exactly as `FluentDestinations.all` declares it. */
  private val bar = listOf("overview", "analytics", "devices", "more")

  @Test
  fun onlyTwoPrimaryTabsMakeATabSwitch() {
    assertTrue(NavMotion.isTabSwitch("overview", "analytics", bar))
    assertFalse(NavMotion.isTabSwitch("overview", "settings", bar))
    assertFalse(NavMotion.isTabSwitch("device/d1", "overview", bar))
    // A null route (the very first frame, or a destination without one) is not a switch.
    assertFalse(NavMotion.isTabSwitch(null, "overview", bar))
    assertFalse(NavMotion.isTabSwitch("overview", null, bar))
  }

  @Test
  fun advancingAlongTheBarArrivesFromTheEndSide() {
    assertEquals(LateralArrival.FromEnd, NavMotion.tabArrival("overview", "analytics", bar))
    assertEquals(LateralArrival.FromEnd, NavMotion.tabArrival("analytics", "more", bar))
  }

  @Test
  fun goingBackAlongTheBarArrivesFromTheStartSide() {
    // This is the case the client used to get wrong: every switch slid one fixed way, so
    // 更多 → 总览 animated as though the user had advanced.
    assertEquals(LateralArrival.FromStart, NavMotion.tabArrival("more", "overview", bar))
    assertEquals(LateralArrival.FromStart, NavMotion.tabArrival("devices", "analytics", bar))
  }

  @Test
  fun aRouteWithNoPlaceInTheBarFallsBackToTheAdvancingDirection() {
    // There is no order to honour, so the default is the direction the strip moves when it
    // advances rather than a third, undefined answer.
    assertEquals(LateralArrival.FromEnd, NavMotion.tabArrival("overview", "settings", bar))
    assertEquals(LateralArrival.FromEnd, NavMotion.tabArrival("overview", "overview", bar))
    assertEquals(LateralArrival.FromEnd, NavMotion.tabArrival(null, "analytics", bar))
  }
}
