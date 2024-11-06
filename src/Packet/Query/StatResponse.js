import ServerToClientPacket from "./ServerToClientPacket.js";

/**
 * @abstract
 */
export default class StatResponse extends ServerToClientPacket {
    /** @type {string} */ hostname;
    /** @type {string} */ gametype;
    /** @type {string} */ map;
    /** @type {number} */ numplayers;
    /** @type {number} */ maxplayers;
    /** @type {number} */ hostport;
    /** @type {string} */ hostip;

    /**
     * @return {string}
     */
    getHostIp() {
        return this.hostip;
    }

    /**
     * @param {string} hostip
     * @return {this}
     */
    setHostIp(hostip) {
        this.hostip = hostip;
        return this;
    }

    /**
     * @return {number}
     */
    getHostPort() {
        return this.hostport;
    }

    /**
     * @param {number} hostport
     * @return {this}
     */
    setHostPort(hostport) {
        this.hostport = hostport;
        return this;
    }

    /**
     * @return {number}
     */
    getMaxPlayers() {
        return this.maxplayers;
    }

    /**
     * @param {number} maxplayers
     * @return {this}
     */
    setMaxPlayers(maxplayers) {
        this.maxplayers = maxplayers;
        return this;
    }

    /**
     * @return {number}
     */
    getPlayerCount() {
        return this.numplayers;
    }

    /**
     * @param {number} numplayers
     * @return {this}
     */
    setPlayerCount(numplayers) {
        this.numplayers = numplayers;
        return this;
    }

    /**
     * @return {string}
     */
    getMap() {
        return this.map;
    }

    /**
     * @param {string} map
     * @return {this}
     */
    setMap(map) {
        this.map = map;
        return this;
    }

    /**
     * @return {string}
     */
    getGameType() {
        return this.gametype;
    }

    /**
     * @param {string} gametype
     * @return {this}
     */
    setGameType(gametype) {
        this.gametype = gametype;
        return this;
    }

    /**
     * @return {string}
     */
    getMotd() {
        return this.hostname;
    }

    /**
     * @param {string} hostname
     * @return {this}
     */
    setMotd(hostname) {
        this.hostname = hostname;
        return this;
    }
}
