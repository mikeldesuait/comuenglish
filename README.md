# ComuEnglish

Study app for English exams: A2, B1, B2.

Author: Miguel Garcia
Company: ComuTech

## Content

| Module | A2 | B1 | B2 |
|--------|----|----|-----|
| Fundamentals (units) | 15 | 10 | 10 |
| Reading (texts) | 15 | 12 | 10 |
| Listening (audios) | 10 | 10 | 8 |
| Writing (tasks) | 8 | 10 | 10 |
| Speaking (prompts) | 10 | 12 | 12 |
| **Total items** | | | **1,009** |

## Features

- Three levels: A2 Elementary, B1 Intermediate, B2 Upper Intermediate
- Four content modules: Fundamentals, Comprehension, Production, Mock Exam
- Fundamentals: 7 phases per unit with progress tracking (1/7 to 7/7)
- Reading: texts with CEFR-style questions
- Listening: browser TTS with max 2 plays per audio
- Writing: DeepSeek evaluation using CEFR rubric
- Speaking: voice recording + transcription + DeepSeek analysis
- Mock Exam: timed sections with CEFR Scale result
- Real-time option shuffle (prevents pattern memorization)
- Progress saved in localStorage

## Coaching System

- **Onboarding**: user selects level, exam date, days per week
- **Auto calculation**: app computes minutes per day needed
- **Calendar generation**: 3 passes (learn, review, consolidate) + 6 mock exams
- **My Plan (Today)**: shows tasks for the current day
- **Time tracking**: user logs time spent on each task
- **Progress dashboard**: real metrics and projections
- **Streak**: consecutive days studying
- **Post-plan actions**: study ahead or review when finished

## Design

- Modern minimal design with high-contrast text
- Palette: orange (action), green (success), amber (warning), deep blue (focus)
- Topbar with 2 groups: marketing (Home, How it works) + personal (My Plan, Settings)
- Home: one-screen pitch with hidden background icons and UK flags
- How it works: 3-step method + slideshow + comparison
- Onboarding: compact horizontal layout

## Project structure

    comuenglish/
      index.html
      css/   base.css, layout.css, widgets.css
      js/
        app.js, router.js, state.js
        core/    planner.js, storage.js, scoring.js
        views/   home, how, today, progress, onboarding,
                 fundamentals, comprehension, production, mock
        widgets/ exercise, audio-player, recorder, progress,
                 settings-modal, timer, speech-analyzer, time-tracker
        services/ deepseek.js
      data/  a2/, b1/, b2/
      docs-coaching-plan.md

## How to run

    cd comuenglish
    python3 -m http.server 8000

Open http://localhost:8000

## DeepSeek setup

1. Get API key from https://platform.deepseek.com
2. Open the app, click the settings gear icon
3. Paste the key (starts with sk-)

## Pending tasks

- Auto-reschedule when user falls behind
- Calendar view (full schedule)
- Vacation mode (pause plan)
- PWA (installable, offline)
- Notifications for daily study reminder
- Pricing page (Free / Monthly / Lifetime)

## Commercial notes

- Branded as ComuEnglish (not Cambridge)
- Levels: A2 Elementary, B1 Intermediate, B2 Upper Intermediate
- No references to Cambridge, KET, PET or FCE in the UI
- CEFR level codes (A2, B1, B2) are public standard

## License

Personal use until commercial release.
