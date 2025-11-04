// EGlobal.ts
export class EGlobal {
    static stopped: boolean = false;  // Default: game not stopped
    static muted: boolean = false;    // Default: sound not muted
    static debug: boolean = false;    // Default: debug mode off
    static score: number = 0;         // Default: score starts at 0
    static mobile: boolean = false;   // Default: not on mobile

    // Optional: Add utility methods for changing these values
    static toggleMute(): boolean {
        this.muted = !this.muted;
        return this.muted;
    }

    static resetScore(): void {
        this.score = 0;
    }
}