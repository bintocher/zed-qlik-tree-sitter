/**
 * @file Tree-sitter grammar for Qlik Sense / QlikView script language (.qvs)
 * @author bintocher
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Helper: case-insensitive pattern (for REM only)
function kw(word) {
  return new RegExp(
    word
      .split('')
      .map(c =>
        /[a-zA-Z]/.test(c)
          ? `[${c.toLowerCase()}${c.toUpperCase()}]`
          : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      )
      .join(''),
  );
}

module.exports = grammar({
  name: 'qlik',

  extras: $ => [/\s/, $.line_comment, $.block_comment, $.rem_comment],

  rules: {
    source_file: $ => repeat($._item),

    _item: $ => choice(
      $.function_call,
      $.single_quoted_string,
      $.double_quoted_string,
      $.bracket_field,
      $.macro,
      $.number,
      $.comparison_operator,
      $.arithmetic_operator,
      $.parenthesized,
      $.identifier,
      ';',
      ',',
    ),

    // ─── Comments ───────────────────────────────────────────
    line_comment: $ => token(seq('//', /[^\n]*/)),

    block_comment: $ => token(seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),

    rem_comment: $ => token(prec(2, seq(kw('rem'), /\s[^;]*/, ';'))),

    // ─── Strings & Literals ─────────────────────────────────
    single_quoted_string: $ => token(seq("'", /[^']*/, "'")),

    double_quoted_string: $ => token(seq('"', /[^"]*/, '"')),

    bracket_field: $ => token(seq('[', /[^\]]*/, ']')),

    // ─── Numbers ────────────────────────────────────────────
    integer: $ => token(/\d+/),

    float: $ => token(/\d+\.\d+([eE][+-]?\d+)?/),

    number: $ => choice($.float, $.integer),

    // ─── Macros ─────────────────────────────────────────────
    macro: $ => token(seq('$(', /[^)]*/, ')')),

    // ─── Operators ──────────────────────────────────────────
    comparison_operator: $ => token(choice('<>', '<=', '>=', '<<', '>>', '<', '>', '=')),

    arithmetic_operator: $ => token(choice('&', '+', '-', '*', '/')),

    // ─── Parenthesized expressions ──────────────────────────
    parenthesized: $ => seq('(', repeat($._item), ')'),

    // ─── Function calls ─────────────────────────────────────
    function_call: $ => prec(1, seq(
      field('name', $.identifier),
      '(',
      repeat($._item),
      ')',
    )),

    // ─── Identifiers ────────────────────────────────────────
    identifier: $ => /[a-zA-Z_#][a-zA-Z0-9_#.]*/,
  },
});
