// Puzzle Engine - Solstice Protocol
// Generates, renders, and evaluates the 4 categories of mini-puzzles.

class PuzzleEngine {
    constructor() {
        this.currentPuzzle = null;
    }

    // Generates a puzzle based on type and sector difficulty
    generate(type, sector) {
        let puzzle = {
            type: type,
            sector: sector,
            title: "",
            description: "",
            html: "",
            solution: null,
            hint: ""
        };

        switch (type) {
            case "logic":
                puzzle = this.buildLogicPuzzle(sector, puzzle);
                break;
            case "binary":
                puzzle = this.buildBinaryPuzzle(sector, puzzle);
                break;
            case "debug":
                puzzle = this.buildDebugPuzzle(sector, puzzle);
                break;
            case "cipher":
                puzzle = this.buildCipherPuzzle(sector, puzzle);
                break;
        }

        this.currentPuzzle = puzzle;
        return puzzle;
    }

    // 1. Logic Sequence Puzzle (Arithmetic/Geometric solar series)
    buildLogicPuzzle(sector, puzzle) {
        puzzle.title = "SOLAR ALIGNMENT SEQUENCE";
        
        const sequences = [
            // Level 1: Simple linear
            { seq: [6, 12, 18, 24], next: 30, desc: "Predict the solar collector flux pattern. Enter the next integer.", hint: "Arithmetic series. Add 6 to the previous value." },
            // Level 2: Powers of 2 (binary/Turing growth)
            { seq: [2, 4, 8, 16], next: 32, desc: "The computational matrix scales quadratically. Determine the next grid size.", hint: "Binary progression. Double the value." },
            // Level 3: Fibonacci (nature pattern/Morphogenesis reference)
            { seq: [1, 1, 2, 3, 5, 8], next: 13, desc: "A morphogenetic sequence has locked the solar cell expansion. Input the next coefficient.", hint: "Fibonacci series. Add the last two values together." },
            // Level 4: Triangular numbers (rays of sun)
            { seq: [1, 3, 6, 10, 15], next: 21, desc: "Rebuild the geometric ray distribution. Solve for the next layer limit.", hint: "Triangular sequence. Add 2, then 3, then 4, then 5, then 6..." },
            // Level 5: Square series
            { seq: [4, 9, 16, 25], next: 36, desc: "Input the boundary dimension for the Core quadrant.", hint: "Square series. 2^2, 3^2, 4^2, 5^2, then 6^2." }
        ];

        const data = sequences[Math.min(sector - 1, sequences.length - 1)];
        puzzle.description = data.desc;
        puzzle.solution = data.next;
        puzzle.hint = data.hint;

        // Render cells
        let cellsHtml = data.seq.map(n => `<div class="logic-cell">${n}</div>`).join("");
        cellsHtml += `<input type="number" id="logic-answer" class="logic-input" placeholder="?" min="0" max="999">`;

        puzzle.html = `
            <div class="logic-container">
                <div class="logic-row">
                    ${cellsHtml}
                </div>
            </div>
        `;

        return puzzle;
    }

    // 2. Binary / Pattern-Matching Puzzle
    buildBinaryPuzzle(sector, puzzle) {
        puzzle.title = "BINARY SOLAR COUPLER";
        
        // Target values increase with sector
        const targets = [
            { target: 13, bits: 4, desc: "Match the solar power routing accumulator to 13." }, // 1101 (8+4+0+1)
            { target: 21, bits: 5, desc: "Match the solar power routing accumulator to 21." }, // 10101 (16+0+4+0+1)
            { target: 27, bits: 5, desc: "Match the solar power routing accumulator to 27." }, // 11011 (16+8+0+2+1)
            { target: 43, bits: 6, desc: "Match the solar power routing accumulator to 43." }, // 101011 (32+0+8+0+2+1)
            { target: 58, bits: 6, desc: "Match the solar power routing accumulator to 58." }  // 111010 (32+16+8+0+2+0)
        ];

        const data = targets[Math.min(sector - 1, targets.length - 1)];
        puzzle.description = data.desc;
        puzzle.solution = data.target;
        puzzle.hint = `Turn on the binary bits that sum up to ${data.target}. Bit weights from left to right are: ` + 
            (data.bits === 4 ? "8, 4, 2, 1." : data.bits === 5 ? "16, 8, 4, 2, 1." : "32, 16, 8, 4, 2, 1.");

        let bitsHtml = "";
        for (let i = data.bits - 1; i >= 0; i--) {
            const weight = Math.pow(2, i);
            bitsHtml += `
                <button type="button" class="binary-bit-btn" data-weight="${weight}">
                    0
                    <div style="font-size: 8px; color: #5f748d; margin-top:2px;">[${weight}]</div>
                </button>
            `;
        }

        puzzle.html = `
            <div class="binary-container">
                <div class="binary-equation">ACCUMULATOR TARGET: <span style="color: var(--neon-cyan); font-weight:bold;">${data.target}</span></div>
                <div class="binary-row" id="binary-bit-row">
                    ${bitsHtml}
                </div>
                <div class="binary-target">CURRENT SUM: <span id="binary-current-sum" style="color: var(--neon-gold)">0</span></div>
            </div>
        `;

        return puzzle;
    }

    // 3. Code Debugging Puzzle (Identify program defects)
    buildDebugPuzzle(sector, puzzle) {
        puzzle.title = "SOLAR KERNEL DEBUGGER";
        puzzle.description = "The plasma routing routine has a logic compilation error. Select the correct syntax to prevent memory overflow.";
        
        const debugProblems = [
            // Level 1: Loop increment
            {
                code: `function routePlasma(cells) {\n    for (let i = 0; i < cells.length; <span id="debug-select-wrapper"><select id="debug-choice" class="code-select"><option value="i--">i--</option><option value="i">i</option><option value="correct">i++</option></select></span>) {\n        cells[i].activate();\n    }\n}`,
                solution: "correct",
                hint: "Infinite loop warning: The array counter 'i' must increment on each cycle so the loop eventually exits."
            },
            // Level 2: Array out of bounds
            {
                code: `function resetGrids(grids) {\n    // Array has N elements (0 to N-1)\n    for (let i = 0; i <span id="debug-select-wrapper"><select id="debug-choice" class="code-select"><option value="correct">&lt; grids.length</option><option value="wrong">&lt;= grids.length</option></select></span>; i++) {\n        grids[i].charge = 0;\n    }\n}`,
                solution: "correct",
                hint: "Array out of bounds: In zero-indexed arrays, accessing index equal to length throws an OutOfBounds exception. Use strictly less than (<)."
            },
            // Level 3: Logic conditional comparison
            {
                code: `function heatFailsafe(temp) {\n    // Shutdown reactor if temp exceeds 5000\n    if (temp <span id="debug-select-wrapper"><select id="debug-choice" class="code-select"><option value="less">&lt; 5000</option><option value="eq">== 5000</option><option value="correct">&gt; 5000</option></select></span>) {\n        shutdownReactor();\n    }\n}`,
                solution: "correct",
                hint: "Safety protocol: The shutdown failsafe must trigger when the temperature exceeds (is greater than) the maximum thermal limit of 5000."
            },
            // Level 4: Boolean conjunction
            {
                code: `function coreCoherence(flux, sync) {\n    // Restart only if BOTH flux is stable AND sync is locked\n    if (flux.stable <span id="debug-select-wrapper"><select id="debug-choice" class="code-select"><option value="or">||</option><option value="correct">&amp;&amp;</option><option value="xor">^</option></select></span> sync.locked) {\n        return true;\n    }\n}`,
                solution: "correct",
                hint: "Both parameters must be true. Use the logical AND operator (&&)."
            }
        ];

        const problem = debugProblems[Math.min(sector - 1, debugProblems.length - 1)];
        puzzle.solution = problem.solution;
        puzzle.hint = problem.hint;

        puzzle.html = `
            <div class="debug-container">
                <pre class="code-window"><code>${problem.code}</code></pre>
            </div>
        `;

        return puzzle;
    }

    // 4. Cipher Puzzle (Turing decryptor Enigma themes)
    buildCipherPuzzle(sector, puzzle) {
        puzzle.title = "TURING ENIGMA DECRYPTOR";
        
        const wordList = [
            { enc: "KHOIRV", dec: "HELIOS", shift: 3, desc: "A military-grade Caesar cipher locks Sector 1. Rotate the key backward by 3 steps.", hint: "Caesar cipher with shift 3. K - 3 = H, H - 3 = E, O - 3 = L..." },
            { enc: "WXULQJ", dec: "TURING", shift: 3, desc: "Decrypt the access key matching the master architect.", hint: "Caesar cipher with shift 3. W - 3 = T, X - 3 = U, U - 3 = R..." },
            { enc: "VROVWLFH", dec: "SOLSTICE", shift: 3, desc: "The alignment protocol keyword is encrypted. Decode the core buffer.", hint: "Caesar cipher with shift 3. V - 3 = S, R - 3 = O, O - 3 = L..." },
            { enc: "HQWURSB", dec: "ENTROPY", shift: 3, desc: "Decrypt the thermodynamic threat coefficient.", hint: "Caesar cipher with shift 3. H - 3 = E, Q - 3 = N, W - 3 = T..." },
            { enc: "MORPHEUS", dec: "MORPHEUS", shift: 0, desc: "Enter the code exactly to bypass the encryption grid.", hint: "No shift key. Just type MORPHEUS exactly." }
        ];

        const data = wordList[Math.min(sector - 1, wordList.length - 1)];
        puzzle.description = data.desc;
        puzzle.solution = data.dec;
        puzzle.hint = data.hint;

        puzzle.html = `
            <div class="cipher-container">
                <div class="cipher-encoded">${data.enc}</div>
                <div class="cipher-shift-info">CIPHER KEY DEVIATION: <span style="color: var(--neon-red); font-weight:bold;">-${data.shift}</span></div>
                <input type="text" id="cipher-answer" class="cipher-input" placeholder="DECRYPTED STR" maxlength="12" autocomplete="off">
            </div>
        `;

        return puzzle;
    }

    // Binds events to elements created dynamically inside the modal workspace
    bindEvents() {
        if (!this.currentPuzzle) return;

        if (this.currentPuzzle.type === "binary") {
            const sumDisplay = document.getElementById("binary-current-sum");
            const bitButtons = document.querySelectorAll(".binary-bit-btn");
            
            bitButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    Sound.playClick();
                    btn.classList.toggle("bit-active");
                    const state = btn.classList.contains("bit-active");
                    btn.firstChild.textContent = state ? "1" : "0";
                    
                    // Recalculate sum
                    let sum = 0;
                    document.querySelectorAll(".binary-bit-btn.bit-active").forEach(activeBtn => {
                        sum += parseInt(activeBtn.getAttribute("data-weight"));
                    });
                    sumDisplay.textContent = sum;
                });
            });
        }
    }

    // Checks if user input is correct
    checkAnswer() {
        if (!this.currentPuzzle) return false;

        switch (this.currentPuzzle.type) {
            case "logic":
                const logicVal = parseInt(document.getElementById("logic-answer").value);
                return logicVal === this.currentPuzzle.solution;
                
            case "binary":
                let binSum = 0;
                document.querySelectorAll(".binary-bit-btn.bit-active").forEach(btn => {
                    binSum += parseInt(btn.getAttribute("data-weight"));
                });
                return binSum === this.currentPuzzle.solution;
                
            case "debug":
                const debugVal = document.getElementById("debug-choice").value;
                return debugVal === this.currentPuzzle.solution;
                
            case "cipher":
                const cipherVal = document.getElementById("cipher-answer").value.trim().toUpperCase();
                return cipherVal === this.currentPuzzle.solution;
        }

        return false;
    }
}

// Global Puzzle Controller instance
const Puzzles = new PuzzleEngine();
