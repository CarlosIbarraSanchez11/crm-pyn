/*
  Warnings:

  - You are about to alter the column `salario` on the `contrato` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `contrato` MODIFY `fechaInicio` DATE NOT NULL,
    MODIFY `fechaFin` DATE NULL,
    MODIFY `salario` DECIMAL(10, 2) NULL;
