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
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizzesService } from './quizzes.service';

@ApiTags('Quizzes')
@ApiBearerAuth()
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiCreatedResponse({ description: 'Quiz created' })
  create(@CurrentUser() user: UserPayload, @Body() dto: CreateQuizDto) {
    return this.quizzesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all quizzes owned by the authenticated host' })
  @ApiOkResponse({ description: 'Quiz list' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.quizzesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single quiz by ID (must be owner)' })
  @ApiOkResponse({ description: 'Quiz detail' })
  findOne(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.quizzesService.findOneOrFail(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quiz (must be owner)' })
  @ApiOkResponse({ description: 'Updated quiz' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizzesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a quiz (must be owner)' })
  @ApiNoContentResponse({ description: 'Quiz deleted' })
  remove(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.quizzesService.remove(id, user.id);
  }
}
