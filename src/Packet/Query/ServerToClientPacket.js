import QueryPacket from "./QueryPacket.js";
import ProtocolError from "../../Error/ProtocolError.js";

/**
 * @abstract
 */
export default class ServerToClientPacket extends QueryPacket {
    /**
     * @inheritDoc
     */
    read(data) {
        if (data.length < 5) {
            throw new ProtocolError("Invalid packet size for ServerToClientPacket");
        }

        if (data.readUint8(0) !== this.getType()) {
            throw new ProtocolError("Invalid packet type for " + this.constructor.name);
        }

        this.setSessionId(data.readUint32BE(1));
        this.readPayload(Buffer.from(data.buffer, data.byteOffset + 5, data.length - 5));
        return this;
    }

    /**
     * @inheritDoc
     */
    write() {
        let buffer = Buffer.alloc(5);
        buffer.writeUint8(this.getType(), 0);
        buffer.writeUint32BE(this.getSessionId(), 1);

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
