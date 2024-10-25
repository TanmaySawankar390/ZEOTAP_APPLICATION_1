# 3 Tier Rule Engine With AST 

This project is a Rule Engine with AST using Node.js, Express, and PostgreSQL for managing and evaluating conditional rules. It includes endpoints for creating, combining, and evaluating rules against input data.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Setup](#database-setup)
4. [Running the Application](#running-the-application)
5. [API Endpoints](#api-endpoints)
6. [Additional Notes](#additional-notes)

---

### Prerequisites

Ensure the following tools are installed on your system:

- **Node.js** (v14+)
- **PostgreSQL** (v13+)
- **pgAdmin** (for database management)
- **Git**

### Project Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/TanmaySawankar390/ZEOTAP_APPLICATION_1.git
   cd ZEOTAP_APPLICATION_1

2. **Install Dependencies**

   ```bash
   npm install
   npm install express body-parser dotenv pg

3. **Environment Variables**
   Create a .env file in the root directory of your project and add the following environment variables:
   ```bash
   DB_USER=<your-postgresql-username>
   DB_PASSWORD=<your-postgresql-password>
   DB_HOST=localhost
   DB_DATABASE=rule_engine
   DB_PORT=5432
   PORT=3000
   
### DataBase Setup
If you are new to PostgreSQL read the documentation(https://www.postgresql.org/) for installing Postgres on local system.

Create a New Database:
1. Open pgAdmin and connect to your PostgreSQL instance.
   Right-click on "Databases" and select "Create" > "Database…"
   Name your database as specified in .env (rule_engine in this example).
2. Run Database Migrations:
   After creating the database, you’ll need to set up the necessary table structure.
   Open your SQL editor in pgAdmin, connect to the rule_engine database, and run the following SQL to create the rules table:

   ```sql
   CREATE TABLE rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rule_string TEXT NOT NULL,
    ast JSONB NOT NULL
   );
   ```
### Running the Application

1. Start the Server:
```bash
node index.js
```
2. Testing the Server
   Open your browser or use a tool like Postman to test the server or reach live server at http://localhost:3000.
 
### API Endpoints

This document provides an overview of the API endpoints available in the Rule Engine API.

1. Create a New Rule:
   **Method:** `POST`  
   **Endpoint:** `/create_rule`  
   **Description:** Creates a new rule with the provided rule string.  

Request Body

```plaintext
age > 18
```
```plaintext
salary > 65000
```

2. Combine Multiple Rules:
   **Method:** `POST`  
   **Endpoint:** `/combine_rules`  
   **Description:** Combines multiple rules using a logical operator (AND, OR).  

Request Body
```plaintext RULEID:
    1,2
```

```plaintext LOGICAL OPERATION AND || OR:
operator: "AND"
```

3. Evaluate Rule:
   **Method:** `POST`  
   **Endpoint:** `/evaluate_rule`  
   **Description:** Evaluates a rule against input data.  

Request Body
```plaintext RULEID:
    1,2
```
```json
{
  "age": 20,
  "salary":70000
}
```
4. Get All Rules:
   **Method:** `GET`  
   **Endpoint:** `/rules`  
   **Description:** Retrieves all rules stored in the database.

Click on Button: ""FETCH ALL RULES"
---
### Additional Notes
- Customize the `PORT` or database configurations in the `.env` file as needed.
- Review the `ruleEngineController.js` for specific logic on AST creation, rule combination, and evaluation.
