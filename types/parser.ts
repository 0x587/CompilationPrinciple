export interface ProgramNode {
    type: string;
}

export type Operator = "+" | "-" | "/" | "*" | "==" | ">" | "<" | "&&";

export type ExpressionNode = NumberLiteralNode | BinaryExpressionNode | IdentifierNode;

export type StatementNode =
    | PrintStatementNode
    | VariableDeclarationNode
    | VariableAssignmentNode
    | IfStatementNode
    | WhileStatementNode
    | ForStatementNode

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

export interface NumberLiteralNode extends ProgramNode {
    type: "numberLiteral";
    value: number;
}

export interface IdentifierNode extends ProgramNode {
    type: "identifier";
    value: string;
}

export interface BinaryExpressionNode extends ProgramNode {
    type: "binaryExpression";
    left: ExpressionNode;
    right: ExpressionNode;
    operator: Operator;
}

export interface IfStatementNode extends ProgramNode {
    type: "ifStatementNode";
    condition: ExpressionNode;
    statements: StatementNode[];
}

export interface WhileStatementNode extends ProgramNode {
    type: "whileStatementNode";
    condition: ExpressionNode;
    statements: StatementNode[];
}
export interface ForStatementNode extends ProgramNode {
    type: "forStatementNode";
    initializer: StatementNode;
    condition: ExpressionNode;
    increment: StatementNode;
    statements: StatementNode[];
}

export interface PrintStatementNode extends ProgramNode {
    type: "printStatement";
    expression: ExpressionNode;
}

export interface ParserStep<T extends ProgramNode> {
    (): T;
}