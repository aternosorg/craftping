import ProtocolError from "../../Error/ProtocolError.js";

export default class LegacyStatus {
    /** @type {?number} */ protocolVersion = null;
    /** @type {string} */ motd;
    /** @type {number} */ playerCount;
    /** @type {number} */ maxPlayerCount;
    /** @type {?string} */ serverVersion = null;

    /**
     * @return {number}
     */
    getMaxPlayers() {
        return this.maxPlayerCount;
    }

    /**
     * @return {string}
     */
    getMotd() {
        return this.motd;
    }

    /**
     * @return {number}
     */
    getPlayerCount() {
        return this.playerCount;
    }

    /**
     * @return {?number}
     */
    getProtocolVersion() {
        return this.protocolVersion;
    }

    /**
     * @param {number} maxPlayers
     * @return {this}
     */
    setMaxPlayers(maxPlayers) {
        this.maxPlayerCount = maxPlayers;
        return this;
    }

    /**
     * @param {string} motd
     * @return {this}
     */
    setMotd(motd) {
        this.motd = motd;
        return this;
    }

    /**
     * @param {number} playerCount
     * @return {this}
     */
    setPlayerCount(playerCount) {
        this.playerCount = playerCount;
        return this
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
     * @return {?string}
     */
    getServerVersion() {
        return this.serverVersion;
    }

    /**
     * @param {?string} serverVersion
     * @return {this}
     */
    setServerVersion(serverVersion) {
        this.serverVersion = serverVersion;
        return this;
    }

    /**
     * @return {string}
     */
    toPre14String() {
        return [
            this.motd.replaceAll("§", ""),
            this.getPlayerCount(),
            this.getMaxPlayers()
        ].join("§");
    }

    /**
     * @param {string} string
     * @return {this}
     */
    fromPre14String(string) {
        let parts = string.split("§");
        if (parts.length < 3) {
            throw new ProtocolError("Invalid legacy status string");
        }

        let maxPlayers = parseInt(parts.pop());
        let playerCount = parseInt(parts.pop());
        this.motd = parts.join("§");

        this.setPlayerCount(playerCount)
            .setMaxPlayers(maxPlayers);
        return this;
    }

    /**
     * @return {string}
     */
    toPost14String() {
        return [
            "§1",
            this.getProtocolVersion(),
            this.getServerVersion(),
            this.motd.replaceAll("\0", ""),
            this.getPlayerCount(),
            this.getMaxPlayers()
        ].join("\0");
    }

    /**
     * @param {string} string
     * @return {this}
     */
    fromPost14String(string) {
        if (!string.startsWith("§1\0")) {
            throw new ProtocolError("Invalid legacy status string");
        }
        string = string.substring(3);

        let parts = string.split("\0");
        if (parts.length !== 5) {
            throw new ProtocolError("Invalid legacy status string");
        }

        this.motd = parts[2];
        this.setProtocolVersion(parseInt(parts[0]))
            .setServerVersion(parts[1])
            .setPlayerCount(parseInt(parts[3]))
            .setMaxPlayers(parseInt(parts[4]));
        return this;
    }
}
