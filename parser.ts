import { operators } from "./constance";
import { Token } from "./types/tokenizer";
import { StatementNode, Operator, ParserStep, VariableDeclarationNode, VariableAssignmentNode, NumberNode, IdentifierNode, MainExpressionNode, SubExpressionNode, PrintStatementNode } from "./types/parser"

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

    /**
    * 主表达式解析
    */
    private parseMainExpression: ParserStep<MainExpressionNode> = () => {
        let leftNode: NumberNode | IdentifierNode | MainExpressionNode
        switch (this.currentToken.type) {
            case "parens":
                this.eatToken()
                leftNode = this.parseMainExpression()
                this.eatToken()
                break
            case "number":
                leftNode = {
                    type: 'number',
                    value: Number(this.currentToken.value)
                }
                this.eatToken();
                break
            case "identifier":
                leftNode = {
                    type: "identifier",
                    value: this.currentToken.value
                }
                this.eatToken();
                break
            default:
                throw new ParserError(
                    `Unexpected token type ${this.currentToken.type}`,
                    this.currentToken
                );
        }
        return {
            type: "mainExpression",
            left: leftNode,
            right: this.parseSubExpression()
        }
    }
    /**
     * 副表达式解析
     */
    private parseSubExpression: ParserStep<SubExpressionNode> = () => {
        if (!this.currentToken || !this.isOperatop(this.currentToken.value))
            return {
                type: 'subExpression',
                isNull: true
            }
        const operator = this.currentToken.value
        this.eatToken()
        return {
            type: 'subExpression',
            operator: operator as Operator,
            right: this.parseMainExpression(),
            isNull: false
        }
    }

    /**
     * print语句解析
     * @returns 
     */
    private parsePrintStatement: ParserStep<PrintStatementNode> = () => {
        this.eatToken("print");
        return {
            type: "printStatement",
            expression: this.parseMainExpression()
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
            value: this.parseMainExpression()
        };
    }

    /**
     * 变量声明语句解析
     * @returns 
     */
    private parseVariableDeclarationStatement: ParserStep<VariableDeclarationNode> = () => {
        this.eatToken("var");
        const name = this.currentToken.value;
        this.eatToken();
        this.eatToken("=");
        return {
            type: "variableDeclaration",
            name: {
                type: 'identifier',
                value: name
            },
            initializer: this.parseMainExpression()
        };
    }

    private parseStatement: ParserStep<StatementNode> = () => {
        if (this.currentToken.type === "keyword") {
            switch (this.currentToken.value) {
                case "print":
                    return this.parsePrintStatement();
                case "var":
                    return this.parseVariableDeclarationStatement();
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

    public parse() {
        const nodes: StatementNode[] = [];
        while (this.currentToken) {
            nodes.push(this.parseStatement());
        }
        return nodes;
    }
}