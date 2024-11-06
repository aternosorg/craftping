import UDPClient from "../UDPSocket/UDPClient.js";
import HandshakeRequest from "../Packet/Query/HandshakeRequest.js";
import HandshakeResponse from "../Packet/Query/HandshakeResponse.js";
import FullStatRequest from "../Packet/Query/FullStatRequest.js";
import FullStatResponse from "../Packet/Query/FullStatResponse.js";
import BasicStatRequest from "../Packet/Query/BasicStatRequest.js";
import BasicStatResponse from "../Packet/Query/BasicStatResponse.js";

export default class Query extends UDPClient {
    /** @type {number} */ sessionId;
    /** @type {number} */ challengeToken;

    /**
     * @inheritDoc
     */
    appliesTo(message) {
        let data = message.getData();
        if (data.byteLength < 5) {
            return false;
        }

        let session = data.readUInt32BE(1);
        return session === this.sessionId;
    }

    /**
     * @return {Promise<this>}
     */
    async handshake() {
        let handshakeRequest = new HandshakeRequest().generateSessionId();
        this.sessionId = handshakeRequest.getSessionId();

        await this.send(handshakeRequest.write());
        this.signal?.throwIfAborted();

        let handshakeResponse = new HandshakeResponse().read(await this.readData());
        this.challengeToken = handshakeResponse.getChallengeToken();
        return this;
    }

    /**
     * @return {Promise<BasicStatResponse>}
     */
    async queryBasic() {
        await this.handshake();

        await this.send(new BasicStatRequest()
            .setSessionId(this.sessionId)
            .setChallengeToken(this.challengeToken)
            .write());

        this.signal?.throwIfAborted();
        return new BasicStatResponse().read(await this.readData());
    }

    /**
     * @return {Promise<FullStatResponse>}
     */
    async queryFull() {
        await this.handshake();

        await this.send(new FullStatRequest()
            .setSessionId(this.sessionId)
            .setChallengeToken(this.challengeToken)
            .write());

        this.signal?.throwIfAborted();
        return new FullStatResponse().read(await this.readData());
    }
}
