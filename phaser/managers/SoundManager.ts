import { Scene } from 'phaser';
import { Sound } from '../types';

export class SoundManager {
    private isMuted = false;

    constructor(private scene: Scene) {}

    playSound(sound: Sound, delay: number = 0.1): void {
        if (this.isMuted) return;

        console.log("Playing sound with delay:", delay);
        sound.play({ delay });
    }

    setMuted(muted: boolean): void {
        this.isMuted = muted;
    }

    isSoundMuted(): boolean {
        return this.isMuted;
    }
}