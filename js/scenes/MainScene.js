// Main Scene - Solstice Protocol
// Handles top-down exploration, tilemap generation, collision rules, daylight degradation, and color tinting.

class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    init(data) {
        this.sector = data.sector || 1;
        this.daylight = 100.0;
        this.repairedNodesCount = 0;
        this.totalNodesCount = 4;
        
        // Puzzle nodes mapping
        this.nodeStates = {
            logic: { repaired: false, x: 0, y: 0, object: null },
            binary: { repaired: false, x: 0, y: 0, object: null },
            debug: { repaired: false, x: 0, y: 0, object: null },
            cipher: { repaired: false, x: 0, y: 0, object: null }
        };

        this.isGameOverTriggered = false;
    }

    create() {
        UI.init(this.game);
        UI.showHUD(this.sector, this.repairedNodesCount, this.totalNodesCount);
        UI.updateDaylight(this.daylight);

        // Generate levels layouts procedurally
        this.generateMap();

        // Spawn player drone
        this.spawnPlayer();

        // Setup controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Camera follow
        this.cameras.main.setBounds(0, 0, this.mapWidth * 32, this.mapHeight * 32);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.2);

        // Particle engines
        this.particleEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 800,
            blendMode: 'ADD'
        });

        // Broadcast level start
        UI.triggerBroadcast(`Helios facility Sector ${this.sector} online. Access codes required.`);
        
        // Initial Oracle Lore Inject
        setTimeout(() => {
            Oracle.printEntry(`[ORACLE]: Sector ${this.sector} entry recorded. Locate the four orange node couplers in this wing. Re-balance their logic values to lock in daylight.`, "oracle-msg");
        }, 1500);
    }

    update(time, delta) {
        if (this.isGameOverTriggered) return;

        // 1. Update Daylight Meter
        // Decay speed increases with levels
        const decayRate = 0.06 + (this.sector * 0.015); 
        this.daylight -= (decayRate * delta) / 1000;
        
        UI.updateDaylight(this.daylight);

        // Transition environmental colors based on daylight level
        this.updateSkyGrading();

        // Lose condition check
        if (this.daylight <= 0) {
            this.triggerGameOver();
            return;
        }

        // 2. Player Controls
        this.handlePlayerMovement();
        
        // Particle thruster trail following player orientation
        if (this.player.body.velocity.length() > 10) {
            const angle = this.player.rotation + Math.PI; // opposite direction
            const px = this.player.x + Math.cos(angle) * 12;
            const py = this.player.y + Math.sin(angle) * 12;
            this.particleEmitter.emitParticleAt(px, py);
        }

        // 3. Node distance checking
        this.checkNodeProximity();
    }

    generateMap() {
        // Map layout definitions (1 = Wall, 0 = Floor)
        // Static maps scaled from Sector 1 to 4
        const maps = [
            // Sector 1: Straight corridors, simple loops
            [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,3,1],
                [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
                [1,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,1],
                [1,0,1,0,1,1,1,1,1,0,0,1,1,1,1,1,0,1,0,1],
                [1,2,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
                [1,1,1,0,1,0,1,1,1,0,0,1,1,1,0,1,0,1,1,1],
                [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
                [1,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1],
                [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            ],
            // Sector 2: Split wings (T-shape)
            [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,1,0,0,3,1],
                [1,0,1,0,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,1],
                [1,0,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1,0,1],
                [1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,1],
                [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,1],
                [1,0,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1,0,1],
                [1,0,1,0,1,0,1,1,0,1,1,0,1,1,0,1,0,1,0,1],
                [1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            ]
        ];

        // Choose layouts, wrapping if higher sector
        const mapData = maps[(this.sector - 1) % maps.length];
        this.mapHeight = mapData.length;
        this.mapWidth = mapData[0].length;

        // Physics group for walls
        this.walls = this.physics.add.staticGroup();
        this.floors = this.add.group();

        // Render grids and register colliders
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const cell = mapData[y][x];
                const px = x * 32 + 16;
                const py = y * 32 + 16;

                if (cell === 1) {
                    const w = this.walls.create(px, py, 'wall');
                    w.setOrigin(0.5);
                    w.refreshBody();
                } else {
                    const f = this.add.image(px, py, 'floor');
                    f.setOrigin(0.5);
                    this.floors.add(f);

                    if (cell === 2) {
                        this.spawnX = px;
                        this.spawnY = py;
                    } else if (cell === 3) {
                        this.exitX = px;
                        this.exitY = py;
                    }
                }
            }
        }

        // Place exit hatch (blocked by energy shield initially)
        this.exitShield = this.add.graphics();
        this.drawExitShield(true);
        this.physics.add.existing(this.exitShield, true);

        // Place nodes at procedural endpoints
        const nodeCoordinates = [
            { x: 3 * 32 + 16, y: 1 * 32 + 16, type: 'logic' },
            { x: 14 * 32 + 16, y: 1 * 32 + 16, type: 'binary' },
            { x: 3 * 32 + 16, y: 9 * 32 + 16, type: 'debug' },
            { x: 17 * 32 + 16, y: 9 * 32 + 16, type: 'cipher' }
        ];

        this.nodeGroup = this.add.group();

        nodeCoordinates.forEach(coord => {
            const nodeSprite = this.add.sprite(coord.x, coord.y, 'node-unrepaired');
            nodeSprite.setOrigin(0.5);
            nodeSprite.setDepth(2);
            
            // Neon rotating ring effect
            this.tweens.add({
                targets: nodeSprite,
                angle: 360,
                duration: 4000,
                repeat: -1
            });

            this.nodeStates[coord.type].x = coord.x;
            this.nodeStates[coord.type].y = coord.y;
            this.nodeStates[coord.type].object = nodeSprite;

            this.nodeGroup.add(nodeSprite);
        });
    }

    drawExitShield(active) {
        this.exitShield.clear();
        if (active) {
            this.exitShield.lineStyle(3, 0xff2e63, 0.8);
            this.exitShield.strokeRect(this.exitX - 16, this.exitY - 16, 32, 32);
            this.exitShield.fillStyle(0xff2e63, 0.2);
            this.exitShield.fillRect(this.exitX - 16, this.exitY - 16, 32, 32);
        } else {
            this.exitShield.lineStyle(3, 0x39ff14, 0.8);
            this.exitShield.strokeRect(this.exitX - 16, this.exitY - 16, 32, 32);
            this.exitShield.fillStyle(0x39ff14, 0.25);
            this.exitShield.fillRect(this.exitX - 16, this.exitY - 16, 32, 32);
        }
    }

    spawnPlayer() {
        this.player = this.physics.add.sprite(this.spawnX, this.spawnY, 'player');
        this.player.setOrigin(0.5);
        this.player.setDepth(3);
        this.player.setCollideWorldBounds(true);
        this.player.body.setCircle(12, 4, 4);

        // Collider rules
        this.physics.add.collider(this.player, this.walls);
    }

    handlePlayerMovement() {
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

        // Rotate drone in movement direction
        if (vx !== 0 || vy !== 0) {
            const angle = Math.atan2(vy, vx);
            this.player.setRotation(angle + Math.PI/2); // Align triangle nose
        }
    }

    checkNodeProximity() {
        // If interface is active, skip checks
        if (!this.input.keyboard.enabled) return;

        Object.keys(this.nodeStates).forEach(type => {
            const node = this.nodeStates[type];
            if (node.repaired) return;

            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y);
            if (dist < 24) {
                // Halt player
                this.player.setVelocity(0);
                
                // Trigger Puzzle interface
                UI.openPuzzle(
                    type, 
                    this.sector, 
                    () => this.onNodeRepaired(type), 
                    () => this.onNodeAborted(node)
                );
            }
        });

        // Sector Exit trigger check
        const exitDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.exitX, this.exitY);
        if (exitDist < 20) {
            if (this.repairedNodesCount >= this.totalNodesCount) {
                this.completeSector();
            } else {
                // Bounce back
                this.player.x -= (this.player.x - this.exitX) * 0.5;
                this.player.y -= (this.player.y - this.exitY) * 0.5;
                UI.triggerBroadcast("CORES UNAVAILABLE // SECURE ALL SECTORS FIRST");
                Sound.playClick();
            }
        }
    }

    onNodeRepaired(type) {
        const node = this.nodeStates[type];
        node.repaired = true;
        node.object.setTexture("node-repaired");
        
        // +25% daylight recovery
        this.daylight = Math.min(100.0, this.daylight + 25.0);
        UI.updateDaylight(this.daylight);

        this.repairedNodesCount++;
        UI.updateNodesCount(this.repairedNodesCount, this.totalNodesCount);

        // Blit connecting particles to reactor doors
        this.tweens.add({
            targets: node.object,
            scale: 1.3,
            duration: 200,
            yoyo: true
        });

        UI.triggerBroadcast(`NODE [${type.toUpperCase()}] HARVESTING FUSION STABLE`);

        if (this.repairedNodesCount >= this.totalNodesCount) {
            // Unlock Sector Portal
            this.drawExitShield(false);
            UI.triggerBroadcast("ALL SECTOR COUPLERS LOCKED. PORTAL SHIELD OFFLINE.");
            Oracle.printEntry("[ORACLE]: Mainframe gateway coordinates aligned. Proceed to the exit portal hatch.", "oracle-msg");
        }
    }

    onNodeAborted(node) {
        // Bounce player backwards from the node center
        const angle = Phaser.Math.Angle.Between(node.x, node.y, this.player.x, this.player.y);
        this.player.x += Math.cos(angle) * 32;
        this.player.y += Math.sin(angle) * 32;
    }

    penalizeDaylight(pct) {
        this.daylight = Math.max(0, this.daylight - pct);
        UI.updateDaylight(this.daylight);
    }

    updateSkyGrading() {
        // Dynamic screen tinting to express the June Solstice Theme
        // morning (100-75) -> afternoon (75-50) -> sunset (50-25) -> darkness (25-0)
        let colorHex = 0xffffff;

        if (this.daylight > 75) {
            // Midday golden/cyan
            colorHex = 0xfff3cc;
        } else if (this.daylight > 50) {
            // Warm amber
            colorHex = 0xffc477;
        } else if (this.daylight > 25) {
            // Dark sunset violet
            colorHex = 0xa45da8;
        } else {
            // Deep space navy
            colorHex = 0x3d3073;
        }

        // Tint all floors dynamically to darken layout as time drops
        this.floors.getChildren().forEach(tile => {
            tile.setTint(colorHex);
        });

        // Set camera tint background
        let camColor = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(0x020308), // Night
            Phaser.Display.Color.ValueToColor(0x0e172a), // Daylight
            100,
            this.daylight
        );
        this.cameras.main.setBackgroundColor(camColor);
    }

    pauseGame() {
        this.physics.pause();
        this.scene.pause();
    }

    resumeGame() {
        this.physics.resume();
        this.scene.resume();
    }

    completeSector() {
        this.isGameOverTriggered = true;
        Sound.playLevelComplete();

        // Increment level tracker
        const nextSector = this.sector + 1;
        localStorage.setItem("solstice_protocol_level", String(nextSector));

        // Fade scene out
        this.cameras.main.fade(600, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
            if (nextSector > 4) {
                // Initiate Final Core scene
                this.scene.start("CoreScene");
            } else {
                // Loop next Main Sector
                this.scene.start("StoryScene", { sector: nextSector });
            }
        });
    }

    triggerGameOver() {
        this.isGameOverTriggered = true;
        this.physics.pause();
        Sound.playWarning(false);
        Sound.playGameOver();

        this.cameras.main.fade(1500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("EndScene", { victory: false });
        });
    }
}
