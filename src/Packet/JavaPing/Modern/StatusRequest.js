import ModernJavaPacket from "./ModernJavaPacket.js";

export default class StatusRequest extends ModernJavaPacket {
    /**
     * @inheritDoc
     */
    getPacketId() {
        return 0;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        return Buffer.alloc(0);
    }
}
