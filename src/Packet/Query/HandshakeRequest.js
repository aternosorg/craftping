import ClientToServerPacket from "./ClientToServerPacket.js";

export default class HandshakeRequest extends ClientToServerPacket {
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

    /**
     * @inheritDoc
     */
    getType() {
        return 9;
    }
}
