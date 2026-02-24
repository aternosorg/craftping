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
     * Check if buffer contains valid UTF-8 sequences
     * @param {Buffer} buffer
     * @return {boolean}
     */
    isValidUtf8(buffer) {
        let i = 0;

        while (i < buffer.length) {
            const byte = buffer[i];

            // Single-byte character (0x00-0x7F)
            if (byte <= 0x7F) {
                i++;
                continue;
            }

            // Determine expected sequence length
            let sequenceLength;
            if ((byte & 0xE0) === 0xC0) {
                sequenceLength = 2; // 110xxxxx
            } else if ((byte & 0xF0) === 0xE0) {
                sequenceLength = 3; // 1110xxxx
            } else if ((byte & 0xF8) === 0xF0) {
                sequenceLength = 4; // 11110xxx
            } else {
                return false; // Invalid leading byte or orphaned continuation byte
            }

            // Check if we have enough bytes
            if (i + sequenceLength > buffer.length) {
                return false;
            }

            // Verify all continuation bytes (must be 10xxxxxx)
            for (let j = 1; j < sequenceLength; j++) {
                if ((buffer[i + j] & 0xC0) !== 0x80) {
                    return false;
                }
            }

            i += sequenceLength;
        }

        return true;
    }

    /**
     * Modern versions of Minecraft use UTF-8 encoding for strings.
     * Minecraft internally used DataOutputStream.writeBytes() to write strings in old versions.
     * This method will decode a string written this way if legacy mode is enabled.
     *
     * @param {Buffer} buffer
     * @param {?boolean} legacy - ISO-8859-1 encoding if legacy, UTF-8 if modern, guess based on content if null
     * @return {string}
     */
    decodeString(buffer, legacy = null) {
        if (legacy === null) {
            if (!this.isValidUtf8(buffer)) {
                legacy = true;
            }
        }

        if (!legacy) {
            return buffer.toString('utf8');
        }

        let string = '';
        for (let i = 0; i < buffer.byteLength; i++) {
            string += String.fromCodePoint(buffer.readUInt8(i));
        }
        return string;
    }

    /**
     * @param {Buffer} buffer
     * @param {number} offset
     * @return {[Buffer, number]}
     */
    readStringNT(buffer, offset) {
        let end = buffer.indexOf(0, offset);
        if (end === -1) {
            throw new ProtocolError("Unterminated string");
        }
        return [Buffer.from(buffer.buffer, buffer.byteOffset + offset, end - offset), end + 1];
    }

    /**
     * @param {Buffer} buffer
     * @param {number} offset
     * @param {number} skipNullBytes - number of null bytes to ignore within the string
     * @return {[Buffer, number]}
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

        return [Buffer.from(buffer.buffer, buffer.byteOffset + offset, end - offset), end + 1];
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
     * @return {[Buffer, number]}
     */
    readStringNTFollowedBy(buffer, offset, followedBy) {
        let end = offset - 1;
        do {
            end = buffer.indexOf(0, end + 1);
            if (end === -1) {
                throw new ProtocolError("Unterminated string");
            }
        } while (this.compareAny(buffer, end + 1, followedBy) === null);

        return [Buffer.from(buffer.buffer, buffer.byteOffset + offset, end - offset), end + 1];
    }

    /**
     * Write a string followed by a null byte.
     * In modern versions, this is simply a UTF-8 string.
     *
     * In legacy versions, Minecraft internally uses DataOutputStream.writeBytes() to write strings, which this function emulates.
     * "Writes out the string to the underlying output stream as a sequence of bytes.
     * Each character in the string is written out, in sequence, by discarding its high eight bits."
     *  - https://docs.oracle.com/javase/7/docs/api/java/io/DataOutputStream.html
     *
     * @param {Buffer} target
     * @param {string} value
     * @param {number} offset
     * @return {number}
     */
    writeStringNT(target, value, offset = 0, legacyEncoding) {
        if (!legacyEncoding) {
            let bytesWritten = target.write(value, offset, 'utf8');
            target.writeUint8(0, offset + bytesWritten);
            return bytesWritten + 1;
        }

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
     * @param {boolean} legacyEncoding
     * @return {Buffer}
     */
    createStringNT(value, legacyEncoding) {
        let length = legacyEncoding ? value.length : Buffer.byteLength(value, 'utf8');
        let buffer = Buffer.alloc(length + 1);
        let end = this.writeStringNT(buffer, value, 0, legacyEncoding);

        return Buffer.from(buffer, 0, end);
    }
}
