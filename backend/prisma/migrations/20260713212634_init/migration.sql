-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `rol` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Modulo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Modulo_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permiso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `moduloId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPermiso` (
    `userId` INTEGER NOT NULL,
    `permisoId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `permisoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Accion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Accion_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermisoAccion` (
    `permisoId` INTEGER NOT NULL,
    `accionId` INTEGER NOT NULL,

    PRIMARY KEY (`permisoId`, `accionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Empleado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dni` VARCHAR(191) NOT NULL,
    `nombres` VARCHAR(191) NOT NULL,
    `apellidos` VARCHAR(191) NOT NULL,
    `fechaNacimiento` DATETIME(3) NOT NULL,
    `email` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `cargo` VARCHAR(191) NOT NULL,
    `departamento` VARCHAR(191) NOT NULL,
    `empresa` VARCHAR(191) NOT NULL,
    `foto` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Empleado_dni_key`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contrato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empleadoId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL,
    `fechaFin` DATETIME(3) NULL,
    `salario` DECIMAL(65, 30) NULL,
    `descripcion` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SSOMA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empleadoId` INTEGER NOT NULL,
    `emoInicio` DATETIME(3) NULL,
    `emoFin` DATETIME(3) NULL,
    `alturaInicio` DATETIME(3) NULL,
    `alturaFin` DATETIME(3) NULL,
    `sstInicio` DATETIME(3) NULL,
    `sstFin` DATETIME(3) NULL,
    `patrimonialInicio` DATETIME(3) NULL,
    `patrimonialFin` DATETIME(3) NULL,

    UNIQUE INDEX `SSOMA_empleadoId_key`(`empleadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Capacitacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `hora` VARCHAR(191) NOT NULL,
    `duracion` INTEGER NULL,
    `institucion` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `evidencia` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmpleadoCapacitacion` (
    `empleadoId` INTEGER NOT NULL,
    `capacitacionId` INTEGER NOT NULL,

    PRIMARY KEY (`empleadoId`, `capacitacionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuracion` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `empresa` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `telegramToken` VARCHAR(191) NULL,
    `chatId` VARCHAR(191) NULL,
    `diasContrato` INTEGER NOT NULL,
    `diasCapacitacion` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Permiso` ADD CONSTRAINT `Permiso_moduloId_fkey` FOREIGN KEY (`moduloId`) REFERENCES `Modulo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermiso` ADD CONSTRAINT `UserPermiso_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermiso` ADD CONSTRAINT `UserPermiso_permisoId_fkey` FOREIGN KEY (`permisoId`) REFERENCES `Permiso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermisoAccion` ADD CONSTRAINT `PermisoAccion_permisoId_fkey` FOREIGN KEY (`permisoId`) REFERENCES `Permiso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermisoAccion` ADD CONSTRAINT `PermisoAccion_accionId_fkey` FOREIGN KEY (`accionId`) REFERENCES `Accion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSOMA` ADD CONSTRAINT `SSOMA_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmpleadoCapacitacion` ADD CONSTRAINT `EmpleadoCapacitacion_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmpleadoCapacitacion` ADD CONSTRAINT `EmpleadoCapacitacion_capacitacionId_fkey` FOREIGN KEY (`capacitacionId`) REFERENCES `Capacitacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
