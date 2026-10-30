# Proposed distance curve: 50 at 60 miles

Status: implemented

Supersedes the curve values in [2026-10-29-who-shows-up](2026-10-29-who-shows-up.md).
The tab, the cast and the cap are unchanged.

## Change

| | Before | Now |
|---|---|---|
| 0 → 60 mi | linear, 100 → 90 | linear, 100 → **50** |
| Past 60 mi | exponential (L = 60 mi), fading to 0 at the cap | exponential (L = **45 mi**), fading to 0 at the cap |
| Cap | 250 mi | 250 mi |

## Why L = 45 mi

Past 60 mi only 50 points remain for 190 miles. A harder drop right after the knee
forces a longer tail of near-zero scores before the cap:

| L | Drop just past 60 mi | Score reaches 0 at |
|---|---|---|
| 40 mi | 1.12 points/mi | 220 mi |
| **45 mi** | **1.01 points/mi** | **227 mi** |
| 60 mi | 0.80 points/mi | 238 mi |

The first 60 miles drop 0.83 points/mi. L = 45 makes the fall past the knee about 20 %
steeper than that, and still keeps a score of at least 1 up to about 225 mi. The tab's
curvature slider tries the others.

## Resulting scores

| mi | 0 | 30 | 60 | 75 | 90 | 120 | 150 | 180 | 200 | 220 | 250 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| score | 100 | 75 | 50 | 36 | 25 | 13 | 6 | 3 | 2 | 1 | 0 |
