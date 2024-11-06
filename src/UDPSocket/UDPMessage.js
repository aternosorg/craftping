export default class UDPMessage {
    /** @type {Buffer} */ data;
    /** @type {import('node:dgram').RemoteInfo} */ info;

    /**
     * @param {Buffer} data
     * @param {import('node:dgram').RemoteInfo} info
     */
    constructor(data, info) {
        this.data = data;
        this.info = info;
    }

    /**
     * @return {Buffer}
     */
    getData() {
        return this.data;
    }

    /**
     * @return {RemoteInfo}
     */
    getInfo() {
        return this.info;
    }

    /**
     * @return {string}
     */
    getAddress() {
        return this.info.address;
    }

    /**
     * @return {number}
     */
    getPort() {
        return this.info.port;
    }

    /**
     * @return {"IPv4" | "IPv6"}
     */
    getFamily() {
        return this.info.family;
    }

    /**
     * @return {number}
     */
    getSize() {
        return this.data.length;
    }
}
