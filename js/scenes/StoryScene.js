// Story Scene - Solstice Protocol
// Types out narrative detailing the failing solar core and the threat of eternal darkness.

class StoryScene extends Phaser.Scene {
    constructor() {
        super("StoryScene");
    }

    init(data) {
        this.targetSector = data.sector || 1;
    }

    create() {
        this.cameras.main.setBackgroundColor("#030408");
        UI.hideHUD();

        const width = this.scale.width;
        const height = this.scale.height;

        // Terminal lines definition
        this.storyLines = [
            ">> HELIOS STATION POWER SYSTEM: FAILURE IN PROGRESS",
            ">> CRITICAL LOG: FUSION CORES DISSIPATING THERMAL CHARGE",
            ">> TIME DATA: JUNE 21 - SUMMER SOLSTICE DETECTED",
            ">> PROTOCOL: SOLSTICE RETENTION FAILURE",
            "",
            "THE LONGEST DAY OF THE YEAR IS ENDING... FOREVER.",
            "THE ANCIENT SOLAR MAIN FRAME - A TURING-COMPLETE QUANTUM ARRAY - ",
            "HAS SUFFERED A CRYPTO-LOGIC INTRUSION. ALL ENERGY HARVESTERS ARE LOCKING UP.",
            "THE SUN IS SETTING. IF THE DAYLIGHT ACCUMULATOR DRIFTS TO 0%,",
            "THE FACILITY WILL COLLAPSE INTO PERMANENT SUB-ZERO DARKNESS.",
            "",
            "YOUR OBJECTIVE:",
            "1. NAVIGATE CORRIDORS TO RE-BALANCE 4 DISTRIBUTED SOLAR COUPLERS.",
            "2. DECRYPT THE CODE BLOCKS AND BOLEAN COUPLING EQUATIONS.",
            "3. ENTER THE CENTRAL CORE IN SECTOR 5 AND STABILIZE THE REACTOR SYSTEM.",
            "",
            "REMAIN VIGILANT. GEMINI ORACLE ONLINE TO GUIDE YOUR COMPUTATION.",
            "PRESERVE THE LIGHT. BEGIN PROTOCOL NOW."
        ];

        this.currentLineIdx = 0;
        this.currentCharIdx = 0;
        this.typedText = "";
        
        // Setup Phaser text object
        this.terminalText = this.add.text(50, 50, "", {
            fontFamily: "Share Tech Mono",
            fontSize: "15px",
            fill: "#39ff14", // Classic neon green green screen terminal
            lineSpacing: 8
        });

        // Add glow shadow
        this.terminalText.setShadow(0, 0, 4, "#39ff14", true, true);

        // Blinking terminal cursor
        this.cursorBlinker = this.add.text(50, 50, "_", {
            fontFamily: "Share Tech Mono",
            fontSize: "15px",
            fill: "#39ff14"
        });
        this.cursorBlinker.setShadow(0, 0, 4, "#39ff14", true, true);

        this.typeNextCharacter();

        // Skip Button
        const skipBtn = this.add.text(width - 50, height - 50, "[ INITIALIZE INTERFACE ]", {
            fontFamily: "Orbitron",
            fontSize: "13px",
            fontWeight: "bold",
            fill: "#ffbd00"
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

        skipBtn.setShadow(0, 0, 5, "#ffbd00", true, true);

        skipBtn.on("pointerover", () => {
            skipBtn.setStyle({ fill: "#ffffff" });
            Sound.playClick();
        });

        skipBtn.on("pointerout", () => {
            skipBtn.setStyle({ fill: "#ffbd00" });
        });

        skipBtn.on("pointerdown", () => {
            this.startGame();
        });

        // Keyboard bypass
        this.input.keyboard.on("keydown-ENTER", () => {
            this.startGame();
        });
        this.input.keyboard.on("keydown-SPACE", () => {
            this.startGame();
        });
    }

    typeNextCharacter() {
        if (this.currentLineIdx >= this.storyLines.length) {
            // Typing complete, show cursor
            this.cursorBlinker.setVisible(true);
            return;
        }

        const line = this.storyLines[this.currentLineIdx];
        
        if (this.currentCharIdx < line.length) {
            this.typedText += line.charAt(this.currentCharIdx);
            this.terminalText.setText(this.typedText);
            
            // Align cursor indicator
            const bounds = this.terminalText.getBounds();
            this.cursorBlinker.setPosition(bounds.x + bounds.width, bounds.y + bounds.height - 18);
            
            this.currentCharIdx++;
            
            // Speed settings
            let delay = 20;
            if (line.charAt(this.currentCharIdx - 1) === '.') delay = 350;
            if (line.charAt(this.currentCharIdx - 1) === ',') delay = 150;

            // Occasional typing beeps
            if (this.currentCharIdx % 3 === 0) {
                Sound.playClick();
            }

            this.time.delayedCall(delay, this.typeNextCharacter, [], this);
        } else {
            // Move to next line
            this.typedText += "\n";
            this.currentLineIdx++;
            this.currentCharIdx = 0;
            this.time.delayedCall(150, this.typeNextCharacter, [], this);
        }
    }

    startGame() {
        Sound.playLevelComplete();
        this.scene.start("MainScene", { sector: this.targetSector });
    }
}
