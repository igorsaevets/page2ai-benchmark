# What are runes?


rune/ruːn/nounA letter or mark used as a mystical or magic symbol.


Runes are symbols that you use in `.svelte` and `.svelte.js` / `.svelte.ts` files to control the Svelte compiler. If you think of Svelte as a language, runes are part of the syntax — they are *keywords*.

Runes have a `$` prefix and look like functions:

`let ``let message: string`message = ```
function $state<"hello">(initial: "hello"): "hello" (+1 overload)
namespace $state
```

Declares reactive state.

Example:

`let count = $state(0);`

$state('hello');They differ from normal JavaScript functions in important ways, however:

- You don't need to import them — they are part of the language
- They're not values — you can't assign them to a variable or pass them as arguments to a function
- Just like JavaScript keywords, they are only valid in certain positions (the compiler will help you if you put them in the wrong place)

## Legacy mode

Runes didn't exist prior to Svelte 5.


[ Edit this page on GitHub](https://github.com/sveltejs/svelte/edit/main/documentation/docs/02-runes/01-what-are-runes.md) [ llms.txt](https://svelte.dev/docs/svelte/what-are-runes/llms.txt)

previous next