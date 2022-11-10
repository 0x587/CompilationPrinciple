import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";

const outputTetrad = (programNodes: ProgramNode[]) => {
    let i = 0;
    const BFS = (node: BinaryExpressionNode) => {
        let left, right
        if (node.left.type !== 'binaryExpression')
            left = node.left.value
        else
            left = BFS(node.left)
        if (node.right.type !== 'binaryExpression')
            right = node.right.value
        else
            right = BFS(node.right)
        console.log(`(${node.operator}, ${left}, ${right}, temp${i++})`)
        return `temp${i - 1}`
    }
    let value = BFS((programNodes[0] as VariableAssignmentNode).value as BinaryExpressionNode)
    console.log(`(=, ${value}, _, result)`);
}



const tokenizer = new Tokenizer()
const tokens = tokenizer.tokenize('result = (((1+2)*numA)*(3-numB))')
const parser = new Parser(tokens)
const programNodes = parser.parse()
outputTetrad(programNodes)
const interpreter = new Interpreter()
interpreter.interpreter(programNodes)

/**
 * printStatement       ->      print $expression
 * variableAssignment   ->      $identifier = $expression
 * variableDeclaration  ->      var $identifier = $expression
 * parseExpression      ->      ( $expression $operator $expression )
 * expression           ->      $number | $identifier | $parensExpression
 */