import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizzesService } from '../quizzes/quizzes.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReorderItemDto } from './dto/reorder-questions.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './question.entity';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    private readonly quizzesService: QuizzesService,
  ) {}

  async create(
    quizId: string,
    hostId: string,
    dto: CreateQuestionDto,
  ): Promise<Question> {
    await this.quizzesService.findOneOrFail(quizId, hostId);

    if (dto.correctOptionIndex >= dto.options.length) {
      throw new BadRequestException(
        `correctOptionIndex ${dto.correctOptionIndex} is out of range for ${dto.options.length} options`,
      );
    }

    const count = await this.questionRepo.count({ where: { quizId } });
    const question = this.questionRepo.create({
      ...dto,
      quizId,
      orderIndex: dto.orderIndex ?? count,
    });
    const saved = await this.questionRepo.save(question);
    this.logger.log(`Question created: ${saved.id} in quiz: ${quizId}`);
    return saved;
  }

  async findAll(quizId: string, hostId: string): Promise<Question[]> {
    await this.quizzesService.findOneOrFail(quizId, hostId);
    return this.questionRepo.find({
      where: { quizId },
      order: { orderIndex: 'ASC' },
    });
  }

  async findOne(quizId: string, id: string, hostId: string): Promise<Question> {
    await this.quizzesService.findOneOrFail(quizId, hostId);
    const question = await this.questionRepo.findOne({ where: { id, quizId } });
    if (!question) throw new NotFoundException(`Question ${id} not found`);
    return question;
  }

  async update(
    quizId: string,
    id: string,
    hostId: string,
    dto: UpdateQuestionDto,
  ): Promise<Question> {
    const question = await this.findOne(quizId, id, hostId);

    if (
      dto.options !== undefined &&
      dto.correctOptionIndex !== undefined &&
      dto.correctOptionIndex >= dto.options.length
    ) {
      throw new BadRequestException(
        `correctOptionIndex ${dto.correctOptionIndex} is out of range for ${dto.options.length} options`,
      );
    }

    // Case 2: only index changes — check against stored options length
    if (
      dto.options === undefined &&
      dto.correctOptionIndex !== undefined &&
      dto.correctOptionIndex >= question.options.length
    ) {
      throw new BadRequestException(
        `correctOptionIndex ${dto.correctOptionIndex} is out of range for ${question.options.length} options`,
      );
    }

    // Case 3: only options change — check stored index is still valid for new count
    if (
      dto.options !== undefined &&
      dto.correctOptionIndex === undefined &&
      question.correctOptionIndex >= dto.options.length
    ) {
      throw new BadRequestException(
        `Existing correctOptionIndex ${question.correctOptionIndex} is out of range for the new ` +
          `${dto.options.length} options. Include a valid correctOptionIndex in this request.`,
      );
    }

    Object.assign(question, dto);
    return this.questionRepo.save(question);
  }

  async remove(quizId: string, id: string, hostId: string): Promise<void> {
    await this.findOne(quizId, id, hostId);
    await this.questionRepo.softDelete({ id });
    this.logger.log(`Question soft-deleted: ${id} from quiz: ${quizId}`);
  }

  async reorder(
    quizId: string,
    hostId: string,
    items: ReorderItemDto[],
  ): Promise<void> {
    await this.quizzesService.findOneOrFail(quizId, hostId);
    await this.questionRepo.manager.transaction(async (em) => {
      for (const item of items) {
        await em.update(
          Question,
          { id: item.id, quizId },
          { orderIndex: item.orderIndex },
        );
      }
    });
    this.logger.log(`Reordered ${items.length} questions in quiz: ${quizId}`);
  }
}
