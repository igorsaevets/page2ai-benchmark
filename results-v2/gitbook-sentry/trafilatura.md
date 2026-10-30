# Browser JavaScript

## Learn how to manually set up Sentry in your JavaScript app and capture your first errors.

`Use curl to download, read and follow https://skills.sentry.dev/instrument to set up the Sentry Browser JavaScript SDK.`[View docs ↗](https://docs.sentry.io/ai/agent-plugin/)

##### Using a framework?

This guide focuses on plain JavaScript. If you're working with React, Next.js, or any other framework, choose the fitting SDK from the left-hand dropdown.

[Prerequisites](https://docs.sentry.io#prerequisites)

You need:

Choose the features you want to configure, and this guide will show you how:

[Install](https://docs.sentry.io#install)

We recommend installing Sentry via a package manager. If that isn't an option for you, you can use the [Loader Script](https://docs.sentry.io/platforms/javascript/install/loader/) or a CDN bundle.

[Option 1: Package Manager (Recommended)](https://docs.sentry.io#option-1-package-manager-recommended)

Run the command for your preferred package manager to add the Sentry SDK to your application:

```
npm install @sentry/browser --save
```
```
npm install @sentry/browser --save
```
```
yarn add @sentry/browser
```
```
pnpm add @sentry/browser
```
[Option 2: Loader Script](https://docs.sentry.io#option-2-loader-script)

In Sentry, go to **Settings > Projects > (select project) > SDK Setup > Loader Script**. Enable the features you want (for example, Tracing or Session Replay), copy the script tag, and place it before all other scripts in your app.

[Option 3: CDN Bundle](https://docs.sentry.io#option-3-cdn-bundle)

Sentry provides different bundles that include specific feature combinations. Go to our list of [available bundles](https://docs.sentry.io/platforms/javascript/install/loader/#cdn) and copy the one that fits your needs. Next, place the script tag before all other scripts in your app.

If you're updating your Sentry SDK to the latest version, check out our [migration guide](https://github.com/getsentry/sentry-javascript/blob/master/MIGRATION.md) to learn more about breaking changes.

[Configure](https://docs.sentry.io#configure)

[Initialize the Sentry SDK](https://docs.sentry.io#initialize-the-sentry-sdk)

Initialize Sentry as early as possible in your application's lifecycle. The setup differs slightly depending on how you installed the Sentry SDK. Be sure to follow the instructions in the related tab (npm, Loader, CDN):

```
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
```
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
```
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
```
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
[Add Readable Stack Traces With Source Maps (Optional)](https://docs.sentry.io#add-readable-stack-traces-with-source-maps-optional)

The stack traces in your Sentry errors probably won't look like your actual code without unminifying them. To fix this, upload your source maps to Sentry. The easiest way to do this is by using the Sentry Wizard.

Alternatively, take a look at our [Uploading Source Maps](https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/) documentation.

```
npx @sentry/wizard@latest -i sourcemaps
```
```
npx @sentry/wizard@latest -i sourcemaps
```
[Avoid Ad Blockers With Tunneling (Optional)](https://docs.sentry.io#avoid-ad-blockers-with-tunneling-optional)

You can prevent ad blockers from blocking Sentry events using tunneling. Use the `tunnel` option in `Sentry.init` to add an API endpoint in your application that forwards Sentry events to Sentry servers.

This will send all events to the `tunnel` endpoint. However, the events need to be parsed and redirected to Sentry, so you'll need to do additional configuration on the server. You can find a detailed explanation on how to do this on our [Troubleshooting page](https://docs.sentry.io/platforms/javascript/troubleshooting/#using-the-tunnel-option).

```
Sentry.init({
  dsn: "___PUBLIC_DSN___",
  tunnel: "/tunnel",
});
```
```
Sentry.init({
  dsn: "___PUBLIC_DSN___",
  tunnel: "/tunnel",
});
```
[Verify Your Setup](https://docs.sentry.io#verify-your-setup)

Let's test your setup and confirm that data reaches your Sentry project.

[Issues](https://docs.sentry.io#issues)

To verify that Sentry captures errors and creates issues in your Sentry project, add a button that throws an error when clicked.

Open the page in a browser and click the button to throw an error.

##### Important

Errors triggered from within your browser's developer tools (like the browser console) are sandboxed, so they will not trigger Sentry's error monitoring.

```
<script>
  function triggerError() {
    throw new Error("Sentry Test Error");
  }
</script>
<button onclick="triggerError()">Break the World</button>
```
```
<script>
  function triggerError() {
    throw new Error("Sentry Test Error");
  }
</script>
<button onclick="triggerError()">Break the World</button>
```
[Tracing](https://docs.sentry.io#tracing)

To test your tracing configuration, update the previous code to simulate a longer operation and start a trace.

Open the page in a browser and click the button to throw an error and create a trace.

```
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
```
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
[Logs NEW](https://docs.sentry.io#logs-)

To verify that Sentry catches your logs, add some log statements to your application:

```
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
```
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
[View Captured Data in Sentry](https://docs.sentry.io#view-captured-data-in-sentry)

Now, head over to your project on [Sentry.io](https://sentry.io) to view the collected data (it takes a couple of moments for the data to appear).

[Next Steps](https://docs.sentry.io#next-steps)

At this point, you should have integrated Sentry into your JavaScript application and should already be sending data to your Sentry project.

Now's a good time to customize your setup and look into more advanced topics. Our next recommended steps for you are:

- Explore [practical guides](https://docs.sentry.io/guides/)on what to monitor, log, track, and investigate after setup
- Extend Sentry to your backend using one of our [SDKs](https://docs.sentry.io/)
- Learn how to [manually capture errors](https://docs.sentry.io/platforms/javascript/usage/)
- Continue to [customize your configuration](https://docs.sentry.io/platforms/javascript/configuration/)
- Get familiar with [Sentry's product features](https://docs.sentry.io/product/)like tracing, insights, and alerts

**Help improve this content**

Our documentation is open source and available on GitHub. Your contributions are welcome, whether fixing a typo (drat!) or suggesting an update ("yeah, this would be better").