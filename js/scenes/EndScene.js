// End Scene - Solstice Protocol
// Renders the Victory and Game Over screens.

class EndScene extends Phaser.Scene {
    constructor() {
        super("EndScene");
    }

    init(data) {
        this.isVictory = data.victory;
    }

    create() {
        UI.hideHUD();
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor(this.isVictory ? "#070b13" : "#020306");

        // Golden background sparks on victory, red emergency sparks on game over
        const particleColor = this.isVictory ? 0xffbd00 : 0xff2e63;
        this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 5000,
            speed: { min: 5, max: 15 },
            scale: { start: 0.1, end: 0.8 },
            alpha: { start: 0.1, end: 0.4 },
            frequency: 200,
            tint: particleColor,
            blendMode: 'ADD'
        });

        // 1. Core Header
        const titleTextStr = this.isVictory ? "PROTOCOL SECURED" : "SOLAR ECLIPSE DETECTED";
        const titleColor = this.isVictory ? "#39ff14" : "#ff2e63";

        const titleText = this.add.text(width / 2, height / 3 - 30, titleTextStr, {
            fontFamily: "Orbitron",
            fontSize: "36px",
            fontWeight: "900",
            fill: titleColor,
            align: "center"
        }).setOrigin(0.5);
        titleText.setShadow(0, 0, 15, titleColor, true, true);

        // Subtitle
        const subTextStr = this.isVictory 
            ? "THE LONGEST DAY OF THE YEAR HAS BEEN PRESERVED." 
            : "FACILITY DEACTIVATED. THERMAL EXPANSION DEGRADED TO 0%.";
        
        const subText = this.add.text(width / 2, height / 3 + 25, subTextStr, {
            fontFamily: "Share Tech Mono",
            fontSize: "14px",
            fill: "#a0aab8"
        }).setOrigin(0.5);

        // 2. Oracle Final quote box
        const quoteTextStr = this.isVictory
            ? "[ORACLE v1.0.4]: 'The light remains. By matching the solar equations, we have proved that entropy is not a boundary, but a parameter to solve. Alan Turing would be proud of your alignment logic.'"
            : "[ORACLE v1.0.4]: 'Mainframe connection severed. Reactor temperature: Absolute Zero. Darkness has triumphed. System reboot required to reload calibration archives.'";

        const quoteBox = this.add.text(width / 2, height / 2 + 10, quoteTextStr, {
            fontFamily: "Share Tech Mono",
            fontSize: "12px",
            fill: this.isVictory ? "#00f0ff" : "#ff2e63",
            align: "center",
            wordWrap: { width: 500, useAdvancedWrap: true },
            lineSpacing: 5
        }).setOrigin(0.5);

        if (this.isVictory) {
            quoteBox.setShadow(0, 0, 4, "#00f0ff", true, true);
        }

        // 3. Restart/Reboot Action Button
        const btnTextStr = this.isVictory ? "[ INITIALIZE NEW CYCLES ]" : "[ REBOOT MAIN SYSTEM ]";
        const btnColor = this.isVictory ? "#ffbd00" : "#ffffff";
        
        const actionBtn = this.add.text(width / 2, height - 120, btnTextStr, {
            fontFamily: "Orbitron",
            fontSize: "18px",
            fontWeight: "700",
            fill: btnColor,
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        if (this.isVictory) {
            actionBtn.setShadow(0, 0, 6, "#ffbd00", true, true);
        }

        actionBtn.on("pointerover", () => {
            actionBtn.setStyle({ fill: this.isVictory ? "#ffffff" : "#ff2e63" });
            Sound.playClick();
        });

        actionBtn.on("pointerout", () => {
            actionBtn.setStyle({ fill: btnColor });
        });

        actionBtn.on("pointerdown", () => {
            Sound.playLevelComplete();
            
            // Clear progress on game restart
            localStorage.removeItem("solstice_protocol_level");
            
            this.scene.start("MenuScene");
        });
    }
}
