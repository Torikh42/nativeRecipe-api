// Using native fetch available in Node 18+
// Actually, let's use globalThis.fetch if available or import if needed. 
// Safest is to just use 'fetch' as it is global in Node 18+.

interface AiRecipeResponse {
  title: string;
  description: string;
  ingredients: { name: string; quantity: string }[];
  instructions: string;
}

export const generateRecipe = async (ingredients: string[]): Promise<AiRecipeResponse> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API Key not configured");
  }

  const prompt = `
    You are a professional chef. Create a delicious recipe using the following ingredients: ${ingredients.join(", ")}.
    You can add basic pantry items (salt, pepper, oil, water, etc.) if needed.
    
    IMPORTANT: Return ONLY a valid JSON object. Do not add markdown formatting like \`\`\`json.
    
    The JSON structure must be:
    {
      "title": "Creative Recipe Name",
      "description": "A short, appetizing description (max 2 sentences).",
      "ingredients": [
        { "name": "Ingredient Name", "quantity": "Quantity (e.g., 200g, 1 tbsp)" }
      ],
      "instructions": "Step-by-step cooking instructions. Use newlines (\\n) to separate steps."
    }
    
    Use Indonesian language (Bahasa Indonesia).
  `;

  try {
    // List of models to try in order (free/cheap reliable ones)
    const models = [
      "deepseek/deepseek-r1-0528:free", 
    ];

    let lastError: any;

    for (const model of models) {
      try {
        console.log(`Attempting recipe generation with model: ${model}`);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://nativerecipe.com",
            "X-Title": "NativeRecipe App",
          },
          body: JSON.stringify({
            "model": model,
            "messages": [
              { "role": "system", "content": "You are a helpful culinary AI assistant that outputs raw JSON." },
              { "role": "user", "content": prompt }
            ],
            "temperature": 0.7,
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Model ${model} failed:`, errText);
          // If rate limited or server error, continue to next model
          if (response.status === 429 || response.status >= 500) {
            continue;
          }
          throw new Error(`OpenRouter Error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Clean up markdown
        const jsonString = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        
        return JSON.parse(jsonString) as AiRecipeResponse;

      } catch (error) {
        console.warn(`Error with model ${model}:`, error);
        lastError = error;
        // Continue to next model on error
      }
    }
    
    // If all models fail
    throw lastError || new Error("All AI models failed to generate a recipe.");

  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe from AI.");
  }
};
