import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";
import { readFileSync } from "fs";

const source = readFileSync('input.sy', "utf8")
const tokenizer = new Tokenizer()
const tokens = tokenizer.tokenize(source)
const parser = new Parser(tokens)
const programNodes = parser.parse()
const interpreter = new Interpreter()
interpreter.interpreter(programNodes)
console.log(tokens);

/**
 * printStatement       ->      print $mainExpression
 * variableAssignment   ->      $identifier = $mainExpression
 * variableDeclaration  ->      var $identifier = $mainExpression
 * mainExpression       ->      【【$number|$identifier|($mainExpression)】 $subExpression】
 * subExpression        ->      【$operator $mainExpression】|null 
 */