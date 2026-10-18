import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "40kb" }));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, configured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(503).json({ error: "AI is not configured yet. Add OPENAI_API_KEY to your .env file." });

    const incoming = req.body?.messages;
    if (!Array.isArray(incoming) || incoming.length === 0 || incoming.length > 30) {
      return res.status(400).json({ error: "Send between 1 and 30 messages." });
    }
    const messages = incoming.map(m => {
      if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string") {
        throw new Error("Invalid message format.");
      }
      return { role: m.role, content: m.content.slice(0, 8000) };
    });
    if (messages[messages.length - 1].role !== "user") {
      return res.status(400).json({ error: "The last message must be from the user." });
    }

    const response = await fetch(process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are adii ai, a helpful, friendly, clear AI assistant. Reply in the user's language and style. Be honest when uncertain." },
          ...messages
        ],
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(60000)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("AI provider returned status", response.status);
      return res.status(502).json({ error: data?.error?.message || "AI provider request failed. Check API access, model, and billing." });
    }
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string") return res.status(502).json({ error: "AI provider returned an unexpected response." });
    res.json({ reply });
  } catch (err) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") return res.status(504).json({ error: "AI request timed out. Please try again." });
    if (err?.message === "Invalid message format.") return res.status(400).json({ error: err.message });
    console.error("Chat error:", err?.message || err);
    res.status(500).json({ error: "Unexpected server error. Please try again." });
  }
});

app.listen(port, () => console.log(`adii ai running at http://localhost:${port}`));
