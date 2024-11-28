import Query from "./Query.js";

export default class QueryClient {
    /** @type {import("node:dgram").SocketOptions}} */ socketOptions;
    /** @type {import("node:dgram").BindOptions}} */ bindOptions;

    /**
     * @param {import("node:dgram").SocketOptions} socketOptions
     * @param {import("node:dgram").BindOptions} bindOptions
     */
    constructor(socketOptions = {type: "udp4"}, bindOptions = {}) {
        this.socketOptions = socketOptions;
        this.bindOptions = bindOptions;
    }

    /**
     * @param {string} address
     * @param {number} port
     * @param {?AbortSignal} signal
     * @return {Promise<BasicStatResponse>}
     */
    async queryBasic(address, port, signal = null) {
        let query = new Query(address, port, signal, this.socketOptions, this.bindOptions);
        await query.bind(signal);
        let result;
        try {
            result = await query.queryBasic();
        } catch (e) {
            await query.close();
            throw e;
        }
        await query.close();
        return result;
    }

    /**
     * @param {string} address
     * @param {number} port
     * @param {?AbortSignal} signal
     * @return {Promise<FullStatResponse>}
     */
    async queryFull(address, port, signal = null) {
        let query = new Query(address, port, signal, this.socketOptions, this.bindOptions);
        await query.bind(signal);
        let result;
        try {
            result = await query.queryFull();
        } catch (e) {
            await query.close();
            throw e;
        }
        await query.close();
        return result;
    }
}
