import UDPSocket from "../UDPSocket/UDPSocket.js";
import Query from "./Query.js";

export default class QueryClient extends UDPSocket {
    /**
     * @param {string} address
     * @param {number} port
     * @param {?AbortSignal} signal
     * @return {Promise<BasicStatResponse>}
     */
    async queryBasic(address, port, signal = null) {
        let query = new Query(address, port, this, signal);
        await query.connect();
        let result;
        try {
            result = await query.queryBasic();
        } catch (e) {
            query.close();
            throw e;
        }
        query.close();
        return result;
    }

    /**
     * @param {string} address
     * @param {number} port
     * @param {?AbortSignal} signal
     * @return {Promise<FullStatResponse>}
     */
    async queryFull(address, port, signal = null) {
        let query = new Query(address, port, this, signal);
        await query.connect();
        let result;
        try {
            result = await query.queryFull();
        } catch (e) {
            query.close();
            throw e;
        }
        query.close();
        return result;
    }
}
