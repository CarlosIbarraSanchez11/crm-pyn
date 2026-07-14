/*
  Warnings:

  - You are about to drop the column `foto` on the `empleado` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `empleado` DROP COLUMN `foto`,
    ADD COLUMN `descriptor` JSON NULL,
    ADD COLUMN `fotoPerfil` VARCHAR(191) NULL;
