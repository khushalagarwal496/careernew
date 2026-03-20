import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

const allowedLanguages = [
  "python",
  "javascript",
  "java",
  "cpp",
  "c",
  "typescript",
  "go",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "rust",
];

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
    // Allow guest users - no auth required

    const { code, language } = await req.json();

    if (!code || typeof code !== "string") {
      return json({ error: "Invalid code" }, 400);
    }

    if (code.length > 50000) {
      return json({ error: "Code too long (max 50KB)" }, 400);
    }

    if (
      !language ||
      typeof language !== "string" ||
      !allowedLanguages.includes(language.toLowerCase())
    ) {
      return json({ error: "Unsupported language" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are an expert programming tutor and code analyzer. Your task is to:
1. Analyze the provided code for syntax errors, logical errors, and common mistakes
2. If errors are found, provide a detailed analysis including:
   - The type of error (Syntax Error, Logic Error, Runtime Error, etc.)
   - The line number where the error occurs
   - A clear error message
   - The corrected code
   - A detailed explanation of what was wrong and how it was fixed
   - A concept explanation to help the student understand the underlying concept
   - 3 practice questions related to this concept to help them master it

Respond ONLY in valid JSON format with this exact structure:
{
  "hasError": true/false,
  "analysis": {
    "errorType": "string (e.g., 'Syntax Error', 'Logic Error')",
    "errorLine": number,
    "errorMessage": "string describing the error",
    "correctedCode": "string with the full corrected code",
    "explanation": "string explaining what was wrong and how to fix it",
    "conceptExplanation": "string explaining the underlying programming concept",
    "practiceQuestions": [
      {
        "question": "string with practice question",
        "difficulty": "Easy" | "Medium" | "Hard",
        "concept": "string naming the concept being tested"
      }
    ]
  }
}

If no errors are found, respond with:
{
  "hasError": false,
  "analysis": null
}

Analyze this ${language} code for errors and provide detailed feedback:

\`\`\`${language}
${code}
\`\`\``;

    console.log("Sending code for analysis (guest user)");

    const gatewayResp = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a strict JSON-only code analyzer. Return only valid JSON with no markdown.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (gatewayResp.status === 429) {
      return json(
        { error: "Rate limit exceeded. Please wait a bit and try again." },
        429,
      );
    }

    if (gatewayResp.status === 402) {
      return json(
        {
          error:
            "AI credits required. Please add credits to your workspace to continue.",
        },
        402,
      );
    }

    if (!gatewayResp.ok) {
      const t = await gatewayResp.text();
      console.error("AI gateway error:", gatewayResp.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const gatewayJson = await gatewayResp.json();
    const content = gatewayJson?.choices?.[0]?.message?.content ?? "";

    console.log("AI Response received:", content.substring(0, 200));

    let analysisResult;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();

      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      analysisResult = {
        hasError: true,
        analysis: {
          errorType: "Analysis Error",
          errorLine: 1,
          errorMessage: "Code analysis completed but could not parse results",
          correctedCode: code,
          explanation: "Please check your code for common errors and try again.",
          conceptExplanation: "Review the basic syntax rules for " + language,
          practiceQuestions: [
            {
              question: "Write a simple \"Hello World\" program in " + language,
              difficulty: "Easy",
              concept: "Basic Syntax",
            },
          ],
        },
      };
    }

    return json(analysisResult);
  } catch (error: unknown) {
    console.error("Error in code-analyze function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze code";
    return json({ error: errorMessage }, 500);
  }
});

