ALTER TABLE `Beneficiary`
    ADD COLUMN `publicCode` VARCHAR(32) NULL;

UPDATE `Beneficiary`
SET `publicCode` = CONCAT(
    'BEN-',
    DATE_FORMAT(`createdAt`, '%Y'),
    '-',
    UPPER(SUBSTRING(SHA2(`id`, 256), 1, 16))
);

ALTER TABLE `Beneficiary`
    MODIFY `publicCode` VARCHAR(32) NOT NULL,
    ADD UNIQUE INDEX `Beneficiary_publicCode_key` (`publicCode`);

ALTER TABLE `Parent`
    ADD COLUMN `publicCode` VARCHAR(32) NULL;

UPDATE `Parent`
SET `publicCode` = CONCAT(
    'RES-',
    DATE_FORMAT(`createdAt`, '%Y'),
    '-',
    UPPER(SUBSTRING(SHA2(`id`, 256), 1, 16))
);

ALTER TABLE `Parent`
    MODIFY `publicCode` VARCHAR(32) NOT NULL,
    ADD UNIQUE INDEX `Parent_publicCode_key` (`publicCode`);

ALTER TABLE `Enrollment`
    ADD COLUMN `publicCode` VARCHAR(32) NULL;

UPDATE `Enrollment`
SET `publicCode` = CONCAT(
    'MAT-',
    DATE_FORMAT(`submittedAt`, '%Y'),
    '-',
    UPPER(SUBSTRING(SHA2(`id`, 256), 1, 16))
);

ALTER TABLE `Enrollment`
    MODIFY `publicCode` VARCHAR(32) NOT NULL,
    ADD UNIQUE INDEX `Enrollment_publicCode_key` (`publicCode`);
