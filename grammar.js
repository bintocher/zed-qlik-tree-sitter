/**
 * @file Tree-sitter grammar for Qlik Sense / QlikView script language (.qvs)
 * @author bintocher
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Case-insensitive keyword helper: kw('load') → /[lL][oO][aA][dD]/
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

  // word rule ensures keywords only match at word boundaries
  // (prevents 'add' from matching inside 'AddDateName')
  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($._item),

    _item: $ => choice(
      $.table_label,
      $.function_call,
      $.single_quoted_string,
      $.double_quoted_string,
      $.bracket_field,
      $.macro,
      $.number,
      $.comparison_operator,
      $.arithmetic_operator,
      $.logical_operator,
      $.keyword,
      $.parenthesized,
      $.identifier,
      ';',
      ',',
      ':',
    ),

    // ─── Comments ───────────────────────────────────────────
    line_comment: $ => token(seq('//', /[^\n]*/)),

    block_comment: $ => token(seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),

    rem_comment: $ => token(prec(5, seq(kw('rem'), /\s[^;]*/, ';'))),

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

    // ─── Operators (symbols) ────────────────────────────────
    comparison_operator: $ => token(choice('<>', '<=', '>=', '<<', '>>', '<', '>', '=')),

    arithmetic_operator: $ => token(choice('&', '+', '-', '*', '/')),

    // ─── Operators (word-based, case-insensitive) ───────────
    logical_operator: $ => token(prec(3, choice(
      kw('and'), kw('or'), kw('not'), kw('xor'), kw('like'),
      kw('precedes'), kw('follows'),
      kw('bitand'), kw('bitnot'), kw('bitor'), kw('bitxor'),
    ))),

    // ─── All keywords in ONE token (longest match wins) ─────
    keyword: $ => token(prec(2, choice(
      // Control flow
      kw('if'), kw('then'), kw('else'), kw('elseif'),
      kw('endif'), kw('end'),
      kw('sub'), kw('endsub'),
      kw('for'), kw('to'), kw('step'), kw('next'),
      kw('do'), kw('loop'), kw('while'), kw('until'),
      kw('each'), kw('in'),
      kw('exit'), kw('call'),
      kw('switch'), kw('case'), kw('default'), kw('endswitch'),
      // Data loading
      kw('load'), kw('select'), kw('store'), kw('into'),
      kw('from'), kw('where'), kw('resident'), kw('inline'),
      kw('autogenerate'), kw('as'), kw('distinct'),
      kw('group'), kw('by'), kw('order'),
      // Variables
      kw('set'), kw('let'),
      // Connections
      kw('binary'), kw('connect'), kw('disconnect'),
      kw('directory'), kw('lib'), kw('sql'), kw('odbc'), kw('oledb'),
      kw('direct'), kw('query'),
      // Table operations
      kw('drop'), kw('rename'), kw('table'), kw('tables'),
      kw('field'), kw('fields'),
      kw('qualify'), kw('unqualify'),
      kw('map'), kw('unmap'), kw('using'),
      kw('star'), kw('is'),
      kw('loosen'), kw('inputfield'),
      // Prefixes & join
      kw('mapping'), kw('concatenate'), kw('noconcatenate'),
      kw('crosstable'), kw('hierarchy'), kw('hierarchybelongsto'),
      kw('intervalmatch'), kw('generic'), kw('semantic'),
      kw('join'), kw('keep'), kw('left'), kw('right'),
      kw('inner'), kw('outer'),
      kw('buffer'), kw('replace'), kw('add'),
      kw('bundle'), kw('info'),
      kw('sample'), kw('first'), kw('merge'),
      kw('unless'), kw('when'), kw('only'),
      // Section
      kw('section'), kw('access'), kw('application'),
      // Metadata
      kw('comment'), kw('tag'), kw('untag'),
      kw('derive'), kw('declare'), kw('measure'), kw('dimension'),
      // Relationships
      kw('create'), kw('relationship'),
      // Autonumber
      kw('autonumber'),
      // SQL metadata
      kw('sqlcolumns'), kw('sqltables'), kw('sqltypes'),
      // Other statements
      kw('qsl'), kw('custom'), kw('customconnect'), kw('bdi'),
      kw('import'), kw('live'),
      kw('script'),
      // Force statement
      kw('capitalization'), kw('upper'), kw('lower'), kw('mixed'),
      // Buffer options
      kw('incremental'), kw('stale'), kw('after'),
      // Misc
      kw('alias'), kw('asc'), kw('desc'), kw('with'), kw('on'),
      kw('trace'), kw('sleep'), kw('execute'), kw('include'),
      kw('search'), kw('flushlog'),
      kw('nullasvalue'), kw('nullasnull'),
      kw('force'), kw('null'), kw('value'),
      kw('total'),
    ))),

    // ─── Parenthesized expressions ──────────────────────────
    parenthesized: $ => seq('(', repeat($._item), ')'),

    // ─── Function calls ─────────────────────────────────────
    function_call: $ => prec(1, seq(
      field('name', $.identifier),
      '(',
      repeat($._item),
      ')',
    )),

    // ─── Table labels (TableName: before LOAD/SELECT) ───────
    table_label: $ => prec(1, seq(
      field('name', choice($.identifier, $.bracket_field)),
      ':',
    )),

    // ─── Identifiers (Unicode-aware for Cyrillic etc.) ────
    identifier: $ => /[\p{L}_#%][\p{L}\p{N}_#%.]*/,
  },
});
