import UDPClient from "../UDPSocket/UDPClient.js";
import UnconnectedPing from "../Packet/BedrockPing/UnconnectedPing.js";
import UnconnectedPong from "../Packet/BedrockPing/UnconnectedPong.js";

export default class BedrockPing extends UDPClient {
    /**
     * @return {Promise<UnconnectedPong>}
     */
    async ping() {
        let startTime = BigInt(Date.now());
        await this.sendPacket(new UnconnectedPing().setTime(startTime).generateClientGUID());
        this.signal?.throwIfAborted();

        return new UnconnectedPong().read(await this.readData());
    }
}
