# CraftPing
A universal ping/query library for Minecraft servers. This library supports 
the [Minecraft Query protocol](https://wiki.vg/Query), the [Minecraft Bedrock ping protocol](https://wiki.vg/Raknet_Protocol#Packets), as well as all three
different versions of the [Minecraft Java ping protocol](https://wiki.vg/Server_List_Ping).

## Installation
```bash
npm i craftping
```

## Usage
### Query
The [Query protocol](https://wiki.vg/Query) is a UDP based protocol that allows getting basic information about a Minecraft server.
Note that only servers with the `server.properties` option `enable-query` set to `true` will respond to queries.

The main advantage of the Query protocol over the ping protocol ist that it returns the
full list of players on the server, not just a small sample. It does, however, also have a few disadvantages, 
like the fact that servers will return broken response packets if the MOTD (or any other string) [contains null bytes](https://bugs.mojang.com/browse/MC-221987)
or [some other special characters](https://bugs.mojang.com/browse/MC-231035).  
This library makes an effort to interpret these broken response packets correctly, but it is not always possible to do so.

```js
import {QueryClient} from 'craftping';

let client = new QueryClient();

let basic = await client.queryBasic('localhost', 25565, AbortSignal.timeout(5000));
let full = await client.queryFull('localhost', 25565, AbortSignal.timeout(5000));

await client.close();
```
Basic and full query requests will return a [`BasicStatResponse`](src/Packet/Query/BasicStatResponse.js) 
and [`FullStatResponse`](src/Packet/Query/FullStatResponse.js) object respectively.

Note that the query client needs to be closed manually, since it keeps its UDP socket open to reuse it for future queries.

### Java Edition Ping
The [Server List Ping protocol](https://wiki.vg/Server_List_Ping) is what the Minecraft client uses to show the server status in the in-game server list.
This protocol changed multiple times over the years, so you'd ideally want to know the version of the server you are pinging to use the correct protocol version.

If you do not know the server version, you can always use the pre 1.4 ping protocol, since all newer versions seem to be backwards compatible as of now.
Finding the correct protocol should still be preferred, since pre 1.4 responses are missing a lot of information that is included in newer versions.
It is also unclear if server software not based on the Vanilla server will respond to pre 1.4 pings.

SRV records are supported for Java Edition pings, but they are not resolved by default. You can enable SRV record resolution by setting the `resolveSrvRecords` option to `true`.

```js
import {JavaPingClient} from 'craftping';

let client = new JavaPingClient();
```

#### Ping a Minecraft 1.7+ server
```js
let response = await client.ping('localhost', 25565, {signal: AbortSignal.timeout(5000)});
```
Using the modern ping protocol will return a [`JsonStatus`](src/JavaPing/Status/JsonStatus/JsonStatus.js).

#### Ping a Minecraft 1.4 - 1.6 server
```js
let response = await client.pingLegacyPost14('localhost', 25565, {signal: AbortSignal.timeout(5000)});
```

#### Ping a Minecraft beta 1.8 - release 1.3 server (or any server)
```js
let response = await client.pingLegacyPre14('localhost', 25565, {signal: AbortSignal.timeout(5000)});
```

#### Ping a server that supports either of the two legacy ping versions
Some custom server software seems to not respond to pre 1.4 pings, but will instead only respond to 1.4+ pings.
The only currently known instance of this is Better Than Adventure. If you are trying to ping a server that may or 
may not support pre 1.4 pings, you can use the following code:
```js
let response = await client.pingLegacyUniversal('localhost', 25565, {signal: AbortSignal.timeout(5000)});
```

Note that this weird hack involves sending the first half of a packet, then waiting for up to 500ms if the servers
responds, and if it does not, sending the second half of the packet. It may therefore run into problems if the timing is off.

All legacy ping versions will return a [`LegacyStatus`](src/JavaPing/Status/LegacyStatus.js) object.
Note that for pre 1.4 pings, this object will not include the server version name and protocol version,
as this information was not included in the response packets before Minecraft 1.4.

#### Java Edition ping options
Java Edition ping requests can be customized using the following options:
 - `protocolVersion`: The protocol version to announce to the server. Defaults to a sane value based on the used protocol.
 - `hostname`: The hostname to announce to the server. Defaults to the address/hostname used to connect.
 - `port`: The port to announce to the server. Defaults to the port used to connect.
 - `resolveSrvRecords`: Whether to resolve SRV records for the hostname. Defaults to `false`.
 - `resolver`: An instance of node:dns/promises.Resolver to use for resolving SRV records. Defaults to an instance with default options.
 - `signal`: An optional `AbortSignal` to cancel the request.

### Bedrock Edition Ping

```js
import {BedrockPingClient} from 'craftping';

let client = new BedrockPingClient();

let status = await client.ping('localhost', 19132, AbortSignal.timeout(5000));

await client.close();
```
Pinging a Bedrock server will return an [`UnconnectedPong`](src/Packet/BedrockPing/UnconnectedPong.js) object.

Note that the Bedrock ping client also needs to be closed manually, since it keeps its UDP socket open to reuse it for future requests.
