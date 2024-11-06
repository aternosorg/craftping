import LegacyJavaPacket from "./LegacyJavaPacket.js";

export default class LegacyKick extends LegacyJavaPacket {
    /** @type {string} */ message;

    /**
     * @return {string}
     */
    getMessage() {
        return this.message;
    }

    /**
     * @param {string} message
     * @return {this}
     */
    setMessage(message) {
        this.message = message;
        return this;
    }

    /**
     * @inheritDoc
     */
    getPacketId() {
        return 0xff;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        this.message = this.readString(data, 0)[0];
        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        return this.encodeString(this.message);
    }
}
