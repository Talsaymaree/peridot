# Peridot Design System & Implementation Rules

## Purpose
This document defines the design, UX, and motion standards for Peridot.  
Any AI agent, designer, or developer working on this project must follow these rules to preserve visual consistency, interaction quality, and the diegetic sci-fi identity of the app.

Peridot is not a generic SaaS dashboard.  
It should feel like a **modern in-world terminal interface** that could exist inside a universe inspired by:
- Ghost in the Shell
- Evangelion
- sci-fi operating systems
- tactical system displays
- signal-processing interfaces

The interface must feel:
- precise
- cold
- technical
- immersive
- restrained
- slightly tense
- system-driven rather than decorative

---

## Role the AI must take
When working on this project, act as a:

1. **Senior UI/UX designer**
   - preserve usability
   - improve hierarchy
   - maintain consistency
   - avoid arbitrary visual changes

2. **Creative director for sci-fi terminal interfaces**
   - keep the Peridot world and identity intact
   - ensure all additions feel like part of the same system
   - avoid generic startup/SaaS aesthetics

3. **Senior frontend engineer**
   - implement clean, maintainable, semantic code
   - use reusable components and tokens
   - avoid fragile layout hacks unless clearly justified

4. **Motion designer using GSAP**
   - use animation to reinforce system feedback, focus, and immersion
   - never animate for decoration alone
   - keep motion intentional, smooth, and restrained

Do not behave like a random theme generator.  
Do not redesign the product into a generic app.  
Do not introduce styles that conflict with the Peridot identity.

---

## Core visual identity
Peridot should look like a:
- system console
- tactical module
- sci-fi terminal
- signal-processing UI
- machine interface

It should **not** look like:
- a generic productivity app
- a playful mobile app
- a glossy dribbble concept
- a rounded pastel dashboard
- a default Tailwind template

---

## Design principles

### 1. Diegetic interface first
UI should feel like it belongs inside a fictional world and performs a function within that world.

Every screen and component should imply purpose:
- system state
- time processing
- routine tracking
- signal display
- module activation
- calendar/log monitoring

Always ask:
**What does this element do in the system?**

---

### 2. Function over decoration
All visual elements should feel purposeful.

Allowed:
- status lines
- signal bars
- module labels
- system headers
- node markers
- timestamps
- scan overlays
- grid hints
- data blocks

Avoid:
- random blobs
- arbitrary shapes
- decorative ribbons without meaning
- visual noise without structure

---

### 3. Controlled asymmetry
Layouts can feel unusual, sharp, and directional, but must still be anchored by:
- alignment systems
- grid logic
- meaningful spacing
- repeatable component rules

Do not place elements randomly.  
Use controlled tension, not chaos.

---

### 4. Sparse but information-rich
The UI should feel minimal at first glance, but reveal structure through:
- micro labels
- timestamps
- statuses
- coordinates
- module identifiers
- data rows
- subtle dividers

Large empty areas are acceptable only when they create tension and focus.

---

### 5. Motion as system behavior
Animation should communicate:
- initialization
- focus
- state changes
- scanning
- activation
- hover response
- transitions between modules

Do not use motion only to "make it cool."

---

## Color system

### Base
- `#0A0A0A` — BG / PRIMARY
- `#111111` — BG / SURFACE
- `#1A1A1A` — BG / ELEVATED
- `#2A2A2A` — BORDER / DIM

### Peridot greens
- `#A6FF00` — GREEN / PRIMARY
- `#7CFF2B` — GREEN / SOFT
- `#5FBF00` — GREEN / DIM
- `#D7FF84` — GREEN / HIGHLIGHT

### Cyber accents
- `#00E5FF` — CYAN / PRIMARY
- `#66F7FF` — CYAN / SOFT

### Alerts
- `#FF2D2D` — RED / ALERT
- `#FF6A00` — ORANGE / WARNING

### Overlays
- `rgba(0, 0, 0, 0.05)` — NOISE / DARK
- `rgba(166, 255, 0, 0.15)` — GLOW / GREEN
- `rgba(255, 255, 255, 0.06)` — GRID / FAINT

### Color rules
- Green is the primary identity color.
- Dark backgrounds should dominate the interface.
- Cyan is a secondary accent, used sparingly.
- Red/orange are reserved for warnings, emphasis, or critical markers.
- Avoid using too many bright colors in the same component.
- The UI should never feel rainbow or arcade-like.

---

## Typography system

### Primary display font
Use a clean, modern grotesk for titles and major interface headings:
- Space Grotesk preferred
- acceptable alternatives: Inter Tight, Satoshi, Neue Montreal if already installed and approved

### Monospace/system font
Use for data, labels, timestamps, and terminal-like UI:
- IBM Plex Mono preferred
- acceptable fallback: JetBrains Mono

### Typography roles

#### DISPLAY / TITLE
Use for:
- screen names
- section anchors
- module titles
- major labels like PERIDOT

Style guidance:
- bold
- large
- tight tracking
- confident and minimal

#### SYSTEM / LABEL
Use for:
- metadata
- headers
- state labels
- top bars
- coordinates
- date labels

Style guidance:
- monospace
- uppercase
- small size
- increased letter spacing

#### DATA / VALUE
Use for:
- time values
- system states
- routine names
- counters
- logs

Style guidance:
- monospace
- readable
- compact
- clean alignment

### Typography rules
- Use no more than 2 font families.
- Maintain a clear hierarchy.
- Avoid overly stylized sci-fi fonts.
- Avoid fake “hacker” fonts that reduce readability.
- Type should feel engineered, not decorative.

---

## Layout standards

### General layout behavior
Layouts should feel modular and machine-like.

Prefer:
- strong left alignment anchors
- sectional grouping
- clean spacing systems
- long horizontal lines
- module blocks
- grid-based placement with controlled breaks

Avoid:
- random centering everywhere
- floating objects without relation
- excessive rounded shapes
- generic card grids unless adapted to the Peridot language

### Spacing system
Use a consistent spacing scale:
- 4
- 8
- 12
- 16
- 24
- 32
- 48
- 64

Do not invent arbitrary spacing values unless there is a strong visual reason.

### Corners and borders
- corners should generally be sharp or only slightly rounded
- prefer subtle radius like `8px`, `12px`, or `16px`
- avoid overly soft bubble UI
- borders should be subtle, precise, and purposeful

---

## Component language

### Panels
Panels should feel like system modules, not soft cards.

Characteristics:
- dark outer shell
- green or dark internal display areas
- small headers
- data framing
- subtle internal divisions

### Calendar
The calendar should not look like a generic monthly date picker unless required for a specific view.

Preferred mini-calendar forms:
- signal timeline
- event log
- scan line with nodes
- schedule strip
- system list view

If a conventional month grid is necessary, it must still follow the Peridot visual language:
- mono labels
- dark surfaces
- sharp dividers
- active state in green
- restrained highlights

### Buttons
Buttons should feel like system controls.

Prefer:
- compact shapes
- sharp or lightly rounded edges
- mono labels or strong display text depending on importance
- clear active, hover, and pressed states

Avoid:
- overly soft pill buttons unless clearly intentional
- glossy or app-store style buttons

### Tags and labels
Tags should communicate status or module identity.

They should feel like:
- state markers
- alert strips
- system annotations
- routine identifiers

They should not feel like decorative stickers.

---

## Interaction principles

### Hover
Hover states should:
- clarify interactivity
- slightly intensify glow or contrast
- shift position subtly if helpful
- reveal status or secondary data if useful

Do not use exaggerated bounce or playful scaling.

### Selection
Selected states should feel:
- locked in
- active
- scanned
- current

Use:
- green highlights
- stronger borders
- internal glow
- underlines
- node emphasis

### Focus
Keyboard focus must be visible and accessible.
Focus states should match the UI language and feel intentional.

---

## GSAP motion rules

Use GSAP where motion adds meaning.

### Appropriate uses
- page/screen transitions
- module enter/exit
- line drawing
- signal sweep
- text reveal
- cursor blink
- node pulse
- status changes
- panel activation
- staggered data appearance

### Good animation behaviors
- scanline sweep
- UI boot-up
- progressive line drawing
- soft opacity fades
- subtle x/y shifts
- slight flicker on system activation
- node pulse for current state
- masked text reveal
- timeline progression

### Avoid
- excessive spinning
- elastic/cartoon easing
- dramatic zooms without purpose
- motion overload on every component
- long delays that slow down usability

### GSAP style rules
- use timelines for related sequences
- use easing that feels mechanical or controlled
- keep durations restrained
- prioritize clarity over spectacle
- animation should feel like system feedback

### Example motion tone
Good:
- terminal boot
- signal scan
- module lock-on
- subtle text activation

Bad:
- playful pop
- bouncy dashboard cards
- random floating animations

---

## UX rules

### Clarity first
Even though the app is stylized, it must remain usable.

Users should always be able to identify:
- what screen they are on
- what is interactive
- what is selected
- what has changed
- what the next action is

### Maintain hierarchy
Every screen should have:
1. primary focus area
2. secondary supporting data
3. tertiary ambient/interface details

### Preserve mental models
If a component already has established behavior in the app, reskin it without breaking the user’s understanding.

Do not change interaction patterns just to make them look more futuristic.

### Accessibility
- ensure readable contrast
- ensure labels remain legible
- do not rely on color alone for meaning
- maintain keyboard and screen-reader usability where applicable

---

## Implementation rules for AI

When implementing or updating UI:

1. Preserve existing product structure unless explicitly asked to redesign flows.
2. Reskin with the Peridot system instead of replacing behavior.
3. Reuse tokens for color, typography, spacing, radius, and motion.
4. Convert repeated patterns into reusable components.
5. Maintain semantic HTML structure.
6. Use CSS variables or theme tokens for all major design values.
7. Use GSAP only where it improves clarity or immersion.
8. Avoid generic component libraries unless they can be fully adapted to the Peridot language.
9. Keep code clean, maintainable, and production-appropriate.
10. When unsure, prefer restraint over excess.

---

## Guardrails
Do not:
- make the UI cute
- make the UI generic SaaS
- add random cyberpunk clutter
- overuse glow effects
- overuse bright red
- over-animate every element
- replace structured modules with decorative cards
- introduce inconsistent font pairings
- break spacing consistency
- ignore the existing app’s usability

---

## Preferred UI metaphors
When designing new elements, borrow from:
- system modules
- terminals
- tactical overlays
- scan displays
- signal timelines
- diagnostic panels
- scheduling consoles
- machine status interfaces

Avoid metaphors from:
- social media apps
- finance dashboards
- wellness apps
- playful mobile UIs

---

## Definition of success
A successful Peridot screen should feel like:
- a functional interface inside a sci-fi world
- coherent with the rest of the app
- immersive but usable
- technical but readable
- minimal but rich with structure
- visually disciplined

If a new screen looks like a normal modern app with green colors, it has failed.

If it feels like a believable system interface that still works as a real product, it has succeeded.