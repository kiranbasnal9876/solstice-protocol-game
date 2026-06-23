// Menu Scene - Solstice Protocol
// Displays glowing sci-fi titles, boots audio nodes on user click, and handles level branching.

class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create() {
        // Retrieve level progress from Local Storage
        let savedLevel = localStorage.getItem("solstice_protocol_level");
        this.maxUnlockedLevel = savedLevel ? parseInt(savedLevel) : 1;

        const width = this.scale.width;
        const height = this.scale.height;

        // Background dark star grid simulation
        this.cameras.main.setBackgroundColor("#05070d");
        
        // Programmatic grid particle effect in menu
        const emitter = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 6000,
            speed: { min: 2, max: 10 },
            scale: { start: 0.2, end: 1 },
            alpha: { start: 0.1, end: 0.4 },
            frequency: 150,
            blendMode: 'ADD'
        });

        // 1. Title Logo Text
        const titleText = this.add.text(width / 2, height / 3 - 40, "SOLSTICE PROTOCOL", {
            fontFamily: "Orbitron",
            fontSize: "44px",
            fontWeight: "900",
            fill: "#00f0ff",
            align: "center"
        }).setOrigin(0.5);
        titleText.setShadow(0, 0, 15, "#00f0ff", true, true);

        // Subtitle
        const subTitle = this.add.text(width / 2, height / 3 + 15, "SECURE THE REACTOR // SAVE THE LONGEST DAY", {
            fontFamily: "Share Tech Mono",
            fontSize: "14px",
            fill: "#ffbd00",
            letterSpacing: 4
        }).setOrigin(0.5);
        subTitle.setShadow(0, 0, 5, "#ffbd00", true, true);

        // 2. Main Action Button: Start Game
        const playText = this.add.text(width / 2, height / 2 + 10, "[ START PROTOCOL ]", {
            fontFamily: "Orbitron",
            fontSize: "22px",
            fontWeight: "700",
            fill: "#ffffff",
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        playText.setInteractive({ useHandCursor: true });

        // Hover animations
        playText.on("pointerover", () => {
            playText.setStyle({ fill: "#00f0ff" });
            playText.setShadow(0, 0, 10, "#00f0ff", true, true);
            Sound.playClick();
        });

        playText.on("pointerout", () => {
            playText.setStyle({ fill: "#ffffff" });
            playText.setShadow(0, 0, 0, "#000000", false, false);
        });

        playText.on("pointerdown", () => {
            // Initialize sound on user interaction
            Sound.init();
            Sound.playLevelComplete();
            
            // Go to Intro Story scene
            this.scene.start("StoryScene", { sector: 1 });
        });

        // 3. Level Select Section
        this.add.text(width / 2, height / 2 + 90, "SECTOR DECK ACCESS", {
            fontFamily: "Share Tech Mono",
            fontSize: "12px",
            fill: "#5a6b8c"
        }).setOrigin(0.5);

        const buttonSpacing = 65;
        const startX = width / 2 - (buttonSpacing * 2);

        for (let i = 1; i <= 5; i++) {
            const isUnlocked = i <= this.maxUnlockedLevel;
            const xPos = startX + (i - 1) * buttonSpacing;
            const yPos = height / 2 + 130;

            // Draw level button circular backing programmatically
            const graphics = this.add.graphics();
            graphics.lineStyle(1.5, isUnlocked ? 0x00f0ff : 0x2d3954, 0.8);
            graphics.strokeCircle(xPos, yPos, 20);
            if (isUnlocked) {
                graphics.fillStyle(0x00f0ff, 0.05);
                graphics.fillCircle(xPos, yPos, 20);
            }

            const btnText = this.add.text(xPos, yPos, String(i), {
                fontFamily: "Orbitron",
                fontSize: "14px",
                fontWeight: "bold",
                fill: isUnlocked ? "#00f0ff" : "#2d3954"
            }).setOrigin(0.5);

            if (isUnlocked) {
                btnText.setInteractive({ useHandCursor: true });
                btnText.on("pointerover", () => {
                    btnText.setStyle({ fill: "#ffffff" });
                    Sound.playClick();
                    graphics.clear();
                    graphics.lineStyle(2, 0xffbd00, 1);
                    graphics.fillStyle(0xffbd00, 0.1);
                    graphics.strokeCircle(xPos, yPos, 20);
                    graphics.fillCircle(xPos, yPos, 20);
                });

                btnText.on("pointerout", () => {
                    btnText.setStyle({ fill: "#00f0ff" });
                    graphics.clear();
                    graphics.lineStyle(1.5, 0x00f0ff, 0.8);
                    graphics.fillStyle(0x00f0ff, 0.05);
                    graphics.strokeCircle(xPos, yPos, 20);
                    graphics.fillCircle(xPos, yPos, 20);
                });

                btnText.on("pointerdown", () => {
                    Sound.init();
                    Sound.playLevelComplete();
                    
                    // Skip story if select level directly
                    this.scene.start("MainScene", { sector: i });
                });
            }
        }

        // 4. Instructions footer
        this.add.text(width / 2, height - 40, "CONTROLS: WASD / ARROW KEYS TO EXPLORE // MOUSE TO INTERFACE COUPLERS", {
            fontFamily: "Share Tech Mono",
            fontSize: "11px",
            fill: "#4f6080"
        }).setOrigin(0.5);
    }
}
