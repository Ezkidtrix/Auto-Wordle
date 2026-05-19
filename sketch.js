// noprotect
let input, submitBtn, resetBtn, statusDiv, words = [];
let processing = false, currRound = 1, currGuess = "raise";

function setup() {
  createCanvas(windowWidth, windowHeight);
  elements();
}

function draw() {
  background(75, 200, 125);
  
  fill(255);
  noStroke();
  
  rectMode("center");
  rect(width / 2 + 2.5, height / 2, 220, 160, 20);
}

async function elements() {
  input = createInput("");
  input.attribute("maxlength", "5");
  input.attribute("placeholder", "(ex. gbyyb)");
  input.size(165, 35);
  input.position(width / 2 - input.width / 2, height / 2 - input.height / 2 - 55);
  input.style("background", "white");
  input.style("border", "2px solid rgb(0, 0, 0, 0.25)");
  input.style("border-radius", "10px");
  input.style("color", "black");
  input.style("font-size", "20px");
  input.style("font-family", "sans-serif");
  input.style("text-align", "center");
  input.elt.addEventListener("keydown", e => {
    let k = e.key.toLowerCase();
    let validKeys = ["g", "y", "b", "backspace", "enter"];
    
    if (k === "r") reset();
    if (k === "escape") {
      if (possible.length === 1) return;
      possible.splice(possible.indexOf(currGuess), 1);
      
      findBest(words, possible, best => {
        currGuess = best;
        updateDisplay(`Round ${currRound}: try "${currGuess}"<br>(${possible.length} words left)`);
      });
    }
    
    if (!validKeys.includes(k)) {
      e.preventDefault();
      return;
    }
    if (k === "enter" && input.value().length === 5) processFeedback();
  })
  
  submitBtn = createButton("Submit");
  submitBtn.size(80, 35);
  submitBtn.position(width / 2 - submitBtn.width / 2 - 45, height / 2 - submitBtn.height / 2 - 7.5);
  submitBtn.style("overflow", "hidden");
  submitBtn.style("background", "transparent");
  submitBtn.style("border", "2px solid rgb(0, 0, 0, 0.2)");
  submitBtn.style("border-radius", "10px");
  submitBtn.style("color", "black");
  submitBtn.style("font-size", "20px");
  submitBtn.style("font-family", "sans-serif");
  submitBtn.style("text-align", "center");
  submitBtn.mousePressed(processFeedback);
  
  resetBtn = createButton("Reset");
  resetBtn.size(80, 35);
  resetBtn.position(width / 2 - resetBtn.width / 2 + 45, height / 2 - resetBtn.height / 2 - 7.5);
  resetBtn.style("overflow", "hidden");
  resetBtn.style("background", "transparent");
  resetBtn.style("border", "2px solid rgb(0, 0, 0, 0.2)");
  resetBtn.style("border-radius", "10px");
  resetBtn.style("color", "black");
  resetBtn.style("font-size", "20px");
  resetBtn.style("font-family", "sans-serif");
  resetBtn.style("text-align", "center");
  resetBtn.mousePressed(reset);
  
  statusDiv = createDiv("");
  statusDiv.size(200, 50);
  statusDiv.position(width / 2 - statusDiv.width / 2, height / 2 - statusDiv.height / 2 + 40);
  statusDiv.style("overflow", "hidden");
  statusDiv.style("background", "transparent");
  statusDiv.style("border", "2px solid rgb(0, 0, 0, 0.2)");
  statusDiv.style("border-radius", "10px");
  statusDiv.style("color", "black");
  statusDiv.style("font-size", "20px");
  statusDiv.style("font-family", "sans-serif");
  statusDiv.style("text-align", "center");
  
  words = await getWords();
  startSolving();
}

function reset() {
  if (processing) return;
  currGuess = "raise";

  input.value("");
  startSolving();
}

function startSolving() {
  currRound = 1;
  
  updateDisplay(`Initializing...`);
  possible = [...words];
  
  updateDisplay(`Round ${currRound}: try "${currGuess}"<br>(${possible.length} words left)`);
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
    updateDisplay(`Round ${currRound}: try "${currGuess}"<br>(${possible.length} words left)`);
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
