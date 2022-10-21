"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenizer_1 = require("./tokenizer");
const parser_1 = require("./parser");
const tokenizer = new tokenizer_1.Tokenizer();
const tokens = tokenizer.tokenize('c=1+2+2');
const parser = new parser_1.Parser(tokens);
const result = parser.parse();
console.log(1);
/**
 * printStatement       ->      print $mainExpression
 * variableAssignment   ->      $identifier = $mainExpression
 * variableDeclaration  ->      var $identifier = $mainExpression
 * mainExpression       ->      【【$number|$identifier】 $subExpression】
 * subExpression        ->      【$operator $mainExpression】|null
 */ 
//# sourceMappingURL=index.js.map