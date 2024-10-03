-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "courseReferenceNumber" SET DATA TYPE TEXT,
ALTER COLUMN "courseNumber" SET DATA TYPE TEXT,
ALTER COLUMN "creditHours" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Faculty" ALTER COLUMN "bannerId" SET DATA TYPE TEXT,
ALTER COLUMN "courseReferenceNumber" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "MeetingTime" ALTER COLUMN "beginTime" SET DATA TYPE TEXT,
ALTER COLUMN "room" SET DATA TYPE TEXT,
ALTER COLUMN "category" SET DATA TYPE TEXT,
ALTER COLUMN "courseReferenceNumber" SET DATA TYPE TEXT,
ALTER COLUMN "endDate" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT,
ALTER COLUMN "hoursWeek" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MeetingsFaculty" ALTER COLUMN "category" SET DATA TYPE TEXT,
ALTER COLUMN "courseReferenceNumber" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "sectionAttribute" ALTER COLUMN "courseReferenceNumber" SET DATA TYPE TEXT;