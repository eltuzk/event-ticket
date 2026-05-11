import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1778484965756 implements MigrationInterface {
    name = 'Init1778484965756'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`categories\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`qr_codes\` (\`id\` varchar(36) NOT NULL, \`ticketId\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`isScanned\` tinyint NOT NULL DEFAULT 0, \`scannedAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_1e39ba357f9b55727e13344b39\` (\`ticketId\`), UNIQUE INDEX \`IDX_8a8ba2310839f388674c1b095c\` (\`code\`), UNIQUE INDEX \`REL_1e39ba357f9b55727e13344b39\` (\`ticketId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payments\` (\`id\` varchar(36) NOT NULL, \`ticketId\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`status\` enum ('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING', \`method\` enum ('MOCK') NOT NULL DEFAULT 'MOCK', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tickets\` (\`id\` varchar(36) NOT NULL, \`seatId\` varchar(255) NOT NULL, \`eventId\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`status\` enum ('PENDING', 'CONFIRMED', 'CANCELLED', 'USED') NOT NULL DEFAULT 'PENDING', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`REL_3cfe6e735797672de20d16630b\` (\`seatId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`seats\` (\`id\` varchar(36) NOT NULL, \`seatMapId\` varchar(255) NOT NULL, \`row\` int NOT NULL, \`column\` int NOT NULL, \`label\` varchar(255) NOT NULL, \`price\` decimal(10,2) NOT NULL, \`status\` enum ('AVAILABLE', 'RESERVED', 'SOLD') NOT NULL DEFAULT 'AVAILABLE', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`seat_maps\` (\`id\` varchar(36) NOT NULL, \`eventId\` varchar(255) NOT NULL, \`totalRows\` int NOT NULL, \`totalColumns\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_5b0bbc0ffab683b9b8b9fd7fba\` (\`eventId\`), UNIQUE INDEX \`REL_5b0bbc0ffab683b9b8b9fd7fba\` (\`eventId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`events\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`startDate\` datetime NOT NULL, \`endDate\` datetime NOT NULL, \`location\` varchar(255) NOT NULL, \`status\` enum ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'DRAFT', \`organizerId\` varchar(255) NOT NULL, \`categoryId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`fullName\` varchar(255) NOT NULL, \`role\` enum ('ADMIN', 'ORGANIZER', 'CUSTOMER', 'GATE_STAFF') NOT NULL DEFAULT 'CUSTOMER', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`qr_codes\` ADD CONSTRAINT \`FK_1e39ba357f9b55727e13344b394\` FOREIGN KEY (\`ticketId\`) REFERENCES \`tickets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_6de98d8bb00ad6ab1efe2d218c7\` FOREIGN KEY (\`ticketId\`) REFERENCES \`tickets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_d35cb3c13a18e1ea1705b2817b1\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tickets\` ADD CONSTRAINT \`FK_3cfe6e735797672de20d16630bb\` FOREIGN KEY (\`seatId\`) REFERENCES \`seats\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tickets\` ADD CONSTRAINT \`FK_8a101375d173c39a7c1d02c9d7d\` FOREIGN KEY (\`eventId\`) REFERENCES \`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tickets\` ADD CONSTRAINT \`FK_4bb45e096f521845765f657f5c8\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`seats\` ADD CONSTRAINT \`FK_10531f0cd625bfaef7a63580413\` FOREIGN KEY (\`seatMapId\`) REFERENCES \`seat_maps\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`seat_maps\` ADD CONSTRAINT \`FK_5b0bbc0ffab683b9b8b9fd7fba1\` FOREIGN KEY (\`eventId\`) REFERENCES \`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_1024d476207981d1c72232cf3ca\` FOREIGN KEY (\`organizerId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_2f7107d3528147b9237b6e2a2fe\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_2f7107d3528147b9237b6e2a2fe\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_1024d476207981d1c72232cf3ca\``);
        await queryRunner.query(`ALTER TABLE \`seat_maps\` DROP FOREIGN KEY \`FK_5b0bbc0ffab683b9b8b9fd7fba1\``);
        await queryRunner.query(`ALTER TABLE \`seats\` DROP FOREIGN KEY \`FK_10531f0cd625bfaef7a63580413\``);
        await queryRunner.query(`ALTER TABLE \`tickets\` DROP FOREIGN KEY \`FK_4bb45e096f521845765f657f5c8\``);
        await queryRunner.query(`ALTER TABLE \`tickets\` DROP FOREIGN KEY \`FK_8a101375d173c39a7c1d02c9d7d\``);
        await queryRunner.query(`ALTER TABLE \`tickets\` DROP FOREIGN KEY \`FK_3cfe6e735797672de20d16630bb\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_d35cb3c13a18e1ea1705b2817b1\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_6de98d8bb00ad6ab1efe2d218c7\``);
        await queryRunner.query(`ALTER TABLE \`qr_codes\` DROP FOREIGN KEY \`FK_1e39ba357f9b55727e13344b394\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`events\``);
        await queryRunner.query(`DROP INDEX \`REL_5b0bbc0ffab683b9b8b9fd7fba\` ON \`seat_maps\``);
        await queryRunner.query(`DROP INDEX \`IDX_5b0bbc0ffab683b9b8b9fd7fba\` ON \`seat_maps\``);
        await queryRunner.query(`DROP TABLE \`seat_maps\``);
        await queryRunner.query(`DROP TABLE \`seats\``);
        await queryRunner.query(`DROP INDEX \`REL_3cfe6e735797672de20d16630b\` ON \`tickets\``);
        await queryRunner.query(`DROP TABLE \`tickets\``);
        await queryRunner.query(`DROP TABLE \`payments\``);
        await queryRunner.query(`DROP INDEX \`REL_1e39ba357f9b55727e13344b39\` ON \`qr_codes\``);
        await queryRunner.query(`DROP INDEX \`IDX_8a8ba2310839f388674c1b095c\` ON \`qr_codes\``);
        await queryRunner.query(`DROP INDEX \`IDX_1e39ba357f9b55727e13344b39\` ON \`qr_codes\``);
        await queryRunner.query(`DROP TABLE \`qr_codes\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
    }

}
