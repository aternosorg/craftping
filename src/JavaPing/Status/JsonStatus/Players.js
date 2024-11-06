import SamplePlayer from "./SamplePlayer.js";

export default class Players {
    /** @type {number} */ max;
    /** @type {number} */ online;
    /** @type {SamplePlayer[]} */ sample;

    /**
     * @param {Object} json
     * @return {Players}
     */
    static fromJson(json) {
        return new Players()
            .setMax(json.max)
            .setOnline(json.online)
            .setSample(json.sample?.map(SamplePlayer.fromJson) ?? []);
    }

    /**
     * @return {number}
     */
    getOnline() {
        return this.online;
    }

    /**
     * @param {number} online
     * @return {this}
     */
    setOnline(online) {
        this.online = online;
        return this;
    }

    /**
     * @return {SamplePlayer[]}
     */
    getSample() {
        return this.sample;
    }

    /**
     * @param {SamplePlayer[]} sample
     * @return {this}
     */
    setSample(sample) {
        this.sample = sample;
        return this;
    }

    /**
     * @return {number}
     */
    getMax() {
        return this.max;
    }

    /**
     * @param {number} max
     * @return {this}
     */
    setMax(max) {
        this.max = max;
        return this;
    }

}
