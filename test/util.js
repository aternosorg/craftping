import fs from "node:fs";
import {expect} from "@jest/globals";

/**
 * @param {string} test
 * @param {typeof Packet} type
 * @return {Promise<Buffer>}
 */
export async function read(test, type) {
    let url = new URL(`data/${test}/${type.name}.bin`, import.meta.url);
    return await fs.promises.readFile(url);
}

/**
 * @template T
 * @param {string} test
 * @param {typeof T} type
 * @return {Promise<T>}
 */
export async function testPacketReadWrite(test, type) {
    let buffer = await read(test, type);
    let packet = new type().read(buffer);
    expect(packet.write().equals(buffer)).toBe(true);
    return packet;
}
