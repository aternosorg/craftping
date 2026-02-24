import fs from "node:fs";
import {expect} from "@jest/globals";
import dgram from "node:dgram";


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

/**
 *
 * @param {function(packet: Packet, rinfo: RemoteInfo)} onMessage
 * @param {(typeof Packet)[]} acceptPacketTypes
 * @return {Promise<import("node:dgram").Socket>}
 */
export async function getTestUdpSocket(onMessage, acceptPacketTypes) {
        let socket = dgram.createSocket('udp4');
        socket.unref();
        await new Promise((resolve, reject) => {
            socket.on('error', err => {
                socket.close();
                reject(err);
            });
            socket.on('message', (msg, rinfo) => {
                let packet = null;
                for (const type of acceptPacketTypes) {
                    try {
                        packet = new type().read(msg);
                        break;
                    } catch (e) {

                    }
                }
                if (packet !== null){
                    onMessage(packet, rinfo);
                }
            });
            socket.bind(0, "127.0.0.1", () => resolve());
        });
        return socket;
}
