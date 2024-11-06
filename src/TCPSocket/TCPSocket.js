import * as net from "node:net";
import NetworkError from "../Error/NetworkError.js";
import QueuedPromise from "../QueuedPromise.js";
import {EventEmitter} from "node:events";

export default class TCPSocket extends EventEmitter {
    /** @type {string} */ address;
    /** @type {number} */ port;
    /** @type {boolean} */ connected;
    /** @type {?AbortSignal} */ signal;
    /** @type {Buffer} */ incoming = Buffer.alloc(0);
    /** @type {?QueuedPromise} */ waitForDataPromise = null;
    /** @type {number} */ awaitedDataLength = 0;
    /** @type {?import("node:net").Socket} */ socket = null;

    /**
     * @param {string} address
     * @param {number} port
     * @param {?AbortSignal} signal
     */
    constructor(address, port, signal = null) {
        super();
        this.address = address;
        this.port = port;
        this.signal = signal;
        this.signal?.addEventListener("abort", this.handleAbort.bind(this));
    }

    /**
     * @return {this}
     */
    handleAbort() {
        if (this.connected) {
            let error = new NetworkError("Operation was aborted");
            this.waitForDataPromise?.reject(error);
            this.waitForDataPromise = null;
            this.socket.destroy(error);
        }
        return this;
    }

    /**
     * @param {Error} error
     * @return {this}
     */
    handleError(error) {
        if (this.listenerCount("error") > 0) {
            this.emit("error", error);
        }
        return this;
    }

    /**
     * @return {this}
     */
    handleClose() {
        this.connected = false;
        this.socket = null;
        this.waitForDataPromise?.reject(new NetworkError("Socket closed unexpectedly"));
        this.waitForDataPromise = null;
        return this
    }

    /**
     * @return {this}
     */
    handleEnd() {
        this.waitForDataPromise?.reject(new NetworkError("Socket stream ended unexpectedly"));
        this.waitForDataPromise = null;
        return this;
    }

    /**
     * @param data
     * @return {TCPSocket}
     */
    handleData(data) {
        this.incoming = Buffer.concat([this.incoming, data]);
        if (this.waitForDataPromise === null) {
            this.socket.pause();
            return this;
        }

        if (this.incoming.length >= this.awaitedDataLength) {
            this.resolveDataPromise();
        }
        return this;
    }

    /**
     * @return {this}
     */
    resolveDataPromise() {
        let promise = this.waitForDataPromise;
        this.waitForDataPromise = null;
        promise.resolve();
        return this;
    }

    /**
     * @return {Promise<this>}
     */
    close() {
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                resolve(this);
                return;
            }

            this.socket.end(err => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(this);
            });
        });
    }

    /**
     * @return {this}
     */
    destroy() {
        if (this.connected) {
            this.socket.destroy();
        }
        return this;
    }

    /**
     * @return {Promise<this>}
     */
    connect() {
        return new Promise((resolve, reject) => {
            this.socket = net.createConnection(this.port, this.address, () => {
                this.socket.off("error", reject);
                this.socket.on("error", this.handleError.bind(this));
                this.socket.on("data", this.handleData.bind(this));
                this.socket.on("close", this.handleClose.bind(this));
                this.socket.on("end", this.handleEnd.bind(this));
                this.socket.setNoDelay(true);
                this.connected = true;
                resolve(this);
            });
            this.socket.once("error", reject);
        });
    }

    /**
     * @param {number} length
     * @return {Promise<Buffer>}
     */
    waitForData(length) {
        if (this.waitForDataPromise !== null) {
            throw new NetworkError("Already waiting for data");
        }

        let promise = new QueuedPromise();
        this.waitForDataPromise = promise;
        this.awaitedDataLength = length;
        if (this.incoming.length >= this.awaitedDataLength) {
            this.resolveDataPromise();
            return promise.getPromise();
        }
        this.socket.resume();
        return promise.getPromise();
    }

    /**
     * @param {number} length
     * @return {Promise<Buffer>}
     */
    async read(length) {
        await this.waitForData(length);

        let result = Buffer.from(this.incoming.buffer, this.incoming.byteOffset, length);
        let newBuffer = Buffer.alloc(this.incoming.length - length);
        this.incoming.copy(newBuffer, 0, length);
        this.incoming = newBuffer;

        return result;
    }

    /**
     * @param {number} length
     * @return {Promise<Buffer>}
     */
    async peek(length) {
        await this.waitForData(length);

        return Buffer.from(this.incoming.buffer, this.incoming.byteOffset, length);
    }

    /**
     * @param {Buffer} data
     * @return {Promise<this>}
     */
    write(data) {
        return new Promise((resolve, reject) => {
            this.socket.write(data, err => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(this);
            });
        });
    }
}
