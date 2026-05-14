import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthColumnsToUsers1778000000000 implements MigrationInterface {
  name = 'AddAuthColumnsToUsers1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "display_name" character varying(50) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "display_name" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "refresh_token_hash" character varying(60)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "refresh_token_hash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "display_name"`,
    );
  }
}
