// Board
const blockSize = 25;
const rows = 20;
const cols = 20;
let board;
let context;

// Snake Head
let snakeX = blockSize * 5;
let snakeY = blockSize * 5;

let velocityX = 0;
let velocityY = 0;

let snakeBody = [];

// Food
let foodX;
let foodY;

let gameOver;
let score = 0;

let gameLoop;

let currentLevel = 1;
const levels = [
  { speed: 250, obstacles: false },
  { speed: 220, obstacles: true },
  { speed: 200, obstacles: true },
  { speed: 170, obstacles: true },
];

let obstacles = [
  { x: 100, y: 150 },
  { x: 200, y: 250 },
  { x: 300, y: 350 },
];

let scoreDisplayX = 40;
let scoreDisplayY = 30;

let clearMessage = true;
let levelFailures = { 1: 0, 2: 0, 3: 0, 4: 0 };
levelFailures[1] = 0;

function handleGameOver() {
  gameOver = true;
  playGameOverSound(); // Play game over sound
  levelFailures[currentLevel]++; // Increment failure count for the current level
  // Check if we need to restart the game at level 1
  if (currentLevel > 1 && levelFailures[currentLevel] >= 2) {
    // Reset game to level 1 after two failures at level 2 or higher
    currentLevel = 1;
    levelFailures[currentLevel] = 0; // Reset failure count for level 1
    score = 0; // Reset score to zero when starting level 1
    restartGame(); // Restart the game
  } else {
    // Show game over screen for the current level
    gameOverScreen();
  }
}

window.onload = function () {
  board = document.getElementById("board");
  board.height = rows * blockSize;
  board.width = cols * blockSize;
  context = board.getContext("2d"); // To draw on the board

  board.addEventListener("touchstart", restartGame);


  const numLevels = levels.length;
  for (let i = 1; i <= numLevels; i++) {
    levelFailures[i] = 0;
  }

  placeFood();
  document.addEventListener("keydown", changeDirection);

   let touchStartX = 0;
   let touchStartY = 0;

   document.addEventListener("touchstart", function (e) {
     touchStartX = e.touches[0].clientX;
     touchStartY = e.touches[0].clientY;
   });

   document.addEventListener("touchmove", function (e) {
     let touchEndX = e.touches[0].clientX;
     let touchEndY = e.touches[0].clientY;

     let dx = touchEndX - touchStartX;
     let dy = touchEndY - touchStartY;

     if (Math.abs(dx) > Math.abs(dy)) {
       if (dx > 0 && velocityX != -1) {
         velocityX = 1;
         velocityY = 0;
       } else if (dx < 0 && velocityX != 1) {
         velocityX = -1;
         velocityY = 0;
       }
     } else {
       if (dy > 0 && velocityY != -1) {
         velocityX = 0;
         velocityY = 1;
       } else if (dy < 0 && velocityY != 1) {
         velocityX = 0;
         velocityY = -1;
       }
     }

     e.preventDefault();
   });

   document.addEventListener("touchend", function (e) {
     // Prevent default behavior for touch events to avoid unintended gestures
     e.preventDefault();
   });

  // update();
  setInterval(update, 250); // 250 milliseconds
};

function update() {
  let level = levels[currentLevel - 1];
  clearInterval(gameLoop);
  gameLoop = setInterval(update, level.speed);

  if (gameOver) {
    return;
  }

  //   context.fillStyle = "#ccc";
  context.fillStyle = "black";
  context.fillRect(0, 0, board.width, board.height);

  // Draw food with border
  context.fillStyle = "hsl(50, 100%, 50%)";
  context.fillRect(foodX, foodY, blockSize, blockSize);
  context.strokeStyle = "black";
  context.strokeRect(foodX, foodY, blockSize, blockSize);

  // Draw obstacles based on game level
  if (level.obstacles && currentLevel > 1) {
    context.fillStyle = "red";
    obstacles.forEach((obstacle) => {
      context.fillRect(obstacle.x, obstacle.y, blockSize, blockSize);
    });
  }

  if (checkCollision()) {
    handleGameOver();
    return;
  }

  // Save the current position of the snake's head
  let newHead = [snakeX, snakeY];
  snakeBody.unshift(newHead); // Add the new head to the beginning of the snakeBody array

  // Update snake's position based on velocity
  snakeX += velocityX * blockSize;
  snakeY += velocityY * blockSize;

  // Check if snake eats food
  if (snakeX === foodX && snakeY === foodY) {
    updateScore(); // Update score when snake eats food
    placeFood(); // Place new food for snake
  } else {
    // Remove the tail of the snake if it hasn't eaten food
    snakeBody.pop();
  }

  // Draw snake's head with border
  //   context.fillStyle = "hsl(200, 100%, 50%)";
  context.fillStyle = "lime";
  context.fillRect(snakeX, snakeY, blockSize, blockSize);
  context.strokeStyle = "black";
  context.strokeRect(snakeX, snakeY, blockSize, blockSize);

  // Draw snake's body segments with border
  snakeBody.forEach((segment) => {
    context.fillStyle = "lime";
    // context.fillStyle = "hsl(200, 100%, 50%)";
    context.fillRect(segment[0], segment[1], blockSize, blockSize);
    context.strokeStyle = "black";
    context.strokeRect(segment[0], segment[1], blockSize, blockSize);
  });

  // Display score
  displayScore();
}

// Function to check collisions
function checkCollision() {
  // Check for wall collision
  if (
    snakeX < 0 ||
    snakeX >= board.width ||
    snakeY < 0 ||
    snakeY >= board.height
  ) {
    return true;
  }

  // Check for obstacle collision
  if (levels[currentLevel - 1].obstacles && currentLevel > 1) {
    for (let obstacle of obstacles) {
      if (snakeX === obstacle.x && snakeY === obstacle.y) {
        return true;
      }
    }
  }

  // Check for self collision
  for (let i = 1; i < snakeBody.length; i++) {
    if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
      return true;
    }
  }

  return false;
}

function restartGame() {
  if (gameOver) {
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    //   score = 0;
    gameOver = false; // Reset game over state
    placeFood();
    // Reset obstacles if applicable
    if (levels[currentLevel - 1].obstacles) {
      resetObstacles();
    }
    // Clear game loop and start new loop at level 1 speed
    clearInterval(gameLoop);
    gameLoop = setInterval(update, levels[currentLevel - 1].speed);
    // Display updated score after reset
    displayScore();
  }
}

// Function to display a level message on the canvas
function showLevelMessage(message) {
  context.fillStyle = "rgba(0, 0, 0, 0.5)"; // Semi-transparent overlay
  context.fillRect(0, 0, board.width, board.height);
  context.fillStyle = "white";
  context.font = "30px Arial";
  context.textAlign = "center";
  context.fillText(message, board.width / 2, board.height / 2 - 20);
  if (!gameOver) {
    setTimeout(function () {
      // Clear the level message after a short delay
      context.clearRect(0, 0, board.width, board.height);
      clearMessage = false;
    }, 3000); // Display the message for 3 seconds;
  }
}
document.addEventListener("keydown", function (event) {
  if (event.code === "Enter") {
    context.clearRect(0, 0, board.width, board.height);
  }
});

function updateScore() {
  score += 10; // Increase score by 10 when snake eats food
  displayScore(); // Update score display
  playEatSound(); // Play eat sound

  // Check score thresholds to progress to the next level
  if (score >= 100 && currentLevel === 1) {
    // Move to Level 2
    currentLevel = 2;
    showLevelMessage(`Level ${currentLevel}`);
    resetObstacles(); // Reset obstacles for the new level if applicable
    clearInterval(gameLoop);
    gameLoop = setInterval(update, levels[currentLevel - 1].speed);
  } else if (score >= 200 && currentLevel === 2) {
    // Move to Level 3
    currentLevel = 3;
    showLevelMessage(`Level ${currentLevel}`);
    resetObstacles(); // Reset obstacles for the new level if applicable
    clearInterval(gameLoop);
    gameLoop = setInterval(update, levels[currentLevel - 1].speed);
  } else if (score >= 300 && currentLevel === 3) {
    // Move to Level 3
    currentLevel = 4;
    showLevelMessage(`Level ${currentLevel}`);
    resetObstacles(); // Reset obstacles for the new level if applicable
    clearInterval(gameLoop);
    gameLoop = setInterval(update, levels[currentLevel - 1].speed);
  } else if (score >= 400 && currentLevel === 4) {
    showLevelMessage(
      `Congrats Champion!!! You won!!!. You made the High Score of ${score}!!!
    `);
    restartGame();
  }
}

function displayScore() {
  context.fillStyle = "White";
  context.font = "20px Arial";
  context.fillText("Score:" + score, scoreDisplayX, scoreDisplayY);
}

function changeDirection(e) {
  if (e.code == "ArrowUp" && velocityY != 1) {
    velocityX = 0;
    velocityY = -1;
  } else if (e.code == "ArrowDown" && velocityY != -1) {
    velocityX = 0;
    velocityY = 1;
  } else if (e.code == "ArrowLeft" && velocityX != 1) {
    velocityX = -1;
    velocityY = 0;
  } else if (e.code == "ArrowRight" && velocityX != -1) {
    velocityX = 1;
    velocityY = 0;
  }
}

function placeFood() {
  // Stop the game loop
  clearInterval(gameLoop);
  foodX = Math.floor(Math.random() * cols) * blockSize;
  foodY = Math.floor(Math.random() * cols) * blockSize;
}

function gameOverScreen() {
  context.fillStyle = "rgba(0, 0, 0, 0.5)"; // Semi-transparent overlay
  context.fillRect(0, 0, board.width, board.height);

  context.fillStyle = "white";
  context.font = "30px Arial";
  context.textAlign = "center";
  context.fillText(
    "Level " + currentLevel + " Failed",
    board.width / 2,
    board.height / 2 - 20
  );

  context.font = "20px Arial";
  context.fillText(
    "Press Enter to Restart",
    board.width / 2,
    board.height / 2 + 20
  );
}

document.addEventListener("keydown", function (event) {
  if (event.code === "Enter" && gameOver) {
    restartGame();
  } else if (!gameOver) {
    changeDirection(event);
  }
});

// Define a function to reset obstacles
function resetObstacles() {
  obstacles = []; // Clear existing obstacles

  // Determine the number of obstacles based on the current level
  let numObstacles = calculateNumObstacles(currentLevel);

  // Generate new obstacles based on level complexity
  for (let i = 0; i < numObstacles; i++) {
    let obstacleX = Math.floor(Math.random() * cols) * blockSize;
    let obstacleY = Math.floor(Math.random() * rows) * blockSize;
    obstacles.push({ x: obstacleX, y: obstacleY });
  }
}

function calculateNumObstacles(level) {
  // Define the base number of obstacles for each level
  const baseObstacles = 1; // Adjust the number of obstacles for each level

  //Increase number of obstacles by 2 for each subsequent level
  return baseObstacles + (level - 1) * 2;
}

// Function to play eat sound
function playEatSound() {
  let eatSound = document.getElementById("eatSound");
  eatSound.currentTime = 0; // Rewind to start to allow rapid replay
  eatSound.play();
}

// Function to play game over sound
function playGameOverSound() {
  let gameOverSound = document.getElementById("gameOverSound");
  gameOverSound.currentTime = 0; // Rewind to start to allow rapid replay
  gameOverSound.play();
}