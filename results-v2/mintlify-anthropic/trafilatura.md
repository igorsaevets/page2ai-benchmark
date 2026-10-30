For how zero data retention (ZDR) applies to this feature, see [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention).

Extended thinking (`thinking.type: "enabled"` with `budget_tokens`) is deprecated on the Claude 4.6 models (requests using it still succeed). Claude 4.7 and later models do not support it and reject requests that use it, returning a 400 error. On Claude 4.5 and earlier models that support thinking, extended thinking is the only available thinking mode. Claude Mythos Preview supports both modes. Where both modes are available, use [adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/thinking) instead.

See [Migrating to adaptive thinking](https://platform.claude.com#migrating-to-adaptive-thinking) to move to adaptive thinking. If your model supports only extended thinking, this page describes the supported configuration; no change is needed until you move to a newer model.

If a request fails with a 400 error whose message starts with `"thinking.type.enabled" is not supported`, your model uses adaptive thinking instead. See [Troubleshooting thinking](https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting#error-thinking-type-enabled), or jump to [Migrating to adaptive thinking](https://platform.claude.com#migrating-to-adaptive-thinking).

Extended thinking in manual mode gives you direct control over how much Claude thinks. You set a thinking token budget on each request with `thinking: {type: "enabled", budget_tokens: N}`, and Claude thinks against that budget before it starts its final answer. Manual mode remains useful when your workload requires predictable latency or precise control over thinking costs. This page covers how to set and tune the budget, how manual mode interacts with interleaved thinking and prompt caching, and how to migrate to adaptive thinking.

For how thinking itself works, including thinking blocks and the response shape, the `display` parameter, streaming, thinking with tool use, and encryption, see the [thinking overview](https://platform.claude.com/docs/en/build-with-claude/thinking).

Extended thinking availability per model, including the models where extended thinking is the only mode, is listed in the [per-model configuration table](https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting#supported-models).

Here is an example of using extended thinking in the Messages API:

```
client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[
        {
            "role": "user",
            "content": "Are there an infinite number of prime numbers such that n mod 4 == 3?",
        }
    ],
)
# The response contains summarized thinking blocks and text blocks
for block in response.content:
    match block.type:
        case "thinking":
            print(f"\nThinking summary: {block.thinking}")
        case "text":
            print(f"\nResponse: {block.text}")
```
To turn on manual extended thinking, add a `thinking` object with `type` set to `enabled` and a `budget_tokens` value.

The `budget_tokens` parameter sets a target for how many tokens Claude can use for its internal reasoning process. Larger budgets can improve response quality by enabling more thorough analysis for complex problems.

`budget_tokens` must satisfy these constraints:

`max_tokens`.`max_tokens` limit for the turn, so the budget must leave room for the final response. The one exception is `budget_tokens` can exceed `max_tokens` because the budget spans all thinking blocks within one assistant turn.`budget_tokens` must be less than `max_tokens`, extended thinking cannot be combined with `max_tokens: 0` (The budget is a target rather than a strict cap. Actual token usage varies with the task, and Claude may stop reasoning well before the budget is exhausted; `max_tokens` remains the hard ceiling on total output.

On Claude Opus 4.5, the only extended-thinking-only model that supports [effort](https://platform.claude.com/docs/en/build-with-claude/effort), effort shapes the overall response while `budget_tokens` sets thinking depth; set both.

To tune the budget:

To track what a budget actually costs you, monitor the `usage.output_tokens_details.thinking_tokens` field in the response, which reports how many of the billed output tokens were internal reasoning. When streaming, this breakdown appears only on the final `message_delta` event.

When you are ready to move off manual budgets, see [Migrating to adaptive thinking](https://platform.claude.com#migrating-to-adaptive-thinking).

Interleaved thinking lets Claude think between tool calls within a single assistant turn, reasoning about each tool result before deciding what to do next. For the concept, the turn structure, and how it behaves on adaptive-thinking models, see [interleaved thinking](https://platform.claude.com/docs/en/build-with-claude/thinking#interleaved-thinking) in the thinking overview. This section covers how to enable it when you use manual `type: "enabled"` thinking.

On Claude Opus 4.5, Claude Sonnet 4.5, and earlier Claude 4 models (Claude Opus 4.1 (deprecated), Claude Opus 4, and Claude Sonnet 4), add the `interleaved-thinking-2025-05-14` [beta header](https://platform.claude.com/docs/en/api/beta-headers) to your API request.

The 4.6 generation splits in manual mode:

`type: "enabled"` is still functional but deprecated. Prefer `thinking: {type: "adaptive"}` if you need reasoning between tool calls on this model.Claude Haiku 4.5 does not support interleaved thinking. On the Claude API, the beta header is accepted but ignored.

Two more considerations for interleaved thinking in manual mode:

`budget_tokens` can exceed `max_tokens` here; the How platforms treat the beta header differs. The Claude API and [Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws) accept `interleaved-thinking-2025-05-14` on any model and ignore it where unsupported. Acceptance is not the same as effect: on models that reject `type: "enabled"` (4.7 and later) or lack manual-mode interleaving (Claude Opus 4.6), the header has no manual-mode effect; adaptive thinking interleaves automatically there.

Partner-operated platforms ([Amazon Bedrock](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock) and [Google Cloud](https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai)) likewise accept the header on any model without returning an error, and ignore it on models that don't support interleaved thinking.

The general turn-structure rules, including the single-turn tool-use loop, mid-turn conflict handling, and toggling thinking between turns, are on [Thinking with tool use](https://platform.claude.com/docs/en/build-with-claude/thinking#thinking-with-tool-use).

Manual mode adds one requirement: the final assistant turn of a thinking-enabled request must begin with a thinking block ([adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/thinking) drops that requirement). Changing the thinking configuration between turns also invalidates prompt caching; see the following section.

Manual mode adds one rule on top of the mode-neutral caching behavior described in [thinking and prompt caching](https://platform.claude.com/docs/en/build-with-claude/thinking#thinking-and-prompt-caching): changing `budget_tokens` between requests invalidates cache breakpoints, just as switching thinking modes does, because the budget value is rendered into the prompt. Message-level breakpoints always miss after a budget change; whether tool and system-prompt breakpoints miss too depends on where the model renders the configuration.

In practice, pick a budget and hold it stable for the life of a cached conversation. Running a multi-turn conversation with message-level caching on Claude Sonnet 4.6 and changing the budget on the third request from 4,000 to 8,000 tokens shows the invalidation directly:

```
First request - establishing cache
First response usage: { cache_creation_input_tokens: 1370, cache_read_input_tokens: 0, input_tokens: 17, output_tokens: 700 }
Second request - same thinking parameters (cache hit expected)
Second response usage: { cache_creation_input_tokens: 0, cache_read_input_tokens: 1370, input_tokens: 303, output_tokens: 874 }
Third request - different thinking budget (cache miss expected)
Third response usage: { cache_creation_input_tokens: 1370, cache_read_input_tokens: 0, input_tokens: 747, output_tokens: 619 }
```
The third request re-creates the cache (`cache_creation_input_tokens=1370`, `cache_read_input_tokens=0`) because the budget changed between requests. For a runnable version of the same experiment in adaptive mode, where the effort level plays the cache role that `budget_tokens` plays here, see [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost#prompt-caching) on the steering page.

Most thinking behavior is mode neutral and documented once on the [Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking) page. Everything there applies in manual mode too:

If your model supports only extended thinking (Claude Sonnet 4.5, Claude Opus 4.5, Claude Haiku 4.5, and earlier Claude 4 models), no action is needed now: adaptive thinking is not available there, and `type: "adaptive"` [returns a 400 error](https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting#error-thinking-type-adaptive). Keep `budget_tokens` until you move to a model that supports adaptive thinking, then apply the mapping that follows.

You need to migrate off `type: "enabled"` if:

`budget_tokens` is deprecated.`type: "enabled"` returns a 400 error.The mapping is small: remove `budget_tokens`, set `thinking: {type: "adaptive"}`, and control reasoning depth with `output_config: {effort: ...}` instead of a token budget.

```
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 16000,
  "thinking": {
    "type": "enabled",
    "budget_tokens": 10000
  }
}
```
becomes:

```
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 16000,
  "thinking": {
    "type": "adaptive"
  },
  "output_config": {
    "effort": "high"
  }
}
```
`effort: "high"` matches the API default; it appears here only to show where the depth control now lives, and omitting it produces identical behavior.

Expect a behavioral difference, not just a syntax change. With a fixed budget, Claude thinks on every request. With adaptive thinking, Claude decides whether and how much to think on each request, and at lower [effort](https://platform.claude.com/docs/en/build-with-claude/effort) settings it may skip thinking entirely on easy inputs. You can also remove the `interleaved-thinking-2025-05-14` beta header after migrating: adaptive thinking interleaves automatically, and the Claude API ignores the header on these models. Thinking block preservation changes too: Claude Opus 4.5 and models numbered 4.6 and higher keep prior turns' thinking blocks in context and bill them as input, where Claude Sonnet 4.5, Claude Haiku 4.5, and earlier models stripped them; see [thinking block preservation by model](https://platform.claude.com/docs/en/build-with-claude/thinking#thinking-block-preservation-by-model).

Switching modes is a thinking-configuration change, so the first request after the switch invalidates cache breakpoints, as described in [Prompt caching in manual mode](https://platform.claude.com#extended-thinking-with-prompt-caching).

For full guidance, see [adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/thinking), [effort](https://platform.claude.com/docs/en/build-with-claude/effort), and the [model migration guide](https://platform.claude.com/docs/en/about-claude/models/migration-guide).

Learn how thinking works: blocks, display, streaming, and tool use.

Let Claude decide when and how much to think on each request.

Preserve thinking blocks and manage thinking across tool calls and turns.

Was this page helpful?