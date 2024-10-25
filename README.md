## Project: Product API Backend

## Overview
This project is a Node.js and Express-based API that performs calculations on product data and stores calculation history in an SQLite database. It has two main functionalities:
- Calculate the total value of products based on price and quality.
- Retrieve the calculation history of products.

## Features
- **Calculate Total Value**: POST endpoint to calculate the total value of products.
- **Validation**: Ensures product data (name, price, and quality) is valid before processing.
- **Database Storage**: Stores each product entry in an SQLite database.
- **History Retrieval**: Retrieves the last 100 product entries from the database.

## Prerequisites
- **Node.js**: Ensure Node.js is installed on your system.
- **SQLite**: SQLite is used as the database.

## Installation
### Step 1: Clone this repository:
   git clone <repository-url>
   
## Step 2: Navigate into the Project Directory
cd <project-directory>

## Step 3: Install Dependencies
npm install

## Database Setup
The API uses an SQLite database (products.db). When the server starts, it creates a products table if it doesn't already exist.

## API Endpoints
### POST /api/calculate-value
Description: Calculates the total value of products.
Request Body

{
    "products": [
        { "name": "Product 1", "price": 10.99, "quality": 5 },
        { "name": "Product 2", "price": 20.50, "quality": 8 }
    ]
}

### Response:
Success:
{
    "status": "success",
    "data": {
        "total_value": 219.45,
        "product_count": 2,
        "timestamp": "2024-10-24T12:00:00.000Z"
    }
}

### Validation Error:
{
    "status": "error",
    "errors": [
        { "msg": "Product name is required", "param": "products[0].name" }
    ]
}

## GET /api/history
## Description: Retrieves the last 100 product entries with details.
Response:
{
    "status": "success",
    "data": {
        "history": [
            { "name": "Product 1", "price": 10.99, "quality": 5, "created_at": "2024-10-24T12:00:00.000Z" },
            { "name": "Product 2", "price": 20.50, "quality": 8, "created_at": "2024-10-24T11:59:00.000Z" }
        ],
        "count": 2
    }
}

