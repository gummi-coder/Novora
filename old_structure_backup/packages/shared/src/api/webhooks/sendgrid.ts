import { Router } from 'express';
import { EmailService } from '../../services/email-service';
import { logger } from '../../utils/logger';
import { config } from '../../config';

const router = Router();
const emailService = EmailService.getInstance();

router.post('/sendgrid/webhook', async (req, res) => {
  try {
    const events = req.body;

    for (const event of events) {
      const { email, event: eventType, sg_message_id, timestamp } = event;

      switch (eventType) {
        case 'delivered':
          await emailService.handleDelivery(email, sg_message_id, timestamp);
          break;

        case 'open':
          await emailService.handleOpen(email, sg_message_id, timestamp);
          break;

        case 'click':
          await emailService.handleClick(
            email,
            sg_message_id,
            event.url,
            timestamp
          );
          break;

        case 'bounce':
          await emailService.handleBounce(
            email,
            sg_message_id,
            event.reason,
            timestamp
          );
          break;

        case 'spamreport':
          await emailService.handleSpamReport(email, sg_message_id, timestamp);
          break;

        case 'unsubscribe':
          await emailService.handleUnsubscribe(email, sg_message_id, timestamp);
          break;

        default:
          logger.warn(`Unhandled SendGrid event type: ${eventType}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error processing SendGrid webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router; 