import Version from "./Version.js";
import Players from "./Players.js";

/**
 * See https://wiki.vg/Server_List_Ping#Status_Response
 */
export default class JsonStatus {
    /** @type {Version} */ version;
    /** @type {Players} */ players;
    /** @type {Object} */ description;
    /** @type {?string} */ favicon = null;

    /**
     * @param {Object} json
     * @return {JsonStatus}
     */
    static fromJson(json) {
        return new JsonStatus()
            .setVersion(Version.fromJson(json.version))
            .setPlayers(Players.fromJson(json.players))
            .setDescription(json.description)
            .setFavicon(json.favicon ?? null);
    }

    /**
     * @return {Version}
     */
    getVersion() {
        return this.version;
    }

    /**
     * @param {Version} version
     * @return {this}
     */
    setVersion(version) {
        this.version = version;
        return this;
    }

    /**
     * @return {Players}
     */
    getPlayers() {
        return this.players;
    }

    /**
     * @param {Players} players
     * @return {this}
     */
    setPlayers(players) {
        this.players = players;
        return this;
    }

    /**
     * Get the server MOTD as a Minecraft Text Component
     *
     * @return {Object}
     */
    getDescription() {
        return this.description;
    }

    /**
     * Set the server MOTD as a Minecraft Text Component
     *
     * @param {Object} description
     * @return {this}
     */
    setDescription(description) {
        this.description = description;
        return this;
    }

    /**
     * Get the server icon as a base64 PNG data URL
     *
     * @return {?string}
     */
    getFavicon() {
        return this.favicon;
    }

    /**
     * Set the server icon as a base64 PNG data URL
     * Valid server icons need to be exactly 64x64 pixels
     *
     * @param {?string} favicon
     * @return {this}
     */
    setFavicon(favicon) {
        this.favicon = favicon;
        return this;
    }
}
