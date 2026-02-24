import ProtocolError from "../../Error/ProtocolError.js";
import StatResponse from "./StatResponse.js";

export default class BasicStatResponse extends StatResponse {
    /** @type {?boolean} */ useLegacyEncoding;

    /**
     * @param {?boolean} useLegacyEncoding - Whether to use the legacy encoding method for strings.
     * If null, it will be determined automatically.
     */
    constructor(useLegacyEncoding = null) {
        super();
        this.useLegacyEncoding = useLegacyEncoding;
    }

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

        this.hostname = this.decodeString(motd, this.useLegacyEncoding);
        this.gametype = this.decodeString(gametype, this.useLegacyEncoding);
        this.map = this.decodeString(map, this.useLegacyEncoding);
        this.numplayers = parseInt(this.decodeString(numplayers, this.useLegacyEncoding));
        this.maxplayers = parseInt(this.decodeString(maxplayers, this.useLegacyEncoding));
        if (isNaN(this.numplayers) || isNaN(this.maxplayers)) {
            throw new ProtocolError("Player count is not a number");
        }

        this.hostport = hostport;
        this.hostip = this.decodeString(hostip, this.useLegacyEncoding);
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
            this.createStringNT(motd, this.useLegacyEncoding ?? true),
            this.createStringNT(gametype, this.useLegacyEncoding ?? true),
            this.createStringNT(map, this.useLegacyEncoding ?? true),
            this.createStringNT(numplayers, this.useLegacyEncoding ?? true),
            this.createStringNT(maxplayers, this.useLegacyEncoding ?? true),
            portBuffer,
            this.createStringNT(hostip, this.useLegacyEncoding ?? true)
        ]);
    }
}
