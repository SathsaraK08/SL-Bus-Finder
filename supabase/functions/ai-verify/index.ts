import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { type, data: suggestion, context } = await req.json()
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set')
        }

        // specific prompt for bus data verification
        const prompt = `
      You are an expert Data Verifier for the 'SL Bus Finder' app in Sri Lanka.
      Your job is to verify user-submitted bus route changes.
      
      User Suggestion Type: ${type}
      Suggestion Data: ${JSON.stringify(suggestion)}
      Context (Current DB Data): ${JSON.stringify(context || {})}

      Task:
      1. Verify if this bus route/stop information is accurate for Sri Lanka.
      2. Check against your knowledge base (Colombo bus routes).
      3. Return a JSON object (NO MARKDOWN) with:
         - "verified": boolean (true if likely correct)
         - "confidence": number (0-100)
         - "reason": string (short explanation)
         - "correction": object (optional, if you know the correct data)

      Example Output:
      { "verified": true, "confidence": 95, "reason": "Route 177 indeed starts at Kaduwela." }
    `

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        )

        const result = await response.json()
        const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

        // Clean markdown
        const jsonStr = aiText.replace(/```json\n?|\n?```/g, '').trim()
        const aiData = JSON.parse(jsonStr)

        // 4. Save result to Database
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        if (context.contribution_id) {
            const updatePayload: { admin_comment: string; status?: string } = {
                admin_comment: JSON.stringify(aiData), // Store full analysis
            }

            // Auto-approve if high confidence
            if (aiData.verified && aiData.confidence > 85) {
                updatePayload.status = 'approved';
            }

            await supabaseAdmin
                .from('contributions')
                .update(updatePayload)
                .eq('id', context.contribution_id)
        }

        return new Response(
            JSON.stringify(aiData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
