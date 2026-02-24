import ProtocolError from "../../Error/ProtocolError.js";
import StatResponse from "./StatResponse.js";

export default class FullStatResponse extends StatResponse {
    /** @type {Buffer} */ static START_PADDING = Buffer.from('73706C69746E756D008000', 'hex');
    /** @type {Buffer} */ static PLAYERS_PADDING = Buffer.from('01706C617965725F0000', 'hex');
    /** @type {Buffer[]} */ static VALID_KEYS = [
        'hostname',
        'gametype',
        'game_id',
        'version',
        'plugins',
        'map',
        'numplayers',
        'maxplayers',
        'hostport',
        'hostip'
    ].map(s => Buffer.from(s, 'ascii'));

    /** @type {Buffer[]} */ static VALID_KEYS_WITH_PLAYERS = [
        ...FullStatResponse.VALID_KEYS,
        Buffer.concat([Buffer.from('00', 'hex'), this.PLAYERS_PADDING])
    ];

    /** @type {string} */ game_id;
    /** @type {string} */ version;
    /** @type {string} */ plugins;
    /** @type {string[]} */ players;
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
     * @return {string[]}
     */
    getPlayers() {
        return this.players;
    }

    /**
     * @param {string[]} players
     * @return {this}
     */
    setPlayers(players) {
        this.players = players;
        return this;
    }

    /**
     * @return {string}
     */
    getPlugins() {
        return this.plugins;
    }

    /**
     * @param {string} plugins
     * @return {this}
     */
    setPlugins(plugins) {
        this.plugins = plugins;
        return this;
    }

    /**
     * @return {string}
     */
    getVersion() {
        return this.version;
    }

    /**
     * @param {string} version
     * @return {this}
     */
    setVersion(version) {
        this.version = version;
        return this;
    }

    /**
     * @return {string}
     */
    getGameId() {
        return this.game_id;
    }

    /**
     * @param {string} game_id
     * @return {this}
     */
    setGameId(game_id) {
        this.game_id = game_id;
        return this;
    }

    /**
     * @inheritDoc
     */
    getType() {
        return 0;
    }

    /**
     * @param {Buffer} data
     * @param {number} offset
     * @return {[Map<string, Buffer>, number]}
     */
    readKeyValueSection(data, offset) {
        let values = new Map();
        while (true) {
            let key, value;
            [key, offset] = this.readStringNT(data, offset);
            if (key.length === 0) {
                break;
            }

            [value, offset] = this.readStringNTFollowedBy(data, offset, FullStatResponse.VALID_KEYS_WITH_PLAYERS);

            values.set(key.toString("ascii"), value);
        }

        return [values, offset];
    }

    /**
     * @param {Buffer} data
     * @param {number} offset
     * @return {[Buffer[], number]}
     */
    readPlayers(data, offset) {
        let players = [];
        while (true) {
            let player;
            [player, offset] = this.readStringNT(data, offset);
            if (player.length === 0) {
                break;
            }

            players.push(player);
        }

        return [players, offset];
    }

    /**
     * Minecraft switched to UTF-8 encoding in version 1.21.11
     * @param {Buffer|string} version
     * @return {boolean}
     */
    shouldUseLegacyStringEncoding(version) {
        if (typeof version !== "string") {
            version = version.toString("ascii");
        }
        let parts = version.split(".")
            .map(s => parseInt(s))
            .map(n => isNaN(n) ? 0 : n);

        let modernVersion = [1, 21, 11];
        return this.compareVersions(parts, modernVersion) < 0;
    }

    /**
     *
     * @param {number[]} a
     * @param {number[]} b
     * @return {number}
     */
    compareVersions(a, b) {
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            let partA = i < a.length ? a[i] : 0;
            let partB = i < b.length ? b[i] : 0;
            if (partA < partB) {
                return -1;
            } else if (partA > partB) {
                return 1;
            }
        }
        return 0;
    }

    /**
     * @inheritDoc
     */
    readPayload(data) {
        let padding = Buffer.from(data.buffer, data.byteOffset, this.constructor.START_PADDING.length);
        if (!padding.equals(this.constructor.START_PADDING)) {
            throw new ProtocolError("Invalid padding in full stat response");
        }

        let [values, offset] = this.readKeyValueSection(data, this.constructor.START_PADDING.length);
        let legacyEncoding = null;
        if (this.useLegacyEncoding !== null) {
            legacyEncoding = this.useLegacyEncoding;
        } else if (values.has('version')) {
            legacyEncoding = this.shouldUseLegacyStringEncoding(values.get('version'));
        }

        let playerPadding = Buffer.from(data.buffer, data.byteOffset + offset, this.constructor.PLAYERS_PADDING.length);
        if (!playerPadding.equals(this.constructor.PLAYERS_PADDING)) {
            throw new ProtocolError("Invalid player padding in full stat response");
        }
        offset += this.constructor.PLAYERS_PADDING.length;

        let players;
        [players, offset] = this.readPlayers(data, offset);

        if (offset !== data.length) {
            throw new Error("Unexpected data after full stat response");
        }

        this.gametype = this.decodeString(values.get('gametype'), legacyEncoding);
        this.game_id = this.decodeString(values.get('game_id'), legacyEncoding);
        this.version = this.decodeString(values.get('version'), legacyEncoding);
        this.plugins = this.decodeString(values.get('plugins'), legacyEncoding);
        this.map = this.decodeString(values.get('map'), legacyEncoding);
        this.numplayers = parseInt(this.decodeString(values.get('numplayers'), legacyEncoding));
        this.maxplayers = parseInt(this.decodeString(values.get('maxplayers'), legacyEncoding));
        if (isNaN(this.numplayers) || isNaN(this.maxplayers)) {
            throw new ProtocolError("Player count is not a number");
        }
        this.hostport = parseInt(this.decodeString(values.get('hostport'), legacyEncoding));
        this.hostip = this.decodeString(values.get('hostip'), legacyEncoding);
        this.hostname = this.decodeString(values.get('hostname'), legacyEncoding);
        this.players = players.map(p => this.decodeString(p, legacyEncoding));

        return this;
    }

    /**
     * @param {Map<string, string>} values
     * @param {boolean} legacyEncoding
     * @return {Buffer}
     */
    writeKeyValueSection(values, legacyEncoding) {
        let parts = [];
        for (let [key, value] of values) {
            parts.push(this.createStringNT(key, legacyEncoding));
            parts.push(this.createStringNT(value, legacyEncoding));
        }
        parts.push(Buffer.alloc(1));
        return Buffer.concat(parts);
    }

    /**
     * @param {string[]} players
     * @param {boolean} legacyEncoding
     * @return {Buffer}
     */
    writePlayers(players, legacyEncoding) {
        let parts = [];
        for (let player of players) {
            parts.push(this.createStringNT(player, legacyEncoding));
        }
        parts.push(Buffer.alloc(1));
        return Buffer.concat(parts);
    }

    /**
     * @inheritDoc
     */
    writePayload() {
        let legacyEncoding = true;
        if (this.useLegacyEncoding !== null) {
            legacyEncoding = this.useLegacyEncoding;
        } else if (this.version) {
            legacyEncoding = this.shouldUseLegacyStringEncoding(this.version);
        }

        let values = new Map([
            ['hostname', this.hostname || ''],
            ['gametype', this.gametype || ''],
            ['game_id', this.game_id || ''],
            ['version', this.version || ''],
            ['plugins', this.plugins || ''],
            ['map', this.map || ''],
            ['numplayers', this.numplayers.toString()],
            ['maxplayers', this.maxplayers.toString()],
            ['hostport', this.hostport.toString()],
            ['hostip', this.hostip || '']
        ]);

        return Buffer.concat([
            this.constructor.START_PADDING,
            this.writeKeyValueSection(values, legacyEncoding),
            this.constructor.PLAYERS_PADDING,
            this.writePlayers(this.players, legacyEncoding)
        ]);
    }
}
