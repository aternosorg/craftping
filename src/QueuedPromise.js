/**
 * @template T
 */
export default class QueuedPromise {
    /** @type {Promise<T>} */ promise;
    /** @type {function(T)} */ #resolve;
    /** @type {function(Error)} */ #reject;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }

    /**
     * @return {Promise<T>}
     */
    getPromise() {
        return this.promise;
    }

    /**
     * @param {?T} value
     * @return {this}
     */
    resolve(value = null) {
        this.#resolve(value);
        return this;
    }

    /**
     * @param {Error} error
     * @return {this}
     */
    reject(error) {
        this.#reject(error);
        return this;
    }
}
