import {expect, test} from '@jest/globals';
import {testPacketReadWrite} from "./util.js";
import HandshakeRequest from "../src/Packet/Query/HandshakeRequest.js";
import HandshakeResponse from "../src/Packet/Query/HandshakeResponse.js";
import BasicStatRequest from "../src/Packet/Query/BasicStatRequest.js";
import BasicStatResponse from "../src/Packet/Query/BasicStatResponse.js";
import FullStatRequest from "../src/Packet/Query/FullStatRequest.js";
import FullStatResponse from "../src/Packet/Query/FullStatResponse.js";

test('Read and write HandshakeRequest', async () => {
    let packet = await testPacketReadWrite('query-basic', HandshakeRequest);
    expect(packet.getSessionId()).toBe(134745357);
    expect(packet.getType()).toBe(9);
});

test('Read and write HandshakeResponse', async () => {
    let packet = await testPacketReadWrite('query-basic', HandshakeResponse);
    expect(packet.getSessionId()).toBe(134745357);
    expect(packet.getChallengeToken()).toBe(12475691);
});

test('Read and write BasicStatRequest', async () => {
    let packet = await testPacketReadWrite('query-basic', BasicStatRequest);
    expect(packet.getSessionId()).toBe(134745357);
    expect(packet.getChallengeToken()).toBe(12475691);
    expect(packet.getType()).toBe(0);
});

test('Read and write BasicStatResponse', async () => {
    let packet = await testPacketReadWrite('query-basic', BasicStatResponse);
    expect(packet.getSessionId()).toBe(134745357);
    expect(packet.getMotd()).toBe("A Minecraft server");
    expect(packet.getGameType()).toBe("SMP");
    expect(packet.getMap()).toBe("world");
    expect(packet.getPlayerCount()).toBe(0);
    expect(packet.getMaxPlayers()).toBe(20);
    expect(packet.getHostPort()).toBe(25565);
    expect(packet.getHostIp()).toBe("127.0.1.1");
});

test('Read and write FullStatRequest', async () => {
    let packet = await testPacketReadWrite('query-full', FullStatRequest);
    expect(packet.getSessionId()).toBe(17040910);
    expect(packet.getChallengeToken()).toBe(16571891);
    expect(packet.getType()).toBe(0);
});

test('Read and write FullStatResponse', async () => {
    let packet = await testPacketReadWrite('query-full', FullStatResponse);
    expect(packet.getSessionId()).toBe(17040910);
    expect(packet.getMotd()).toBe("A Minecraft server");
    expect(packet.getGameId()).toBe("MINECRAFT");
    expect(packet.getGameType()).toBe("SMP");
    expect(packet.getMap()).toBe("world");
    expect(packet.getVersion()).toBe("1.20.1");
    expect(packet.getPlugins()).toBe("");
    expect(packet.getPlayerCount()).toBe(0);
    expect(packet.getMaxPlayers()).toBe(20);
    expect(packet.getHostPort()).toBe(25565);
    expect(packet.getHostIp()).toBe("127.0.1.1");
    expect(packet.getPlayers()).toEqual([]);
});


