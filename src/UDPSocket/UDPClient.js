import UDPSocket from "./UDPSocket.js";

export default class UDPClient extends UDPSocket {
    /** @type {string} */ address;
    /** @type {number} */ port;

    /**
     * @param {string} address
     * @param {number} port
     * @param {?AbortSignal} signal
     * @param {import("node:dgram").SocketOptions} options
     * @param {import("node:dgram").BindOptions} bindOptions
     */
    constructor(
        address,
        port,
        signal = null,
        options = {type: "udp4"},
        bindOptions = {}
    ) {
        if (signal) {
            options = Object.assign({}, options, {signal});
        }

        super(options, bindOptions);
        this.address = address;
        this.port = port;
        this.signal = signal;
    }

    /**
     * @param {Packet} packet
     * @return {Promise<void>}
     */
    async sendPacket(packet) {
        await this.send(packet.write(), this.port, this.address);
        this.signal?.throwIfAborted();
    }

    /**
     * @return {Promise<Buffer>}
     */
    async readData() {
        let message = await this.read();
        this.signal?.throwIfAborted();
        return message.getData();
    }
}
