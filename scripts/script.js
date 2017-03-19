// speeds up on 5th, 9th and 13th step
// WIN AT 20 STEPS - notification and game starts over
//

// ####### GLOBAL VARS #######

var gamePower = false;
var strictMode = false;
var currentState = new GameState();
var tileInterval;

// ####### DOM ELEMENTS #######
var sliderOnOff = document.querySelector('.slider-outer');
var startBtn = document.querySelector('.start-btn');
var strictBtn = document.querySelector('.strict-btn');
var digCounter = document.querySelector('.dig-disp');
var greenTile = document.querySelector('#green-tile');
var redTile = document.querySelector('#red-tile');
var yellTile = document.querySelector('#yellow-tile');
var blueTile = document.querySelector('#blue-tile');
var allTiles = document.querySelectorAll('.tile');


// ####### GameState #######

function GameState() {
  this.level = 1;
  this.btnPressedCount = 0;
  this.gameActive = false;
  this.randSeq = [];
  this.userSeq = [];

  //generate 20 numbers for randSeq
  this.generateNums = function(){
    var i = 0;
    while(i < 20) {
      var randArr = this.randSeq;
      randArr.push(randomNum());
      i++;
    }
  },

  //resets the game
  this.resetGame = function() {
    this.level = 1;
    this.btnPressedCount = 0;
    this.userSeq = [];
    this.randSeq = [];
    this.generateNums();
    setTimeout(runTileSeq, 2000);
    return;
  },

  //toggles the strict mode
  this.toggleStrict = function(){
    this.strict = (this.strict === false) ? true : false;
  }
}//end GameState

// ####### HELPER FUNCTIONS #######

//generates random number
function randomNum(){
  var min = Math.ceil(1);
  var max = Math.floor(4);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//toggles '--' in Count box upon start
function flashDashes(){
  digCounter.textContent = digCounter.textContent === '--' ? '' : '--';
}

//flashesExclamation when error occurs
function flashError(){
  digCounter.textContent = digCounter.textContent === '!!!' ? '' : '!!!';
}

//compares two arrays
function doArrsMatch(arr1, arr2){
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (var i=0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}


// ####### EVENT HANDLERS #######


//audio play
function playAudio(tile) {
  var allSound = document.querySelector('audio');
  var sound = document.querySelector('.audio-' + tile);

  if (!sound.paused) {
    sound.load()
    sound.play();
  } else {
    sound.play();
  }
}

//toggles power on and off
function togglePower(){
  var sliderInner = document.querySelector('.slider-inner');

  if (gamePower) {
    sliderInner.classList.remove('slider-right');
    clearInterval(tileInterval);
    gamePower = false;
    currentState.gameActive = false;
    currentState.level = 1;
    currentState.btnPressedCount = 0;
    currentState.userSeq = [];
    currentState.randSeq = [];
    digCounter.textContent = '';
  } else {
    sliderInner.classList.add('slider-right');
    gamePower = true;
    flashDashes();
  }
}

//enters strict mode
function enterStrict(){
  var strictLight = document.querySelector('.strict-light');

  if (strictMode) {
    strictMode = false;
    strictLight.classList.remove('str-light-on');
  } else {
    strictMode = true;
    strictLight.classList.add('str-light-on');

  }
}

function speedOfGame(){
  if (currentState.level < 5) {
    return 1200;
  } else if (currentState.level < 9) {
    return 1000;
  } else if (currentState.level < 13) {
    return 800;
  } else {
    return 600;
  }
}

//flashes the count display on start
function counterFlash(flashType){
  var callCount = 0;
  flashType();
  var flasher = setInterval(function(){
    if (callCount < 3) {
      flashType();
      callCount++;
    } else {
      clearInterval(flasher);
    }
  }, 400);
}

//lights up tile on mousedown
function lightUpTile(e){
  var tileClass = e.target.classList[1];
  var tileNum = e.target.attributes['data-num'].value;
  var selectedTile = document.querySelector('.' + tileClass);

  selectedTile.classList.add('flash-' + tileNum);
}

//turns off tile on mouseup
function turnOffTile(e) {
  var tileClass = e.target.classList[1];
  var tileNum = e.target.attributes['data-num'].value;
  var selectedTile = document.querySelector('.' + tileClass);
  
  selectedTile.classList.remove('flash-' + tileNum);
}

//Executes when user clicks wrong tile
function madeAnError(){

  counterFlash(flashError);

  if (strictMode) {
    currentState.resetGame();
  } else {
    removeColorTileEvents();
    currentState.btnPressedCount = 0;
    currentState.userSeq = [];
    setTimeout(runTileSeq, 1500);
  }
  
}

//Executes when user wins level
function passedLevel(){

  currentState.level++;
  removeColorTileEvents();
  //check if win and gameover
  if (currentState.level === 21) {
    digCounter.textContent = "WIN!";
    setTimeout(currentState.resetGame(), 1500);
  }
  currentState.btnPressedCount = 0;
  currentState.userSeq = [];
  setTimeout(runTileSeq, 1500);
}

//flashes the tile during simon sequence
function runTileSeq(){
  var sequenceCounter = 0;
  var flashDuration = speedOfGame();
  var lengthOfSequence = (flashDuration * currentState.level) + flashDuration;

  digCounter.textContent = currentState.level;
  tileInterval = setInterval(function(){

    var tileNum = currentState.randSeq[sequenceCounter];
    var tile = document.querySelector('[data-num="' + tileNum + '"]');
    if (sequenceCounter < currentState.level) {
      playAudio(tileNum);
      tile.classList.add('flash-' + tileNum);
      setTimeout(function(){tile.classList.remove('flash-' + tileNum)}, flashDuration / 2);
      sequenceCounter++;
    } else {
      clearInterval(tileInterval);
    }
  }, flashDuration);
  setTimeout(addColorTileEvents, lengthOfSequence);
}

//event for when tile pressed
function tileClicker(e){
  var target = e.target;
  var tilePressed = target.attributes['data-num'].value;
  var randArr = currentState.randSeq;
  var userArr = currentState.userSeq;

  currentState.btnPressedCount++;

  var btnCount = currentState.btnPressedCount;
  var randArrSlice = randArr.slice(0, btnCount); //array through just the number of button presses 
  var randArrLevel = randArr.slice(0, currentState.level); //array for whole level

  userArr.push(parseInt(tilePressed));
  lightUpTile(e);
  playAudio(tilePressed);
  if (!doArrsMatch(userArr, randArrSlice)) {
    madeAnError();
  } 
  else if (doArrsMatch(userArr, randArrLevel)){
    passedLevel();
  }
}

//Sets up the game.
function startGm(){
  var timeOutStart = 1800;

  if (gamePower && !currentState.gameActive) {
    currentState.generateNums();
    currentState.gameActive = true;
    counterFlash(flashDashes);
    setTimeout(runTileSeq, timeOutStart);
  }
  else if (gamePower && currentState.gameActive) {
    clearInterval(tileInterval);
    currentState.resetGame();
  }
}

// ####### EVENT LISTENERS #######

function addColorTileEvents(){
  allTiles.forEach(function(item){
    item.addEventListener('mousedown', tileClicker);
    item.addEventListener('mouseup', turnOffTile);
    item.classList.add('has-pointer');
  });
}

function removeColorTileEvents(){
  allTiles.forEach(function(item){
    item.removeEventListener('mousedown', tileClicker);
    item.addEventListener('mouseup', turnOffTile);
    item.classList.remove('has-pointer');
  })
}

sliderOnOff.addEventListener('click', togglePower);
startBtn.addEventListener('click', startGm);
strictBtn.addEventListener('click', enterStrict);





