// eidosk/phaser/system/Timer.ts
import { Scene, GameObjects } from 'phaser';

export interface TimerConfig {
	pos: { x: number; y: number };
	totalSeconds: number;
	onEnd: (scene: Scene) => void;
	textObject: GameObjects.Text | GameObjects.BitmapText;
	showMinutes?: boolean;
	enableBeeping?: boolean;
	beepSound?: string;
	startBeepAtMs?: number;
	beepColor?: number;
}

export class Timer {
	private scene: Scene;
	private container: GameObjects.Container;
	protected totalSeconds: number;
	private onEndCallback: (scene: Scene) => void;
	private isRunning: boolean = false;
	private isPaused: boolean = false;
	private startTime: number = 0;
	private pauseTime: number = 0;
	private addedTime: number = 0;
	private timeLeftMs: number;
	private showMinutes: boolean;
	private textObject: GameObjects.Text | GameObjects.BitmapText;

	// Beeping properties
	private beepingEnabled: boolean = false;
	private beepSound?: string;
	private startBeepAtMs: number = 6000;
	private beepColor: number = 0x990000;
	private lastBeepTime: number = 0;

	constructor(scene: Scene, config: TimerConfig) {
		this.scene = scene;
		this.container = scene.add.container(config.pos.x, config.pos.y);

		this.totalSeconds = config.totalSeconds;
		this.onEndCallback = config.onEnd;
		this.timeLeftMs = this.totalSeconds * 1000;
		this.showMinutes = config.showMinutes ?? false;
		this.textObject = config.textObject;

		// Add text object to container
		this.container.add(this.textObject);

		if (config.enableBeeping) {
			this.enableBeeping(
				config.beepSound || '',
				config.startBeepAtMs || 6000,
				config.beepColor || 0x990000
			);
		}

		this.updateDisplay();
	}

	// Expose container for direct Phaser access
	get phaserContainer(): GameObjects.Container {
		return this.container;
	}

	// Position methods
	setPosition(x: number, y: number): this {
		this.container.setPosition(x, y);
		return this;
	}

	setVisible(visible: boolean): this {
		this.container.setVisible(visible);
		return this;
	}

	setAlpha(alpha: number): this {
		this.container.setAlpha(alpha);
		return this;
	}

	setDepth(depth: number): this {
		this.container.setDepth(depth);
		return this;
	}

	start(): void {
		this.startTime = Date.now();
		this.addedTime = 0;
		this.isRunning = true;
		this.isPaused = false;
	}

	pause(): void {
		if (!this.isRunning) return;
		this.pauseTime = Date.now();
		this.isRunning = false;
		this.isPaused = true;
	}

	resume(): void {
		if (!this.isPaused) return;
		const pauseDuration = Date.now() - this.pauseTime;
		this.addedTime += pauseDuration / 1000;
		this.isRunning = true;
		this.isPaused = false;
	}

	update(): void {
		if (!this.isRunning) return;

		this.timeLeftMs = this.totalSeconds * 1000 - (Date.now() - this.startTime) + this.addedTime * 1000;

		if (this.timeLeftMs <= 0) {
			this.timeLeftMs = 0;
			this.isRunning = false;
			this.onEndCallback(this.scene);
		}

		this.updateDisplay();

		if (this.beepingEnabled) {
			this.checkBeep();
		}
	}

	addTime(seconds: number): void {
		const newTime = Math.round(this.timeLeftMs / 1000) + seconds;
		if (newTime > this.totalSeconds) {
			const diff = newTime - this.totalSeconds;
			seconds -= diff;
		}
		this.addedTime += seconds;
	}

	getProgress(): number {
		const remainingTime = this.timeLeftMs / (this.totalSeconds * 1000);
		return Math.max(0, Math.min(1, remainingTime));
	}

	private updateDisplay(): void {
		this.textObject.setText(Timer.formatTime(this.timeLeftMs, this.showMinutes));
	}

	private enableBeeping(sound: string, startAtMs: number = 6000, color: number = 0x990000): void {
		this.beepingEnabled = true;
		this.beepSound = sound;
		this.startBeepAtMs = startAtMs;
		this.beepColor = color;
	}

	private checkBeep(): void {
		if (this.timeLeftMs <= this.startBeepAtMs && this.timeLeftMs > 0) {
			const currentSecond = Math.floor(this.timeLeftMs / 1000);
			if (currentSecond !== this.lastBeepTime && this.beepSound) {
				// Play beep sound here
				this.scene.sound.play(this.beepSound);
				this.lastBeepTime = currentSecond;
			}
		}
	}

	destroy(): void {
		this.container.destroy();
	}

	// Getters for container properties
	get x(): number { return this.container.x; }
	get y(): number { return this.container.y; }
	get visible(): boolean { return this.container.visible; }
	get alpha(): number { return this.container.alpha; }

	// Timer-specific getters
	get running(): boolean { return this.isRunning; }
	get paused(): boolean { return this.isPaused; }
	get timeLeft(): number { return this.timeLeftMs; }
	get totalTime(): number { return this.totalSeconds + this.addedTime; }

	// Static utility methods
	static formatTime(timeMs: number, includeMinutes: boolean = false): string {
		const seconds = Math.floor(timeMs / 1000) % 60;
		const minutes = Math.floor(timeMs / 60000);
		let result = '';
		if (includeMinutes) {
			result += minutes.toString().padStart(2, '0') + ':';
		}
		result += seconds.toString().padStart(2, '0');
		return result;
	}

	static create(scene: Scene, config: TimerConfig): Timer {
		return new Timer(scene, config);
	}

	// Utility method to create a timer with a new text object
	static createWithText(
		scene: Scene,
		pos: { x: number; y: number },
		totalSeconds: number,
		onEnd: (scene: Scene) => void,
		textStyle?: Phaser.Types.GameObjects.Text.TextStyle,
		showMinutes: boolean = false
	): Timer {
		const textObject = scene.add.text(0, 0, '', textStyle);
		return new Timer(scene, {
			pos,
			totalSeconds,
			onEnd,
			textObject,
			showMinutes
		});
	}

	// Utility method for bitmap text timer
	static createWithBitmapText(
		scene: Scene,
		pos: { x: number; y: number },
		totalSeconds: number,
		onEnd: (scene: Scene) => void,
		font: string,
		size?: number,
		showMinutes: boolean = false
	): Timer {
		const textObject = scene.add.bitmapText(0, 0, font, '', size);

		return new Timer(scene, {
			pos,
			totalSeconds,
			onEnd,
			textObject,
			showMinutes
		});
	}
}