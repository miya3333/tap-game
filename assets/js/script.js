// --- CONFIGURATION ---
const GRID_SIZE = 8; // UBAH JADI 8x8
const STEP_DELAY_MS = 300;

// DOM ELEMENTS
const board = document.getElementById('board');
const player = document.getElementById('player');
const target = document.getElementById('target');
const scoreEl = document.getElementById('score-board');
const highScoreEl = document.getElementById('high-score-board');
const bestTimeLbl = document.getElementById('best-time-lbl');
const timeSelect = document.getElementById('timeSelect');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const pausedScreen = document.getElementById('pausedScreen');
const finalScoreEl = document.getElementById('final-score');
const gravityControls = document.getElementById('gravityControls');
const btnRotateLeft = document.getElementById('btnRotateLeft');
const btnRotateRight = document.getElementById('btnRotateRight');
const modeStd = document.getElementById('modeStd');
const modeGrav = document.getElementById('modeGrav');
let timerDisplayEl = document.getElementById('timer-display');

// --- STATE ---
let state = {
    player: { x: 0, y: 0 },
    target: { x: 4, y: 4 }, // Target default agak tengah
    score: 0,
    isPlaying: false,
    isPaused: false,
    isMoving: false,
    mode: 'standard',
    rotation: 0,
    timeLimit: 10,
    timeLeft: 10
};

let highScores = { '10': 0, '20': 0, '30': 0, '40': 0, '50': 0, '60': 0 };
let gravityTimer = null;
let gameInterval = null;

// --- INIT ---
function initGrid() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(c => c.remove());

    // Generate Grid 8x8
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            board.insertBefore(cell, target);
        }
    }

    updateTimeConfig();
    updatePlayerPos();
    spawnTargetLogic();
    gameOverScreen.classList.remove('active');
    pausedScreen.classList.remove('active');
}

function updateTimeConfig() {
    if (state.isPlaying) return;
    timerDisplayEl = document.getElementById('timer-display');
    const selectedTime = timeSelect.value;
    state.timeLimit = parseInt(selectedTime);
    state.timeLeft = state.timeLimit;
    if (timerDisplayEl) timerDisplayEl.innerText = state.timeLimit;
    bestTimeLbl.innerText = selectedTime + 's';
    highScoreEl.innerText = highScores[selectedTime] || 0;
}

// --- GAME FLOW ---
function startGame() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    state.isPaused = false;
    state.score = 0;
    state.timeLeft = state.timeLimit;
    scoreEl.innerText = "0";
    timerDisplayEl = document.getElementById('timer-display');
    if (timerDisplayEl) timerDisplayEl.innerText = state.timeLeft;

    gameOverScreen.classList.remove('active');
    pausedScreen.classList.remove('active');

    startBtn.disabled = true; startBtn.style.opacity = "0.5"; startBtn.innerText = "PLAYING...";
    timeSelect.disabled = true;
    pauseBtn.disabled = false; stopBtn.disabled = false; pauseBtn.innerText = "PAUSE";

    state.player.x = 0; state.player.y = 0;

    state.rotation = 0;
    board.style.transform = `rotateZ(0deg)`;

    updatePlayerPos();
    spawnTargetLogic();

    if (state.mode === 'gravity') {
        startGravitySequence();
    }
    startTimer();
}

function startTimer() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        state.timeLeft--;
        const display = document.getElementById('timer-display');
        if (display) display.innerText = state.timeLeft;
        if (state.timeLeft <= 0) endGame();
    }, 1000);
}

function togglePause() {
    if (!state.isPlaying) return;
    state.isPaused = !state.isPaused;
    if (state.isPaused) {
        clearInterval(gameInterval);
        stopGravity();
        pausedScreen.classList.add('active');
        pauseBtn.innerText = "RESUME";
    } else {
        startTimer();
        pausedScreen.classList.remove('active');
        pauseBtn.innerText = "PAUSE";
        if (state.mode === 'gravity') startGravitySequence();
    }
}

function stopGame() {
    state.isPlaying = false;
    state.isPaused = false;
    clearInterval(gameInterval);
    stopGravity();
    scoreEl.innerText = "0";
    gameOverScreen.classList.remove('active');
    pausedScreen.classList.remove('active');

    startBtn.disabled = false; startBtn.style.opacity = "1"; startBtn.innerText = "START GAME";
    timeSelect.disabled = false; pauseBtn.disabled = true; stopBtn.disabled = true; pauseBtn.innerText = "PAUSE";

    updateTimeConfig();
    state.player.x = 0; state.player.y = 0;
    state.rotation = 0;
    board.style.transform = `rotateZ(0deg)`;
    updatePlayerPos();
}

function endGame() {
    state.isPlaying = false;
    clearInterval(gameInterval);
    stopGravity();
    const currentLimitStr = state.timeLimit.toString();
    if (state.score > highScores[currentLimitStr]) {
        highScores[currentLimitStr] = state.score;
        highScoreEl.innerText = state.score;
    }
    finalScoreEl.innerText = state.score;
    gameOverScreen.classList.add('active');

    startBtn.disabled = false; startBtn.style.opacity = "1"; startBtn.innerText = "START GAME";
    timeSelect.disabled = false; pauseBtn.disabled = true; stopBtn.disabled = true;
}

// --- GRAVITY & MOVEMENT ---
function setGameMode(mode) {
    state.mode = mode;
    stopGravity();
    if (mode === 'gravity') {
        gravityControls.classList.add('active');
        if (state.isPlaying && !state.isPaused) startGravitySequence();
    } else {
        gravityControls.classList.remove('active');
        state.rotation = 0;
        board.style.transform = `rotateZ(0deg)`;
    }
}

function stopGravity() {
    if (gravityTimer) { clearTimeout(gravityTimer); gravityTimer = null; }
}

function rotateBoardAction(deg) {
    if (!state.isPlaying || state.isPaused) return;
    state.rotation += deg;
    board.style.transform = `rotateZ(${state.rotation}deg)`;
    stopGravity();
    gravityTimer = setTimeout(() => { startGravitySequence(); }, 300);
}

function startGravitySequence() {
    if (!state.isPlaying || state.isPaused) return;
    let angle = state.rotation % 360;
    if (angle < 0) angle += 360;

    let dx = 0, dy = 0;
    if (angle === 0) { dx = 0; dy = 1; }
    if (angle === 90) { dx = 1; dy = 0; }
    if (angle === 180) { dx = 0; dy = -1; }
    if (angle === 270) { dx = -1; dy = 0; }

    processGravityStep(dx, dy);
}

function processGravityStep(dx, dy) {
    if (!state.isPlaying || state.isPaused || state.timeLeft <= 0) {
        stopGravity();
        return;
    }
    const moved = stepPlayer(dx, dy);
    if (moved) {
        gravityTimer = setTimeout(() => { processGravityStep(dx, dy); }, STEP_DELAY_MS);
    } else {
        stopGravity();
    }
}

function stepPlayer(dx, dy) {
    if (state.timeLeft <= 0 || state.isPaused) return false;
    const newX = state.player.x + dx;
    const newY = state.player.y + dy;
    if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
        state.player.x = newX; state.player.y = newY;
        updatePlayerPos();
        checkCollision();
        return true;
    }
    return false;
}

function updatePlayerPos() {
    player.style.setProperty('--x', state.player.x);
    player.style.setProperty('--y', state.player.y);
}

// KEYBOARD HANDLING (AXIS LOCK + RESPONSIVE)
let keysPressed = {};

document.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true;
    processInput();
});

document.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;
});

function processInput() {
    if (!state.isPlaying) return;
    if (state.mode === 'gravity') return;
    if (state.isMoving) return;

    let dx = 0;
    let dy = 0;

    if (keysPressed['ArrowUp']) dy = -1;
    else if (keysPressed['ArrowDown']) dy = 1;
    else if (keysPressed['ArrowLeft']) dx = -1;
    else if (keysPressed['ArrowRight']) dx = 1;

    if (dx !== 0 || dy !== 0) {
        const moved = stepPlayer(dx, dy);
        if (moved) {
            state.isMoving = true;
            setTimeout(() => {
                state.isMoving = false;
                processInput();
            }, 100);
        }
    }
}

// TAP/CLICK TO MOVE
async function autoWalkTo(destX, destY) {
    if (!state.isPlaying || state.isPaused) return;
    if (state.mode === 'gravity') return;
    if (state.isMoving) return;

    state.isMoving = true;
    while ((state.player.x !== destX || state.player.y !== destY) && state.isPlaying && !state.isPaused) {
        let dx = 0; let dy = 0;
        if (state.player.x < destX) dx = 1; else if (state.player.x > destX) dx = -1;
        else if (state.player.y < destY) dy = 1; else if (state.player.y > destY) dy = -1;
        stepPlayer(dx, dy);
        await new Promise(r => setTimeout(r, 80));
    }
    state.isMoving = false;
}

function checkCollision() {
    if (state.player.x === state.target.x && state.player.y === state.target.y) {
        state.score++;
        scoreEl.innerText = state.score;
        target.style.setProperty('--scale', '0');
        setTimeout(() => { spawnTargetLogic(); }, 200);
    }
}

function spawnTargetLogic() {
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * GRID_SIZE); newY = Math.floor(Math.random() * GRID_SIZE);
    } while (newX === state.player.x && newY === state.player.y);
    state.target.x = newX; state.target.y = newY;
    target.classList.add('instant-move');
    target.style.setProperty('--x', state.target.x); target.style.setProperty('--y', state.target.y);
    void target.offsetWidth; target.classList.remove('instant-move');
    requestAnimationFrame(() => { target.style.setProperty('--scale', '1'); });
}

// LISTENERS
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
stopBtn.addEventListener('click', stopGame);
timeSelect.addEventListener('change', updateTimeConfig);
modeStd.addEventListener('change', () => setGameMode('standard'));
modeGrav.addEventListener('change', () => setGameMode('gravity'));
btnRotateLeft.addEventListener('click', () => rotateBoardAction(-90));
btnRotateRight.addEventListener('click', () => rotateBoardAction(90));

board.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (cell) { autoWalkTo(parseInt(cell.dataset.x), parseInt(cell.dataset.y)); }
});

initGrid();

// --- GYROSCOPE CONTROL (MOBILE) ---
const btnGyro = document.getElementById('btnGyro');
let gyroEnabled = false;
let tiltLocked = false; // Biar gak spamming muter terus

// 1. Fungsi Request Permission (Wajib buat iOS 13+)
btnGyro.addEventListener('click', async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Khusus iOS 13+
        try {
            const response = await DeviceOrientationEvent.requestPermission();
            if (response === 'granted') {
                enableGyro();
            } else {
                alert("Izin Gyroscope ditolak.");
            }
        } catch (e) {
            console.error(e);
            alert("Error requesting gyro permission");
        }
    } else {
        // Android / iOS Lama (Langsung jalan)
        enableGyro();
    }
});

function enableGyro() {
    gyroEnabled = true;
    window.addEventListener('deviceorientation', handleOrientation);
    
    // Ubah tampilan tombol biar user tau udah aktif
    btnGyro.innerText = "✅ Gyro Active";
    btnGyro.style.background = "var(--accent-color)";
    btnGyro.style.color = "#000";
    btnGyro.disabled = true;
}

// 2. Logic Baca Sensor Miring
function handleOrientation(event) {
    // Cuma jalan kalau Mode Gravity dan Game lagi Play
    if (state.mode !== 'gravity' || !state.isPlaying || state.isPaused) return;

    // Gamma adalah kemiringan Kiri/Kanan (-90 sampai 90)
    const tilt = event.gamma; 

    // Threshold (Batas kemiringan) -> 30 derajat
    const tiltThreshold = 30;
    const resetThreshold = 15; // Harus balik ke posisi hampir datar buat reset

    // LOGIKA TILT
    if (!tiltLocked) {
        if (tilt > tiltThreshold) {
            // Miring Kanan -> Putar Kanan
            rotateBoardAction(90);
            tiltLocked = true; // Kunci biar gak muter lagi
        } else if (tilt < -tiltThreshold) {
            // Miring Kiri -> Putar Kiri
            rotateBoardAction(-90);
            tiltLocked = true; // Kunci
        }
    } else {
        // Kalau lagi dikunci, cek apakah HP udah balik datar?
        if (tilt > -resetThreshold && tilt < resetThreshold) {
            tiltLocked = false; // Buka kunci, siap miring lagi
        }
    }
}