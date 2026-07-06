// Skills scoring — mirrors `_skills_overlap_score` in the generic-worker scorer.
//
//   score = |required ∩ candidate| / |required|      (exact set-overlap coverage)
//
// i.e. the fraction of the job's REQUIRED skills that the candidate has. Extra
// skills the candidate holds beyond what's required neither add nor subtract.
// When the job requires no skills, the score is a neutral 1.0 (nothing to fail).
// Production matches by skill ID or normalised name; here the two lists share one
// canonical vocabulary, so matching is a plain set intersection.

export const MASTER_SKILLS: string[] = [
  "IV cannulation",
  "Medication administration",
  "Phlebotomy",
  "Venepuncture",
  "Wound care",
  "Care planning",
  "Patient assessment",
  "CPR / BLS",
  "Catheterisation",
  "Manual handling",
  "Infection control",
  "Record keeping",
];

export function skillsScore(required: string[], candidate: string[]): number {
  if (required.length === 0) return 1; // no requirement -> neutral 100
  const have = new Set(candidate);
  const matched = required.filter((s) => have.has(s)).length;
  return matched / required.length;
}

export function skillsBreakdown(required: string[], candidate: string[]) {
  const have = new Set(candidate);
  const req = new Set(required);
  return {
    matched: required.filter((s) => have.has(s)),
    missing: required.filter((s) => !have.has(s)),
    extra: candidate.filter((s) => !req.has(s)),
    score: skillsScore(required, candidate),
  };
}
