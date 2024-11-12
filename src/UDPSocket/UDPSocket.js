import {EventEmitter} from "node:events";
import dgram from "node:dgram";
import UDPMessage from "./UDPMessage.js";
import NetworkError from "../Error/NetworkError.js";

export default class UDPSocket extends EventEmitter {
    /** @type {?import("node:dgram").Socket} */ socket = null;
    /** @type {Set<UDPClient>} */ clients = new Set();
    /** @type {boolean} */ open = false;
    /** @type {import("node:dgram").SocketOptions}} */ socketOptions;
    /** @type {import("node:dgram").BindOptions}} */ bindOptions;

    /**
     * @param {import("node:dgram").SocketOptions} options
     * @param {import("node:dgram").BindOptions} bindOptions
     */
    constructor(options = {type: "udp4"}, bindOptions = {}) {
        super();
        this.socketOptions = options;
        this.bindOptions = bindOptions;
    }

    /**
     * @param {?AbortSignal} signal
     * @return {Promise<this>}
     */
    bind(signal = null) {
        let socket = dgram.createSocket(this.socketOptions, this.handleMessage.bind(this));
        this.socket = socket;
        this.socket.on("error", this.handleError.bind(this));
        this.socket.on("close", this.handleClose.bind(this));
        return new Promise((resolve, reject) => {
            let success = false;
            socket.once("error", reject);
            socket.bind(this.bindOptions, () => {
                socket.off("error", reject);
                this.open = true;
                success = true;
                resolve(this);
            });

            signal?.addEventListener("abort", () => {
                if (!success) {
                    socket.close();
                    reject(new Error("Operation was aborted"));
                }
            });
        });
    }

    /**
     * @return {Promise<this>}
     */
    close() {
        return new Promise((resolve, reject) => {
            if (!this.open || !this.socket) {
                resolve(this);
                return;
            }

            try {
                this.socket.close(err => {
                    if (err && err.code !== "ERR_SOCKET_DGRAM_NOT_RUNNING") {
                        reject(err);
                        return;
                    }

                    resolve(this);
                });
            } catch (e) {
                if (e.code === "ERR_SOCKET_DGRAM_NOT_RUNNING") {
                    resolve(this);
                    return;
                }
                reject(e);
            }
        });
    }

    /**
     * @return {UDPSocket}
     */
    handleClose() {
        this.open = false;
        this.closeClients();
        this.emit("close");
        return this;
    }

    /**
     * @return {this}
     */
    closeClients() {
        for (const client of this.clients) {
            client.handleClose();
        }
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
        this.open = false;
        try {
            this.socket?.close();
        } catch (e) {
        }
        this.closeClients();
        this.socket = null;
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
            await this.bind(client.signal);
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
            if (!this.open || !this.socket) {
                reject(new NetworkError("Socket is not open"));
                return;
            }

            let socket = this.socket;
            function close() {
                reject(new NetworkError("Socket was closed"));
            }
            socket.once("close", close);
            socket.send(msg, port, address, err => {
                socket.off("close", close);
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this);
            });
        });
    }
}
