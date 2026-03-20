import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language mapping for Piston API
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'cpp', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();

    // Input validation
    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (code.length > 50000) {
      return new Response(
        JSON.stringify({ error: 'Code too long (max 50KB)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!language || typeof language !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Language is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const langConfig = LANGUAGE_MAP[language.toLowerCase()];
    if (!langConfig) {
      return new Response(
        JSON.stringify({ error: 'Unsupported language' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Executing ${language} code`);

    // Use Piston API to execute code
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: language === 'java' ? 'Main.java' : `main.${language}`,
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Piston API error:', response.status, errorText);
      throw new Error('Code execution failed');
    }

    const result = await response.json();
    console.log('Execution result:', JSON.stringify(result).substring(0, 200));

    // Format the response
    const output = result.run?.stdout || '';
    const error = result.run?.stderr || '';
    const exitCode = result.run?.code || 0;

    return new Response(
      JSON.stringify({
        success: exitCode === 0 && !error,
        output: output || (error ? '' : 'No output'),
        error: error,
        exitCode: exitCode,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in code-run function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to execute code';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
