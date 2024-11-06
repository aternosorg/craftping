import BedrockPacket from "./BedrockPacket.js";
import * as crypto from "node:crypto";
import ProtocolError from "../../Error/ProtocolError.js";

export default class UnconnectedPing extends BedrockPacket {
    /** @type {BigInt} */ time;
    /** @type {BigInt} */ clientGUID;

    /**
     * @return {BigInt}
     */
    getClientGUID() {
        return this.clientGUID;
    }

    /**
     * @param {BigInt} clientGUID
     * @return {this}
     */
    setClientGUID(clientGUID) {
        this.clientGUID = clientGUID;
        return this;
    }

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
     * @return {this}
     */
    generateClientGUID() {
        let bytes = crypto.randomBytes(8);
        this.clientGUID = bytes.readBigInt64BE(0);
        return this;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        if (data.length < 16 + this.constructor.MAGICK.length) {
            throw new ProtocolError("Packet too short for " + this.constructor.name);
        }

        this.time = data.readBigInt64BE(0);
        let magick = Buffer.from(data.buffer, data.byteOffset + 8, this.constructor.MAGICK.length);
        if (!magick.equals(this.constructor.MAGICK)) {
            throw new ProtocolError("Invalid magick in unconnected ping");
        }
        this.clientGUID = data.readBigInt64BE(8 + this.constructor.MAGICK.length);
        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        let buffer = Buffer.alloc(16 + this.constructor.MAGICK.length);
        buffer.writeBigInt64BE(this.time, 0);
        this.constructor.MAGICK.copy(buffer, 8);
        buffer.writeBigInt64BE(this.clientGUID, 8 + this.constructor.MAGICK.length);
        return buffer;
    }
}
