CREATE SCHEMA a;

CREATE TABLE a.parent (
    id text PRIMARY KEY
);

CREATE TABLE a.child (
    id text PRIMARY KEY
);

CREATE SCHEMA b;

CREATE TABLE b.parent (
    id text PRIMARY KEY
);

CREATE TABLE b.child (
    id text PRIMARY KEY,
    root_id text REFERENCES a.parent (id)
);
