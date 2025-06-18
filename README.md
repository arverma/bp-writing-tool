# Hinglish to Devanagari Converter - Electron App

A cross-platform desktop application that converts Hinglish (Romanized Hindi) text to Devanagari script in real-time.

## Features

- **Real-time Conversion**: Type Hinglish and see instant Devanagari suggestions
- **Smart Suggestions**: Click on any word to see multiple transliteration options
- **Offline Functionality**: Works completely offline - no internet required
- **Native macOS Experience**: Beautiful, responsive interface designed for macOS
- **Easy Installation**: Simple drag-and-drop installation

---

## How to Build the DMG from Scratch

### Prerequisites
- **Node.js** (v16 or higher)
- **Python 3** (v3.8 or higher)
- **macOS** (10.14 or higher)
- **Git** (to clone the repo)
- **make** (comes pre-installed on macOS)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd BPolice
```

### 2. Set Up the Project (Node.js & Python)
```bash
make setup
```

### 3. (Optional) Add/Update App Icon
Place your icon as `assets/icon.png` (or update the path in `package.json`).

### 4. Run in Development Mode
```bash
make dev
```

### 5. Build the DMG for Distribution
```bash
make build
```
- The `.dmg` files will be created in the `dist/` directory.

### 6. Clean Build Output and Python venv (Optional)
```bash
make clean
```

---

## Files/Folders to Push to GitHub for DMG Building

**Required:**
- `main.js` (Electron main process)
- `preload.js` (Electron preload script)
- `package.json` (dependencies and build config)
- `package-lock.json` (optional, for reproducible npm installs)
- `renderer/` (contains `index.html`, `styles.css`, `renderer.js`)
- `python/app.py` (Flask backend)
- `python/requirements.txt` (Python dependencies)
- `assets/` (app icon, e.g., `icon.png`)
- `Makefile` (for easy setup/build)
- `.gitignore` (to avoid pushing `node_modules`, `dist`, etc.)
- `README-ELECTRON.md` (or your main README with these instructions)

**Not Required (should be gitignored or omitted):**
- `dist/` (build output)
- `node_modules/` (npm dependencies, will be installed by user)
- `python/venv/` (Python virtual environment, will be created by user)
- `.DS_Store`, `playground.py`, `app.py` (root), `requirements.txt` (root), `app.spec`, `templates/`, `scripts/`, `.venv/` (root, if present), `README.md` (old, if you only want Electron docs)

### .gitignore Example
```gitignore
node_modules/
dist/
python/venv/
.DS_Store
.vscode/
*.pyc
__pycache__/
*.log
```

---

## Project Structure

```
BPolice/
├── main.js                 # Main Electron process
├── preload.js              # Preload script for secure IPC
├── package.json            # Node.js dependencies and build config
├── renderer/               # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── renderer.js        # Frontend JavaScript
├── python/                # Python backend
│   ├── app.py            # Flask server
│   ├── requirements.txt  # Python dependencies
│   └── venv/             # Python virtual environment (not pushed)
├── assets/                # App icons and resources
├── Makefile               # For easy setup/build/clean
└── README-ELECTRON.md     # This README
```

---

## How It Works

1. **Electron Main Process**: Manages the app lifecycle and starts the Python Flask server
2. **Python Flask Server**: Handles transliteration requests using the `hindi-xlit` library
3. **Renderer Process**: Provides the user interface and communicates with the backend via IPC
4. **Preload Script**: Securely exposes APIs between main and renderer processes

---

## Troubleshooting

### Common Issues

1. **Python Server Won't Start**
   - Ensure Python 3 is installed and in PATH
   - Check that virtual environment is properly set up
   - Verify all Python dependencies are installed

2. **App Won't Launch**
   - Check Node.js version (requires v16+)
   - Ensure all npm dependencies are installed
   - Check console for error messages

3. **Transliteration Not Working**
   - Verify Flask server is running on port 5001
   - Ensure `hindi-xlit` library is properly installed

---

## License

MIT License

---

**Note**: This app requires no internet connection to function. All transliteration is performed locally using the bundled Python backend. 