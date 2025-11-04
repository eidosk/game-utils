import { StorageProvider } from '../utils/storage/LocalStorageProvider';

/**
 * Interface representing an achievements
 */
export interface Achievement {
    name: string;
    id: number;
    completed: boolean;
}

/**
 * Manages game achievements with persistence
 */
export class AchievementManager {
    private achievements: Achievement[] = [];
    private byName: Record<string, Achievement> = {};
    private byId: Record<number, Achievement> = {};
    private storage: StorageProvider;

    constructor(storage: StorageProvider) {
        this.storage = storage;
    }

    /**
     * Adds a new achievements to the system
     */
    addAchievement(name: string, id: number): void {
        const achievement: Achievement = {
            name,
            id,
            completed: this.wasCompleted(name)
        };

        this.achievements.push(achievement);
        this.byName[name] = achievement;
        this.byId[id] = achievement;
    }

    /**
     * Checks if an achievements was completed
     */
    wasCompleted(name: string): boolean {
        return this.storage.getItem(name) === "COMPLETED";
    }

    /**
     * Marks an achievements as completed
     */
    completeAchievement(name: string): void {
        if (!this.wasCompleted(name)) {
            this.storage.setItem(name, "COMPLETED");

            const achievement = this.byName[name];
            if (achievement) {
                achievement.completed = true;
                // Trigger any notification logic here
                console.log("ACHIEVEMENT COMPLETED! " + name);
            }
        }
    }

    /**
     * Gets achievements by ID
     */
    getAchievementById(id: number): Achievement | undefined {
        return this.byId[id];
    }

    /**
     * Gets achievements by name
     */
    getAchievementByName(name: string): Achievement | undefined {
        return this.byName[name];
    }

    /**
     * Gets number of completed achievements
     */
    getCompletedCount(): number {
        return this.achievements.filter(a => a.completed).length;
    }

    /**
     * Gets total number of achievements
     */
    getTotalCount(): number {
        return this.achievements.length;
    }

    /**
     * Gets completion status as string (e.g., "5/10")
     */
    getCompletionStatus(): string {
        return `${this.getCompletedCount()}/${this.getTotalCount()}`;
    }

    /**
     * Checks if all achievements are completed
     */
    areAllCompleted(): boolean {
        return this.getCompletedCount() >= this.getTotalCount();
    }
}