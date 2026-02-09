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
      html: '<div>\
<p style="margin:0 0 12px;">Hi 👋</p>\
<p style="margin:0 0 12px;">Thank you for your purchase!</p>\
<p style="margin:0 0 16px;">Your <strong>100,000+ STL File Collection</strong> is ready.</p>\
<p style="margin:0 0 10px;"><strong>📦 How to access your files:</strong></p>\
<p style="margin:0 0 12px;">You have two ways to access your STL files:</p>\
<p style="margin:0 0 6px;"><strong>1️⃣ Spreadsheet (recommended)</strong></p>\
<p style="margin:0 0 10px;">For the best experience, use the included spreadsheet:</p>\
<ul style="margin:0 0 14px 20px;padding:0;">\
<li>Visual previews of models</li>\
<li>Well-organized categories</li>\
<li>Direct download links</li>\
<li>Covers almost everything included in the PDF files</li>\
<li>Fast and easy navigation through the collection</li>\
</ul>\
<div style="margin:10px 0 12px;">\
<a href="https://docs.google.com/spreadsheets/d/1Cn8RV66XRYsUa8HBqOUezO5sFxh8oO8ntSVL4KzdQig/edit?usp=sharing" style="display:inline-block;padding:12px 16px;background:#0b0f17;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">Open the Spreadsheet</a>\
</div>\
<p style="margin:0 0 16px;">Or open it here:<br />\
<a href="https://docs.google.com/spreadsheets/d/1Cn8RV66XRYsUa8HBqOUezO5sFxh8oO8ntSVL4KzdQig/edit?usp=sharing" style="color:#1155cc;text-decoration:underline;word-break:break-word;">https://docs.google.com/spreadsheets/d/1Cn8RV66XRYsUa8HBqOUezO5sFxh8oO8ntSVL4KzdQig/edit?usp=sharing</a>\
</p>\
<p style="margin:0 0 6px;"><strong>2️⃣ PDF files (backup option)</strong></p>\
<p style="margin:0 0 10px;">You’ll also find attached PDF files:</p>\
<ul style="margin:0 0 16px 20px;padding:0;">\
<li>Each PDF contains direct download links</li>\
<li>Includes a large portion of the collection</li>\
<li>Useful as a backup or alternative access method</li>\
</ul>\
<p style="margin:0 0 10px;"><strong>⚠️ Important notes:</strong></p>\
<ul style="margin:0 0 16px 20px;padding:0;">\
<li>This is a digital product (no physical shipment)</li>\
<li>Make sure you have enough storage space before downloading</li>\
<li>Lifetime access, including future updates</li>\
<li>If any link ever stops working, just reply to this email</li>\
</ul>\
<p style="margin:0 0 4px;">Enjoy printing 🚀</p>\
<p style="margin:0;">— STL Planet</p>\
</div>',
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
