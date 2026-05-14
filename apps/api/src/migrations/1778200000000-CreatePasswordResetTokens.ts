import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResetTokens1778200000000 implements MigrationInterface {
  name = 'CreatePasswordResetTokens1778200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id"              uuid                NOT NULL DEFAULT gen_random_uuid(),
        "user_id"         uuid                NOT NULL,
        "otp_hash"        character varying(60)  NOT NULL,
        "reset_token"     character varying(500),
        "otp_expires_at"  timestamptz         NOT NULL,
        "used_at"         timestamptz,
        "created_at"      timestamptz         NOT NULL DEFAULT now(),
        "updated_at"      timestamptz         NOT NULL DEFAULT now(),
        CONSTRAINT "pk_password_reset_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "fk_prt_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_prt_user_id" ON "password_reset_tokens" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_prt_user_id"`);
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
  }
}
