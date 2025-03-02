const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// 禁用平滑處理以保持圖片清晰
ctx.imageSmoothingEnabled = false;

// 遊戲設置
const gridSize = 80; // 每個格子 80x80 像素
let tileCountX, tileCountY;
let snake, food, dx, dy, score, gameSpeed, gameLoop;

// 加載圖片資源 (80x80 像素)
const chiikawaFace = new Image();
chiikawaFace.src = 'chiikawa_face.png';
const chiikawaBody = new Image();
chiikawaBody.src = 'chiikawa_body.png';

const dessertImages = [
    new Image(),
    new Image(),
    new Image()
];
dessertImages[0].src = 'dessert1.png'; // 巧克力蛋糕
dessertImages[1].src = 'dessert2.png'; // 粉色甜甜圈
dessertImages[2].src = 'dessert3.png'; // 黃色布丁

// 動態調整畫布大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tileCountX = Math.floor(canvas.width / gridSize);  // X 方向格子數
    tileCountY = Math.floor(canvas.height / gridSize); // Y 方向格子數
}

// 初始化遊戲狀態
function initGame() {
    resizeCanvas(); // 先設置畫布大小
    snake = [{ x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) }];
    food = {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY),
        type: Math.floor(Math.random() * dessertImages.length)
    };
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 100;
}

// 初始設置畫布大小並監聽調整
resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    snake = [{ x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) }];
    food = {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY),
        type: food.type // 保留當前食物類型
    };
});

// 鍵盤控制（電腦用）
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

// 觸控控制（手機用）
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault(); // 防止頁面滾動
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX > 0 && !goingLeft) { // 右滑
            dx = 1;
            dy = 0;
        } else if (diffX < 0 && !goingRight) { // 左滑
            dx = -1;
            dy = 0;
        }
    } else if (Math.abs(diffY) > 40) {
        if (diffY > 0 && !goingUp) { // 下滑
            dx = 0;
            dy = 1;
        } else if (diffY < 0 && !goingDown) { // 上滑
            dx = 0;
            dy = -1;
        }
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
});

function drawGame() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        food = {
            x: Math.floor(Math.random() * tileCountX),
            y: Math.floor(Math.random() * tileCountY),
            type: Math.floor(Math.random() * dessertImages.length)
        };
        clearInterval(gameLoop);
        gameSpeed = Math.max(50, gameSpeed - 2);
        gameLoop = setInterval(drawGame, gameSpeed);
    } else {
        snake.pop();
    }

    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        gameOver();
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    // 清空畫布
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 繪製邊界線
    ctx.strokeStyle = 'black'; // 邊框顏色
    ctx.lineWidth = 4; // 邊框粗細
    ctx.strokeRect(0, 0, tileCountX * gridSize, tileCountY * gridSize);

    // 畫蛇
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.drawImage(chiikawaFace, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        } else {
            ctx.drawImage(chiikawaBody, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
    });

    // 畫食物
    ctx.drawImage(dessertImages[food.type], food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function gameOver() {
    clearInterval(gameLoop);
    alert(`遊戲結束！您的得分是: ${score}`);
    initGame();
    gameLoop = setInterval(drawGame, gameSpeed);
}

// 確保圖片加載完成後開始遊戲
Promise.all([
    new Promise(resolve => chiikawaFace.onload = resolve),
    new Promise(resolve => chiikawaBody.onload = resolve),
    ...dessertImages.map(img => new Promise(resolve => img.onload = resolve))
]).then(() => {
    initGame();
    gameLoop = setInterval(drawGame, gameSpeed);
});