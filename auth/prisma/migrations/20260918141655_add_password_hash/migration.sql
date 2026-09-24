-- AlterTable
-- No default: any pre-existing rows (from the old username-only, no-password
-- flow) would violate NOT NULL. That's fine for a fresh/dev database; if you
-- have real rows already, backfill password_hash (or drop them) before
-- applying this migration.
ALTER TABLE "users" ADD COLUMN "password_hash" TEXT NOT NULL;
