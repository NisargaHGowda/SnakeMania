// Game Constants & Variables
let inputDir = { x: 0, y: 0 };
const foodSound = new Audio('music/food.mp3');
const gameOverSound = new Audio('music/gameover.mp3');
const moveSound = new Audio('music/move.mp3');
const musicSound = new Audio('music/music.mp3');
musicSound.loop = true;
musicSound.volume = 0.5;

let gameActive = false;
let speed = 5;
let score = 0;
let lastPaintTime = 0;
let snakeArr = [{ x: 1, y: 1 }];
let food = { x: 6, y: 7, color: getRandomDarkColor() };

// UI Elements
const board = document.getElementById("board");
const scoreBox = document.getElementById("scoreBox");
const highscoreBox = document.getElementById("highscoreBox");

// Function to get a random **dark** color for food
function getRandomDarkColor() {
    const darkColors = ["#8B0000", "#4B0082", "#006400", "#8B4513", "#483D8B", "#800000", "#2F4F4F", "#5D3FD3"];
    return darkColors[Math.floor(Math.random() * darkColors.length)];
}

// Event Listeners for Buttons
document.getElementById("playBtn").addEventListener("click", () => {
    console.log("Play button clicked!");
    gameActive = true;
    speed = 5;
    score = 0;
    snakeArr = [{ x: 1, y: 1 }];
    inputDir = { x: 1, y: 0 };

    // Start background music if not already playing
    if (musicSound.paused) {
        musicSound.play().catch(error => console.log("Music play error:", error));
    }

    window.requestAnimationFrame(main);
});

document.getElementById("endBtn").addEventListener("click", () => {
    console.log("End button clicked!");
    gameActive = false;
    board.innerHTML = "";
});

// Game Loop
function main(ctime) {
    if (!gameActive) return;
    window.requestAnimationFrame(main);
    if ((ctime - lastPaintTime) / 1000 < 1 / speed) return;
    lastPaintTime = ctime;
    gameEngine();
}

// Collision Detection
function isCollide(snake) {
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    if (snake[0].x >= 18 || snake[0].x <= 0 || snake[0].y >= 18 || snake[0].y <= 0) {
        return true;
    }
    return false;
}

// Load high score from local storage
let highScore = localStorage.getItem("highScore") ? JSON.parse(localStorage.getItem("highScore")) : 0;
highscoreBox.innerHTML = "HighScore: " + highScore;

function gameOver() {
    gameActive = false;
    gameOverSound.play();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", JSON.stringify(highScore));
        highscoreBox.innerHTML = "HighScore: " + highScore;
    }

    alert("Game Over! Click Play to restart.");
}

// Game Engine
function gameEngine() {
    if (isCollide(snakeArr)) {
        gameOver();
        return;
    }

    // Check if snake eats food
    if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
        foodSound.play();
        score += 1;
        scoreBox.innerHTML = "Score: " + score;
        snakeArr.unshift({ x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y });
        speed += 0.5;
        
        // Generate a new food position and **dark color**
        food = { 
            x: Math.floor(Math.random() * 16) + 1, 
            y: Math.floor(Math.random() * 16) + 1, 
            color: getRandomDarkColor() 
        };
    }

    // Move the snake
    for (let i = snakeArr.length - 2; i >= 0; i--) {
        snakeArr[i + 1] = { ...snakeArr[i] };
    }
    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;

    // Render the board
    board.innerHTML = "";
    snakeArr.forEach((e, index) => {
        let snakeElement = document.createElement("div");
        snakeElement.style.gridRowStart = e.y;
        snakeElement.style.gridColumnStart = e.x;
        
        if (index === 0) {
            snakeElement.classList.add("head");

            // Add Eyes
            let leftEye = document.createElement("div");
            leftEye.classList.add("eye", "left");

            let rightEye = document.createElement("div");
            rightEye.classList.add("eye", "right");

            // Adjust eyes based on movement direction
            if (inputDir.x === 1) { // Moving Right
                leftEye.style.left = "50%";
                rightEye.style.left = "80%";
            } else if (inputDir.x === -1) { // Moving Left
                leftEye.style.left = "5%";
                rightEye.style.left = "30%";
            } else if (inputDir.y === -1) { // Moving Up
                leftEye.style.top = "5%";
                rightEye.style.top = "5%";
            } else if (inputDir.y === 1) { // Moving Down
                leftEye.style.top = "50%";
                rightEye.style.top = "50%";
            }

            snakeElement.appendChild(leftEye);
            snakeElement.appendChild(rightEye);
        } else {
            snakeElement.classList.add("snake");
        }

        board.appendChild(snakeElement);
    });

    // Render food
    let foodElement = document.createElement("div");
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.style.backgroundColor = food.color;
    foodElement.classList.add("food");
    board.appendChild(foodElement);
}




// Key Events
window.addEventListener("keydown", (e) => {
    moveSound.play();
    if (!gameActive) return;

    if ((e.key === "ArrowUp" && inputDir.y === 1) ||
        (e.key === "ArrowDown" && inputDir.y === -1) ||
        (e.key === "ArrowLeft" && inputDir.x === 1) ||
        (e.key === "ArrowRight" && inputDir.x === -1)) {
        return;
    }

    switch (e.key) {
        case "ArrowUp":
            if (inputDir.y === 0) inputDir = { x: 0, y: -1 };
            break;
        case "ArrowDown":
            if (inputDir.y === 0) inputDir = { x: 0, y: 1 };
            break;
        case "ArrowLeft":
            if (inputDir.x === 0) inputDir = { x: -1, y: 0 };
            break;
        case "ArrowRight":
            if (inputDir.x === 0) inputDir = { x: 1, y: 0 };
            break;
    }
});
