import {EventEmitter} from "node:events";
import dgram from "node:dgram";
import UDPMessage from "./UDPMessage.js";

export default class UDPSocket extends EventEmitter {
    /** @type {import("node:dgram").Socket} */ socket;
    /** @type {Set<UDPClient>} */ clients = new Set();
    /** @type {boolean} */ open = false;
    /** @type {import("node:dgram").BindOptions}} */ bindOptions;

    /**
     * @param {import("node:dgram").SocketOptions} options
     * @param {import("node:dgram").BindOptions} bindOptions
     */
    constructor(options = {type: "udp4"}, bindOptions = {}) {
        super();
        this.bindOptions = bindOptions;
        this.socket = dgram.createSocket(options, this.handleMessage.bind(this));
        this.socket.on("error", this.handleError.bind(this));
        this.socket.on("close", this.handleClose.bind(this));
    }

    /**
     * @return {Promise<this>}
     */
    bind() {
        return new Promise((resolve, reject) => {
            this.socket.once("error", reject);
            this.socket.bind(this.bindOptions, () => {
                this.socket.off("error", reject);
                this.open = true;
                resolve(this);
            });
        });
    }

    /**
     * @return {Promise<this>}
     */
    close() {
        return new Promise((resolve, reject) => {
            if (!this.open) {
                resolve(this);
                return;
            }

            this.socket.close(err => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(this);
            });
        });
    }

    /**
     * @return {UDPSocket}
     */
    handleClose() {
        this.open = false;
        for (const client of this.clients) {
            client.handleClose();
        }
        this.emit("close");
        return this;
    }

    /**
     * @param {Error} error
     * @return {UDPSocket}
     */
    handleError(error) {
        for (const client of this.clients) {
            client.handleError(error);
        }
        if (this.listenerCount("error") > 0) {
            this.emit("error", error);
        }
        return this;
    }

    /**
     * @param {UDPClient} client
     * @return {UDPSocket}
     */
    handleDisposeClient(client) {
        this.clients.delete(client);
        return this;
    }

    handleMessage(data, info) {
        let message = new UDPMessage(data, info);
        for (const client of this.clients) {
            client.handleMessage(message);
        }
        return this;
    }

    /**
     * @param {UDPClient} client
     * @return {Promise<this>}
     */
    async register(client) {
        if (!this.open) {
            await this.bind();
        }
        this.clients.add(client);
        client.on("dispose", this.handleDisposeClient.bind(this));
        return this;
    }

    /**
     * @param {Buffer} msg
     * @param {number} port
     * @param {string} address
     * @return {Promise<this>}
     */
    send(msg, port, address) {
        return new Promise((resolve, reject) => {
            this.socket.send(msg, port, address, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this);
            });
        });
    }
}
