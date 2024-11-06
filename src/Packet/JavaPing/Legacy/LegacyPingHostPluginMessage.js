import LegacyJavaPacket from "./LegacyJavaPacket.js";
import ProtocolError from "../../../Error/ProtocolError.js";

export default class LegacyPingHostPluginMessage extends LegacyJavaPacket {
    static DEFAULT_PROTOCOL_VERSION = 74;

    /** @type {string} */ type = 'MC|PingHost';
    /** @type {?number} */ protocolVersion = null;
    /** @type {string} */ hostname;
    /** @type {number} */ port;

    /**
     * @return {number}
     */
    getPort() {
        return this.port;
    }

    /**
     * @param {number} port
     * @return {this}
     */
    setPort(port) {
        this.port = port;
        return this;
    }

    /**
     * @return {string}
     */
    getHostname() {
        return this.hostname;
    }

    /**
     * @param {string} hostname
     * @return {this}
     */
    setHostname(hostname) {
        this.hostname = hostname;
        return this;
    }

    /**
     * @return {number}
     */
    getProtocolVersion() {
        return this.protocolVersion ?? this.constructor.DEFAULT_PROTOCOL_VERSION;
    }

    /**
     * @param {?number} protocolVersion
     * @return {this}
     */
    setProtocolVersion(protocolVersion) {
        this.protocolVersion = protocolVersion;
        return this;
    }

    /**
     * @return {string}
     */
    getType() {
        return this.type;
    }

    /**
     * @param {string} type
     * @return {this}
     */
    setType(type) {
        this.type = type;
        return this;
    }

    /**
     * @inheritDoc
     */
    getPacketId() {
        return 0xfa;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        let offset;
        [this.type, offset] = this.readString(data, 0);
        let remainingLength = data.readUInt16BE(offset);
        offset += 2;
        if (remainingLength !== data.length - offset) {
            throw new ProtocolError("Invalid payload length for LegacyPluginMessage");
        }
        this.protocolVersion = data.readUInt8(offset);
        offset += 1;
        [this.hostname, offset] = this.readString(data, offset);
        this.port = data.readUInt32BE(offset);

        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        let remainingLength = 5 + this.measureString(this.getHostname());
        let length = remainingLength + 2 + this.measureString(this.getType());

        let buffer = Buffer.alloc(length);
        let offset = 0;
        offset = this.writeString(buffer, this.getType(), offset);
        buffer.writeUInt16BE(remainingLength, offset);
        offset += 2;
        buffer.writeUInt8(this.getProtocolVersion(), offset);
        offset += 1;
        offset = this.writeString(buffer, this.getHostname(), offset);
        buffer.writeUInt32BE(this.getPort(), offset);
        return buffer;
    }
}
