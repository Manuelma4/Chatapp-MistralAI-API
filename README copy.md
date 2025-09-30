# Mistral Next Chat

A minimalist chat application built with **Next.js 15 (App Router)** + **TypeScript** that connects to the **Mistral Chat Completions API**.  
It features a clean **Tailwind CSS v4 UI**, **Markdown rendering** (bold, lists, links, code), model selector, temperature control, and a **Mock Mode** for testing without an API key.

---

## ⚙️ Requirements

- **Node.js ≥ 18.17**
- **npm** (or pnpm/yarn if you prefer)
- A **Mistral API key** (optional if you use Mock Mode)

---

## 🚀 Quickstart

```bash
# 1) Install dependencies
npm install

# 2) Create your env file
cp .env.example .env   # or create .env manually

# 3) Fill in .env (see below)

# 4) Start in dev mode
npm run dev

# 5) Open in browser
http://localhost:3000

### `.env` 

```dotenv
# Required if not using Mock Mode
MISTRAL_API_KEY="your_api_key_here"

# Optional: default model (UI defaults to "open-mistral-7b")
MISTRAL_MODEL="mistral-large-latest"
```

> Enable **Mock API** from the UI to test without credentials.

---

## 🧱 Project Structure

```
app/
  api/chat/route.ts        # API Route (Edge Runtime) -> Mistral
  globals.css              # Tailwind v4 (@import "tailwindcss")
  layout.tsx               # Root layout
  page.tsx                 # Main page rendering <Chat />

components/
  Chat.tsx                 # Chat UI (React + Tailwind + React Markdown)

lib/
  mistral.ts               # Types + fetch client for Mistral

postcss.config.js          # Uses @tailwindcss/postcss (v4)
next.config.js
tsconfig.json
package.json
```

---

## 🧩 Tech Stack

* **Next.js 14 (App Router)** – `app/` directory
* **TypeScript**
* **Tailwind CSS v4** (via `@tailwindcss/postcss`)
* **React Markdown** for safe Markdown rendering
* **Edge Runtime** API route (`app/api/chat/route.ts`)

---

## 🗂️ npm Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

---

## 🧪 Mock Mode (no API key required)

Toggle **“Mock API”** in the UI.
The API route will return a fake assistant response so you can validate UI/UX without external calls.

---

## 🔌 Internal API (`/api/chat`)

* **Method:** `POST`

* **Runtime:** Edge

* **Body (JSON):**

  ```json
  {
    "messages": [{ "role": "system|user|assistant", "content": "..." }],
    "model": "mistral-large-latest | open-mistral-7b | codestral-latest",
    "temperature": 0.3,
    "mock": false
  }
  ```

* **Response (example):**

  ```json
  {
    "id": "cmpl_...",
    "object": "chat.completion",
    "created": 1699999999,
    "model": "mistral-large-latest",
    "choices": [
      { "index": 0, "message": { "role": "assistant", "content": "..." } }
    ]
  }
  ```

### Example with `curl`:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "system", "content": "You are a concise, helpful assistant." },
      { "role": "user", "content": "Hello! Who are you?" }
    ],
    "model": "open-mistral-7b",
    "temperature": 0.3
  }'
```

---

## 🖼️ UI & Markdown

* **User/Assistant messages** with bubbles and avatars.
* **Markdown support**: `**bold**`, *italics*, lists, links, `inline code`, and **code blocks**.
* **Enter** submits / **Shift+Enter** adds a newline.
* Editable **System prompt** in a collapsible panel.

---

## 🔧 Quick Customization

* **Default models**: edit the `<select>` in `components/Chat.tsx`.
* **Styling**: customize with Tailwind in `Chat.tsx` or `app/globals.css`.
* **Initial system prompt**: `defaultSystem` constant in `Chat.tsx`.

---

## 🛠️ Technical Details

### Mistral client (`lib/mistral.ts`)

* Calls `https://api.mistral.ai/v1/chat/completions` with `fetch`.
* Handles non-OK responses with a readable error.

### Edge Runtime

* `export const runtime = 'edge'` in `app/api/chat/route.ts` for low latency.

### Tailwind v4 + PostCSS

* Import Tailwind in `app/globals.css`:

  ```css
  @import "tailwindcss";
  ```
* `postcss.config.js`:

  ```js
  module.exports = {
    plugins: { '@tailwindcss/postcss': {} },
  };
  ```

---

## 🧯 Troubleshooting

* **“Unknown at rule @tailwind” in editor**
  Install *Tailwind CSS IntelliSense* or add `"css.lint.unknownAtRules": "ignore"` to VS Code settings.

* **Build error: “trying to use `tailwindcss` directly as a PostCSS plugin”**
  Use **`@tailwindcss/postcss`** in `postcss.config.js`.

* **401/403 from API**
  Check `MISTRAL_API_KEY` in `.env` and restart `npm run dev`.

* **Node version issues**
  Ensure **Node ≥ 18.17** (required by Next.js 14).

---

## 🔐 Security Notes

* Never commit `.env` with your API key.
* Consider limiting temperature and sanitizing system prompt in production.
* Do not log API keys or sensitive prompts.

---

## 📦 Deployment

* Works on any platform supporting **Next.js 14 (App Router)**.
* Set environment variables (e.g., `MISTRAL_API_KEY`) in your hosting provider.
* Runs on **Edge Runtime** for performance, but you can switch to Node by removing `export const runtime = 'edge'`.

---

## ✨ Credits

* [Mistral AI](https://docs.mistral.ai/)
* [Next.js](https://nextjs.org/)
* [Tailwind CSS v4](https://tailwindcss.com/)
* [react-markdown](https://github.com/remarkjs/react-markdown)

---

## 📝 License

MIT — free to use and modify.

