import { keywords, operators } from "./constance";
import { TokenType,Token, Matcher } from "./types/tokenizer";
export class TokenizerError extends Error {
  index: number;
  constructor(message: string, index: number) {
    super(message);
    this.index = index;
  }
}

const locationForIndex = (input: string, index: number) => ({
  char: index - input.lastIndexOf("\n", index) - 1,
  line: input.substring(0, index).split("\n").length - 1
});

export class Tokenizer {
  // 分隔符
  private escapeRegEx = (text: string) =>
    text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  /**
 * 返回一个正则匹配器
 * @param regex 正则表达式
 * @param type 词法类型
 * @returns 
 */
  private regexMatcher(regex: string, type: TokenType): Matcher {
    return (input: string, index: number) => {
      const match = input.substring(index).match(regex)
      return match && { type, value: match[0] }
    }
  }

  // 词法匹配规则
  private matchers = [
    this.regexMatcher(String.raw`^((\/\/[^\n]*)|(\/\*(([^\*][^\/])*|(\*[^\/]*)*|([^\*]*\/)*)*\*\/))`, "annotation"),
    this.regexMatcher(String.raw`^\s+`, "whitespace"),
    this.regexMatcher(String.raw`^-?((0|[1-9][0-9]*)(\.[0-9]*)?|\.[0-9]*)([eE]-?(0|[1-9][0-9]*))?`, "number"),
    this.regexMatcher(String.raw`^(${keywords.join("|")})`, "keyword"),
    this.regexMatcher(String.raw`^(${operators.map(this.escapeRegEx).join("|")})`, "operator"),
    this.regexMatcher(String.raw`^[_A-Za-z]\w*`, "identifier"),
    this.regexMatcher(String.raw`^=`, "assignment"),
    this.regexMatcher(String.raw`^[()\[\]\{\}]`, "parens")
  ];

  public tokenize = (input: string) => {
    const tokens: Token[] = []
    let index = 0
    while (index < input.length) {
      const matches = this.matchers.map(m => m(input, index)).filter(f => f)
      if (matches.length > 0) {
        // 取最高优先级匹配结果
        const match = matches[0]!;
        if (match?.type !== "whitespace" && match?.type !== "annotation") {
          tokens.push({ ...match, ...locationForIndex(input, index) })
        }
        index += match.value.length;
      } else {
        throw new TokenizerError(
          `Unexpected token ${input.substring(index, index + 1)}`,
          index
        )
      }
    }
    return tokens
  }
}