import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend?: Resend;
  private readonly transporter?: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    const resendKey = config.get<string>('RESEND_API_KEY');
    if (resendKey) {
      this.resend = new Resend(resendKey);
    }

    const smtpHost = config.get<string>('SMTP_HOST');
    if (smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: config.get<number>('SMTP_PORT') ?? 1025,
        secure: false,
        ignoreTLS: true,
      });
    }
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    const from = this.config.getOrThrow<string>('FROM_EMAIL');
    const subject = 'Your QuizBlitz password reset code';
    const html = `<p>Your code is: <strong>${otp}</strong></p><p>Expires in 15 minutes.</p>`;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, html });
        this.logger.log(`OTP email sent via SMTP to: ${to}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`OTP email delivery failed to ${to}: ${message}`);
        throw new Error('Failed to send OTP email');
      }
      return;
    }

    if (!this.resend) {
      throw new Error('No email transport configured: set SMTP_HOST or RESEND_API_KEY');
    }

    const { error } = await this.resend.emails.send({ from, to, subject, html });
    if (error) {
      this.logger.error(`OTP email delivery failed to ${to}: ${error.message}`);
      throw new Error('Failed to send OTP email');
    }
    this.logger.log(`Password reset OTP email sent to: ${to}`);
  }
}
