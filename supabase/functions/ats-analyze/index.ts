import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { resumeText, jobDescription, mode } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return json({ success: false, error: "Invalid resume text" }, 400);
    }

    if (resumeText.length < 50) {
      return json({ success: false, error: "Resume text too short" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("Analyzing resume for ATS compatibility, mode:", mode || "general");

    let prompt: string;
    
    if (mode === "job-specific" && jobDescription) {
      // Job-specific ATS analysis
      prompt = `You are a STRICT corporate ATS analyzing a resume against a SPECIFIC job description.

## JOB DESCRIPTION:
"""
${jobDescription}
"""

## RESUME:
"""
${resumeText}
"""

## ANALYSIS RULES:
1. Compare resume keywords directly against job requirements
2. Score based on how well the resume matches THIS specific job
3. Identify exact keyword matches and gaps
4. Be strict - if key requirements are missing, score low
5. Check for experience level match
6. Evaluate technical skills match specifically for this role

## SCORING (Job-Specific):
- 90-100: Perfect match for this role
- 80-89: Strong match, minor gaps
- 70-79: Decent match, some important gaps
- 60-69: Partial match, significant gaps
- Below 60: Poor match for this role

Respond in JSON format:
{
  "overallScore": 65,
  "jobFitAnalysis": "2-3 sentence analysis of how well this resume fits this specific job",
  "sections": [
    {
      "name": "Job Title Match",
      "score": 70,
      "status": "warning",
      "feedback": "Your title 'Junior Developer' is close but job requires 'Senior Developer' - 3+ years gap in experience"
    },
    {
      "name": "Required Skills Match",
      "score": 60,
      "status": "warning",
      "feedback": "Missing: Kubernetes (required), AWS (required), GraphQL (preferred). Found: React, Node.js, Docker"
    },
    {
      "name": "Experience Level",
      "score": 50,
      "status": "error",
      "feedback": "Job requires 5+ years, resume shows 2 years. Significant gap."
    },
    {
      "name": "Education Match",
      "score": 90,
      "status": "good",
      "feedback": "Degree matches job requirements"
    },
    {
      "name": "Keywords Density",
      "score": 55,
      "status": "warning",
      "feedback": "Only 8 of 20 key terms from job description found in resume"
    }
  ],
  "keywords": {
    "found": ["React", "Node.js", "Docker"],
    "missing": ["Kubernetes", "AWS", "GraphQL", "CI/CD", "5+ years experience"]
  },
  "improvements": [
    "Add Kubernetes experience or relevant certifications",
    "Highlight any AWS/cloud experience even if informal",
    "Include CI/CD pipeline experience from any project",
    "Add specific metrics that align with job requirements"
  ],
  "strengths": [
    "Strong React/Node.js foundation matching core requirements",
    "Docker experience is relevant"
  ],
  "fitVerdict": "STRETCH|MATCH|STRONG_MATCH|NOT_RECOMMENDED"
}`;
    } else {
      // General ATS analysis
      prompt = `You are a STRICT corporate ATS analyzer. Evaluate this resume HONESTLY.

## RESUME TEXT:
"""
${resumeText}
"""

## EVALUATION RULES (Be HARSH):
1. Real ATS systems reject 75% of resumes - score accordingly
2. PENALIZE for: missing sections, poor formatting, no metrics, weak action verbs
3. A score of 75+ should be exceptional. Most resumes score 55-70.
4. If you can't find issues, you're not looking hard enough.

## SCORING CRITERIA:
- Contact Information (10%): Must have email, phone, LinkedIn
- Professional Summary (15%): Must be specific with achievements
- Skills Section (20%): Need 15+ relevant hard skills
- Work Experience (30%): MUST have metrics/numbers in each bullet
- Education (10%): Degree, institution, dates
- Formatting (15%): Single column, standard fonts, proper hierarchy

## SCORING GUIDE:
- 90-100: Perfect (extremely rare - 1%)
- 80-89: Strong (top 5%)
- 70-79: Average, needs work (top 25%)
- 60-69: Below average (50th percentile)
- 40-59: Poor (bottom 40%)
- Below 40: Unprofessional

Respond in JSON format:
{
  "overallScore": 58,
  "sections": [
    {
      "name": "Contact Information",
      "score": 70,
      "status": "warning",
      "feedback": "Has email and phone. MISSING: LinkedIn profile which 89% of recruiters check."
    },
    {
      "name": "Professional Summary",
      "score": 40,
      "status": "error",
      "feedback": "Generic objective statement. No quantifiable achievements. Add: years of experience + 2 specific accomplishments with numbers."
    },
    {
      "name": "Skills Section",
      "score": 55,
      "status": "warning",
      "feedback": "Only 7 skills listed. Need 15+. Missing categorization. Add industry-specific tools."
    },
    {
      "name": "Work Experience",
      "score": 50,
      "status": "warning",
      "feedback": "Bullets use 'Responsible for' (weak). Only 1 of 6 bullets has metrics. Use STAR format with numbers."
    },
    {
      "name": "Education",
      "score": 85,
      "status": "good",
      "feedback": "Complete. Could add relevant coursework if GPA not listed."
    },
    {
      "name": "ATS Formatting",
      "score": 75,
      "status": "warning",
      "feedback": "May have formatting issues. Ensure single-column, standard fonts only."
    }
  ],
  "keywords": {
    "found": ["Python", "JavaScript", "Data Analysis"],
    "missing": ["Machine Learning", "TensorFlow", "AWS", "Kubernetes", "Docker", "Git", "Agile", "SQL"]
  },
  "improvements": [
    "CRITICAL: Add 5+ quantifiable achievements with numbers",
    "CRITICAL: Replace 'Responsible for' with action verbs like 'Led', 'Developed', 'Increased'",
    "Add LinkedIn URL - 87% of recruiters require it",
    "Include GitHub/portfolio for technical roles",
    "Add certifications section (increases callback by 50%)"
  ],
  "strengths": [
    "Clear contact information",
    "Chronological format is ATS-friendly"
  ]
}`;
    }

    const gatewayResp = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "You are a strict JSON-only ATS analyzer. Be honest and critical." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (gatewayResp.status === 429) {
      return json({ success: false, error: "Rate limit exceeded. Please wait and try again." }, 429);
    }
    if (gatewayResp.status === 402) {
      return json({ success: false, error: "AI credits required. Please add credits." }, 402);
    }
    if (!gatewayResp.ok) {
      console.error("AI gateway error:", gatewayResp.status);
      return json({ success: false, error: "AI gateway error" }, 500);
    }

    const gatewayJson = await gatewayResp.json();
    const analysisText = gatewayJson?.choices?.[0]?.message?.content ?? "";

    let analysis;
    try {
      let cleanText = analysisText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("Failed to parse ATS analysis:", e);
      return json({ success: false, error: "Failed to parse AI response" }, 500);
    }

    if (!analysis) {
      return json({ success: false, error: "Invalid analysis response" }, 500);
    }

    return json({ success: true, analysis, mode: mode || "general" });
  } catch (error) {
    console.error("Error in ats-analyze function:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze resume",
    }, 500);
  }
});
