"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.ParserError = void 0;
const constance_1 = require("./constance");
class ParserError extends Error {
    constructor(message, token) {
        super(message);
        this.token = token;
    }
}
exports.ParserError = ParserError;
class Parser {
    constructor(tokens) {
        this.isOperatop = (value) => {
            return constance_1.operators.indexOf(value) !== -1;
        };
        this.eatToken = (value) => {
            if (value && value !== this.currentToken.value) {
                throw new ParserError(`Unexpected token value, expected ${value}, received ${this.currentToken.value}`, this.currentToken);
            }
            this.currentToken = this.nextToken;
            this.nextToken = this.tokenIterator.next().value;
        };
        /**
        * 主表达式解析
        */
        this.parseMainExpression = () => {
            let leftNode;
            switch (this.currentToken.type) {
                case "number":
                    leftNode = {
                        type: 'number',
                        value: Number(this.currentToken.value)
                    };
                    this.eatToken();
                    break;
                case "identifier":
                    leftNode = {
                        type: "identifier",
                        value: this.currentToken.value
                    };
                    this.eatToken();
                    break;
                default:
                    throw new ParserError(`Unexpected token type ${this.currentToken.type}`, this.currentToken);
            }
            return {
                type: "mainExpression",
                left: leftNode,
                right: this.parseSubExpression()
            };
        };
        /**
         * 副表达式解析
         */
        this.parseSubExpression = () => {
            if (!this.currentToken || !this.isOperatop(this.currentToken.value))
                return {
                    type: 'subExpression',
                    isNull: true
                };
            const operator = this.currentToken.value;
            this.eatToken();
            return {
                type: 'subExpression',
                operator: operator,
                right: this.parseMainExpression(),
                isNull: false
            };
        };
        /**
         * print语句解析
         * @returns
         */
        this.parsePrintStatement = () => {
            this.eatToken("print");
            return {
                type: "printStatement",
                expression: this.parseMainExpression()
            };
        };
        /**
         * 变量赋值语句解析
         * @returns
         */
        this.parseVariableAssignment = () => {
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
        };
        /**
         * 变量声明语句解析
         * @returns
         */
        this.parseVariableDeclarationStatement = () => {
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
        };
        this.parseStatement = () => {
            if (this.currentToken.type === "keyword") {
                switch (this.currentToken.value) {
                    case "print":
                        return this.parsePrintStatement();
                    case "var":
                        return this.parseVariableDeclarationStatement();
                    default:
                        throw new ParserError(`Unknown keyword ${this.currentToken.value}`, this.currentToken);
                }
            }
            else if (this.currentToken.type === "identifier") {
                if (this.nextToken.value === "=") {
                    return this.parseVariableAssignment();
                }
                else {
                    throw new ParserError(`Unexpected token value, expected =, received ${this.currentToken.value}`, this.currentToken);
                }
            }
            else
                throw new ParserError(`Unexpected token type, expected keyword or identifier, received ${this.currentToken.type}`, this.currentToken);
        };
        this.tokenIterator = tokens[Symbol.iterator]();
        this.currentToken = this.tokenIterator.next().value;
        this.nextToken = this.tokenIterator.next().value;
    }
    parse() {
        const nodes = [];
        while (this.currentToken) {
            nodes.push(this.parseStatement());
        }
        return nodes;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map