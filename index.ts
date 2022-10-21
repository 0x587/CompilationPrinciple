import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";


const tokenizer = new Tokenizer()
const tokens = tokenizer.tokenize('c=1+2+2')
const parser = new Parser(tokens)
const result = parser.parse()
console.log(1);

/**
 * printStatement       ->      print $mainExpression
 * variableAssignment   ->      $identifier = $mainExpression
 * variableDeclaration  ->      var $identifier = $mainExpression
 * mainExpression       ->      【【$number|$identifier】 $subExpression】
 * subExpression        ->      【$operator $mainExpression】|null 
 */