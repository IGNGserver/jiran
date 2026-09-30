/* main.js: wiring + animations. Depends on i18n.js + theme.js globals. */
function setupThemeButton() {
  var btn = document.querySelector("[data-theme-toggle]");
  if (btn && window.TM_theme) btn.addEventListener("click", function () { window.TM_theme.toggle(); });
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    var onChange = function () { if (window.TM_theme) window.TM_theme.reflect(); };
    if (mq.addEventListener) mq.addEventListener("change", onChange); else if (mq.addListener) mq.addListener(onChange);
  }
  if (window.TM_theme) window.TM_theme.reflect();
}

function reducedMotion() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

/* counts a [data-countup] number from 0 to its target with the full thousands
   separators, like the widget settling after a refresh */
function countUp(el) {
  var target = parseInt(el.getAttribute("data-countup"), 10);
  if (isNaN(target)) return;
  if (reducedMotion()) { el.textContent = target.toLocaleString("en-US"); return; }
  var start = null, dur = 1700;
  function frame(ts) {
    if (start === null) start = ts;
    var p = Math.min((ts - start) / dur, 1);
    var eased = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(target * eased).toLocaleString("en-US");
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function setupObservers() {
  var counters = document.querySelectorAll("[data-countup]");
  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    for (var a = 0; a < counters.length; a++) {
      var n = parseInt(counters[a].getAttribute("data-countup"), 10);
      if (!isNaN(n)) counters[a].textContent = n.toLocaleString("en-US");
    }
    for (var c = 0; c < reveals.length; c++) reveals[c].classList.add("is-visible");
    return;
  }
  document.documentElement.classList.add("js");
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (!e.isIntersecting) continue;
      var t = e.target;
      if (t.classList.contains("reveal")) t.classList.add("is-visible");
      if (t.hasAttribute("data-countup")) countUp(t);
      io.unobserve(t);
    }
  }, { threshold: 0.2 });
  for (var x = 0; x < reveals.length; x++) io.observe(reveals[x]);
  for (var y = 0; y < counters.length; y++) io.observe(counters[y]);
}


/* Hero pointer-parallax: moving the pointer over the hero gently tilts the main
   widget (--rx/--ry) and shifts the back/front cards at opposing depths
   (--px/--py). Lerped through rAF so it feels weighted, eased back to rest on
   pointerleave. Listeners attach only after the fly-in choreography has landed,
   and never for touch or prefers-reduced-motion. */
function setupHeroTilt() {
  var stage = document.querySelector(".product-stack");
  if (!stage || reducedMotion()) return;
  if (!(window.matchMedia && window.matchMedia("(pointer: fine)").matches)) return;
  var zone = document.querySelector(".hero") || stage;
  var cur = { x: 0, y: 0 }, target = { x: 0, y: 0 }, raf = null;
  function loop() {
    cur.x += (target.x - cur.x) * 0.08;
    cur.y += (target.y - cur.y) * 0.08;
    stage.style.setProperty("--ry", (cur.x * 4).toFixed(2) + "deg");
    stage.style.setProperty("--rx", (-cur.y * 3).toFixed(2) + "deg");
    stage.style.setProperty("--px", (cur.x * 10).toFixed(2) + "px");
    stage.style.setProperty("--py", (cur.y * 8).toFixed(2) + "px");
    if (Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.002) raf = requestAnimationFrame(loop);
    else raf = null;
  }
  function kick() { if (raf === null) raf = requestAnimationFrame(loop); }
  setTimeout(function () {
    zone.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      target.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      kick();
    });
    zone.addEventListener("pointerleave", function () { target.x = 0; target.y = 0; kick(); });
  }, 1500);
}

/* Feature tour: the rail on the left drives the widget stage on the right.
   Auto-advance is paced by the active item's progress-bar animation
   (animationend → next), so the CSS hover/focus pause stays perfectly in sync.
   The cycle only runs while the tour is on screen and stops for good once the
   visitor picks a feature themself. */
function setupTour() {
  var tour = document.querySelector("[data-tour]");
  if (!tour) return;
  var nav = tour.querySelector(".tour-nav");
  if (!nav) return;
  var tabs = nav.querySelectorAll(".tour-item");
  var screens = tour.querySelectorAll(".tour-screen");
  if (tabs.length < 2 || tabs.length !== screens.length) return;
  var current = 0;
  var auto = !reducedMotion();

  function activate(i, focus) {
    if (i === current) return;
    tabs[current].classList.remove("is-active");
    tabs[current].setAttribute("aria-selected", "false");
    tabs[current].setAttribute("tabindex", "-1");
    screens[current].classList.remove("is-active");
    screens[current].setAttribute("aria-hidden", "true");
    current = i;
    tabs[i].classList.add("is-active");
    tabs[i].setAttribute("aria-selected", "true");
    tabs[i].removeAttribute("tabindex");
    screens[i].classList.add("is-active");
    screens[i].removeAttribute("aria-hidden");
    if (focus) tabs[i].focus();
    if (nav.scrollWidth > nav.clientWidth + 1) nav.scrollLeft = Math.max(0, tabs[i].offsetLeft - 24);
    var counts = screens[i].querySelectorAll("[data-countup]");
    for (var c = 0; c < counts.length; c++) countUp(counts[c]);
  }

  function stopAuto() {
    auto = false;
    tour.classList.remove("is-auto");
  }

  if (auto && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        tour.classList.toggle("is-auto", auto && entries[i].isIntersecting);
      }
    }, { threshold: 0.25 });
    io.observe(tour);
  } else if (auto) {
    tour.classList.add("is-auto");
  }

  tour.addEventListener("animationend", function (e) {
    if (e.animationName === "tour-progress") activate((current + 1) % tabs.length, false);
  });
  for (var t = 0; t < tabs.length; t++) (function (i) {
    tabs[i].addEventListener("click", function () { stopAuto(); activate(i, false); });
  })(t);
  nav.addEventListener("keydown", function (e) {
    var dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    stopAuto();
    activate((current + dir + tabs.length) % tabs.length, true);
  });
}

/* Usage Dashboard replica: draws the activity heatmap, stacked bars, and
   K-line from one seeded sample series (stable across visits) and wires the
   Overview/Trends tabs plus the chart toggles, mirroring dashboard.js in the
   app. The story the data tells: heavy AI-tool use started ~3 months ago, so
   the heatmap is sparse early and dense late, matching the streak cards. */
function setupDashboard() {
  var frame = document.querySelector("[data-dash]");
  if (!frame) return;
  var heatEl = frame.querySelector("[data-dash-heatmap]");
  var chartEl = frame.querySelector("[data-dash-chart]");
  var legendEl = frame.querySelector("[data-dash-legend]");
  if (!heatEl || !chartEl || !legendEl) return;

  /* mulberry32: tiny seeded PRNG so the sample data never shifts between loads */
  function prng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var DAYS = 364; /* 52 whole weeks */
  var DENSE = 100; /* the recent stretch where real usage lives */
  var rand = prng(603);
  var daily = [];
  for (var i = 0; i < DAYS; i++) {
    var fromEnd = DAYS - 1 - i;
    var v = 0;
    if (fromEnd < DENSE) {
      var ramp = 0.3 + 0.7 * ((DENSE - fromEnd) / DENSE);
      var weekday = i % 7 === 5 ? 0.42 : i % 7 === 6 ? 0.34 : 1;
      v = ramp * weekday * (0.4 + rand() * 0.95);
      if (rand() < 0.4) v *= 1.55; /* spiky, like real agent days */
      if (fromEnd > 46 && rand() < 0.12) v = 0; /* gaps only before the current streak */
    } else if (rand() < 0.05) {
      v = 0.04 + rand() * 0.12; /* stray early experiments */
    }
    daily.push(v);
  }

  /* anchor the series to the rest of the site's data universe: the year sums
     to the 2,217,877,661 all-time total, and one agent-swarm day 11 days ago
     is forced to exactly the 228.6M "Peak day" card */
  var TOTAL = 2217877661, PEAK = 228600000;
  var peakIdx = DAYS - 1 - 11;
  daily[peakIdx] = 0;
  var restSum = daily.reduce(function (a, b) { return a + b; }, 0);
  daily[peakIdx] = (PEAK / (TOTAL - PEAK)) * restSum;
  var scale = TOTAL / (restSum + daily[peakIdx]);

  /* shares mirror the Overview breakdown (Codex 68.1% … Cursor ~0%) */
  var SERIES = {
    client: [
      { name: "Codex", color: "#58bfca", share: 0.6806 },
      { name: "Claude Code", color: "#df8b6d", share: 0.2775 },
      { name: "Hermes", color: "#f1d15f", share: 0.0419 },
      { name: "Cursor", color: "#aab3c0", share: 0.0003 }
    ],
    model: [
      { name: "gpt-5.5", color: "#49a3b0", share: 0.402 },
      { name: "claude-opus-4-8", color: "#cc7c5e", share: 0.29 },
      { name: "gemini-3.5-pro", color: "#4285f4", share: 0.207 },
      { name: "claude-sonnet-4-6", color: "#cc7c5e", share: 0.102 }
    ]
  };

  /* charts cover the dense last 90 days */
  var last90 = daily.slice(-90);
  var splits = { client: [], model: [] };
  ["client", "model"].forEach(function (key) {
    var jit = prng(key === "client" ? 91 : 47);
    for (var d = 0; d < last90.length; d++) {
      var defs = SERIES[key], parts = [], sum = 0;
      for (var s = 0; s < defs.length; s++) {
        var f = defs[s].share * (0.7 + 0.6 * jit());
        parts.push(f); sum += f;
      }
      splits[key].push(parts.map(function (f) { return last90[d] * scale * f / sum; }));
    }
  });

  function fmtCompact(v) {
    if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
    if (v >= 1e6) return (v / 1e6).toFixed(1) + "M"; /* keeps the 228.6M peak consistent with the card */
    if (v >= 1e3) return (v / 1e3).toFixed(0) + "K";
    return String(Math.round(v));
  }

  function chartDate(i) {
    return new Date(Date.now() - (last90.length - 1 - i) * 86400000);
  }
  function xLabel(i) {
    return chartDate(i).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  var CW = 760, CH = 280, padL = 46, padR = 6, padT = 10, padB = 24;
  function svgWrap(inner, w, h) {
    return '<svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + inner + "</svg>";
  }

  function axisSvg(maxV) {
    var out = "";
    for (var g = 1; g <= 4; g++) {
      var y = padT + (CH - padT - padB) * (1 - g / 4);
      out += '<line class="grid-line" x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (CW - padR) + '" y2="' + y.toFixed(1) + '"></line>'
        + '<text class="axis-label" x="' + (padL - 8) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end">' + fmtCompact(maxV * g / 4) + "</text>";
    }
    out += '<line class="axis-base" x1="' + padL + '" y1="' + (CH - padB) + '" x2="' + (CW - padR) + '" y2="' + (CH - padB) + '"></line>';
    return out;
  }

  function heatmapSvg() {
    var weeks = 52, cell = 12, gap = 3, top = 16;
    var w = weeks * (cell + gap) - gap;
    var h = top + 7 * (cell + gap) - gap;
    /* quartile thresholds over active days, like GitHub, so the one outlier
       peak day doesn't wash every other cell down a level */
    var active = daily.filter(function (v) { return v > 0; }).sort(function (a, b) { return a - b; });
    function q(p) { return active[Math.min(active.length - 1, Math.floor(active.length * p))]; }
    var q1 = q(0.25), q2 = q(0.5), q3 = q(0.75);
    var months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    var out = "";
    for (var m = 0; m < months.length; m++) {
      out += '<text class="heat-month" x="' + Math.round(m * (weeks / 12) * (cell + gap)) + '" y="10">' + months[m] + "</text>";
    }
    for (var d = 0; d < daily.length; d++) {
      var wk = Math.floor(d / 7), row = d % 7;
      var v = daily[d];
      var lvl = v === 0 ? 0 : v <= q1 ? 1 : v <= q2 ? 2 : v <= q3 ? 3 : 4;
      out += '<rect class="heat lvl-' + lvl + '" data-i="' + d + '" x="' + wk * (cell + gap) + '" y="' + (top + row * (cell + gap))
        + '" width="' + cell + '" height="' + cell + '" rx="3" style="--d:' + (wk * 14) + 'ms"></rect>';
    }
    return svgWrap(out, w, h);
  }

  function barsSvg(stack) {
    var defs = SERIES[stack];
    var totals = splits[stack].map(function (p) { return p[0] + p[1] + p[2] + p[3]; });
    var maxV = Math.max.apply(null, totals) * 1.08;
    var innerH = CH - padT - padB, baseY = CH - padB;
    var slot = (CW - padL - padR) / last90.length;
    var bw = Math.max(3, slot * 0.62);
    var out = axisSvg(maxV);
    [0, 30, 60, 89].forEach(function (i) {
      out += '<text class="axis-label" x="' + (padL + i * slot + slot / 2).toFixed(1) + '" y="' + (CH - 8) + '" text-anchor="middle">' + xLabel(i) + "</text>";
    });
    for (var d = 0; d < last90.length; d++) {
      var x = (padL + d * slot + (slot - bw) / 2).toFixed(1);
      var y = baseY, segs = "";
      for (var s = 0; s < defs.length; s++) {
        var hgt = innerH * (splits[stack][d][s] / maxV);
        y -= hgt;
        segs += '<rect x="' + x + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(0, hgt).toFixed(1) + '" fill="' + defs[s].color + '"></rect>';
      }
      out += '<g class="bar-day" style="--d:' + (d * 7) + 'ms">' + segs + "</g>"
        + '<rect class="bar-hover" data-i="' + d + '" x="' + (padL + d * slot).toFixed(1) + '" y="' + padT + '" width="' + slot.toFixed(1) + '" height="' + innerH.toFixed(1) + '"></rect>';
    }
    return svgWrap(out, CW, CH);
  }

  /* 3-day buckets, like the app: O = first day, C = last day, H/L = busiest/quietest */
  var candles = (function () {
    var vals = last90.map(function (v) { return v * scale; });
    var list = [];
    for (var b = 0; b < vals.length; b += 3) {
      var seg = vals.slice(b, b + 3);
      list.push({
        o: seg[0],
        c: seg[seg.length - 1],
        h: Math.max.apply(null, seg),
        l: Math.min.apply(null, seg),
        from: b,
        to: Math.min(last90.length - 1, b + 2)
      });
    }
    return list;
  })();

  function klineSvg() {
    var maxV = Math.max.apply(null, candles.map(function (c) { return c.h; })) * 1.08;
    var innerH = CH - padT - padB, baseY = CH - padB;
    var slot = (CW - padL - padR) / candles.length;
    var bw = slot * 0.5;
    function yOf(v) { return baseY - innerH * (v / maxV); }
    var out = axisSvg(maxV);
    [0, 10, 20, 29].forEach(function (ci) {
      out += '<text class="axis-label" x="' + (padL + ci * slot + slot / 2).toFixed(1) + '" y="' + (CH - 8) + '" text-anchor="middle">' + xLabel(Math.min(last90.length - 1, ci * 3)) + "</text>";
    });
    for (var k = 0; k < candles.length; k++) {
      var c = candles[k];
      var cls = c.c >= c.o ? "candle-up" : "candle-down";
      var x = padL + k * slot + slot / 2;
      var bodyTop = yOf(Math.max(c.o, c.c));
      var bodyH = Math.max(1.5, Math.abs(yOf(c.o) - yOf(c.c)));
      out += '<g class="candle" style="--d:' + (k * 16) + 'ms">'
        + '<line class="candle-wick ' + cls + '" x1="' + x.toFixed(1) + '" y1="' + yOf(c.h).toFixed(1) + '" x2="' + x.toFixed(1) + '" y2="' + yOf(c.l).toFixed(1) + '"></line>'
        + '<rect class="candle-body ' + cls + '" x="' + (x - bw / 2).toFixed(1) + '" y="' + bodyTop.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bodyH.toFixed(1) + '" rx="1"></rect>'
        + "</g>"
        + '<rect class="bar-hover" data-i="' + k + '" x="' + (padL + k * slot).toFixed(1) + '" y="' + padT + '" width="' + slot.toFixed(1) + '" height="' + innerH.toFixed(1) + '"></rect>';
    }
    return svgWrap(out, CW, CH);
  }

  function legendHtml(stack) {
    var defs = SERIES[stack];
    var sums = defs.map(function (_, s) {
      return splits[stack].reduce(function (a, p) { return a + p[s]; }, 0);
    });
    var total = sums.reduce(function (a, b) { return a + b; }, 0);
    return defs.map(function (def, s) {
      return '<div class="dash-legend-row"><span class="dash-legend-name"><span class="dash-legend-swatch" style="--c:' + def.color + '"></span>' + def.name + "</span>"
        + '<span class="dash-legend-val">' + fmtCompact(sums[s]) + "</span>"
        + '<span class="dash-legend-pct">' + (100 * sums[s] / total).toFixed(1) + "%</span></div>";
    }).join("");
  }

  var state = { mode: "bars", stack: "client" };
  var stackSeg = frame.querySelector("[data-dash-stack]");
  var modeSeg = frame.querySelector("[data-dash-mode]");

  /* cursor tooltip, mirroring the app's dashboard.js: bars show the per-series
     split of the hovered day, candles show OHLC for the 3-day bucket, heat
     cells show that day's tokens and cost */
  var tip = document.createElement("div");
  tip.className = "dash-tooltip hidden";
  tip.setAttribute("aria-hidden", "true");
  /* body-level: the frame's backdrop-filter would make it the containing
     block for position:fixed and throw the viewport coordinates off */
  document.body.appendChild(tip);

  function hideTip() { tip.classList.add("hidden"); }
  function positionTip(ev) {
    tip.classList.remove("hidden");
    var r = tip.getBoundingClientRect(), pad = 14;
    var x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - pad;
    tip.style.left = Math.max(8, x) + "px";
    tip.style.top = Math.max(8, y) + "px";
  }
  function fmtCost(v) {
    return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  var COST_RATE = 1899.60 / TOTAL;

  function showBarTip(i, ev) {
    var defs = SERIES[state.stack], parts = splits[state.stack][i];
    if (!parts) { hideTip(); return; }
    var total = 0, segs = [];
    for (var s = 0; s < defs.length; s++) {
      total += parts[s];
      if (parts[s] > 0) segs.push({ name: defs[s].name, color: defs[s].color, value: parts[s] });
    }
    segs.sort(function (a, b) { return b.value - a.value; });
    tip.innerHTML = '<div class="tt-head">' + xLabel(i) + " · " + fmtCompact(total) + "</div>"
      + segs.map(function (sg) {
        return '<div class="tt-row"><span class="tt-dot" style="--c:' + sg.color + '"></span><span class="tt-name">' + sg.name + '</span><span class="tt-val">' + fmtCompact(sg.value) + "</span></div>";
      }).join("");
    positionTip(ev);
  }

  function showCandleTip(i, ev) {
    var c = candles[i];
    if (!c) { hideTip(); return; }
    var head = c.to > c.from ? xLabel(c.from) + " – " + xLabel(c.to) : xLabel(c.from);
    tip.innerHTML = '<div class="tt-head">' + head + "</div>"
      + [["O", c.o], ["H", c.h], ["L", c.l], ["C", c.c]].map(function (row) {
        return '<div class="tt-row"><span class="tt-name">' + row[0] + '</span><span class="tt-val">' + fmtCompact(row[1]) + "</span></div>";
      }).join("");
    positionTip(ev);
  }

  function showHeatTip(d, ev) {
    var dt = new Date(Date.now() - (DAYS - 1 - d) * 86400000);
    var tokens = daily[d] * scale;
    var html = '<div class="tt-head">' + dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + "</div>"
      + '<div class="tt-row"><span class="tt-name">Tokens</span><span class="tt-val">' + fmtCompact(tokens) + "</span></div>";
    if (tokens > 0) html += '<div class="tt-row"><span class="tt-name">Cost</span><span class="tt-val">' + fmtCost(tokens * COST_RATE) + "</span></div>";
    tip.innerHTML = html;
    positionTip(ev);
  }

  chartEl.addEventListener("mousemove", function (ev) {
    var hit = ev.target.closest ? ev.target.closest(".bar-hover") : null;
    if (!hit) { hideTip(); return; }
    var i = Number(hit.getAttribute("data-i"));
    if (state.mode === "kline") showCandleTip(i, ev); else showBarTip(i, ev);
  });
  chartEl.addEventListener("mouseleave", hideTip);
  heatEl.addEventListener("mousemove", function (ev) {
    var hit = ev.target.closest ? ev.target.closest(".heat") : null;
    if (!hit) { hideTip(); return; }
    showHeatTip(Number(hit.getAttribute("data-i")), ev);
  });
  heatEl.addEventListener("mouseleave", hideTip);

  function renderChart() {
    chartEl.innerHTML = state.mode === "kline" ? klineSvg() : barsSvg(state.stack);
    legendEl.innerHTML = legendHtml(state.stack);
    legendEl.classList.toggle("is-hidden", state.mode === "kline");
    if (stackSeg) stackSeg.classList.toggle("is-hidden", state.mode === "kline");
    hideTip();
  }

  heatEl.innerHTML = heatmapSvg();
  renderChart();

  function wireSeg(seg, attr, apply) {
    if (!seg) return;
    var btns = seg.querySelectorAll("button");
    for (var b2 = 0; b2 < btns.length; b2++) (function (btn) {
      btn.addEventListener("click", function () {
        if (btn.classList.contains("is-active")) return;
        for (var k = 0; k < btns.length; k++) btns[k].classList.remove("is-active");
        btn.classList.add("is-active");
        apply(btn.getAttribute(attr));
      });
    })(btns[b2]);
  }
  wireSeg(stackSeg, "data-stack", function (v) { state.stack = v; renderChart(); });
  wireSeg(modeSeg, "data-mode", function (v) { state.mode = v; renderChart(); });

  /* Overview / Trends tabs crossfade like the feature tour */
  var tabs = frame.querySelectorAll(".dash-tab");
  var panes = frame.querySelectorAll(".dash-pane");
  function activateTab(i, focus) {
    for (var k = 0; k < tabs.length; k++) {
      var on = k === i;
      tabs[k].classList.toggle("is-active", on);
      tabs[k].setAttribute("aria-selected", on ? "true" : "false");
      if (on) tabs[k].removeAttribute("tabindex"); else tabs[k].setAttribute("tabindex", "-1");
      panes[k].classList.toggle("is-active", on);
      if (on) panes[k].removeAttribute("aria-hidden"); else panes[k].setAttribute("aria-hidden", "true");
    }
    hideTip();
    if (focus) tabs[i].focus();
  }
  for (var t2 = 0; t2 < tabs.length; t2++) (function (i) {
    tabs[i].addEventListener("click", function () { activateTab(i, false); });
  })(t2);
  var tablist = frame.querySelector(".dash-tabs");
  if (tablist) tablist.addEventListener("keydown", function (e) {
    var dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    var cur = 0;
    for (var k = 0; k < tabs.length; k++) if (tabs[k].classList.contains("is-active")) cur = k;
    activateTab((cur + dir + tabs.length) % tabs.length, true);
  });
}

/* Language dropdown: a <details> popover that already toggles natively; this
   adds the expected menu manners — close on selection, outside click, Escape. */
function setupLangMenu() {
  var menu = document.querySelector("[data-lang-menu]");
  if (!menu) return;
  menu.addEventListener("click", function (e) {
    var t = e.target;
    while (t && t !== menu && !t.hasAttribute("data-lang")) t = t.parentElement;
    if (t && t !== menu) menu.removeAttribute("open");
  });
  document.addEventListener("click", function (e) {
    if (menu.hasAttribute("open") && !menu.contains(e.target)) menu.removeAttribute("open");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.hasAttribute("open")) {
      menu.removeAttribute("open");
      var s = menu.querySelector("summary");
      if (s) s.focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupLanguageButtons();
  applyLanguage(preferredLanguage());
  setupThemeButton();
  setupLangMenu();
  setupObservers();
  setupHeroTilt();
  setupTour();
  setupDashboard();
});
