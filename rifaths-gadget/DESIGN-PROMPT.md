# Rifath's Gadget — website design prompt

Build a bilingual (Bangla default, English toggle) single-page website for **Rifath's Gadget**, a Bangladeshi business that sources refurbished laptops to order. They keep no stock. A customer gives a budget and a use, they suggest a spec, search the market for two to three days, show the customer laptops until one suits them, check the chosen laptop before buying it, and the customer pays at handover. Anyone can message them for a laptop suggestion.

The site must not look like a generic dark "AI startup" template. No black background with neon accents, no glassmorphism cards, no gradient blobs, no sparkle icons. It should feel like a printed archive and a workshop inspection bench: paper, ink, rulers, labels, readouts.

## References (MotionSites)

- **VHS Archive / Shelf Hero** — cream paper background, cobalt-blue ink, a curved 3D arc of narrow spines with one wide featured cover in the centre, the featured title set large in cobalt below it with arrows either side, a thin ruler timeline with year ticks along the bottom, and huge halftone-dot characters fading in at the left and right edges.
- **Robot Jellyfish (Medusa JF-4)** — a light technical HUD: an exploded 3D model of the device in the centre, small square-bullet labels with leader lines, data panels with monospace readouts and thin bar meters, a signal-orange accent used sparingly for "active" states, a status strip across the top.
- **Folio** — an enormous single wordmark set across the full width.

## Visual system

- **Palette**: paper `#ECE8DD`, paper-deep `#E2DDCF`, ink `#16182A`, cobalt `#2440A8` (primary ink colour for headings, line art and rules), signal orange `#E5562A` (only for the active state, the PASS stamp and one call-to-action), muted text `#6A685F`, rule lines cobalt at 18% opacity.
- **Type**: Archivo (variable width, 62–125) for Latin display and body; condensed widths for spines and big numbers, normal width for body. Anek Bangla (variable width) for Bangla, so both scripts share the same condensed-to-wide character. IBM Plex Mono for labels, readouts and the receipt. Labels are small uppercase mono with wide tracking in English; in Bangla they drop the uppercase and tracking.
- **Line art**: every laptop drawing is a single-colour cobalt line illustration with light hatching, like the engraved art on the VHS covers. No photos, no 3D renders.
- **Grid**: hairline cobalt rules divide sections; small mono section indices in the corners (`01 / 06`).

## Sections

1. **Header** — thin top bar like the VHS archive: brand on the left ("Rifath's Gadget —— refurbished laptops"), small uppercase links on the right, a বাং / EN switch and a "WhatsApp" link.

2. **Hero: the budget shelf** (VHS Archive) — headline across the top in cobalt: "We don't stock laptops. We find yours." with a short paragraph. Below it, a curved shelf of 12 example laptops: narrow coloured spines with vertical model names, getting smaller and turning away towards both edges; the centre one opens into a wide cover showing a cobalt line drawing of the laptop, the model name, CPU/RAM/SSD/GPU and an approximate budget. Under the shelf: the featured model name large in cobalt with ← → arrows, its use and spec in mono, and an "Ask for one like this" button that opens WhatsApp with the model and budget filled in. Along the bottom, a budget ruler from ৳25k to ৳160k with ticks; dragging it or clicking it turns the shelf to the nearest laptop in that budget. Use chips (All, Study & office, Programming, Design & editing, Gaming) filter the shelf. A caption makes clear these are examples of what a budget can find, not stock. Huge halftone Bangla words fade in at the edges: "খোঁজ" on the left, "যাচাই" on the right.

3. **Plain statement** — one large paragraph explaining the model in the business's own terms, with four figures in a row beneath it: 0 laptops in stock, 2–3 days to search, 5 checks before buying, payment at handover.

4. **The hunt, as a timeline** (VHS ruler) — the seven steps laid on a long horizontal ruler labelled Day 0 … Handover. On desktop the section pins while vertical scrolling moves the ruler sideways and a cobalt marker travels along it; the current step's card is fully inked, the others faded. On mobile it becomes a vertical ruler.

5. **Inspection bench** (Robot Jellyfish) — light HUD panel. A status strip across the top ("Inspection · sample unit · readings for illustration"). In the centre an isometric line-drawn laptop that explodes into layers as you scroll: lid, keyboard deck, then SSD and RAM, motherboard and battery, then the base. Each part has a square-bullet label that moves with it. Side panels list the five checks (cash memo, motherboard, RAM, SSD health, battery cycles) with mono readouts and thin meters; as scrolling continues, each check turns active in order, its part turns signal orange, and its readout ticks to PASS. A strip along the bottom says the checking risk is theirs: a laptop that fails a check isn't bought.

6. **The terms, on a cash-memo slip** — a paper receipt with a torn zigzag edge that prints downwards when it enters view: dotted leaders between each term and its value (laptops in stock … 0; laptops you can see … until you like one; checking risk … ours; payment … at handover; warranty and condition … varies with budget; advice … anyone can ask). The total line reads "Paid before handover … ৳0". It ends with the line from the original post thanking the reader for taking the time to read.

7. **Questions** — numbered editorial list with cobalt rules; one open at a time.

8. **Contact** — full-bleed cobalt block with paper-coloured type: the phone number set huge in condensed Archivo, then WhatsApp, call, email and Facebook as large underlined links. Below, the "RIFATH'S GADGET" wordmark across the full width (Folio), in halftone dots.

## Motion

- Hero: on load the spines slide in from the centre outwards and the featured cover unfolds; the shelf eases between items in about 700 ms; arrow keys move it.
- Text: lines rise from a mask on entry, no blur.
- Timeline: scroll-linked horizontal movement with a marker; no autoplay.
- Inspection: scroll-linked explode and sequential highlights.
- Receipt: clip-path print from the top with a slight paper settle.
- Respect `prefers-reduced-motion`: show the final state with no movement.

## Copy rules

Plain and specific, in the business's own claims only. No invented prices presented as quotes, no invented reviews, no superlatives, no slogans in three beats, no "not X but Y" flourishes beyond the business's real "we don't stock" model. Example laptops are labelled as examples with approximate budgets.
