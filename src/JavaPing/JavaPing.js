import TCPSocket from "../TCPSocket/TCPSocket.js";
import VarInt from "../VarInt.js";
import Handshake from "../Packet/JavaPing/Modern/Handshake.js";
import StatusRequest from "../Packet/JavaPing/Modern/StatusRequest.js";
import StatusResponse from "../Packet/JavaPing/Modern/StatusResponse.js";
import LegacyStatusRequest from "../Packet/JavaPing/Legacy/LegacyStatusRequest.js";
import LegacyPingHostPluginMessage from "../Packet/JavaPing/Legacy/LegacyPingHostPluginMessage.js";
import LegacyKick from "../Packet/JavaPing/Legacy/LegacyKick.js";
import LegacyStatus from "./Status/LegacyStatus.js";
import Ping from "../Packet/JavaPing/Modern/Ping.js";
import ProtocolError from "../Error/ProtocolError.js";

export default class JavaPing extends TCPSocket {

    /**
     * @param {PingOptions} options
     * @return {Promise<StatusResponse>}
     */
    async ping(options = {}) {
        let time = BigInt(Date.now());
        await this.write(Buffer.concat([
            new Handshake()
                .setProtocolVersion(options.protocolVersion ?? null)
                .setHostname(options.hostname ?? this.address)
                .setPort(options.port ?? this.port).write(),
            new StatusRequest().write()
        ]));
        this.signal?.throwIfAborted();

        let response = await this.readPacket(StatusResponse);
        this.signal?.throwIfAborted();

        await this.write(new Ping().setTime(time).write());
        this.signal?.throwIfAborted();

        let pong = await this.readPacket(Ping);
        if (pong.getTime() !== time) {
            throw new ProtocolError("Received invalid pong response");
        }

        return response;
    }

    /**
     * @param {PingOptions} options
     * @return {Promise<LegacyStatus>}
     */
    async pingLegacyPost14(options = {}) {
        await this.write(new LegacyStatusRequest().write());
        await this.write(new LegacyPingHostPluginMessage()
            .setProtocolVersion(options.protocolVersion ?? null)
            .setHostname(options.hostname ?? this.address)
            .setPort(options.port ?? this.port).write());
        this.signal?.throwIfAborted();

        let response = await this.readPacket(LegacyKick);

        return new LegacyStatus().fromPost14String(response.getMessage());
    }

    /**
     * @return {Promise<LegacyStatus>}
     */
    async pingLegacyPre14() {
        await this.write(Buffer.from([0xfe]));
        this.signal?.throwIfAborted();

        let response = await this.readPacket(LegacyKick);

        return new LegacyStatus().fromPre14String(response.getMessage());
    }

    /**
     * Read the next packet from the socket
     *
     * @template {Packet} T
     * @param {typeof T} type
     * @return {Promise<T>}
     */
    async readPacket(type) {
        let start = await this.peek(5);

        if (start.readUInt8(0) === 0xff) {
            let length = start.readUInt16BE(1);
            return new type().read(await this.read(length * 2 + 3));
        }

        let [length, offset] = VarInt.readVarInt(start, 0);
        return new type().read(await this.read(offset + length));
    }
}
