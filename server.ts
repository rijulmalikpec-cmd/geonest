import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Tavily Search API Proxy
  app.post("/api/search", async (req, res) => {
    const { queries } = req.body;
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey || apiKey === "MY_TAVILY_API_KEY") {
      return res.status(400).json({ error: "TAVILY_API_KEY is not configured in .env" });
    }

    try {
      const results = [];
      const searchPromises = queries.map(async (query: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout per query

        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            api_key: apiKey,
            query: query,
            search_depth: "basic", // Changed to basic to reduce API load/credits
            include_domains: [
              "reddit.com",
              "linkedin.com",
              "wikipedia.org",
              "tracxn.com",
              "crunchbase.com",
              "medium.com"
            ],
            max_results: 5, // Reduced from 10 to save processing and API limits
          }),
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errText = await response.text();
          console.error(`Tavily API error for query "${query}":`, response.status, errText);
          if (response.status === 429) {
            throw new Error("Tavily API rate limit exceeded.");
          }
          throw new Error(`API error: ${response.status}`);
        }
        
        return response.json();
      });

      const settledResults = await Promise.allSettled(searchPromises);
      
      let lastErrorMsg = "";
      for (const result of settledResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        } else if (result.status === 'rejected') {
          console.error("A search query failed:", result.reason);
          lastErrorMsg = result.reason?.message || "Unknown error";
          // If it's a rate limit error, we might want to throw it to the user
          if (lastErrorMsg.includes("rate limit")) {
            throw new Error("Tavily API rate limit exceeded. Please try again in a moment.");
          }
        }
      }

      if (results.length === 0) {
        throw new Error(`All search queries failed. Last error: ${lastErrorMsg}. Please check your TAVILY_API_KEY and credits.`);
      }

      res.json({ results });
    } catch (error: any) {
      console.error("Tavily search error:", error);
      res.status(500).json({ error: error.message || "Failed to perform search" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
