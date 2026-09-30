# Android Fluent 2 component contract

Rules for the native client (`android/app/src/main/java/com/igng/tokenmonitor/android/`).
Machine-checked by `npm run verify:android`
(`verify-android-fluent-contrast.js` + `verify-android-fluent-boundary.js`); the reasoning for
why each rule exists lives next to the rule, in the source.

## Which component wins

One component per job. A screen that reaches for `androidx.compose.material3` for something
`ui/components` already answers is wrong even when it renders acceptably, because the second
implementation is the one that drifts.

| Job | Use | Not |
| --- | --- | --- |
| Elevated surface | `AppCard` | `Card`, `Surface`, tonal containers |
| Grouped rows | `FluentCardList` + `FluentListRow` | hand-rolled `Row + clickable` |
| Section label | `FluentSection` / `SectionHeader` | bare `Text` |
| Primary / secondary / tertiary / inline action | `FluentButton(variant = …)` | `Button`, `OutlinedButton`, `TextButton` |
| Icon action | `FluentIconButton` | `IconButton` |
| Boolean setting | `FluentToggle` | `Switch` |
| Text entry | `FluentTextField` | `OutlinedTextField`, `TextField` |
| Modal | `FluentDialog` | `AlertDialog` |
| Busy | `FluentProgressRing` / `FluentProgressBar` | `CircularProgressIndicator` |
| One-of-many filter or scope | `FluentTabStrip` / `FluentChoiceRow` | `FilterChip`, `Chip` |
| Navigation | `FluentNavBar` / `FluentNavRail` | `NavigationBar`, `NavigationRail`, `NavigationDrawer` |
| Page chrome | `FluentPageHeader` (root tabs) / `FluentTopBar` (drill-in) | `TopAppBar` |

`Scaffold` and `SnackbarHost` are the two accepted Material uses: the first owns the
snackbar-over-bottom-bar slot math, the second is re-skinned by `FluentSnackbar`. Both are
counted in the guard's baseline, which is why it is 2 and not 0.

## Tokens, always by name

- Colour: `LocalFluentColors.current.<alias>`. Never a hex outside `ui/theme/Color.kt`, and
  never `MaterialTheme.colorScheme` in a screen — that scheme exists only to feed leftover
  library widgets.
- Type: `FluentTypeRamp.<level>`. `MaterialTheme.typography` role names are a *ceiling*, not
  an equivalence: `bodyLarge` and `bodyMedium` are both 14/20, so the role name stops
  predicting the visual.
- Corner: `FluentShapeDefaults.controlCorner` (4 dp, interactive) / `cardCorner` (8 dp) /
  `largeCorner` (12 dp). Fluent signals "this is a control" by a tight corner; Material's
  default does the opposite.
- Spacing: `FluentSpacingDefaults`, a strict 4 dp grid. Hairlines, icon boxes and the touch
  floor are sizes and are allowed as literals; padding and gaps are not.
- Depth: `FluentElevationDefaults` + a hairline stroke. Depth is *not* expressed by tinting a
  surface, which is Material's `surfaceContainer*` ladder.

## Every interactive surface states six things

rest · hover · pressed · disabled · selected · focus.

- No Material ripple: pass `indication = null` through `Modifier.fluentClickable`, which also
  supplies the hover/press tint and the ring.
- Focus is not optional. Removing the ripple removed the only visible focus the framework gave
  away, so `Modifier.fluentFocusRing` is what makes keyboard, d-pad and switch-access usable.
  Selection is announced with `selectable` / `toggleable` and a `Role`, never by tint alone
  (WCAG 1.4.1), and an icon-only control needs a `contentDescription`.
- Touch target is the *control's* box, not the paint inside it: 48 dp. Fluent web's 44 px does
  not outrank the platform floor.

## Adaptation

`LocalFluentAdaptation` is the only window/font/motion signal components may read;
`LocalConfiguration.screenWidthDp` is the display, not the window, and is wrong in
split-screen. The app root classifies from a `BoxWithConstraints` measurement.

`fluentMotionEnabled()` gates anything that starts a transition. `animate*AsState` already
honours the platform animator scale, so the call sites that need the manual gate are precisely
the ones that bypass it: `infiniteRepeatable` loops and `Animatable.animateTo` inside
`LaunchedEffect`.

A pop is the platform's back gesture, so the platform owns its grammar. Three rules hold
together and each is enforced somewhere other than review: `android:enableOnBackInvokedCallback`
is declared (Android 14/15 still default to the legacy back path, where none of this runs);
nothing in the tree registers a back handler of its own, because NavHost's is what seeks the
transition and a second one consumes the gesture instead (`backHandlerCalls` in the boundary
guard); and the pop is **scale + fade, never a translation**. The pop cannot slide horizontally
because the system's own back animation is mirrored to the swipe edge (`EDGE_LEFT` moves the
surface the opposite way from `EDGE_RIGHT`) and Navigation Compose at this toolchain cannot hand
the edge to a transition — the predictive path reuses `popEnterTransition`/`popExitTransition`,
which is also why gesture and toolbar back necessarily share one curve, and why a cancel cannot
disagree with the drag it undoes. The push keeps Fluent's vertical layer grammar: a tap has no
gesture to follow. Tab switches travel laterally in the *bar's* order, resolved with
`SlideDirection.Start`/`End` so an RTL locale mirrors the strip (`ui/core/NavMotion.kt`).

## A refresh frame must not disturb the user

An SSE frame re-emits the composed state every few seconds, so every screen is recomposed
while the user may be reading it. Three rules, each with a mechanism rather than a review
convention:

- **Presentation-only state is remembered by identity, not by position.** Expansion sets
  (`LimitsSection`), selected tabs and scroll positions are `rememberSaveable` and keyed on
  a row's *identity* (`limitRowIdentity`) so a reorder cannot rename a row and silently
  collapse it. Keying `remember` on a decoded list instance re-derives on every frame —
  use the identity content.
- **A background frame must not move or cover the content.** The "syncing" indicator lives
  in the page header and reserves a fixed-height slot, so flipping `isRefreshing` cannot
  change the header's measured height; a transient error is de-duplicated before it reaches
  the snackbar; and `isLoading` is a cold-start signal, never set on a periodic tick.
- **A growing list is virtualized and keyed.** One `items(key = …)` / `itemsIndexed(key = …)`
  per row (the fleet, the pricing catalogue) with `listGroupShape` for the grouped look —
  composing the whole list inside one `item {}` moves the row the user is on when it
  reorders.
- **A screen composed mid-gesture must not replay its entrance.** A predictive-back drag
  composes the destination underneath while the finger is still down (and so does a rotation),
  so a reveal held in a plain `remember` runs again — the "the data arrived again" illusion
  *and* a reveal billed to the gesture's frame budget. `animateGrowProgress` remembers "this
  key already played" in a `rememberSaveable(resetKey)`: the reveal belongs to the mark's *first*
  appearance, and the key is what says whether this is that occasion.

Charts, the heatmap and the calendar share one week-start value
(`ui/core/DateRanges.firstDayOfWeek`) — three different "weeks" on one screen is a
measurement disagreement, not a style choice.

## Assets

Icons are Fluent System Icons, vendored to `res/drawable` by `npm run update-fluent-assets.js`
alongside the web bundle, and named through `FluentIcons` / `ClientIcons`. `regular` weight
only; a selected state is tint plus underline, not a swapped glyph. Brand marks whose SVG needs
a filter, gradient or transform are deliberately skipped and fall back to the letter monogram —
a mis-converted logo looks shipped, a monogram does not.

## Adding a widget

If Material has one and this contract does not, add the Fluent implementation to
`ui/components/FluentControls.kt` and lower that metric's cap in
`scripts/verify-android-fluent-boundary.js` in the same commit. Raising a cap is allowed only
with a reason written next to it; an unexplained baseline is how a migration stalls.
