import Packet from "../../Packet.js";
import ProtocolError from "../../../Error/ProtocolError.js";

export default class LegacyJavaPacket extends Packet {
    /**
     * @return {number}
     * @abstract
     */
    getPacketId() {
    }

    /**
     * @inheritDoc
     */
    read(data) {
        let packetId = data.readUInt8(0);
        if (packetId !== this.getPacketId()) {
            throw new ProtocolError("Invalid packet ID for " + this.constructor.name);
        }

        this.readPayload(Buffer.from(data.buffer, data.byteOffset + 1, data.length - 1));
        return this;
    }

    /**
     * @param {Buffer} data
     * @return {this}
     * @abstract
     */
    readPayload(data) {

    }

    /**
     * @return {Buffer}
     * @abstract
     */
    writePayload() {

    }

    /**
     * @inheritDoc
     */
    write() {
        let buffer = Buffer.alloc(1);
        buffer.writeUInt8(this.getPacketId(), 0);

        return Buffer.concat([buffer, this.writePayload()]);
    }

    /**
     * Read a 16-bit length prefix and the UTF-16BE string that follows
     *
     * @param {Buffer} data
     * @param {number} offset
     * @return {[string, number]}
     */
    readString(data, offset) {
        let length = data.readUInt16BE(offset);
        offset += 2;
        return this.readRawString(data, offset, length * 2);
    }

    /**
     * Read a UTF-16BE string from a buffer
     *
     * @param data
     * @param offset
     * @param byteLength
     * @return {(string|*)[]}
     */
    readRawString(data, offset, byteLength) {
        let end = offset + byteLength;
        let result = '';
        for (let i = offset; i < end; i += 2) {
            result += String.fromCodePoint(data.readUInt16BE(i));
        }
        return [result, end];
    }

    /**
     * @param {Buffer} target
     * @param {string} value
     * @param {number} offset
     */
    writeString(target, value, offset) {
        target.writeUInt16BE(value.length, offset);
        offset += 2;
        for (let i = 0; i < value.length; i++) {
            target.writeUInt16BE(value.codePointAt(i), offset);
            offset += 2;
        }

        return offset;
    }

    /**
     * Encode a string as a 16-bit length prefix and a UTF-16BE string
     *
     * @param {string} str
     * @return {Buffer}
     */
    encodeString(str) {
        let length = str.length;
        let buffer = Buffer.alloc(2 + length * 2);
        this.writeString(buffer, str, 0);
        return buffer;
    }

    /**
     * @param {string} str
     * @return {number}
     */
    measureString(str) {
        return 2 + str.length * 2;
    }
}
