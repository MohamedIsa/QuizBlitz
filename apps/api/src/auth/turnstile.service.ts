import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TurnstileService {
  constructor(private readonly config: ConfigService) {}

  async verify(token: string, ip?: string): Promise<void> {
    const body: Record<string, string> = {
      secret: this.config.getOrThrow<string>('TURNSTILE_SECRET_KEY'),
      response: token,
    };
    if (ip) body.remoteip = ip;

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json() as { success: boolean };
    if (!data.success) throw new BadRequestException('Turnstile verification failed');
  }
}
