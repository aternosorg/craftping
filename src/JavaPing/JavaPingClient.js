import JavaPing from "./JavaPing.js";
import {Resolver} from 'node:dns/promises';
import * as net from "node:net";

/**
 * @typedef {Object} PingOptions
 * @property {string} [hostname] - The hostname sent to the server in ping messages, not necessarily the same as the address used to connect
 * @property {number} [port] - The port sent to the server in ping messages, not necessarily the same as the port used to connect
 * @property {number} [protocolVersion] - The protocol version sent to the server in ping messages
 * @property {AbortSignal} [signal] - The signal used to cancel the ping request
 * @property {boolean} [resolveSrvRecords] - Whether to resolve SRV records for the hostname
 * @property {import("node:dns/promises").Resolver} [resolver] - The DNS resolver to use for resolving SRV records
 */


export default class JavaPingClient {
    /** @type {import("node:dns/promises").Resolver} */ resolver = new Resolver();

    /**
     * @param {string} address
     * @param {number} port
     * @param {PingOptions} options
     * @return {Promise<[string, number]>}
     */
    async resolveSrv(address, port, options) {
        if (!options.resolveSrvRecords || net.isIP(address) !== 0) {
            return [address, port];
        }

        let resolver = options.resolver ?? this.resolver;
        let records = null;
        try {
            records = await resolver.resolveSrv(`_minecraft._tcp.${address}`);
        } catch (e) {
            return [address, port];
        }

        if (!records?.length) {
            return [address, port];
        }

        let maxPriority = Math.max(...records.map(record => record.priority));
        records = records.filter(record => record.priority === maxPriority);

        let totalWeight = records.reduce((acc, record) => acc + record.weight, 0);
        let random = Math.random() * totalWeight;
        let currentWeight = 0;
        for (let record of records) {
            currentWeight += record.weight;
            if (random < currentWeight) {
                return [record.name, record.port];
            }
        }

        return [address, port];
    }

    /**
     * Send a ping request using the modern Minecraft protocol (1.7+)
     *
     * @param {string} address
     * @param {number} port
     * @param {PingOptions} options
     * @return {Promise<JsonStatus>}
     */
    async ping(address, port, options = {}) {
        [address, port] = await this.resolveSrv(address, port, options);
        let ping = new JavaPing(address, port, options.signal);
        await ping.connect();
        let response;
        try {
            response = await ping.ping(options);
        } catch (e) {
            await ping.destroy();
            throw e;
        }
        await ping.close();
        return response.getStatus();
    }

    /**
     * Send a ping request using the legacy Minecraft protocol (1.4 - 1.6.x)
     *
     * @param {string} address
     * @param {number} port
     * @param {PingOptions} options
     * @return {Promise<LegacyStatus>}
     */
    async pingLegacyPost14(address, port, options = {}) {
        [address, port] = await this.resolveSrv(address, port, options);
        let ping = new JavaPing(address, port, options.signal);
        await ping.connect();
        let response;
        try {
            response = await ping.pingLegacyPost14(options);
        } catch (e) {
            await ping.destroy();
            throw e;
        }
        await ping.close();
        return response;
    }

    /**
     * Send a ping request using the legacy Minecraft protocol (below 1.4)
     *
     * @param {string} address
     * @param {number} port
     * @param {PingOptions} options
     * @return {Promise<LegacyStatus>}
     */
    async pingLegacyPre14(address, port, options = {}) {
        [address, port] = await this.resolveSrv(address, port, options);
        let ping = new JavaPing(address, port, options.signal);
        await ping.connect();
        let response;
        try {
            response = await ping.pingLegacyPre14();
        } catch (e) {
            await ping.destroy();
            throw e;
        }
        await ping.close();
        return response;
    }
}
