exports.up = (pgm) => {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  pgm.sql(
    `CREATE TYPE verification_type AS ENUM ('EMAIL_VERIFICATION','PASSWORD_RESET','MFA_LOGIN');`,
  );

  pgm.sql(`
    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name varchar(255),
      email text UNIQUE,
      password text,
      is_verified boolean DEFAULT false
    );
  `);

  pgm.sql(`
    CREATE TABLE verification_tokens (
      id serial PRIMARY KEY,
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      hashed_code varchar(255),
      type verification_type,
      target varchar(255),
      expires_at timestamptz,
      created_at timestamptz DEFAULT now()
    );
  `);

  pgm.sql(`
    CREATE TABLE customers (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name varchar(255),
      email varchar(255),
      image_url varchar(255)
    );
  `);

  pgm.sql(`
    CREATE TABLE invoices (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_id uuid,
      amount integer,
      status varchar(255),
      date date
    );
  `);

  pgm.sql(`
    CREATE TABLE revenue (
      month varchar(4),
      revenue integer,
      UNIQUE (month)
    );
  `);

  pgm.sql(
    `CREATE INDEX idx_verification_lookup ON verification_tokens (user_id, type);`,
  );
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS idx_verification_lookup;`);
  pgm.sql(`DROP TABLE IF EXISTS revenue;`);
  pgm.sql(`DROP TABLE IF EXISTS invoices;`);
  pgm.sql(`DROP TABLE IF EXISTS customers;`);
  pgm.sql(`DROP TABLE IF EXISTS verification_tokens;`);
  pgm.sql(`DROP TABLE IF EXISTS users;`);
  pgm.sql(`DROP TYPE IF EXISTS verification_type;`);
  pgm.sql(`DROP EXTENSION IF EXISTS "uuid-ossp";`);
};
