import UDPClient from "../UDPSocket/UDPClient.js";
import UnconnectedPing from "../Packet/BedrockPing/UnconnectedPing.js";
import UnconnectedPong from "../Packet/BedrockPing/UnconnectedPong.js";
import * as crypto from "node:crypto";

export default class BedrockPing extends UDPClient {
    /** @type {BigInt} */ sessionId;

    /**
     * @return {Promise<UnconnectedPong>}
     */
    async ping() {
        // Normally, the time field is used for the current ms timestamp, but we're using it as a session ID
        // to identify which reply belongs to which request.
        this.sessionId = crypto.randomBytes(8).readBigInt64BE();
        let startTime = BigInt(Date.now());
        await this.sendPacket(new UnconnectedPing().setTime(this.sessionId).generateClientGUID());
        this.signal?.throwIfAborted();

        // The time field in the response contains the session ID, but we replace it with the start time
        // in case anyone relies on the time field containing an actual timestamp.
        return new UnconnectedPong().read(await this.readData()).setTime(startTime);
    }

    /**
     * @inheritDoc
     */
    shouldAcceptPacket(packet) {
        let data = packet.getData();
        if (data.byteLength < 9) {
            return false;
        }

        let timestamp = data.readBigInt64BE(1);
        return timestamp === this.sessionId;
    }
}
