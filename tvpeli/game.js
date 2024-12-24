const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine', volume = 0.5) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type; // Äänityyppi: sine, square, triangle, sawtooth
  oscillator.frequency.value = frequency; // Äänen korkeus
  gainNode.gain.value = volume; // Äänenvoimakkuus

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration); // Kesto sekunteina
}

function playBounceSound() {
  playSound(300, 0.1, 'square'); // Matalampi ääni, lyhyt kesto
}

function playPaddleHitSound(player) {
  const frequency = player === 1 ? 600 : 500; // Pelaaja 1: korkea ääni, pelaaja 2: matala ääni
  playSound(frequency, 0.1, 'sine'); // Lyhyt kesto
}

function playScoreSound() {
  playSound(800, 0.2, 'triangle'); // Korkea ääni, hieman pidempi
}

function playResetSound() {
  const frequencies = [400, 450, 500, 550]; // Didididip: äänisarja
  const duration = 0.1; // Yhden äänen kesto
  let delay = 0; // Alkuviive

  frequencies.forEach((frequency) => {
    setTimeout(() => {
      playSound(frequency, duration, 'sine'); // Soita ääni
    }, delay);
    delay += duration * 1000; // Lisää viive seuraavaa ääntä varten
  });
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Aseta canvasille musta taustaväri
canvas.style.backgroundColor = 'black';
let ballColor = 'white'; // Alustetaan pallon väri valkoiseksi

// Kentän asetukset
const paddleHeightFactor = 9; // Configurable factor for paddle height
const paddleHeight = canvas.height / paddleHeightFactor;
const paddleWidth = 10;
const ballSize = 10;
const cmToPixels = 37.7952755906; // 1 cm = 37.7952755906 pixels
const paddleSpeed = 9 * cmToPixels / 60; // 5 cm/s, assuming 60 FPS
const ballSpeed = 6 * cmToPixels / 60; // 5 cm/s, assuming 60 FPS
const maxScore = 15; // Pisteraja

// Pelaajien alkutilat
let player1Y = canvas.height / 2 - paddleHeight / 2;
let player2Y = canvas.height / 2 - paddleHeight / 2 + 50; // Pelaaja 2 hieman pelaajaa 1 ylempänä

// Pallon alkutilat
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = ballSpeed;
let ballSpeedY = ballSpeed;

// Pelaajien pisteet
let scorePlayer1 = 0;
let scorePlayer2 = 0;
let lastTouch = null; // Seuraa, kumpi pelaaja koski viimeksi palloa
let playerHitBall = false; // Estää uudelleentarkistukset mailaan osumisen jälkeen

// Pelaajien värit
const player1Color = 'yellow';
const player2Color = 'magenta';

// Lataa numerokuviot
import { createDigitPatterns } from './digitPatterns.js';
const digits = createDigitPatterns();

// Piirrä numero 5x5-ruudukossa
function drawDigit(x, y, digit, color) {
  const size = 10; // Yksittäisen neliön koko
  const pattern = digits[digit];
  ctx.fillStyle = color;
  pattern.forEach((row, rowIndex) => {
    row.split('').forEach((cell, colIndex) => {
      if (cell === '1') {
        ctx.fillRect(x + colIndex * size, y + rowIndex * size, size, size);
      }
    });
  });
}

function getBallColor() {
  if (lastTouch === 1) return player1Color; // Pelaaja 1:n väri
  if (lastTouch === 2) return player2Color; // Pelaaja 2:n väri
  return 'white'; // Aloitus- tai resetointitilanne
}

// Piirrä kenttä
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Kentän rajat
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, 10); // Yläreuna
  ctx.fillRect(0, canvas.height - 10, canvas.width, 10); // Alareuna
  ctx.fillRect(canvas.width - 10, 0, 10, canvas.height); // Oikea seinä

  // Pelaajien mailat
  ctx.fillStyle = player1Color;
  ctx.fillRect(getPlayer1X(), player1Y, paddleWidth, paddleHeight); // Pelaaja 1

  ctx.fillStyle = player2Color;
  ctx.fillRect(getPlayer2X(), player2Y, paddleWidth, paddleHeight); // Pelaaja 2

  // Pallo
  ctx.fillStyle = getBallColor(); // Kutsutaan uutta funktiota
  ctx.fillRect(ballX, ballY, ballSize, ballSize);

  // Pelaajien pisteet
  drawDigit(100, 20, scorePlayer1, player1Color); // Pelaaja 1:n pisteet
  drawDigit(canvas.width - 140, 20, scorePlayer2, player2Color); // Pelaaja 2:n pisteet

  // Kehys kentän ympärille
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Pelaajien sijainti X-akselilla
function getPlayer1X() {
  return 20; // Kiinteä paikka pelaaja 1:lle
}

function getPlayer2X() {
  return 40; // Kiinteä paikka pelaaja 2:lle
}

// Liikuta mailoja
function movePaddles() {
  if (player1Move === -1 && player1Y > 10) player1Y -= paddleSpeed;
  if (player1Move === 1 && player1Y + paddleHeight < canvas.height - 10) player1Y += paddleSpeed;

  if (player2Move === -1 && player2Y > 10) player2Y -= paddleSpeed;
  if (player2Move === 1 && player2Y + paddleHeight < canvas.height - 10) player2Y += paddleSpeed;
}

// Tarkista rajat
function checkBoundary(y, size, lowerBound, upperBound) {
  return y <= lowerBound || y + size >= upperBound;
}

function awardPoint(player) {
  if (player === 1) {
    scorePlayer1++;
  } else if (player === 2) {
    scorePlayer2++;
  }
  playScoreSound(); // Generoi pisteen saamisääni

  // Tarkista, onko pisteraja saavutettu
  if (scorePlayer1 >= maxScore || scorePlayer2 >= maxScore) {
    isGameRunning = false; // Pysäytä peli
    resetBall(); // Resetoi pallo valmiiksi uuteen peliin
  }
}

// Liikuta palloa
function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Kimpoilu ylä- ja alareunasta
  if (checkBoundary(ballY, ballSize, 10, canvas.height - 10)) {
    ballSpeedY *= -1;
    playBounceSound(); // Generoi kimpoamisääni
  }

  // Kimpoilu pelaaja 1:n mailasta
  if (
    !playerHitBall &&
    ballX >= getPlayer1X() &&
    ballX <= getPlayer1X() + paddleWidth &&
    ballY + ballSize >= player1Y &&
    ballY <= player1Y + paddleHeight
  ) {
    if (lastTouch === 1) {
      // Pelaaja 1 osui kahdesti
      awardPoint(2); // Pelaaja 2 saa pisteen
      resetBall();
      return;
    }

    ballSpeedX *= -1;
    ballSpeedY += player1Move * 1.5; // Siirretään mailan nopeutta palloon (skaalattu)
    lastTouch = 1;
    playerHitBall = true;
    playPaddleHitSound(1); // Pelaaja 1:n osumaääni
  }

  // Kimpoilu pelaaja 2:n mailasta
  else if (
    !playerHitBall &&
    ballX >= getPlayer2X() &&
    ballX <= getPlayer2X() + paddleWidth &&
    ballY + ballSize >= player2Y &&
    ballY <= player2Y + paddleHeight
  ) {
    if (lastTouch === 2) {
      // Pelaaja 2 osui kahdesti
      awardPoint(1); // Pelaaja 1 saa pisteen
      resetBall();
      return;
    }

    ballSpeedX *= -1;
    ballSpeedY += player2Move * 1.5; // Siirretään mailan nopeutta palloon (skaalattu)
    lastTouch = 2;
    playerHitBall = true;
    playPaddleHitSound(2); // Pelaaja 2:n osumaääni
  }

  // Kimpoilu oikeasta seinästä
  if (ballX + ballSize >= canvas.width - 10) {
    ballSpeedX *= -1;
    playerHitBall = false; // Salli jälleen mailan osumat
    playBounceSound(); // Generoi kimpoamisääni
  }

  // Tarkista, onko pallo mennyt ulos vasemmasta reunasta
  if (ballX < 0) {
    if (lastTouch === 1) {
      awardPoint(1); // Pelaaja 1 saa pisteen
    } else if (lastTouch === 2) {
      awardPoint(2); // Pelaaja 2 saa pisteen
    }
    playScoreSound(); // Generoi pisteen saamisääni
    resetBall();
  }
}

// Resetoi pallo
function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = ballSpeed;
  ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * Math.abs(ballSpeedY);

  lastTouch = null;
  playerHitBall = false; // Nollaa tila, jotta uusi osuma on mahdollinen

  playResetSound(); // Soita resetointiääni
}

function drawMessage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';

  if (scorePlayer1 >= maxScore) {
    ctx.fillText('Pelaaja 1 voitti!', canvas.width / 2, canvas.height / 2 - 20);
  } else if (scorePlayer2 >= maxScore) {
    ctx.fillText('Pelaaja 2 voitti!', canvas.width / 2, canvas.height / 2 - 20);
  } else {
    ctx.fillText('Pelaaja 1 - w / s napit. Pelaaja 2 - p / l.', canvas.width / 2, canvas.height / 2);
  }

  if (scorePlayer1 >= maxScore || scorePlayer2 >= maxScore) {
    ctx.fillText('Paina mitä tahansa näppäintä aloittaaksesi uuden pelin', canvas.width / 2, canvas.height / 2 + 20);
  }
}

// Pääsilmukka
let lastFrameTime = performance.now();
const targetFrameDuration = 1000 / 60; // 1/60 sekuntia
let isGameRunning = false; // Aluksi peli ei ole käynnissä

function gameLoop(currentTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!isGameRunning) {
     drawMessage(); // Näytä aloitus- tai voittoviesti tilanteen mukaan
  } else {
    // Päivitä ja piirrä peli, kun peli on käynnissä
    movePaddles();
    moveBall();
    draw();
  }

  requestAnimationFrame(gameLoop);
}

// Näppäinten käsittely
let player1Move = 0;
let player2Move = 0;
let keysAreReleased = true; // Oletuksena kaikki näppäimet ovat ylhäällä

document.addEventListener('keydown', (e) => {
  if (!isGameRunning && keysAreReleased) {
    // Nollaa pisteet uuden pelin alkaessa
    scorePlayer1 = 0;
    scorePlayer2 = 0;
    isGameRunning = true; // Käynnistä peli
    return;
  }

  // Ohjaa pelaajien liikettä
  if (e.key === 'w') player1Move = -1;
  if (e.key === 's') player1Move = 1;
  if (e.key === 'p') player2Move = -1;
  if (e.key === 'l') player2Move = 1;

  keysAreReleased = false; // Tallenna, että jokin näppäin on painettuna
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'w' || e.key === 's') player1Move = 0;
  if (e.key === 'p' || e.key === 'l') player2Move = 0;

  // Tarkista, ovatko kaikki näppäimet ylhäällä
  const isAnyKeyDown = Object.values(player1Move).includes(-1) || Object.values(player2Move).includes(1);
  keysAreReleased = !isAnyKeyDown;
});


// Käynnistä peli
requestAnimationFrame(gameLoop);
