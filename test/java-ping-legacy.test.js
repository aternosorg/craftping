import {expect, test} from '@jest/globals';
import {testPacketReadWrite} from "./util.js";
import LegacyStatusRequest from "../src/Packet/JavaPing/Legacy/LegacyStatusRequest.js";
import LegacyPingHostPluginMessage from "../src/Packet/JavaPing/Legacy/LegacyPingHostPluginMessage.js";
import LegacyKick from "../src/Packet/JavaPing/Legacy/LegacyKick.js";
import LegacyStatus from "../src/JavaPing/Status/LegacyStatus.js";

test('Read and write LegacyStatusRequest', async () => {
    await testPacketReadWrite('java-ping-legacy', LegacyStatusRequest);
});

test('Read and write LegacyPingHostPluginMessage', async () => {
    let packet = await testPacketReadWrite('java-ping-legacy', LegacyPingHostPluginMessage);
    expect(packet.getHostname()).toBe("localhost");
    expect(packet.getPort()).toBe(25565);
    expect(packet.getProtocolVersion()).toBe(74);
    expect(packet.getType()).toBe('MC|PingHost');
});

test('Read and write LegacyKick 1.4+', async () => {
    let packet = await testPacketReadWrite('java-ping-legacy', LegacyKick);
    let status = new LegacyStatus().fromPost14String(packet.getMessage());
    expect(status.toPost14String()).toBe(packet.getMessage());
    expect(status.getMotd()).toBe("A Minecraft Server");
    expect(status.getPlayerCount()).toBe(0);
    expect(status.getMaxPlayers()).toBe(20);
    expect(status.getProtocolVersion()).toBe(60);
    expect(status.getServerVersion()).toBe("1.5");
});

test('Read and write LegacyKick', async () => {
    let packet = await testPacketReadWrite('java-ping-legacy-pre-1.4', LegacyKick);
    let status = new LegacyStatus().fromPre14String(packet.getMessage());
    expect(status.toPre14String()).toBe(packet.getMessage());
    expect(status.getMotd()).toBe("A Minecraft Server");
    expect(status.getPlayerCount()).toBe(0);
    expect(status.getMaxPlayers()).toBe(20);
    expect(status.getProtocolVersion()).toBe(null);
    expect(status.getServerVersion()).toBe(null);
});
