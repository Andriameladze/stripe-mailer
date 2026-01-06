import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendEmail(customerEmail: string) {
    const assetsDir = path.join(process.cwd(), 'assets');

    // Read PDF files as base64
    const attachments = [
      {
        filename: 'STLULTIMATEPACK1.pdf',
        content: fs.readFileSync(path.join(assetsDir, 'STLULTIMATEPACK1.pdf')),
      },
      {
        filename: 'FLEXIFILES.pdf',
        content: fs.readFileSync(path.join(assetsDir, 'FLEXIFILES.pdf')),
      },
      {
        filename: 'ChristmasSTlBundle.pdf',
        content: fs.readFileSync(
          path.join(assetsDir, 'ChristmasSTlBundle.pdf'),
        ),
      },
    ];

    await this.resend.emails.send({
      from: process.env.MAIL_FROM!,
      to: customerEmail,
      subject: 'Order - STL Planet',
      html: '<p>Hi 👋</p><div><div><div><div><div><div><p>Thank you for your purchase!</p><p>Your&nbsp;<strong>100,000+ STL File Collection</strong> is ready.</p><p>📦&nbsp;<strong>How to access your files:</strong></p><ul><li><p>Download and open the&nbsp;<strong>attached PDF files</strong></p></li><li><p>Inside each PDF you&rsquo;ll find&nbsp;<strong>direct download links</strong> to the STL files</p></li><li><p>You&rsquo;ll have&nbsp;<strong>lifetime access</strong>, including future updates</p></li></ul><p>⚠️ Important notes:</p><ul><li><p>Files are digital (no physical shipment)</p></li><li><p>Make sure you have enough storage space before downloading</p></li><li><p>If a link ever stops working, just reply to this email</p></li></ul><p>If you have any questions or need help, I&rsquo;m here to help.</p><p>Enjoy printing 🚀<br />&mdash; STL Planet</p></div></div></div></div></div></div>',
      attachments,
    });

    // Send notification to yourself
    await this.resend.emails.send({
      from: process.env.MAIL_FROM!,
      to: process.env.MY_EMAIL!,
      subject: '✅ Order Delivered',
      html: `<p>Order was successfully delivered to <strong>${customerEmail}</strong></p>`,
    });
  }
}
