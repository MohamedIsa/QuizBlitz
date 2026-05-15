import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,
  ) {}

  async create(hostId: string, dto: CreateQuizDto): Promise<Quiz> {
    const quiz = this.quizRepo.create({ ...dto, hostId });
    const saved = await this.quizRepo.save(quiz);
    this.logger.log(`Quiz created: ${saved.id} by host: ${hostId}`);
    return saved;
  }

  async findAll(hostId: string): Promise<Quiz[]> {
    // TODO (QB-018): add take/skip pagination before wiring up the Quiz List screen
    return this.quizRepo.find({
      where: { hostId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Returns the quiz if it exists and belongs to hostId.
   * Throws NotFoundException in both "not found" and "wrong owner" cases —
   * returning 404 for both prevents exposing whether a given quiz ID exists.
   */
  async findOneOrFail(id: string, hostId: string): Promise<Quiz> {
    const quiz = await this.quizRepo.findOne({ where: { id } });
    if (!quiz || quiz.hostId !== hostId) {
      throw new NotFoundException(`Quiz ${id} not found`);
    }
    return quiz;
  }

  async update(id: string, hostId: string, dto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findOneOrFail(id, hostId);
    Object.assign(quiz, dto);
    return this.quizRepo.save(quiz);
  }

  async remove(id: string, hostId: string): Promise<void> {
    await this.findOneOrFail(id, hostId);
    await this.quizRepo.softDelete({ id });
    this.logger.log(`Quiz soft-deleted: ${id} by host: ${hostId}`);
  }
}
