exports.up = (pgm) => {
  pgm.addColumn("verification_tokens", {
    attempts: { type: "integer", notNull: true, default: 0 },
  });
};
exports.down = (pgm) => {
  pgm.dropColumn("verification_tokens", "attempts");
};
