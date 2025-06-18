# Hinglish to Devanagari Web App

A simple, production-quality web app for fast and accurate Hinglish (Roman Hindi) to Devanagari (Hindi script) transliteration with suggestions, powered by AI4Bharat's IndicXlit.

## Features
- Type Hinglish and get instant Devanagari suggestions.
- Press space to auto-replace the last word with the top suggestion.
- Click on any word to see and select from multiple suggestions.
- Clean, modern, responsive UI.

## Requirements
- **Python** (required for compatibility with `fairseq` and `ai4bharat-transliteration`)
- **Node.js** is NOT required (pure Python + HTML/JS)

## Setup Instructions

### Install Python
- On macOS (with Homebrew):
  ```bash
  brew install python
  ```


### Create and activate a virtual environment
```bash
python3.9 -m venv .venv
source .venv/bin/activate
```

### Install dependencies (with correct versions)
```bash
pip install -r requirements.txt
```

### Run the app
```bash
python app.py
```

Visit [http://localhost:5000](http://localhost:5000) in your browser.

---

## File Structure
- `app.py` — Flask backend
- `templates/index.html` — Frontend UI
- `requirements.txt` — Python dependencies
- `README.md` — This file

---

## Troubleshooting
- If you see errors related to `fairseq`, `torch`, or model loading, double-check your Python and pip versions.
- If you see errors about `weights_only` or `dataclass`, you are likely using an unsupported Python or PyTorch version.

---

## Credits
- [AI4Bharat Transliteration (IndicXlit)](https://github.com/AI4Bharat/IndicTrans)
- [Flask](https://flask.palletsprojects.com/) 