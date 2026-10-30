# No address on file scores 0 on distance

Status: implemented

The lab showed a candidate with no address as "distance not scored". The product
does something else, and the lab must show what the product does.

- **generic-worker** returns no distance section when the distance is unknown.
- **application-service** then scores that section **0** when the vacancy has a
  location (`VacancyJudgeable` in `rubric-score.mapper.ts`). It leaves the section
  out only when the vacancy has none.

So, in the lab, a candidate with no address is shown and scores 0 on distance. What
to do with them is a pending business decision; this records today's behaviour.
