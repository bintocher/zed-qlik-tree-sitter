# tree-sitter-qlik

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for **Qlik Sense** and **QlikView** script language (`.qvs` files).

Based on the official Qlik Sense November 2024 SR2 BNF grammar specification.

## Features

- **100+ keywords** — control flow, data loading, table operations, join types, prefixes, and more
- **Case-insensitive** keyword matching (e.g., `LOAD`, `Load`, `load` are all recognized)
- **Unicode identifiers** — full support for Cyrillic and other non-Latin scripts
- **3 comment styles** — `// line`, `/* block */`, `REM ... ;`
- **3 string types** — `'single'`, `"double"`, `[bracket fields]`
- **Macro expansion** — `$(variable)` syntax
- **Operators** — arithmetic (`+ - * / &`), comparison (`< > = <> <= >=`), logical (`AND OR NOT XOR LIKE`)
- **Table labels** — `TableName:` before LOAD/SELECT
- **Function calls** — recognized as distinct AST nodes
- **Numbers** — integers and floats with scientific notation (`3.14e+10`)

## Supported Node Types

| Node | Description |
|------|-------------|
| `line_comment` | `// ...` |
| `block_comment` | `/* ... */` |
| `rem_comment` | `REM ... ;` |
| `single_quoted_string` | `'text'` |
| `double_quoted_string` | `"text"` |
| `bracket_field` | `[Field Name]` |
| `integer` | `42` |
| `float` | `3.14`, `1.5e+10` |
| `macro` | `$(vVariable)` |
| `keyword` | `LOAD`, `SET`, `IF`, `FOR`, ... |
| `logical_operator` | `AND`, `OR`, `NOT`, `XOR`, `LIKE`, ... |
| `comparison_operator` | `<>`, `<=`, `>=`, `<`, `>`, `=` |
| `arithmetic_operator` | `+`, `-`, `*`, `/`, `&` |
| `function_call` | `Func(...)` |
| `table_label` | `TableName:` |
| `identifier` | variable names, field references |
| `parenthesized` | `(...)` grouped expressions |

## Usage

### With Zed Editor

This grammar is used by the [zed-qlik-editor](https://github.com/bintocher/zed-qlik-editor) extension. Install "Qlik" from the Zed extensions panel.

### With Node.js

```bash
npm install tree-sitter tree-sitter-qlik
```

```javascript
const Parser = require('tree-sitter');
const Qlik = require('tree-sitter-qlik');

const parser = new Parser();
parser.setLanguage(Qlik);

const tree = parser.parse(`
SET vToday = Today();
LOAD
  Field1,
  Field2
FROM [lib://DataFiles/data.qvs] (txt);
`);

console.log(tree.rootNode.toString());
```

### With Tree-sitter CLI

```bash
# Parse a file
tree-sitter parse script.qvs

# Run tests
tree-sitter test

# Generate parser from grammar
tree-sitter generate
```

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [tree-sitter-cli](https://github.com/tree-sitter/tree-sitter/tree/master/cli)

### Setup

```bash
git clone https://github.com/bintocher/zed-qlik-tree-sitter.git
cd zed-qlik-tree-sitter
npm install
```

### Build

```bash
npm run build    # tree-sitter generate
```

### Test

```bash
npm test         # tree-sitter test
```

Tests are located in `test/corpus/` and cover:

- `comments.txt` — line, block, and REM comments
- `control_flow.txt` — SET/LET, LOAD, function calls
- `strings.txt` — single-quoted, double-quoted, bracket fields
- `numbers.txt` — integers and floats
- `macros.txt` — `$(variable)` expansion
- `unicode.txt` — Cyrillic identifiers, table labels, `%`-prefixed variables

### Project Structure

```
tree-sitter-qlik/
├── grammar.js              # Grammar definition (source of truth)
├── tree-sitter.json        # Tree-sitter metadata
├── package.json            # npm package configuration
├── queries/
│   └── highlights.scm      # Syntax highlighting queries
├── test/
│   └── corpus/             # Parser test cases
│       ├── comments.txt
│       ├── control_flow.txt
│       ├── macros.txt
│       ├── numbers.txt
│       ├── strings.txt
│       └── unicode.txt
└── src/                    # Generated parser (do not edit)
    ├── parser.c
    ├── grammar.json
    └── node-types.json
```

## Highlight Queries

The `queries/highlights.scm` file provides syntax highlighting mappings:

```scheme
(keyword) @keyword
(function_call name: (identifier) @function)
(table_label name: (identifier) @label)
(logical_operator) @keyword.operator
(comparison_operator) @operator
(arithmetic_operator) @operator
(single_quoted_string) @string
(double_quoted_string) @string
(bracket_field) @string.special
(macro) @variable.special
(integer) @number
(float) @number
(line_comment) @comment
(block_comment) @comment
(rem_comment) @comment
(identifier) @variable
```

## License

[MIT](LICENSE)
