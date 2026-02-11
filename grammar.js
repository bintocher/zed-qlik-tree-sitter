/**
 * @file Tree-sitter grammar for Qlik Sense / QlikView script language (.qvs)
 * @author bintocher
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Helper: case-insensitive keyword
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

  word: $ => $.identifier,

  conflicts: $ => [],

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.control_statement,
      $.script_statement,
      $.expression_statement,
      ';',
    ),

    // ─── Comments ───────────────────────────────────────────
    line_comment: $ => token(seq('//', /[^\n]*/)),

    block_comment: $ => token(seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),

    rem_comment: $ => token(prec(2, seq(
      kw('rem'),
      /\s[^;]*/,
      ';',
    ))),

    // ─── Strings & Literals ─────────────────────────────────
    single_quoted_string: $ => token(seq("'", /[^']*/, "'")),

    double_quoted_string: $ => token(seq('"', /[^"]*/, '"')),

    bracket_field: $ => token(seq('[', /[^\]]*/, ']')),

    integer: $ => token(/\d+/),

    float: $ => token(/\d+\.\d+([eE][+-]?\d+)?/),

    number: $ => choice($.float, $.integer),

    // ─── Macros ─────────────────────────────────────────────
    macro: $ => token(seq('$(', /[^)]*/, ')')),

    // ─── Operators ──────────────────────────────────────────
    comparison_operator: $ => token(choice('<>', '<=', '>=', '<<', '>>', '<', '>', '=')),

    arithmetic_operator: $ => token(choice('&', '+', '-', '*', '/')),

    logical_operator: $ => token(prec(1, choice(
      kw('and'), kw('or'), kw('not'), kw('xor'), kw('like'),
      kw('precedes'), kw('follows'),
      kw('bitand'), kw('bitnot'), kw('bitor'), kw('bitxor'),
    ))),

    // ─── Control Flow ───────────────────────────────────────
    control_keyword: $ => choice(
      // Multi-word (higher precedence)
      token(prec(4, seq(kw('end'), /\s+/, kw('if')))),
      token(prec(4, seq(kw('end'), /\s+/, kw('sub')))),
      token(prec(4, seq(kw('end'), /\s+/, kw('switch')))),
      token(prec(4, seq(kw('exit'), /\s+/, kw('for')))),
      token(prec(4, seq(kw('exit'), /\s+/, kw('do')))),
      token(prec(4, seq(kw('exit'), /\s+/, kw('script')))),
      token(prec(4, seq(kw('do'), /\s+/, kw('while')))),
      token(prec(4, seq(kw('do'), /\s+/, kw('until')))),
      token(prec(4, seq(kw('loop'), /\s+/, kw('while')))),
      token(prec(4, seq(kw('loop'), /\s+/, kw('until')))),
      token(prec(4, seq(kw('for'), /\s+/, kw('each')))),
      // Single-word
      token(prec(3, kw('if'))),
      token(prec(3, kw('then'))),
      token(prec(3, kw('elseif'))),
      token(prec(3, kw('else'))),
      token(prec(3, kw('endif'))),
      token(prec(3, kw('switch'))),
      token(prec(3, kw('case'))),
      token(prec(3, kw('default'))),
      token(prec(3, kw('endswitch'))),
      token(prec(3, kw('sub'))),
      token(prec(3, kw('endsub'))),
      token(prec(3, kw('for'))),
      token(prec(3, kw('to'))),
      token(prec(3, kw('step'))),
      token(prec(3, kw('next'))),
      token(prec(3, kw('do'))),
      token(prec(3, kw('loop'))),
      token(prec(3, kw('while'))),
      token(prec(3, kw('until'))),
      token(prec(3, kw('each'))),
      token(prec(3, kw('in'))),
      token(prec(3, kw('exit'))),
      token(prec(3, kw('call'))),
    ),

    control_statement: $ => prec.right(2, seq(
      $.control_keyword,
      repeat($._expression),
      optional(';'),
    )),

    // ─── Script Statements ──────────────────────────────────
    script_keyword: $ => choice(
      // Multi-word keywords (highest precedence)
      token(prec(5, seq(kw('lib'), /\s+/, kw('connect'), /\s+/, kw('to')))),
      token(prec(5, seq(kw('bundle'), /\s+/, kw('info'), /\s+/, kw('load')))),
      token(prec(4, seq(kw('mapping'), /\s+/, kw('load')))),
      token(prec(4, seq(kw('info'), /\s+/, kw('load')))),
      token(prec(4, seq(kw('load'), /\s+/, kw('distinct')))),
      token(prec(4, seq(kw('sql'), /\s+/, kw('select')))),
      token(prec(4, seq(kw('direct'), /\s+/, kw('query')))),
      token(prec(4, seq(kw('left'), /\s+/, kw('join')))),
      token(prec(4, seq(kw('right'), /\s+/, kw('join')))),
      token(prec(4, seq(kw('inner'), /\s+/, kw('join')))),
      token(prec(4, seq(kw('outer'), /\s+/, kw('join')))),
      token(prec(4, seq(kw('left'), /\s+/, kw('keep')))),
      token(prec(4, seq(kw('right'), /\s+/, kw('keep')))),
      token(prec(4, seq(kw('inner'), /\s+/, kw('keep')))),
      token(prec(4, seq(kw('connect'), /\s+/, kw('to')))),
      token(prec(4, seq(kw('group'), /\s+/, kw('by')))),
      token(prec(4, seq(kw('order'), /\s+/, kw('by')))),
      token(prec(4, seq(kw('drop'), /\s+/, kw('table')))),
      token(prec(4, seq(kw('drop'), /\s+/, kw('tables')))),
      token(prec(4, seq(kw('drop'), /\s+/, kw('field')))),
      token(prec(4, seq(kw('drop'), /\s+/, kw('fields')))),
      token(prec(4, seq(kw('rename'), /\s+/, kw('field')))),
      token(prec(4, seq(kw('rename'), /\s+/, kw('table')))),
      token(prec(4, seq(kw('tag'), /\s+/, kw('field')))),
      token(prec(4, seq(kw('untag'), /\s+/, kw('field')))),
      token(prec(4, seq(kw('section'), /\s+/, kw('access')))),
      token(prec(4, seq(kw('section'), /\s+/, kw('application')))),
      // Single-word keywords
      token(prec(2, kw('load'))),
      token(prec(2, kw('select'))),
      token(prec(2, kw('store'))),
      token(prec(2, kw('into'))),
      token(prec(2, kw('from'))),
      token(prec(2, kw('where'))),
      token(prec(2, kw('resident'))),
      token(prec(2, kw('inline'))),
      token(prec(2, kw('autogenerate'))),
      token(prec(2, kw('as'))),
      token(prec(2, kw('set'))),
      token(prec(2, kw('let'))),
      token(prec(2, kw('binary'))),
      token(prec(2, kw('directory'))),
      token(prec(2, kw('disconnect'))),
      token(prec(2, kw('drop'))),
      token(prec(2, kw('rename'))),
      token(prec(2, kw('qualify'))),
      token(prec(2, kw('unqualify'))),
      token(prec(2, kw('map'))),
      token(prec(2, kw('unmap'))),
      token(prec(2, kw('using'))),
      token(prec(2, kw('star'))),
      token(prec(2, kw('comment'))),
      token(prec(2, kw('tag'))),
      token(prec(2, kw('untag'))),
      token(prec(2, kw('trace'))),
      token(prec(2, kw('sleep'))),
      token(prec(2, kw('execute'))),
      token(prec(2, kw('include'))),
      token(prec(2, kw('buffer'))),
      token(prec(2, kw('noconcatenate'))),
      token(prec(2, kw('concatenate'))),
      token(prec(2, kw('replace'))),
      token(prec(2, kw('add'))),
      token(prec(2, kw('derive'))),
      token(prec(2, kw('declare'))),
      token(prec(2, kw('measure'))),
      token(prec(2, kw('dimension'))),
      token(prec(2, kw('inputfield'))),
      token(prec(2, kw('loosen'))),
      token(prec(2, kw('search'))),
      token(prec(2, kw('flushlog'))),
      token(prec(2, kw('sql'))),
      token(prec(2, kw('odbc'))),
      token(prec(2, kw('oledb'))),
      token(prec(2, kw('lib'))),
      token(prec(2, kw('alias'))),
      token(prec(2, kw('asc'))),
      token(prec(2, kw('desc'))),
      token(prec(2, kw('with'))),
      token(prec(2, kw('on'))),
      token(prec(2, kw('distinct'))),
      token(prec(2, kw('crosstable'))),
      token(prec(2, kw('hierarchy'))),
      token(prec(2, kw('hierarchybelongsto'))),
      token(prec(2, kw('intervalmatch'))),
      token(prec(2, kw('generic'))),
      token(prec(2, kw('semantic'))),
      token(prec(2, kw('sample'))),
      token(prec(2, kw('first'))),
      token(prec(2, kw('merge'))),
      token(prec(2, kw('unless'))),
      token(prec(2, kw('when'))),
      token(prec(2, kw('only'))),
      token(prec(2, kw('join'))),
      token(prec(2, kw('keep'))),
      token(prec(2, kw('left'))),
      token(prec(2, kw('right'))),
      token(prec(2, kw('inner'))),
      token(prec(2, kw('outer'))),
      token(prec(2, kw('mapping'))),
      token(prec(2, kw('bundle'))),
      token(prec(2, kw('info'))),
    ),

    script_statement: $ => prec.right(seq(
      $.script_keyword,
      repeat($._expression),
      optional(';'),
    )),

    // ─── Expression statement ───────────────────────────────
    expression_statement: $ => seq($._expression, repeat($._expression), ';'),

    // ─── Expressions ────────────────────────────────────────
    _expression: $ => choice(
      $.function_call,
      $.macro,
      $.single_quoted_string,
      $.double_quoted_string,
      $.bracket_field,
      $.number,
      $.comparison_operator,
      $.arithmetic_operator,
      $.logical_operator,
      $.parenthesized,
      $.identifier,
      ',',
    ),

    parenthesized: $ => seq('(', repeat($._expression), ')'),

    function_call: $ => prec(1, seq(
      field('name', $.identifier),
      '(',
      optional(seq($._expression, repeat(seq($._expression)))),
      ')',
    )),

    // ─── Identifiers ────────────────────────────────────────
    identifier: $ => /[a-zA-Z_#][a-zA-Z0-9_#.]*/,
  },
});
