import {EventEmitter} from "node:events";
import QueuedPromise from "../QueuedPromise.js";
import NetworkError from "../Error/NetworkError.js";

export default class UDPClient extends EventEmitter {
    /** @type {string} */ address;
    /** @type {number} */ port;
    /** @type {UDPSocket} */ socket;
    /** @type {UDPMessage[]} */ inboundQueue = []
    /** @type {QueuedPromise<UDPMessage>[]} */ readQueue = [];
    /** @type {?AbortSignal} */ signal;
    /** @type {boolean} */ open = false;

    /**
     * @param {string} address
     * @param {number} port
     * @param {UDPSocket} socket
     * @param {?AbortSignal} signal
     */
    constructor(address, port, socket, signal = null) {
        super();
        this.address = address;
        this.port = port;
        this.socket = socket;
        this.signal = signal;
        this.signal?.addEventListener("abort", this.handleAbort.bind(this));
    }

    /**
     * @return {Promise<UDPClient>}
     */
    async connect() {
        await this.socket.register(this);
        this.open = true;
        return this;
    }

    /**
     * @return {this}
     */
    handleAbort() {
        if (this.open) {
            this.close(new NetworkError("Operation was aborted"));
        }
        return this;
    }

    /**
     * @param {?Error} error
     * @return {this}
     */
    close(error = null) {
        this.emit("dispose", this);
        this.handleClose(error);
        this.removeAllListeners();
        return this;
    }

    /**
     * @param {UDPMessage} message
     * @return {boolean}
     */
    appliesTo(message) {
        return this.address === message.getAddress() && this.port === message.getPort();
    }

    /**
     * @param {UDPMessage} message
     * @return {this}
     */
    handleMessage(message) {
        if (!this.appliesTo(message)) {
            return this;
        }

        if (this.readQueue.length > 0) {
            this.readQueue.shift().resolve(message);
            return this;
        }

        this.inboundQueue.push(message);
        return this;
    }

    /**
     * @param {Error} error
     * @return {UDPClient}
     */
    handleError(error) {
        if (this.listenerCount("error") > 0) {
            this.emit("error", error);
        }
        return this;
    }

    /**
     * @param {?Error} error
     * @return {this}
     */
    handleClose(error = null) {
        this.open = false;
        this.emit("close");
        for (const promise of this.readQueue) {
            promise.reject(error ?? new NetworkError("Client was closed"));
        }
        return this;
    }

    /**
     * @param {Buffer} msg
     * @return {Promise<this>}
     */
    async send(msg) {
        await this.socket.send(msg, this.port, this.address);
        return this;
    }

    /**
     * @return {Promise<UDPMessage>}
     */
    read() {
        if (this.inboundQueue.length > 0) {
            return Promise.resolve(this.inboundQueue.shift());
        }

        let promise = new QueuedPromise();
        this.readQueue.push(promise);
        return promise.getPromise();
    }

    /**
     * @return {Promise<Buffer>}
     */
    async readData() {
        return (await this.read()).getData();
    }
}
