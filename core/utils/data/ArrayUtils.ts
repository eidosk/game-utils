export class ArrayUtils {
    // Clone an array
    static clone<T>(myArray: T[]): T[] {
        return myArray.slice(0);
    }
    // Clone a 2D array
    static clone2d<T>(arr: T[][]): T[][] {
        let clone: T[][] = [];
        for (let i = 0; i < arr.length; i++) {
            clone.push(arr[i].slice(0));
        }
        return clone;
    }
    // Find the index of an item in an array
    static findItemIndex<T>(array: T[], item: T): number {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === item) return i;
        }
        return -1;
    }

    // Get a random item from an array (optionally remove it)
    static getRandomItem<T>(myArray: T[], remove = false): T | undefined {
        const index = Math.floor(Math.random() * myArray.length);
        const randomItem = myArray[index];
        if (remove) {
            myArray.splice(index, 1);
        }
        return randomItem;
    }

    // Get an array of random elements from the input array
    static getRandomElementsFromArray<T>(array: T[], count: number): T[] {
        const randomElements: T[] = [];
        const arrayCopy = array.slice(); // Create a copy of the original array
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * arrayCopy.length);
            const randomElement = arrayCopy.splice(randomIndex, 1)[0];
            randomElements.push(randomElement);
        }
        return randomElements;
    }

    // Get an array of unique items from multiple arrays
    static uniqueItemsFromArrays<T>(...arrays: T[][]): T[] {
        const combinedArray = ([] as T[]).concat(...arrays);
        const uniqueArray = [...new Set(combinedArray)];
        return uniqueArray;
    }

    // Get an array of common elements between two arrays
    static getIntersectionArray<T>(arr1: T[], arr2: T[]): T[] {
        let set1 = new Set(arr1);
        let set2 = new Set(arr2);
        let intersection = new Set([...set1].filter(element => set2.has(element)));
        return Array.from(intersection);
    }

    // Log the elements of an array with a given name
    static traceArray(arrayOfStrings: string[], newArrayName = "arr"): void {
        let tString = `${newArrayName} = [`;
        for (let i = 0; i < arrayOfStrings.length; i++) {
            let tWord = arrayOfStrings[i];
            tString += `"${tWord}",`;
        }
        tString = tString.slice(0, -1);
        tString += "];";
        console.log(`EArray.traceArray: \n${tString}\n\n It has ${arrayOfStrings.length} elements.`);
    }

    // Check if an item exists in an array
    static hasItem<T>(array: T[], item: T): boolean {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === item) return true;
        }
        return false;
    }

    // Check if a variable is an array
    static isArray(variable: any): boolean {
        return Array.isArray(variable);
    }

    // Remove an item from an array
    static removeItem<T>(myArray: T[], item: T): void {
        for (let i = myArray.length - 1; i >= 0; i--) {
            if (myArray[i] === item) {
                myArray.splice(i, 1);
            }
        }
    }

    // Remove an item from an array by index
    static removeItemByIndex<T>(myArray: T[], index: number): void {
        myArray.splice(index, 1);
    }

    static shuffle<T>(array: T[]): T[] {
        // Create a copy of the input array to avoid modifying the original array
        const shuffledArray = [...array];
        let currentIndex = shuffledArray.length,
            temporaryValue,
            randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = shuffledArray[currentIndex];
            shuffledArray[currentIndex] = shuffledArray[randomIndex];
            shuffledArray[randomIndex] = temporaryValue;
        }
        // Return the shuffled array
        return shuffledArray;
    }
}
