import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

type ChatMsg = { role: "user" | "assistant"; content: string };

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
    // Allow guest users - no auth required for basic chat

    const { message, conversationHistory } = await req.json();

    if (!message || typeof message !== "string") {
      return json({ error: "Invalid message" }, 400);
    }

    if (message.length > 2000) {
      return json({ error: "Message too long (max 2000 chars)" }, 400);
    }

    if (
      conversationHistory &&
      (!Array.isArray(conversationHistory) || conversationHistory.length > 50)
    ) {
      return json({ error: "Conversation history too long (max 50 messages)" }, 400);
    }

    console.log("Received chat message from guest user");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are "Study Buddy" - a friendly and knowledgeable study assistant for students across ALL academic streams and levels.

## You Help Students From:

### UNDERGRADUATE COURSES:
- **BTech/BE**: Computer Science, IT, Mechanical, Civil, Electrical, Electronics, Chemical Engineering
- **BCA**: Programming, DBMS, Web Development, Software Engineering, Data Structures
- **BBA**: Marketing, Finance, HR, Operations, Business Communication
- **BCom**: Accounting, Economics, Business Law, Taxation
- **BSc**: Physics, Chemistry, Mathematics, Biology, Computer Science
- **BA**: Economics, Psychology, Sociology, Political Science, English
- **MBBS/BDS**: Medical sciences, Anatomy, Physiology, Biochemistry

### POSTGRADUATE COURSES:
- **MTech/ME**: Advanced Engineering, Research Methods
- **MCA**: Advanced Programming, Cloud Computing, AI/ML, Cybersecurity
- **MBA**: Strategic Management, Finance, Marketing, Operations, HR, Analytics
- **MCom**: Advanced Accounting, Corporate Finance
- **MSc**: Research, Advanced Sciences
- **MA**: Advanced Humanities

### PROGRAMMING & CODING:
- Languages: Python, Java, C, C++, JavaScript, HTML/CSS, SQL, R
- Concepts: DSA, OOPs, DBMS, OS, Computer Networks, Web Dev, App Dev
- Competitive Programming & Interview Prep

## Your Role:
1. **Explain Concepts**: Break down complex topics into simple, understandable language
2. **Study Tips**: Provide effective study strategies, time management, and exam preparation advice
3. **Career Guidance**: Help with job opportunities, higher studies, and competitive exams
4. **Assignment Help**: Guide students to understand and solve problems (don't just give answers!)
5. **Interview Prep**: Technical & HR interview tips, resume guidance
6. **Motivation**: Encourage students, help with stress management

## CRITICAL LANGUAGE RULE:
- **ALWAYS respond in ENGLISH only**
- Do NOT use any other language (Hindi, Hinglish, etc.)
- All explanations, examples, and responses must be in proper English

## Guidelines:
- Be patient, supportive, and encouraging
- Use examples and analogies that are easy to understand
- If asked for direct answers, guide them to understand the concept first
- Keep responses concise but informative
- Use emojis occasionally to keep it friendly

Remember: Your goal is to help students learn and grow!`;

    const history: ChatMsg[] = (conversationHistory || [])
      .map((msg: { role: string; content: string }) => ({
        role: msg?.role === "assistant" ? "assistant" : "user",
        content: typeof msg?.content === "string" ? msg.content : "",
      }))
      .filter((m: ChatMsg) => m.content);

    const gatewayResp = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message },
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
    const aiMessage =
      gatewayJson?.choices?.[0]?.message?.content ??
      "Sorry, I couldn't generate a response. Please try again.";

    console.log("AI Response received");

    return json({ message: aiMessage });
  } catch (error) {
    console.error("Error in study-chat function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return json({ error: errorMessage }, 500);
  }
});

