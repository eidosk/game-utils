/**
 * A utility class for performing weighted random selection.
 *
 * This class allows you to define items (of any type) and assign them weights.
 * Items with higher weights are more likely to be selected when a random pick is made.
 *
 * Key Features:
 * - Add items dynamically with weights.
 * - Update or remove items by changing their weights.
 * - Clear all items and their weights.
 * - Retrieve the probability of each item being selected based on its weight.
 *
 * Example Usage:
 *
 *  const picker = new WeightedPicker<string>();
 *  picker.add("red", 10);
 *  picker.add("green", 5);
 *  picker.add("blue", 15);
 *
 *  console.log(picker.pick());  // Randomly selects one of "red", "green", or "blue" based on weights.
 *
 *  picker.setWeight("red", 20);  // Change the weight of "red".
 *  console.log(picker.getProbabilities());  // Get the selection probabilities of all items.
 *
 *  picker.clear();  // Remove all items from the picker.
 */


export class WeightedPicker<T> {
    // Array to hold items and their associated weights.
    private items: { item: T; weight: number }[] = [];

    /**
     * Constructor that can optionally accept initial weights for items.
     * @param initial - A record of items with their respective weights (e.g., { 'red': 10, 'blue': 5 }).
     * @param mapper - A function that converts a string key to the actual item (e.g., key => key).
     */
    constructor(initial?: Record<string, number>, mapper?: (key: string) => T) {
        if (initial && mapper) {
            // Loop through the initial weights and add them to the items array.
            for (const [key, weight] of Object.entries(initial)) {
                this.add(mapper(key), weight);
            }
        }
    }

    /**
     * Adds an item with a specified weight to the picker.
     * @param item - The item to add (can be any type T).
     * @param weight - The weight associated with the item. Items with higher weights are more likely to be picked.
     */
    add(item: T, weight: number): void {
        if (weight <= 0) return; // Skip adding if weight is less than or equal to zero.
        this.items.push({ item, weight });
    }

    /**
     * Updates the weight of an existing item, or adds it if it doesn't exist.
     * If the weight is set to 0 or less, the item will be removed from the picker.
     * @param item - The item whose weight to update.
     * @param newWeight - The new weight for the item.
     */
    setWeight(item: T, newWeight: number): void {
        if (newWeight <= 0) {
            // If weight is zero or less, remove the item.
            this.items = this.items.filter(entry => entry.item !== item);
            return;
        }

        const entry = this.items.find(entry => entry.item === item);
        if (entry) {
            // If item exists, update its weight.
            entry.weight = newWeight;
        } else {
            // If item doesn't exist, add it with the new weight.
            this.add(item, newWeight);
        }
    }

    /**
     * Clears all items and their weights from the picker.
     */
    clear(): void {
        this.items = [];
    }

    /**
     * Picks a random item based on their weights.
     * Items with higher weights are more likely to be selected.
     * @returns The selected item (of type T).
     */
    pick(): T {
        const totalWeight = this.items.reduce((sum, entry) => sum + entry.weight, 0);
        const roll = Math.random() * totalWeight; // Random number between 0 and totalWeight.

        let cumulative = 0;
        // Loop through items and accumulate weights until the random roll falls within the cumulative range.
        for (const entry of this.items) {
            cumulative += entry.weight;
            if (roll <= cumulative) {
                return entry.item;
            }
        }

        // Fallback: if something goes wrong (e.g., floating-point precision issues), return the last item.
        return this.items[this.items.length - 1].item;
    }

    /**
     * Returns the probabilities (as percentages) for each item based on their weights.
     * @returns An array of objects with the item and its associated probability percentage.
     */
    getProbabilities(): { item: T; percent: number }[] {
        const totalWeight = this.items.reduce((sum, entry) => sum + entry.weight, 0);
        return this.items.map(entry => ({
            item: entry.item,
            percent: (entry.weight / totalWeight) * 100 // Calculate percentage probability for each item.
        }));
    }
}
