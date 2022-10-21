"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = exports.TokenizerError = void 0;
const constance_1 = require("./constance");
class TokenizerError extends Error {
    constructor(message, index) {
        super(message);
        this.index = index;
    }
}
exports.TokenizerError = TokenizerError;
const locationForIndex = (input, index) => ({
    char: index - input.lastIndexOf("\n", index) - 1,
    line: input.substring(0, index).split("\n").length - 1
});
class Tokenizer {
    constructor() {
        // 分隔符
        this.escapeRegEx = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        // 词法匹配规则
        this.matchers = [
            this.regexMatcher("^-?[.0-9]+([eE]-?[0-9]{2})?", "number"),
            this.regexMatcher(`^(${constance_1.keywords.join("|")})`, "keyword"),
            this.regexMatcher("^\\s+", "whitespace"),
            this.regexMatcher(`^(${constance_1.operators.map(this.escapeRegEx).join("|")})`, "operator"),
            this.regexMatcher(`^[a-zA-Z]+`, "identifier"),
            this.regexMatcher(`^=`, "assignment"),
            this.regexMatcher("^[()]{1}", "parens")
        ];
        this.tokenize = (input) => {
            const tokens = [];
            let index = 0;
            while (index < input.length) {
                const matches = this.matchers.map(m => m(input, index)).filter(f => f);
                if (matches.length > 0) {
                    // 取最高优先级匹配结果
                    const match = matches[0];
                    if ((match === null || match === void 0 ? void 0 : match.type) !== "whitespace") {
                        tokens.push(Object.assign(Object.assign({}, match), locationForIndex(input, index)));
                    }
                    index += match.value.length;
                }
                else {
                    throw new TokenizerError(`Unexpected token ${input.substring(index, index + 1)}`, index);
                }
            }
            return tokens;
        };
    }
    /**
   * 返回一个正则匹配器
   * @param regex 正则表达式
   * @param type 词法类型
   * @returns
   */
    regexMatcher(regex, type) {
        return (input, index) => {
            const match = input.substring(index).match(regex);
            return match && { type, value: match[0] };
        };
    }
}
exports.Tokenizer = Tokenizer;
//# sourceMappingURL=tokenizer.js.map