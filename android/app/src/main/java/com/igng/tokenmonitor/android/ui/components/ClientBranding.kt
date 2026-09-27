package com.igng.tokenmonitor.android.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import com.igng.tokenmonitor.android.ui.theme.FluentShapeDefaults
import com.igng.tokenmonitor.android.ui.theme.FluentTypeRamp
import androidx.compose.ui.draw.clip
import androidx.compose.material3.Icon
import androidx.compose.ui.res.painterResource
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.abs

/**
 * Desktop-aligned client labels & brand colors (from electron usageCharts / app.js).
 * Unknown ids fall back to a stable hashed chart color.
 */
object ClientBranding {
  val labels: Map<String, String> = mapOf(
    "claude" to "Claude Code",
    "claude-desktop" to "Claude Desktop",
    "codex" to "Codex",
    "hermes" to "Hermes",
    "gemini" to "Gemini",
    "cursor" to "Cursor",
    "opencode" to "OpenCode",
    "openclaw" to "OpenClaw",
    "antigravity" to "Antigravity",
    "cline" to "Cline",
    "kimi" to "Kimi",
    "qwen" to "Qwen",
    "grok" to "Grok Build",
    "copilot" to "GitHub Copilot",
    "pi" to "Pi",
    "zed" to "Zed",
    "kilocode" to "Kilo Code",
    "micode" to "MiMo Code",
    "zcode" to "ZCode",
    "kiro" to "Kiro",
    "codebuddy" to "CodeBuddy",
    "workbuddy" to "WorkBuddy",
    "proma" to "Proma",
    "deepseek-harness" to "DeepSeek Harness",
    "commandcode" to "Command Code",
    "qodercn" to "Qoder CN",
    "reasonix" to "Reasonix",
    "deepseek" to "DeepSeek",
    "xiaomi" to "Xiaomi",
    "mimo" to "MiMo",
    "minimax" to "MiniMax",
    "doubao" to "Doubao",
    "ollama" to "Ollama",
    "moonshot" to "Moonshot",
    "xai" to "xAI",
    "meta" to "Meta",
    "mistral" to "Mistral",
    "zai" to "Z.ai",
    "zaiteam" to "Z.ai Team",
    "cohere" to "Cohere",
    "volcengine" to "Volcengine",
    "qoder" to "Qoder",
    "openrouter" to "OpenRouter",

    // Every remaining wired harness. These mirror CLIENT_LABELS /
    // CLIENT_COLORS in src/shared-ui/core/data.js one-for-one; a new tracked id
    // has to be added to both, which tests/shared/clientTracking.test.js asserts.
    "roocode" to "Roo Code",
    "amp" to "Amp",
    "droid" to "Droid",
    "mux" to "Mux",
    "kilo" to "Kilo CLI",
    "crush" to "Crush",
    "goose" to "Goose",
    "codebuff" to "Codebuff",
    "freebuff" to "Freebuff",
    "trae" to "Trae",
    "warp" to "Warp",
    "gjc" to "Gajae-Code",
    "jcode" to "Jcode",
    "junie" to "Junie",
    "opencodereview" to "OpenCodeReview",
    "devin-cli" to "Devin CLI",
    "devin-desktop" to "Devin Desktop",
    "senpi" to "Senpi",
    "augment" to "Augment Code",
    "kimchi" to "Kimchi",
    "prime-agent" to "Prime Agent",
    "cherrystudio" to "Cherry Studio",
    "mcode" to "MiniMax Code",
    "fx" to "Fx",
    "lmstudio" to "LM Studio",
    "unsloth" to "Unsloth",
    "hindsight" to "Hindsight"
  )

  private val colors: Map<String, Color> = mapOf(
    "claude" to Color(0xFFCC7C5E),
    "claude-desktop" to Color(0xFFD4927A),
    "codex" to Color(0xFF49A3B0),
    "hermes" to Color(0xFFD4AF37),
    "gemini" to Color(0xFF4285F4),
    "antigravity" to Color(0xFF4285F4),
    "cline" to Color(0xFF323B43),
    "kimi" to Color(0xFF16191E),
    "grok" to Color(0xFF222222),
    "copilot" to Color(0xFF24292F),
    "deepseek" to Color(0xFF4D6BFE),
    "deepseek-harness" to Color(0xFF4D6BFE),
    "commandcode" to Color(0xFF4D8CFF),
    "qodercn" to Color(0xFF2ADB5C),
    "reasonix" to Color(0xFF4D6BFE),
    "cursor" to Color(0xFF2D2D2D),
    "opencode" to Color(0xFF1A1A1A),
    "openclaw" to Color(0xFFFF4D4D),
    "xai" to Color(0xFF222222),
    "meta" to Color(0xFF1D65C1),
    "mistral" to Color(0xFFFA520F),
    "qwen" to Color(0xFF615CED),
    "pi" to Color(0xFF333333),
    "zed" to Color(0xFF4173E7),
    "kilocode" to Color(0xFFF8F676),
    "micode" to Color(0xFF333333),
    "mimo" to Color(0xFFFF6700),
    "xiaomi" to Color(0xFFFF6700),
    "zcode" to Color(0xFF333333),
    "kiro" to Color(0xFF9046FF),
    "codebuddy" to Color(0xFF6C4DFF),
    "workbuddy" to Color(0xFF0DC8A5),
    "proma" to Color(0xFF333333),
    "moonshot" to Color(0xFF16191E),
    "minimax" to Color(0xFFF23F5D),
    "doubao" to Color(0xFF1E37FC),
    "ollama" to Color(0xFF888888),
    "zai" to Color(0xFF333333),
    "zaiteam" to Color(0xFF333333),
    "cohere" to Color(0xFF39594D),
    "volcengine" to Color(0xFF006EFF),
    "qoder" to Color(0xFF2ADB5C),
    "openrouter" to Color(0xFF6B57FF),
    "default" to Color(0xFF6AB4F0),

    // Every remaining wired harness. These mirror CLIENT_LABELS /
    // CLIENT_COLORS in src/shared-ui/core/data.js one-for-one; a new tracked id
    // has to be added to both, which tests/shared/clientTracking.test.js asserts.
    "roocode" to Color(0xFF7C3AED),
    "amp" to Color(0xFFF34E3F),
    "droid" to Color(0xFF000000),
    "mux" to Color(0xFF5B21B6),
    "kilo" to Color(0xFFF8F676),
    "crush" to Color(0xFF7D5CFF),
    "goose" to Color(0xFF000000),
    "codebuff" to Color(0xFF4D8CFF),
    "freebuff" to Color(0xFF22C55E),
    "trae" to Color(0xFF0EA5E9),
    "warp" to Color(0xFF01A4FF),
    "gjc" to Color(0xFFF59E0B),
    "jcode" to Color(0xFF6366F1),
    "junie" to Color(0xFFFE2857),
    "opencodereview" to Color(0xFF0EA5E9),
    "devin-cli" to Color(0xFF111827),
    "devin-desktop" to Color(0xFF111827),
    "senpi" to Color(0xFF8B5CF6),
    "augment" to Color(0xFFFF5C35),
    "kimchi" to Color(0xFFE11D48),
    "prime-agent" to Color(0xFF0F766E),
    "cherrystudio" to Color(0xFFFF5A5F),
    "mcode" to Color(0xFFF23F5D),
    "fx" to Color(0xFF3B82F6),
    "lmstudio" to Color(0xFF5A67D8),
    "unsloth" to Color(0xFF22D3EE),
    "hindsight" to Color(0xFFA855F7)
  )

  private val fallbacks = listOf(
    Color(0xFF6AB4F0),
    Color(0xFFCC7C5E),
    Color(0xFFA57DF0),
    Color(0xFF49A3B0),
    Color(0xFFF0D66A),
    Color(0xFFF06A7B)
  )

  fun label(id: String): String {
    val key = id.trim().lowercase()
    if (key == "其他" || key.equals("other", true)) return "其他"
    return labels[key] ?: id
  }

  fun color(id: String): Color {
    val key = id.trim().lowercase()
    if (key == "其他" || key.equals("other", true)) return colors.getValue("default")
    colors[key]?.let { return liftDark(it) }
    // stable hash
    var hash = 0
    for (ch in key) hash = (hash * 31 + ch.code)
    return fallbacks[abs(hash) % fallbacks.size]
  }

  /**
   * Brand colour usable as a *foreground* on this client's own quiet tile.
   * Several marks are near-black by brand (Kimi, Grok, Copilot, Cursor); on the dark
   * theme that is invisible, so the same lift the monogram path uses applies here too.
   */
  @Composable
  fun liftDarkTinted(clientId: String): Color {
    val base = color(clientId)
    val dark = androidx.compose.foundation.isSystemInDarkTheme()
    return if (dark) liftDark(base) else base
  }

  /** Slightly lighten near-black brand colors so they stay visible on dark surfaces. */
  private fun liftDark(c: Color): Color {
    val lum = 0.2126f * c.red + 0.7152f * c.green + 0.0722f * c.blue
    return if (lum < 0.12f) c.copy(red = 0.45f, green = 0.45f, blue = 0.48f) else c
  }

  fun monogram(id: String): String {
    val label = label(id)
    val parts = label.split(' ', '-', '_').filter { it.isNotBlank() }
    return when {
      parts.size >= 2 -> "${parts[0].first().uppercaseChar()}${parts[1].first().uppercaseChar()}"
      label.length >= 2 -> label.take(2).replaceFirstChar { it.uppercaseChar() }
      label.isNotEmpty() -> label.take(1).uppercase()
      else -> "?"
    }
  }
}

@Composable
fun ClientMonogram(
  clientId: String,
  modifier: Modifier = Modifier,
  size: Dp = 28.dp
) {
  val bg = ClientBranding.color(clientId)
  val isDark = androidx.compose.foundation.isSystemInDarkTheme()
  val fg = if (0.2126f * bg.red + 0.7152f * bg.green + 0.0722f * bg.blue > 0.55f) {
    Color(0xFF1A1A1A)
  } else {
    Color.White
  }
  val mark = ClientIcons.drawable(clientId)
  if (mark != 0) {
    // The brand mark the web and desktop render, tinted with the same brand colour
    // the monogram used.  `ClientBranding.liftDark` already keeps near-black marks
    // legible on a dark surface.  4 dp corners, matching every other tile in the
    // client, rather than the circular Material avatar.
    val tileBg = if (isDark) {
      bg.copy(alpha = 0.22f)
    } else {
      bg.copy(alpha = 0.12f)
    }
    Box(
      modifier = modifier
        .size(size)
        .clip(FluentShapeDefaults.controlCorner)
        .background(tileBg)
        .border(0.5.dp, bg.copy(alpha = if (isDark) 0.35f else 0.18f), FluentShapeDefaults.controlCorner),
      contentAlignment = Alignment.Center
    ) {
      Icon(
        painter = painterResource(mark),
        contentDescription = ClientBranding.label(clientId),
        tint = ClientBranding.liftDarkTinted(clientId),
        modifier = Modifier.size(size * 0.65f)
      )
    }
    return
  }
  Box(
    modifier = modifier
      .size(size)
      .clip(FluentShapeDefaults.controlCorner)
      .background(bg),
    contentAlignment = Alignment.Center
  ) {
    Text(
      ClientBranding.monogram(clientId),
      color = fg,
      fontSize = (size.value * 0.36f).sp,
      fontWeight = FontWeight.Bold,
      style = FluentTypeRamp.caption2.copy(fontSize = (size.value * 0.36f).sp)
    )
  }
}
