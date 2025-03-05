export class EString {

    /**
     * Returns the next character in the alphanumeric sequence.
     *
     * @param {string} c - The input character.
     * @returns {string} - The next character.
     */
    /*static nextChar(c: string): string {
        let i = (parseInt(c, 36) + 1) % 36;
        return (!i * 10 + i).toString(36);
    }*/

    /**
     * Sets the character at a specific index in the given string.
     *
     * @param {string} str - The input string.
     * @param {number} index - The index where the character should be set.
     * @param {string} chr - The character to set.
     * @returns {string} - The modified string.
     */
    static setCharAt(str: string, index: number, chr: string): string {
        if (index > str.length - 1) return str;
        return str.substring(0, index) + chr + str.substring(index + 1);
    }

    /**
     * Retrieves the substring between two specified strings in the source string.
     *
     * @param {string} source - The source string.
     * @param {string} string1 - The first delimiter string.
     * @param {string} string2 - The second delimiter string.
     * @returns {string | -1} - The substring between the specified strings or -1 if not found.
     */
    static substringBetween(source: string, string1: string, string2: string): string | -1 {
        if ((source.indexOf(string1, 0) == -1) || (source.indexOf(string2, source.indexOf(string1, 0)) == -1)) {
            return -1;
        } else {
            return source.substring((source.indexOf(string1, 0) + string1.length), (source.indexOf(string2, source.indexOf(string1, 0))));
        }
    }

    /**
     * Replaces occurrences of a specified substring with another substring in the given string.
     *
     * @param {string} haystack - The source string.
     * @param {string} needle - The substring to search for.
     * @param {string} replace - The replacement substring.
     * @returns {string} - The modified string.
     */
    static replace(haystack: string, needle: string, replace: string): string {
        let tempArray = haystack.split(needle);
        return tempArray.join(replace);
    }
}
