# AI Expense Tracker

A full-stack expense tracking app that uses AI to parse natural language input.

Built by: Shashank Gupta
GitHub: https://github.com/Sg99sg15/ai-expense-tracker
Time to build: 25 minutes (with AI assistance)

## 🎥 Demo

[Watch Demo](https://drive.google.com/file/d/1feJYEaaG2rZ4FY9fN-fWHZ8FQ23kWS6-/view?usp=sharing)

## 🛠️ Tech Stack

- **Mobile:** React Native, Expo, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite (better-sqlite3)
- **AI:** Gemini API (gemini-1.5-flash)

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/apikey))

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your Groq API key to .env
npm run build
npm start
```

### Mobile
```bash
cd mobile
npm install
npm start
# Scan QR code with Expo Go app
```

> **Physical device:** Update `BASE_URL` in `mobile/src/services/api.ts` with your machine's local IP (e.g., `http://192.168.1.x:3000`)

## 📁 Project Structure

```
ai-expense-tracker/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express server entry point
│   │   ├── routes/
│   │   │   └── expenses.ts   # POST, GET, DELETE endpoints
│   │   ├── services/
│   │   │   └── aiService.ts  # Gemini AI parsing logic
│   │   └── database/
│   │       └── db.ts         # SQLite setup & CRUD functions
│   ├── .env.example
│   └── package.json
│
└── mobile/
    ├── App.tsx                # Navigation setup
    └── src/
        ├── screens/
        │   └── ExpenseTrackerScreen.tsx  # Main UI screen
        ├── services/
        │   └── api.ts         # Backend API calls
        └── types/
            └── index.ts       # Shared TypeScript types
```

## 🤖 AI Prompt Design

I used this system prompt for expense parsing:

```
You are an expense parser. Extract expense information from natural language input.

RULES:
1. Extract the amount as a number (no currency symbols)
2. Default currency is INR unless explicitly mentioned (USD, EUR, etc.)
3. Categorize into EXACTLY one of these categories:
   - Food & Dining / Transport / Shopping / Entertainment
   - Bills & Utilities / Health / Travel / Other
4. Description should be a clean summary (not the raw input)
5. Merchant is the company/store name if mentioned, null otherwise

RESPOND ONLY WITH VALID JSON, no other text.
```

**Why this approach:**
Strict JSON-only output eliminates parsing errors, and explicit category lists ensure consistent categorization. Defaulting to INR and 'Other' as fallbacks prevents null responses for Indian users.

## ⏱️ Time Breakdown

| Task | Time |
|------|------|
| Setup | 3 min |
| Backend | 7 min |
| AI Integration | 5 min |
| Mobile App | 7 min |
| Testing & Polish | 3 min |
| **Total** | **25 min** |

## 🔮 What I'd Add With More Time

- [ ] Monthly spending summary & charts
- [ ] Edit expense functionality
- [ ] Category-wise budget limits & alerts
- [ ] Offline support with sync
- [ ] Export expenses to CSV

## 📝 AI Tools Used

- **Claude Code**: Used for scaffolding full project structure, backend routes, database setup, and React Native UI
- **Gemini API (gemini-1.5-flash)**: Used at runtime to parse natural language expense input into structured JSON

Most helpful prompt: *"RESPOND ONLY WITH VALID JSON, no other text"* — this single instruction eliminated all markdown/code-block wrapping issues from the AI response.

## 📜 License

MIT - Feel free to use this for your own projects!
