'use strict';

const { mongoose } = require('../connection');

/**
 * One document per Verdikt game room.
 * Created when the game starts, finalised when the host ends the game.
 */
const GameSessionSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, index: true },

    settings: {
      votesEnabled: Boolean,
      anonymous: Boolean,
    },

    // Full player roster that was active when the game started
    players: [
      {
        socketId: String,
        name: String,
        isHost: Boolean,
        device: {
          userAgent: String,
          ip: String,
          os: String,
          browser: String,
          deviceType: String,
          language: String,
          connectedAt: Date,
        },
        joinedAt: Date,
      },
    ],

    startedAt: { type: Date, default: Date.now },
    endedAt: Date,

    totalRoundsCompleted: { type: Number, default: 0 },

    // 'playing' while the game is live, 'finished' after end_game
    status: { type: String, enum: ['playing', 'finished'], default: 'playing' },

    // Full final stats blob (same object sent to clients)
    finalStats: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GameSession', GameSessionSchema);
