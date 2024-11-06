import BasicStatRequest from "./BasicStatRequest.js";

export default class FullStatRequest extends BasicStatRequest {
    /**
     * @inheritDoc
     */
    writePayload() {
        let buffer = Buffer.alloc(8);
        buffer.writeUint32BE(this.challengeToken, 0);
        buffer.writeUint32BE(0, 4);
        return buffer;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        if (data.length !== 8) {
            throw new Error("Invalid packet size for FullStatRequest");
        }
        return super.readPayload(data);
    }
}
