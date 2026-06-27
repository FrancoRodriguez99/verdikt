'use strict';

const { mongoose } = require('../connection');

const RANKING_LABELS = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly Agree',
};

/**
 * One document per player per question.
 * Covers both ranking answers (value 1–5) and vote answers (target player).
 *
 * Example ranking record:
 *   playerName: "Olha"
 *   device.deviceType: "Mobile" / device.os: "Android"
 *   questionText.en: "Money is the key to happiness."
 *   rankingValue: 5 / rankingLabel: "Strongly Agree"
 *
 * Example vote record:
 *   playerName: "Franco"
 *   questionText.en: "Who would survive longest in the wilderness?"
 *   votedForName: "Olha"
 *   isSelfVote: false
 */
const AnswerSchema = new mongoose.Schema(
  {
    // ── Game context ───────────────────────────────────────────────────────────
    roomCode: { type: String, required: true, index: true },
    gameSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameSession', index: true },
    roundIndex: Number,        // which round (0-based)
    revealedAt: Date,          // when the host clicked "Reveal Results"

    // ── Question ───────────────────────────────────────────────────────────────
    questionId: String,
    questionType: { type: String, enum: ['ranking', 'vote'] },
    questionText: {
      en: String,
      it: String,
      es: String,
    },
    questionTags: [
      {
        name: String,
        direction: String, // 'agree' | 'disagree'
      },
    ],

    // ── Player ────────────────────────────────────────────────────────────────
    playerSocketId: String,    // socket id at time of answer
    playerName: String,

    device: {
      userAgent: String,
      ip: String,
      os: String,             // e.g. "Android", "iOS (iPhone)", "Windows"
      browser: String,        // e.g. "Chrome", "Safari"
      deviceType: String,     // "Mobile" | "Tablet" | "Desktop"
      language: String,       // Accept-Language header primary tag
    },

    // ── Ranking answer (questionType === 'ranking') ────────────────────────────
    rankingValue: { type: Number, min: 1, max: 5 },
    rankingLabel: String,      // "Strongly Agree" etc.

    // ── Vote answer (questionType === 'vote') ─────────────────────────────────
    votedForSocketId: String,
    votedForName: String,
    isSelfVote: Boolean,       // true when player voted for themselves

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Convenience: populate rankingLabel before saving
AnswerSchema.pre('save', function (next) {
  if (this.questionType === 'ranking' && this.rankingValue) {
    this.rankingLabel = RANKING_LABELS[this.rankingValue] ?? null;
  }
  next();
});

module.exports = mongoose.model('Answer', AnswerSchema);
