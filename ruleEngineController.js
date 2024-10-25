// ASTNode class for representing nodes in an Abstract Syntax Tree (AST)
class ASTNode {
    constructor(type, condition = null, left = null, right = null, operator = null) {
        this.type = type;          // "Rule" or "CombinedRule"
        this.condition = condition; // Condition object for "Rule" nodes
        this.left = left;           // Left operand for combined rules
        this.right = right;         // Right operand for combined rules
        this.operator = operator;   // Logical operator for "CombinedRule" nodes
    }
}

// Creates an AST from a rule string
const createRule = (ruleString) => {
    const tokens = ruleString.split(/\s+/);
    const field = tokens.shift(), operator = tokens.shift(), value = tokens.shift();
    const condition = { field, operator, value };
    return new ASTNode('Rule', condition);
};

// Combines multiple rule ASTs into a single combined AST with a specified logical operator
const combineRules = (ruleASTs, operator = 'AND') => {
    return ruleASTs.reduce((acc, ruleAST) => new ASTNode('CombinedRule', null, acc, ruleAST, operator));
};

// Evaluates an AST against data
const evaluateAST = (node, data) => {
    if (node.type === 'Rule') {
        const { field, operator, value } = node.condition;
        switch (operator) {
            case '>': return data[field] > parseInt(value);
            case '<': return data[field] < parseInt(value);
            case '=': return data[field] === value;
            default: return false;
        }
    } else if (node.type === 'CombinedRule') {
        const leftResult = evaluateAST(node.left, data), rightResult = evaluateAST(node.right, data);
        return node.operator === 'AND' ? leftResult && rightResult : leftResult || rightResult;
    }
    return false;
};

// Export modules
module.exports = { createRule, combineRules, evaluateAST };
