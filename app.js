const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const bgm = document.getElementById('bgm');
const btnMusic = document.getElementById('btn-music');
const joyContainer = document.getElementById('joy-container');
const joyStick = document.getElementById('joy-stick');

// ===== IMAGES =====
const mapImg = new Image(); mapImg.src = 'map.png';
const playerImg = new Image(); playerImg.src = 'player.png';
const collegeImg = new Image(); collegeImg.src = 'college.png';
const npcImgs = ['1.png','2.png','3.png'].map(src => {
    let img = new Image(); img.src = src; return img;
});

// ===== STATE =====
let player = { x: 100, y: 100, size: 40, speed: 5 };
let college = { x: 650, y: 350, size: 100 };
let npcs = [];
let gameRunning = false;
let joystick = { active: false, dx: 0, dy: 0 };

// ===== MUSIC FUNCTION =====
function toggleMusic() {
    if (bgm.paused) {
        bgm.play().catch(e => console.log("User interaction required first"));
        btnMusic.innerText = "Music: ON";
        btnMusic.style.background = "#2e7d32"; 
    } else {
        bgm.pause();
        btnMusic.innerText = "Music: OFF";
        btnMusic.style.background = "#c62828";
    }
}

function randomNPCs() {
    npcs = [];
    for (let i = 0; i < 3; i++) {
        npcs.push({
            x: 50 + Math.random() * 600,
            y: 50 + Math.random() * 300,
            active: false,
            waiting: false,
            reached: false,
            startTime: 0
        });
    }
}

function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'flex';
    randomNPCs();
    player.x = 100; player.y = 100;
    gameRunning = true;
    loop();
}

function backMenu() {
    gameRunning = false;
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('game').style.display = 'none';
}

function update() {
    let allReached = true;
    npcs.forEach(n => {
        if (!n.active && Math.hypot(player.x - n.x, player.y - n.y) < 50) {
            n.active = true;
            n.waiting = true;
            n.startTime = Date.now();
        }

        if (n.active && !n.reached) {
            let elapsed = (Date.now() - n.startTime) / 1000;
            if (elapsed >= 3) {
                n.waiting = false;
                let dx = college.x - n.x;
                let dy = college.y - n.y;
                n.x += dx * 0.03;
                n.y += dy * 0.03;
                if (Math.hypot(n.x - college.x, n.y - college.y) < 10) n.reached = true;
            }
        }
        if (!n.reached) allReached = false;
    });

    if (joystick.active) {
        player.x += joystick.dx * player.speed;
        player.y += joystick.dy * player.speed;
    }

    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;

    if (allReached && npcs.length > 0) {
        setTimeout(() => {
            document.getElementById("mission-complete").innerHTML = "<p>Mission Complete!</p>"; 
        }, 500);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(collegeImg, college.x, college.y, college.size, college.size);
    ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

    npcs.forEach((n, i) => {
        ctx.drawImage(npcImgs[i], n.x, n.y, 40, 40);
        if (n.waiting) {
            ctx.fillStyle = "white";
            ctx.font = "bold 18px Arial";
            ctx.fillText("Class A Jaw", n.x - 20, n.y - 15);
        }
    });
}

function loop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(loop);
}

// ===== TOUCH/JOYSTICK CONTROLS =====
joyContainer.addEventListener('touchmove', e => {
    e.preventDefault();
    let touch = e.touches[0];
    let rect = joyContainer.getBoundingClientRect();
    let x = touch.clientX - (rect.left + rect.width/2);
    let y = touch.clientY - (rect.top + rect.height/2);
    let distance = Math.min(Math.hypot(x, y), 40);
    let angle = Math.atan2(y, x);
    
    joystick.active = true;
    joystick.dx = (Math.cos(angle) * distance) / 40;
    joystick.dy = (Math.sin(angle) * distance) / 40;
    joyStick.style.transform = `translate(${joystick.dx * 30}px, ${joystick.dy * 30}px)`;
});

joyContainer.addEventListener('touchend', () => {
    joystick.active = false;
    joystick.dx = 0; joystick.dy = 0;
    joyStick.style.transform = `translate(0,0)`;
});

window.addEventListener('keydown', e => {
    joystick.active = true;
    if (e.key === 'w') joystick.dy = -1;
    if (e.key === 's') joystick.dy = 1;
    if (e.key === 'a') joystick.dx = -1;
    if (e.key === 'd') joystick.dx = 1;
});

window.addEventListener('keyup', () => { 
    joystick.active = false; 
    joystick.dx = 0; 
    joystick.dy = 0; 
});