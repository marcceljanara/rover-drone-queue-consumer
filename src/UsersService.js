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
            text: `SELECT * FROM payments WHERE id = $1`,
            values: [id],
        }
        const result = await this._pool.query(query);
        return result.rows[0];
    }
}

export default UsersService;