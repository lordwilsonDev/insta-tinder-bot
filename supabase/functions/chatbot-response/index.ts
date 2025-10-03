import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, personality, customInstructions } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build system prompt based on personality
    let systemPrompt = 'You are a helpful social media assistant that responds to messages and comments. ';
    
    switch (personality) {
      case 'friendly':
        systemPrompt += 'Be warm, friendly, and approachable. Use casual language and show genuine interest.';
        break;
      case 'professional':
        systemPrompt += 'Be professional, courteous, and clear. Maintain a business-like tone.';
        break;
      case 'casual':
        systemPrompt += 'Be relaxed and conversational. Feel free to use casual language and be personable.';
        break;
      case 'enthusiastic':
        systemPrompt += 'Be excited and energetic! Show enthusiasm and positivity in every response.';
        break;
      default:
        systemPrompt += 'Be helpful and responsive.';
    }

    if (customInstructions) {
      systemPrompt += ` Additional instructions: ${customInstructions}`;
    }

    systemPrompt += ' Keep responses concise (under 100 words) and engaging.';

    console.log('Generating response with personality:', personality);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('Generated response successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chatbot-response:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
