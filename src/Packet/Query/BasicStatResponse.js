import ProtocolError from "../../Error/ProtocolError.js";
import StatResponse from "./StatResponse.js";

export default class BasicStatResponse extends StatResponse {
    /**
     * @inheritDoc
     */
    getType() {
        return 0;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        let motd, gametype, map, numplayers, maxplayers, hostport, hostip;
        let skipNullBytes = 0;

        let offset = 0;
        do {
            offset = 0;
            [motd, offset] = this.readStringNTAndSkipNullBytes(data, offset, skipNullBytes++);
            [gametype, offset] = this.readStringNT(data, offset);
            [map, offset] = this.readStringNT(data, offset);
            [numplayers, offset] = this.readStringNT(data, offset);
            [maxplayers, offset] = this.readStringNT(data, offset);
            hostport = data.readUInt16LE(offset);
            offset += 2;
            [hostip, offset] = this.readStringNT(data, offset);
        } while (offset < data.length);

        this.hostname = motd;
        this.gametype = gametype;
        this.map = map;
        this.numplayers = parseInt(numplayers);
        this.maxplayers = parseInt(maxplayers);
        if (isNaN(this.numplayers) || isNaN(this.maxplayers)) {
            throw new ProtocolError("Player count is not a number");
        }

        this.hostport = hostport;
        this.hostip = hostip;
        return this;
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        let motd = this.hostname || "";
        let gametype = this.gametype || "";
        let map = this.map || "";
        let numplayers = this.numplayers.toString();
        let maxplayers = this.maxplayers.toString();
        let hostport = this.hostport;
        let hostip = this.hostip || "";

        let portBuffer = Buffer.alloc(2);
        portBuffer.writeUInt16LE(hostport, 0);

        return Buffer.concat([
            this.createStringNT(motd),
            this.createStringNT(gametype),
            this.createStringNT(map),
            this.createStringNT(numplayers),
            this.createStringNT(maxplayers),
            portBuffer,
            this.createStringNT(hostip)
        ]);
    }
}
