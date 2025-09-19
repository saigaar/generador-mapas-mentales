import { GoogleGenAI } from "@google/genai";
import type { Handler } from '@netlify/functions';

// Solución definitiva: Buscamos una variable de entorno específica y única.
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Buscamos la nueva variable de entorno, más específica para evitar conflictos.
  const apiKey = process.env.GEMINI_API_KEY_NETLIFY;

  // Si la nueva clave no existe, devolvemos un error claro y directo.
  if (!apiKey) {
    const errorMessage = "Configuration Error: The GEMINI_API_KEY_NETLIFY environment variable is not set. Please go to your Netlify site settings, navigate to 'Build & deploy' > 'Environment' > 'Environment variables', and add a new variable with the key 'GEMINI_API_KEY_NETLIFY' and your Gemini API key as the value.";
    console.error(errorMessage);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  try {
    if (!event.body) {
         return { statusCode: 400, body: JSON.stringify({ error: "Request body is missing." }) };
    }
    const { sourceContent, sourceType } = JSON.parse(event.body);

    if (!sourceContent || !sourceType) {
        return { statusCode: 400, body: JSON.stringify({ error: "Request body must contain 'sourceContent' and 'sourceType'." }) };
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash";

    const context = sourceType === 'URL'
        ? `The following is a URL. Please fetch its content and then create a mind map.`
        : `The following is the content of a text file. Please create a mind map from it.`;

    const prompt = `
You are an expert at summarizing and structuring complex information into clear, hierarchical mind maps.
Your task is to convert the provided source content into Markmap-compatible Markdown.

**Instructions:**
1.  **Analyze Source:** Deeply analyze the provided content to identify the central theme, main topics, and supporting details.
2.  **Create Hierarchy:** Organize these points into a logical tree structure. The main title of the content should be the mind map's root.
3.  **Format as Markmap Markdown:**
    -   Start with a YAML frontmatter block. Include a 'title' and a 'markmap' configuration object. Example:
        ---
        title: Mind Map of Topic
        markmap:
          colorFreezeLevel: 2
          initialExpandLevel: 2
        ---
    -   Use a single Level 1 heading (#) for the mind map root.
    -   Use Level 2 headings (##) for main branches.
    -   Use nested bulleted lists (-) for sub-topics and details.
    -   Keep the text of each node concise and to the point.
4.  **Output:** Your response MUST consist ONLY of the raw Markmap Markdown. Do NOT include explanations, comments, or wrap it in Markdown code fences (like \`\`\`markdown).

**Source Context:**
${context}

**Source Content:**
${sourceContent}
`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    const markdown = response.text;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown }),
    };

  } catch (error) {
    console.error("Error in Netlify function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to generate mind map: ${errorMessage}` }),
    };
  }
};
