/**
 * STRICT REALITY MATCHER - No Hallucinations, No Inflated Scores
 * A ruthless algorithm that gives students a reality check, not false hope.
 */

export interface StudentProfile {
  name: string;
  degree: string; // e.g., "B.Tech", "B.Com", "MBA"
  skills: string[]; // e.g., ["React", "TypeScript", "Node.js"]
  experienceYears: number;
  location: string;
  willingToRelocate: boolean;
}

export interface JobRequirements {
  id: string;
  title: string;
  company: string;
  mandatoryDegrees: string[]; // e.g., ["B.Tech", "B.E", "MCA"]
  requiredSkills: string[]; // ALL of these are needed
  preferredSkills?: string[]; // Nice to have
  minExperienceYears: number;
  allowedLocations: string[];
  isRemoteAllowed: boolean;
  primarySkill?: string; // The ONE skill that matters most
}

export interface MatchResult {
  score: number; // 0-100
  status: "Match" | "Rejected";
  reality_check_message: string;
  breakdown: {
    degreeMatch: boolean;
    locationMatch: boolean;
    skillsMatched: string[];
    skillsMissing: string[];
    experienceGap: number;
  };
}

/**
 * CORE MATCHING FUNCTION - Ruthlessly honest
 */
export function calculateStrictMatch(
  student: StudentProfile,
  job: JobRequirements
): MatchResult {
  const breakdown = {
    degreeMatch: false,
    locationMatch: false,
    skillsMatched: [] as string[],
    skillsMissing: [] as string[],
    experienceGap: 0,
  };

  // ============================================
  // HARD GATE #1: DEGREE CHECK (Instant Kill)
  // ============================================
  const studentDegreeNormalized = student.degree.toLowerCase().trim();
  const mandatoryDegreesNormalized = job.mandatoryDegrees.map(d => d.toLowerCase().trim());
  
  breakdown.degreeMatch = mandatoryDegreesNormalized.some(
    reqDegree => studentDegreeNormalized.includes(reqDegree) || reqDegree.includes(studentDegreeNormalized)
  );

  if (!breakdown.degreeMatch && job.mandatoryDegrees.length > 0) {
    return {
      score: 0,
      status: "Rejected",
      reality_check_message: `REJECTED: Degree mismatch. Job requires ${job.mandatoryDegrees.join(" or ")}. You have ${student.degree}. This is non-negotiable.`,
      breakdown,
    };
  }

  // ============================================
  // HARD GATE #2: LOCATION CHECK (Instant Kill)
  // ============================================
  const studentLocationNormalized = student.location.toLowerCase().trim();
  const allowedLocationsNormalized = job.allowedLocations.map(l => l.toLowerCase().trim());

  breakdown.locationMatch = 
    job.isRemoteAllowed ||
    student.willingToRelocate ||
    allowedLocationsNormalized.some(loc => 
      studentLocationNormalized.includes(loc) || loc.includes(studentLocationNormalized)
    );

  if (!breakdown.locationMatch) {
    return {
      score: 0,
      status: "Rejected",
      reality_check_message: `REJECTED: Location mismatch. Job is in ${job.allowedLocations.join(", ")} (Remote: ${job.isRemoteAllowed ? "Yes" : "No"}). You're in ${student.location} and not willing to relocate.`,
      breakdown,
    };
  }

  // ============================================
  // SKILL MATCHING - EXACT MATCHES ONLY
  // ============================================
  const studentSkillsNormalized = student.skills.map(s => s.toLowerCase().trim());
  const requiredSkillsNormalized = job.requiredSkills.map(s => s.toLowerCase().trim());

  for (const requiredSkill of job.requiredSkills) {
    const normalizedRequired = requiredSkill.toLowerCase().trim();
    const hasSkill = studentSkillsNormalized.some(
      studentSkill => studentSkill === normalizedRequired
    );

    if (hasSkill) {
      breakdown.skillsMatched.push(requiredSkill);
    } else {
      breakdown.skillsMissing.push(requiredSkill);
    }
  }

  // Check if PRIMARY skill is missing - massive penalty
  const primarySkillMissing = job.primarySkill && 
    !studentSkillsNormalized.includes(job.primarySkill.toLowerCase().trim());

  // Calculate base skill score
  const totalRequired = job.requiredSkills.length;
  const matched = breakdown.skillsMatched.length;
  let skillScore = totalRequired > 0 ? (matched / totalRequired) * 100 : 100;

  // If primary skill is missing, cap score at 20%
  if (primarySkillMissing) {
    skillScore = Math.min(skillScore, 20);
  }

  // ============================================
  // EXPERIENCE PENALTY
  // ============================================
  breakdown.experienceGap = Math.max(0, job.minExperienceYears - student.experienceYears);

  if (breakdown.experienceGap > 0) {
    // Deduct 50% for each year of experience gap (harsh but real)
    const experiencePenalty = Math.min(breakdown.experienceGap * 25, 50);
    skillScore = skillScore * (1 - experiencePenalty / 100);
  }

  // ============================================
  // FINAL SCORE CALCULATION
  // ============================================
  const finalScore = Math.round(Math.max(0, Math.min(100, skillScore)));

  // ============================================
  // GENERATE BRUTAL REALITY CHECK MESSAGE
  // ============================================
  let realityMessage = "";

  if (finalScore === 0) {
    realityMessage = "REJECTED: You have none of the required skills. This role is not for you.";
  } else if (finalScore < 30) {
    const missingStr = breakdown.skillsMissing.join(", ");
    realityMessage = `WEAK MATCH (${finalScore}%): You're missing critical skills: ${missingStr}. ${primarySkillMissing ? `The PRIMARY skill (${job.primarySkill}) is missing - that's a dealbreaker for most recruiters.` : ""} ${breakdown.experienceGap > 0 ? `Also short by ${breakdown.experienceGap} year(s) of experience.` : ""}`;
  } else if (finalScore < 60) {
    realityMessage = `PARTIAL MATCH (${finalScore}%): You have ${matched}/${totalRequired} required skills. Missing: ${breakdown.skillsMissing.join(", ")}. ${breakdown.experienceGap > 0 ? `Experience gap: ${breakdown.experienceGap} year(s).` : ""} You MIGHT get a callback, but don't hold your breath.`;
  } else if (finalScore < 80) {
    realityMessage = `DECENT MATCH (${finalScore}%): You meet most requirements. ${breakdown.skillsMissing.length > 0 ? `Learn ${breakdown.skillsMissing.join(", ")} to improve your chances.` : ""} Worth applying.`;
  } else {
    realityMessage = `STRONG MATCH (${finalScore}%): You're well-qualified. ${matched}/${totalRequired} skills matched. Apply immediately.`;
  }

  return {
    score: finalScore,
    status: finalScore >= 50 ? "Match" : "Rejected",
    reality_check_message: realityMessage,
    breakdown,
  };
}

/**
 * BATCH MATCHER - Rank multiple jobs for a student
 */
export function rankJobsForStudent(
  student: StudentProfile,
  jobs: JobRequirements[]
): Array<{ job: JobRequirements; result: MatchResult }> {
  const results = jobs.map(job => ({
    job,
    result: calculateStrictMatch(student, job),
  }));

  // Sort by score descending, rejected at the bottom
  return results.sort((a, b) => {
    if (a.result.status === "Rejected" && b.result.status !== "Rejected") return 1;
    if (a.result.status !== "Rejected" && b.result.status === "Rejected") return -1;
    return b.result.score - a.result.score;
  });
}

/**
 * EXAMPLE USAGE - For testing
 */
export const exampleUsage = () => {
  const student: StudentProfile = {
    name: "Rahul Kumar",
    degree: "B.Tech",
    skills: ["HTML", "CSS", "JavaScript", "Git"],
    experienceYears: 0,
    location: "Delhi",
    willingToRelocate: false,
  };

  const job: JobRequirements = {
    id: "1",
    title: "React Developer",
    company: "TechCorp",
    mandatoryDegrees: ["B.Tech", "B.E", "MCA"],
    requiredSkills: ["React", "TypeScript", "Node.js", "JavaScript", "Git"],
    primarySkill: "React",
    minExperienceYears: 2,
    allowedLocations: ["Bangalore", "Hyderabad"],
    isRemoteAllowed: false,
  };

  const result = calculateStrictMatch(student, job);
  console.log(JSON.stringify(result, null, 2));
  // Expected: Low score because missing React (primary), TypeScript, Node.js + experience gap + location
};
