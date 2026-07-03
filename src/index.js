/**
 * OcrQueueManager Library
 * Part of CraftThingy Digital Innovation SDK
 * Licensed under Public-Source Corporate Royalty License (PSCRL)
 * Isomorphic: Runs in both Browser and Node.js environments.
 */

export class OcrQueueManager {
    constructor(config = {}) {
        this.getOcrClient = config.getOcrClient;
        this.onQueueUpdate = config.onQueueUpdate || (() => {});
        this.onItemReady = config.onItemReady || (() => {});
        this.onItemError = config.onItemError || (() => {});
        this.onItemProcessing = config.onItemProcessing || (() => {});

        this.queue = [];
        this.isProcessing = false;
        this.activeIndex = -1;
    }

    /**
     * Add new image to the queue and start background OCR runner
     * @param {Object} item { id, filename, url } (url can be a URL string, Base64, Node.js Buffer, or Canvas)
     */
    enqueue(item = {}) {
        const queueItem = {
            id: item.id || this._generateId(),
            filename: item.filename || `ocr_file_${Date.now()}.jpg`,
            url: item.url,
            status: 'pending',
            results: []
        };
        
        this.queue.push(queueItem);
        this.onQueueUpdate(this.queue);
        
        // Start consuming queue in the background
        this._processNext();
    }

    /**
     * Delete queue item by index
     * @param {Number} index 
     */
    dequeue(index) {
        if (index < 0 || index >= this.queue.length) return;
        
        this.queue.splice(index, 1);
        
        if (this.activeIndex === index) {
            this.activeIndex = this.queue.length > 0 ? 0 : -1;
        } else if (this.activeIndex > index) {
            this.activeIndex--;
        }
        
        this.onQueueUpdate(this.queue);
        this._processNext();
    }

    /**
     * Set active selected queue index
     * @param {Number} index 
     */
    selectItem(index) {
        if (index < 0 || index >= this.queue.length) return;
        this.activeIndex = index;
        this.onQueueUpdate(this.queue);
    }

    /**
     * Get all queue items
     */
    getItems() {
        return [...this.queue];
    }

    /**
     * Get active selected item
     */
    getActiveItem() {
        if (this.activeIndex === -1 || this.activeIndex >= this.queue.length) return null;
        return this.queue[this.activeIndex];
    }

    /**
     * Get active selected index
     */
    getActiveIndex() {
        return this.activeIndex;
    }

    /**
     * Clear queue state
     */
    clear() {
        this.queue = [];
        this.activeIndex = -1;
        this.isProcessing = false;
        this.onQueueUpdate(this.queue);
    }

    /**
     * Process next pending item in the queue sequentially
     */
    async _processNext() {
        if (this.isProcessing) return;
        
        const pendingIndex = this.queue.findIndex(item => item.status === 'pending');
        if (pendingIndex === -1) {
            this.isProcessing = false;
            return;
        }
        
        this.isProcessing = true;
        const item = this.queue[pendingIndex];
        item.status = 'processing';
        this.onQueueUpdate(this.queue);
        this.onItemProcessing(item);

        try {
            const client = await this.getOcrClient();
            if (!client) {
                throw new Error("OCR engine client not initialized");
            }

            const isBrowser = typeof window !== 'undefined' && typeof window.Image !== 'undefined';
            const isUrlString = typeof item.url === 'string';

            if (isBrowser && isUrlString) {
                // Browser environment: Load image URL via DOM Image element before sending to client
                const img = new Image();
                img.onload = async () => {
                    try {
                        const result = await client.recognize(img);
                        this._handleSuccess(result, item, pendingIndex);
                    } catch (err) {
                        this._handleError(item, err);
                    }
                };
                
                img.onerror = () => {
                    this._handleError(item, new Error("Failed to load image element source"));
                };

                img.src = item.url;
            } else {
                // Node.js or Buffer environment: Pass URL/Buffer/Canvas directly to the OCR client
                try {
                    const result = await client.recognize(item.url);
                    this._handleSuccess(result, item, pendingIndex);
                } catch (err) {
                    this._handleError(item, err);
                }
            }
        } catch (err) {
            this._handleError(item, err);
        }
    }

    _handleSuccess(result, item, pendingIndex) {
        let words = [];
        if (result && result.lines) {
            result.lines.forEach(line => {
                if (line.words) {
                    words.push(...line.words);
                }
            });
        }
        
        item.results = words;
        item.status = 'ready';
        
        // Auto-select first loaded item
        if (this.activeIndex === -1) {
            this.activeIndex = pendingIndex;
        }
        
        this.onItemReady(item, pendingIndex);
        this.isProcessing = false;
        this.onQueueUpdate(this.queue);
        this._processNext();
    }

    _handleError(item, err) {
        item.status = 'error';
        this.onItemError(item, err);
        this.isProcessing = false;
        this.onQueueUpdate(this.queue);
        this._processNext();
    }

    _generateId() {
        return Math.random().toString(36).substring(2, 9);
    }
}
