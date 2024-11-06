import ClientToServerPacket from "./ClientToServerPacket.js";
import ProtocolError from "../../Error/ProtocolError.js";

export default class BasicStatRequest extends ClientToServerPacket {
    /** @type {number} */ challengeToken;

    /**
     * @return {number}
     */
    getChallengeToken() {
        return this.challengeToken;
    }

    /**
     * @param {number} challengeToken
     * @return {this}
     */
    setChallengeToken(challengeToken) {
        this.challengeToken = challengeToken;
        return this;
    }

    /**
     * @inheritDoc
     */
    getType() {
        return 0;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        if (data.length < 4) {
            throw new ProtocolError("Invalid packet size for " + this.constructor.name);
        }

        this.challengeToken = data.readUint32BE(0);
        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        let buffer = Buffer.alloc(4);
        buffer.writeUint32BE(this.challengeToken, 0);
        return buffer;
    }
}
