import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
// Se mantiene el modelo más moderno y con mayor capacidad.
const MODEL_NAME = "gemini-2.5-pro";
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Se toma el 'count' y 'difficulty' de la solicitud, como en tu nueva lógica.
    const { difficulty = 'beginner', count = 20 } = await req.json();
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    // --- LÓGICA MEJORADA: Se integra tu nuevo prompt con temas específicos ---
    const topics = [
      "Estructuras de datos básicas (arrays, listas, variables)",
      "JavaScript básico (variables, bucles, funciones)",
      "Lógica básica (condicionales if, comparaciones)"
    ];
    const promptText = `Genera ${count} preguntas de opción múltiple sobre programación para nivel ${difficulty}.

Temas a cubrir (distribuye las preguntas entre estos temas):
${topics.map((topic, i)=>`${i + 1}. ${topic}`).join('\n')}

Requisitos:
- Genera exactamente ${count} preguntas.
- Enfócate en conceptos fundamentales para principiantes.
- Crea exactamente 4 opciones de respuesta (A, B, C, D) para cada pregunta.
- Asegúrate de que una respuesta sea claramente correcta en cada pregunta.
- La respuesta completa debe ser un único objeto JSON válido que contenga un array "questions". Sin texto adicional ni markdown.
`;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptText
              }
            ]
          }
        ],
        // --- CORRECCIÓN CLAVE: Se restaura la configuration de generación de JSON ---
        // Esto es esencial para evitar errores de formato y respuestas cortadas.
        generationConfig: {
          "temperature": 0.7,
          "maxOutputTokens": 8192,
          "responseMimeType": "application/json",
          "responseSchema": {
            "type": "OBJECT",
            "properties": {
              "questions": {
                "type": "ARRAY",
                "items": {
                  "type": "OBJECT",
                  "properties": {
                    "topic": {
                      "type": "STRING"
                    },
                    "question": {
                      "type": "STRING"
                    },
                    "options": {
                      "type": "OBJECT",
                      "properties": {
                        "A": {
                          "type": "STRING"
                        },
                        "B": {
                          "type": "STRING"
                        },
                        "C": {
                          "type": "STRING"
                        },
                        "D": {
                          "type": "STRING"
                        }
                      },
                      "required": [
                        "A",
                        "B",
                        "C",
                        "D"
                      ]
                    },
                    "answer": {
                      "type": "STRING"
                    }
                  },
                  "required": [
                    "topic",
                    "question",
                    "options",
                    "answer"
                  ]
                }
              }
            },
            "required": [
              "questions"
            ]
          }
        }
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }
    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }
    let parsedData;
    try {
      parsedData = JSON.parse(generatedText);
    } catch (parseError) {
      console.error("Failed to parse JSON. Raw text from API:", generatedText);
      throw new Error(`Invalid JSON response from API: ${parseError.message}`);
    }
    const questionsArray = Array.isArray(parsedData) ? parsedData : parsedData.questions;
    if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
      throw new Error('Invalid response format from AI, expected an array of questions.');
    }
    // --- MEJORA: Se utiliza tu nuevo bucle de validación detallado ---
    for(let i = 0; i < questionsArray.length; i++){
      const question = questionsArray[i];
      if (!question.topic || !question.question || !question.options || !question.answer) {
        throw new Error(`Invalid question format at index ${i} from AI`);
      }
      if (!question.options.A || !question.options.B || !question.options.C || !question.options.D) {
        throw new Error(`Missing answer options at index ${i} from AI`);
      }
    }
    // Se devuelve directamente el objeto que contiene el array de preguntas.
    return new Response(JSON.stringify(parsedData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in generate-quiz-question function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred generating the question';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    return new Response(JSON.stringify({
      error: errorMessage,
      details: errorDetails
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
