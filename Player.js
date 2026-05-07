export default class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityY = 0;
        this.velocityX = 0;
        this.isGrounded = false;
        
        // Rörelseinställningar
        this.speed = 5;
        this.jumpPower = -12;
        this.gravity = 0.8;
        
        // Färg
        this.color = '#ff4444';
        
        // Animation
        this.isJumping = false;
    }
    
    update(keys, canvasHeight, groundY) {
        // Horisontell rörelse
        if (keys.ArrowLeft || keys.KeyA) {
            this.velocityX = -this.speed;
        } else if (keys.ArrowRight || keys.KeyD) {
            this.velocityX = this.speed;
        } else {
            this.velocityX = 0;
        }
        
        // Applicera horisontell rörelse
        this.x += this.velocityX;
        
        // Begränsa horisontell rörelse till canvasens kanter
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > canvasHeight) { // canvasHeight används här som canvas bredd
            this.x = canvasHeight - this.width;
        }
        
        // Applicera gravitation
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        
        // Kolla om spelaren är på marken (100px från botten, men vi använder groundY)
        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
            this.isJumping = false;
        } else {
            this.isGrounded = false;
            if (this.velocityY < 0) {
                this.isJumping = true;
            }
        }
        
        // Hoppa
        if ((keys.ArrowUp || keys.Space) && this.isGrounded) {
            this.velocityY = this.jumpPower;
            this.isGrounded = false;
            this.isJumping = true;
        }
        
        // Se till att spelaren inte faller genom taket
        if (this.y < 0) {
            this.y = 0;
            if (this.velocityY < 0) {
                this.velocityY = 0;
            }
        }
    }
    
    draw(ctx) {
        // Rita spelaren med skugga för djup
        ctx.save();
        
        // Skugga
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Huvudfyrkant
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Lägg till en gradient för mer visuellt intresse
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, '#ff6666');
        gradient.addColorStop(1, '#cc0000');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Ögon (för karaktär)
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 0;
        ctx.fillRect(this.x + this.width * 0.2, this.y + this.height * 0.3, this.width * 0.15, this.height * 0.2);
        ctx.fillRect(this.x + this.width * 0.65, this.y + this.height * 0.3, this.width * 0.15, this.height * 0.2);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + this.width * 0.23, this.y + this.height * 0.33, this.width * 0.1, this.height * 0.12);
        ctx.fillRect(this.x + this.width * 0.68, this.y + this.height * 0.33, this.width * 0.1, this.height * 0.12);
        
        // Mun (ler om på marken, bestämd om i luften)
        ctx.beginPath();
        if (this.isGrounded) {
            ctx.arc(this.x + this.width / 2, this.y + this.height * 0.7, this.width * 0.12, 0.1, Math.PI - 0.1);
        } else {
            ctx.arc(this.x + this.width / 2, this.y + this.height * 0.7, this.width * 0.12, Math.PI + 0.1, Math.PI * 2 - 0.1);
        }
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
    
    // För felsökning och framtida plattformskollisioner
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}