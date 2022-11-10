import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";

const tokenizer = new Tokenizer()
const tokens = tokenizer.tokenize('c=(1+2*3)')
const parser = new Parser(tokens)
const programNodes = parser.parse()
const interpreter = new Interpreter()
interpreter.interpreter(programNodes)

/**
 * printStatement       ->      print $mainExpression
 * variableAssignment   ->      $identifier = $mainExpression
 * variableDeclaration  ->      var $identifier = $mainExpression
 * mainExpression       ->      【【$number|$identifier|($mainExpression)】 $subExpression】
 * subExpression        ->      【$operator $mainExpression】|null 
 */