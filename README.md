# Inflex.io

Inflex is a mobile-first, responsive design grid - built to utilise the power of the **flex** display property. Inflex supports all modern browsers.

## Quick Start

* [Download the latest release](https://github.com/chris-garner/inflex/archive/1.1.0.zip).
* Clone the repo: `git clone https://github.com/chris-garner/inflex.git`.
* Install with [Bower](http://bower.io): `bower install inflex`.

## Configuration Variables:

```
@breakpoints: ~'xs' 0 20em, ~'sm' 20em 30em, ~'md' 30em 48em, ~'lg' 48em 64em, ~'xl' 64em 75em, ~'xxl' 75em 90em;
```

- `@breakpoints` (_array_) Responsive breakpoints (eg. `~'xs' 0 20em, ~'sm' 20em 30em`)
    - `selector` (_string_) Breakpoint selector (eg. `~'xs'`)
    - `min` (_em_) Minimum breakpoint width (eg. `0`)
    - `max` (_em_) Maximum breakpoint width (eg. `20em`)

## In Brief...

### How it works:

- Inflex works around two core concepts - **rows** and **columns**. An inflex element can act as both a row and a column; this works great for nesting columns and producing flexible layouts that work great responsively.
- **Rows** are flex containers that group together columns; columns can be grouped both _horizontally_ (default) and _vertically_. There should be no more than 12 columns within a row.
- **Columns** are flex items that contain your content. Columns should always be direct children of rows.
- Inflex does not use CSS classes; instead all options are declared through a custom `data-inflex` attribute, as a space separated list - removing any risk of framework conflicts.
- Inflex comes with a core set of options that make **sizing**, **positioning** and **ordering** a breeze; as well as some optional modules which help tackle concepts such as box-model spacing and element visibility.

### Breakpoints:

- By default, Inflex provides **six** responsive breakpoints (`xs`, `sm`, `md`, `lg`, `xl` and `xxl`) which can be configured in `inflex/config.less`.
- These breakpoints exist so you can easily adapt layouts for different device sizes, without writing additional CSS.
- Adopting a mobile-first approach, breakpoints trigger based on their **minimum width**, meaning any breakpoint specific declarations apply to that one breakpoint and all those above it - unless of course, they're subsequently overridden.

### Rows

- Rows are defined using: `data-inflex="row"`.
- Rows can _flow_ columns in a horizontal (`dir:row`) or vertical (`dir:col`) direction, as well as in reverse.
- By default, rows are set to wrap columns. This can be disabled with the option `wrap:no`.
- Rows have several options which allow you to control the alignment of columns, both vertically and horizontally. For example, `jc:center` will justify columns in the center, and `ai:end` with align columns at the end of a row.

### Columns

- Columns are defined using: `data-inflex="col"`.
- Columns can be completely fluid (**%**), like a traditional grid, or 'locked' to a relative width (**em**) based on **N/12th's** of a specified breakpoint. Without any declarations, a column will determine its width automatically - based on its inner contents.
- To lock a column to the full width of the **md** breakpoint you would use `data-inflex="col @md:12"`. Note how the **@** symbol is used to instruct the locking behaviour.
- Both locked and fluid columns can be overridden by breakpoint specific declarations. Remember, larger breakpoints automatically inherit declarations from smaller ones.
- Unlike other grids, Inflex _does not_ create gutters between columns. It is recommended that margin and padding rules are handled on a case-by-case basis. Fortunately, inflex provides an optional module to assist with this: `inflex/spacing.less`.

### An Example:

In this basic example we construct two full width columns, stacked one on top of each other. When the **md** breakpoint triggers, both columns become half width and sit side-by-side.

```
<div data-inflex="row">
    <div data-inflex="col 12 md:6"></div>
    <div data-inflex="col 12 md:6"></div>
</div>
```

## In Detail...

### Fluid Columns

- Fluid columns are percentage based, like most traditional grids.
- Fluid columns _only_ wrap when you exceed 12 columns.
- Define how many columns a column should span `[1-12]`, by adding a span value to the inflex attribute. For example, define a full width column using `data-inflex="col 12"`.
- You can override the span value above a specific breakpoint, by prefixing `[selector]:`. For example `[xs|sm|md|lg|xl|xxl]:[1-12]`. Remember, all overrides are inherited by larger breakpoints.
- Note: It does not matter what order you specify options in your inflex attribute. Larger breakpoint declarations always override smaller ones.

```
<div data-inflex="row">
    <div data-inflex="col 12 md:6 lg:3"></div>
    <div data-inflex="col 12 md:6 lg:9"></div>
</div>
```

### Growing Columns

- By adding `grow` to your inflex attribute, you can instruct _any_ column to grow beyond it's specified width - filling _any_ remaining space in the row. If more than one column contains the `grow` option, all available space will be evenly distributed.

### Locked Columns

- Locked columns have a relative fixed width (em).
- Locked columns are based on **N/12th's** of a specified breakpoint - meaning there are 72 possible lock widths available: `@[xs|sm|md|lg|xl|xxl]:[1-12]`
- To lock a column you simply prefix your `selector:span` value with the **@** symbol.

In this example, both columns start full width and stacked. When the **lg** breakpoint triggers, the first column locks to **4/12th's** of the viewport width, whilst the second column occupies all remaining space.

```
<div data-inflex="row">
    <div data-inflex="col 12 @lg:4"></div>
    <div data-inflex="col 1 grow"></div>
</div>
```

### Column Ordering

- All columns have a default flex order of 12, meaning if no order is set - columns will automatically align in the order they were specified.
- You can set specific column orders by adding `#[1-12]` to your inflex attribute.
- You can override the order value for a specific breakpoint, by prefixing `[selector]#`. For example `[xs|sm|md|lg|xl|xxl]#[1-12]`.

In this example, the order of the three columns are reversed until the **md** breakpoint triggers.

```
<div data-inflex="row">
    <div data-inflex="col 4 #3 md#1">A</div>
    <div data-inflex="col 4 #2 md#2">B</div>
    <div data-inflex="col 4 #1 md#3">C</div>
</div>
```

## TODO:

### Spacing

Include `inflex/spacing.less`.

```
P[A|H|V|T|B|L|R][0|25|50|75|100|150|200|300]
M[A|H|V|T|B|L|R][0|25|50|75|100|150|200|300]
```

Example: `data-inflex="col 12 PA150 MB75"`

### Visibility

Include `inflex/visibility.less`.

```
hide:[xs/sm/md/lg/xl/xxl]
hide:gt:[xs/sm/md/lg/xl/xxl]
hide:gte:[xs/sm/md/lg/xl/xxl]
hide:lt:[xs/sm/md/lg/xl/xxl]
hide:lte:[xs/sm/md/lg/xl/xxl]
```

Example: `data-inflex="col 12 hide:lte:md"`
