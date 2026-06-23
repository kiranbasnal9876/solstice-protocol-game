// Core Scene - Solstice Protocol
// The final Sector 5 Solar Core Reactor challenge.

class CoreScene extends Phaser.Scene {
    constructor() {
        super("CoreScene");
    }

    init() {
        this.sector = 5;
        this.daylight = 60.0; // Starts low for emergency tension!
        this.repairedTerminals = 0;
        this.totalTerminals = 4;
        
        this.terminals = {
            logic: { repaired: false, x: 0, y: 0, label: null },
            binary: { repaired: false, x: 0, y: 0, label: null },
            debug: { repaired: false, x: 0, y: 0, label: null },
            cipher: { repaired: false, x: 0, y: 0, label: null }
        };

        this.isVictoryTriggered = false;
        this.isGameOverTriggered = false;
    }

    create() {
        UI.init(this.game);
        UI.showHUD(this.sector, this.repairedTerminals, this.totalTerminals);
        UI.updateDaylight(this.daylight);

        const width = this.scale.width;
        const height = this.scale.height;

        // Dark reactor room background
        this.cameras.main.setBackgroundColor("#020306");

        // Renders floor grid programmatically
        this.floors = this.add.group();
        for (let x = 0; x < width; x += 32) {
            for (let y = 0; y < height; y += 32) {
                const f = this.add.image(x + 16, y + 16, 'floor');
                f.setOrigin(0.5);
                f.setTint(0x3d3073); // Dimm sunset theme
                this.floors.add(f);
            }
        }

        // Spawn central rotating reactor core
        this.reactor = this.physics.add.sprite(width / 2, height / 2, 'reactor-core');
        this.reactor.setOrigin(0.5);
        this.reactor.setDepth(2);
        this.physics.add.existing(this.reactor, true);

        // Slow rotation tween
        this.reactorRotationTween = this.tweens.add({
            targets: this.reactor,
            angle: 360,
            duration: 8000,
            repeat: -1
        });

        // Glowing particle emitter orbiting the reactor core
        this.particleEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 20, max: 50 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 1200,
            blendMode: 'ADD'
        });

        // Spawn the player drone near the entrance (bottom center)
        this.player = this.physics.add.sprite(width / 2, height - 60, 'player');
        this.player.setOrigin(0.5);
        this.player.setDepth(3);
        this.player.setCollideWorldBounds(true);
        this.player.body.setCircle(12, 4, 4);

        // Circular boundary walls to keep player inside the reactor room
        this.walls = this.physics.add.staticGroup();
        this.createBoundaryWalls(width, height);
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.reactor);

        // Spawn 4 reactor terminals around the core
        const rPos = 90; // radius from center
        const terminalCoords = [
            { x: width / 2 - rPos, y: height / 2 - rPos, type: 'logic' },
            { x: width / 2 + rPos, y: height / 2 - rPos, type: 'binary' },
            { x: width / 2 - rPos, y: height / 2 + rPos, type: 'debug' },
            { x: width / 2 + rPos, y: height / 2 + rPos, type: 'cipher' }
        ];

        this.terminalGroup = this.add.group();
        terminalCoords.forEach(coord => {
            const term = this.add.sprite(coord.x, coord.y, 'node-unrepaired');
            term.setOrigin(0.5);
            term.setScale(0.8);
            term.setDepth(2);

            this.terminals[coord.type].x = coord.x;
            this.terminals[coord.type].y = coord.y;
            this.terminals[coord.type].label = term;
            
            this.terminalGroup.add(term);
        });

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Cinematic broadcasts
        UI.triggerBroadcast("REACTOR CORE DE-STABILIZED. CRITICAL THERMAL DECAY.");
        
        setTimeout(() => {
            Oracle.printEntry("[ORACLE CORE]: Final interface reached. The Sun is sinking below the horizon. We have roughly 40 seconds to balance the terminal nodes or face absolute entropy.", "oracle-msg");
        }, 1500);
    }

    update(time, delta) {
        if (this.isVictoryTriggered || this.isGameOverTriggered) return;

        // 1. Extreme daylight decay inside Core room (-1.5% per second)
        this.daylight -= (1.3 * delta) / 1000;
        UI.updateDaylight(this.daylight);

        // Update floor colors based on daylight level
        this.updateSkyGrading();

        if (this.daylight <= 0) {
            this.triggerGameOver();
            return;
        }

        // 2. Controls
        this.handlePlayerControls();

        // Emit engine trail
        if (this.player.body.velocity.length() > 10) {
            const angle = this.player.rotation + Math.PI;
            const px = this.player.x + Math.cos(angle) * 12;
            const py = this.player.y + Math.sin(angle) * 12;
            this.particleEmitter.emitParticleAt(px, py);
        }

        // 3. Reactor Particle orbits
        const rTime = time * 0.002;
        const ox = this.reactor.x + Math.cos(rTime) * 60;
        const oy = this.reactor.y + Math.sin(rTime) * 60;
        this.particleEmitter.emitParticleAt(ox, oy);

        // 4. Proximity checking
        this.checkTerminalProximity();
    }

    createBoundaryWalls(w, h) {
        // Place steel block walls outlining the square grid
        for (let x = 0; x < w; x += 32) {
            this.walls.create(x + 16, 16, 'wall');
            this.walls.create(x + 16, h - 16, 'wall');
        }
        for (let y = 32; y < h - 32; y += 32) {
            this.walls.create(16, y + 16, 'wall');
            this.walls.create(w - 16, y + 16, 'wall');
        }
    }

    handlePlayerControls() {
        this.player.setVelocity(0);
        if (!this.input.keyboard.enabled) return;

        let vx = 0;
        let vy = 0;
        const speed = 140;

        if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
        if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
        if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;

        this.player.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            const angle = Math.atan2(vy, vx);
            this.player.setRotation(angle + Math.PI/2);
        }
    }

    checkTerminalProximity() {
        if (!this.input.keyboard.enabled) return;

        Object.keys(this.terminals).forEach(type => {
            const term = this.terminals[type];
            if (term.repaired) return;

            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, term.x, term.y);
            if (dist < 20) {
                this.player.setVelocity(0);
                UI.openPuzzle(
                    type, 
                    this.sector, 
                    () => this.onTerminalRepaired(type), 
                    () => this.onTerminalAborted(term)
                );
            }
        });
    }

    onTerminalRepaired(type) {
        const term = this.terminals[type];
        term.repaired = true;
        term.label.setTexture("node-repaired");

        this.daylight = Math.min(100.0, this.daylight + 20.0);
        UI.updateDaylight(this.daylight);

        this.repairedTerminals++;
        UI.updateNodesCount(this.repairedTerminals, this.totalTerminals);

        UI.triggerBroadcast(`CORE BUFFER [${type.toUpperCase()}] REALIGNED`);

        if (this.repairedTerminals >= this.totalTerminals) {
            this.triggerVictorySequence();
        }
    }

    onTerminalAborted(term) {
        const angle = Phaser.Math.Angle.Between(term.x, term.y, this.player.x, this.player.y);
        this.player.x += Math.cos(angle) * 24;
        this.player.y += Math.sin(angle) * 24;
    }

    updateSkyGrading() {
        let colorHex = 0x3d3073; // deep dusk
        if (this.daylight > 50) {
            colorHex = 0x6f5da8; 
        } else if (this.daylight <= 20) {
            colorHex = 0x11092e; // close to eclipse
        }
        
        this.floors.getChildren().forEach(tile => {
            tile.setTint(colorHex);
        });
    }

    triggerVictorySequence() {
        this.isVictoryTriggered = true;
        this.physics.pause();
        Sound.playWarning(false);
        Sound.playLevelComplete();

        // 1. Refill daylight meter rapidly to 100% (Cinematic effect)
        let fillInterval = setInterval(() => {
            if (this.daylight < 100) {
                this.daylight += 4;
                UI.updateDaylight(this.daylight);
            } else {
                clearInterval(fillInterval);
            }
        }, 30);

        // 2. Exploding particles / flash screen
        this.cameras.main.flash(1000, 255, 230, 150);

        // Change floor tint rapidly back to bright gold
        this.floors.getChildren().forEach(tile => {
            tile.setTint(0xfff5cc);
        });

        // Rapid core rotation
        this.reactorRotationTween.stop();
        this.tweens.add({
            targets: this.reactor,
            angle: 1440,
            duration: 2000,
            scale: 2.2,
            ease: 'Cubic.easeOut'
        });

        // Core explosion particle fountain
        this.time.addEvent({
            delay: 100,
            callback: () => {
                const rx = this.reactor.x;
                const ry = this.reactor.y;
                for (let i = 0; i < 5; i++) {
                    this.particleEmitter.emitParticleAt(rx + Phaser.Math.Between(-30, 30), ry + Phaser.Math.Between(-30, 30));
                }
            },
            repeat: 20
        });

        UI.triggerBroadcast("FUSION MAIN CORE RESTORED. SOLSTICE LOCKED.");
        
        // Oracle final victory broadcast
        setTimeout(() => {
            Oracle.printEntry("[ORACLE CORE SUCCESS]: The mainframe calibration matches the Helios solstice coefficient. Daylight retention locked at 100%. Operator, the sun will not set today. You have saved the light. Congratulations.", "oracle-msg");
        }, 1200);

        // Transition to Victory screen
        setTimeout(() => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.cameras.main.once("camerafadeoutcomplete", () => {
                this.scene.start("EndScene", { victory: true });
            });
        }, 4500);
    }

    triggerGameOver() {
        this.isGameOverTriggered = true;
        this.physics.pause();
        Sound.playWarning(false);
        Sound.playGameOver();

        this.cameras.main.fade(1800, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("EndScene", { victory: false });
        });
    }

    penalizeDaylight(pct) {
        this.daylight = Math.max(0, this.daylight - pct);
        UI.updateDaylight(this.daylight);
    }

    pauseGame() {
        this.physics.pause();
        this.scene.pause();
    }

    resumeGame() {
        this.physics.resume();
        this.scene.resume();
    }
}
