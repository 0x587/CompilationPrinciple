interface ProgramNode {
    type: string;
}

type Operator = "+" | "-" | "/" | "*" | "==" | ">" | "<" | "&&";

type ExpressionNode = NumberNode | IdentifierNode | MainExpressionNode | SubExpressionNode;

type StatementNode =
    | PrintStatementNode
    | VariableDeclarationNode
    | VariableAssignmentNode

type Program = StatementNode[];

interface VariableDeclarationNode extends ProgramNode {
    type: "variableDeclaration";
    name: IdentifierNode;
    initializer: ExpressionNode;
}

interface VariableAssignmentNode extends ProgramNode {
    type: "variableAssignment";
    name: IdentifierNode;
    value: ExpressionNode;
}

interface NumberNode extends ProgramNode {
    type: "number";
    value: number;
}

interface IdentifierNode extends ProgramNode {
    type: "identifier";
    value: string;
}

interface MainExpressionNode extends ProgramNode {
    type: 'mainExpression'
    left: NumberNode | IdentifierNode | MainExpressionNode
    right: SubExpressionNode
}

interface SubExpressionNode extends ProgramNode {
    type: 'subExpression'
    isNull: boolean
    operator?: Operator
    right?: MainExpressionNode
}

interface PrintStatementNode extends ProgramNode {
    type: "printStatement";
    expression: ExpressionNode;
}

interface ParserStep<T extends ProgramNode> {
    (): T;
}