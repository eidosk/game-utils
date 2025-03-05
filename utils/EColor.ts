export class EColor {
    static numberToHexColor(value: number): string {
        // Ensure the value is within the valid color range (0 to 0xFFFFFF)
        value = Math.min(Math.max(value, 0), 0xFFFFFF);

        // Convert the numeric value to a 6-digit hexadecimal string
        let hexString: string = value.toString(16).padStart(6, '0');

        // Add the '#' prefix to make it a valid CSS color string
        return '#' + hexString;
    }

    static darkenColor(color: number, factor: number): number {
        // Extract the individual color components (red, green, blue)
        let red = (color >> 16) & 0xff;
        let green = (color >> 8) & 0xff;
        let blue = color & 0xff;

        // Reduce each color component by a fraction of its value
        red = Math.max(0, Math.round(red * (1 - factor)));
        green = Math.max(0, Math.round(green * (1 - factor)));
        blue = Math.max(0, Math.round(blue * (1 - factor)));

        // Combine the color components back into a single color value
        return (red << 16) | (green << 8) | blue;
    }

    static saturateColor(color: number, factor: number): number { //double check
        // Extract the individual color components (red, green, blue)
        let red = (color >> 16) & 0xff;
        let green = (color >> 8) & 0xff;
        let blue = color & 0xff;

        // Calculate the average of the color components
        let avg = (red + green + blue) / 3;

        // Amplify the color components further from the average
        red = Math.round(red + factor * (red - avg));
        green = Math.round(green + factor * (green - avg));
        blue = Math.round(blue + factor * (blue - avg));

        // Clamp the color components to the valid range
        red = Math.min(255, Math.max(0, red));
        green = Math.min(255, Math.max(0, green));
        blue = Math.min(255, Math.max(0, blue));

        // Combine the color components back into a single color value
        return (red << 16) | (green << 8) | blue;
    }


}
