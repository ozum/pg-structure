/*
Created: 10/3/2019
Modified: 10/14/2019
Project: pg-structure-test
Model: Relation Names
Author: Özüm Eldoğan
Database: PostgreSQL 10
 */
-- Create tables section -------------------------------------------------
-- Table product

CREATE TABLE "product" (
  "id" Serial NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table product
ALTER TABLE "product"
  ADD CONSTRAINT "Keyproduct1" PRIMARY KEY ("id");

-- Table cart_line_item
CREATE TABLE "cart_line_item" (
  "product_id" Integer NOT NULL,
  "cart_id" Integer NOT NULL,
  "alternative_product_id" Integer,
  "second_cart_id" Integer
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table cart_line_item
ALTER TABLE "cart_line_item"
  ADD CONSTRAINT "Keycart_line_item1" PRIMARY KEY ("product_id", "cart_id");

-- Table cart
CREATE TABLE "cart" (
  "id" Serial NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table cart
ALTER TABLE "cart"
  ADD CONSTRAINT "Keycart1" PRIMARY KEY ("id");

-- Table cancelled_item
CREATE TABLE "cancelled_item" (
  "product_id" Integer NOT NULL,
  "cart_id" Integer NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table cancelled_item
ALTER TABLE "cancelled_item"
  ADD CONSTRAINT "Keycancelled_item1" PRIMARY KEY ("product_id", "cart_id");

-- Table student
CREATE TABLE "student" (
  "id" Serial NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table student
ALTER TABLE "student"
  ADD CONSTRAINT "Keystudent1" PRIMARY KEY ("id");

-- Table message
CREATE TABLE "message" (
  "sender_id" Integer NOT NULL,
  "receiver_id" Integer NOT NULL,
  "status_id" Integer
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table message
ALTER TABLE "message"
  ADD CONSTRAINT "Keymessage1" PRIMARY KEY ("sender_id", "receiver_id");

-- Table class
CREATE TABLE "class" (
  "id" Serial NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table class
ALTER TABLE "class"
  ADD CONSTRAINT "Keyclass1" PRIMARY KEY ("id");

-- Table registry
CREATE TABLE "registry" (
  "class_id" Integer NOT NULL,
  "student_id" Integer NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table registry
ALTER TABLE "registry"
  ADD CONSTRAINT "Keyregistry1" PRIMARY KEY ("student_id", "class_id");

-- Table status
CREATE TABLE "status" (
  "id" Serial NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table status
ALTER TABLE "status"
  ADD CONSTRAINT "Keystatus1" PRIMARY KEY ("id");

-- Table color
CREATE TABLE "color" (
  "id" Serial NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table color
ALTER TABLE "color"
  ADD CONSTRAINT "Keycolor1" PRIMARY KEY ("id");

-- Table size
CREATE TABLE "size" (
  "id" Serial NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table size
ALTER TABLE "size"
  ADD CONSTRAINT "Keysize1" PRIMARY KEY ("id");

-- Table shirt
CREATE TABLE "shirt" (
  "color_id" Integer NOT NULL,
  "size_id" Integer NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table shirt
ALTER TABLE "shirt"
  ADD CONSTRAINT "Keyshirt1" PRIMARY KEY ("color_id", "size_id");

-- Table shoe
CREATE TABLE "shoe" (
  "color_id" Integer NOT NULL,
  "size_id" Integer NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table shoe
ALTER TABLE "shoe"
  ADD CONSTRAINT "Keyshoe1" PRIMARY KEY ("color_id", "size_id");

-- Table favorite_item
CREATE TABLE "favorite_item" (
  "product_id" Integer NOT NULL,
  "cart_id" Integer NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table favorite_item
ALTER TABLE "favorite_item"
  ADD CONSTRAINT "Keyfavorite_item1" PRIMARY KEY ("product_id", "cart_id");

-- Table car
CREATE TABLE "car" (
  "id" Bigint NOT NULL,
  "option_id" Bigint,
  "option_id_2" Bigint
)
WITH (
  autovacuum_enabled = TRUE
);

-- Create indexes for table car
CREATE INDEX "IX_caroption" ON "car" ("option_id_2");

-- Add keys for table car
ALTER TABLE "car"
  ADD CONSTRAINT "Keycar1" PRIMARY KEY ("id");

-- Table option
CREATE TABLE "option" (
  "id" Bigint NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table option
ALTER TABLE "option"
  ADD CONSTRAINT "Keyoption1" PRIMARY KEY ("id");

-- Table game
CREATE TABLE "game" (
  "id" Serial NOT NULL,
  "max_difficulty_id" Integer,
  "min_difficulty_id" Integer,
  "main_game_max_difficulty_id" Integer
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table game
ALTER TABLE "game"
  ADD CONSTRAINT "Keygame1" PRIMARY KEY ("id");

-- Table difficulty
CREATE TABLE "difficulty" (
  "id" Serial NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table difficulty
ALTER TABLE "difficulty"
  ADD CONSTRAINT "Keydifficulty1" PRIMARY KEY ("id");

-- Table person
CREATE TABLE "person" (
  "id" Serial NOT NULL,
  "club_id" Integer,
  "group_id" Integer
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table person
ALTER TABLE "person"
  ADD CONSTRAINT "Keyperson1" PRIMARY KEY ("id");

-- Table club
CREATE TABLE "club" (
  "id" Serial NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table club
ALTER TABLE "club"
  ADD CONSTRAINT "Keyclub1" PRIMARY KEY ("id");

-- Table bike
CREATE TABLE "bike" (
  "id" Serial NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table bike
ALTER TABLE "bike"
  ADD CONSTRAINT "Keybike1" PRIMARY KEY ("id");

-- Table bike_option
CREATE TABLE "bike_option" (
  "bike_id" Integer NOT NULL,
  "option_id" Bigint NOT NULL
)
WITH (
  autovacuum_enabled = TRUE
);

-- Add keys for table bike_option
ALTER TABLE "bike_option"
  ADD CONSTRAINT "Keybike_option1" PRIMARY KEY ("bike_id", "option_id");

-- Create foreign keys (relationships) section -------------------------------------------------
ALTER TABLE "cart_line_item"
  ADD CONSTRAINT "cart_line_item_main_product" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "cart_line_item"
  ADD CONSTRAINT "cart_line_item_first_cart" FOREIGN KEY ("cart_id") REFERENCES "cart" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "cart_line_item"
  ADD CONSTRAINT "cart_line_item_alternative_product" FOREIGN KEY ("alternative_product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "cart_line_item"
  ADD CONSTRAINT "cart_line_item_second_cart" FOREIGN KEY ("second_cart_id") REFERENCES "cart" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "cancelled_item"
  ADD CONSTRAINT "cancelled_item_first_product" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "cancelled_item"
  ADD CONSTRAINT "cancelled_item_cart" FOREIGN KEY ("cart_id") REFERENCES "cart" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "message"
  ADD CONSTRAINT "message_sender_student" FOREIGN KEY ("sender_id") REFERENCES "student" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "message"
  ADD CONSTRAINT "message_receiver_student" FOREIGN KEY ("receiver_id") REFERENCES "student" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "registry"
  ADD CONSTRAINT "registry_class" FOREIGN KEY ("class_id") REFERENCES "class" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "registry"
  ADD CONSTRAINT "registry_member_student" FOREIGN KEY ("student_id") REFERENCES "student" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "message"
  ADD CONSTRAINT "message_last_status" FOREIGN KEY ("status_id") REFERENCES "status" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "shirt"
  ADD CONSTRAINT "shirt_prime_color" FOREIGN KEY ("color_id") REFERENCES "color" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "shirt"
  ADD CONSTRAINT "shirt_size" FOREIGN KEY ("size_id") REFERENCES "size" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "shoe"
  ADD CONSTRAINT "shoe_wax_color" FOREIGN KEY ("color_id") REFERENCES "color" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "shoe"
  ADD CONSTRAINT "shoe_size" FOREIGN KEY ("size_id") REFERENCES "size" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "favorite_item"
  ADD CONSTRAINT "favorite_item_main_product" FOREIGN KEY ("product_id") REFERENCES "product" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "favorite_item"
  ADD CONSTRAINT "favorite_item_first_cart" FOREIGN KEY ("cart_id") REFERENCES "cart" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "car"
  ADD CONSTRAINT "main_car_first_option" FOREIGN KEY ("option_id") REFERENCES "option" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "car"
  ADD CONSTRAINT "second_car_second_option" FOREIGN KEY ("option_id_2") REFERENCES "option" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "game"
  ADD CONSTRAINT "popular_game_min_difficulty" FOREIGN KEY ("max_difficulty_id") REFERENCES "difficulty" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "game"
  ADD CONSTRAINT "main_game_max_difficulty" FOREIGN KEY ("min_difficulty_id") REFERENCES "difficulty" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "game"
  ADD CONSTRAINT "other_game_max_difficulty" FOREIGN KEY ("main_game_max_difficulty_id") REFERENCES "difficulty" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "person"
  ADD CONSTRAINT "player,team" FOREIGN KEY ("club_id") REFERENCES "club" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "person"
  ADD CONSTRAINT "prime_member, main_group" FOREIGN KEY ("group_id") REFERENCES "club" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "bike_option"
  ADD CONSTRAINT "bike_option_bike" FOREIGN KEY ("bike_id") REFERENCES "bike" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

ALTER TABLE "bike_option"
  ADD CONSTRAINT "bike_option_option" FOREIGN KEY ("option_id") REFERENCES "option" ("id") ON DELETE CASCADE ON
  UPDATE
    CASCADE;

