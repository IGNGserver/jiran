package com.igng.tokenmonitor.android.data.model

import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.format.ResolverStyle

private val historyDateFormatter = DateTimeFormatter.ISO_LOCAL_DATE
  .withResolverStyle(ResolverStyle.STRICT)
private val historyMonthFormatter = DateTimeFormatter.ofPattern("uuuu-MM")
  .withResolverStyle(ResolverStyle.STRICT)
private val datePrefixPattern = Regex("^\\d{4}-\\d{2}-\\d{2}(?=$|[TtZz\\s+-])")
private val monthPattern = Regex("^\\d{4}-\\d{2}$")

/**
 * Parse a history day without allowing malformed Hub data to reach the UI.
 *
 * The current wire contract is `YYYY-MM-DD`, but older stored records may carry
 * an ISO timestamp.  Only a valid date prefix is accepted; arbitrary strings are
 * rejected instead of being partially interpreted.
 */
fun parseHistoryDate(raw: String?): LocalDate? {
  val text = raw?.trim().orEmpty()
  val candidate = datePrefixPattern.find(text)?.value ?: return null
  return runCatching { LocalDate.parse(candidate, historyDateFormatter) }.getOrNull()
}

fun canonicalHistoryDate(raw: String?): String? = parseHistoryDate(raw)?.toString()

/** Parse either the normal `YYYY-MM` month key or an ISO date/timestamp in that month. */
fun parseHistoryMonth(raw: String?): YearMonth? {
  val text = raw?.trim().orEmpty()
  if (monthPattern.matches(text)) {
    return runCatching { YearMonth.parse(text, historyMonthFormatter) }.getOrNull()
  }
  return parseHistoryDate(text)?.let(YearMonth::from)
}

fun canonicalHistoryMonth(raw: String?): String? = parseHistoryMonth(raw)?.toString()

/**
 * Drop only rows that have no usable calendar key and canonicalize timestamp-shaped
 * keys.  Numeric history remains intact; this is a display-boundary repair, not a
 * re-measurement of the Hub's summary totals.
 */
fun HistoryDto.sanitizeForDisplay(): HistoryDto = copy(
  daily = daily.mapNotNull { row ->
    canonicalHistoryDate(row.date)?.let { date ->
      if (date == row.date) row else row.copy(date = date)
    }
  },
  monthly = monthly.mapNotNull { row ->
    canonicalHistoryMonth(row.month)?.let { month ->
      if (month == row.month) row else row.copy(month = month)
    }
  }
)

fun StatsDto.sanitizeForDisplay(): StatsDto = copy(
  historyPreview = historyPreview?.sanitizeForDisplay()
)

fun SseStatsDto.sanitizeForDisplay(): SseStatsDto = copy(
  stats = stats?.sanitizeForDisplay()
)
