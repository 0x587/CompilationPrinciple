import { operators } from "./constance";
import { Token } from "./types/tokenizer";
import { StatementNode, Operator, ParserStep, VariableDeclarationNode, VariableAssignmentNode, PrintStatementNode, ExpressionNode, IfStatementNode, WhileStatementNode } from "./types/parser"

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
                default:
                    throw new ParserError(
                        `Unknown keyword ${this.currentToken.value}`,
                        this.currentToken
                    );
            }
        } else if (this.currentToken.type === "identifier") {
            if (this.nextToken.value === "=") {
                return this.parseVariableAssignment();
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

    public parse() {
        const nodes: StatementNode[] = [];
        while (this.currentToken) {
            nodes.push(this.parseStatement());
        }
        return nodes;
    }
}