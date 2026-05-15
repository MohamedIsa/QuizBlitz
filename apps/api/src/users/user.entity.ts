import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_users_email')
  @Column({ unique: true, length: 320 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 60, nullable: true })
  passwordHash!: string | null;

  @Index('idx_users_google_id')
  @Column({ name: 'google_id', type: 'varchar', length: 255, nullable: true, unique: true })
  googleId!: string | null;

  @Column({ name: 'display_name', type: 'varchar', length: 50 })
  displayName!: string;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 60, nullable: true })
  refreshTokenHash!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
