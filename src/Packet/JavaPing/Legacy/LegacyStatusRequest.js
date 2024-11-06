import LegacyJavaPacket from "./LegacyJavaPacket.js";
import ProtocolError from "../../../Error/ProtocolError.js";

export default class LegacyStatusRequest extends LegacyJavaPacket {
    /**
     * @inheritDoc
     */
    getPacketId() {
        return 0xfe;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        if (data.readInt8(0) !== 1) {
            throw new ProtocolError("Invalid payload for LegacyStatusRequest");
        }

        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        let buffer = Buffer.alloc(1);
        buffer.writeInt8(1, 0);
        return buffer;
    }
}
