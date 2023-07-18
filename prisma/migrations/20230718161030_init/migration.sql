-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('INSTAGRAM', 'LENS');

-- CreateTable
CREATE TABLE "Stats" (
    "id" SERIAL NOT NULL,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" "Platform" NOT NULL,
    "handle" TEXT NOT NULL,
    "followers" INTEGER,
    "following" INTEGER,
    "posts" INTEGER,
    "likes" INTEGER,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("id")
);
