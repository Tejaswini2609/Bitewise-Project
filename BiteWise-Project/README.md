# BiteWise AI Food Comparator

BiteWise is an AI-style food price comparison web app for comparing Swiggy, Zomato and Magicpin offers in one place. It is built as a responsive Progressive Web App, so it can be opened in a browser, deployed online, and installed like an app.

## Features

- Compare food prices across Swiggy, Zomato and Magicpin
- Search foods such as Pizza, Biryani, Coffee, Gobi Manchurian, Fries, Momos and more
- AI-style deal score using price, offer, delivery time and rating
- Recommendation explanation for interviews and demos
- Budget-based food suggestions
- Similar-food suggestions
- Food-specific platform links
- BiteWise AI Assistant chat panel
- AI answers for budget, fastest delivery, cheapest platform and best-value comparisons
- Responsive UI with dark mode
- Installable PWA with offline caching

## Tech Stack

- HTML
- CSS
- JavaScript
- Vite for local development and production build
- Node.js backend API
- SQLite database using Node's built-in `node:sqlite`
- PWA manifest and service worker

## Required Packages

No new runtime packages are required. The project uses:

- `vite` for frontend development/builds
- Node.js built-in `node:http`
- Node.js built-in `node:sqlite`
- Node.js built-in `fetch`

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Then add your LLM provider values:

```text
PORT=3001
LLM_PROVIDER=openai
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4o-mini
```

The API is OpenAI-compatible, so you can change `LLM_API_URL`, `LLM_API_KEY`, and `LLM_MODEL` for another provider that supports the same chat-completions response shape.

## Run In VS Code

1. Open this folder in VS Code:

   ```text
   C:\Users\Tejaswini D\OneDrive\Documents\Bitwise
   ```

2. Open the VS Code terminal.

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the backend API in one terminal:

   ```bash
   npm run backend
   ```

5. Start the frontend in another terminal:

   ```bash
   npm run dev
   ```

6. Open the URL shown in the frontend terminal, usually:

   ```text
   http://127.0.0.1:5173
   ```

During Vite development, the frontend calls the backend API at:

```text
http://127.0.0.1:3001
```

You can also run only the backend and open:

```text
http://127.0.0.1:3001
```

The SQLite database is created automatically at:

```text
data/bitewise.sqlite
```

## Backend APIs

- `GET /api/health`
- `GET /api/foods`
- `GET /api/search?food=<food>&budget=<budget>`
- `POST /api/chat`

Example chat request:

```bash
curl -X POST http://127.0.0.1:3001/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"Find the cheapest pizza under Rs. 300\"}"
```

## Run Without Installing Anything

You can also run the static version with Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Build For Deployment

```bash
npm run build
```

The production files will be created in:

```text
dist
```

## Deploy Options

### Netlify

1. Push this project to GitHub.
2. Import the repo in Netlify.
3. Netlify will use:
   - Build command: `npm run build`
   - Publish folder: `dist`

### Vercel

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Vercel will detect the Vite configuration.

### GitHub Pages

Run:

```bash
npm run build
```

Then deploy the `dist` folder using GitHub Pages or a Pages action.

## Install As An App

After deploying or running locally in a browser:

1. Open the site in Chrome or Edge.
2. Click the install icon in the address bar.
3. Install BiteWise.
4. It will open like a desktop/mobile app.

## How The AI Recommendation Works

The backend reads food/platform deals from SQLite and applies a weighted scoring formula:

- Price score: 42%
- Delivery speed score: 22%
- Rating score: 22%
- Offer score: 14%

This gives each platform a deal score out of 100 and recommends the best combined option.

## How The AI Assistant Works

The chat panel sends the user's prompt to `POST /api/chat`. The backend extracts a food name and budget when possible, calls the existing `searchDeals` logic, and passes those grounded results to the configured LLM. The assistant explains the recommendation using price, discount, delivery time, rating and AI score. If no LLM key is configured, the backend returns a local data-grounded fallback answer so demos still work.

If the requested food is not in SQLite, the backend marks it as generated and recommends similar foods from the existing database.

## Interview Explanation

You can describe this project as:

> BiteWise is a food delivery price comparison PWA that applies AI-style ranking to recommend the best platform for a selected food item. It compares price, discount, delivery time and rating, then explains the recommendation and suggests similar foods within the user's budget.

For a fuller interview script, see [INTERVIEW_GUIDE.md](INTERVIEW_GUIDE.md).
