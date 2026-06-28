# BiteWise Interview Guide

## 30-Second Introduction

BiteWise is a food delivery price comparison web app. It compares Swiggy, Zomato and Magicpin for a selected food item, then recommends the best platform using an AI-style score based on price, discount, delivery time and rating.

## Problem It Solves

Users usually open multiple food delivery apps to compare prices, offers and delivery time. BiteWise brings that comparison into one screen and gives a clear recommendation with an explanation.

## Tech Stack

- Frontend: HTML, CSS, JavaScript and Vite
- Backend: Node.js REST API
- Database: SQLite
- AI Assistant: LLM-ready chat endpoint using environment variables
- PWA: Manifest and service worker support

## Main Features

- Food search with predefined and fallback food support
- Platform comparison cards for Swiggy, Zomato and Magicpin
- Best deal recommendation
- AI-style deal score
- Budget-based suggestions
- Similar food suggestions
- AI chat assistant for natural-language questions
- Dark mode and responsive layout

## Backend APIs

- `GET /api/health`
- `GET /api/foods`
- `GET /api/search?food=<food>&budget=<budget>`
- `POST /api/chat`

## Database Design

SQLite stores the app data in structured tables:

- `platforms`: platform name, logo, color and redirect URL pattern
- `foods`: food title, short code and category group
- `food_aliases`: alternate names like `gobi` for `Gobi Manchurian`
- `deals`: price, original price, delivery minutes, offer and rating
- `search_history`: searched query, matched food, best platform and budget

## Recommendation Logic

Each platform gets an AI-style score out of 100:

- Price score: 42%
- Delivery speed score: 22%
- Rating score: 22%
- Offer score: 14%

The backend calculates the score for every platform and selects the highest-scoring result. If two platforms are close, lower price is used as the tie-breaker.

## AI Assistant Flow

1. User asks a question in the assistant panel.
2. Frontend sends the prompt to `POST /api/chat`.
3. Backend extracts food name and budget from the prompt.
4. Backend calls the existing search logic, so answers use the same SQLite data as the cards.
5. If an LLM key is configured, the result is passed to the LLM for a natural answer.
6. If no key is configured, the backend returns a local fallback answer for demos.

## Example Questions

- Find the cheapest pizza under Rs. 300.
- Which app has the fastest burger delivery?
- Suggest something vegetarian.
- Recommend food under Rs. 200.
- Which platform gives the best value?
- Compare Swiggy, Zomato and Magicpin for pasta.

## How To Explain The AI Part

The project uses an AI-style ranking formula for the main recommendation and an LLM-ready chat endpoint for natural-language answers. The assistant does not invent prices. It first retrieves real deal data from SQLite through the existing search logic, then explains the result using price, discount, delivery time, rating and AI score.

## How To Run

```bash
npm install
copy .env.example .env
npm run backend
npm run dev
```

Frontend:

```text
http://127.0.0.1:5173
```

Backend:

```text
http://127.0.0.1:3001
```

## Environment Variables

```text
PORT=3001
LLM_PROVIDER=openai
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4o-mini
```

## Interview Talking Points

- I separated frontend rendering from backend data logic.
- I moved food and platform data into SQLite instead of keeping it hardcoded in the browser.
- I preserved existing UI behavior while adding a backend and AI assistant.
- The chat assistant is grounded in database search results, so responses stay explainable.
- API keys are loaded from `.env`, never hardcoded.
- The app still works without an LLM key because of the fallback response.

## Possible Future Improvements

- Add user login and saved favorite foods.
- Store chat history in SQLite.
- Add real-time platform scraping or official partner APIs.
- Add tests for scoring and prompt extraction.
- Deploy backend separately from the static frontend.
