/*
  Warnings:

  - Added the required column `updatedAt` to the `Asistencia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `asistencia` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
