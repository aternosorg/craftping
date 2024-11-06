import {expect, test} from '@jest/globals';
import VarInt from "../src/VarInt.js";

// Test cases from https://wiki.vg/Protocol#VarInt_and_VarLong
const exampleInt = new Map([
    [0, Buffer.from([0x00])],
    [1, Buffer.from([0x01])],
    [2, Buffer.from([0x02])],
    [127, Buffer.from([0x7f])],
    [128, Buffer.from([0x80, 0x01])],
    [255, Buffer.from([0xff, 0x01])],
    [25565, Buffer.from([0xdd, 0xc7, 0x01])],
    [2097151, Buffer.from([0xff, 0xff, 0x7f])],
    [2147483647, Buffer.from([0xff, 0xff, 0xff, 0xff, 0x07])],
    [-1, Buffer.from([0xff, 0xff, 0xff, 0xff, 0x0f])],
    [-2147483648, Buffer.from([0x80, 0x80, 0x80, 0x80, 0x08])],
]);

const exampleLong = new Map([
    [0n, Buffer.from([0x00])],
    [1n, Buffer.from([0x01])],
    [2n, Buffer.from([0x02])],
    [127n, Buffer.from([0x7f])],
    [128n, Buffer.from([0x80, 0x01])],
    [255n, Buffer.from([0xff, 0x01])],
    [2147483647n, Buffer.from([0xff, 0xff, 0xff, 0xff, 0x07])],
    [9223372036854775807n, Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f])],
    [-1n, Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01])],
    [-2147483648n, Buffer.from([0x80, 0x80, 0x80, 0x80, 0xf8, 0xff, 0xff, 0xff, 0xff, 0x01])],
    [-9223372036854775808n, Buffer.from([0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x01])],
]);

test('Encode VarInt', () => {
    for (const [value, buffer] of exampleInt) {
        expect(VarInt.encodeVarInt(value)).toEqual(buffer);
    }
});

test('Decode VarInt', () => {
    for (const [value, buffer] of exampleInt) {
        let [result, endOffset] = VarInt.readVarInt(buffer, 0);
        expect(result).toBe(value);
        expect(endOffset).toBe(buffer.length);
    }
});

test('readVarInt fails to decode VarLong', () => {
    expect(() => VarInt.readVarInt(exampleLong.get(9223372036854775807n), 0)).toThrow();
    expect(() => VarInt.readVarInt(exampleLong.get(-1n), 0)).toThrow();
    expect(() => VarInt.readVarInt(exampleLong.get(-2147483648n), 0)).toThrow();
});


test('Encode VarLong', () => {
    for (const [value, buffer] of exampleLong) {
        expect(VarInt.encodeVarLong(value)).toEqual(buffer);
    }
});


test('Decode VarLong', () => {
    for (const [value, buffer] of exampleLong) {
        let [result, endOffset] = VarInt.readVarLong(buffer, 0);
        expect(result).toBe(value);
        expect(endOffset).toBe(buffer.length);
    }
});

