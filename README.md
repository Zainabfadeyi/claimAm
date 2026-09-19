# ClaimAm

Conversational AI web app that helps Nigerians find government support programs they likely
qualify for, explained in plain language, with a personalized next-steps checklist.

ClaimAm is an independent, informational project — it is **not** a government service, does not
verify NIN/BVN, and does not submit applications on anyone's behalf. Every program card links out
to the program's own official site for the real application.

## Stack

One Next.js app (Pages Router) + plain JavaScript + Tailwind CSS + Google Gemini API (function
calling, free tier). No database, no auth. `pages/` contains routing only; the actual logic lives
in `frontend/` and `backend/` below it.

**Provider note:** the technical spec originally called for the Anthropic Messages API. We're on
Gemini's free tier for now (no card required) — see the tradeoff in `backend/lib/reasonEngine.js`
and the privacy note on the Eligibility Finder page (Google's free tier may use submitted text to
improve their models). Swapping back to Anthropic later only touches `reasonEngine.js` and
`reasoningTool.js` — the rest of the app is provider-agnostic.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in GEMINI_API_KEY (free key: aistudio.google.com/apikey)
npm run dev
```

Open http://localhost:3000.

## Structure

```
pages/                        # routing only — thin files that import from frontend/ and backend/
  index.js                    # home: hero + category grid
  finder.js                   # Eligibility Finder: intake form + results
  api/reason.js               # POST handler → backend/lib/reasonEngine
  programs/index.js           # browse all 23 verified programs
  programs/[id].js            # program detail page
  programs/[id]/checklist.js  # interactive preparation checklist

frontend/
  components/                 # Layout (nav/footer), CategoryGrid, IntakeForm, ResultCard
  lib/matchSession.js         # carries a match's reason/next_steps to the detail page (sessionStorage)
  styles/globals.css

backend/
  lib/
    reasonEngine.js           # calls the LLM (Gemini), validates + grounds the response — the real API logic
    systemPrompt.js           # LLM system prompt
    reasoningTool.js          # provider-neutral structured-output schema
    categories.js             # the 6 live category chips → program id map
    programs.js                # getAllPrograms() / getProgramById()
  data/
    programs.json             # the 23 live programs the app reasons over (mostly self-service, plus a few bank financing entries that need a branch visit)
    programs.full.json        # all 19 originally-researched programs, reference only, not loaded
```

## Notes

- The LLM only decides *which* programs match and *why*, in the user's own words. Benefit
  amounts, apply links, and status always come from `backend/data/programs.json`, never from the
  model — see `backend/lib/reasonEngine.js` and the grounding rule in the technical spec.
- The frontend copy is deliberately honest about what the app is and isn't (see the top banner and
  footer in `frontend/components/Layout.js`) — it does not claim government affiliation, real-time
  NIN/BVN verification, or a submitted application, since none of those actually happen.
- Before a live demo, recheck the open TODOs in the project documentation (NELFUND 2026/27
  window, 3MTT cohort status, njfp.ng primary source, etc.) — several programs are flagged
  `needs_verification` in the data.
