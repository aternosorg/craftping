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
     * @return {[Map<string, string>, number]}
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

            values.set(key, value);
        }

        return [values, offset];
    }

    /**
     * @param {Buffer} data
     * @param {number} offset
     * @return {[string[], number]}
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
     * @inheritDoc
     */
    readPayload(data) {
        let padding = Buffer.from(data.buffer, data.byteOffset, this.constructor.START_PADDING.length);
        if (!padding.equals(this.constructor.START_PADDING)) {
            throw new ProtocolError("Invalid padding in full stat response");
        }

        let [values, offset] = this.readKeyValueSection(data, this.constructor.START_PADDING.length);

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

        this.gametype = values.get('gametype');
        this.game_id = values.get('game_id');
        this.version = values.get('version');
        this.plugins = values.get('plugins');
        this.map = values.get('map');
        this.numplayers = parseInt(values.get('numplayers'));
        this.maxplayers = parseInt(values.get('maxplayers'));
        if (isNaN(this.numplayers) || isNaN(this.maxplayers)) {
            throw new ProtocolError("Player count is not a number");
        }
        this.hostport = parseInt(values.get('hostport'));
        this.hostip = values.get('hostip');
        this.hostname = values.get('hostname');
        this.players = players;

        return this;
    }

    /**
     * @param {Map<string, string>} values
     * @return {Buffer}
     */
    writeKeyValueSection(values) {
        let parts = [];
        for (let [key, value] of values) {
            parts.push(this.createStringNT(key));
            parts.push(this.createStringNT(value));
        }
        parts.push(Buffer.alloc(1));
        return Buffer.concat(parts);
    }

    /**
     * @param {string[]} players
     * @return {Buffer}
     */
    writePlayers(players) {
        let parts = [];
        for (let player of players) {
            parts.push(this.createStringNT(player));
        }
        parts.push(Buffer.alloc(1));
        return Buffer.concat(parts);
    }

    /**
     * @inheritDoc
     */
    writePayload() {
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
            this.writeKeyValueSection(values),
            this.constructor.PLAYERS_PADDING,
            this.writePlayers(this.players)
        ]);
    }
}
