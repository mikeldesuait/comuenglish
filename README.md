# Cambridge Prep

Study app for Cambridge English exams: A2 Key, B1 Preliminary, B2 First.

## Features

- Three levels: A2, B1, B2
- Three modules: Fundamentals, Comprehension, Production
- Grammar and vocabulary units organized by communicative function
- Multiple choice exercises with instant feedback
- Audio player for listening (max 2 plays, like real exam)
- Voice recorder for speaking practice
- DeepSeek integration for essay evaluation
- Cambridge Scale scoring
- Progress saved in localStorage

## Project structure

```
cambridge-prep/
  index.html
  css/
    base.css        reset, variables, typography
    layout.css      topbar, sidebar, content, statusbar
    widgets.css     cards, buttons, exercises, modals
  js/
    app.js          bootstrap
    router.js       SPA navigation
    state.js        global state + localStorage
    core/
      storage.js    localStorage wrapper
      scoring.js    Cambridge Scale conversion
    views/
      home.js       home screen
      fundamentals.js   module 1
      comprehension.js  module 2
      production.js     module 3
    widgets/
      exercise.js       multiple choice
      audio-player.js   listening
      recorder.js       speaking
      progress.js       progress bar
      settings-modal.js API key config
    services/
      deepseek.js       DeepSeek API client
  data/
    a2/  units.json + 9 unit files
    b1/  units.json + 10 unit files
    b2/  units.json + 10 unit files
  audio/
    a2/  b1/  b2/
```

## How to run

```bash
cd cambridge-prep
python3 -m http.server 8000
```

Open http://localhost:8000

## DeepSeek setup

1. Get an API key from https://platform.deepseek.com
2. Open the app and click the settings button
3. Paste the key (starts with sk-)
3. The key is stored only in your browser localStorage

## Adding content

To add a new unit:

1. Create the unit JSON file in data/{level}/
2. Add the unit to data/{level}/units.json
3. Reload the app

### Unit JSON format

```json
{
  "id": "a2-u10",
  "title": "Unit title",
  "grammar": "Grammar focus",
  "vocabulary": "Vocabulary focus",
  "function": "Communicative function",
  "phases": [
    { "name": "Presentation", "type": "text", "content": "..." },
    { "name": "Discovery", "type": "text", "content": "..." },
    { "name": "Guided practice", "type": "exercise", "prompt": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..." },
    { "name": "Free practice", "type": "task", "prompt": "..." },
    { "name": "Mini-test", "type": "exercise", "prompt": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..." }
  ]
}
```

## License

Personal use.
