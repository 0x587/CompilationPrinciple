import { keywords, operators } from "./constance";

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
    this.regexMatcher("^-?[.0-9]+([eE]-?[0-9]{2})?", "number"),
    this.regexMatcher(`^(${keywords.join("|")})`, "keyword"),
    this.regexMatcher("^\\s+", "whitespace"),
    this.regexMatcher(`^(${operators.map(this.escapeRegEx).join("|")})`, "operator"),
    this.regexMatcher(`^[a-zA-Z]+`, "identifier"),
    this.regexMatcher(`^=`, "assignment"),
    this.regexMatcher("^[()]{1}", "parens")
  ];

  public tokenize = (input: string) => {
    const tokens: Token[] = []
    let index = 0
    while (index < input.length) {
      const matches = this.matchers.map(m => m(input, index)).filter(f => f)
      if (matches.length > 0) {
        // 取最高优先级匹配结果
        const match = matches[0]!;
        if (match?.type !== "whitespace") {
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