import {getTestUdpSocket} from "../util.js";
import HandshakeRequest from "../../src/Packet/Query/HandshakeRequest.js";
import BasicStatRequest from "../../src/Packet/Query/BasicStatRequest.js";
import FullStatRequest from "../../src/Packet/Query/FullStatRequest.js";
import HandshakeResponse from "../../src/Packet/Query/HandshakeResponse.js";
import BasicStatResponse from "../../src/Packet/Query/BasicStatResponse.js";
import FullStatResponse from "../../src/Packet/Query/FullStatResponse.js";
import {expect, test} from "@jest/globals";
import QueryClient from "../../src/Query/QueryClient.js";

async function makeQueryTestServer() {
    let challengeToken = Math.floor(Math.random() * 1000000) & 0x0F0F0F0F;
    let sessionId = null;
    let socket = await getTestUdpSocket((packet, info) => {
        if (packet instanceof HandshakeRequest) {
            sessionId = packet.getSessionId();
            socket.send(new HandshakeResponse()
                .setSessionId(sessionId)
                .setChallengeToken(challengeToken)
                .write(), info.port, info.address);
            return;
        }

        if (packet instanceof FullStatRequest) {
            if (packet.getSessionId() !== sessionId || packet.getChallengeToken() !== challengeToken) {
                return;
            }
            socket.send(new FullStatResponse()
                .setHostIp("12.34.56.78")
                .setHostPort(1234)
                .setMaxPlayers(123)
                .setPlayerCount(12)
                .setMap("example_map")
                .setGameType("example_game_type")
                .setMotd("Example MOTD")
                .setPlayers(["Player1", "Player2", "Player3"])
                .setPlugins("ExamplePlugin1;ExamplePlugin2")
                .setVersion("example_version")
                .setGameId("EXAMPLE_GAME_ID")
                .setSessionId(sessionId)
                .write(), info.port, info.address);
            return;
        }

        if (packet instanceof BasicStatRequest) {
            if (packet.getSessionId() !== sessionId || packet.getChallengeToken() !== challengeToken) {
                return;
            }
            socket.send(new BasicStatResponse()
                .setHostIp("12.34.56.78")
                .setHostPort(1234)
                .setMaxPlayers(123)
                .setPlayerCount(12)
                .setMap("example_map")
                .setGameType("example_game_type")
                .setMotd("Example MOTD")
                .setSessionId(sessionId)
                .write(), info.port, info.address);
            return;
        }
    }, [HandshakeRequest, FullStatRequest, BasicStatRequest]);

    return socket;
}

test('QueryClient can query basic stat', async () => {
    let server = await makeQueryTestServer();
    let queryClient = new QueryClient();
    queryClient.unref();

    let response = await queryClient.queryBasic("127.0.0.1", server.address().port);

    server.close();
    await queryClient.close();

    expect(response).toBeInstanceOf(BasicStatResponse);
    expect(response.getHostIp()).toBe("12.34.56.78");
    expect(response.getHostPort()).toBe(1234);
    expect(response.getMaxPlayers()).toBe(123);
    expect(response.getPlayerCount()).toBe(12);
    expect(response.getMap()).toBe("example_map");
    expect(response.getGameType()).toBe("example_game_type");
    expect(response.getMotd()).toBe("Example MOTD");
});

test('QueryClient can query full stat', async () => {
    let server = await makeQueryTestServer();
    let queryClient = new QueryClient();
    queryClient.unref();

    let response = await queryClient.queryFull("127.0.0.1", server.address().port);

    server.close();
    await queryClient.close();

    expect(response).toBeInstanceOf(FullStatResponse);
    expect(response.getHostIp()).toBe("12.34.56.78");
    expect(response.getHostPort()).toBe(1234);
    expect(response.getMaxPlayers()).toBe(123);
    expect(response.getPlayerCount()).toBe(12);
    expect(response.getMap()).toBe("example_map");
    expect(response.getGameType()).toBe("example_game_type");
    expect(response.getMotd()).toBe("Example MOTD");
    expect(response.getVersion()).toBe("example_version");
    expect(response.getGameId()).toBe("EXAMPLE_GAME_ID");
    expect(response.getPlugins()).toBe("ExamplePlugin1;ExamplePlugin2");
    expect(response.getPlayers()).toEqual(["Player1", "Player2", "Player3"]);
});
