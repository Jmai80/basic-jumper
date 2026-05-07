import Player from './Player.js';

// Canvas och context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Spelarinställningar
const player = new Player(100, 500, 40, 40);

// Tangentbordsinput
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    Space: false,
    KeyA: false,
    KeyD: false
};

// Marknivå (groundY bestämmer var marken är)
const groundY = canvas.height - 50; // 50px från botten

// För att förhindra dubbelhopp
let canJump = true;

// Spelloop
let animationId = null;
let lastTimestamp = 0;

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

// Fönsterresponzivitet - uppdatera canvas-storlek
function resizeCanvas() {
    // Behåll den faktiska canvas-storleken oförändrad för logiken
    // men låt CSS hantera visuell skalning
    const container = canvas.parentElement;
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 120;
    
    if (maxWidth < 800) {
        canvas.style.width = `${maxWidth}px`;
        canvas.style.height = `${maxWidth * 0.75}px`;
    } else {
        canvas.style.width = '800px';
        canvas.style.height = '600px';
    }
}

// Rita bakgrund
function drawBackground() {
    // Himmel med gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#98D8E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Moln
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(100, 80, 60);
    drawCloud(500, 120, 70);
    drawCloud(700, 60, 50);
    drawCloud(300, 150, 55);
    
    // Mark med gräs
    ctx.fillStyle = '#5a8f4c';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Grässtrån
    ctx.fillStyle = '#4a7f3c';
    for(let i = 0; i < canvas.width; i += 30) {
        ctx.fillRect(i, groundY - 5, 3, 10);
        ctx.fillRect(i + 10, groundY - 8, 3, 13);
        ctx.fillRect(i + 20, groundY - 3, 3, 8);
    }
    
    // Markkant med skugga
    ctx.fillStyle = '#6b9e5a';
    ctx.fillRect(0, groundY, canvas.width, 5);
    
    // Jordlager under gräset
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(0, groundY + 5, canvas.width, 20);
    ctx.fillStyle = '#6B4226';
    ctx.fillRect(0, groundY + 25, canvas.width, canvas.height - groundY - 25);
    
    // Små stenar på marken
    ctx.fillStyle = '#888';
    for(let i = 0; i < 12; i++) {
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

// Rita partiklar för hopp (för extra effekt)
let particles = [];

function addJumpParticles(x, y) {
    for(let i = 0; i < 8; i++) {
        particles.push({
            x: x + 20,
            y: y + 40,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 2,
            life: 1,
            size: Math.random() * 3 + 2
        });
    }
}

function updateParticles() {
    for(let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].life -= 0.03;
        particles[i].vy += 0.2;
        
        if(particles[i].life <= 0 || particles[i].y > groundY) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for(let particle of particles) {
        ctx.fillStyle = `rgba(255, 100, 100, ${particle.life * 0.6})`;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
}

// Rita spelarinfo (position och status)
function drawDebugInfo() {
    ctx.font = '14px monospace';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 180, 60);
    ctx.fillStyle = 'white';
    ctx.fillText(`Position: (${Math.floor(player.x)}, ${Math.floor(player.y)})`, 15, 30);
    ctx.fillText(`Velocity Y: ${player.velocityY.toFixed(1)}`, 15, 50);
    ctx.fillText(`Marken: ${player.isGrounded ? 'Ja' : 'Nej'}`, 15, 70);
}

// Spelloop
function gameLoop() {
    // Uppdatera spelaren
    player.update(keys, canvas.width, groundY);
    
    // Lägg till partiklar vid hopp
    if(keys.ArrowUp || keys.Space) {
        if(player.isGrounded && canJump) {
            addJumpParticles(player.x, player.y + player.height);
            canJump = false;
        }
    } else {
        canJump = true;
    }
    
    updateParticles();
    
    // Rita allt
    drawBackground();
    player.draw(ctx);
    drawParticles();
    drawDebugInfo();
    
    // Fortsätt loopen
    animationId = requestAnimationFrame(gameLoop);
}

// Initiera spelet
function init() {
    // Sätt canvas dimensioner
    canvas.width = 800;
    canvas.height = 600;
    
    // Lägg till event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', resizeCanvas);
    
    // Förhindra contextmeny på canvas
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Hantera fönsterfokus
    window.addEventListener('blur', () => {
        // Återställ alla tangenttryckningar när fönstret tappar fokus
        for(let key in keys) {
            keys[key] = false;
        }
    });
    
    // Starta spelet
    resizeCanvas();
    gameLoop();
    
    console.log('Spelet är startat! Använd piltangenterna för att röra dig.');
}

// Starta allt när sidan laddats
window.addEventListener('load', init);