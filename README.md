# Cambridge Prep

Study app for Cambridge English exams: A2 Key, B1 Preliminary, B2 First.

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
- Fundamentals: 7 phases per unit (Grammar, Vocabulary, Discovery, Guided practice, Free practice, Mini-test, Summary)
- Reading: texts with Cambridge-style questions
- Listening: browser TTS (Web Speech API) with max 2 plays per audio
- Writing: DeepSeek evaluation using official Cambridge rubric
- Speaking: voice recording + transcription + DeepSeek analysis
- Mock Exam: timed sections with Cambridge Scale result
- Progress saved in localStorage

## Project structure

    cambridge-prep/
      index.html
      css/         base.css, layout.css, widgets.css
      js/
        app.js     bootstrap
        router.js  SPA navigation
        state.js   global state + localStorage
        core/      storage.js, scoring.js
        views/     home, fundamentals, comprehension, production, mock
        widgets/   exercise, audio-player, recorder, progress, settings-modal, timer, speech-analyzer
        services/  deepseek.js
      data/
        a2/  b1/  b2/
          units.json
          {level}-u{N}.json  (one per unit)
          reading.json
          listening.json
          writing.json
          speaking.json

## How to run

    cd cambridge-prep
    python3 -m http.server 8000

Open http://localhost:8000

## DeepSeek setup

1. Get an API key from https://platform.deepseek.com
2. Open the app and click the settings gear icon
3. Paste the key (starts with sk-)
4. The key is stored only in your browser localStorage

## How to add content

Each JSON file follows a simple schema. See any existing file for reference.

- New unit: create a file like a2-u16.json and add it to units.json
- New reading text: add to reading.json
- New listening: add to listening.json
- New writing task: add to writing.json
- New speaking prompt: add to speaking.json

## License

Personal use.
