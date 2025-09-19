import { GoogleGenAI } from "@google/genai";

export const generateMarkmapMarkdown = async (sourceContent: string, sourceType: 'file content' | 'URL' | 'direct text'): Promise<string> => {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        throw new Error("API_KEY is not configured in the application's environment.");
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = "gemini-2.5-flash";

    let context = '';
    switch (sourceType) {
        case 'URL':
            context = `The following is a URL. Please fetch its content and then create a mind map.`;
            break;
        case 'file content':
            context = `The following is text content from a file. Please create a mind map from it.`;
            break;
        case 'direct text':
            context = `The following is text provided directly by the user. Please create a mind map from it.`;
            break;
    }

    const prompt = `
You are an expert in summarizing and structuring complex information into clear, hierarchical mind maps.
Your task is to convert the provided source content into a Markdown format compatible with Markmap.

**Instructions:**
1.  **Analyze the Source:** Deeply analyze the provided content to identify the central theme, main topics, and supporting details.
2.  **Create a Hierarchy:** Organize these points into a logical tree structure. The main title of the content should be the root of the mind map.
3.  **Format as Markmap Markdown:**
    -   Start with a YAML frontmatter block. Include a 'title' and a 'markmap' configuration object. Example:
        ---
        title: Mind Map of The Topic
        markmap:
          colorFreezeLevel: 2
          initialExpandLevel: 2
        ---
    -   Use a single Level 1 heading (#) for the root of the mind map.
    -   Use Level 2 headings (##) for major branches.
    -   Use nested bullet points (-) for sub-topics and details.
    -   Keep the text for each node concise and to the point.
4.  **Output:** Your response MUST consist ONLY of the raw Markmap Markdown. Do NOT include any explanations, comments, or wrap it in Markdown code fences (like \`\`\`markdown).

**Source Context:**
${context}

**Source Content:**
${sourceContent}
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating Markmap Markdown:", error);
        throw new Error("Failed to generate mind map from the source content.");
    }
};
