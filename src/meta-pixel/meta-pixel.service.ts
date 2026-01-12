/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import * as bizSdk from 'facebook-nodejs-business-sdk';
import * as crypto from 'crypto';

const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const CustomData = bizSdk.CustomData;

interface PurchaseData {
  email: string;
  amount: number;
  currency: string;
  orderId: string;
  eventSourceUrl?: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class MetaPixelService {
  private readonly logger = new Logger(MetaPixelService.name);
  private readonly processedEvents = new Set<string>();
  private readonly isTestMode: boolean;

  constructor() {
    // Enable test mode if TEST_MODE env var is set to 'true'
    this.isTestMode = process.env.TEST_MODE === 'true';

    if (this.isTestMode) {
      this.logger.warn(
        '⚠️ Meta Pixel is running in TEST MODE - events will be marked as test events',
      );
    }
  }

  /**
   * Send a purchase event to Meta Pixel
   * @param data Purchase event data
   * @returns Promise<boolean> Returns true if event was sent, false if duplicate
   */
  async sendPurchaseEvent(data: PurchaseData): Promise<boolean> {
    try {
      // Check for duplicate
      if (this.isDuplicate(data.orderId)) {
        this.logger.warn(`Duplicate event detected for order: ${data.orderId}`);
        return false;
      }

      // Validate required environment variables
      if (!process.env.META_PIXEL_ID || !process.env.META_ACCESS_TOKEN) {
        this.logger.error(
          'Missing META_PIXEL_ID or META_ACCESS_TOKEN environment variables',
        );
        return false;
      }

      // Initialize Meta Pixel API
      bizSdk.FacebookAdsApi.init(process.env.META_ACCESS_TOKEN);
      const pixelId = process.env.META_PIXEL_ID;
      const accessToken = process.env.META_ACCESS_TOKEN;

      // Hash email for privacy
      const hashedEmail = this.hashData(data.email);

      // Create user data
      const userData = new UserData()
        .setEmails([hashedEmail])
        .setClientIpAddress(data.ipAddress)
        .setClientUserAgent(data.userAgent);

      // Create custom data with purchase details
      const customData = new CustomData()
        .setValue(data.amount)
        .setCurrency(data.currency)
        .setOrderId(data.orderId);

      // Create server event
      const serverEvent = new ServerEvent()
        .setEventName('Purchase')
        .setEventId(data.orderId) // Critical for Meta deduplication
        .setEventTime(Math.floor(Date.now() / 1000))
        .setUserData(userData)
        .setCustomData(customData)
        .setEventSourceUrl(data.eventSourceUrl || 'https://your-domain.com')
        .setActionSource('website');

      // Add test event code if in test mode
      if (this.isTestMode && process.env.META_TEST_EVENT_CODE) {
        this.logger.log(`Sending TEST event for order: ${data.orderId}`);
      }

      // Create event request
      const eventsData = [serverEvent];
      const eventRequest = new EventRequest(accessToken, pixelId).setEvents(
        eventsData,
      );

      // Add test event code if available
      if (this.isTestMode && process.env.META_TEST_EVENT_CODE) {
        eventRequest.setTestEventCode(process.env.META_TEST_EVENT_CODE);
      }

      // Send the event
      const response = await eventRequest.execute();

      // Mark as processed
      this.markAsProcessed(data.orderId);

      this.logger.log(
        `✅ ${this.isTestMode ? 'TEST ' : ''}Purchase event sent for order: ${data.orderId}, Amount: ${data.currency} ${data.amount}`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send purchase event: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Hash data using SHA256 for privacy
   */
  private hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data.toLowerCase().trim())
      .digest('hex');
  }

  /**
   * Check if an order ID has already been processed
   */
  private isDuplicate(orderId: string): boolean {
    return this.processedEvents.has(orderId);
  }

  /**
   * Mark an order as processed
   */
  private markAsProcessed(orderId: string): void {
    this.processedEvents.add(orderId);

    // Clean up old entries after 24 hours to prevent memory leak
    setTimeout(
      () => {
        this.processedEvents.delete(orderId);
      },
      24 * 60 * 60 * 1000,
    );
  }

  /**
   * Clear all processed events (useful for testing)
   */
  clearProcessedEvents(): void {
    this.processedEvents.clear();
    this.logger.log('Cleared all processed events');
  }
}
