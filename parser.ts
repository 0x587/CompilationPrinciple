import { operators } from "./constance";
import { Token } from "./types/tokenizer";
import { StatementNode, Operator, ParserStep, VariableDeclarationNode, VariableAssignmentNode, PrintStatementNode, ExpressionNode, IfStatementNode, WhileStatementNode, ForStatementNode, IdentifierNode, BinaryExpressionNode } from "./types/parser"

export class ParserError extends Error {
    token: Token;
    constructor(message: string, token: Token) {
        super(message);
        this.token = token;
    }
}

export class Parser {
    private tokenIterator: IterableIterator<Token>
    private currentToken: Token
    private nextToken: Token
    private identifierTable: string[][] = [[]]
    constructor(tokens: Token[]) {
        this.tokenIterator = tokens[Symbol.iterator]()
        this.currentToken = this.tokenIterator.next().value as Token
        this.nextToken = this.tokenIterator.next().value as Token
    }
    private isOperatop = (value: string): boolean => {
        return operators.indexOf(value) !== -1
    }
    private eatToken = (value?: string) => {
        if (value && value !== this.currentToken.value) {
            throw new ParserError(
                `Unexpected token value, expected ${value}, received ${this.currentToken.value}`,
                this.currentToken
            );
        }
        this.currentToken = this.nextToken
        this.nextToken = this.tokenIterator.next().value
    }

    private parseBinaryExpression = () => {
        const left = this.parseExpression();
        const operator = this.currentToken.value;
        if (!this.isOperatop(operator)) {
            throw new ParserError(
                `Unexpected token value, expected operator, received ${operator}`,
                this.currentToken
            );
        }
        this.eatToken();
        const right = this.parseExpression();
        return {
            left,
            right,
            operator: operator as Operator
        };
    }

    private parseExpression: ParserStep<ExpressionNode> = () => {
        let node: ExpressionNode;
        switch (this.currentToken.type) {
            case "number":
                node = {
                    type: "numberLiteral",
                    value: Number(this.currentToken.value)
                };
                this.eatToken();
                return node;
            case "identifier":
                node = { type: "identifier", value: this.currentToken.value };
                this.eatToken();
                return node;
            case "parens":
                this.eatToken("(");
                const { left, right, operator } = this.parseBinaryExpression()
                this.eatToken(")");
                return {
                    type: "binaryExpression",
                    left,
                    right,
                    operator: operator as Operator
                };
            default:
                throw new ParserError(
                    `Unexpected token type ${this.currentToken.type}`,
                    this.currentToken
                );
        }
    };


    /**
     * print语句解析
     * @returns 
     */
    private parsePrintStatement: ParserStep<PrintStatementNode> = () => {
        this.eatToken("print");
        return {
            type: "printStatement",
            expression: this.parseExpression()
        };
    }

    /**
     * 变量赋值语句解析
     * @returns 
     */
    private parseVariableAssignment: ParserStep<VariableAssignmentNode> = () => {
        const name = this.currentToken.value;
        this.eatToken();
        this.eatToken("=");
        return {
            type: "variableAssignment",
            name: {
                type: 'identifier',
                value: name
            },
            value: this.parseExpression()
        };
    }

    /**
     * 变量声明语句解析
     * @returns 
     */
    private parseVariableDeclarationStatement: ParserStep<VariableDeclarationNode> = () => {
        this.eatToken("auto");
        const name = this.currentToken.value;
        this.eatToken();
        this.eatToken("=");
        return {
            type: "variableDeclaration",
            name: {
                type: 'identifier',
                value: name
            },
            initializer: this.parseExpression()
        };
    }

    private parseStatement: ParserStep<StatementNode> = () => {
        if (this.currentToken.type === "keyword") {
            let result
            switch (this.currentToken.value) {
                case "print":
                    result = this.parsePrintStatement();
                    this.eatToken(';');
                    return result;
                case "auto":
                    result = this.parseVariableDeclarationStatement();
                    this.eatToken(';');
                    return result;
                case "if":
                    return this.parseIfStatementNode();
                case "while":
                    return this.parseWhileStatementNode();
                case "for":
                    return this.parseForStatementNode();
                default:
                    throw new ParserError(
                        `Unknown keyword ${this.currentToken.value}`,
                        this.currentToken
                    );
            }
        } else if (this.currentToken.type === "identifier") {
            if (this.nextToken.value === "=") {
                const result = this.parseVariableAssignment();
                this.eatToken(';');
                return result
            } else {
                throw new ParserError(
                    `Unexpected token value, expected =, received ${this.currentToken.value}`
                    , this.currentToken)
            }
        } else {
            throw new ParserError(
                `Unexpected token type, expected keyword or identifier, received ${this.currentToken.type}`
                , this.currentToken)
        }
    }

    private parseIfStatementNode: ParserStep<IfStatementNode> = () => {
        this.eatToken('if')
        const node: IfStatementNode = {
            type: 'ifStatementNode',
            condition: this.parseExpression(),
            statements: []
        }
        this.eatToken('{')
        while (this.currentToken.value !== '}') {
            node.statements.push(this.parseStatement())
        }
        this.eatToken('}')
        return node
    }

    private parseWhileStatementNode: ParserStep<WhileStatementNode> = () => {
        this.eatToken('while')
        const node: WhileStatementNode = {
            type: 'whileStatementNode',
            condition: this.parseExpression(),
            statements: []
        }
        this.eatToken('{')
        while (this.currentToken.value !== '}') {
            node.statements.push(this.parseStatement())
        }
        this.eatToken('}')
        return node
    }

    private parseForStatementNode: ParserStep<ForStatementNode> = () => {
        this.eatToken('for');
        this.eatToken('(');
        const initializer = this.parseStatement();
        const { left, right, operator } = this.parseBinaryExpression()
        const condition: ExpressionNode = {
            type: "binaryExpression",
            left,
            right,
            operator: operator as Operator
        };
        this.eatToken(';');
        const name = this.currentToken.value;
        this.eatToken()
        this.eatToken('=')
        const increment: VariableAssignmentNode = {
            type: "variableAssignment",
            name: {
                type: 'identifier',
                value: name
            } as IdentifierNode,
            value: {
                type: 'binaryExpression',
                ...this.parseBinaryExpression()
            } as BinaryExpressionNode
        }
        this.eatToken(')');
        const node: ForStatementNode = {
            type: 'forStatementNode',
            initializer,
            condition,
            increment,
            statements: []
        }
        this.eatToken('{')
        while (this.currentToken.value !== '}') {
            node.statements.push(this.parseStatement())
        }
        this.eatToken('}')
        return node
    }

    private indentifierTableInclude = (identifier: IdentifierNode): boolean => {
        for (const table of this.identifierTable) {
            if (table.includes(identifier.value))
                return true
        }
        return false
    }

    private checkIdentifierDeclaration = (identifier: IdentifierNode): never | void => {
        if (this.indentifierTableInclude(identifier)) {
            throw new ParserError(`Identifier ${identifier.value} already exists.`, identifier)
        }
        this.identifierTable[this.identifierTable.length - 1].push(identifier.value)
    }

    private checkIdentifier = (identifier: IdentifierNode): never | void => {
        if (!this.indentifierTableInclude(identifier)) {
            throw new ParserError(`Identifier ${identifier.value} does not exist.`, identifier)
        }
    }

    private checkExpression = (expression: ExpressionNode): never | void => {
        switch (expression.type) {
            case 'binaryExpression':
                this.checkExpression(expression.left)
                this.checkExpression(expression.right)
                break;
            case 'identifier':
                this.checkIdentifier(expression)
                break;
            default:
                break;
        }
    }

    private checkStatement = (statements: StatementNode[]): never | void => {
        statements.forEach(statement => {
            switch (statement.type) {
                case 'variableDeclaration':
                    this.checkIdentifierDeclaration(statement.name)
                    this.checkExpression(statement.initializer)
                    break;
                case 'variableAssignment':
                    this.checkIdentifier(statement.name)
                    this.checkExpression(statement.value)
                    break;
                case 'printStatement':
                    this.checkExpression(statement.expression)
                    break;
                case 'ifStatementNode':
                    this.checkExpression(statement.condition)
                    this.identifierTable.push([])
                    this.checkStatement(statement.statements)
                    this.identifierTable.pop()
                    break;
                case 'whileStatementNode':
                    this.checkExpression(statement.condition)
                    this.identifierTable.push([])
                    this.checkStatement(statement.statements)
                    this.identifierTable.pop()
                    break;
                case 'forStatementNode':
                    this.identifierTable.push([])
                    this.checkStatement([statement.initializer])
                    this.checkExpression(statement.condition)
                    this.checkStatement([statement.increment])
                    this.checkStatement(statement.statements)
                    this.identifierTable.pop()
                    break;
                default:
                    break;
            }
        });
    }

    public parse() {
        const nodes: StatementNode[] = [];
        while (this.currentToken) {
            nodes.push(this.parseStatement());
        }
        this.identifierTable = [[]];
        this.checkStatement(nodes);
        return nodes;
    }
}