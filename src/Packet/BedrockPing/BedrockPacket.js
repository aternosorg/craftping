import Packet from "../Packet.js";
import ProtocolError from "../../Error/ProtocolError.js";

export default class BedrockPacket extends Packet {
    /** @type {Buffer} */ static MAGICK = Buffer.from('00ffff00fefefefefdfdfdfd12345678', 'hex');

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
        if (data.length < 1) {
            throw new ProtocolError("Packet too short");
        }

        let packetId = data.readUInt8(0);
        if (packetId !== this.getPacketId()) {
            throw new ProtocolError("Invalid packet ID for " + this.constructor.name);
        }

        this.readPayload(Buffer.from(data.buffer, data.byteOffset + 1, data.length - 1));
        return this;
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
     * @return {Buffer}
     * @abstract
     */
    writePayload() {

    }

    /**
     * @param {Buffer} data
     * @return {this}
     * @abstract
     */
    readPayload(data) {

    }
}
