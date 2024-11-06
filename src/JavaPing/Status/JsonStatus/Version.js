export default class Version {
    /** @type {?string} */ name;
    /** @type {number} */ protocol;

    /**
     * @param {Object} json
     * @return {Version}
     */
    static fromJson(json) {
        return new Version()
            .setName(json.name ?? null)
            .setProtocol(json.protocol);
    }

    /**
     * @return {number}
     */
    getProtocol() {
        return this.protocol;
    }

    /**
     * @param {number} protocol
     * @return {this}
     */
    setProtocol(protocol) {
        this.protocol = protocol;
        return this;
    }

    /**
     * @return {?string}
     */
    getName() {
        return this.name;
    }

    /**
     * @param {?string} name
     * @return {this}
     */
    setName(name) {
        this.name = name;
        return this;
    }
}
