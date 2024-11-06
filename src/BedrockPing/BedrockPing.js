import UDPClient from "../UDPSocket/UDPClient.js";
import UnconnectedPing from "../Packet/BedrockPing/UnconnectedPing.js";
import UnconnectedPong from "../Packet/BedrockPing/UnconnectedPong.js";
import * as crypto from "node:crypto";

export default class BedrockPing extends UDPClient {
    /** @type {BigInt} */ sessionId;

    /**
     * @inheritDoc
     */
    appliesTo(message) {
        let data = message.getData();
        if (data.byteLength < 9) {
            return false;
        }

        let timestamp = data.readBigInt64BE(1);
        return timestamp === this.sessionId;
    }

    /**
     * @return {Promise<UnconnectedPong>}
     */
    async ping() {
        // Normally, the time field is used for the current ms timestamp, but we're using it as a session ID
        // to identify which reply belongs to which request since we're using the same socket for multiple requests.
        this.sessionId = crypto.randomBytes(8).readBigInt64BE();
        let startTime = BigInt(Date.now());
        await this.send(new UnconnectedPing().setTime(this.sessionId).generateClientGUID().write());
        this.signal?.throwIfAborted();

        // The time field in the response contains the session ID, but we replace it with the start time
        // in case anyone relies on the time field containing an actual timestamp.
        return new UnconnectedPong().read(await this.readData()).setTime(startTime);
    }
}
