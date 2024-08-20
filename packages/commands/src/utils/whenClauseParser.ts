import { type Parser, alt, createLanguage, optWhitespace, regexp, seq, seqMap, string } from "parsimmon";

interface Var {
  _: "v";
  val: string;
}
interface Const {
  _: "c";
  val: unknown;
}
interface Not {
  _: "!";
  node: Expression;
}
interface Eq {
  _: "==" | "!=";
  left: Expression;
  right: Expression;
}
interface Or {
  _: "||";
  left: Expression;
  right: Expression;
}
interface And {
  _: "&&";
  left: Expression;
  right: Expression;
}
export type Expression = Var | Const | Not | Eq | Or | And;

const _ = optWhitespace;

const lang = createLanguage<{
  Var: Expression;
  Number: Expression;
  String: Expression;
  Const: Expression;
  Not: Expression;
  Eq: Expression;
  And: Expression;
  Or: Expression;
  List: Expression;
  Expr: Expression;
}>({
  Var: () =>
    regexp(/[a-z][a-z0-9.:]*/i).map((val) => {
      switch (val) {
        case "true":
          return { _: "c", val: true };
        case "false":
          return { _: "c", val: false };
        default:
          return { _: "v", val };
      }
    }),
  Number: () => regexp(/[0-9]+(\.[0-9]+)?/).map((val) => ({ _: "c", val: Number(val) })),
  String: () =>
    regexp(/(".*?")|('.*?')/).map((val) => ({
      _: "c",
      val: String(val).substring(1, val.length - 1),
    })),
  Const: (r) => alt(r.Number).or(r.Var).or(r.String),
  Not: (r) => seq(string("!").trim(_).many(), alt(r.List, r.Const)).map(([excl, node]) => (excl.length % 2 === 1 ? { _: "!", node } : node)),
  Eq: (r) =>
    seqMap(r.Not, seq(alt(string("=="), string("!=")).trim(_), r.Not).many(), (first, rest) => {
      return rest.reduce((acc, [op, another]) => ({ _: op, left: acc, right: another }), first);
    }),
  And: (r) =>
    seqMap(r.Eq, seq(string("&&").trim(_), r.Eq).many(), (first, rest) => {
      return rest.reduce((acc, [, another]) => ({ _: "&&", left: acc, right: another }), first);
    }),
  Or: (r) =>
    seqMap(r.And, seq(string("||").trim(_), r.And).many(), (first, rest) => {
      return rest.reduce((acc, [, another]) => {
        return { _: "||", left: acc, right: another };
      }, first);
    }),
  List: (r) => r.Or.trim(_).wrap(string("("), string(")")),
  Expr: (r) => r.Or,
});

export const parser: Parser<Expression> = lang.Expr;
