import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";
const FIRECRAWL_API = "https://api.firecrawl.dev/v1/search";

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
    const { resumeText } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return json({ success: false, error: "Invalid resume text" }, 400);
    }

    if (resumeText.length < 50) {
      return json({ success: false, error: "Resume text too short" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("Analyzing resume with extracted text");

    // 1) Validate if this is a resume
    const validationPrompt = `Analyze this text and determine if it's a resume/CV.

A resume typically contains: personal info (name, email, phone), education, skills, work experience, projects.

Text to analyze:
"""
${resumeText.substring(0, 2000)}
"""

Respond in this exact JSON format:
{
  "isResume": true/false,
  "reason": "brief explanation in Hindi if not a resume"
}`;

    const validationResp = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "You are a strict JSON-only classifier. Return only valid JSON." },
          { role: "user", content: validationPrompt },
        ],
      }),
    });

    if (validationResp.status === 429) {
      return json({ success: false, error: "Rate limit exceeded. Please wait and try again." }, 429);
    }
    if (validationResp.status === 402) {
      return json({ success: false, error: "AI credits required. Please add credits." }, 402);
    }
    if (!validationResp.ok) {
      console.error("AI gateway error (validation):", validationResp.status);
      return json({ success: false, error: "AI gateway error" }, 500);
    }

    const validationJson = await validationResp.json();
    const validationText = validationJson?.choices?.[0]?.message?.content ?? "";
    
    let validation;
    try {
      const jsonMatch = validationText.match(/\{[\s\S]*\}/);
      validation = jsonMatch ? JSON.parse(jsonMatch[0]) : { isResume: false, reason: "Could not parse response" };
    } catch {
      validation = { isResume: false, reason: "Invalid response format" };
    }

    if (!validation.isResume) {
      return json({
        success: false,
        isResume: false,
        reason: validation.reason || "यह document एक resume नहीं है।",
      });
    }

    // 2) Analyze resume - HONEST evaluation
    const analysisPrompt = `You are a BRUTALLY HONEST career advisor analyzing a resume. Do NOT sugarcoat results.

Resume Text:
"""
${resumeText}
"""

Extract skills, experience level, and domain. Then provide a REALISTIC assessment:

EXPERIENCE LEVEL CRITERIA (be strict):
- "fresher": 0 experience, still studying or just graduated, no significant work history
- "junior": 0-2 years, some internships or entry-level work
- "mid": 2-5 years of relevant full-time experience
- "senior": 5+ years with leadership/specialized expertise

HONEST MATCHING RULES:
1. If candidate is a fresher with NO experience - matchScore for jobs should be 30-50%
2. If skills are basic/common (HTML, CSS, basic Python) - don't inflate scores
3. If no notable projects or achievements - be honest about limited options
4. If resume is poorly written - suggest learning opportunities first
5. Prioritize REAL opportunities based on their ACTUAL level

Generate 15-20 opportunities across these categories based on their REAL level:
- For FRESHERS: Focus more on INTERNSHIP, HACKATHON, EVENT, LEARNING. Fewer JOBS.
- For JUNIOR: Mix of INTERNSHIP, JOB (entry-level only), HACKATHON, LEARNING
- For MID/SENIOR: More JOB, some HACKATHON, LEARNING for upskilling

PLATFORMS TO USE:
- INTERNSHIP: Internshala, LinkedIn, Cuvette, AngelList
- JOB: LinkedIn, Naukri, Wellfound, Indeed (only for their actual level!)
- HACKATHON: Unstop, Devfolio, HackerEarth, MLH
- EVENT: Meetup, LinkedIn Events, Unstop, Eventbrite
- LEARNING: Coursera, Udemy, ResearchGate, Google Scholar, freeCodeCamp

Respond in JSON format:
{
  "skills": ["skill1", "skill2"],
  "experienceLevel": "fresher|junior|mid|senior",
  "domain": "primary domain",
  "honestAssessment": "2-3 sentence honest evaluation of their readiness. Be direct but constructive.",
  "opportunities": [
    {
      "type": "INTERNSHIP|JOB|HACKATHON|EVENT|LEARNING",
      "title": "specific opportunity title",
      "company": "company/organizer/platform name",
      "platform": "where to find this",
      "location": "location or Remote",
      "matchScore": 45,
      "analysis": "honest reason why this matches OR why they should work towards it",
      "searchQuery": "exact search query to find this opportunity",
      "estReplyTime": "realistic timeframe",
      "isVerified": true,
      "difficulty": "easy|moderate|stretch"
    }
  ]
}

MATCHSCORE RULES:
- fresher for jobs: 25-45%
- fresher for internships: 50-75%
- fresher for hackathons: 60-80%
- fresher for learning: 85-95%
- Adjust based on actual skill match, not wishful thinking

Be honest. If someone needs to improve, tell them. If they're not ready for jobs, guide them to internships/learning first.`;

    const analysisResp = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: "You are a strict JSON-only resume analyzer. Be honest and direct." },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (analysisResp.status === 429) {
      return json({ success: false, error: "Rate limit exceeded. Please wait and try again." }, 429);
    }
    if (analysisResp.status === 402) {
      return json({ success: false, error: "AI credits required. Please add credits." }, 402);
    }
    if (!analysisResp.ok) {
      console.error("AI gateway error (analysis):", analysisResp.status);
      return json({ success: false, error: "AI gateway error" }, 500);
    }

    const analysisJson = await analysisResp.json();
    const analysisText = analysisJson?.choices?.[0]?.message?.content ?? "";

    if (!analysisText.includes("{")) {
      return json({
        success: false,
        isResume: true,
        error: "AI did not return valid analysis. Please try again.",
      }, 200);
    }

    let analysis;
    try {
      let cleanText = analysisText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch?.[0] ?? cleanText);
    } catch (e) {
      console.error("Failed to parse analysis:", e);
      return json({
        success: false,
        isResume: true,
        error: "Failed to parse AI response. Please try again.",
      }, 200);
    }

    if (!analysis || !Array.isArray(analysis.opportunities)) {
      return json({
        success: false,
        isResume: true,
        error: "Invalid analysis response format.",
      }, 200);
    }

    // 3) Use Firecrawl to get REAL links for opportunities
    const opportunitiesWithLinks = await Promise.all(
      analysis.opportunities.map(async (opp: any, index: number) => {
        let applyLink = generateFallbackLink(opp);
        
        // Try Firecrawl for real links if API key available
        if (FIRECRAWL_API_KEY && opp.searchQuery) {
          try {
            const searchResp = await fetch(FIRECRAWL_API, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: `${opp.searchQuery} ${opp.platform || ""} apply`,
                limit: 1,
              }),
            });
            
            if (searchResp.ok) {
              const searchData = await searchResp.json();
              if (searchData.data?.[0]?.url) {
                applyLink = searchData.data[0].url;
              }
            }
          } catch (e) {
            console.log("Firecrawl search failed for:", opp.title, e);
          }
        }
        
        return {
          id: `ai-${Date.now()}-${index}`,
          type: opp.type,
          title: opp.title,
          companyOrOrganizer: opp.company || opp.platform,
          platform: opp.platform,
          location: opp.location || "Remote",
          matchScore: Math.min(98, Math.max(20, opp.matchScore || 50)),
          analysis: opp.analysis,
          applyLink: applyLink,
          estReplyTime: opp.estReplyTime || "1-2 weeks",
          isVerified: opp.isVerified ?? true,
          isFakeOfferLikely: false,
          difficulty: opp.difficulty || "moderate",
        };
      })
    );

    return json({
      success: true,
      isResume: true,
      skills: analysis.skills,
      experienceLevel: analysis.experienceLevel,
      domain: analysis.domain,
      honestAssessment: analysis.honestAssessment,
      opportunities: opportunitiesWithLinks,
    });
  } catch (error) {
    console.error("Error in analyze-resume function:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze resume",
    }, 500);
  }
});

function generateFallbackLink(opp: any): string {
  const type = opp.type?.toUpperCase();
  const query = encodeURIComponent(opp.searchQuery || opp.title || "");
  const platform = (opp.platform || "").toLowerCase();
  
  // Platform-specific URLs
  if (platform.includes("internshala")) {
    return `https://internshala.com/internships/keywords-${query.replace(/%20/g, "-")}`;
  }
  if (platform.includes("linkedin")) {
    return `https://www.linkedin.com/jobs/search/?keywords=${query}`;
  }
  if (platform.includes("naukri")) {
    return `https://www.naukri.com/${query.replace(/%20/g, "-")}-jobs`;
  }
  if (platform.includes("wellfound") || platform.includes("angellist")) {
    return `https://wellfound.com/jobs?query=${query}`;
  }
  if (platform.includes("unstop")) {
    return `https://unstop.com/competitions?q=${query}`;
  }
  if (platform.includes("devfolio")) {
    return `https://devfolio.co/hackathons`;
  }
  if (platform.includes("hackerearth")) {
    return `https://www.hackerearth.com/challenges/`;
  }
  if (platform.includes("meetup")) {
    return `https://www.meetup.com/find/?keywords=${query}`;
  }
  if (platform.includes("coursera")) {
    return `https://www.coursera.org/search?query=${query}`;
  }
  if (platform.includes("udemy")) {
    return `https://www.udemy.com/courses/search/?q=${query}`;
  }
  if (platform.includes("researchgate")) {
    return `https://www.researchgate.net/search/publication?q=${query}`;
  }
  if (platform.includes("scholar") || platform.includes("google")) {
    return `https://scholar.google.com/scholar?q=${query}`;
  }
  
  // Type-based fallbacks
  switch (type) {
    case "INTERNSHIP":
      return `https://internshala.com/internships/keywords-${query.replace(/%20/g, "-")}`;
    case "JOB":
      return `https://www.linkedin.com/jobs/search/?keywords=${query}`;
    case "HACKATHON":
      return `https://unstop.com/competitions?q=${query}`;
    case "EVENT":
      return `https://www.meetup.com/find/?keywords=${query}`;
    case "LEARNING":
      return `https://www.coursera.org/search?query=${query}`;
    default:
      return `https://www.google.com/search?q=${query}+apply`;
  }
}
