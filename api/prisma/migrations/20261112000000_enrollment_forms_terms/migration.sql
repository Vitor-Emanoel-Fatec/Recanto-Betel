ALTER TABLE `User`
    ADD COLUMN `termsAcceptedVersion` VARCHAR(32) NULL,
    ADD COLUMN `termsAcceptedAt` DATETIME(3) NULL;

ALTER TABLE `Enrollment`
    ADD COLUMN `termsAcceptedVersion` VARCHAR(32) NULL,
    ADD COLUMN `termsAcceptedAt` DATETIME(3) NULL;

ALTER TABLE `ParentBenificiary`
    MODIFY `relationshipType` VARCHAR(191) NOT NULL;

ALTER TABLE `Relatives`
    MODIFY `relation` VARCHAR(191) NOT NULL;

ALTER TABLE `Anamnese`
    ADD COLUMN `enrollment_id` VARCHAR(191) NULL,
    ADD COLUMN `declarationAccepted` BOOLEAN NULL,
    ADD COLUMN `responsibleSignature` VARCHAR(191) NULL,
    MODIFY `isComplete` BOOLEAN NOT NULL DEFAULT false;

UPDATE `Anamnese` AS `a`
SET `a`.`enrollment_id` = (
    SELECT `e`.`id`
    FROM `Enrollment` AS `e`
    WHERE `e`.`beneficiary_id` = `a`.`beneficiary_id`
    ORDER BY `e`.`submittedAt` DESC, `e`.`id` DESC
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1
    FROM `Enrollment` AS `e`
    WHERE `e`.`beneficiary_id` = `a`.`beneficiary_id`
);

CREATE UNIQUE INDEX `Anamnese_enrollment_id_key` ON `Anamnese`(`enrollment_id`);

ALTER TABLE `Anamnese`
    ADD CONSTRAINT `Anamnese_enrollment_id_fkey`
    FOREIGN KEY (`enrollment_id`) REFERENCES `Enrollment`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `EnrollmentForm` (
    `id` VARCHAR(191) NOT NULL,
    `enrollment_id` VARCHAR(191) NOT NULL,
    `kind` ENUM('TERMO', 'AUTORIZACAO', 'RELATOS') NOT NULL,
    `data` JSON NOT NULL,
    `isComplete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EnrollmentForm_enrollment_id_kind_key`(`enrollment_id`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `EnrollmentForm`
    ADD CONSTRAINT `EnrollmentForm_enrollment_id_fkey`
    FOREIGN KEY (`enrollment_id`) REFERENCES `Enrollment`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
