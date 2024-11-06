export default class VarInt {
    static SEGMENT_BITS = 0x7F;
    static CONTINUE_BIT = 0x80;

    /**
     * Read a VarInt from a buffer
     * Based on https://wiki.vg/Protocol#VarInt_and_VarLong
     *
     * @param {Buffer} buffer
     * @param {number} offset
     * @return {[number, number]} - value, end offset
     */
    static readVarInt(buffer, offset) {
        let value = 0;
        let currentByte = 0;
        let position = 0;

        while (true) {
            currentByte = buffer.readUInt8(offset++);
            value |= (currentByte & this.SEGMENT_BITS) << position;

            if ((currentByte & this.CONTINUE_BIT) === 0) {
                break;
            }

            position += 7;

            if (position >= 32) {
                throw new Error("VarInt is too big");
            }
        }

        return [value, offset];
    }

    /**
     * Read a VarLong from a buffer
     * Based on https://wiki.vg/Protocol#VarInt_and_VarLong
     *
     * @param {Buffer} buffer
     * @param {number} offset
     * @return {[BigInt, number]} - value, end offset
     */
    static readVarLong(buffer, offset) {
        let value = BigInt(0);
        let currentByte = 0;
        let position = 0;

        while (true) {
            currentByte = buffer.readUInt8(offset++);
            value |= BigInt(currentByte & this.SEGMENT_BITS) << BigInt(position);

            if ((currentByte & this.CONTINUE_BIT) === 0) {
                break;
            }

            position += 7;

            if (position >= 64) {
                throw new Error("VarLong is too big");
            }
        }

        // Negative number if larger than 2^63
        if (value >= 0x8000000000000000n) {
            value -= 0x10000000000000000n;
        }

        return [value, offset];
    }

    /**
     * Write a VarInt to a buffer
     * See https://wiki.vg/Protocol#VarInt_and_VarLong
     *
     * @param {Buffer} buffer
     * @param {number} offset
     * @param {number} value
     * @return {number} - end offset
     */
    static writeVarInt(buffer, offset, value) {
        while (true) {
            if ((value & ~this.SEGMENT_BITS) === 0) {
                buffer.writeUInt8(value, offset++);
                return offset;
            }

            buffer.writeUInt8((value & this.SEGMENT_BITS) | this.CONTINUE_BIT, offset++);

            value >>>= 7;
        }
    }

    /**
     * Write a VarLong to a buffer
     * See https://wiki.vg/Protocol#VarInt_and_VarLong
     *
     * @param {Buffer} buffer
     * @param {number} offset
     * @param {BigInt} value
     * @return {number} - end offset
     */
    static writeVarLong(buffer, offset, value) {
        while (true) {
            if ((value & ~BigInt(this.SEGMENT_BITS)) === 0n) {
                buffer.writeUInt8(Number(value), offset++);
                return offset;
            }

            buffer.writeUInt8(Number((value & BigInt(this.SEGMENT_BITS)) | BigInt(this.CONTINUE_BIT)), offset++);

            value = this.unsignedRightShiftLong(value, 7n);
        }
    }

    /**
     * @param {number} value
     * @return {Buffer}
     */
    static encodeVarInt(value) {
        let length = this.byteLengthVarInt(value);
        let buffer = Buffer.alloc(length);
        this.writeVarInt(buffer, 0, value);
        return buffer;
    }

    /**
     * @param {BigInt} value
     * @return {Buffer}
     */
    static encodeVarLong(value) {
        let length = this.byteLengthVarLong(value);
        let buffer = Buffer.alloc(length);
        this.writeVarLong(buffer, 0, value);
        return buffer;
    }

    /**
     * Calculate the byte length of a VarInt
     *
     * @param {number} value
     * @return {number}
     */
    static byteLengthVarInt(value) {
        let length = 0;

        do {
            length++;
            value >>>= 7;
        } while (value !== 0);

        return length;
    }

    /**
     * Calculate the byte length of a VarLong
     *
     * @param {BigInt} value
     * @return {number}
     */
    static byteLengthVarLong(value) {
        let length = 0;

        do {
            length++;
            value = this.unsignedRightShiftLong(value, 7n);
        } while (value !== 0n);

        return length;
    }

    /**
     * Perform an unsigned right shift on a BigInt, assuming it is a 64-bit integer
     *
     * @param {BigInt} value
     * @param {BigInt} shift
     */
    static unsignedRightShiftLong(value, shift) {
        return value >> shift & 0x01FFFFFFFFFFFFFFn
    }
}
