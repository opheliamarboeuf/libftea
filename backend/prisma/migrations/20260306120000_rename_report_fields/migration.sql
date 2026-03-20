-- Rename reportReason to reportCategory
ALTER TABLE "Report" RENAME COLUMN "reportReason" TO "reportCategory";

-- Rename reportContext to reportDescription
ALTER TABLE "Report" RENAME COLUMN "reportContext" TO "reportDescription";
