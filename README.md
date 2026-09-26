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
- Fundamentals: 7 phases per unit (Grammar, Vocabulary, Discovery,
  Guided practice, Free practice, Mini-test, Summary)
- Reading: texts with CEFR-style questions
- Listening: browser TTS with max 2 plays per audio
- Writing: DeepSeek evaluation using CEFR rubric
- Speaking: voice recording + transcription + DeepSeek analysis
- Mock Exam: timed sections with CEFR Scale result
- Real-time option shuffle (prevents pattern memorization)
- Progress saved in localStorage

## Coaching System

The app includes a full coaching system:

- **Onboarding**: user selects level, exam date, days per week
- **Auto calculation**: app computes minutes per day needed
- **Calendar generation**: distributes content into 3 passes:
  - Pass 1 - Learning (all content, first time)
  - Pass 2 - Review (all content, second time)
  - Pass 3 - Consolidation (half content + 6 mock exams)
- **Today view**: shows tasks for the current day
- **Time tracking**: user logs time spent on each task
- **Progress dashboard**: real metrics, projections, status
- **Streak**: consecutive days studying

## Design

- Modern minimal design with high-contrast text
- Palette: orange (action), green (success), amber (warning), deep blue (focus)
- Home: one-screen pitch (headline + CTA + 4 stats)
- How it works: horizontal method + comparison + CTA
- Onboarding: compact horizontal layout
- Sidebar: navigation between study modules

## Project structure

    comuenglish/
      index.html
      css/
        base.css, layout.css, widgets.css
      js/
        app.js, router.js, state.js
        core/
          planner.js      calendar generation, time calculations
          storage.js      localStorage wrapper
          scoring.js      CEFR Scale conversion
        views/
          home.js         landing pitch (one-screen)
          how.js          How it works page
          today.js        daily plan (reads calendar)
          progress.js     progress dashboard
          onboarding.js   initial plan setup
          fundamentals.js grammar units
          comprehension.js reading + listening
          production.js   writing + speaking
          mock.js         mock exam
        widgets/
          exercise.js, audio-player.js, recorder.js
          progress.js, settings-modal.js, timer.js
          speech-analyzer.js, time-tracker.js
        services/
          deepseek.js     DeepSeek API client
      data/
        a2/ b1/ b2/
          units.json
          {level}-u{N}.json (one per unit)
          reading.json, listening.json
          writing.json, speaking.json
      docs-coaching-plan.md

## How to run

    cd comuenglish
    python3 -m http.server 8000

Open http://localhost:8000

## DeepSeek setup

1. Get an API key from https://platform.deepseek.com
2. Open the app, click the settings gear icon
3. Paste the key (starts with sk-)
4. Key is stored only in browser localStorage

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
- Ready to publish on Google Play or as web app

## License

Personal use until commercial release.
