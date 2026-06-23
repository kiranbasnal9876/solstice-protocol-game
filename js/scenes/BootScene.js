// Boot Scene - Solstice Protocol
// Configures canvas drawing functions to generate high-tech vector sprites programmatically.

class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        // Preload any external fonts or plugins if necessary.
        // We load Google Fonts via HTML link, so we just wait briefly for layout.
    }

    create() {
        // Create Programmatic Vector Textures for crisp vector/neon assets

        // 1. Player Drone Sprite (glowing cyan orbit ship)
        this.generateCanvasTexture("player", 32, 32, (ctx) => {
            // Glow aura
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#00f0ff";
            
            // Outer triangle hull
            ctx.strokeStyle = "#00f0ff";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(16, 2);  // Nose
            ctx.lineTo(30, 26); // Right back
            ctx.lineTo(16, 20); // Center inner indent
            ctx.lineTo(2, 26);  // Left back
            ctx.closePath();
            ctx.stroke();

            // Inner core energy ball
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ffffff";
            ctx.beginPath();
            ctx.arc(16, 15, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // 2. Floor Grid Tile
        this.generateCanvasTexture("floor", 32, 32, (ctx) => {
            ctx.fillStyle = "#0c0e1a";
            ctx.fillRect(0, 0, 32, 32);
            ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, 32, 32);
        });

        // 3. Wall Block (Corridor steel with cyan warning stripes)
        this.generateCanvasTexture("wall", 32, 32, (ctx) => {
            ctx.fillStyle = "#15182a";
            ctx.fillRect(0, 0, 32, 32);
            
            ctx.strokeStyle = "#00f0ff";
            ctx.lineWidth = 1;
            ctx.strokeRect(2, 2, 28, 28);
            
            // Center block pattern
            ctx.fillStyle = "#1d213a";
            ctx.fillRect(6, 6, 20, 20);

            // Warning diagonal hazard stripes
            ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(6, 16); ctx.lineTo(16, 6);
            ctx.moveTo(16, 26); ctx.lineTo(26, 16);
            ctx.stroke();
        });

        // 4. Solar Node (Default Orange / Unrepaired)
        this.generateCanvasTexture("node-unrepaired", 48, 48, (ctx) => {
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ff8c00";

            // Outer segmented gear/circle
            ctx.strokeStyle = "#ff8c00";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(24, 24, 18, 0, Math.PI * 2);
            ctx.stroke();

            // Inner solar core pulsing core
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ffbd00";
            ctx.beginPath();
            ctx.arc(24, 24, 8, 0, Math.PI * 2);
            ctx.fill();

            // Solar crosshairs
            ctx.strokeStyle = "#ffbd00";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(24, 2); ctx.lineTo(24, 12);
            ctx.moveTo(24, 36); ctx.lineTo(24, 46);
            ctx.moveTo(2, 24); ctx.lineTo(12, 24);
            ctx.moveTo(36, 24); ctx.lineTo(46, 24);
            ctx.stroke();
        });

        // 5. Repaired Solar Node (Glowing Neon Cyan)
        this.generateCanvasTexture("node-repaired", 48, 48, (ctx) => {
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#00f0ff";

            ctx.strokeStyle = "#00f0ff";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(24, 24, 18, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#00f0ff";
            ctx.beginPath();
            ctx.arc(24, 24, 8, 0, Math.PI * 2);
            ctx.fill();

            // Connected energy ring
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(24, 24, 13, 0, Math.PI * 2);
            ctx.stroke();
        });

        // 6. Solar core reactor (Level 5 Boss Reactor)
        this.generateCanvasTexture("reactor-core", 96, 96, (ctx) => {
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#ffbd00";

            // Multi-layered solar corona rings
            ctx.strokeStyle = "#ffbd00";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(48, 48, 40, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = "#ff5e00";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(48, 48, 32, 0, Math.PI * 2);
            ctx.stroke();

            // Hot core center
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 30;
            ctx.shadowColor = "#ffffff";
            ctx.beginPath();
            ctx.arc(48, 48, 20, 0, Math.PI * 2);
            ctx.fill();
        });

        // 7. Particle Particle texture (small white circle)
        this.generateCanvasTexture("particle", 8, 8, (ctx) => {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(4, 4, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Continue to Menu Scene
        this.scene.start("MenuScene");
    }

    generateCanvasTexture(key, width, height, drawFn) {
        const canvas = this.textures.createCanvas(key, width, height);
        const ctx = canvas.getContext();
        drawFn(ctx);
        canvas.refresh();
    }
}
