import { Request, Response } from "express";
import { streamRecipe, streamIdentifyFoodFromImage } from "../services/ai.service";

export const createRecipeFromIngredients = async (req: Request, res: Response) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Please provide a list of ingredients." });
    }

    const result = await streamRecipe(ingredients);
    
    const streamResponse = result.toTextStreamResponse();
    
    streamResponse.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    if (streamResponse.body) {
      const reader = streamResponse.body.getReader();
      const writer = res;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        writer.write(value);
      }
      writer.end();
    } else {
      res.status(500).json({ error: "No response body from AI stream" });
    }

  } catch (error) {
    console.error("AI Controller Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.end();
    }
  }
};

export const identifyFood = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Please provide an image (base64)." });
    }

    const result = await streamIdentifyFoodFromImage(image);

    const streamResponse = result.toTextStreamResponse();
    
    // Set headers from the stream response
    streamResponse.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    if (streamResponse.body) {
      const reader = streamResponse.body.getReader();
      const writer = res;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        writer.write(value);
      }
      writer.end();
    } else {
      res.status(500).json({ error: "No response body from AI stream" });
    }

  } catch (error) {
    console.error("AI Controller Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.end();
    }
  }
};


