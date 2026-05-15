import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Quiz } from './quiz.entity';
import { QuizStatus } from './quiz-status.enum';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { User } from '../users/user.entity';

const HOST_ID = 'host-uuid-abc';
const OTHER_HOST_ID = 'other-host-uuid';
const QUIZ_ID = 'quiz-uuid-123';

const mockQuiz: Quiz = {
  id: QUIZ_ID,
  title: 'Test Quiz',
  description: null,
  status: QuizStatus.DRAFT,
  coverImageUrl: null,
  hostId: HOST_ID,
  host: {} as User,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('QuizzesService', () => {
  let service: QuizzesService;
  let quizRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    softDelete: jest.Mock;
  };

  beforeEach(async () => {
    quizRepo = {
      create: jest.fn().mockImplementation((dto) => ({ ...mockQuiz, ...dto })),
      save: jest.fn().mockImplementation((quiz) => Promise.resolve({ ...mockQuiz, ...quiz })),
      find: jest.fn().mockResolvedValue([mockQuiz]),
      findOne: jest.fn(),
      softDelete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzesService,
        { provide: getRepositoryToken(Quiz), useValue: quizRepo },
      ],
    }).compile();

    service = module.get(QuizzesService);
  });

  describe('create', () => {
    it('sets hostId from the argument and saves the quiz', async () => {
      const dto: CreateQuizDto = { title: 'New Quiz' };

      const result = await service.create(HOST_ID, dto);

      expect(quizRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Quiz', hostId: HOST_ID }),
      );
      expect(quizRepo.save).toHaveBeenCalled();
      expect(result.hostId).toBe(HOST_ID);
    });
  });

  describe('findAll', () => {
    it('queries only quizzes belonging to the host', async () => {
      const result = await service.findAll(HOST_ID);

      expect(quizRepo.find).toHaveBeenCalledWith({
        where: { hostId: HOST_ID },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockQuiz]);
    });
  });

  describe('findOneOrFail', () => {
    it('returns the quiz when it exists and belongs to the host', async () => {
      quizRepo.findOne.mockResolvedValue(mockQuiz);

      const result = await service.findOneOrFail(QUIZ_ID, HOST_ID);

      expect(result).toEqual(mockQuiz);
    });

    it('throws NotFoundException when the quiz does not exist', async () => {
      quizRepo.findOne.mockResolvedValue(null);

      await expect(service.findOneOrFail(QUIZ_ID, HOST_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the quiz belongs to a different host (no 403 — no leakage)', async () => {
      quizRepo.findOne.mockResolvedValue({ ...mockQuiz, hostId: OTHER_HOST_ID });

      await expect(service.findOneOrFail(QUIZ_ID, HOST_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('calls findOneOrFail then saves the merged quiz', async () => {
      quizRepo.findOne.mockResolvedValue(mockQuiz);
      const dto: UpdateQuizDto = { title: 'Updated Title' };

      const result = await service.update(QUIZ_ID, HOST_ID, dto);

      expect(quizRepo.findOne).toHaveBeenCalled();
      expect(quizRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated Title' }),
      );
      expect(result.title).toBe('Updated Title');
    });

    it('propagates NotFoundException from findOneOrFail when not owner', async () => {
      quizRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(QUIZ_ID, HOST_ID, { title: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('calls findOneOrFail then soft-deletes the quiz', async () => {
      quizRepo.findOne.mockResolvedValue(mockQuiz);

      await service.remove(QUIZ_ID, HOST_ID);

      expect(quizRepo.findOne).toHaveBeenCalled();
      expect(quizRepo.softDelete).toHaveBeenCalledWith({ id: QUIZ_ID });
    });

    it('propagates NotFoundException from findOneOrFail when not owner', async () => {
      quizRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(QUIZ_ID, HOST_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
