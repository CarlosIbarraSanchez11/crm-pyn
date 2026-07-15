/*
  Warnings:

  - You are about to drop the `accion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modulo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permiso` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permisoaccion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userpermiso` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `modulo` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `permiso` DROP FOREIGN KEY `Permiso_moduloId_fkey`;

-- DropForeignKey
ALTER TABLE `permisoaccion` DROP FOREIGN KEY `PermisoAccion_accionId_fkey`;

-- DropForeignKey
ALTER TABLE `permisoaccion` DROP FOREIGN KEY `PermisoAccion_permisoId_fkey`;

-- DropForeignKey
ALTER TABLE `userpermiso` DROP FOREIGN KEY `UserPermiso_permisoId_fkey`;

-- DropForeignKey
ALTER TABLE `userpermiso` DROP FOREIGN KEY `UserPermiso_userId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `modulo` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `accion`;

-- DropTable
DROP TABLE `modulo`;

-- DropTable
DROP TABLE `permiso`;

-- DropTable
DROP TABLE `permisoaccion`;

-- DropTable
DROP TABLE `userpermiso`;
