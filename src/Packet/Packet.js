export default class Packet {
    /**
     * @param {Buffer} data
     * @return {this}
     * @abstract
     */
    read(data) {
    }

    /**
     * @return {Buffer}
     * @abstract
     */
    write() {
    }
}
