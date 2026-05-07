import Player from './Player.js';

// Canvas och context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Globale variabler
let player;
let groundY;
let particles = [];
let canJump = true;
let justLanded = false;
let landTimer = 0;
let animationId = null;

// Tangentbordsinput
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    Space: false,
    KeyA: false,
    KeyD: false
};

// Touch-kontroller
let touchLeft = false;
let touchRight = false;
let touchJump = false;

// Sätt canvas storlek dynamiskt för responsiv design
function resizeCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    
    // Behåll proportionerna (4:3 för bättre mobilvisning)
    canvas.width = Math.min(containerWidth, 600);
    canvas.height = canvas.width * 0.75; // 4:3 ratio
    
    // Uppdatera groundY baserat på nya höjden (50px från botten)
    groundY = canvas.height - 50;
    
    // Justera spelarens position om den finns
    if (player) {
        if (player.y + player.height > groundY) {
            player.y = groundY - player.height;
            player.velocityY = 0;
            player.isGrounded = true;
        }
    }
    
    console.log(`Canvas storlek: ${canvas.width}x${canvas.height}, GroundY: ${groundY}`);
}

// Initiera spelaren
function initPlayer() {
    player = new Player(
        canvas.width / 2 - 20, // Centrera horisontellt
        groundY - 40,          // Placera på marken
        40, 
        40
    );
    console.log(`Spelare initierad vid position: (${player.x}, ${player.y})`);
}

// Hantera tangentbordshändelser
function handleKeyDown(e) {
    const key = e.code;
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
        
        // Förhindra sidscrollning med piltangenter
        if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'Space') {
            e.preventDefault();
        }
    }
}

function handleKeyUp(e) {
    const key = e.code;
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
    }
}

// Hantera touch-kontroller
function setupTouchControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const jumpBtn = document.getElementById('jumpBtn');
    
    if (!leftBtn || !rightBtn || !jumpBtn) {
        console.error('Kunde inte hitta touch-knappar!');
        return;
    }
    
    // Vänster knapp
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchLeft = true;
        leftBtn.classList.add('active');
    });
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchLeft = false;
        leftBtn.classList.remove('active');
    });
    leftBtn.addEventListener('mousedown', () => {
        touchLeft = true;
        leftBtn.classList.add('active');
    });
    leftBtn.addEventListener('mouseup', () => {
        touchLeft = false;
        leftBtn.classList.remove('active');
    });
    
    // Höger knapp
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchRight = true;
        rightBtn.classList.add('active');
    });
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchRight = false;
        rightBtn.classList.remove('active');
    });
    rightBtn.addEventListener('mousedown', () => {
        touchRight = true;
        rightBtn.classList.add('active');
    });
    rightBtn.addEventListener('mouseup', () => {
        touchRight = false;
        rightBtn.classList.remove('active');
    });
    
    // Hopp knapp
    jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchJump = true;
        jumpBtn.classList.add('active');
    });
    jumpBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchJump = false;
        jumpBtn.classList.remove('active');
    });
    jumpBtn.addEventListener('mousedown', () => {
        touchJump = true;
        jumpBtn.classList.add('active');
    });
    jumpBtn.addEventListener('mouseup', () => {
        touchJump = false;
        jumpBtn.classList.remove('active');
    });
    
    // Förhindra att knapparna får fokus och scrollar sidan
    [leftBtn, rightBtn, jumpBtn].forEach(btn => {
        btn.addEventListener('touchmove', (e) => e.preventDefault());
    });
    
    console.log('Touch-kontroller aktiverade');
}

// Kombinera tangentbords- och touch-input
function getCombinedInput() {
    return {
        left: keys.ArrowLeft || keys.KeyA || touchLeft,
        right: keys.ArrowRight || keys.KeyD || touchRight,
        jump: keys.ArrowUp || keys.Space || touchJump
    };
}

// Partikelgenerering vid hopp
function addJumpParticles(x, y) {
    for(let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        
        particles.push({
            x: x + 20,
            y: y + 40,
            vx: Math.cos(angle) * speed * (Math.random() * 2),
            vy: -Math.random() * 4 - 2,
            life: 1,
            size: Math.random() * 4 + 2,
            color: `hsl(${Math.random() * 20 + 20}, 70%, 50%)`
        });
    }
    
    for(let i = 0; i < 8; i++) {
        particles.push({
            x: x + 20,
            y: y + 40,
            vx: (Math.random() - 0.5) * 5,
            vy: -Math.random() * 3,
            life: 0.8,
            size: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 30 + 15}, 60%, 45%)`
        });
    }
}

// Dammoln vid landning
function addLandingDust(x, y) {
    for(let i = 0; i < 20; i++) {
        particles.push({
            x: x + 20,
            y: y + 40,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 2,
            life: 0.6,
            size: Math.random() * 5 + 2,
            color: `hsl(${Math.random() * 20 + 25}, 60%, 45%)`
        });
    }
}

// Uppdatera partiklar
function updateParticles() {
    for(let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.vx *= 0.98;
        p.life -= 0.02;
        
        if(p.life <= 0 || p.y > groundY + 50 || p.x < -50 || p.x > canvas.width + 50) {
            particles.splice(i, 1);
        }
    }
}

// Rita partiklar
function drawParticles() {
    for(let particle of particles) {
        ctx.save();
        const opacity = Math.min(particle.life * 0.8, 0.8);
        const color = particle.color || `rgba(139, 69, 19, ${opacity})`;
        
        ctx.fillStyle = color;
        ctx.shadowBlur = 3;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Rita bakgrund
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#98D8E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Moln (anpassade efter canvas storlek)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(canvas.width * 0.15, canvas.height * 0.15, 60);
    drawCloud(canvas.width * 0.65, canvas.height * 0.2, 70);
    drawCloud(canvas.width * 0.85, canvas.height * 0.1, 50);
    drawCloud(canvas.width * 0.4, canvas.height * 0.25, 55);
    
    // Mark
    ctx.fillStyle = '#5a8f4c';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Grässtrån
    ctx.fillStyle = '#4a7f3c';
    for(let i = 0; i < canvas.width; i += 30) {
        ctx.fillRect(i, groundY - 5, 3, 10);
        ctx.fillRect(i + 10, groundY - 8, 3, 13);
        ctx.fillRect(i + 20, groundY - 3, 3, 8);
    }
    
    // Markkant
    ctx.fillStyle = '#6b9e5a';
    ctx.fillRect(0, groundY, canvas.width, 5);
    
    // Jordlager
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(0, groundY + 5, canvas.width, 20);
    ctx.fillStyle = '#6B4226';
    ctx.fillRect(0, groundY + 25, canvas.width, canvas.height - groundY - 25);
    
    // Små stenar
    ctx.fillStyle = '#888';
    for(let i = 0; i < Math.min(12, canvas.width / 60); i++) {
        ctx.beginPath();
        ctx.ellipse(50 + i * 70, groundY - 3, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.15, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x - size * 0.3, y - size * 0.1, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.15, y + size * 0.1, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x - size * 0.1, y + size * 0.1, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

// Rita debug info
function drawDebugInfo() {
    if (canvas.width > 700) {
        ctx.font = '12px monospace';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(8, 8, 150, 60);
        ctx.fillStyle = 'white';
        ctx.fillText(`Pos: ${Math.floor(player.x)}, ${Math.floor(player.y)}`, 12, 25);
        ctx.fillText(`Vel Y: ${player.velocityY.toFixed(1)}`, 12, 42);
        ctx.fillText(`Mark: ${player.isGrounded ? 'Ja' : 'Nej'}`, 12, 59);
    }
}

// Spelloop
let previousGroundedState = true;

function gameLoop() {
    if (!player || !groundY) {
        console.warn('Spelet är inte redo än');
        requestAnimationFrame(gameLoop);
        return;
    }
    
    const wasGrounded = player.isGrounded;
    const input = getCombinedInput();
    
    // Konvertera input till keys-objekt för player.update
    const playerKeys = {
        ArrowLeft: input.left,
        ArrowRight: input.right,
        ArrowUp: input.jump,
        Space: input.jump,
        KeyA: input.left,
        KeyD: input.right
    };
    
    // Uppdatera spelaren
    player.update(playerKeys, canvas.width, groundY);
    
    // Hantera hopp-partiklar
    if (input.jump && player.isGrounded && canJump) {
        addJumpParticles(player.x, player.y);
        canJump = false;
        setTimeout(() => {
            if(player && player.isGrounded) {
                addJumpParticles(player.x, player.y);
            }
        }, 50);
    } else if (!input.jump) {
        canJump = true;
    }
    
    // Hantera landnings-partiklar
    if (!wasGrounded && player.isGrounded) {
        addLandingDust(player.x, player.y);
        justLanded = true;
        landTimer = 10;
    }
    
    if (landTimer > 0) {
        landTimer--;
        if (landTimer === 0) justLanded = false;
    }
    
    // Uppdatera och rita
    updateParticles();
    drawBackground();
    player.draw(ctx);
    drawParticles();
    drawDebugInfo();
    
    animationId = requestAnimationFrame(gameLoop);
}

// Initiera spelet
function init() {
    console.log('Initierar spelet...');
    
    // Först, sätt canvas storlek
    resizeCanvas();
    
    // Initiera spelaren (efter att canvas storlek är satt)
    initPlayer();
    
    // Sätt upp touch-kontroller
    setupTouchControls();
    
    // Lägg till event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', () => {
        console.log('Fönster storlek ändrad, uppdaterar canvas...');
        const oldGroundY = groundY;
        resizeCanvas();
        if (player) {
            // Justera spelarens position vid resize
            if (player.y + player.height > groundY) {
                player.y = groundY - player.height;
                player.velocityY = 0;
                player.isGrounded = true;
            }
            console.log(`GroundY ändrades från ${oldGroundY} till ${groundY}, spelare y: ${player.y}`);
        }
    });
    
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Starta spelloopen
    gameLoop();
    
    console.log(`Spelet är startat! Canvas: ${canvas.width}x${canvas.height}, GroundY: ${groundY}`);
}

// Starta allt när sidan laddats
window.addEventListener('load', init);