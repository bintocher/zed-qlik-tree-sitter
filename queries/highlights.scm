; ─── Comments ─────────────────────────────────────────────
(line_comment) @comment
(block_comment) @comment
(rem_comment) @comment

; ─── Strings ──────────────────────────────────────────────
(single_quoted_string) @string
(double_quoted_string) @string

; ─── Numbers ──────────────────────────────────────────────
(integer) @number
(float) @number

; ─── Macros ───────────────────────────────────────────────
(macro) @variable.special

; ─── Operators (symbols) ─────────────────────────────────
(comparison_operator) @operator
(arithmetic_operator) @operator

; ─── Operators (word-based: AND, OR, NOT, XOR, LIKE ...) ──
(logical_operator) @keyword.operator

; ─── Keywords (SET, LET, LOAD, IF, FOR, SUB, etc.) ───────
(keyword) @keyword

; ─── General fallbacks (lowest priority — MUST be before specific patterns)
(identifier) @variable
(bracket_field) @string.special

; ─── Table labels (overrides @variable / @string.special) ─
(table_label
  name: (identifier) @label)
(table_label
  name: (bracket_field) @label)

; ─── Function calls (overrides @variable for function names)
(function_call
  name: (identifier) @function)
