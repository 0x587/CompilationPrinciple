import { Tokenizer } from "./tokenizer";
import { BinaryExpressionNode, ProgramNode, VariableAssignmentNode } from "./types/parser";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";
import { readdir, readFileSync } from "fs";
import { QuaternionStorer } from "./quaternion";

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


readdir('test', (err, files) => {
    files.forEach(file => {
        console.log(`------------------${file}------------------`);
        try {
            const source = readFileSync(`test/${file}`, "utf8")
            const tokenizer = new Tokenizer()
            const tokens = tokenizer.tokenize(source)
            const parser = new Parser(tokens)
            const programNodes = parser.parse()
            // console.log(programNodes)
            const quaternionStorer = new QuaternionStorer(programNodes)
            quaternionStorer.print()

        } catch (error) {
            console.log(error);
        }
        console.log(`------------------${file}------------------`);
    })
})

// outputTetrad(programNodes)
// const interpreter = new Interpreter()
// interpreter.interpreter(programNodes)
// console.log(tokens);

/**
 * printStatement       ->      print $expression
 * variableAssignment   ->      $identifier = $expression
 * variableDeclaration  ->      var $identifier = $expression
 * parseExpression      ->      ( $expression $operator $expression )
 * expression           ->      $number | $identifier | $parensExpression
 */