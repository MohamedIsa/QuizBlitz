import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReorderQuestionsDto } from './dto/reorder-questions.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionsService } from './questions.service';

@ApiTags('Questions')
@ApiBearerAuth()
@Controller('quizzes/:quizId/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a question to a quiz' })
  @ApiCreatedResponse({ description: 'Question created' })
  create(
    @CurrentUser() user: UserPayload,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionsService.create(quizId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all questions in a quiz, ordered by orderIndex' })
  @ApiOkResponse({ description: 'Question list' })
  findAll(
    @CurrentUser() user: UserPayload,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.questionsService.findAll(quizId, user.id);
  }

  // /reorder must be declared BEFORE /:id — ParseUUIDPipe on /:id routes also
  // guards against 'reorder' reaching the wrong handler if order is ever swapped.
  @Patch('reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder questions atomically' })
  @ApiOkResponse({ description: 'Questions reordered' })
  reorder(
    @CurrentUser() user: UserPayload,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: ReorderQuestionsDto,
  ) {
    return this.questionsService.reorder(quizId, user.id, dto.questions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single question' })
  @ApiOkResponse({ description: 'Question detail' })
  findOne(
    @CurrentUser() user: UserPayload,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionsService.findOne(quizId, id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a question' })
  @ApiOkResponse({ description: 'Updated question' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(quizId, id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a question' })
  @ApiNoContentResponse({ description: 'Question deleted' })
  remove(
    @CurrentUser() user: UserPayload,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.questionsService.remove(quizId, id, user.id);
  }
}
