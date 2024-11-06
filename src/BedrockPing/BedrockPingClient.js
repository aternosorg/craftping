import UDPSocket from "../UDPSocket/UDPSocket.js";
import BedrockPing from "./BedrockPing.js";

export default class BedrockPingClient extends UDPSocket {
    /**
     * @param {string} address
     * @param {number} port
     * @param {?AbortSignal} signal
     * @return {Promise<UnconnectedPong>}
     */
    async ping(address, port, signal = null) {
        let ping = new BedrockPing(address, port, this, signal);
        await ping.connect();
        let result;
        try {
            result = await ping.ping();
        } catch (e) {
            ping.close();
            throw e;
        }
        ping.close();
        return result;
    }
}
