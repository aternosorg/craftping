import Packet from "../Packet.js";
import ProtocolError from "../../Error/ProtocolError.js";

/**
 * @abstract
 */
export default class QueryPacket extends Packet {
    /** @type {number} */ sessionId;

    /**
     * @return {number}
     * @abstract
     */
    getType() {

    }

    /**
     * @return {number}
     */
    getSessionId() {
        return this.sessionId;
    }

    /**
     * @param {number} sessionId
     * @return {this}
     */
    setSessionId(sessionId) {
        this.sessionId = sessionId;
        return this;
    }

    /**
     * @return {this}
     */
    generateSessionId() {
        this.sessionId = Math.floor(Math.random() * 0xFFFFFFFF) & 0x0F0F0F0F;
        return this;
    }

    /**
     * Minecraft internally uses DataOutputStream.writeBytes() to write strings.
     * This method will decode a string written this way
     *
     * @param {Buffer} buffer
     * @param {number} offset
     * @param {number} end
     * @return {string}
     */
    decodeString(buffer, offset, end) {
        let string = '';
        for (let i = offset; i < end; i++) {
            string += String.fromCodePoint(buffer.readUInt8(i));
        }
        return string;
    }

    /**
     * @param {Buffer} buffer
     * @param {number} offset
     * @return {[?string, number]}
     */
    readStringNT(buffer, offset) {
        let end = buffer.indexOf(0, offset);
        if (end === -1) {
            throw new ProtocolError("Unterminated string");
        }
        return [this.decodeString(buffer, offset, end), end + 1];
    }

    /**
     * @param {Buffer} buffer
     * @param {number} offset
     * @param {number} skipNullBytes - number of null bytes to ignore within the string
     * @return {[?string, number]}
     */
    readStringNTAndSkipNullBytes(buffer, offset, skipNullBytes = 0) {
        let i = 0;
        let end = offset - 1;
        while (i <= skipNullBytes) {
            end = buffer.indexOf(0, end + 1);
            if (end === -1) {
                throw new ProtocolError("Unterminated string");
            }
            i++;
        }

        return [this.decodeString(buffer, offset, end), end + 1];
    }

    /**
     * Find the first buffer in the list that matches the buffer at the given offset
     *
     * @param {Buffer} buffer
     * @param {number} offset
     * @param {Buffer[]} values
     * @return {Buffer|null}
     */
    compareAny(buffer, offset, values) {
        for (let value of values) {
            if (buffer.compare(value, 0, value.length, offset, offset + value.length) === 0) {
                return value;
            }
        }
        return null;
    }

    /**
     * Read a string up to a null byte that is followed by one of the given buffers
     *
     * @param {Buffer} buffer
     * @param {number} offset
     * @param {Buffer[]} followedBy - null byte must be followed by one of these buffers, otherwise it is skipped
     * @return {[?string, number]}
     */
    readStringNTFollowedBy(buffer, offset, followedBy) {
        let end = offset - 1;
        do {
            end = buffer.indexOf(0, end + 1);
            if (end === -1) {
                throw new ProtocolError("Unterminated string");
            }
        } while (this.compareAny(buffer, end + 1, followedBy) === null);

        return [this.decodeString(buffer, offset, end), end + 1];
    }

    /**
     * Write a string followed by a null byte.
     * Minecraft internally uses DataOutputStream.writeBytes() to write strings, which this function emulates.
     *
     * "Writes out the string to the underlying output stream as a sequence of bytes.
     * Each character in the string is written out, in sequence, by discarding its high eight bits."
     *  - https://docs.oracle.com/javase/7/docs/api/java/io/DataOutputStream.html
     *
     * @param {Buffer} target
     * @param {string} value
     * @param {number} offset
     * @return {number}
     */
    writeStringNT(target, value, offset = 0) {
        let startOffset = offset;

        for (let char of value) {
            let charCode = char.codePointAt(0) & 0xFF;
            if (charCode === 0) {
                continue;
            }
            target.writeUint8(charCode, offset++);
        }

        target.writeUint8(0, offset++);

        return offset - startOffset;
    }

    /**
     * Create a buffer containing a string followed by a null byte
     * See writeStringNT() for details
     *
     * @param {string} value
     * @return {Buffer}
     */
    createStringNT(value) {
        let buffer = Buffer.alloc(value.length + 1);
        let end = this.writeStringNT(buffer, value, 0);

        return Buffer.from(buffer.buffer, buffer.byteOffset, end);
    }
}
