import UDPSocket from "../UDPSocket/UDPSocket.js";
import BedrockPing from "./BedrockPing.js";

export default class BedrockPingClient {
    /** @type {import("node:dgram").SocketOptions}} */ socketOptions;
    /** @type {import("node:dgram").BindOptions}} */ bindOptions;

    /**
     * @param {import("node:dgram").SocketOptions} socketOptions
     * @param {import("node:dgram").BindOptions} bindOptions
     */
    constructor(socketOptions = {type: "udp4"}, bindOptions = {}) {
        this.socketOptions = socketOptions;
        this.bindOptions = bindOptions;
    }

    /**
     * @param {string} address
     * @param {number} port
     * @param {?AbortSignal} signal
     * @return {Promise<UnconnectedPong>}
     */
    async ping(address, port, signal = null) {
        let ping = new BedrockPing(address, port, signal, this.socketOptions, this.bindOptions);
        await ping.bind(signal);
        let result;
        try {
            result = await ping.ping();
        } catch (e) {
            await ping.close();
            throw e;
        }
        await ping.close();
        return result;
    }
}
