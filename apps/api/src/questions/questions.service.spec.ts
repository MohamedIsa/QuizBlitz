import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuizzesService } from '../quizzes/quizzes.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReorderItemDto } from './dto/reorder-questions.dto';
import { QuestionOption } from './question.entity';
import { Question } from './question.entity';
import { QuestionsService } from './questions.service';

const QUIZ_ID = 'quiz-uuid-123';
const HOST_ID = 'host-uuid-abc';
const QUESTION_ID = 'question-uuid-456';

const mockOptions: QuestionOption[] = [
  { label: 'A', text: 'Option A' },
  { label: 'B', text: 'Option B' },
];

const mockQuestion: Question = {
  id: QUESTION_ID,
  text: 'What is 2 + 2?',
  options: mockOptions,
  correctOptionIndex: 0,
  timeLimit: 30,
  orderIndex: 0,
  imageUrl: null,
  quizId: QUIZ_ID,
  quiz: {} as any,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('QuestionsService', () => {
  let service: QuestionsService;
  let questionRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    count: jest.Mock;
    softDelete: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  let quizzesService: { findOneOrFail: jest.Mock };

  beforeEach(async () => {
    const entityManager = { update: jest.fn().mockResolvedValue(undefined) };
    questionRepo = {
      create: jest.fn().mockImplementation((dto) => ({ ...mockQuestion, ...dto })),
      save: jest.fn().mockImplementation((q) => Promise.resolve({ ...mockQuestion, ...q })),
      find: jest.fn().mockResolvedValue([mockQuestion]),
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      softDelete: jest.fn().mockResolvedValue(undefined),
      manager: {
        transaction: jest.fn().mockImplementation(async (cb) => cb(entityManager)),
      },
    };
    quizzesService = { findOneOrFail: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        { provide: getRepositoryToken(Question), useValue: questionRepo },
        { provide: QuizzesService, useValue: quizzesService },
      ],
    }).compile();

    service = module.get(QuestionsService);
  });

  describe('create', () => {
    const dto: CreateQuestionDto = {
      text: 'What is 2 + 2?',
      options: [
        { label: 'A', text: 'Option A' },
        { label: 'B', text: 'Option B' },
      ],
      correctOptionIndex: 0,
      timeLimit: 30,
    };

    it('verifies quiz ownership, saves the question, and returns it', async () => {
      const result = await service.create(QUIZ_ID, HOST_ID, dto);

      expect(quizzesService.findOneOrFail).toHaveBeenCalledWith(QUIZ_ID, HOST_ID);
      expect(questionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ quizId: QUIZ_ID }),
      );
      expect(questionRepo.save).toHaveBeenCalled();
      expect(result.quizId).toBe(QUIZ_ID);
    });

    it('auto-assigns orderIndex from question count when not provided', async () => {
      questionRepo.count.mockResolvedValue(3);

      await service.create(QUIZ_ID, HOST_ID, dto);

      expect(questionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ orderIndex: 3 }),
      );
    });

    it('throws BadRequestException when correctOptionIndex is out of range', async () => {
      const badDto: CreateQuestionDto = {
        ...dto,
        options: [{ label: 'A', text: 'Only one' }] as any,
        correctOptionIndex: 1, // only 1 option (index 0), index 1 is out of range
      };

      await expect(service.create(QUIZ_ID, HOST_ID, badDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('propagates NotFoundException when the quiz does not belong to the host', async () => {
      quizzesService.findOneOrFail.mockRejectedValue(new NotFoundException());

      await expect(service.create(QUIZ_ID, HOST_ID, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('verifies ownership and returns questions ordered by orderIndex ASC', async () => {
      const result = await service.findAll(QUIZ_ID, HOST_ID);

      expect(quizzesService.findOneOrFail).toHaveBeenCalledWith(QUIZ_ID, HOST_ID);
      expect(questionRepo.find).toHaveBeenCalledWith({
        where: { quizId: QUIZ_ID },
        order: { orderIndex: 'ASC' },
      });
      expect(result).toEqual([mockQuestion]);
    });
  });

  describe('findOne', () => {
    it('returns the question when it exists and belongs to the quiz', async () => {
      questionRepo.findOne.mockResolvedValue(mockQuestion);

      const result = await service.findOne(QUIZ_ID, QUESTION_ID, HOST_ID);

      expect(quizzesService.findOneOrFail).toHaveBeenCalledWith(QUIZ_ID, HOST_ID);
      expect(result).toEqual(mockQuestion);
    });

    it('throws NotFoundException when the question does not exist', async () => {
      questionRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(QUIZ_ID, QUESTION_ID, HOST_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    beforeEach(() => {
      questionRepo.findOne.mockResolvedValue(mockQuestion);
    });

    it('updates the question and returns the saved result', async () => {
      const result = await service.update(QUIZ_ID, QUESTION_ID, HOST_ID, { text: 'New text?' });

      expect(questionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'New text?' }),
      );
      expect(result.text).toBe('New text?');
    });

    it('case 1: throws BadRequestException when both options and index are supplied and index is out of range', async () => {
      await expect(
        service.update(QUIZ_ID, QUESTION_ID, HOST_ID, {
          options: [{ label: 'A', text: 'A' }] as any,
          correctOptionIndex: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('case 2: throws BadRequestException when only index changes and it exceeds stored options length', async () => {
      // mockQuestion.options has 2 items; index 2 is out of range
      await expect(
        service.update(QUIZ_ID, QUESTION_ID, HOST_ID, { correctOptionIndex: 2 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('case 3: throws BadRequestException when only options shrink and stored index becomes out of range', async () => {
      // mockQuestion.correctOptionIndex = 0, but let's test with a stored index of 1
      questionRepo.findOne.mockResolvedValue({ ...mockQuestion, correctOptionIndex: 1 });

      await expect(
        service.update(QUIZ_ID, QUESTION_ID, HOST_ID, {
          // shrink to 1 option — stored index 1 is now out of range
          options: [{ label: 'A', text: 'Only A' }] as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reorder', () => {
    it('verifies ownership and updates all items in a transaction', async () => {
      const items: ReorderItemDto[] = [
        { id: QUESTION_ID, orderIndex: 1 },
        { id: 'other-question-id', orderIndex: 0 },
      ];

      await service.reorder(QUIZ_ID, HOST_ID, items);

      expect(quizzesService.findOneOrFail).toHaveBeenCalledWith(QUIZ_ID, HOST_ID);
      expect(questionRepo.manager.transaction).toHaveBeenCalled();
    });
  });
});
