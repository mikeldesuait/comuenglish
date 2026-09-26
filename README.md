# Cambridge Prep

Study app for Cambridge English exams: A2 Key, B1 Preliminary, B2 First.

Author: Miguel Garcia

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

- Three levels: A2, B1, B2
- Three modules: Fundamentals, Comprehension, Production
- Fundamentals: 7 phases per unit
- Reading: texts with Cambridge-style questions
- Listening: browser TTS with max 2 plays per audio
- Writing: DeepSeek evaluation using Cambridge rubric
- Speaking: voice recording + transcription + DeepSeek
- Mock Exam: timed sections with Cambridge Scale result
- Responsive card grid layout on all lists
- Real-time option shuffle
- Stop button and Show/Hide transcript in Listening
- Progress saved in localStorage

## Project structure

    cambridge-prep/
      index.html
      css/   base.css, layout.css, widgets.css
      js/
        app.js, router.js, state.js
        core/    storage.js, scoring.js
        views/   home, fundamentals, comprehension, production, mock
        widgets/ exercise, audio-player, recorder, progress, settings-modal, timer, speech-analyzer
        services/ deepseek.js
      data/  a2/, b1/, b2/
        units.json + one json per unit
        reading.json, listening.json, writing.json, speaking.json

## How to run

    cd cambridge-prep
    python3 -m http.server 8000

Open http://localhost:8000

## DeepSeek setup

1. Get an API key from https://platform.deepseek.com
2. Open the app and click the settings gear icon
3. Paste the key (starts with sk-)
4. The key is stored only in browser localStorage

## Pending tasks (next session)

- Multilingual support (UI in Spanish + English content)
- Add more Reading / Listening / Writing content
- Publish as PWA (installable, offline)
- Spaced repetition engine
- Polishing CSS details

## License

Personal use.
