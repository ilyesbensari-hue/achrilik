-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
