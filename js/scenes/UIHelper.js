// UI Helper - Solstice Protocol
// Synchronizes HTML HUD overlays, puzzle modal interactions, and Gemini Oracle terminal states with Phaser.

const UI = {
    game: null,
    onPuzzleCompleteCallback: null,
    onPuzzleAbortCallback: null,
    listenersAttached: false,

    init(phaserGame) {
        this.game = phaserGame;
        if (!this.listenersAttached) {
            this.setupEventListeners();
            this.listenersAttached = true;
        }
    },

    getActiveGameplayScene() {
        if (this.game && this.game.scene) {
            if (this.game.scene.isActive("MainScene")) {
                return this.game.scene.getScene("MainScene");
            }
            if (this.game.scene.isActive("CoreScene")) {
                return this.game.scene.getScene("CoreScene");
            }
        }
        return null;
    },

    setupEventListeners() {
        // Mute sound button
        const muteBtn = document.getElementById("toggle-audio-btn");
        muteBtn.addEventListener("click", () => {
            const muted = Sound.toggleMute();
            muteBtn.textContent = muted ? "UNMUTE SOUND" : "MUTE SOUND";
            Sound.playClick();
        });

        // Oracle panel toggle buttons
        const oracleBtn = document.getElementById("oracle-btn");
        const closeOracleBtn = document.getElementById("close-oracle-btn");
        const oraclePanel = document.getElementById("oracle-panel");

        oracleBtn.addEventListener("click", () => {
            oraclePanel.classList.toggle("oracle-closed");
            Sound.playClick();
            if (!oraclePanel.classList.contains("oracle-closed")) {
                Oracle.scrollToBottom();
                document.getElementById("oracle-input").focus();
            }
        });

        closeOracleBtn.addEventListener("click", () => {
            oraclePanel.classList.add("oracle-closed");
            Sound.playClick();
        });

        // Set API key button
        const setApiKeyBtn = document.getElementById("set-api-key-btn");
        if (setApiKeyBtn) {
            setApiKeyBtn.addEventListener("click", () => {
                Sound.playClick();
                const key = prompt("Enter Gemini API Key (saved locally in your browser):\n\nGet a free API key from Google AI Studio.");
                if (key !== null) {
                    const cleanKey = key.trim();
                    if (cleanKey) {
                        localStorage.setItem("solstice_gemini_api_key", cleanKey);
                        Oracle.printEntry("API CONFIGURATION: Live Gemini gateway authenticated.", "system-msg");
                    } else {
                        localStorage.removeItem("solstice_gemini_api_key");
                        Oracle.printEntry("API CONFIGURATION: Live key removed. Switched to offline mainframe database.", "system-msg");
                    }
                }
            });
        }

        // Oracle input submission
        const oracleForm = document.getElementById("oracle-form");
        oracleForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const input = document.getElementById("oracle-input");
            const text = input.value.trim();
            if (text) {
                Oracle.handleQuery(text);
            }
        });

        // Prevent Phaser from capturing inputs when typing in the Oracle input
        const oracleInput = document.getElementById("oracle-input");
        if (oracleInput) {
            oracleInput.addEventListener("focus", () => {
                const activeScene = this.getActiveGameplayScene();
                if (activeScene) {
                    activeScene.input.keyboard.enabled = false;
                }
            });
            oracleInput.addEventListener("blur", () => {
                const isModalOpen = document.getElementById('puzzle-modal') && !document.getElementById('puzzle-modal').classList.contains('modal-hidden');
                if (!isModalOpen) {
                    const activeScene = this.getActiveGameplayScene();
                    if (activeScene) {
                        activeScene.input.keyboard.enabled = true;
                    }
                }
            });
        }

        // Puzzle Hints within the Modal
        const puzzleHintBtn = document.getElementById("puzzle-oracle-hint-btn");
        puzzleHintBtn.addEventListener("click", () => {
            Sound.playClick();
            // Force open Oracle and inject hint
            oraclePanel.classList.remove("oracle-closed");
            const currentType = window.activePuzzleType || "general";
            Oracle.printEntry(`Requesting hint for node decryptor...`, "system-msg");
            setTimeout(() => {
                const hintText = Puzzles.hints[currentType] || "Locate the nodes and complete the sequences.";
                Oracle.streamReply(`[ORACLE HINT]: ${hintText}`);
            }, 300);
        });

        // Submit Puzzle button
        const submitPuzzleBtn = document.getElementById("puzzle-submit-btn");
        submitPuzzleBtn.addEventListener("click", () => {
            this.submitPuzzle();
        });

        // Abort Puzzle button
        const bypassPuzzleBtn = document.getElementById("puzzle-bypass-btn");
        bypassPuzzleBtn.addEventListener("click", () => {
            Sound.playClick();
            this.closePuzzle();
            if (this.onPuzzleAbortCallback) {
                this.onPuzzleAbortCallback();
            }
        });

        // Pause / Resume buttons
        const pauseBtn = document.getElementById("pause-btn");
        const resumeBtn = document.getElementById("resume-btn");
        const restartBtn = document.getElementById("restart-btn");
        const pauseModal = document.getElementById("pause-modal");

        pauseBtn.addEventListener("click", () => {
            Sound.playClick();
            const activeScene = this.getActiveGameplayScene();
            if (activeScene) {
                if (typeof activeScene.pauseGame === "function") {
                    activeScene.pauseGame();
                } else {
                    activeScene.physics.pause();
                    activeScene.scene.pause();
                }
                pauseModal.classList.remove("overlay-hidden");
            }
        });

        resumeBtn.addEventListener("click", () => {
            Sound.playClick();
            const activeScene = this.getActiveGameplayScene();
            if (activeScene) {
                if (typeof activeScene.resumeGame === "function") {
                    activeScene.resumeGame();
                } else {
                    activeScene.physics.resume();
                    activeScene.scene.resume();
                }
                pauseModal.classList.add("overlay-hidden");
            }
        });

        restartBtn.addEventListener("click", () => {
            Sound.playClick();
            pauseModal.classList.add("overlay-hidden");
            // Reset local storage level progression and reboot
            localStorage.removeItem("solstice_protocol_level");
            location.reload();
        });
    },

    showHUD(level, repaired, total) {
        document.getElementById("hud").classList.remove("hud-hidden");
        document.getElementById("current-sector").textContent = String(level).padStart(2, '0');
        this.updateNodesCount(repaired, total);
    },

    hideHUD() {
        document.getElementById("hud").classList.add("hud-hidden");
    },

    updateNodesCount(repaired, total) {
        document.getElementById("nodes-repaired").textContent = repaired;
        document.getElementById("nodes-total").textContent = total;
    },

    updateDaylight(pct) {
        const bar = document.getElementById("daylight-bar");
        const text = document.getElementById("daylight-pct");
        const ticker = document.getElementById("alert-ticker");
        
        const roundedPct = Math.max(0, Math.min(100, Math.round(pct)));
        text.textContent = roundedPct;
        bar.style.width = roundedPct + "%";

        // Dynamic light bar color grading
        if (roundedPct > 50) {
            bar.style.background = "linear-gradient(90deg, #ff5e00, var(--neon-gold), #ffe600)";
            bar.style.boxShadow = "0 0 10px var(--neon-gold)";
            ticker.className = "alert-normal";
            ticker.textContent = "ALL SOLAR COLLECTORS OPERATIONAL";
            Sound.playWarning(false);
        } else if (roundedPct > 25) {
            bar.style.background = "linear-gradient(90deg, #ff3300, #ff8c00)";
            bar.style.boxShadow = "0 0 10px #ff8c00";
            ticker.className = "alert-warning";
            ticker.textContent = "WARNING: THERMAL COHERENCE DROPPING";
            Sound.playWarning(false);
        } else {
            bar.style.background = "linear-gradient(90deg, #ff0055, var(--neon-red))";
            bar.style.boxShadow = "0 0 15px var(--neon-red)";
            ticker.className = "alert-critical";
            ticker.textContent = "CRITICAL ALERT: SOLAR ECLIPSE IMMINENT";
            // Start low-frequency audio siren
            Sound.playWarning(true);
        }
    },

    // Trigger Broadcast updates
    triggerBroadcast(msg) {
        const ticker = document.getElementById("alert-ticker");
        ticker.textContent = "BROADCAST: " + msg.toUpperCase();
        
        // Temporarily override styles
        const oldClass = ticker.className;
        ticker.className = "alert-critical";
        
        // Shake screen inside HTML slightly
        const app = document.getElementById("app");
        app.style.animation = "shake-env 0.3s ease";
        setTimeout(() => {
            app.style.animation = "none";
        }, 300);

        setTimeout(() => {
            // Restore proper class
            this.updateDaylight(parseFloat(document.getElementById("daylight-pct").textContent));
        }, 4000);
    },

    openPuzzle(type, sector, onComplete, onAbort) {
        window.activePuzzleType = type;
        this.onPuzzleCompleteCallback = onComplete;
        this.onPuzzleAbortCallback = onAbort;

        const modal = document.getElementById("puzzle-modal");
        const title = document.getElementById("puzzle-title");
        const sectorLabel = document.getElementById("puzzle-sector");
        const workspace = document.getElementById("puzzle-workspace");

        const puzzleData = Puzzles.generate(type, sector);

        title.textContent = puzzleData.title;
        sectorLabel.textContent = `SECTOR ${sector} // NODE ${type.toUpperCase()}`;
        document.getElementById("puzzle-desc").textContent = puzzleData.description;
        workspace.innerHTML = puzzleData.html;

        // Bind events (for binary buttons click)
        Puzzles.bindEvents();

        // Pause keyboard input in Phaser active scene if running
        const activeScene = this.getActiveGameplayScene();
        if (activeScene) {
            activeScene.input.keyboard.enabled = false;
        }

        // Show Modal overlay
        modal.classList.remove("modal-hidden");

        // Inform user through Oracle
        Oracle.printEntry(`Interfacing with Solar Node type: [${type.toUpperCase()}]`, 'system-msg');
    },

    closePuzzle() {
        const modal = document.getElementById("puzzle-modal");
        modal.classList.add("modal-hidden");
        window.activePuzzleType = null;

        // Re-enable Phaser active scene keyboard
        const activeScene = this.getActiveGameplayScene();
        if (activeScene) {
            activeScene.input.keyboard.enabled = true;
        }
    },

    submitPuzzle() {
        const isCorrect = Puzzles.checkAnswer();

        if (isCorrect) {
            Sound.playSuccess();
            this.closePuzzle();
            Oracle.printEntry("Node repaired. Daylight protocol stabilized.", "oracle-msg");
            if (this.onPuzzleCompleteCallback) {
                this.onPuzzleCompleteCallback();
            }
        } else {
            Sound.playWarning(true);
            setTimeout(() => Sound.playWarning(false), 500);
            
            // Deduct daylight as penalty
            const activeScene = this.getActiveGameplayScene();
            if (activeScene) {
                if (typeof activeScene.penalizeDaylight === "function") {
                    activeScene.penalizeDaylight(8);
                } else {
                    activeScene.daylight = Math.max(0, activeScene.daylight - 8);
                }
            }
            
            Oracle.printEntry("ERROR: Alignment key rejected. Daylight levels degraded.", "system-msg");
            
            // Add red alert overlay effect in workspace
            const workspace = document.getElementById("puzzle-workspace");
            workspace.style.borderColor = "var(--neon-red)";
            workspace.style.boxShadow = "0 0 15px var(--neon-red)";
            setTimeout(() => {
                workspace.style.borderColor = "rgba(0, 240, 255, 0.25)";
                workspace.style.boxShadow = "none";
            }, 800);
        }
    }
};

// Add shaking animation for html container during critical alerts
const styleSheet = document.createElement("style");
styleSheet.textContent = `
@keyframes shake-env {
    0%, 100% { transform: translate(0, 0); }
    10%, 30%, 50%, 70%, 90% { transform: translate(-3px, 2px); }
    20%, 40%, 60%, 80% { transform: translate(3px, -2px); }
}
`;
document.head.appendChild(styleSheet);
