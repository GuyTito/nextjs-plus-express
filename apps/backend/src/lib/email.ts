import { Resend } from "resend";
import { resendApiKey, resendFromEmail } from "./constants";

export interface EmailService {
  send(to: string, subject: string, html: string, text?: string): Promise<void>;
}

export class ResendEmailService implements EmailService {
  private client = new Resend(resendApiKey);

  async send(to: string, subject: string, html: string, text?: string) {
    const { error } = await this.client.emails.send({
      from: resendFromEmail,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }
  }
}

export const emailService = new ResendEmailService();
