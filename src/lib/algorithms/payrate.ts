// Pay-rate scoring — mirrors `_pay_score_and_factor` (component) in the
// generic-worker scorer.
//
//   candidate pay <= 0 (no stated pay)        -> 0
//   job has no rate, or candidate <= budget   -> 1   (never penalise a cheaper candidate)
//   over budget                               -> (jobPay / candidatePay) ** hp
//
// One-sided: only being MORE expensive than the budget costs you, and it decays
// softly (exponent hp, default 1.7 in production), asymptotic to 0 — never nuked.
export const PAY_DEFAULTS = { jobPay: 25, hp: 1.7 };

export function payScore(
  candidatePay: number,
  jobPay: number,
  hp: number,
): number {
  if (candidatePay <= 0) return 0;
  if (jobPay <= 0 || candidatePay <= jobPay) return 1;
  return (jobPay / candidatePay) ** hp;
}
