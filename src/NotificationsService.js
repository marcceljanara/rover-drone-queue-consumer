import { nanoid } from 'nanoid';
import pkg from 'pg';

const { Pool } = pkg;

class NotificationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addLogNotification({ userId, notificationType, messageContent }) {
    const id = `notification-${nanoid(10)}`;

    const query = {
      text: `INSERT INTO notifications(id, user_id, notification_type, message_content) 
        VALUES($1, $2, $3, $4) RETURNING id`,
      values: [id, userId, notificationType, messageContent],
    };
    const result = await this._pool.query(query);
    return result.rows[0].id;
  }
}

export default NotificationsService;
