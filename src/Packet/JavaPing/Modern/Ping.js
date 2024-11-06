import ModernJavaPacket from "./ModernJavaPacket.js";
import ProtocolError from "../../../Error/ProtocolError.js";

/**
 * Ping request/response packet
 * This packet is the same for both requests and responses
 */
export default class Ping extends ModernJavaPacket {
    /** @type {BigInt} */ time;

    /**
     * @return {BigInt}
     */
    getTime() {
        return this.time;
    }

    /**
     * @param {BigInt} time
     * @return {this}
     */
    setTime(time) {
        this.time = time;
        return this;
    }

    /**
     * @inheritDoc
     */
    getPacketId() {
        return 1;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        if (data.length !== 8) {
            throw new ProtocolError("Invalid payload length for PingRequest");
        }
        this.time = data.readBigInt64BE();
        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        let buffer = Buffer.alloc(8);
        buffer.writeBigInt64BE(this.time);
        return buffer;
    }
}
