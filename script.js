let currentWord = null;
const meaningEl = document.getElementById('meaning');
const wordDisplay = document.getElementById('wordDisplay');
const userInput = document.getElementById('userInput');
const feedback = document.getElementById('feedback');
const showBtn = document.getElementById('showBtn');
const checkBtn = document.getElementById('checkBtn');
const newBtn = document.getElementById('newBtn');

const sounds = {
  correct: 'sounds/ClappingSoundEffect.wav',
  wrong: 'sounds/Wrong.wav',
  show: 'sounds/show.wav'
};

function playSound(type) {
  try {
    const audio = new Audio(sounds[type]);
    audio.play().catch(() => {});
  } catch (e) {
    console.warn('Sound error', e);
  }
}

function showWord() {
  if (currentWord) {
    wordDisplay.innerText = currentWord.word;
    wordDisplay.style.transition = 'opacity 0.5s ease';
    wordDisplay.style.opacity = '1';
    playSound('show');
    setTimeout(() => {
      wordDisplay.style.opacity = '0';
      setTimeout(() => {
        wordDisplay.innerText = '•••••';
        wordDisplay.style.opacity = '1';
      }, 500);
    }, 2000);
  }
}

function checkAnswer() {
  if (!currentWord) return;
  const answer = userInput.value.trim().toUpperCase();
  if (answer === currentWord.word.toUpperCase()) {
    feedback.innerText = '✅ Correct!';
    feedback.style.color = 'green';
    playSound('correct');
    setTimeout(() => {
      loadNewWord();
    }, 900);
  } else {
    feedback.innerText = '❌ Wrong, try again!';
    feedback.style.color = 'red';
    playSound('wrong');
  }
}

async function loadNewWord() {
  feedback.innerText = '';
  userInput.value = '';
  wordDisplay.innerText = '•••••';
  meaningEl.innerText = 'Loading...';
  try {
    const rwRes = await fetch('https://random-word-api.vercel.app/api?words=1');
    if (!rwRes.ok) throw new Error('Random word API failed');
    const rwData = await rwRes.json();
    const word = Array.isArray(rwData) ? rwData[0] : rwData.word || rwData;

    const trRes = await fetch(
      'https://api.mymemory.translated.net/get?q=' +
        encodeURIComponent(word) +
        '&langpair=en|tr'
    );
    let trText = word;
    if (trRes.ok) {
      const trData = await trRes.json();
      trText = trData?.responseData?.translatedText || word;
    }

    currentWord = { word: word.toUpperCase(), meaning: trText };
    meaningEl.innerText = currentWord.meaning;
  } catch (err) {
    console.error(err);
    const fallback = ['apple', 'house', 'car', 'book', 'water', 'tree'];
    const w = fallback[Math.floor(Math.random() * fallback.length)];
    currentWord = { word: w.toUpperCase(), meaning: '— ' + w + ' (offline)' };
    meaningEl.innerText = currentWord.meaning;
  }
}

function calculateScore() {
  const form = document.getElementById('quizForm');
  let score = 0;

  // اجمع قيم الإجابات الصحيحة
  const answers = ['q1','q2','q3'];
  answers.forEach(q => {
    const selected = form.elements[q].value;
    score += parseInt(selected);
  });

  document.getElementById('result').innerText = "سكورك هو: " + score + "/" + answers.length;
}

showBtn.addEventListener('click', showWord);
checkBtn.addEventListener('click', checkAnswer);
newBtn.addEventListener('click', loadNewWord);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkAnswer();
});

window.addEventListener('load', loadNewWord);
