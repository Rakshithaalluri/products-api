const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');
const path = require('path');

const app = express();
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./products.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        createTable();
    }
});

// Create products table if it doesn't exist
function createTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            quality INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.run(sql, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Products table ready');
        }
    });
}

// Validation middleware for product objects
const validateProducts = [
    body('products').isArray().withMessage('Products must be an array'),
    body('products.*.name').trim().isString().notEmpty().withMessage('Product name is required'),
    body('products.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('products.*.quality').isInt({ min: 1, max: 10 }).withMessage('Quality must be between 1 and 10')
];

// Calculate total value endpoint
app.post('/api/calculate-value', validateProducts, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const { products } = req.body;

        // Calculate total value
        const totalValue = products.reduce((sum, product) => {
            return sum + (product.price * product.quality);
        }, 0);

        // Store products in database
        const insertPromises = products.map(product => {
            return new Promise((resolve, reject) => {
                const sql = `
                    INSERT INTO products (name, price, quality)
                    VALUES (?, ?, ?)
                `;
                
                db.run(sql, [product.name, product.price, product.quality], function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });
        });

        await Promise.all(insertPromises);

        // Return response
        res.json({
            status: 'success',
            data: {
                total_value: parseFloat(totalValue.toFixed(2)),
                product_count: products.length,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Get calculation history
app.get('/api/history', async (req, res) => {
    try {
        const sql = `
            SELECT name, price, quality, created_at
            FROM products
            ORDER BY created_at DESC
            LIMIT 100
        `;

        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            
            res.json({
                status: 'success',
                data: {
                    history: rows,
                    count: rows.length
                }
            });
        });

    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something broke!'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes