/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for 465
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  async sendEmail(customerEmail: string) {
    const assetsDir = path.join(process.cwd(), 'assets');

    // Send order email to customer
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM!,
      to: customerEmail,
      subject: 'Order - STL Planet',
      html: '<p><span style="color: rgb(51, 51, 51);">Hi 👋</span></p><p><span style="color: rgb(51, 51, 51);">Thank you for your purchase!</span></p><p><span style="color: rgb(51, 51, 51);">Your </span><strong style="color: rgb(51, 51, 51);">100,000+ STL File Collection</strong><span style="color: rgb(51, 51, 51);"> is ready.</span></p><p><span style="color: rgb(51, 51, 51);">📦 </span><strong style="color: rgb(51, 51, 51);">How to access your files:</strong></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(51, 51, 51);">Download and open the </span><strong style="color: rgb(51, 51, 51);">attached PDF files</strong></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(51, 51, 51);">Inside each PDF you’ll find </span><strong style="color: rgb(51, 51, 51);">direct download links</strong><span style="color: rgb(51, 51, 51);"> to the STL files</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(51, 51, 51);">You’ll have </span><strong style="color: rgb(51, 51, 51);">lifetime access</strong><span style="color: rgb(51, 51, 51);">, including future updates</span></li></ol><p><span style="color: rgb(51, 51, 51);">⚠️ Important notes:</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(51, 51, 51);">Files are digital (no physical shipment)</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(51, 51, 51);">Make sure you have enough storage space before downloading</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(51, 51, 51);">If a link ever stops working, just reply to this email</span></li></ol><p><span style="color: rgb(51, 51, 51);">If you have any questions or need help, I’m here to help.</span></p><p><span style="color: rgb(51, 51, 51);">Enjoy printing 🚀</span></p><p><span style="color: rgb(51, 51, 51);">— STL Planet</span></p><p><br></p>',
      attachments: [
        {
          filename: 'STLULTIMATEPACK1.pdf',
          path: path.join(assetsDir, 'STLULTIMATEPACK1.pdf'),
        },
        {
          filename: 'FLEXIFILES.pdf',
          path: path.join(assetsDir, 'FLEXIFILES.pdf'),
        },
        {
          filename: 'ChristmasSTlBundle.pdf',
          path: path.join(assetsDir, 'ChristmasSTlBundle.pdf'),
        },
      ],
    });

    // Send notification to yourself
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM!,
      to: process.env.MY_EMAIL!,
      subject: '✅ Order Delivered',
      html: `<p>Order was successfully delivered to <strong>${customerEmail}</strong></p>`,
    });
  }
}
