export default class SamplePlayer {
    /** @type {string} */ name;
    /** @type {string} */ id;

    /**
     * @param {Object} json
     * @return {SamplePlayer}
     */
    static fromJson(json) {
        return new SamplePlayer()
            .setId(json.id)
            .setName(json.name);
    }

    /**
     * @return {string}
     */
    getId() {
        return this.id;
    }

    /**
     * @param {string} id
     * @return {this}
     */
    setId(id) {
        this.id = id;
        return this;
    }

    /**
     * @return {string}
     */
    getName() {
        return this.name;
    }

    /**
     * @param {string} name
     * @return {this}
     */
    setName(name) {
        this.name = name;
        return this;
    }
}
