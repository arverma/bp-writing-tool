from flask import Flask, render_template, request, jsonify
from hindi_xlit import HindiTransliterator

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
    suggestions = [transliterator.transliterate(word)]
    suggestions.append(word)
    return jsonify({'suggestions': suggestions[0]})

if __name__ == '__main__':
    app.run(debug=True) 