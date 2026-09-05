import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { cancellationEmail, confirmationEmail } from './email-templates';

@Injectable()
export class EmailService {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  async sendConfirmation(data: {
    toEmail: string;
    toName: string;
    clinicName: string;
    petName: string;
    reason: string;
    slotStart: Date;
    slotEnd: Date;
    timeZoneId: string;
    appointmentId: string;
  }) {
    const html = confirmationEmail(data);
    await this.send(
      data.toEmail,
      data.toName,
      `Confirmed: ${data.petName}'s appointment at ${data.clinicName}`,
      html,
    );
  }

  async sendCancellation(data: {
    toEmail: string;
    toName: string;
    clinicName: string;
    petName: string;
    slotStart: Date;
    timeZoneId: string;
  }) {
    const html = cancellationEmail(data);
    await this.send(
      data.toEmail,
      data.toName,
      `Cancelled: ${data.petName}'s appointment at ${data.clinicName}`,
      html,
    );
  }

  private async send(to: string, toName: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME ?? 'SchedulingWL'}" <${process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USERNAME}>`,
        to: `"${toName}" <${to}>`,
        subject,
        html,
      });
    } catch {
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
