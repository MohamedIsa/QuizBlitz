import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Quiz } from '../quizzes/quiz.entity';

// TODO: move to packages/shared when that package is scaffolded
export interface QuestionOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  text!: string;

  @Column({ type: 'jsonb' })
  options!: QuestionOption[];

  @Column({ name: 'correct_option_index', type: 'smallint' })
  correctOptionIndex!: number;

  @Column({ name: 'time_limit', type: 'smallint', default: 30 })
  timeLimit!: number;

  @Column({ name: 'order_index', type: 'smallint' })
  orderIndex!: number;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl!: string | null;

  @Index('idx_questions_quiz_id')
  @Column({ name: 'quiz_id' })
  quizId!: string;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
