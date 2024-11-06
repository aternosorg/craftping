import ModernJavaPacket from "./ModernJavaPacket.js";
import JsonStatus from "../../../JavaPing/Status/JsonStatus/JsonStatus.js";
import ProtocolError from "../../../Error/ProtocolError.js";

export default class StatusResponse extends ModernJavaPacket {
    /** @type {JsonStatus} */ status;

    /**
     * @return {JsonStatus}
     */
    getStatus() {
        return this.status;
    }

    /**
     * @param {JsonStatus} status
     * @return {this}
     */
    setStatus(status) {
        this.status = status;
        return this;
    }

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
        let string = this.readString(data, 0)[0];
        try {
            this.status = JsonStatus.fromJson(JSON.parse(string));
        } catch (e) {
            throw new ProtocolError("Failed to parse JSON status: " + e.message);
        }
        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        return this.encodeString(JSON.stringify(this.status));
    }
}
