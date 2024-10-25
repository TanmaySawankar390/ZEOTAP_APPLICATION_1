// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const pg = require('pg');
const { createRule, combineRules, evaluateAST } = require('./ruleEngineController');
const app = express();

// Middleware setup
// Parses incoming requests with URL-encoded payloads and JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serves static files from the 'public' directory
app.use(express.static('public'));

// PostgreSQL pool connection setup using environment variables
const pool = new pg.Pool({
  user: process.env.DB_USER,       // Database username
  host: process.env.DB_HOST,       // Database host
  database: process.env.DB_DATABASE, // Database name
  password: process.env.DB_PASSWORD, // Database password
  port: process.env.DB_PORT,         // Database port
});

// Test connection to PostgreSQL database
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL database.');
  }
});

// Serve the homepage (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all rules from the database
app.get('/rules', async (req, res) => {
    try {
        const query = 'SELECT * FROM rules';  // SQL query to select all rules
        const result = await pool.query(query);
        res.json(result.rows); // Return rules as JSON response
    } catch (err) {
        console.error('Error fetching rules:', err);
        res.status(500).json({ error: 'Failed to fetch rules' });
    }
});

// Create a new rule and save it to the database
app.post('/create_rule', async (req, res) => {
    const ruleString = req.body.rule_string;

    // Ensure rule_string is provided
    if (!ruleString) {
        return res.status(400).json({ error: 'rule_string is required' });
    }

    try {
        // Generate AST (Abstract Syntax Tree) for the rule
        const ast = createRule(ruleString);
        console.log('Generated AST:', JSON.stringify(ast));

        // Insert the rule into the database
        const query = `
            INSERT INTO rules (name, rule_string, ast)
            VALUES ($1, $2, $3) RETURNING *;
        `;
        const values = ['Rule 1', ruleString, ast];
        const result = await pool.query(query, values);

        // Redirect to homepage with success indicator
        res.redirect('/?created=true');
    } catch (err) {
        console.error('Error inserting rule:', err);
        res.status(500).json({ error: 'Failed to create rule' });
    }
});

// Combine multiple rules based on specified operator
app.post('/combine_rules', async (req, res) => {
    const { rule_ids, operator } = req.body;

    // Validate input: ensure there are at least two rule IDs and an operator
    if (!rule_ids || rule_ids.length < 2 || !operator) {
        return res.status(400).json({ error: 'Please provide at least two rule IDs and an operator.' });
    }

    try {
        // Format rule_ids as a PostgreSQL array
        const formattedRuleIds = `{${rule_ids.split(',').map(id => parseInt(id.trim())).join(',')}}`;

        // Fetch the ASTs of specified rules
        const query = `SELECT ast FROM rules WHERE id = ANY($1::int[])`;
        const result = await pool.query(query, [formattedRuleIds]);

        // Combine the fetched ASTs using the specified operator
        const ruleASTs = result.rows.map(row => row.ast);
        const combinedAST = combineRules(ruleASTs, operator);

        // Insert the combined rule into the database
        const insertQuery = `
            INSERT INTO rules (name, rule_string, ast)
            VALUES ($1, $2, $3) RETURNING *;
        `;
        const insertValues = [`Combined Rule`, `Combined rule of IDs ${rule_ids}`, combinedAST];
        await pool.query(insertQuery, insertValues);

        // Redirect to homepage with success indicator
        res.redirect('/?combined=true');
    } catch (err) {
        console.error('Error combining rules:', err);
        res.status(500).json({ error: 'Failed to combine rules' });
    }
});

// Evaluate a specific rule using given data
app.post('/evaluate_rule', async (req, res) => {
    const { rule_id, json_data } = req.body;

    // Validate input: ensure rule ID and JSON data are provided
    if (!rule_id || !json_data) {
        return res.status(400).json({ error: 'rule_id and json_data are required' });
    }

    try {
        // Retrieve the AST of the specified rule from the database
        const query = `SELECT ast FROM rules WHERE id = $1`;
        const result = await pool.query(query, [rule_id]);

        // If rule is not found, return a 404 error
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Rule not found" });
        }

        // Parse JSON data and evaluate the AST against it
        const ast = result.rows[0].ast;
        const data = JSON.parse(json_data);
        const evaluationResult = evaluateAST(ast, data);

        // Redirect to homepage with the evaluation result
        res.redirect(`/?result=${evaluationResult}`);
    } catch (err) {
        console.error('Error evaluating rule:', err);
        res.status(500).json({ error: 'Failed to evaluate rule' });
    }
});

// Start the server on the specified port (default to 3000 if not set in environment)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
