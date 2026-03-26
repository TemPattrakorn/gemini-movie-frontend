# 🎬 Gemini Movie Recommender — Frontend

A sleek, responsive, and secure chat interface for the Gemini Movie Recommender application. Built with **Next.js**, **React**, and **Tailwind CSS**, this frontend provides an intuitive conversational UI that guides users to their perfect movie match.

This repository implements a **Backend-for-Frontend (BFF)** proxy architecture to ensure secure, zero-trust communication with the FastAPI backend.

---

## 🏗 Architecture & Security

To protect the core AI backend from public exposure and unauthorized abuse, the frontend uses Next.js Server-Side API Routes as a secure middleman.

| Layer | Mechanism | Effect |
|---|---|---|
| **Secure Proxy** | `/api/chat` Next.js route | The browser client never communicates directly with the FastAPI backend |
| **Secret Injection** | Server-side `x-api-key` header | Backend URL and auth secrets remain completely hidden from the browser |

---

## ✨ Core Features

- **Conversational UI** — A dynamic, auto-scrolling chat interface with typing indicators and loading states across multi-turn AI conversations.
- **Smart Theming** — Dynamic light/dark mode that automatically switches based on the user's local time of day, with a manual override toggle via `next-themes`.
- **Dynamic Greetings** — The AI greets users contextually based on their current time (Morning, Afternoon, or Evening).
- **Rich Recommendation Cards** — Final movie picks are displayed in styled `shadcn/ui` cards, each with a direct "Watch on JustWatch" streaming button.
- **Responsive Design** — Fully optimized for desktop and mobile using Tailwind CSS.

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js (App Router) / React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix UI primitives) |
| Testing | Playwright (End-to-End) |

---

## 💻 Local Development

### 1. Clone & Install

```bash
git clone https://github.com/TemPattrakorn/gemini-movie-frontend.git
cd gemini-movie-frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# The URL of your FastAPI backend (local or production)
BACKEND_URL=http://localhost:8000

# The shared secret used to authorize requests to the backend
API_SECRET_KEY=my-local-secret
```

> **Note:** Do not prefix these with `NEXT_PUBLIC_` — they must remain server-side only and never exposed to the browser.

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

> Ensure the FastAPI backend is also running on port `8000` for the full stack to function.

---

## 🧪 End-to-End Testing

This repository uses **Playwright** to simulate real user interactions inside a Chromium browser. The test suite verifies that the UI correctly handles user input, communicates through the API proxy, and renders AI responses.

**Run the test suite:**

```bash
npx playwright test
```

**View the visual HTML report:**

```bash
npx playwright show-report
```

---

## 🤝 Ecosystem

This frontend is designed to work exclusively with the [Gemini Movie Recommender Backend API](https://github.com/TemPattrakorn/gemini-movie-backend). Refer to that repository for backend setup, API reference, and security documentation.

---

## 📄 License

This project is licensed under the MIT License. See [`LICENSE`](./LICENSE) for details.
