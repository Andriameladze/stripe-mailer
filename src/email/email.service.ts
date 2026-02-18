import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import { ProductEmailConfig } from '../stripe/product-configs';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendEmail(customerEmail: string, config: ProductEmailConfig) {
    const assetsDir = path.join(process.cwd(), 'assets');

    const attachments = config.attachmentFilenames.map((filename) => ({
      filename,
      content: fs.readFileSync(path.join(assetsDir, filename)),
    }));

    await this.resend.emails.send({
      from: process.env.MAIL_FROM!,
      to: customerEmail,
      subject: config.subject,
      html: config.html,
      attachments,
    });

    // Send notification to yourself
    await this.resend.emails.send({
      from: process.env.MAIL_FROM!,
      to: process.env.MY_EMAIL!,
      subject: `✅ Order Delivered — ${config.subject}`,
      html: `<p>Order was successfully delivered to <strong>${customerEmail}</strong></p>`,
    });
  }
}
