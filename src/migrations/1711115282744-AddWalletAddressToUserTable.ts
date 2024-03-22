import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletAddressToUserTable1711115282744 implements MigrationInterface {
    name = 'AddWalletAddressToUserTable1711115282744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "walletAddress" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "walletAddress"`);
    }

}
