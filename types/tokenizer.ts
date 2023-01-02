export type TokenType =
    | "number"
    | "keyword"
    | "whitespace"
    | "operator"
    | "identifier"
    | "assignment"
    | "parens"
    | "annotation"

export interface Token {
    type: TokenType;
    value: string;
    line?: number;
    char?: number;
}
/**
 * 正则匹配器
 */
export interface Matcher {
    (input: string, index: number): Token | null;
}