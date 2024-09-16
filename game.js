const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 360;
canvas.height = 800;

const scoreBoard = document.getElementById('scoreBoard');
const pointsDisplay = document.getElementById('pointsDisplay');
const totalPointsSpan = document.getElementById('totalPoints');
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('gameContainer');
const newGameButton = document.getElementById('newGameButton');
const quitButton = document.getElementById('quitButton');
const shopButton = document.getElementById('shopButton');
const shopMenu = document.getElementById('shopMenu');
const backButton = document.getElementById('backButton');
const shopPoints = document.getElementById('shopPoints');

let score = 0;
let earnedPoints = 0;
let gameSpeed = 1;
let balls = [];
let beams = [];
let gameOver = false;
let beamShape = 'default'; // Beam shape

const ballTypes = [
    { color: 'yellow', sturdiness: 1 },
    { color: 'orange', sturdiness: 2 },
    { color: 'red', sturdiness: 3 }
];

const redLine = {
    x: 0,
    y: canvas.height - 10,
    width: canvas.width,
    height: 10
};

class Ball {
    constructor(x, y, radius, color, sturdiness) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.sturdiness = sturdiness;
        this.speed = 2 * gameSpeed;
        this.shinyEffect = 1;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.shinyEffect;
        ctx.fill();
        ctx.closePath();
    }
}

class Beam {
    constructor(x) {
        this.x = x;
        this.y = canvas.height;
        this.width = 5;
        this.height = 20;
        this.speed = 8;
        this.shinyEffect = 1;
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        ctx.fillStyle = 'limegreen';
        ctx.globalAlpha = this.shinyEffect;

        switch (beamShape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
                break;
            case 'star':
                drawStar(ctx, this.x, this.y, 5, this.width, this.height);
                break;
            case 'square':
                ctx.fillRect(this.x, this.y, this.width, this.height);
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.width, this.y + this.height);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.closePath();
                ctx.fill();
                break;
            default:
                ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

function drawStar(ctx, x, y, spikes, outerRadius, innerRadius) {
    let rotation = Math.PI / 2 * 3;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);
    for (let i = 0; i < spikes; i++) {
        let x1 = x + Math.cos(rotation) * outerRadius;
        let y1 = y + Math.sin(rotation) * outerRadius;
        ctx.lineTo(x1, y1);
        rotation += step;

        x1 = x + Math.cos(rotation) * innerRadius;
        y1 = y + Math.sin(rotation) * innerRadius;
        ctx.lineTo(x1, y1);
        rotation += step;
    }
    ctx.lineTo(x, y - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function spawnBall() {
    const x = Math.random() * (canvas.width - 30) + 15;
    const type = getRandomBallType();
    balls.push(new Ball(x, 0, 20, type.color, type.sturdiness));
}

function getRandomBallType() {
    const randomNum = Math.random();
    if (randomNum < 0.7) return ballTypes[0];
    if (randomNum < 0.9) return ballTypes[1];
    return ballTypes[2];
}

function checkCollisions() {
    for (let i = beams.length - 1; i >= 0; i--) {
        for (let j = balls.length - 1; j >= 0; j--) {
            const beam = beams[i];
            const ball = balls[j];
            const dist = Math.hypot(beam.x - ball.x, beam.y - ball.y);

            if (dist < ball.radius) {
                ball.sturdiness--;
                if (ball.sturdiness <= 0) {
                    score += 5;
                    balls.splice(j, 1);
                    showParticles(ball.x, ball.y);
                }
                beams.splice(i, 1);
                break;
            }
        }
    }
}

function showParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.globalAlpha = Math.random();
        ctx.fill();
        ctx.closePath();
    }
}

let lastEarnedPointsUpdate = 0;

function updateGameSpeed() {
    if (score >= 200 && score % 200 === 0) {
        let increment = gameSpeed * 0.01; // Increment by 1% of current speed
        gameSpeed += increment;
        balls.forEach(ball => ball.speed = 2 * gameSpeed);
    }

    if (score % 100 === 0 && score > lastEarnedPointsUpdate) {
        earnedPoints += 1;
        lastEarnedPointsUpdate = score;
        savePoints();
        updatePointsDisplay();
        alert(`You earned 1 point! Total Points: ${earnedPoints}`);
    }

    scoreBoard.innerHTML = `Score: ${score} | Points: ${earnedPoints}`;
}

function checkGameOver() {
    for (const ball of balls) {
        if (ball.y - ball.radius >= redLine.y) {
            gameOver = true;
            alert(`Game Over! Your score: ${score}`);
            savePoints();
            document.location.reload();
            break;
        }
    }
}

function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'red';
        ctx.fillRect(redLine.x, redLine.y, redLine.width, redLine.height);

        for (const ball of balls) {
            ball.update();
            ball.draw();
        }

        for (const beam of beams) {
            beam.update();
            beam.draw();
        }

        checkCollisions();
        checkGameOver();
        updateGameSpeed();

        requestAnimationFrame(gameLoop);
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    beams.push(new Beam(mouseX));

    // Unlock double beam at 10,000 points
    if (score >= 10000) {
        beams.push(new Beam(mouseX + 30)); // Second beam slightly to the right
    }
});

function startGame() {
    score = 0;
    gameOver = false;
    gameSpeed = 1;
    balls = [];
    beams = [];
    lastEarnedPointsUpdate = 0;
    loadPoints();
    updatePointsDisplay();
    gameLoop();
}

// Menu and shop functionality
newGameButton.addEventListener('click', () => {
    menu.style.display = 'none';
    gameContainer.style.display = 'block';
    startGame();
});

quitButton.addEventListener('click', () => {
    window.close();
});

shopButton.addEventListener('click', () => {
    menu.style.display = 'none';
    shopMenu.style.display = 'block';
    updateShopPointsDisplay();
});

backButton.addEventListener('click', () => {
    shopMenu.style.display = 'none';
    menu.style.display = 'block';
});

document.querySelectorAll('#shopMenu button[data-shape]').forEach(button => {
    button.addEventListener('click', (e) => {
        const selectedShape = e.target.getAttribute('data-shape');
        if (earnedPoints >= 50) {
            beamShape = selectedShape;
            earnedPoints -= 50;
            savePoints();
            updatePointsDisplay();
            updateShopPointsDisplay();
            alert(`You purchased the ${selectedShape} beam!`);
        } else {
            alert('Not enough points!');
        }
    });
});

// Points saving/loading functionality
function savePoints() {
    localStorage.setItem('earnedPoints', earnedPoints.toFixed(2));
}

function loadPoints() {
    const savedPoints = localStorage.getItem('earnedPoints');
    if (savedPoints) {
        earnedPoints = parseFloat(savedPoints);
    }
    return earnedPoints;
}

function updatePointsDisplay() {
    totalPointsSpan.innerText = earnedPoints.toFixed(2);
}

function updateShopPointsDisplay() {
    const pointsInShop = loadPoints(); // Points in shop are 1% of score, rounded down
    shopPoints.innerText = `Points: ${pointsInShop}`;
}

// Start spawning balls periodically
setInterval(spawnBall, 1000);
