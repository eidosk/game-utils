// eidosk/core/events/EventBus.ts
type EventCallback<T = any> = (data: T) => void;

interface ListenerEntry<T = any> {
    callback: EventCallback<T>;
    context?: any;
    bound: EventCallback<T>;
}

export class EventBus {
    private listeners: Map<string, ListenerEntry[]> = new Map();
    private debug: boolean = false;

    constructor(debug: boolean = false) {
        this.debug = debug;
    }

    /**
     * Subscribe to an event
     */
    on<T = any>(event: string, callback: EventCallback<T>, context?: any): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        const bound = context ? callback.bind(context) : callback;

        this.listeners.get(event)!.push({
            callback,
            context,
            bound
        });
    }

    /**
     * Unsubscribe from an event
     */
    off<T = any>(event: string, callback: EventCallback<T>, context?: any): void {
        const entries = this.listeners.get(event);
        if (!entries) return;

        // Find matching entry by comparing original callback and context
        const index = entries.findIndex(entry =>
            entry.callback === callback && entry.context === context
        );

        if (index > -1) {
            entries.splice(index, 1);
        }

        // Clean up empty arrays
        if (entries.length === 0) {
            this.listeners.delete(event);
        }
    }

    /**
     * Emit an event to all listeners
     */
    emit<T = any>(event: string, data?: T): void {
        if (this.debug) {
            console.log("[EventBus] Emitting: " + event, data);
        }

        const entries = this.listeners.get(event);

        if (!entries || entries.length === 0) {
            if (this.debug) {
                console.warn("[EventBus] No listeners for: " + event);
            }
            return;
        }

        // Create a copy to avoid issues if listeners are modified during emission
        entries.slice().forEach(entry => {
            try {
                entry.bound(data as any);
            } catch (error) {
                console.error("[EventBus] Error in listener for \"" + event + "\":", error);
            }
        });
    }

    /**
     * Subscribe to an event but only listen once
     */
    once<T = any>(event: string, callback: EventCallback<T>, context?: any): void {
        const onceWrapper: EventCallback<T> = (data: T) => {
            callback.call(context, data);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
    }

    /**
     * Remove all listeners for a specific event, or all events if not specified
     */
    clear(event?: string): void {
        if (event) {
            this.listeners.delete(event);
            if (this.debug) {
                console.log("[EventBus] Cleared listeners for: " + event);
            }
        } else {
            this.listeners.clear();
            if (this.debug) {
                console.log("[EventBus] Cleared all listeners");
            }
        }
    }

    /**
     * Get list of events that have listeners
     */
    getEvents(): string[] {
        return Array.from(this.listeners.keys());
    }

    /**
     * Check if an event has any listeners
     */
    hasListeners(event: string): boolean {
        const entries = this.listeners.get(event);
        return entries ? entries.length > 0 : false;
    }

    /**
     * Get listener count for an event
     */
    getListenerCount(event: string): number {
        return this.listeners.get(event)?.length || 0;
    }

    /**
     * Enable/disable debug logging
     */
    setDebug(enabled: boolean): void {
        this.debug = enabled;
    }
}