
function runMarchingSquaresOpt(array, w, h) {
  outlinePoints = MarchingSquaresOpt.getBlobOutlinePoints(array, w, h);  // returns [x1,y1,x2,y2,x3,y3... etc.]
  console.log(outlinePoints);
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}


let cvs = document.getElementById("canvas");
let birbCanvas = document.getElementById("birb");
let ctx = cvs.getContext("2d");
let birbCtx = cvs.getContext("2d");


let bird = document.getElementById("bird");
let bg = document.getElementById("bg");
let fg = document.getElementById("fg");
let pipeNorth = document.getElementById("pipe-north");
let pipeSouth = document.getElementById("pipe-south");

// some variables
const CLIMB_FRAMES = -8;
const GLIDE_FRAMES = 10;
const BASE_GRAVITY = 2;
const gap = 100;
const pipespacingMax = 140;
const pipespacingMin = 120;
const gameSpeed = 2;
const bX = 35;
let bY = 150;

let started = false;
let score = 0;
let loop;
// draw images
let currentFrame = 0;

// pipe coordinates

const getNextPipe = ()=>{
  return ({
    x: cvs.width,
    y: getRandomInt(pipeNorth.height) - pipeNorth.height,
  })
}
let pipe = [getNextPipe()];

let fly = new Audio();
let scor = new Audio();
fly.src = "sounds/fly.mp3";
scor.src = "sounds/score.mp3";

let angleInDegrees = 0;
// on key down
document.addEventListener("keydown", () => {
  if (!started) {
    started = true;
    start();
  } else {
    fly.pause();
    scor.pause();
    fly.currentTime = 0;
    fly.play();
    currentFrame = CLIMB_FRAMES;
  }
});


function draw() {
  const ground = cvs.height - fg.height;
  const absAngle = Math.abs(angleInDegrees);

  ctx.drawImage(bg, 0, 0);
  if (pipe.length > 5){
    pipe.shift()
  }
  pipe.forEach((currentPipe, i)=>{
    let southPipeY = pipeNorth.height + gap;
    currentPipe.meta = {
      north: currentPipe.y,
      south: currentPipe.y + southPipeY 
    }

    ctx.drawImage(pipeNorth, currentPipe.x, currentPipe.meta.north);
    ctx.drawImage(pipeSouth, currentPipe.x, currentPipe.meta.south);

    currentPipe.x -= gameSpeed;

    if (currentPipe.x == (pipespacingMax + gameSpeed)) {
      pipe.push(getNextPipe());
    }
    if (currentPipe.x == 10) {
      score++;
      started && scor.play();
    }
    // detect collision
    const birbTop = (bY) - (absAngle ? Math.floor(absAngle/10) : 0);
    const birbBottom = (bY + bird.height) + (absAngle ? Math.ceil(absAngle/10) : 0);
    const birbRight = (bX + bird.width) - (absAngle ? Math.ceil(absAngle/10) : 0);
    const birbLeft = (bX) + (absAngle ? Math.ceil(absAngle/10) : 0);
    const hasFallen = !birbBottom || (birbBottom >= ground);
    if (hasFallen) {
      started = false;
      reset()
    }
    if (currentPipe.x < birbLeft && (currentPipe.x + pipeNorth.width) > birbRight) {
      console.log("checking collision")
      const touchingTop = birbTop <= currentPipe.y + pipeNorth.height;
      const touchingBottom = birbBottom >= currentPipe.y + southPipeY;
      if (touchingBottom || touchingTop) {
        console.log("touchingTop", touchingTop)
        console.log("touchingBottom", touchingBottom)
        started = false;
        reset()
      }
    }
  })

  ctx.drawImage(fg, 0, cvs.height - fg.height);

  ctx.fillStyle = "#000";
  ctx.font = "20px Verdana";
  ctx.fillText("Score : " + score, 10, cvs.height - 20);
  if (!started) {
    const bannerHeight = Math.floor(cvs.height / 2);
    ctx.fillText("Press any key to flap", 10, bannerHeight);
    ctx.fillText(`High Score: ${localStorage.getItem("high-score")}`, 10, bannerHeight + 24);
  }
  ctx.save();

  if (!started) {
    //let AI play
    const nearestPipe = pipe.find((p)=> p.x > -10) || {};
    const enoughToClear = (bY + bird.height) + (absAngle ? Math.ceil(absAngle/10) : 0) + randomIntFromInterval(0, 7);
    if (nearestPipe.meta && enoughToClear > nearestPipe.meta.south && currentFrame > 0) {
      currentFrame = CLIMB_FRAMES;
    }
  }

  if (currentFrame < 0) {
    angleInDegrees = Math.floor(currentFrame * 10);
    bY += (-BASE_GRAVITY + currentFrame);
    currentFrame++;
  } else {
    if (currentFrame < GLIDE_FRAMES) {
      angleInDegrees = 0;
    } else {
      angleInDegrees = Math.min(45, currentFrame * 2);
      bY += Math.ceil((currentFrame / GLIDE_FRAMES ) + BASE_GRAVITY);;
    }
    currentFrame++;
  }
  
  const adjustX = Math.floor(bird.width / 2);
  const adjustY = Math.floor(bird.height / 2);

  ctx.translate(bX + adjustX, bY + adjustY);
  ctx.rotate((angleInDegrees * Math.PI) / 180);
  ctx.drawImage(bird, -adjustX, -adjustY);
  ctx.restore();
}

const reset = () => { 
  const highScore = parseInt(localStorage.getItem("high-score"))   || 0;
  localStorage.setItem('high-score', Math.max(highScore, score))
  score = 0;
  angleInDegrees = 0;
  currentFrame = 0;
  bY = 150;
  pipe = [getNextPipe()];
}

const start = ()=>{
  reset()
  clearInterval(loop)
  //60 FPS
  loop = setInterval(()=> draw(), 16)
}

start()