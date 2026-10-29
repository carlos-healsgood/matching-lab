# Who shows up: candidates on the distance curve

Status: accepted

## Objective

The CEO and business must approve how distance decides who appears on a vacancy's
board. They need one screen that answers, without any maths:

- which candidates appear and which do not;
- why a candidate who applied always appears;
- how far is "too far" for a candidate AI finds;
- where each candidate lands on the curve, and with what score.

They approve or reject the proposal from this screen, so every number on it must
be the proposal's, and every rule must be stated in plain words.

## The proposal it shows

| Rule | Value |
|---|---|
| A candidate who **applied** | Always shown, at any distance or with no address |
| An **AI match** within a normal commute | Score falls gently: 100 at 0 mi, 90 at 60 mi |
| An AI match past the knee | Score falls fast: about a third every 60 mi |
| An AI match beyond the **cap** | Not shown |
| Cap | **250 mi** (also the lab's Knee + cap default) |
| A candidate with **no address** | Kept, and the distance part is not scored (pending decision) |

The score shown is the **distance part** of the match, 0-100. The overall match
also weighs role, skills, availability and pay. The screen says so once, plainly.

## Users and scenarios

**Audience:** non-technical, approving a product rule. They read it on a laptop,
in a meeting or alone, from a link.

**Fake vacancy:** "Registered Nurse · City Hospital". The cast covers every case
business will ask about:

| Case | Applied | AI match |
|---|---|---|
| Lives next door (2-10 mi) | ✓ | ✓ |
| Normal commute (25-55 mi) | ✓ | ✓ |
| Just past the knee (70-100 mi) | | ✓ |
| Long drive (140-200 mi) | ✓ | ✓ |
| Near the cap (235 mi) | | ✓ |
| Just past the cap (270 mi) | | ✓, not shown |
| Another state or country (900-4,000 mi) | ✓, shown | ✓, not shown |
| No address | ✓ | ✓ |

All names are invented, first name and initial only. No real data.

## Features

1. **Plain rules strip.** Three short rules at the top, each with an icon:
   applied always shows; AI score falls after 60 mi; AI matches beyond 250 mi are
   not shown.
2. **The curve with the candidates on it.**
   - The proposal curve.
   - Three shaded zones: normal commute, steeper fall, not shown (for AI).
   - Every candidate is a point at (distance, score):
     - applicants are emerald circles;
     - AI matches are violet diamonds;
     - AI matches beyond the cap are hollow, greyed, in the "not shown" zone.
   - Far candidates beyond the chart's range sit at its right edge, labelled
     with their real distance.
   - Hovering a point shows name, origin, distance, score and whether it is
     shown.
3. **The board.** The list as a recruiter would see it:
   - shown candidates, sorted by distance score, each with an origin badge, the
     distance and a score bar;
   - below them, a "Not shown" group with the reason ("AI match, 270 mi: beyond
     the 250 mi cap");
   - candidates with no address in their own row with the "distance unknown"
     tag.
4. **Linked highlight.** Hovering a row highlights its point, and the other way
   round.
5. **Filter.** All, Applied or AI match.
6. **Try a candidate.** A distance slider and an Applied / AI match toggle place
   a starred point and give a one-sentence verdict, e.g. "An AI match 180 mi away
   is shown, distance score 13".
7. **Try other values** (collapsed by default): knee, cap. A "Back to the
   proposal" reset. Moving them updates the chart and the board.

## Tech stack and commands

- Same as the lab: Vite, React 18, TypeScript, Tailwind v4, Recharts and
  lucide-react. No new dependencies.
- `pnpm dev` runs locally; `pnpm build` typechecks and builds.
- Deployment: GitHub Pages on every push to `main`.
- Live link: https://carlos-healsgood.github.io/matching-lab/

## Project structure

- `src/lib/candidates/` holds the pure logic:
  - the fake cast;
  - `placeCandidate(candidate, params)`, which returns score, shown and reason;
  - the board ordering.
- `src/sections/WhoShowsUpSection.tsx` is the tab, registered in
  `src/sections/index.ts` and `App.tsx`.
- `src/components/candidates/` holds the chart, the board, the rules strip and
  the try-a-candidate card.
- The score comes from the existing `kneeCap` function, so the tab and the
  Distance tab can never disagree.

## Code style

- Follow the lab:
  - function components;
  - Tailwind utility classes;
  - the existing `Card`, `Badge`, `Stat` and `Slider` primitives;
  - the dark violet/cyan theme.
- Applicants are emerald and AI matches are violet; red is used only for "not
  shown".
- Units are miles throughout this tab.

## Testing strategy

- `pnpm build` passes; it includes `tsc --noEmit`.
- The logic is checked by running `placeCandidate` over the cast and comparing
  with the table above:
  - every applicant is shown;
  - AI matches beyond 250 mi are not;
  - no-address candidates are shown, with no distance score.
- Checked in the browser at desktop and narrow widths:
  - hover in both directions;
  - each filter;
  - the try-a-candidate verdicts at 30, 180 and 270 mi for both origins;
  - Reset.

## Boundaries

- **Always:**
  - fake data only;
  - plain words on screen;
  - the proposal's numbers as the defaults;
  - a single source for the curve (`kneeCap`).
- **Ask first:** anything that changes the proposal itself (knee, decay, cap) or
  claims about the overall match score.
- **Never:**
  - production data, customer names or real addresses (the repo is public);
  - new dependencies;
  - changes to the other tabs beyond the shared cap default.
