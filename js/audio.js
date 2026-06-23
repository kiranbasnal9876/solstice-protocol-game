// Web Audio API Synthesizer for Solstice Protocol
// Creates ambient music and SFX programmatically to avoid loading external files.

class AudioSynth {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.ambientOscs = [];
        this.ambientGain = null;
        this.warningInterval = null;
        this.isMuted = false;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime); // Low global volume
            this.masterGain.connect(this.ctx.destination);

            this.isInitialized = true;
            this.startAmbientDrone();
        } catch (e) {
            console.error("Web Audio API not supported in this browser:", e);
        }
    }

    startAmbientDrone() {
        if (!this.ctx) return;
        
        // Ambient gain node
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        this.ambientGain.connect(this.masterGain);

        // Build a thick, low-frequency atmospheric drone chord (Solstice Ambient)
        // Root: C2 (65.4 Hz), G2 (98.0 Hz), C3 (130.8 Hz), E3 (164.8 Hz)
        const notes = [65.41, 98.00, 130.81, 164.81];
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            
            osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            filter.type = 'lowpass';
            // Slow lowpass filter modulation to simulate solar winds
            filter.Q.setValueAtTime(1, this.ctx.currentTime);
            filter.frequency.setValueAtTime(200, this.ctx.currentTime);
            
            // Connect
            osc.connect(filter);
            filter.connect(this.ambientGain);
            
            osc.start(0);
            this.ambientOscs.push(osc);
            
            // Gentle frequency modulation over time (lfo-like)
            this.modulateFilter(filter, idx);
        });
    }

    modulateFilter(filter, idx) {
        if (!this.ctx || !filter) return;
        const now = this.ctx.currentTime;
        const targetFreq = 120 + Math.sin(now + idx) * 60;
        filter.frequency.linearRampToValueAtTime(targetFreq, now + 4 + idx * 2);
        
        // Loop modulation recursively
        setTimeout(() => {
            if (this.ambientOscs.length > 0) {
                this.modulateFilter(filter, idx);
            }
        }, (4 + idx * 2) * 1000);
    }

    playClick() {
        if (!this.ctx || this.isMuted) return;
        this.resumeContext();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playSuccess() {
        if (!this.ctx || this.isMuted) return;
        this.resumeContext();

        const now = this.ctx.currentTime;
        
        // Golden chime: Arpeggio C Major Pentatonic (C4, E4, G4, C5)
        const notes = [261.63, 329.63, 392.00, 523.25];
        
        notes.forEach((freq, idx) => {
            const timeOffset = idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + timeOffset);
            
            gainNode.gain.setValueAtTime(0.2, now + timeOffset);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + 0.4);

            osc.connect(gainNode);
            gainNode.connect(this.masterGain);

            osc.start(now + timeOffset);
            osc.stop(now + timeOffset + 0.5);
        });
    }

    playWarning(active) {
        if (!this.ctx) return;
        
        if (!active) {
            if (this.warningInterval) {
                clearInterval(this.warningInterval);
                this.warningInterval = null;
            }
            return;
        }

        if (this.warningInterval || this.isMuted) return;
        this.resumeContext();

        // Pulsating alarm sound
        const triggerWarning = () => {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.4);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(300, now);

            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.5);
        };

        triggerWarning();
        this.warningInterval = setInterval(triggerWarning, 1200);
    }

    playLevelComplete() {
        if (!this.ctx || this.isMuted) return;
        this.resumeContext();

        const now = this.ctx.currentTime;
        
        // Majestic chord sweep: C4, G4, C5, E5
        const notes = [261.63, 392.00, 523.25, 659.25];
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            // Sweep up pitch slightly
            osc.frequency.linearRampToValueAtTime(freq * 1.5, now + 1.2);

            gainNode.gain.setValueAtTime(0.0, now);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

            osc.connect(gainNode);
            gainNode.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 1.6);
        });
    }

    playGameOver() {
        if (!this.ctx || this.isMuted) return;
        this.resumeContext();

        const now = this.ctx.currentTime;
        
        // Solar eclipse: slow falling dissonant sweep
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(30, now + 2.0);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, now);
        filter.frequency.linearRampToValueAtTime(40, now + 2.0);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 2.1);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
        }
        if (this.isMuted && this.warningInterval) {
            this.playWarning(false);
        }
        return this.isMuted;
    }

    resumeContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}

// Global Sound Controller instance
const Sound = new AudioSynth();
