export interface ProductEmailConfig {
  project: string;
  subject: string;
  html: string;
  /** Filenames relative to the assets/ directory */
  attachmentFilenames: string[];
}

export interface ProductMetaConfig {
  contentName: string;
  contentCategory: string;
  pixelId?: string;
}

export interface ProductConfig {
  /** Human-readable product name (for logging) */
  name: string;
  email: ProductEmailConfig;
  meta: ProductMetaConfig;
}

// ---------------------------------------------------------------------------
// STL Planet Bundle
// ---------------------------------------------------------------------------
const STL_EMAIL_HTML = `<div>\
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
<p style="margin:0 0 10px;">You'll also find attached PDF files:</p>\
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
</div>`;

// ---------------------------------------------------------------------------
// CNC Bundle
// ---------------------------------------------------------------------------
const CNC_EMAIL_HTML = `<div>\
<p style="margin:0 0 12px;">Hi 👋</p>\
<p style="margin:0 0 12px;">Thank you for your purchase!</p>\
<p style="margin:0 0 16px;">Your <strong>50,000+ CNC Bundle</strong> is ready.</p>\
<p style="margin:0 0 10px;"><strong>📦 How to access your files:</strong></p>\
<p style="margin:0 0 12px;">Please click the button below</p>\
<div style="margin:10px 0 12px;">\
<a href="https://drive.google.com/drive/folders/12cBAAzcIZhcSxvc6JVcvKWwQVGeafWYY"\
style="display:inline-block;padding:12px 16px;background:#0b0f17;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">Open</a>\
</div>\
<p style="margin:0 0 16px;">Or open it here:<br />\
<a href="https://drive.google.com/drive/folders/12cBAAzcIZhcSxvc6JVcvKWwQVGeafWYY" style="color:#1155cc;text-decoration:underline;word-break:break-word;">https://drive.google.com/drive/folders/12cBAAzcIZhcSxvc6JVcvKWwQVGeafWYY</a>\
</p>\
<p style="margin:0 0 10px;"><strong>⚠️ Important notes:</strong></p>\
<ul style="margin:0 0 16px 20px;padding:0;">\
<li>This is a digital product (no physical shipment)</li>\
<li>Make sure you have enough storage space before downloading</li>\
<li>Lifetime access, including future updates</li>\
<li>If any link ever stops working, just reply to this email</li>\
</ul>\
<p style="margin:0 0 4px;">Enjoy printing 🚀</p>\
<p style="margin:0;">— STL Planet</p>\
</div>`;

// ---------------------------------------------------------------------------
// Registry: add new products here by mapping their payment link env var value
// to a ProductConfig. The lookup key is the raw payment link ID (plink_...).
// ---------------------------------------------------------------------------
function buildRegistry(): Record<string, ProductConfig> {
  const registry: Record<string, ProductConfig> = {};

  if (process.env.STL_LINK) {
    registry[process.env.STL_LINK] = {
      name: 'STL Planet Bundle',
      email: {
        project: 'STL Bundle',
        subject: 'Order - STL Planet',
        html: STL_EMAIL_HTML,
        attachmentFilenames: [
          'STLULTIMATEPACK1.pdf',
          'FLEXIFILES.pdf',
          'ChristmasSTlBundle.pdf',
        ],
      },
      meta: {
        contentName: 'STL Planet Bundle',
        contentCategory: '3D Printing',
        pixelId: process.env.STL_PIXEL_ID,
      },
    };
  }

  if (process.env.CNC_LINK) {
    registry[process.env.CNC_LINK] = {
      name: 'CNC Bundle',
      email: {
        project: 'CNC Bundle',
        subject: 'Order - STL Planet',
        html: CNC_EMAIL_HTML,
        attachmentFilenames: [
          // TODO: add CNC-specific PDF filenames here
        ],
      },
      meta: {
        contentName: 'CNC Bundle',
        contentCategory: 'CNC',
        pixelId: process.env.STL_PIXEL_ID, // Because its same with STL
      },
    };
  }

  return registry;
}

let _registry: Record<string, ProductConfig> | null = null;

/** Returns the config for a given payment link ID, or null if unknown. */
export function getProductConfig(paymentLinkId: string): ProductConfig | null {
  if (!_registry) {
    _registry = buildRegistry();
  }
  return _registry[paymentLinkId] ?? null;
}
