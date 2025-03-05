let instance: EEvents | null = null;
const PLAY_GAME = "playGame";
const STOP_GAME = "stopGame";

/**
 * Singleton class for managing custom events.
 */
export class EEvents extends Phaser.Events.EventEmitter {
    /**
     * Private constructor to enforce singleton pattern.
     */
    constructor() {
        super();
    }

    /**
     * Get the singleton instance of EEvents.
     * @returns {EEvents} - The singleton instance.
     */
    static getInstance(): EEvents {
        if (instance === null) {
            instance = new EEvents();
        }
        return instance;
    }

    /**
     * Custom event identifier for playing the game.
     * @returns {string} - The event identifier.
     */
    static get PLAY_GAME(): string {
        return PLAY_GAME;
    }

    /**
     * Custom event identifier for stopping the game.
     * @returns {string} - The event identifier.
     */
    static get STOP_GAME(): string {
        return STOP_GAME;
    }
}
