import ModernJavaPacket from "./ModernJavaPacket.js";
import VarInt from "../../../VarInt.js";

export default class Handshake extends ModernJavaPacket {
    static DEFAULT_PROTOCOL_VERSION = 4;

    /** @type {?number} */ protocolVersion = null;
    /** @type {string} */ hostname;
    /** @type {number} */ port;
    /** @type {number} */ nextState = 1;

    /**
     * @return {number}
     */
    getNextState() {
        return this.nextState;
    }

    /**
     * @param {number} nextState
     * @return {this}
     */
    setNextState(nextState) {
        this.nextState = nextState;
        return this;
    }

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
     *
     *
     * @param {?number} protocolVersion
     * @return {this}
     */
    setProtocolVersion(protocolVersion) {
        this.protocolVersion = protocolVersion;
        return this;
    }

    getPacketId() {
        return 0;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        let offset;
        [this.protocolVersion, offset] = VarInt.readVarInt(data, 0);
        [this.hostname, offset] = this.readString(data, offset);
        this.port = data.readUInt16BE(offset);
        offset += 2;
        this.nextState = VarInt.readVarInt(data, offset)[0];

        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        let port = Buffer.alloc(2);
        port.writeUInt16BE(this.getPort(), 0);

        return Buffer.concat([
            VarInt.encodeVarInt(this.getProtocolVersion()),
            this.encodeString(this.getHostname()),
            port,
            VarInt.encodeVarInt(this.getNextState())
        ]);
    }
}
