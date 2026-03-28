import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AuditInput {
  brandName: string;
  competitors: string[];
  strategicIntent: string;
}

export interface AuditResult {
  visibilityDeficitScore: number;
  narrativeShare: { name: string; value: number }[];
  highIntentGhosting: { query: string; reason: string }[];
  priorityScore: number;
  referenceParity: string;
  authorityErasure: number;
  statusText: string;
  // Admin data
  actionableBottlenecks: string[];
  competitorMO: string;
  theFix: string[];
  sourceAttribution: { url: string; snippet: string; competitor: string }[];
  platformGapAnalysis: string[];
}

export async function performAudit(input: AuditInput, searchData: any): Promise<AuditResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the following search data for a brand audit.
    BRAND: ${input.brandName}
    COMPETITORS: ${input.competitors.join(", ")}
    STRATEGIC INTENT: ${input.strategicIntent}

    SEARCH DATA:
    ${JSON.stringify(searchData)}

    You are a cold, clinical analyst. Perform a "Generative Engine Audit".
    
    REQUIRED OUTPUT JSON STRUCTURE:
    {
      "visibilityDeficitScore": number (0-100),
      "narrativeShare": [{"name": "string", "value": number}],
      "highIntentGhosting": [{"query": "string (30-75 words)", "reason": "string"}],
      "priorityScore": number (0-100),
      "referenceParity": "string (e.g. 12:1)",
      "authorityErasure": number (0-100),
      "statusText": "string (ego-triggering, cold)",
      "actionableBottlenecks": ["string"],
      "competitorMO": "string",
      "theFix": ["string (3 steps)"],
      "sourceAttribution": [{"url": "string", "snippet": "string", "competitor": "string"}],
      "platformGapAnalysis": ["string"]
    }

    CONSTRAINTS:
    - Visibility Deficit Score: How often the brand is ignored by LLMs for the intent.
    - High-Intent Ghosting: 2 niche queries where AI recommends competitors.
    - Priority Meter: 0-20 Extreme (Red), 20-40 High, 40-60 Attention, 60-80 Moderate, 80-100 Good.
    - Reference Parity: Ratio of competitor mentions vs brand mentions.
    - Authority Erasure: % of platforms (Reddit, LinkedIn, Wikipedia, Tracxn, Crunchbase, Medium) where brand has zero footprint.
    - Status Text: Cold, professional, ego-triggering.
    - Actionable Bottlenecks: Specific platforms where brand is missing.
    - Competitor MO: Exact technique used by competitors.
    - The Fix: 3-step actionable list.
    - Source Attribution: URLs found for competitors with "Win" snippets.
    - Platform Gap Analysis: List of missing sources.
  `;

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              visibilityDeficitScore: { type: Type.NUMBER },
              narrativeShare: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER }
                  }
                }
              },
              highIntentGhosting: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    query: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  }
                }
              },
              priorityScore: { type: Type.NUMBER },
              referenceParity: { type: Type.STRING },
              authorityErasure: { type: Type.NUMBER },
              statusText: { type: Type.STRING },
              actionableBottlenecks: { type: Type.ARRAY, items: { type: Type.STRING } },
              competitorMO: { type: Type.STRING },
              theFix: { type: Type.ARRAY, items: { type: Type.STRING } },
              sourceAttribution: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    url: { type: Type.STRING },
                    snippet: { type: Type.STRING },
                    competitor: { type: Type.STRING }
                  }
                }
              },
              platformGapAnalysis: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: [
              "visibilityDeficitScore", "narrativeShare", "highIntentGhosting", 
              "priorityScore", "referenceParity", "authorityErasure", "statusText",
              "actionableBottlenecks", "competitorMO", "theFix", "sourceAttribution", "platformGapAnalysis"
            ]
          }
        }
      });

      const text = response.text || "{}";
      try {
        const parsed = JSON.parse(text);
        
        // Ensure required fields exist to prevent UI crashes
        if (!parsed.narrativeShare || !Array.isArray(parsed.narrativeShare)) {
          parsed.narrativeShare = [];
        }
        if (!parsed.highIntentGhosting || !Array.isArray(parsed.highIntentGhosting)) {
          parsed.highIntentGhosting = [];
        }
        if (!parsed.actionableBottlenecks || !Array.isArray(parsed.actionableBottlenecks)) {
          parsed.actionableBottlenecks = [];
        }
        if (!parsed.theFix || !Array.isArray(parsed.theFix)) {
          parsed.theFix = [];
        }
        if (!parsed.sourceAttribution || !Array.isArray(parsed.sourceAttribution)) {
          parsed.sourceAttribution = [];
        }
        if (!parsed.platformGapAnalysis || !Array.isArray(parsed.platformGapAnalysis)) {
          parsed.platformGapAnalysis = [];
        }
        
        return parsed;
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON:", text);
        throw new Error("Invalid JSON response from Gemini");
      }
    } catch (error: any) {
      console.error(`Gemini API attempt ${attempt} failed:`, error);
      lastError = error;
      
      // If it's a rate limit error (429), wait and retry
      if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("exhausted")) {
        const delay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`Rate limit hit. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (error?.message?.includes("Invalid JSON")) {
        console.log(`Invalid JSON received. Retrying...`);
        // Retry immediately for invalid JSON
      } else {
        // For other errors, throw immediately
        throw error;
      }
    }
  }

  throw new Error(`Failed to generate audit after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}
