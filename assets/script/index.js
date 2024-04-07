'use strict';

import * as utils from './utils.js'
import words from './words.js';

// Variables and Constants
const displayedWord = utils.getElement('word-display');
const scoreOutput = utils.getElement('score-output');
const input = utils.getElement('user-input');
const startButton = utils.getElement('start-button');
const stopButton = utils.getElement('stop-button');
const leaderBoard = utils.getElement('leader-board');
const leaderBoardButton = utils.getElement('leader-board-button');
const playArea = utils.getElement('play-area');
const timerDuration = 99;
let timeRemaining = timerDuration;
let timerInterval;
const timerElement = utils.getElement('timer');
const timeRemainingSpan = utils.getElement('time-remaining');
let currentScore = utils.getElement('current-score');
let startingScore = 0;
let shuffledArray = randomizeWords();
let inputIsVisible = false;
let gameRunning = false;
let sound;
let backgroundSound;
let playerHits = 0;
let playerPercentage = 0;

class CustomDate {
  constructor() {
    this.currentDate = new Date();
  }

  getCurrentDate() {
    const day = this.currentDate.getDate();
    const month = this.currentDate.getMonth() + 1;
    return `${day}/${month}`;
  }
}

let thisDay = new CustomDate();

// Define the Score class
class Score {
  constructor(hits, playerPercentage, thisDay) {
    this.hits = hits;
    this.percentage = playerPercentage;
    this.thisDay = thisDay;

  }

  getHits() {
    return `${this.hits}`;
  }

  getPercentage() {
    return `${this.percentage}`;
  }

  getThisDay() {
    return `${this.thisDay}`;
  }
}

// Retrieve scores from local storage
let scoresArray = JSON.parse(localStorage.getItem('scores')) || [];

// Function to create ul and li elements from scores
function createScoreList(scores) {
  const ul = document.createElement('ul');
  scores.forEach((score, index) => {
    const li = document.createElement('li');
    li.classList.add('flex');
    li.innerHTML = `
      <p>${score.thisDay}</p>
      <p class="bold">${score.hits}</p>
      <p>${score.percentage}%</p>
    `;
    ul.appendChild(li);
  });

  return ul.outerHTML; // Return the outerHTML of the ul
}

// Initialize scores
const scores = scoresArray.map(score => new Score(score.hits, score.percentage, score.thisDay));
console.log()

// Create HTML elements and set innerHTML of scoreOutput
const scoresListHTML = createScoreList(scores);
scoreOutput.innerHTML = scoresListHTML;
scoreOutput.classList.add('scores-list');


// Sound on page load
utils.listen('DOMContentLoaded', document, () => {
  startbackgroundAudio();
});

// Start game
utils.listen('click', startButton, () => {
  toogleStopButton();
  toggleInputArea();
  resetGame(); // Reset game, timer, and sound
  startGame();
  startSound();
  startbackgroundAudio();
  displayWord();
});

// End game
utils.listen('click', stopButton, () => {
  toogleStartButton();
  toggleInputArea();
  endGame();
  stopTimer();
  createScoreList(scoresArray);
  //startbackgroundAudio();
});

utils.listen('click', leaderBoardButton, () => {
  if(!gameRunning){
    tooglePlayArea();
    toogleLeaderBoard()
  }
});

utils.listen('input', input, () => {
  checkInput();
});

function randomizeWords() {
  return words.sort(() => Math.random() - 0.5);
}

function startGame() {
  inputIsVisible = true;
  timeRemaining = timerDuration; // Reset time remaining
  timeRemainingSpan.textContent = timeRemaining;
  timerInterval = setInterval(() => {
    timeRemaining--;
    timeRemainingSpan.textContent = timeRemaining;
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerElement.textContent = 'Time\'s up!';
      gameEnded();
      startbackgroundAudio()
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timeRemaining = timeRemaining;
  timeRemainingSpan.textContent = timeRemaining;
}

function startSound() {
  if (sound) { // Check if sound is already playing
    sound.pause(); // Pause the sound if it's playing
    sound.currentTime = 0; // Reset playback to the beginning
  }
  sound = new Audio('./assets/media/alarm.mp3');
  sound.loop = true;
  sound.play();
}

function startbackgroundAudio() {
  backgroundSound = new Audio('./assets/media/background-music.mp3');
  backgroundSound.loop = true;
  backgroundSound.play();
}

function displayWord() {
  displayedWord.textContent = shuffledArray[0];
}

function toggleInputArea() {
  if (inputIsVisible) {
    input.classList.toggle('visible');
    inputIsVisible = false;
  } else {
    input.classList.toggle('visible');
    inputIsVisible = true;
  }
}


function checkInput() {
  let gotAMatch = displayedWord.textContent === input.value;
  if (gotAMatch) {
    updateWord();
    updateScore();
    clearInput();
    updateHitsAndPercentage();
  }
}

function updateWord() {
  if (shuffledArray.length >= 1) {
    shuffledArray.shift();
    displayedWord.textContent = shuffledArray[0];
  } else {
    gameEnded();
    displayedWord.textContent = 'You\'ve beat the game!';
  }
}

function updateScore() {
  currentScore.textContent++;
}

function updateHitsAndPercentage() {
  playerHits++;
  playerPercentage = ((playerHits / words.length) * 100).toFixed(2);
  console.log(playerPercentage)
}

function clearInput() {
  input.value = '';
}

// Reset game, timer, and sound
function resetGame() {
  clearInterval(timerInterval);
  timerElement.textContent = '';
  if (sound) {
    sound.pause(); // Pause the sound if it's playing
    sound.currentTime = 0; // Reset playback to the beginning
  }
  currentScore.textContent = startingScore;
  shuffledArray = randomizeWords();
  playerHits = 0; // Reset player hits
  playerPercentage = 0; // Reset player percentage
}

// Update scores array
function updateScores() {
  playerHits = playerHits;
  const currentDate = thisDay.getCurrentDate(); // Get the current date
  const scoreObj = { hits: playerHits, percentage: playerPercentage, thisDay: currentDate }; // Include the current date in the score object
  scoresArray.push(scoreObj);
  scoresArray.sort((a, b) => b.hits - a.hits); // Sort scores by hits
  if (scoresArray.length > 9) {
    scoresArray.splice(9); // Keep only top 9 scores
  }
  localStorage.setItem('scores', JSON.stringify(scoresArray)); // Store scores in localStorage

}

// End Game
function endGame() {
  inputIsVisible = false;
  if (sound) {
    sound.pause(); // Pause the sound if it's playing
    sound.currentTime = 0; // Reset playback to the beginning
    console.log(scoresArray);
  }
  updateScores(); // Call the function to update scores array and store in local storage
}

let leaderboardIsVisible = false;
function toogleLeaderBoard() {
  if (!leaderboardIsVisible){
    leaderBoard.classList.add('isvisible');
    leaderboardIsVisible = true;
  } else {
    leaderBoard.classList.remove('isvisible');
    leaderboardIsVisible = false;
  }
}

let playAreaisVisible = true; //play area visible at default
function tooglePlayArea() {
  if (!playAreaisVisible) {
    playArea.classList.add('isvisible');
    playAreaisVisible = true;
  }else {
    playArea.classList.remove('isvisible');
    playAreaisVisible = false;
  }
}

function toogleStopButton() {
  startButton.classList.remove('isvisible');
  stopButton.classList.add('isvisible');
  gameRunning = true;
}

function toogleStartButton() {
  stopButton.classList.remove('isvisible');
  startButton.classList.add('isvisible');
  gameRunning = false;
}

