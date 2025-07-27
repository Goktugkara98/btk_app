/**
 * =============================================================================
 * EVENT BUS - MODULE COMMUNICATION
 * =============================================================================
 * 
 * Bu dosya modüller arası iletişimi sağlar.
 * Event-driven architecture için merkezi event yönetimi yapar.
 * 
 * Sorumlulukları:
 * - Event'leri yayınlamak (emit)
 * - Event'leri dinlemek (on)
 * - Event listener'ları kaldırmak (off)
 * - Event geçmişini tutmak
 */

export class EventBus {
    constructor() {
        this.events = {};
        this.eventHistory = [];
        this.maxHistorySize = 100;
    }

    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }

    emit(eventName, data = null) {
        // Add to history
        this.addToHistory(eventName, data);

        // Execute callbacks
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event callback for ${eventName}:`, error);
                }
            });
        }
    }

    addToHistory(eventName, data) {
        this.eventHistory.push({
            timestamp: Date.now(),
            event: eventName,
            data: data
        });

        // Keep history size manageable
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    getEventHistory() {
        return this.eventHistory;
    }

    clearEventHistory() {
        this.eventHistory = [];
    }

    getEventCount(eventName) {
        return this.eventHistory.filter(event => event.event === eventName).length;
    }

    // Utility method to emit multiple events
    emitMultiple(events) {
        events.forEach(({ event, data }) => {
            this.emit(event, data);
        });
    }

    // Debug method to log all registered events
    debug() {
        console.log('Registered events:', Object.keys(this.events));
        console.log('Event history:', this.eventHistory);
    }
} 