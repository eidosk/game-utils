import Image = Phaser.GameObjects.Image;
import Container = Phaser.GameObjects.Container;
import {EButton} from "../EPhaser/EButton";
import {ETextButton} from "../EPhaser/ETextButton";

export class EObject {
    /**
     * Merges two configuration objects, giving precedence to properties in the `customConfig` object.
     *
     * @param {Object} defaultConfig - The default configuration object.
     * @param {Object} customConfig - The configuration object with overrides.
     * @returns {Object} - The merged configuration object.
     */
    static mergeConfigs<T>(defaultConfig: T, customConfig: T): T {
        return { ...defaultConfig, ...customConfig }; // customConfig takes precedence!
    }



    /**
     * Logs the content of an object as a JSON string to the console.
     *
     * @param {Object} object - The object to be logged.
     */
    static log(object: object): void {
        //console.log("EObject.log: " + JSON.stringify(object));
    }
}