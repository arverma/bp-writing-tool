const inputBox = document.getElementById('inputBox');
const suggestionsBox = document.getElementById('suggestions');
let lastWordStart = 0;
let lastWordEnd = 0;
let currentWord = '';
let caretPos = 0;
// Mapping: Devanagari word -> original Hinglish
const devToHinglish = {};

// Helper: get word boundaries at a given position
function getWordBoundaries(text, pos) {
    let start = pos, end = pos;
    while (start > 0 && !/\s/.test(text[start - 1])) start--;
    while (end < text.length && !/\s/.test(text[end])) end++;
    return [start, end];
}

// On input: update last word info
inputBox.addEventListener('input', async (e) => {
    const value = inputBox.value;
    const cursor = inputBox.selectionStart;
    const words = value.slice(0, cursor).split(/\s/);
    const lastWord = words[words.length - 1];
    lastWordStart = value.slice(0, cursor).lastIndexOf(lastWord);
    lastWordEnd = lastWordStart + lastWord.length;
    currentWord = lastWord;
    caretPos = cursor;
});

// On space: replace last word with top suggestion and store mapping
inputBox.addEventListener('keydown', async (e) => {
    if (e.key === ' ') {
        const value = inputBox.value;
        const cursor = inputBox.selectionStart;
        const [start, end] = getWordBoundaries(value, cursor - 1);
        const word = value.slice(start, end);
        if (word.trim().length === 0) return; // Don't process empty
        e.preventDefault();
        
        try {
            // Use Electron API to call transliteration
            const data = await window.electronAPI.transliterate(word);
            const top = data.suggestions[0] || word;
            // Store mapping: Devanagari -> Hinglish
            devToHinglish[top] = word;
            // Replace word with top suggestion and add space
            inputBox.value = value.slice(0, start) + top + ' ' + value.slice(end);
            // Move caret after inserted word + space
            inputBox.selectionStart = inputBox.selectionEnd = start + top.length + 1;
        } catch (error) {
            console.error('Transliteration failed:', error);
            // Fallback: just add space
            inputBox.value = value.slice(0, start) + word + ' ' + value.slice(end);
            inputBox.selectionStart = inputBox.selectionEnd = start + word.length + 1;
        }
    }
});

// On click: show suggestions for clicked word, using mapping if available
inputBox.addEventListener('mouseup', async (e) => {
    setTimeout(async () => {
        const value = inputBox.value;
        const cursor = inputBox.selectionStart;
        const [start, end] = getWordBoundaries(value, cursor);
        let word = value.slice(start, end);
        if (word.trim().length === 0) {
            suggestionsBox.style.display = 'none';
            return;
        }
        // If Devanagari and in mapping, use original Hinglish
        if (/^[\u0900-\u097F]+$/.test(word) && devToHinglish[word]) {
            word = devToHinglish[word];
        }
        
        try {
            // Use Electron API to call transliteration
            const data = await window.electronAPI.transliterate(word);
            showSuggestions(data.suggestions, start, end);
        } catch (error) {
            console.error('Failed to get suggestions:', error);
            suggestionsBox.style.display = 'none';
        }
    }, 0);
});

// Show suggestions dropdown at caret position (below the word)
function showSuggestions(suggestions, wordStart, wordEnd) {
    suggestionsBox.innerHTML = '';
    // Always add the original Hinglish word as the last suggestion, styled bold
    const value = inputBox.value;
    const originalWord = devToHinglish && devToHinglish[value.slice(wordStart, wordEnd)] ? devToHinglish[value.slice(wordStart, wordEnd)] : value.slice(wordStart, wordEnd);
    let displaySuggestions = suggestions.slice(0, 5);
    // Remove the original word if present in suggestions (case-insensitive)
    displaySuggestions = displaySuggestions.filter(s => s !== originalWord);
    // Only show up to 5 Devanagari suggestions, then the original roman word
    displaySuggestions.push(originalWord);
    displaySuggestions.forEach((s, i) => {
        const div = document.createElement('div');
        // Only the last suggestion (original roman) is bold
        div.className = 'suggestion' + (i === displaySuggestions.length - 1 ? ' original-suggestion' : '');
        div.textContent = s;
        div.onclick = () => selectSuggestion(s, wordStart, wordEnd);
        suggestionsBox.appendChild(div);
    });
    
    // Position the suggestions box
    positionSuggestionsBox(wordStart);
}

// Position suggestions box at the correct location
function positionSuggestionsBox(wordStart) {
    // Use a hidden mirror div to get the word's pixel position
    const mirror = document.getElementById('mirror');
    const style = getComputedStyle(inputBox);
    mirror.style.font = style.font;
    mirror.style.fontSize = style.fontSize;
    mirror.style.fontFamily = style.fontFamily;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.padding = style.padding;
    mirror.style.border = style.border;
    mirror.style.width = inputBox.offsetWidth + 'px';
    mirror.style.height = inputBox.offsetHeight + 'px';
    mirror.style.boxSizing = style.boxSizing;
    
    // Copy textarea content up to wordStart, insert marker span at wordStart
    let before = inputBox.value.substring(0, wordStart);
    let after = inputBox.value.substring(wordStart);
    before = before.replace(/\n/g, '<br>');
    after = after.replace(/\n/g, '<br>');
    mirror.innerHTML = before + '<span id="caret-marker"> </span>' + after;
    
    const marker = document.getElementById('caret-marker');
    const markerRect = marker.getBoundingClientRect();
    const parentRect = inputBox.parentElement.getBoundingClientRect();
    
    // Calculate left/top relative to parent, then adjust for textarea scroll
    const left = markerRect.left - parentRect.left - inputBox.scrollLeft;
    const top = markerRect.top - parentRect.top - inputBox.scrollTop;
    
    // Calculate max suggestion width
    let maxWidth = 0;
    const measurer = document.createElement('span');
    measurer.style.visibility = 'hidden';
    measurer.style.position = 'absolute';
    measurer.style.whiteSpace = 'pre';
    measurer.style.font = style.font;
    document.body.appendChild(measurer);
    
    const suggestions = suggestionsBox.querySelectorAll('.suggestion');
    suggestions.forEach(s => {
        measurer.textContent = s.textContent;
        maxWidth = Math.max(maxWidth, measurer.offsetWidth);
    });
    document.body.removeChild(measurer);
    maxWidth += 32;
    
    suggestionsBox.style.left = left + 'px';
    suggestionsBox.style.top = (top + 24) + 'px'; // 24px to move below the line
    suggestionsBox.style.width = maxWidth + 'px';
    suggestionsBox.style.display = 'block';
}

// Replace word with selected suggestion and update mapping
function selectSuggestion(s, wordStart, wordEnd) {
    const value = inputBox.value;
    // If the replaced word was Devanagari and in mapping, keep the mapping
    const oldWord = value.slice(wordStart, wordEnd);
    if (/^[\u0900-\u097F]+$/.test(s) && devToHinglish[oldWord]) {
        devToHinglish[s] = devToHinglish[oldWord];
    }
    inputBox.value = value.slice(0, wordStart) + s + value.slice(wordEnd);
    inputBox.focus();
    // Move caret to after inserted word
    inputBox.selectionStart = inputBox.selectionEnd = wordStart + s.length;
    suggestionsBox.style.display = 'none';
}

// Hide suggestions on click outside
document.addEventListener('click', (e) => {
    if (!suggestionsBox.contains(e.target) && e.target !== inputBox) {
        suggestionsBox.style.display = 'none';
    }
}); 