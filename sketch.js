// noprotect
let input, submitBtn, resetBtn, statusDiv, words = [];
let processing = false, currRound = 1, currGuess = "raise";

async function setup() {
  createCanvas(windowWidth, windowHeight);
  
  input = createInput("");
  input.position(20, 20);
  input.size(120);
  input.attribute("maxlength", "5");
  input.elt.addEventListener("keydown", e => {
    let k = e.key.toLowerCase();
    let validKeys = ["g", "y", "b", "backspace", "enter"];
    
    if (k === "escape") {
      possible.splice(possible.indexOf(currGuess), 1);
      
      findBest(words, possible, best => {
        currGuess = best;
        updateDisplay(`Round ${currRound}: try "${currGuess}" (${possible.length} words left)`);
      });
    }
    
    if (!validKeys.includes(k)) {
      e.preventDefault();
      return;
    }
    if (k === "enter" && input.value().length === 5) processFeedback();
  })
  
  submitBtn = createButton("Submit");
  submitBtn.position(150, 20);
  submitBtn.mousePressed(processFeedback);
  
  resetBtn = createButton("Reset");
  resetBtn.position(210, 20);
  resetBtn.mousePressed(() => {
    if (processing) return;
    currGuess = "raise";
    
    input.value("");
    startSolving();
  })
  
  statusDiv = createDiv("");
  statusDiv.position(20, 60);
  statusDiv.style("font-family", "monospace");
  
  words = await getWords();
  startSolving();
}

function draw() {
  background(220);
}

function startSolving() {
  currRound = 1;
  
  updateDisplay(`Initializing...`);
  possible = structuredClone(words);
  
  updateDisplay(`Round ${currRound}: try "${currGuess}" (${possible.length} words left)`);
}

function findBest(guesses, possible, callback) {
  processing = true;
  
  let bestWord = "";
  let bestEnt = -1;
  
  let index = 0;
  let batchSize = 5;
  
  function process() {
    let end = min(index + batchSize, possible.length);
    updateDisplay(`Computing best guess... (${index}/${possible.length})`);
    
    for (; index < end; index++) {
      let ent = getEntropy(possible[index], possible);
    
      if (ent > bestEnt) {
        bestEnt = ent;
        bestWord = possible[index];
      }
    }
  
    if (index < possible.length) {
      requestAnimationFrame(process);
    } else {
      processing = false;
      callback(bestWord);
    }
  }
  
  process();
}

function getEntropy(guess, possible) {
  let patterns = new Map();
  let n = possible.length;
  
  for (let target of possible) {
    let pat = getPattern(guess, target);
    patterns.set(pat, (patterns.get(pat) || 0) + 1);
  }
  
  let entropy = 0.0;
  
  for (let c of patterns.values()) {
    let p = c / n;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}

function getPattern(guess, target) {
  let pattern = ["b", "b", "b", "b", "b"];
  let targets = {};
  
  for (let ch of target) {
    targets[ch] = (targets[ch] || 0) + 1;
  }
  
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      pattern[i] = "g";
      targets[guess[i]]--;
    }
  }
  
  for (let i = 0; i < 5; i++) {
    if (pattern[i] === "g") continue;
    let letter = guess[i];
    
    if (targets[letter] > 0) {
      pattern[i] = "y";
      targets[letter]--;
    }
  }
  
  return pattern.join("");
}

function filterPossible(possible, guess, pattern) {
  return possible.filter(target => getPattern(guess, target) === pattern);
}

function processFeedback() {
  if (processing) return;
  
  let feedback = input.value().trim().toLowerCase();
  input.value("");
  
  if (feedback === "") return;
  if (feedback === "stop") {
    updateDisplay("Stopped.");
    return;
  }
  
  if (feedback === "ggggg") {
    updateDisplay(`Solved in ${currRound} guesses!`);
    return;
  }
  
  possible = filterPossible(possible, currGuess, feedback);
  
  if (possible.length === 0) {
    updateDisplay("No possible words left - check your feedback.");
    return;
  }
  
  currRound++;
  updateDisplay(`Computing next guess... (${possible.length} words left)`);
  
  findBest(words, possible, best => {
    currGuess = best;
    updateDisplay(`Round ${currRound}: try "${currGuess}" (${possible.length} words left)`);
  });
}

function updateDisplay(msg) {
  statusDiv.html(msg.replace(/\n/g, "<br>"));
}

async function getWords() {
  let res = await fetch("https://gist.githubusercontent.com/dracos/dd0668f281e685bad51479e5acaadb93/raw/6bfa15d263d6d5b63840a8e5b64e04b382fdb079/valid-wordle-words.txt");
  let words = (await res.text()).trim().split("\n");
  
  return words;
}
