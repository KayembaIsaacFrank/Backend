const mysql = require('mysql2/promise');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    // Connect without specifying database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Sanitize DB name (remove quotes/backticks) and wrap in backticks for identifiers
    const rawDbName = process.env.DB_NAME || '';
    const dbName = rawDbName.replace(/[`"']/g, '');

    // Create database if it doesn't exist (supports spaces via backticks)
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log('Database created or already exists');

    // Close and reconnect targeting the specific database (avoid USE with prepared statements)
    await connection.end();
    const dbConn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
    });

    // Create tables
    const tables = [
      // Branches table
      `CREATE TABLE IF NOT EXISTS branches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Users table (CEO, Managers, Sales Agents)
      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(15),
        role ENUM('CEO', 'Manager', 'Sales Agent') NOT NULL,
        branch_id INT,
        created_by INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (branch_id) REFERENCES branches(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_role_branch (role, branch_id),
        INDEX idx_email (email)
      )`,

      // Produce/Product types
      `CREATE TABLE IF NOT EXISTS produce (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Buyers table
      `CREATE TABLE IF NOT EXISTS buyers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15),
        email VARCHAR(100),
        location VARCHAR(255),
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_created_by (created_by)
      )`,

      // Dealers/Suppliers
      `CREATE TABLE IF NOT EXISTS dealers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15),
        email VARCHAR(100),
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Procurement records
      `CREATE TABLE IF NOT EXISTS procurement (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        produce_id INT NOT NULL,
        dealer_id INT,
        dealer_name VARCHAR(100),
        dealer_phone VARCHAR(15),
        tonnage DECIMAL(10, 2) NOT NULL,
        cost_per_ton DECIMAL(10, 2) NOT NULL,
        total_cost DECIMAL(12, 2) NOT NULL,
        selling_price_per_ton DECIMAL(10, 2) NOT NULL,
        created_by INT NOT NULL,
        procurement_date DATE NOT NULL,
        procurement_time TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (branch_id) REFERENCES branches(id),
        FOREIGN KEY (produce_id) REFERENCES produce(id),
        FOREIGN KEY (dealer_id) REFERENCES dealers(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_branch_date (branch_id, procurement_date),
        INDEX idx_produce (produce_id)
      )`,

      // Stock/Inventory
      `CREATE TABLE IF NOT EXISTS stock (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        produce_id INT NOT NULL,
        current_tonnage DECIMAL(10, 2) NOT NULL DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (branch_id) REFERENCES branches(id),
        FOREIGN KEY (produce_id) REFERENCES produce(id),
        UNIQUE KEY unique_branch_produce (branch_id, produce_id),
        INDEX idx_branch (branch_id)
      )`,

      // Sales records
      `CREATE TABLE IF NOT EXISTS sales (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        produce_id INT NOT NULL,
        buyer_id INT,
        buyer_name VARCHAR(100),
        buyer_phone VARCHAR(15),
        tonnage DECIMAL(10, 2) NOT NULL,
        price_per_ton DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        sales_agent_id INT NOT NULL,
        payment_status ENUM('Paid', 'Pending', 'Partial') DEFAULT 'Paid',
        sales_date DATE NOT NULL,
        sales_time TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (branch_id) REFERENCES branches(id),
        FOREIGN KEY (produce_id) REFERENCES produce(id),
        FOREIGN KEY (buyer_id) REFERENCES buyers(id),
        FOREIGN KEY (sales_agent_id) REFERENCES users(id),
        INDEX idx_branch_date (branch_id, sales_date),
        INDEX idx_agent (sales_agent_id),
        INDEX idx_buyer (buyer_id)
      )`,

      // Credit Sales
      `CREATE TABLE IF NOT EXISTS credit_sales (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        buyer_id INT NOT NULL,
        buyer_phone VARCHAR(15),
        buyer_location VARCHAR(255),
        national_id VARCHAR(50),
        produce_id INT NOT NULL,
        tonnage DECIMAL(10, 2) NOT NULL,
        price_per_ton DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        sales_agent_id INT NOT NULL,
        amount_due DECIMAL(12, 2) NOT NULL,
        amount_paid DECIMAL(12, 2) DEFAULT 0,
        due_date DATE NOT NULL,
        status ENUM('Pending', 'Partial', 'Paid', 'Overdue') DEFAULT 'Pending',
        sales_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (branch_id) REFERENCES branches(id),
        FOREIGN KEY (buyer_id) REFERENCES buyers(id),
        FOREIGN KEY (produce_id) REFERENCES produce(id),
        FOREIGN KEY (sales_agent_id) REFERENCES users(id),
        INDEX idx_branch_status (branch_id, status),
        INDEX idx_due_date (due_date)
      )`,

      // Payments for credit sales
      `CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        credit_sale_id INT NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method VARCHAR(50),
        notes TEXT,
        recorded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (credit_sale_id) REFERENCES credit_sales(id),
        FOREIGN KEY (recorded_by) REFERENCES users(id),
        INDEX idx_credit_sale (credit_sale_id)
      )`,
    ];

    // Execute all table creation queries
    for (const table of tables) {
      await dbConn.query(table);
    }

    console.log('All tables created successfully');

    // Insert default produce types

    const { Produce } = require('./models');

    async function initProduce() {
      // Define default produce with required fields: name, type, sellingPrice
      const defaultProduce = [
        { name: 'maize', type: 'cereal', sellingPrice: 0 },
        { name: 'beans', type: 'legume', sellingPrice: 0 },
        { name: 'rice', type: 'cereal', sellingPrice: 0 },
        { name: 'cassava', type: 'root', sellingPrice: 0 },
        { name: 'sorghum', type: 'cereal', sellingPrice: 0 },
        { name: 'millet', type: 'cereal', sellingPrice: 0 },
        { name: 'groundnuts', type: 'legume', sellingPrice: 0 },
        { name: 'soybeans', type: 'legume', sellingPrice: 0 },
        { name: 'sunflower', type: 'oilseed', sellingPrice: 0 },
        { name: 'sesame', type: 'oilseed', sellingPrice: 0 },
        { name: 'cowpeas', type: 'legume', sellingPrice: 0 },
        { name: 'pigeonpeas', type: 'legume', sellingPrice: 0 },
        { name: 'green grams', type: 'legume', sellingPrice: 0 },
        { name: 'sweet potatoes', type: 'root', sellingPrice: 0 },
        { name: 'irish potatoes', type: 'root', sellingPrice: 0 },
        { name: 'wheat', type: 'cereal', sellingPrice: 0 },
        { name: 'barley', type: 'cereal', sellingPrice: 0 },
        { name: 'oats', type: 'cereal', sellingPrice: 0 },
        { name: 'simsim', type: 'oilseed', sellingPrice: 0 },
        { name: 'peas', type: 'legume', sellingPrice: 0 },
        { name: 'lentils', type: 'legume', sellingPrice: 0 },
        { name: 'sugarcane', type: 'other', sellingPrice: 0 },
        { name: 'cotton', type: 'other', sellingPrice: 0 },
        { name: 'coffee', type: 'other', sellingPrice: 0 },
        { name: 'tea', type: 'other', sellingPrice: 0 },
        { name: 'tobacco', type: 'other', sellingPrice: 0 },
        { name: 'bananas', type: 'fruit', sellingPrice: 0 },
        { name: 'matooke', type: 'fruit', sellingPrice: 0 },
        { name: 'pineapples', type: 'fruit', sellingPrice: 0 },
        { name: 'mangoes', type: 'fruit', sellingPrice: 0 },
        { name: 'oranges', type: 'fruit', sellingPrice: 0 },
        { name: 'lemons', type: 'fruit', sellingPrice: 0 },
        { name: 'avocado', type: 'fruit', sellingPrice: 0 },
        { name: 'passion fruits', type: 'fruit', sellingPrice: 0 },
        { name: 'tomatoes', type: 'vegetable', sellingPrice: 0 },
        { name: 'onions', type: 'vegetable', sellingPrice: 0 },
        { name: 'cabbages', type: 'vegetable', sellingPrice: 0 },
        { name: 'carrots', type: 'vegetable', sellingPrice: 0 },
        { name: 'eggplants', type: 'vegetable', sellingPrice: 0 },
        { name: 'okra', type: 'vegetable', sellingPrice: 0 },
        { name: 'pumpkins', type: 'vegetable', sellingPrice: 0 },
        { name: 'watermelons', type: 'fruit', sellingPrice: 0 },
        { name: 'cucumbers', type: 'vegetable', sellingPrice: 0 },
        { name: 'greens', type: 'vegetable', sellingPrice: 0 },
        { name: 'amaranth', type: 'vegetable', sellingPrice: 0 },
        { name: 'sukuma wiki', type: 'vegetable', sellingPrice: 0 },
        { name: 'spinach', type: 'vegetable', sellingPrice: 0 },
        { name: 'dodo', type: 'vegetable', sellingPrice: 0 },
        { name: 'nakati', type: 'vegetable', sellingPrice: 0 },
        { name: 'bitter berries', type: 'vegetable', sellingPrice: 0 },
        { name: 'nsuga', type: 'vegetable', sellingPrice: 0 },
        { name: 'entula', type: 'vegetable', sellingPrice: 0 },
        { name: 'other', type: 'other', sellingPrice: 0 },
      ];

      for (const produce of defaultProduce) {
        await Produce.findOrCreate({
          where: { name: produce.name },
          defaults: {
            type: produce.type,
            sellingPrice: produce.sellingPrice,
          }
        });
      }
      console.log('Default produce types initialized.');
    }


    // Return dbConn for further use
    return dbConn;
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

// Insert default produce types using Sequelize model
const { Produce } = require('./models');

async function initProduce() {
  // Define default produce with required fields: name, type, sellingPrice
  const defaultProduce = [
    { name: 'beans', type: 'beans', sellingPrice: 0 },
    { name: 'grain maize', type: 'grain maize', sellingPrice: 0 },
    { name: 'cowpeas', type: 'cowpeas', sellingPrice: 0 },
    { name: 'groundnuts', type: 'groundnuts', sellingPrice: 0 },
    { name: 'rice', type: 'rice', sellingPrice: 0 },
    { name: 'soybeans', type: 'soybeans', sellingPrice: 0 },
  ];

  for (const produce of defaultProduce) {
    await Produce.findOrCreate({
      where: { name: produce.name },
      defaults: {
        type: produce.type,
        sellingPrice: produce.sellingPrice,
      }
    });
  }
  console.log('Default produce types initialized.');
}

// Main execution
initializeDatabase()
  .then(() => initProduce())
  .then(() => {
    console.log('Database initialization complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error initializing database:', err);
    process.exit(1);
  });
