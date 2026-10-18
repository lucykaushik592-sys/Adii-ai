# adii ai — Dark Neon AI Chatbot

A responsive dark-neon chat UI with a Node.js/Express backend. The browser calls your own `/api/chat` endpoint; the API key is read only by the server from `.env`.

## Requirements
- Node.js 20+
- An API key and API access from your chosen compatible AI provider. API usage may incur charges.

## Run locally
1. Extract this ZIP.
2. Open a terminal in the extracted `adii-ai` folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Edit `.env` and replace `your_api_key_here` with your real API key. Never share or upload `.env`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

## Files
- `public/index.html` — responsive chat interface
- `server.js` — backend, API proxy, request validation, basic rate limiting, security headers
- `.env.example` — environment variable template
- `package.json` — dependencies and scripts

## Deploy
Deploy the Node app to a Node-compatible hosting service. Configure `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in the host's secret/environment settings. Use HTTPS in production and consider stronger per-user rate limits, authentication, monitoring, and abuse protection before public launch.

## Important
The website is real-AI ready, but it will not produce provider-backed AI responses until you configure a valid API key and have provider API access. This project does not include a key. Keep secrets server-side.
