import ServerToClientPacket from "./ServerToClientPacket.js";

export default class HandshakeResponse extends ServerToClientPacket {
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
        return 9;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        let [token] = this.readStringNT(data, 0);
        if (token === null) {
            throw new Error("Invalid handshake response payload");
        }

        let parsed = parseInt(token);
        if (isNaN(parsed)) {
            throw new Error("Handshake response token is not a number");
        }

        this.challengeToken = parsed;
        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        let token = this.challengeToken.toString();
        let buffer = Buffer.alloc(Buffer.byteLength(token, 'utf8') + 1);
        buffer.write(token, 0, 'utf8');
        buffer.writeUInt8(0, buffer.length - 1);
        return buffer;
    }
}
