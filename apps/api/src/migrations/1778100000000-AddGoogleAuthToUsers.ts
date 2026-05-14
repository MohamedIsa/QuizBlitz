import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleAuthToUsers1778100000000 implements MigrationInterface {
  name = 'AddGoogleAuthToUsers1778100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "google_id" character varying(255) UNIQUE`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_google_id" ON "users" ("google_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_users_google_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
    // Rows with null password_hash (Google-only accounts) must be removed
    // before this constraint can be re-added.
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL`,
    );
  }
}
