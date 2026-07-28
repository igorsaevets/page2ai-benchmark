Flexbox & Grid

Utilities for controlling how flex items both grow and shrink.

| Class | Styles | 
|---|---|
| `flex-` | `flex: ` | 
| `flex-` | `flex: calc(` | 
| `flex-auto` | `flex: auto;` | 
| `flex-initial` | `flex: 0 auto;` | 
| `flex-none` | `flex: none;` | 
| `flex-(` | `flex: var(` | 
| `flex-[` | `flex: ` | 

Use `flex-` utilities like `<number>``flex-1` to allow a flex item to grow and shrink as needed, ignoring its initial size:

`<div class="flex">  <div class="w-14 flex-none ...">01</div>  <div class="w-64 flex-1 ...">02</div>  <div class="w-32 flex-1 ...">03</div></div>`Use `flex-initial` to allow a flex item to shrink but not grow, taking into account its initial size:

`<div class="flex">  <div class="w-14 flex-none ...">01</div>  <div class="w-64 flex-initial ...">02</div>  <div class="w-32 flex-initial ...">03</div></div>`Use `flex-auto` to allow a flex item to grow and shrink, taking into account its initial size:

`<div class="flex ...">  <div class="w-14 flex-none ...">01</div>  <div class="w-64 flex-auto ...">02</div>  <div class="w-32 flex-auto ...">03</div></div>`Use `flex-none` to prevent a flex item from growing or shrinking:

`<div class="flex ...">  <div class="w-14 flex-none ...">01</div>  <div class="w-32 flex-none ...">02</div>  <div class="flex-1 ...">03</div></div>`Use the `flex-[` syntax to set the flex shorthand property based on a completely custom value:`<value>`]

`<div class="flex-[3_1_auto] ...">  <!-- ... --></div>`For CSS variables, you can also use the `flex-(` syntax:`<custom-property>`)

`<div class="flex-(--my-flex) ...">  <!-- ... --></div>`This is just a shorthand for `flex-[var(` that adds the `<custom-property>`)]`var()` function for you automatically.

Prefix a `flex` utility with a breakpoint variant like `md:` to only apply the utility at medium screen sizes and above:

`<div class="flex-none md:flex-1 ...">  <!-- ... --></div>`Learn more about using variants in the [variants documentation](https://tailwindcss.com/docs/hover-focus-and-other-states).