-- Migration 004: Add dev_otp column for local debugging
ALTER TABLE otp_tokens ADD COLUMN IF NOT EXISTS dev_otp VARCHAR(10);
