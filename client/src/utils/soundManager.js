class SoundManager {
    constructor() {
        this.audioContext = null;
        this.isMuted = false;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTone(frequency, type, duration, startTime = 0) {
        if (this.isMuted || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + startTime);

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime + startTime);
        oscillator.stop(this.audioContext.currentTime + startTime + duration);
    }

    playSuccess() {
        this.init();
        // Play a cheerful major triad (C5, E5, G5)
        this.playTone(523.25, 'sine', 0.1, 0);       // C5
        this.playTone(659.25, 'sine', 0.1, 0.1);     // E5
        this.playTone(783.99, 'sine', 0.2, 0.2);     // G5
    }

    playError() {
        this.init();
        // Play a low dissonant sound
        this.playTone(150, 'sawtooth', 0.3, 0);
        this.playTone(140, 'sawtooth', 0.3, 0);
    }

    playClick() {
        this.init();
        // Short high-pitched "pop"
        this.playTone(800, 'sine', 0.05, 0);
    }

    playDelete() {
        this.init();
        // Descending tone
        this.playTone(400, 'triangle', 0.1, 0);
        this.playTone(300, 'triangle', 0.1, 0.1);
    }
}

export const soundManager = new SoundManager();
