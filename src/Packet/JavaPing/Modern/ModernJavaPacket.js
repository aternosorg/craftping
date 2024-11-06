import Packet from "../../Packet.js";
import VarInt from "../../../VarInt.js";
import ProtocolError from "../../../Error/ProtocolError.js";

export default class ModernJavaPacket extends Packet {
    /**
     * @return {number}
     * @abstract
     */
    getPacketId() {
    }

    /**
     * @param {Buffer} data
     * @return {this}
     * @abstract
     */
    readPayload(data) {
    }

    /**
     * @inheritDoc
     */
    read(data) {
        let [packetLength, offset] = VarInt.readVarInt(data, 0);
        if (packetLength !== data.length - offset) {
            throw new ProtocolError("Received invalid packet length for " + this.constructor.name);
        }

        let packetId;
        [packetId, offset] = VarInt.readVarInt(data, offset);
        if (packetId !== this.getPacketId()) {
            throw new ProtocolError("Invalid packet ID for " + this.constructor.name);
        }

        this.readPayload(Buffer.from(data.buffer, data.byteOffset + offset, data.length - offset));
        return this;
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
        let id = VarInt.encodeVarInt(this.getPacketId());
        let payload = this.writePayload();

        return Buffer.concat([
            VarInt.encodeVarInt(id.length + payload.length),
            id,
            payload
        ]);
    }

    /**
     * @param {Buffer} data
     * @param {number} offset
     * @return {[string, number]} - [string, new offset]
     */
    readString(data, offset) {
        let length;
        [length, offset] = VarInt.readVarInt(data, offset);
        let str = data.toString('utf8', offset, offset + length);
        return [str, offset + length];
    }

    /**
     * @param {string} str
     * @return {Buffer}
     */
    encodeString(str) {
        let length = VarInt.encodeVarInt(str.length);
        return Buffer.concat([length, Buffer.from(str, 'utf8')]);
    }
}
