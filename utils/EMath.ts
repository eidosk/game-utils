export class EMath {
    // Generate a random integer within a specified interval
    static randomIntFromInterval(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // Check if a number is a prime number
    static isPrime(n: number): boolean {
        if (isNaN(n) || !isFinite(n) || n % 1 || n < 2) return false;
        if (n % 2 == 0) return n == 2;
        const m = Math.sqrt(n);
        for (let i = 3; i <= m; i += 2) {
            if (n % i == 0) return false;
        }
        return true;
    }

    // Round a number to two decimal places
    static roundTo2DecimalPlaces(number: number): number {
        return Math.round(number * 100) / 100;
    }

    // Round a number to one decimal place
    static roundTo1DecimalPlace(number: number): number {
        return Math.round(number * 10) / 10;
    }

    // Clamp a value within a specified range
    static clamp(value: number, min: number, max: number): number {
        return Math.max(Math.min(max, value), min);
    }

    static randFloat(min: number, max: number = NaN): number {
        if (isNaN(max)) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    }

    // Returns a random integer between min (inclusive) and max (inclusive)
    static rand(min: number, max: number = NaN): number {
        if (isNaN(max)) {
            max = min;
            min = 0;
        }
        return Math.floor(this.randFloat(min, max + 1));
    }
}