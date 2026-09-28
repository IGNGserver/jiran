package com.igng.tokenmonitor.android.ui.components

import com.igng.tokenmonitor.android.data.model.LimitProviderDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The identity a limit-account row keeps across refresh frames.
 *
 * The section stores "which rows are open" as a set of these keys and intersects
 * that set with the keys of the current frame. With the old fallback the row's
 * index was part of the key, so a refresh that inserted, removed or reordered an
 * account renamed every row after it: an account the user had expanded silently
 * collapsed. These tests pin the property that made that impossible — a row's key
 * depends on its identity fields, never on its position.
 *
 * Pure and Compose-free, so the JVM suite can run it (the module's test runner
 * cannot load the Compose runtime — see the note in `DisplayFx.kt`).
 */
class LimitRowIdentityTest {
  private fun provider(
    provider: String,
    accountKey: String? = null,
    email: String? = null,
    label: String? = null,
    name: String? = null
  ) = LimitProviderDto(
    provider = provider,
    accountKey = accountKey,
    accountEmail = email,
    accountLabel = label,
    accountName = name
  )

  @Test
  fun accountKeyWinsAndIgnoresTheIndex() {
    val row = provider("codex", accountKey = "hash-1")
    assertEquals(limitRowIdentity(row, 0), limitRowIdentity(row, 7))
    assertTrue(limitRowIdentity(row, 0).startsWith("key:"))
  }

  @Test
  fun reorderingDoesNotRenameARow() {
    val target = provider("codex", email = "u@example.com", name = "work")
    val before = limitRowIdentity(target, 4)
    // The same account is now first because a new provider sorted above it.
    assertEquals(before, limitRowIdentity(target, 0))
  }

  @Test
  fun twoAccountsThatDifferOnlyByAnIdentityFieldStayDistinct() {
    val work = provider("codex", email = "u@example.com", name = "work")
    val home = provider("codex", email = "u@example.com", name = "home")
    assertNotEquals(limitRowIdentity(work, 0), limitRowIdentity(home, 0))
  }

  @Test
  fun aBlankAccountKeyFallsBackToTheIdentityFields() {
    val blank = provider("codex", accountKey = "  ", email = "u@example.com")
    val keyed = provider("codex", accountKey = "u@example.com")
    assertNotEquals(limitRowIdentity(blank, 0), limitRowIdentity(keyed, 0))
    // ...but two frames of the *same* blank-key account still agree.
    assertEquals(limitRowIdentity(blank, 0), limitRowIdentity(blank, 9))
  }

  @Test
  fun theIndexIsOnlyReachedWhenNothingElseIdentifiesTheRow() {
    assertEquals("row:codex#2", limitRowIdentity(provider("codex"), 2))
  }

  @Test
  fun providerCaseAndWhitespaceDoNotSplitIdentity() {
    val row = provider("Codex", email = "u@example.com")
    val same = provider("  codex", email = "u@example.com")
    assertEquals(limitRowIdentity(row, 0), limitRowIdentity(same, 3))
  }
}
