import {getTestUdpSocket} from "../util.js";
import UnconnectedPing from "../../src/Packet/BedrockPing/UnconnectedPing.js";
import UnconnectedPong from "../../src/Packet/BedrockPing/UnconnectedPong.js";
import {expect, test} from "@jest/globals";
import BedrockPingClient from "../../src/BedrockPing/BedrockPingClient.js";

async function makeBedrockTestServer() {
    let socket = await getTestUdpSocket((packet, info) => {
        if (packet instanceof UnconnectedPing) {
            socket.send(new UnconnectedPong()
                .setTime(packet.getTime())
                .setServerGUID(BigInt(123456789))
                .setEdition("example_edition")
                .setMotdLine1("example_motd_line_1")
                .setMotdLine2("example_motd_line_2")
                .setProtocolVersion(123)
                .setVersionName("example_version_name")
                .setPlayerCount(12)
                .setMaxPlayerCount(1234)
                .setServerUniqueId("example_server_unique_id")
                .setGameMode("example_game_mode")
                .setNintentdoLimited(0)
                .setIpv4Port(1234)
                .setIpv6Port(5678)
                .write(), info.port, info.address
            )
        }
    }, [UnconnectedPing]);

    return socket;
}

test('Bedrock ping', async () => {
    let server = await makeBedrockTestServer();
    let client = new BedrockPingClient();
    client.unref();

    let response = await client.ping("127.0.0.1", server.address().port);
    await client.close();
    server.close();

    expect(response.getServerGUID()).toBe(BigInt(123456789));
    expect(response.getEdition()).toBe("example_edition");
    expect(response.getMotdLine1()).toBe("example_motd_line_1");
    expect(response.getMotdLine2()).toBe("example_motd_line_2");
    expect(response.getProtocolVersion()).toBe(123);
    expect(response.getVersionName()).toBe("example_version_name");
    expect(response.getPlayerCount()).toBe(12);
    expect(response.getMaxPlayerCount()).toBe(1234);
    expect(response.getServerUniqueId()).toBe("example_server_unique_id");
    expect(response.getGameMode()).toBe("example_game_mode");
    expect(response.getNintentdoLimited()).toBe(0);
    expect(response.getIpv4Port()).toBe(1234);
    expect(response.getIpv6Port()).toBe(5678);
});
