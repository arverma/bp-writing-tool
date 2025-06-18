from flask import Flask, render_template, request, jsonify
from hindi_xlit import HindiTransliterator
import sys
import os

app = Flask(__name__)
transliterator = HindiTransliterator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transliterate', methods=['POST'])
def translit():
    data = request.json
    word = data.get('word', '')
    # Only support Hinglish (Roman) to Devanagari
    suggestions = [transliterator.transliterate(word, 5)]
    suggestions.append(word)
    return jsonify({'suggestions': suggestions[0]})

if __name__ == '__main__':
    # For Electron, run on localhost with port 5001 to avoid AirPlay conflict
    app.run(host='127.0.0.1', port=5001, debug=False) 