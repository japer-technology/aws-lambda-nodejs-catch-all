# Recommendations — Round 1

A deep review of the `aws-lambda-nodejs-catch-all` project: a universal AWS Lambda
entry point that inspects each incoming event and routes it to a source‑specific
handler. The codebase is small, clean, well‑commented, and well‑tested (41 passing
tests, lint passing). The recommendations below are about making the project a
more trustworthy *reference template* — closing correctness gaps in the tooling,
hardening the security posture of the example handlers, and clarifying intent.

---

## 0. What this project is trying to be (and how to judge it)

This is not a single business Lambda — it is a **dispatcher / reference scaffold**.
Its value proposition is:

- A single entry point (`index.mjs`) that recognises ~25 AWS event shapes.
- A data‑driven, ordered dispatch table (`dispatch-config.js`) that is trivial to
  extend.
- One thin, documented stub handler per event source under `handlers/`.

That framing drives the priorities below: the *dispatching machinery* and the
*developer experience* must be rock solid, while the individual handlers are
deliberately minimal placeholders. The biggest risks are therefore (a) tooling
that silently does less than it claims, and (b) placeholder handlers that are
unsafe to deploy as‑is without a clear warning.

---

## 1. High priority — correctness & build/CI integrity

These are concrete defects where the project does *less* than it appears to.

### 1.1 CI uses `npm ci`, but `package-lock.json` is git‑ignored
`.gitignore` excludes `package-lock.json`, and `git ls-files` confirms no lockfile
is tracked. However `.github/workflows/CI.yml` runs `npm ci`, which **requires** a
committed lockfile and will fail on a clean checkout. `actions/setup-node` with
`cache: 'npm'` also expects a lockfile to compute its cache key.

**Recommendation:** commit `package-lock.json` and remove it from `.gitignore`.
Committing the lockfile is the standard practice for reproducible, secure installs
and is effectively mandatory for `npm ci`.

### 1.2 ESLint "recommended" rules are silently discarded
In `eslint.config.js` the config object spreads `...js.configs.recommended` and
then declares its own `rules:` key *after* the spread. Because the later key wins,
the entire recommended ruleset is replaced by the single `no-unused-vars` rule.
Verified with `eslint --print-config`: `no-undef`, `no-cond-assign`,
`no-dupe-keys`, etc. are all `undefined` (inactive).

**Impact:** the lint gate is far weaker than intended — undefined variables,
duplicate object keys, and similar foot‑guns would pass CI.

**Recommendation:** merge the recommended rules with the custom overrides instead
of overwriting them (e.g. spread `js.configs.recommended.rules` into the `rules`
object, or list `js.configs.recommended` as its own flat‑config entry before the
customisation block).

### 1.3 `globals` is used but not declared as a dependency
`eslint.config.js` imports `globals`, yet it does not appear in `package.json`.
Linting currently works only because `globals` is a transitive dependency of
ESLint. A future ESLint release that drops or moves that transitive dep would
break `npm run lint` with no local change.

**Recommendation:** add `globals` to `devDependencies` explicitly.

### 1.4 `npm run build` is a no‑op, yet docs say it regenerates declarations
`tsconfig.json` sets `emitDeclarationOnly: true` with `include: ["**/*.ts"]`, but
there are **no `.ts` source files** — the `.d.ts` files under `handlers/` and
`index.d.ts` are hand‑maintained. Running `npm run build` emits nothing (no `dist/`
is produced). The README states "Run `npm run build` to regenerate them after
making changes," which is misleading.

**Recommendation:** pick one model and make it true:
- Either author handlers in TypeScript (or JSDoc with `allowJs`/`checkJs`) and let
  `tsc` genuinely generate the `.d.ts` files; or
- Drop the build step and document the `.d.ts` files as hand‑maintained.
Also reconcile `outDir: "dist"` with the fact that declarations live next to
sources today.

---

## 2. High priority — security posture of the example handlers

The handlers are stubs, but several stubs model *security‑sensitive* event sources.
Shipping permissive defaults without loud warnings invites copy‑paste mistakes.

### 2.1 Authorizers always return "Allow"
`handleAuthorizerV1` returns an `Allow` policy for any `methodArn`, and
`handleAuthorizerV2` returns `{ isAuthorized: true }` unconditionally. As a
catch‑all default this is an **allow‑all authorizer** — the most dangerous possible
default for an authorization component.

**Recommendation:** keep the example but make the danger explicit — default to
deny (or throw `Unauthorized`), and add a prominent comment / README note that
these are non‑functional placeholders that must be replaced before deployment.

### 2.2 Debug logging serialises entire events and context (PII/secret leakage)
Every handler calls `collectInvocation(event, context, ...)` and then
`logDebug('invocation', invocation)`, which JSON‑stringifies the **whole event and
context**. Several modelled sources carry sensitive data: authorizer bearer tokens
(`authorizationToken`), Cognito user attributes, SES message contents, request
bodies/headers, etc. With `DEBUG` enabled these land verbatim in CloudWatch Logs.
Some handlers additionally `console.log` raw payload fields unconditionally
(e.g. `handleCloudWatchLogs` logs every decoded log message; `handleWebSocket`,
`handleCognito`, `handleStepFunctions` log inputs/routes).

The git history shows a prior "redact event information" effort, but full‑event
logging via `collectInvocation` remains the default path.

**Recommendation:** introduce a small redaction/allow‑list step before logging
event bodies, gate raw `console.log` of payloads behind `DEBUG`, and document the
logging behaviour so deployers understand what reaches their logs.

### 2.3 No payload validation or size guarding
Handlers index into nested fields after the dispatch `check` passes, trusting event
shape. For a public template this is acceptable, but worth a documented note that
handlers assume well‑formed AWS events and perform no defensive validation.

---

## 3. Medium priority — robustness of the dispatcher

### 3.1 Make dispatch ambiguity explicit
Dispatch is first‑match‑wins over an ordered list, and the ordering encodes real
precedence decisions (e.g. `handleScheduled` before `handleEventBridge`, ALB before
HTTP v1, authorizer v2 before HTTP v2). This is correct today but fragile: a new
rule inserted in the wrong place can silently shadow another.

**Recommendation:** document the ordering contract at the top of
`dispatch-config.js` (why specialised checks must precede general ones), and
consider a test that asserts each `examples/*.json` payload routes to its expected
handler — turning the ordering invariant into an executed guarantee.

### 3.2 Centralise the "is this an HTTP/WS event" decision
`index.mjs` re‑derives whether an event is HTTP/WebSocket (for the 500 fallback)
with logic that partly duplicates the dispatch `check` predicates. Drift between
the two would produce inconsistent error behaviour.

**Recommendation:** derive the error‑response shape from the matched handler (or a
shared helper) rather than re‑sniffing the event in the `catch` block.

### 3.3 Minor defensive‑coding inconsistency
`handleFirehose` uses `event.records.map(...)` without optional chaining while most
other handlers use `?.`. It is safe given the dispatch check, but inconsistent with
the codebase's otherwise defensive style.

---

## 4. Medium priority — developer experience & docs

- **Lockfile + Node version:** with the lockfile committed (§1.1), add an `.nvmrc`
  / document the Node 20 requirement consistently (already in `engines`).
- **CI scope:** the workflow triggers on `push` only; `pull_request` is commented
  out. Re‑enabling PR builds is the main value of CI for a contribution‑friendly
  repo.
- **Coverage signal:** tests are good but there is no coverage reporting or
  threshold. A coverage gate would protect the "one tested handler per source"
  guarantee as the table grows.
- **README/build reconciliation:** fix the `npm run build` description (§1.4) and
  ensure the "Adding a new handler" checklist matches the actual data‑driven flow
  (handler module + `handlerMap` entry in `dispatcher.js` + `dispatch-config.js`
  rule + test).

---

## 5. Low priority / polish

- Consider replacing scattered `console.log/warn/error` with the existing
  `logger.js` abstraction for consistent, level‑aware output.
- The package `name` in `package.json` (`aws-lambda-nodejs-handler`) differs from
  the repository name (`aws-lambda-nodejs-catch-all`); align for discoverability if
  publishing.
- `author`/`keywords` in `package.json` are empty — fill in before any publish.

---

## Suggested order of attack

1. **§1.1–1.3** — restore the integrity of the CI/lint gate (lockfile, ESLint
   recommended rules, `globals` dependency). These are cheap and unblock trustworthy
   automated checks for everything that follows.
2. **§2.1–2.2** — make the security‑sensitive placeholders safe‑by‑default and stop
   leaking event/context data into logs.
3. **§1.4 & §3** — decide the TypeScript/build story and harden the dispatcher with
   an example‑routing test.
4. **§4–§5** — DX and polish.

> Scope note: this round is analysis only — no source files were changed. Items are
> intentionally described as outcomes, not patches, so they can be triaged and
> sequenced before implementation.
