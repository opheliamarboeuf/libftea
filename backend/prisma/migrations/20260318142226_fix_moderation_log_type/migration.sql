-- CreateEnum for the corrected ModerationLogType
CREATE TYPE "ModerationLogType" AS ENUM ('DELETE_ANY_POST', 'CHANGE_ADMIN_ROLE', 'CHANGE_MOD_ROLE', 'BAN_USER', 'REVIEW_USER_REPORT', 'REVIEW_POST_REPORT', 'CREATE_TOURNAMENT');

-- Create a temporary column with the new enum type
ALTER TABLE "ModerationLog" ADD COLUMN "action_new" "ModerationLogType" NOT NULL DEFAULT 'CREATE_TOURNAMENT';

-- Copy data from old column to new column, mapping old values to new ones
UPDATE "ModerationLog" SET "action_new" = 
  CASE 
    WHEN "action"::text = 'DELETE_ANY_POST' THEN 'DELETE_ANY_POST'::"ModerationLogType"
    WHEN "action"::text = 'CHANGE_ROLE' THEN 'CHANGE_ADMIN_ROLE'::"ModerationLogType"
    WHEN "action"::text = 'BAN_USER' THEN 'BAN_USER'::"ModerationLogType"
    WHEN "action"::text = 'CREATE_TOURNAMENT' THEN 'CREATE_TOURNAMENT'::"ModerationLogType"
    WHEN "action"::text = 'REVIEW_REPORT' THEN 'REVIEW_POST_REPORT'::"ModerationLogType"
    ELSE 'CREATE_TOURNAMENT'::"ModerationLogType"
  END;

-- Drop the old column
ALTER TABLE "ModerationLog" DROP COLUMN "action";

-- Rename the new column to the original name
ALTER TABLE "ModerationLog" RENAME COLUMN "action_new" TO "action";

-- Drop the old enum
DROP TYPE "ModerationType";
