import pkg from 'pg';

const { Pool } = pkg;

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async getAllEmailAdmin() {
    const query = {
      text: 'SELECT email FROM users WHERE role = $1',
      values: ['admin'],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getEmailUser(id) {
    const query = {
      text: 'SELECT email FROM users WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows[0].email;
  }

  async getUserId(email) {
    const query = {
      text: 'SELECT id FROM users WHERE email = $1',
      values: [email],
    };
    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async getPaymentById(id) {
    const query = {
      text: 'SELECT * FROM payments WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getUserByShipmentId(id) {
    const query = {
      text: `
      SELECT users.email, users.fullname, users.id
      FROM shipment_orders
      JOIN rentals ON shipment_orders.rental_id = rentals.id
      JOIN users ON rentals.user_id = users.id
      WHERE shipment_orders.id = $1
    `,
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows[0]; // pakai chaining untuk hindari error kalau tidak ada hasil
  }
}

export default UsersService;
