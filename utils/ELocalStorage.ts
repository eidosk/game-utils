export default class ELocalStorage {

    public static readonly HIGHSCORE:string = "Highscore";
    public static readonly GAMES_PLAYED:string = "Games Played";
    public static readonly GRADE: string = "grade"; // Added constant for grade key

    // Array representing the order of grades from highest to lowest
    protected static readonly gradeOrder: string[] = ["A+","A", "B", "C", "D", "E", "F"];


    /**
     * Retrieves an item from localStorage and parses it as JSON.
     * @param key The key of the item to retrieve.
     * @returns The parsed item or null if the item doesn't exist or an error occurs.
     */
    public static getItem(key: string): string | null{
        try {
            const jsonString = localStorage.getItem(key);
            console.log("key: "+ key);
            console.log("localStorage.getItem(key): " + localStorage.getItem(key));
            console.log("jsonString: " + jsonString);
            if (jsonString === null) {
                return null;
            }else{
                return JSON.parse(jsonString) as string;
            }
        } catch (error) {
            console.error(`Error reading from localStorage: ${error}`);
            return null;
        }
    }


    /**
     * Serializes a value as JSON and stores it in localStorage.
     * @param key The key under which to store the item.
     * @param value The value to store.
     */
    public static setItem<T>(key: string, value: T): void {
        try {
            const jsonString = JSON.stringify(value);
            localStorage.setItem(key, jsonString);
        } catch (error) {
            console.error(`Error saving to localStorage: ${error}`);
        }
    }


    /**
     * Retrieves the numeric value of an item, increments it, and stores the updated value back in localStorage.
     * @param key The key of the item to increment.
     * @param increment The amount to increment by (default is 1).
     * @returns The updated item value.
     */
    public static increaseItemValue(key:string, increment:number=1):number {
        let itemValue:number|null = this.getItemValue(key)||0;
        itemValue+=increment;
        this.setItem(key, itemValue.toString());
        return itemValue;
    }


    /**
     * Updates the value stored under the given key only if the new value is greater than the existing value.
     * @param key The key of the item to update.
     * @param newValue The new value to store.
     * @returns True if the item was updated, otherwise false.
     */
    public static updateItemValue(key:string, newValue:number):boolean{
        let oldValue:number = this.getItemValue(key)||0;
        if(newValue > oldValue){
            this.setItem(key, newValue);
            return true;
        }else{
            return false;
        }
    }

    public static updateItemValueIfLess(key: string, newValue: number): boolean {
        const oldValue: number|null = this.getItemValue(key);
        if (oldValue === null || newValue < oldValue) { // Check if oldValue is null
            this.setItem(key, newValue.toString());
            return true;
        } else {
            return false;
        }
    }


    /**
     * Retrieves the item and converts it to a number.
     * @param key The key of the item to retrieve.
     * @returns The numeric value of the item, or 0 if the item doesn't exist or is not a number.
     */
    public static getItemValue(key: string): number | null {
        const item = this.getItem(key);
        return item !== null ? Number(item) : null;
    }


    /**
     * Removes an item from localStorage by key.
     * @param key The key of the item to remove.
     */
    public static removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage: ${error}`);
        }
    }


    /**
     * Clears all items from localStorage.
     */
    public static clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error(`Error clearing localStorage: ${error}`);
        }
    }

    /**
     * A convenience method to set the high score.
     * @param score The high score to set.
     */
    public static setHighscore(score: number): void {
        this.setItem(this.HIGHSCORE, score);
    }

    /**
     * Retrieves the high score value.
     * @returns The high score value, or null if it doesn't exist.
     */
    public static getHighscore(): number | null {
        return this.getItemValue(this.HIGHSCORE)||0;
    }

    /**
     * Updates the high score only if the new score is greater than the current high score.
     * @param score The new high score to set.
     * @returns True if the high score was updated, otherwise false.
     */
    public static updateHighscore(score:number):boolean{
        return this.updateItemValue(this.HIGHSCORE, score);
    }

    /**
     * Compares two grades based on the predefined grade order.
     * @param grade1 The first grade to compare.
     * @param grade2 The second grade to compare.
     * @returns A negative number if grade1 is higher than grade2, zero if they are equal, and a positive number if grade1 is lower than grade2.
     */
    private static compareGrades(grade1: string, grade2: string): number {
        return this.gradeOrder.indexOf(grade1) - this.gradeOrder.indexOf(grade2);
    }

    /**
     * Updates the grade in localStorage if the new grade is higher.
     * @param key
     * @param newGrade The new grade to set.
     * @returns True if the grade was updated, otherwise false.
     */
    public static updateGrade(key: string, newGrade: string): boolean {
        console.log("updateGrade");
        const currentGrade: string|null = this.getItem(key);

        if (currentGrade === null || this.compareGrades(newGrade, currentGrade) < 0) {
            this.setItem(key, newGrade);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Evaluates if the given grade is at least the specified grade.
     * @param grade The grade to evaluate.
     * @param minimumGrade The minimum grade to compare against.
     * @returns True if the grade is at least the specified grade, otherwise false.
     */
    public static isAtLeastGrade(grade: string, minimumGrade: string): boolean {
        return this.compareGrades(grade, minimumGrade) <= 0;
    }

}
