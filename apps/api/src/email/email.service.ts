import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'));
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    const from = this.config.getOrThrow<string>('FROM_EMAIL');
    const { error } = await this.resend.emails.send({
      from,
      to,
      subject: 'Your QuizBlitz password reset code',
      html: `<p>Your code is: <strong>${otp}</strong></p><p>Expires in 15 minutes.</p>`,
    });
    if (error) {
      this.logger.error(`OTP email delivery failed to ${to}: ${error.message}`);
      throw new Error('Failed to send OTP email');
    }
    this.logger.log(`Password reset OTP email sent to: ${to}`);
  }
}
