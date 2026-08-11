exports.up = (pgm) => {
  pgm.addColumn("users", {
    google_id: { type: "varchar(255)", unique: true },
  });
};
exports.down = (pgm) => {
  pgm.dropColumn("users", "google_id");
};
