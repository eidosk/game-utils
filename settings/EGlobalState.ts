import Phaser from 'phaser';

/*
* Global state, with vars common to all games
* */


export default class EGlobalState extends Phaser.Plugins.BasePlugin {

    private lang: number = 0;
    private score: number = 0;
    private stopped: boolean = true; //set to true when game starts!
    private muted: boolean = false;
    private debug: boolean = false;
    private mobile: boolean = false;
    private incognito: boolean = false;

    // Constructor that takes the PluginManager as an argument
    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
    }

    // Initialize the plugin, setting the 'mobile' state based on the device type
    init() {
        this.mobile = !this.game.device.os.desktop;
    }

    // Getter and setter for the 'lang' variable
    getLanguage(): number {
        return this.lang;
    }

    setLanguage(lang: number): void {
        this.lang = lang;
    }

    getIncognito(): boolean {
        return this.incognito;
    }

    setIncognito(incognito: boolean): void {
        this.incognito = incognito;
    }

    // Getter and setter for the 'stopped' variable
    isStopped(): boolean {
        return this.stopped;
    }

    setStopped(stopped: boolean): void {
        this.stopped = stopped;
    }

    // Getter and setter for the 'score' variable
    getScore(): number {
        return this.score;
    }

    setScore(score: number): void {
        this.score = score;
    }

    // Getter and setter for the 'muted' variable
    isMuted(): boolean {
        return this.muted;
    }

    setMuted(muted: boolean): void {
        this.muted = muted;
    }

    // Getter and setter for the 'debug' variable
    isDebug(): boolean {
        return this.debug;
    }

    setDebug(debug: boolean): void {
        this.debug = debug;
    }

    // Getter for the 'mobile' variable, no setter since it's determined at initialization
    isMobile(): boolean {
        return this.mobile;
    }
}