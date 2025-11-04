import { AchievementManager } from '../../core/achievements/AchievementManager';
import { StorageProvider } from '../../core/utils/storage/LocalStorageProvider';

/**
 * Extends AchievementManager with Phaser-specific UI notifications
 */
export class PhaserAchievementManager extends AchievementManager {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, storage: StorageProvider) {
        super(storage);
        this.scene = scene;
    }

    /**
     * Overrides completeAchievement to add UI notification
     */
    completeAchievement(name: string): void {
        const wasAlreadyCompleted = this.wasCompleted(name);

        // Call parent method to update achievements
        super.completeAchievement(name);

        // Add Phaser-specific notification if newly completed
        if (!wasAlreadyCompleted) {
            if (this.scene['notify']) {
                this.scene['notify']("Achievement Completed", name);
            }
        }
    }
}