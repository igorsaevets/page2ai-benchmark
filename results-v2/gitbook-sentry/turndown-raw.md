[Skip to content](#main)

[

![Sentry's logo](/_next/static/media/sentry-logo-dark.fc8e1eeb.svg)

Docs](/ "Sentry error monitoring")

*   [SDKs](/platforms/)
*   [Product](/product/)
*   [AI](/ai/)
*   [Guides](/guides/)
*   Concepts
    
*   [API](/api/)
*   Manage
    

Ask AI

[Go to Sentry](https://sentry.io/)

Open Main Menu

*   [
    
    Sentry for JavaScript
    
    ](/platforms/javascript/)
    *   [
        
        Quick Start
        
        ](/platforms/javascript/)
        
    *   [
        
        Installation Methods
        
        ](/platforms/javascript/install/)
    
    * * *
    
    *   Features
    *   [
        
        Capturing Errors
        
        ](/platforms/javascript/usage/)
    *   [
        
        Source Maps
        
        ](/platforms/javascript/sourcemaps/)
    *   [
        
        Logs
        
        ](/platforms/javascript/logs/)
    *   [
        
        Session Replay
        
        ](/platforms/javascript/session-replay/)
    *   [
        
        Tracing
        
        ](/platforms/javascript/tracing/)
    *   [
        
        Agent TracingNEW
        
        ](/platforms/javascript/agent-tracing-browser/)
    *   [
        
        Application MetricsNEW
        
        ](/platforms/javascript/metrics/)
    *   [
        
        Profiling
        
        ](/platforms/javascript/profiling/)
    *   [
        
        User Feedback
        
        ](/platforms/javascript/user-feedback/)
    *   [
        
        Feature Flags
        
        ](/platforms/javascript/feature-flags/)
    
    * * *
    
    *   Configuration
    *   [
        
        Sampling
        
        ](/platforms/javascript/sampling/)
    *   [
        
        Enriching Events
        
        ](/platforms/javascript/enriching-events/)
    *   [
        
        Extended Configuration
        
        ](/platforms/javascript/configuration/)
    *   [
        
        Data Management
        
        ](/platforms/javascript/data-management/)
    *   [
        
        Security Policy Reporting
        
        ](/platforms/javascript/security-policy-reporting/)
    *   [
        
        Special Use Cases
        
        ](/platforms/javascript/best-practices/)
    *   [
        
        Migration Guide
        
        ](/platforms/javascript/migration/)
    *   [
        
        Troubleshooting
        
        ](/platforms/javascript/troubleshooting/)

* * *

* * *

*   [
    
    Product Changelog
    
    ](https://sentry.io/changelog/)[
    
    Sandbox
    
    ](https://sandbox.sentry.io/)
    
    More
    

*   [Home](/)
*   [Platforms](/platforms/)
*   [JavaScript](/platforms/javascript/)

Copy page

# Browser JavaScript

## Learn how to manually set up Sentry in your JavaScript app and capture your first errors.

Agent-Assisted Setup

`Use curl to download, read and follow https://skills.sentry.dev/instrument to set up the Sentry Browser JavaScript SDK.`

Copy Prompt

Your agent will set up Sentry in your Browser JavaScript app automatically. Works with Cursor, Claude Code, Codex, and more.[View docs ↗](/ai/agent-plugin/)

Install the full plugin

Install the Sentry plugin to give your assistant every skill. See the [installation docs](/ai/agent-plugin/) for more details.

Copied

```
npx @sentry/ai install
```

##### Using a framework?

This guide focuses on plain JavaScript. If you're working with React, Next.js, or any other framework, choose the fitting SDK from the left-hand dropdown.

## [Prerequisites](#prerequisites)

You need:

*   A Sentry [account](https://sentry.io/signup/) and [project](/product/projects/)
*   Your application up and running

Choose the features you want to configure, and this guide will show you how:

Error MonitoringTracingSession ReplayLogsUser Feedback

Want to learn more about these features?

*   [**Issues**](/product/issues) (always enabled): Sentry's core error monitoring product that automatically reports errors, uncaught exceptions, and unhandled rejections. If you have something that looks like an exception, Sentry can capture it.
*   [**Tracing**](/product/tracing): Track software performance while seeing the impact of errors across multiple systems. For example, distributed tracing allows you to follow a request from the frontend to the backend and back.
*   [**Session Replay**](/product/session-replay/web): Get to the root cause of an issue faster by viewing a video-like reproduction of what was happening in the user's browser before, during, and after the problem.
*   [**Logs**](/product/logs): Centralize and analyze your application logs to correlate them with errors and performance issues. Search, filter, and visualize log data to understand what's happening in your applications.
*   [**User Feedback**](/product/user-feedback): Collect feedback directly from users when they encounter errors, allowing them to describe what happened and provide context that helps you understand and resolve issues faster.

## [Install](#install)

We recommend installing Sentry via a package manager. If that isn't an option for you, you can use the [Loader Script](/platforms/javascript/install/loader/) or a CDN bundle.

#### [Option 1: Package Manager (Recommended)](#option-1-package-manager-recommended)

Run the command for your preferred package manager to add the Sentry SDK to your application:

npmyarnpnpm

Copied

```bash
npm install @sentry/browser --save
```

```bash
npm install @sentry/browser --save
```

```bash
yarn add @sentry/browser
```

```bash
pnpm add @sentry/browser
```

#### [Option 2: Loader Script](#option-2-loader-script)

In Sentry, go to **Settings > Projects > (select project) > SDK Setup > Loader Script**. Enable the features you want (for example, Tracing or Session Replay), copy the script tag, and place it before all other scripts in your app.

#### [Option 3: CDN Bundle](#option-3-cdn-bundle)

Sentry provides different bundles that include specific feature combinations. Go to our list of [available bundles](/platforms/javascript/install/loader/#cdn) and copy the one that fits your needs. Next, place the script tag before all other scripts in your app.

If you're updating your Sentry SDK to the latest version, check out our [migration guide](https://github.com/getsentry/sentry-javascript/blob/master/MIGRATION.md) to learn more about breaking changes.

## [Configure](#configure)

### [Initialize the Sentry SDK](#initialize-the-sentry-sdk)

Initialize Sentry as early as possible in your application's lifecycle. The setup differs slightly depending on how you installed the Sentry SDK. Be sure to follow the instructions in the related tab (npm, Loader, CDN):

npm

Copied

```javascript
import * as Sentry from "___SDK_PACKAGE___";

Sentry.init({
  dsn: "___PUBLIC_DSN___",

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },

  // Alternatively, use `process.env.npm_package_version` for a dynamic release version
  // if your build tool supports it.
  release: "my-project-name@2.3.12",
  integrations: [
    // ___PRODUCT_OPTION_START___ performance
    Sentry.browserTracingIntegration(),
    // ___PRODUCT_OPTION_END___ performance
    // ___PRODUCT_OPTION_START___ session-replay
    Sentry.replayIntegration(),
    // ___PRODUCT_OPTION_END___ session-replay
    // ___PRODUCT_OPTION_START___ user-feedback
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: "system",
    }),
    // ___PRODUCT_OPTION_END___ user-feedback
  ],
  // ___PRODUCT_OPTION_START___ logs

  // Enable logs to be sent to Sentry
  enableLogs: true,
  // ___PRODUCT_OPTION_END___ logs
  // ___PRODUCT_OPTION_START___ performance

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,

  // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // ___PRODUCT_OPTION_END___ performance
  // ___PRODUCT_OPTION_START___ session-replay

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // ___PRODUCT_OPTION_END___ session-replay
});
```

```javascript
import * as Sentry from "___SDK_PACKAGE___";

Sentry.init({
  dsn: "___PUBLIC_DSN___",

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },

  // Alternatively, use `process.env.npm_package_version` for a dynamic release version
  // if your build tool supports it.
  release: "my-project-name@2.3.12",
  integrations: [
    // ___PRODUCT_OPTION_START___ performance
    Sentry.browserTracingIntegration(),
    // ___PRODUCT_OPTION_END___ performance
    // ___PRODUCT_OPTION_START___ session-replay
    Sentry.replayIntegration(),
    // ___PRODUCT_OPTION_END___ session-replay
    // ___PRODUCT_OPTION_START___ user-feedback
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: "system",
    }),
    // ___PRODUCT_OPTION_END___ user-feedback
  ],
  // ___PRODUCT_OPTION_START___ logs

  // Enable logs to be sent to Sentry
  enableLogs: true,
  // ___PRODUCT_OPTION_END___ logs
  // ___PRODUCT_OPTION_START___ performance

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 1.0,

  // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // ___PRODUCT_OPTION_END___ performance
  // ___PRODUCT_OPTION_START___ session-replay

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // ___PRODUCT_OPTION_END___ session-replay
});
```

```html
<script
  src="https://js.sentry-cdn.com/___PUBLIC_KEY___.min.js"
  crossorigin="anonymous"
></script>

<script>
  window.sentryOnLoad = function () {
    Sentry.init({
      dsn: "___PUBLIC_DSN___",

      dataCollection: {
        // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
        // https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection
        // userInfo: false,
        // httpBodies: [],
      },

      // Alternatively, use `process.env.npm_package_version` for a dynamic release version
      // if your build tool supports it.
      release: "my-project-name@2.3.12",
      integrations: [
        // ___PRODUCT_OPTION_START___ performance
        Sentry.browserTracingIntegration(),
        // ___PRODUCT_OPTION_END___ performance
        // ___PRODUCT_OPTION_START___ session-replay
        Sentry.replayIntegration(),
        // ___PRODUCT_OPTION_END___ session-replay
        // ___PRODUCT_OPTION_START___ user-feedback
        Sentry.feedbackIntegration({
          // Additional SDK configuration goes in here, for example:
          colorScheme: "system",
        }),
        // ___PRODUCT_OPTION_END___ user-feedback
      ],
      // ___PRODUCT_OPTION_START___ logs

      // Enable logs to be sent to Sentry
      enableLogs: true,
      // ___PRODUCT_OPTION_END___ logs
      // ___PRODUCT_OPTION_START___ performance

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for tracing.
      // We recommend adjusting this value in production
      // Learn more at
      // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
      tracesSampleRate: 1.0,

      // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
      tracePropagationTargets: [
        "localhost",
        /^https:\/\/yourserver\.io\/api/,
      ],
      // ___PRODUCT_OPTION_END___ performance
      // ___PRODUCT_OPTION_START___ session-replay

      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error
      // Learn more at
      // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // ___PRODUCT_OPTION_END___ session-replay
    });
  };
</script>
```

```html
<script
  src="https://browser.sentry-cdn.com/10.68.0/bundle.tracing.min.js"
  integrity="sha384-IDGicfmkFBjzbyXFRgxkdVAjmPeBqxWZUv7oUbKSCAc+OEMdNXzrciXnPJzd17Xc"
  crossorigin="anonymous"
></script>

<script>
  Sentry.init({
    dsn: "___PUBLIC_DSN___",

    dataCollection: {
      // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
      // https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection
      // userInfo: false,
      // httpBodies: [],
    },

    // Alternatively, use `process.env.npm_package_version` for a dynamic release version
    // if your build tool supports it.
    release: "my-project-name@2.3.12",
    integrations: [
      // ___PRODUCT_OPTION_START___ performance
      Sentry.browserTracingIntegration(),
      // ___PRODUCT_OPTION_END___ performance
      // ___PRODUCT_OPTION_START___ session-replay
      Sentry.replayIntegration(),
      // ___PRODUCT_OPTION_END___ session-replay
      // ___PRODUCT_OPTION_START___ user-feedback
      Sentry.feedbackIntegration({
        // Additional SDK configuration goes in here, for example:
        colorScheme: "system",
      }),
      // ___PRODUCT_OPTION_END___ user-feedback
    ],
    // ___PRODUCT_OPTION_START___ logs

    // Enable logs to be sent to Sentry
    enableLogs: true,
    // ___PRODUCT_OPTION_END___ logs
    // ___PRODUCT_OPTION_START___ performance

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,

    // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    // ___PRODUCT_OPTION_END___ performance
    // ___PRODUCT_OPTION_START___ session-replay

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // ___PRODUCT_OPTION_END___ session-replay
  });
</script>
```

### [Add Readable Stack Traces With Source Maps (Optional)](#add-readable-stack-traces-with-source-maps-optional)

The stack traces in your Sentry errors probably won't look like your actual code without unminifying them. To fix this, upload your source maps to Sentry. The easiest way to do this is by using the Sentry Wizard.

Alternatively, take a look at our [Uploading Source Maps](/platforms/javascript/sourcemaps/uploading/) documentation.

Bash

Copied

```bash
npx @sentry/wizard@latest -i sourcemaps
```

```bash
npx @sentry/wizard@latest -i sourcemaps
```

### [Avoid Ad Blockers With Tunneling (Optional)](#avoid-ad-blockers-with-tunneling-optional)

You can prevent ad blockers from blocking Sentry events using tunneling. Use the `tunnel` option in `Sentry.init` to add an API endpoint in your application that forwards Sentry events to Sentry servers.

This will send all events to the `tunnel` endpoint. However, the events need to be parsed and redirected to Sentry, so you'll need to do additional configuration on the server. You can find a detailed explanation on how to do this on our [Troubleshooting page](/platforms/javascript/troubleshooting/#using-the-tunnel-option).

JavaScript

Copied

```javascript
Sentry.init({
  dsn: "___PUBLIC_DSN___",
  tunnel: "/tunnel",
});
```

```javascript
Sentry.init({
  dsn: "___PUBLIC_DSN___",
  tunnel: "/tunnel",
});
```

## [Verify Your Setup](#verify-your-setup)

Let's test your setup and confirm that data reaches your Sentry project.

### [Issues](#issues)

To verify that Sentry captures errors and creates issues in your Sentry project, add a button that throws an error when clicked.

Open the page in a browser and click the button to throw an error.

##### Important

Errors triggered from within your browser's developer tools (like the browser console) are sandboxed, so they will not trigger Sentry's error monitoring.

HTML

Copied

```html
<script>
  function triggerError() {
    throw new Error("Sentry Test Error");
  }
</script>

<button onclick="triggerError()">Break the World</button>
```

```html
<script>
  function triggerError() {
    throw new Error("Sentry Test Error");
  }
</script>

<button onclick="triggerError()">Break the World</button>
```

### [Tracing](#tracing)

To test your tracing configuration, update the previous code to simulate a longer operation and start a trace.

Open the page in a browser and click the button to throw an error and create a trace.

HTML

Copied

```html
<script>
  function triggerError() {
       await Sentry.startSpan(
        { name: "Example Frontend Span", op: "test" },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));

          throw new Error("Sentry Test Error");
        },
      );
     }
</script>

<button onclick="triggerError()">Break the World</button>
```

```html
<script>
  function triggerError() {
       await Sentry.startSpan(
        { name: "Example Frontend Span", op: "test" },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200));

          throw new Error("Sentry Test Error");
        },
      );
     }
</script>

<button onclick="triggerError()">Break the World</button>
```

### [Logs NEW](#logs-)

To verify that Sentry catches your logs, add some log statements to your application:

JavaScript

Copied

```javascript
Sentry.logger.info("User example action completed");

Sentry.logger.warn("Slow operation detected", {
  operation: "data_fetch",
  duration: 3500,
});

Sentry.logger.error("Validation failed", {
  field: "email",
  reason: "Invalid email",
});
```

```javascript
Sentry.logger.info("User example action completed");

Sentry.logger.warn("Slow operation detected", {
  operation: "data_fetch",
  duration: 3500,
});

Sentry.logger.error("Validation failed", {
  field: "email",
  reason: "Invalid email",
});
```

### [View Captured Data in Sentry](#view-captured-data-in-sentry)

Now, head over to your project on [Sentry.io](https://sentry.io) to view the collected data (it takes a couple of moments for the data to appear).

Need help locating the captured errors in your Sentry project?

*   Open the [**Issues**](https://sentry.io/orgredirect/organizations/:orgslug/issues/) page and select an error from the issues list to view the full details and context of this error. For more details, see this [interactive walkthrough](/product/sentry-basics/integrate-frontend/generate-first-error/#ui-walkthrough).
*   Open the [**Traces**](https://sentry.io/orgredirect/organizations/:orgslug/explore/traces/) page and select a trace to reveal more information about each span, its duration, and any errors. For an interactive UI walkthrough, click [here](/product/sentry-basics/distributed-tracing/generate-first-error/#ui-walkthrough).
*   Open the [**Replays**](https://sentry.io/orgredirect/organizations/:orgslug/replays/) page and select an entry from the list to get a detailed view where you can replay the interaction and get more information to help you troubleshoot.
*   Open the [**Logs**](https://sentry.io/orgredirect/organizations/:orgslug/explore/logs/) page and filter by service, environment, or search keywords to view log entries from your application. For an interactive UI walkthrough, click [here](/product/logs/#overview).
*   Open the [**User Feedback**](https://sentry.io/orgredirect/organizations/:orgslug/feedback/) page and click on individual feedback to see more details all in one view. For more information, click [here](/product/user-feedback/).

## [Next Steps](#next-steps)

At this point, you should have integrated Sentry into your JavaScript application and should already be sending data to your Sentry project.

Now's a good time to customize your setup and look into more advanced topics. Our next recommended steps for you are:

*   Explore [practical guides](/guides/) on what to monitor, log, track, and investigate after setup
*   Extend Sentry to your backend using one of our [SDKs](/)
*   Learn how to [manually capture errors](/platforms/javascript/usage/)
*   Continue to [customize your configuration](/platforms/javascript/configuration/)
*   Get familiar with [Sentry's product features](/product/) like tracing, insights, and alerts

Are you having problems setting up the SDK?

*   Find various support topics in [troubleshooting](/platforms/javascript/troubleshooting/)
*   [Get support](https://www.sentry.help/en/)

[

Previous

Welcome to Sentry



](/)

[

Next

Installation Methods



](/platforms/javascript/install/)

Was this helpful?

Yes 👍No 👎

How can we improve this page?

Email (optional)

Submit feedback

**Help improve this content**  
Our documentation is open source and available on GitHub. Your contributions are welcome, whether fixing a typo (drat!) or suggesting an update ("yeah, this would be better").

[How to contribute](https://docs.sentry.io/contributing/)   |  [Edit this page](https://github.com/getsentry/sentry-docs/edit/master/docs/platforms/javascript/common/index.mdx)   |  [Create a docs issue](https://github.com/getsentry/sentry-docs/issues/new/choose)   |  [Get support](https://www.sentry.help/en/)

### Package Details

*   Latest version: 10.68.0
*   [npm:@sentry/browser](https://npmjs.com/package/@sentry/browser)
*   [Repository on GitHub](https://github.com/getsentry/sentry-javascript)