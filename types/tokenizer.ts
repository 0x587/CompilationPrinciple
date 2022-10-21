type TokenType =
    | "number"
    | "keyword"
    | "whitespace"
    | "operator"
    | "identifier"
    | "assignment"
    | "parens"

interface Token {
    type: TokenType;
    value: string;
    line?: number;
    char?: number;
}
/**
 * 正则匹配器
 */
interface Matcher {
    (input: string, index: number): Token | null;
}