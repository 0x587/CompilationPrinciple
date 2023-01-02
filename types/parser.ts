export interface ProgramNode {
    type: string;
}

export type Operator = "+" | "-" | "/" | "*" | "==" | ">" | "<" | "&&";

export type ExpressionNode = NumberNode | IdentifierNode | MainExpressionNode | SubExpressionNode;

export type StatementNode =
    | PrintStatementNode
    | VariableDeclarationNode
    | VariableAssignmentNode

export type Program = StatementNode[];

export interface VariableDeclarationNode extends ProgramNode {
    type: "variableDeclaration";
    name: IdentifierNode;
    initializer: ExpressionNode;
}

export interface VariableAssignmentNode extends ProgramNode {
    type: "variableAssignment";
    name: IdentifierNode;
    value: ExpressionNode;
}

export interface NumberNode extends ProgramNode {
    type: "number";
    value: number;
}

export interface IdentifierNode extends ProgramNode {
    type: "identifier";
    value: string;
}

export interface MainExpressionNode extends ProgramNode {
    type: 'mainExpression'
    left: NumberNode | IdentifierNode | MainExpressionNode
    right: SubExpressionNode
}

export interface SubExpressionNode extends ProgramNode {
    type: 'subExpression'
    isNull: boolean
    operator?: Operator
    right?: MainExpressionNode
}

export interface PrintStatementNode extends ProgramNode {
    type: "printStatement";
    expression: ExpressionNode;
}

export interface ParserStep<T extends ProgramNode> {
    (): T;
}