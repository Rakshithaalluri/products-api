// tests/api.test.js
const request = require('supertest');
const app = require('../server');
const sqlite3 = require('sqlite3').verbose();

describe('Product API Tests', () => {
    beforeAll(() => {
        // Use in-memory database for testing
        db = new sqlite3.Database(':memory:');
    });

    afterAll((done) => {
        db.close(done);
    });

    describe('POST /api/calculate-value', () => {
        it('should calculate total value correctly', async () => {
            const response = await request(app)
                .post('/api/calculate-value')
                .send({
                    products: [
                        { name: "Product 1", price: 10.99, quality: 5 },
                        { name: "Product 2", price: 20.50, quality: 8 }
                    ]
                });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data.total_value).toBe(219.45); // (10.99 * 5) + (20.50 * 8)
        });

        it('should validate product input', async () => {
            const response = await request(app)
                .post('/api/calculate-value')
                .send({
                    products: [
                        { name: "", price: -10, quality: 11 }
                    ]
                });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
            expect(response.body.errors).toHaveLength(3);
        });
    });

    describe('GET /api/history', () => {
        it('should return calculation history', async () => {
            const response = await request(app)
                .get('/api/history');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(Array.isArray(response.body.data.history)).toBe(true);
        });
    });
});
