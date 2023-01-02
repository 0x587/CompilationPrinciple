import { BinaryExpressionNode, ExpressionNode, Operator, Program, StatementNode } from "./types/parser";

export interface Quaternion {
    toString(): string;
}

export class OperateQuaternion implements Quaternion {
    public operator: Operator | '='
    public argument1: string | number
    public argument2: string | number | undefined
    public result: string

    constructor(operator: Operator | '=', argument1: string | number, argument2: string | number | undefined, result: string) {
        this.operator = operator
        this.argument1 = argument1
        this.argument2 = argument2
        this.result = result
    }
    public toString(): string {
        return `(${this.operator}, ${this.argument1}, ${this.argument2 ?? '_'}, ${this.result})`
    }
}

export class JumpQuaternion implements Quaternion {
    public exit: number

    constructor(exit: number) {
        this.exit = exit
    }
    public toString(): string {
        return `(jump, -, -, ${this.exit})`
    }
}

export class JumpNZQuaternion implements Quaternion {
    public argument: string | number
    public exit: number

    constructor(argument: string | number, exit: number) {
        this.argument = argument
        this.exit = exit
    }
    public toString(): string {
        return `(jnz, ${this.argument}, , ${this.exit})`
    }
}

export class JumpEZQuaternion implements Quaternion {
    public argument: string | number
    public exit: number

    constructor(argument: string | number, exit: number) {
        this.argument = argument
        this.exit = exit
    }
    public toString(): string {
        return `(jez, ${this.argument}, , ${this.exit})`
    }
}

export type ComparisonOperator = '>' | '<' | '==';
function isComparisonOperator(op: Operator): boolean {
    return op === '>' || op === '<' || op === '=='
}

export class JumpROPQuaternion implements Quaternion {
    public operator: ComparisonOperator
    public argument1: string | number
    public argument2: string | number
    public exit: number

    constructor(operator: ComparisonOperator, argument1: string | number, argument2: string | number, exit: number) {
        this.operator = operator
        this.argument1 = argument1
        this.argument2 = argument2
        this.exit = exit
    }
    public toString(): string {
        return `(j${this.operator}, ${this.argument1}, ${this.argument2}, ${this.exit})`
    }
}

export class QuaternionStorer {
    public quaternions: Quaternion[]
    get curIndex(): number {
        return this.quaternions.length
    }

    private cnt: number = 0
    private createTempVar(): string {
        return 'temp' + this.cnt++
    }
    private getExpressionValue(programNode: ExpressionNode): string | number {
        if (programNode.type === "numberLiteral")
            return programNode.value
        if (programNode.type === "identifier")
            return programNode.value
        return this.transExpression(programNode)
    }

    private getLeftAndRight(programNode: BinaryExpressionNode): {
        leftVar: string | number,
        rightVar: string | number
    } {
        let leftVar: string | number = this.getExpressionValue(programNode.left)
        let rightVar: string | number = this.getExpressionValue(programNode.right)

        return { leftVar, rightVar }
    }

    private transExpression(programNode: BinaryExpressionNode): string {
        let { leftVar, rightVar } = this.getLeftAndRight(programNode)
        let tempVar: string = this.createTempVar()
        this.quaternions.push(new OperateQuaternion(
            programNode.operator, leftVar, rightVar, tempVar))
        return tempVar
    }

    private transCondition(programNode: ExpressionNode, exit: number): void {
        if (programNode.type === "numberLiteral") {
            this.quaternions.push(new JumpNZQuaternion(
                programNode.value, exit))
        }
        else if (programNode.type === "identifier") {
            this.quaternions.push(new JumpNZQuaternion(
                programNode.value, exit))
        }
        else {
            if (isComparisonOperator(programNode.operator)) {
                let { leftVar, rightVar } = this.getLeftAndRight(programNode)
                this.quaternions.push(new JumpROPQuaternion(
                    programNode.operator as ComparisonOperator, leftVar, rightVar, exit))
            }
            else {
                let tempVar: string = this.transExpression(programNode)
                this.quaternions.push(new JumpNZQuaternion(
                    tempVar, exit))
            }
        }
    }

    private transStatement(programNode: StatementNode): void {
        switch (programNode.type) {
            case "variableDeclaration": {
                let value: string | number = this.getExpressionValue(programNode.initializer)
                this.quaternions.push(new OperateQuaternion(
                    '=', value, undefined, programNode.name.value))
                break
            }
            case "variableAssignment": {
                let value: string | number = this.getExpressionValue(programNode.value)
                this.quaternions.push(new OperateQuaternion(
                    '=', value, undefined, programNode.name.value))
                break
            }
            case "ifStatementNode": {
                this.transCondition(programNode.condition, this.curIndex + 2) // condition
                let incompleteQuaternion = new JumpQuaternion(0) // 出口位置后面再设置
                this.quaternions.push(incompleteQuaternion)
                for (let statement of programNode.statements)
                    this.transStatement(statement)
                incompleteQuaternion.exit = this.curIndex // 设置出口位置
                break
            }
            case "whileStatementNode": {
                let startPos = this.curIndex;
                this.transCondition(programNode.condition, this.curIndex + 2) // condition
                let incompleteQuaternion = new JumpQuaternion(0) // 出口位置后面再设置
                this.quaternions.push(incompleteQuaternion)
                for (let statement of programNode.statements)
                    this.transStatement(statement)
                this.quaternions.push(new JumpQuaternion(startPos)) // 跳回condition
                incompleteQuaternion.exit = this.curIndex // 设置出口位置
                break
            }
            case "forStatementNode": {
                this.transStatement(programNode.initializer) // init-statement
                let startPos = this.curIndex;
                this.transCondition(programNode.condition, this.curIndex + 2) // condition
                let incompleteQuaternion = new JumpQuaternion(0) // 出口位置后面再设置
                this.quaternions.push(incompleteQuaternion)
                for (let statement of programNode.statements)
                    this.transStatement(statement)
                this.transStatement(programNode.increment) // iteration-expression
                this.quaternions.push(new JumpQuaternion(startPos)) // 跳回condition
                incompleteQuaternion.exit = this.curIndex // 设置出口位置
                break
            }
        }
    }

    constructor(programNodes: Program) {
        this.quaternions = []
        for (let programNode of programNodes) {
            this.transStatement(programNode)
        }
    }

    public print() {
        this.quaternions.forEach((quaternion, idx) => {
            console.log(`${idx}\t` + quaternion.toString())
        })
    }
}