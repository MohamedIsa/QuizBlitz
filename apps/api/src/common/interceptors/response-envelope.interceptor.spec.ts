import { of } from 'rxjs';
import { ResponseEnvelopeInterceptor } from './response-envelope.interceptor';

describe('ResponseEnvelopeInterceptor', () => {
  let interceptor: ResponseEnvelopeInterceptor;

  beforeEach(() => {
    interceptor = new ResponseEnvelopeInterceptor();
  });

  it('wraps object data in the success envelope', (done) => {
    const handler = { handle: () => of({ id: '123', title: 'Test Quiz' }) };

    interceptor.intercept({} as any, handler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: { id: '123', title: 'Test Quiz' },
      });
      done();
    });
  });

  it('wraps null data correctly', (done) => {
    const handler = { handle: () => of(null) };

    interceptor.intercept({} as any, handler).subscribe((result) => {
      expect(result).toEqual({ success: true, data: null });
      done();
    });
  });

  it('wraps a primitive value correctly', (done) => {
    const handler = { handle: () => of(42) };

    interceptor.intercept({} as any, handler).subscribe((result) => {
      expect(result).toEqual({ success: true, data: 42 });
      done();
    });
  });
});
