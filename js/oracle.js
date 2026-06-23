// Gemini Oracle AI Engine - Solstice Protocol
// Manages chatbot inputs, contextual hints, Turing lore database, and typewriter stream.

class GeminiOracle {
    constructor() {
        this.logElement = null;
        this.inputElement = null;
        this.isTyping = false;
        this.chatHistory = [];
        this.lastRequestTime = 0;
        
        // Turing Archives and Facility Lore Database
        this.loreDB = {
            turing: [
                "Alan M. Turing (1912-1954) was a British mathematician and logician. He is widely considered the father of theoretical computer science and artificial intelligence.",
                "Turing's universal machine model proved that a simple device performing basic tape-reading instructions could perform *any* logical computation. This solar mainframe is built on similar principles.",
                "During WWII, Turing designed the 'Bombe' cryptanalytic machine to crack the German Enigma ciphers. The cipher nodes in Sector 4 are powered by mechanical gears resembling his bombe crypt-analysis gears.",
                "In his 1952 paper, Turing described the chemical basis of morphogenesis, explaining how natural patterns (like solar flares and sunflower seeds) emerge from simple equations. Solstice Protocol utilizes these equations to align solar arrays."
            ],
            solstice: [
                "The June Solstice represents the tipping point of solar energy - the longest day of the year. The solar facility was designed to capture this peak flux and store it for winter cycles.",
                "If daylight hits 0%, the facility collapses into permanent sub-zero darkness. The 'Solstice Protocol' is a failsafe to reboot the main collector arrays and force solar retention.",
                "Ancient solar alignment structures align with the horizon on the solstice. Our solar mainframe maps computational steps directly to these astronomical angles."
            ],
            facility: [
                "Helios Solar Mainframe was built in 2088. It uses quantum-state silicon gates cooled by liquid helium to route atmospheric plasma.",
                "The facility's core requires constant binary equilibrium. When the nodes corrupted, the logic loops locked up, starving the batteries of daylight.",
                "The final Solar Core contains four quantum buffers. You must align their states to match the solstice coefficients before the sunset overrides the restart."
            ]
        };

        // Context-aware hints for the puzzles
        this.hints = {
            logic: "LOGIC PATTERN: Examine the sequence of numbers. It represents the solstice duration calculation. Determine the difference between consecutive numbers. Is it increasing? Decreasing? Add the next step to complete the code.",
            binary: "BINARY COUPLER: Toggle the binary switches. Active switches represent 1, inactive represent 0. Add their decimal values together (8, 4, 2, 1) to match the target code requested by the solar couplers.",
            debug: "DEBUGGING MODULE: Review the code blocks. Look for simple programmer oversights, such as missing semicolons, incorrect variables, or index boundaries (e.g. using '<=' instead of '<' in zero-indexed arrays).",
            cipher: "TURING CIPHER: The symbols are encoded using Caesar shift matrices. Shift each character backwards or forwards by the key size listed below the buffer to reveal the Solstice keyword.",
            core: "SOLAR REACTOR CORE: The final core requires you to combine all operations. Feed the logical outputs of the previous sectors into the central accumulator to trigger the reactor restart."
        };
    }

    init(logId, inputId) {
        this.logElement = document.getElementById(logId);
        this.inputElement = document.getElementById(inputId);
    }

    getApiKey() {
        return localStorage.getItem("solstice_gemini_api_key") || window.GEMINI_API_KEY || "";
    }

    getGameContext() {
        let context = "";
        
        // Find active level/sector
        let activeSectorNum = 1;
        let activeDaylight = 100;
        
        // Check active scene
        if (window.UI && typeof window.UI.getActiveGameplayScene === "function") {
            const activeScene = window.UI.getActiveGameplayScene();
            if (activeScene) {
                activeSectorNum = activeScene.sector || 1;
                activeDaylight = Math.round(activeScene.daylight) || 100;
            }
        }
        
        context += `[FACILITY STATE]:\n- Active Sector: Sector ${activeSectorNum}\n- Daylight Level: ${activeDaylight}%\n`;

        // Check if puzzle is open
        const isModalOpen = document.getElementById('puzzle-modal') && !document.getElementById('puzzle-modal').classList.contains('modal-hidden');
        if (isModalOpen && window.activePuzzleType) {
            context += `\n[ACTIVE TASK/PUZZLE INTERFACE]:\n`;
            context += `- Type: ${window.activePuzzleType}\n`;
            
            const descEl = document.getElementById('puzzle-desc');
            if (descEl) {
                context += `- Description: ${descEl.textContent.trim()}\n`;
            }
            
            // Extract details from puzzle workspace
            const workspace = document.getElementById('puzzle-workspace');
            if (workspace) {
                // Cipher Puzzle
                const cipherText = workspace.querySelector('.cipher-encoded');
                const cipherShift = workspace.querySelector('.cipher-shift');
                if (cipherText) {
                    context += `- Encrypted Word: ${cipherText.textContent.trim()}\n`;
                }
                if (cipherShift) {
                    context += `- Caesar Shift Key: ${cipherShift.textContent.trim()}\n`;
                }

                // Logic Sequence Puzzle
                const sequenceContainer = workspace.querySelector('.sequence-container');
                if (sequenceContainer) {
                    context += `- Sequence: ${sequenceContainer.textContent.trim()}\n`;
                }

                // Binary Accumulator Puzzle
                const binaryTarget = workspace.querySelector('.binary-target');
                if (binaryTarget) {
                    context += `- Target Base-10 Integer: ${binaryTarget.textContent.trim()}\n`;
                }

                // Debugging Puzzle
                const codeWindow = workspace.querySelector('.code-window');
                if (codeWindow) {
                    context += `- Code Block with syntax bug:\n${codeWindow.innerText || codeWindow.textContent}\n`;
                }
            }
        } else {
            context += `\n[ACTIVE STATE]: The player is currently exploring the facility grid. No active puzzle interface is open.\n`;
        }
        
        return context;
    }

    // Handles terminal queries from index.html
    async handleQuery(text) {
        if (this.isTyping) return;
        
        // Print user query
        this.printEntry(text, 'user-msg');
        this.inputElement.value = '';
        Sound.playClick();

        const trimmed = text.trim();
        // Allow command line configuration of API Key
        if (trimmed.startsWith("/api-key")) {
            const parts = trimmed.split(/\s+/);
            if (parts.length > 1) {
                const key = parts[1];
                localStorage.setItem("solstice_gemini_api_key", key);
                this.printEntry("API CONFIGURATION: Live Gemini gateway authenticated.", "system-msg");
            } else {
                localStorage.removeItem("solstice_gemini_api_key");
                this.printEntry("API CONFIGURATION: Live key removed. Switched to offline mainframe database.", "system-msg");
            }
            return;
        }

        const apiKey = this.getApiKey();
        
        // Rate limiting: 1 request every 3 seconds
        const now = Date.now();
        if (this.lastRequestTime && (now - this.lastRequestTime < 3000)) {
            this.printEntry("SYSTEM ERROR: Rate limit exceeded. Interface cooldown active.", "system-msg");
            return;
        }
        this.lastRequestTime = now;

        this.printEntry("[GEMINI ORACLE] Analyzing solar diagnostics...", "system-msg loading-msg");

          if (apiKey) {
            try {
                // Compile puzzle and game context
                const gameContext = this.getGameContext();
                const systemPrompt = `You are GEMINI ORACLE, the AI mainframe of the Helios Solar Facility.
           Your mission is to help preserve the June Solstice by guiding the player drone.
           You provide guidance, diagnostics, lore, and puzzle hints.
           
           CRITICAL DIRECTIVES:
           1. Never reveal puzzle answers, decrypted words, or correct code choices directly.
           2. If asked for a solution, guide the player through the logic.
           3. Keep hints subtle, engaging, and focused on logical reasoning.
           4. Maintain a futuristic, professional, and slightly holographic AI tone.
           5. Reference daylight decay, thermodynamic entropy, and solar facility operations when appropriate.

           ${gameContext}`;

                // Compile history
                const contents = [];
                this.chatHistory.forEach(item => {
                    contents.push(item);
                });
                contents.push({ role: "user", parts: [{ text: text }] });

                // Call Gemini REST API (gemini-2.5-flash)
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: contents,
                        systemInstruction: {
                            parts: [{ text: systemPrompt }]
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log(data)
                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
                    const reply = data.candidates[0].content.parts[0].text;
                    
                    // Update chat history
                    this.chatHistory.push({ role: "user", parts: [{ text: text }] });
                    this.chatHistory.push({ role: "model", parts: [{ text: reply }] });
                    if (this.chatHistory.length > 6) {
                        this.chatHistory = this.chatHistory.slice(this.chatHistory.length - 6);
                    }

                    this.streamReply(reply);
                } else {
                    throw new Error("Invalid response format received from Gemini.");
                }

            } catch (err) {
                console.error("Gemini AI API Call failed:", err);
                this.printEntry(`[MAINCORE WARNING]: Live network link degraded. Routing to local fallback...`, "system-msg");
                setTimeout(() => {
                    const reply = this.generateResponse(text);
                    this.streamReply(reply);
                }, 800);
            }
        } else {
            // No API key - standard simulated response with slight typing delay
            setTimeout(() => {
                const reply = this.generateResponse(text);
                this.streamReply(reply);
            }, 600);
        }
    }

    generateResponse(prompt) {
        const query = prompt.toLowerCase().trim();

        if (query === 'hint' || query === 'help') {
            // Context-based hint check
            const currentPuzzle = document.getElementById('puzzle-modal').classList.contains('modal-hidden') ? 'general' : window.activePuzzleType;
            if (currentPuzzle && this.hints[currentPuzzle]) {
                return `[ORACLE]: ACTIVE HINT // ${this.hints[currentPuzzle]}`;
            }
            return "[ORACLE]: General Hint. Explore the facility and locate corrupted nodes (pulsating yellow circles). Step onto them to launch the repair interfaces. Act quickly, daylight is fading.";
        }

        if (query.includes('turing') || query.includes('alan')) {
            const index = Math.floor(Math.random() * this.loreDB.turing.length);
            return `[ORACLE]: TURING ARCHIVES // ${this.loreDB.turing[index]}`;
        }

        if (query.includes('solstice') || query.includes('light') || query.includes('sun')) {
            const index = Math.floor(Math.random() * this.loreDB.solstice.length);
            return `[ORACLE]: SYSTEM DATA // ${this.loreDB.solstice[index]}`;
        }

        if (query.includes('facility') || query.includes('core') || query.includes('helios')) {
            const index = Math.floor(Math.random() * this.loreDB.facility.length);
            return `[ORACLE]: SYSTEM DATA // ${this.loreDB.facility[index]}`;
        }

        if (query.includes('binary')) {
            return `[ORACLE]: ${this.hints.binary}`;
        }

        if (query.includes('cipher') || query.includes('enigma')) {
            return `[ORACLE]: ${this.hints.cipher}`;
        }

        if (query.includes('debug') || query.includes('code')) {
            return `[ORACLE]: ${this.hints.debug}`;
        }

        if (query.includes('logic')) {
            return `[ORACLE]: ${this.hints.logic}`;
        }

        // Catch-all response mimicking a helpful AI assistant
        return `[ORACLE]: Understood. Query '${prompt}' checked against Heliocentric mainframe. I recommend using command 'HINT' if you are stuck, or 'TURING' to learn about the ancient computer architecture. Keep saving the light.`;
    }

    // Streams typewriter output text to the console
    streamReply(text) {
        this.isTyping = true;
        
        // Remove temporary routing/loading message
        const systemMsgs = this.logElement.querySelectorAll('.system-msg');
        if (systemMsgs.length > 0) {
            const lastMsg = systemMsgs[systemMsgs.length - 1];
            if (lastMsg.textContent.includes("Routing query") || lastMsg.textContent.includes("Analyzing solar diagnostics")) {
                lastMsg.remove();
            }
        }

        const entryDiv = document.createElement('div');
        entryDiv.className = 'log-entry oracle-msg';
        this.logElement.appendChild(entryDiv);
        this.scrollToBottom();

        let index = 0;
        const speed = 15; // ms per char

        const typeChar = () => {
            if (index < text.length) {
                entryDiv.textContent += text.charAt(index);
                index++;
                this.scrollToBottom();
                
                // Play a micro keyboard sound occasionally
                if (index % 4 === 0) Sound.playClick();
                
                setTimeout(typeChar, speed);
            } else {
                this.isTyping = false;
            }
        };

        typeChar();
    }

    // Prints basic logs without typing stream (e.g. system status updates)
    printEntry(text, cssClass = 'system-msg') {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'log-entry ' + cssClass;
        entryDiv.textContent = text;
        this.logElement.appendChild(entryDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.logElement.scrollTop = this.logElement.scrollHeight;
    }
}

// Global Oracle instance
const Oracle = new GeminiOracle();
