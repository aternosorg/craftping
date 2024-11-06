import {expect, test} from '@jest/globals';
import {read, testPacketReadWrite} from "./util.js";
import Handshake from "../src/Packet/JavaPing/Modern/Handshake.js";
import StatusRequest from "../src/Packet/JavaPing/Modern/StatusRequest.js";
import StatusResponse from "../src/Packet/JavaPing/Modern/StatusResponse.js";
import JsonStatus from "../src/JavaPing/Status/JsonStatus/JsonStatus.js";
import Ping from "../src/Packet/JavaPing/Modern/Ping.js";

test('Read and write Handshake', async () => {
    let packet = await testPacketReadWrite('java-ping-modern', Handshake);
    expect(packet.getProtocolVersion()).toBe(4);
    expect(packet.getHostname()).toBe("localhost");
    expect(packet.getPort()).toBe(25565);
    expect(packet.getNextState()).toBe(1);
});

test('Read and write StatusRequest', async () => {
    await testPacketReadWrite('java-ping-modern', StatusRequest);
});

test('Read and write StatusResponse', async () => {
    let buffer = await read('java-ping-modern', StatusResponse);
    let packet = new StatusResponse().read(buffer);
    let serialized = packet.write();
    packet = new StatusResponse().read(serialized);

    expect(packet.getStatus()).toBeInstanceOf(JsonStatus);

    let status = packet.getStatus();
    expect(status.getVersion().getProtocol()).toBe(763);
    expect(status.getVersion().getName()).toBe("1.20.1");
    expect(status.getPlayers().getOnline()).toBe(0);
    expect(status.getPlayers().getMax()).toBe(20);
    expect(status.getDescription().text).toBe("A Minecraft server");
    expect(status.getFavicon()).toBe(null);
    expect(status.getPlayers().getSample()).toEqual([]);
});

test('Read and write Ping', async () => {
    let packet = await testPacketReadWrite('java-ping-modern', Ping);
    expect(packet.getTime()).toBe(1730891191567n);
});
