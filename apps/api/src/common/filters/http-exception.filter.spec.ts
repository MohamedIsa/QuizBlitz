import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: object;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({ url: '/test-path' }),
      }),
    };
  });

  it('formats a string-message exception', () => {
    filter.catch(new NotFoundException('Quiz not found'), mockHost as any);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        message: 'Quiz not found',
        path: '/test-path',
      }),
    );
  });

  it('joins an array of validation messages into a single string', () => {
    filter.catch(
      new BadRequestException(['name must be a string', 'email must be an email']),
      mockHost as any,
    );

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        message: 'name must be a string, email must be an email',
      }),
    );
  });

  it('includes a timestamp in ISO format', () => {
    filter.catch(new NotFoundException('not found'), mockHost as any);

    const payload = mockJson.mock.calls[0][0] as { timestamp: string };
    expect(() => new Date(payload.timestamp)).not.toThrow();
    expect(payload.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
