import QueryPacket from "./QueryPacket.js";
import ProtocolError from "../../Error/ProtocolError.js";

/**
 * @abstract
 */
export default class ClientToServerPacket extends QueryPacket {
    /** @type {number} */ static MAGIC = 0xFEFD;

    /**
     * @inheritDoc
     */
    read(data) {
        if (data.length < 7) {
            throw new ProtocolError("Invalid packet size for ClientToServerPacket");
        }

        if (data.readUint16BE(0) !== this.constructor.MAGIC) {
            throw new ProtocolError("Invalid magic for ClientToServerPacket");
        }

        if (data.readUint8(2) !== this.getType()) {
            throw new ProtocolError("Invalid packet type for " + this.constructor.name);
        }

        this.setSessionId(data.readUint32BE(3));
        this.readPayload(Buffer.from(data.buffer, data.byteOffset + 7, data.length - 7));
        return this;
    }

    /**
     * @inheritDoc
     */
    write() {
        let buffer = Buffer.alloc(7);
        buffer.writeUint16BE(this.constructor.MAGIC, 0);
        buffer.writeUint8(this.getType(), 2);
        buffer.writeUint32BE(this.getSessionId(), 3);

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
