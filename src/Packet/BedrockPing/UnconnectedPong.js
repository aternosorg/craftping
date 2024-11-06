import BedrockPacket from "./BedrockPacket.js";
import ProtocolError from "../../Error/ProtocolError.js";

export default class UnconnectedPong extends BedrockPacket {
    /** @type {BigInt} */ time;
    /** @type {BigInt} */ serverGUID;
    /** @type {string} */ edition;
    /** @type {string} */ motdLine1;
    /** @type {number} */ protocolVersion;
    /** @type {string} */ versionName;
    /** @type {number} */ playerCount;
    /** @type {number} */ maxPlayerCount;
    /** @type {string} */ serverUniqueId;
    /** @type {string} */ motdLine2;
    /** @type {string} */ gameMode;
    /** @type {number} */ nintentdoLimited;
    /** @type {?number} */ ipv4Port = null;
    /** @type {?number} */ ipv6Port = null;
    /** @type {string} */ body;

    /**
     * Get the raw string body of the packet
     *
     * @return {string}
     */
    getBody() {
        return this.body;
    }

    /**
     * @return {?number}
     */
    getIpv6Port() {
        return this.ipv6Port;
    }

    /**
     * @param {?number} ipv6Port
     * @return {this}
     */
    setIpv6Port(ipv6Port) {
        this.ipv6Port = ipv6Port;
        return this;
    }

    /**
     * @return {?number}
     */
    getIpv4Port() {
        return this.ipv4Port;
    }

    /**
     * @param {?number} ipv4Port
     * @return {this}
     */
    setIpv4Port(ipv4Port) {
        this.ipv4Port = ipv4Port;
        return this;
    }

    /**
     * @return {number}
     */
    getNintentdoLimited() {
        return this.nintentdoLimited;
    }

    /**
     * @param {number} nintentdoLimited
     * @return {this}
     */
    setNintentdoLimited(nintentdoLimited) {
        this.nintentdoLimited = nintentdoLimited;
        return this;
    }

    /**
     * @return {string}
     */
    getGameMode() {
        return this.gameMode;
    }

    /**
     * @param {string} gameMode
     * @return {this}
     */
    setGameMode(gameMode) {
        this.gameMode = gameMode;
        return this;
    }

    /**
     * @return {string}
     */
    getMotdLine2() {
        return this.motdLine2;
    }

    /**
     * @param {string} motdLine2
     * @return {this}
     */
    setMotdLine2(motdLine2) {
        this.motdLine2 = motdLine2;
        return this;
    }

    /**
     * @return {string}
     */
    getServerUniqueId() {
        return this.serverUniqueId;
    }

    /**
     * @param {string} serverUniqueId
     * @return {this}
     */
    setServerUniqueId(serverUniqueId) {
        this.serverUniqueId = serverUniqueId;
        return this;
    }

    /**
     * @return {number}
     */
    getMaxPlayerCount() {
        return this.maxPlayerCount;
    }

    /**
     * @param {number} maxPlayerCount
     * @return {this}
     */
    setMaxPlayerCount(maxPlayerCount) {
        this.maxPlayerCount = maxPlayerCount;
        return this;
    }

    /**
     * @return {number}
     */
    getPlayerCount() {
        return this.playerCount;
    }

    /**
     * @param {number} playerCount
     * @return {this}
     */
    setPlayerCount(playerCount) {
        this.playerCount = playerCount;
        return this;
    }

    /**
     * @return {string}
     */
    getVersionName() {
        return this.versionName;
    }

    /**
     * @param {string} versionName
     * @return {this}
     */
    setVersionName(versionName) {
        this.versionName = versionName;
        return this;
    }

    /**
     * @return {number}
     */
    getProtocolVersion() {
        return this.protocolVersion;
    }

    /**
     * @param {number} protocolVersion
     * @return {this}
     */
    setProtocolVersion(protocolVersion) {
        this.protocolVersion = protocolVersion;
        return this;
    }

    /**
     * @return {string}
     */
    getMotdLine1() {
        return this.motdLine1;
    }

    /**
     * @param {string} motdLine1
     * @return {this}
     */
    setMotdLine1(motdLine1) {
        this.motdLine1 = motdLine1;
        return this;
    }

    /**
     * @return {string}
     */
    getEdition() {
        return this.edition;
    }

    /**
     * @param {string} edition
     * @return {this}
     */
    setEdition(edition) {
        this.edition = edition;
        return this;
    }

    /**
     * @return {BigInt}
     */
    getServerGUID() {
        return this.serverGUID;
    }

    /**
     * @param {BigInt} serverGUID
     * @return {this}
     */
    setServerGUID(serverGUID) {
        this.serverGUID = serverGUID;
        return this;
    }

    /**
     * @return {BigInt}
     */
    getTime() {
        return this.time;
    }

    /**
     * @param {BigInt} time
     * @return {this}
     */
    setTime(time) {
        this.time = time;
        return this;
    }

    /**
     * @inheritDoc
     */
    getPacketId() {
        return 0x1c;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        if (data.length < 18 + this.constructor.MAGICK.length) {
            throw new ProtocolError("Packet too short for " + this.constructor.name);
        }

        let offset = 0;
        this.time = data.readBigInt64BE(offset);
        offset += 8;
        this.serverGUID = data.readBigInt64BE(offset);
        offset += 8;
        let magic = data.slice(offset, offset + this.constructor.MAGICK.length);
        if (!magic.equals(this.constructor.MAGICK)) {
            throw new ProtocolError("Invalid magic for " + this.constructor.name);
        }
        offset += this.constructor.MAGICK.length;
        let stringLength = data.readUInt16BE(offset);
        if (data.length < offset + 2 + stringLength) {
            throw new ProtocolError("Packet too short for " + this.constructor.name);
        }
        offset += 2;

        this.body = data.toString("utf8", offset, offset + stringLength);
        this.parseBody(this.body);

        return this;
    }

    /**
     * @param {string} body
     * @return {this}
     */
    parseBody(body) {
        let protocolVersion, playerCount, maxPlayerCount, nintentdoLimited, ipv4Port, ipv6Port;
        [
            this.edition,
            this.motdLine1,
            protocolVersion,
            this.versionName,
            playerCount,
            maxPlayerCount,
            this.serverUniqueId,
            this.motdLine2,
            this.gameMode,
            nintentdoLimited,
            ipv4Port,
            ipv6Port
        ] = body.split(";");

        this.protocolVersion = parseInt(protocolVersion);
        this.playerCount = parseInt(playerCount);
        this.maxPlayerCount = parseInt(maxPlayerCount);
        this.nintentdoLimited = parseInt(nintentdoLimited);
        this.ipv4Port = parseInt(ipv4Port);
        this.ipv6Port = parseInt(ipv6Port);

        if (isNaN(this.ipv4Port)) {
            this.ipv4Port = null;
        }
        if (isNaN(this.ipv6Port)) {
            this.ipv6Port = null;
        }

        if (isNaN(this.protocolVersion) || isNaN(this.playerCount) || isNaN(this.maxPlayerCount)) {
            throw new ProtocolError("Invalid numeric value in packet");
        }

        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        let body = Buffer.from(this.serializeBody(), "utf8");
        let buffer = Buffer.alloc(18 + this.constructor.MAGICK.length + body.length);

        let offset = 0;
        buffer.writeBigInt64BE(this.time, offset);
        offset += 8;
        buffer.writeBigInt64BE(this.serverGUID, offset);
        offset += 8;
        this.constructor.MAGICK.copy(buffer, offset);
        offset += this.constructor.MAGICK.length;
        buffer.writeUInt16BE(body.length, offset);
        offset += 2;
        body.copy(buffer, offset);

        return buffer;
    }

    /**
     * @return {string}
     */
    serializeBody() {
        let parts = [
            this.edition ?? "MCPE",
            this.motdLine1 ?? "",
            String(this.protocolVersion ?? 0),
            this.versionName ?? "",
            String(this.playerCount ?? 0),
            String(this.maxPlayerCount ?? 0),
            this.serverUniqueId ?? "",
            this.motdLine2 ?? "",
            this.gameMode ?? "",
            String(this.nintentdoLimited ?? 0)
        ];

        if (this.ipv4Port !== null && this.ipv6Port !== null) {
            parts.push(String(this.ipv4Port), String(this.ipv6Port));
        }

        return parts.join(";");
    }
}
