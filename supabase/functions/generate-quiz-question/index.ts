import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { difficulty = 'beginner', count = 30 } = await req.json();

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const topics = [
      "Basic data structures (arrays, lists, variables)",
      "Ultra Basic JavaScript (variables, loops, functions)", 
      "Basic logic (if statements, comparisons)"
    ];

    const prompt = `Genera ${count} preguntas de opción múltiple sobre programación para nivel ${difficulty}.

Temas a cubrir (distribuye las preguntas entre estos temas):
${topics.map((topic, i) => `${i + 1}. ${topic}`).join('\n')}

Requisitos:
- Genera exactamente ${count} preguntas
- Enfócate en conceptos fundamentales para principiantes
- Crea exactamente 4 opciones de respuesta (A, B, C, D) para cada pregunta
- Asegúrate de que una respuesta sea claramente correcta en cada pregunta
- Usa un lenguaje simple y educativo
- Las preguntas deben evaluar comprensión, no memorización
- Distribuye las preguntas de manera uniforme entre los temas

Devuelve SOLO un JSON válido con este formato exacto:
{
  "questions": [
    {
      "topic": "Nombre del tema aquí",
      "question": "Tu pregunta aquí",
      "options": {
        "A": "Primera opción",
        "B": "Segunda opción", 
        "C": "Tercera opción",
        "D": "Cuarta opción"
      },
      "answer": "B"
    }
  ]
}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    // Clean the response to extract JSON
    let cleanedText = generatedText.trim();
    
    // Remove markdown code blocks if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON
    let questionData;
    try {
      questionData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Generated text:', generatedText);
      throw new Error('Invalid JSON format from AI response');
    }

    // Validate the structure
    if (!questionData.questions || !Array.isArray(questionData.questions)) {
      throw new Error('Invalid questions format from AI - expected array of questions');
    }

    // Validate each question
    for (let i = 0; i < questionData.questions.length; i++) {
      const question = questionData.questions[i];
      if (!question.topic || !question.question || !question.options || !question.answer) {
        throw new Error(`Invalid question format at index ${i} from AI`);
      }

      if (!question.options.A || !question.options.B || !question.options.C || !question.options.D) {
        throw new Error(`Missing answer options at index ${i} from AI`);
      }
    }

    return new Response(JSON.stringify(questionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-quiz-question function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred generating the question';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});