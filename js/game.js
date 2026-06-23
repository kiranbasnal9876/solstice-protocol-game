// Main Game Initialization - Solstice Protocol
// Sets up Phaser 3 scale modes, arcade physics properties, and scene registration.

window.addEventListener("load", () => {
    // Phaser 3 configuration
    const config = {
        type: Phaser.AUTO,
        parent: "game-container",
        width: 800,
        height: 550,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [
            BootScene,
            MenuScene,
            StoryScene,
            MainScene,
            CoreScene,
            EndScene
        ]
    };

    // Instantiate Phaser Game
    const game = new Phaser.Game(config);

    // Bind UI elements to Oracle chatbot console
    Oracle.init("oracle-log", "oracle-input");

    // Clear active puzzle indicators on startup
    window.activePuzzleType = null;
});
