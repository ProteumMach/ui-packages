# Toolpath

Official open-source SDKs, UI primitives, and examples for building applications with the
[Toolpath Engine API](https://developers.toolpath.com).

Toolpath analyzes a CAD part so you can understand whether it fits your shop, how it can be
machined, and what it may cost. This repository helps you call that API from TypeScript, JavaScript,
or Python.

> **Release status:** The source code, UI package, and examples are available now. The first npm and PyPI
> releases have not been published yet, so the registry installation commands below will return
> “not found” until that release is complete. See [Run the examples from source](#run-the-examples-from-source)
> if you want to evaluate the project today.

## Choose where to start

| I want to…                           | Use                             | Documentation                                        |
| ------------------------------------ | ------------------------------- | ---------------------------------------------------- |
| Call Toolpath from JavaScript        | `@toolpath/api`                 | [TypeScript SDK](packages/sdk-typescript/README.md)  |
| Build a React UI with Toolpath style | `@toolpath/ui`                  | [Tailwind UI primitives](packages/ui/README.md)      |
| Call Toolpath from Python            | `toolpath`                      | [Python SDK](packages/sdk-python/README.md)          |
| Run a complete analysis application  | TypeScript or Python            | [Examples](#complete-part-analysis-examples)         |
| Call the API without an SDK          | HTTP, cURL, or another language | [API documentation](https://developers.toolpath.com) |
| Inspect the exact public API shape   | OpenAPI 3.1                     | [OpenAPI document](openapi/openapi.json)             |

The SDKs are generated from the same OpenAPI document, so their request and response types match the
public API contract retained in this repository.

## Before you begin

To analyze a part, you need:

1. A Toolpath account and API key. [Create a key in your Toolpath account](https://portal.toolpath.com/api-keys).
2. A STEP CAD file to upload.
3. One supported programming environment:
   - TypeScript/JavaScript: [Node.js 24](https://nodejs.org/en/download)
   - Python: [Python 3.11 or newer](https://www.python.org/downloads/)

## How part analysis works

Part analysis is asynchronous and currently uses polling:

1. Create a part and receive a temporary upload URL.
2. Upload the STEP file directly to that URL.
3. Start analysis and receive a job ID.
4. Request the report periodically until it is ready.
5. Read or print the returned report.

The SDKs provide an async `analyzePart` / `analyze_part` workflow for this lifecycle, while retaining
generated low-level API bindings for custom integrations.

## Complete part-analysis examples

The runnable examples perform the entire workflow and print the final report as formatted JSON:

- [TypeScript example](examples/typescript/README.md)
- [Python example](examples/python/README.md)

## Run the examples from source

### 1. Install the development tools

| Tool                                                          | What it does                                                   | Required for         |
| ------------------------------------------------------------- | -------------------------------------------------------------- | -------------------- |
| [Git](https://git-scm.com/downloads)                          | Downloads the repository and tracks source changes             | All source workflows |
| [Node.js 24.18+](https://nodejs.org/en/download)              | Runs the JavaScript tools; its installer also provides `npm`   | All source workflows |
| Corepack                                                      | Activates the exact `pnpm` version declared by this repository | All source workflows |
| pnpm                                                          | Installs and runs this repository's JavaScript dependencies    | All source workflows |
| [Python 3.11+](https://www.python.org/downloads/)             | Runs the Python SDK and example                                | Python only          |
| [uv](https://docs.astral.sh/uv/getting-started/installation/) | Creates the Python environment and installs its dependencies   | Python only          |

You do not need Corepack or pnpm merely to use a package installed from npm; they are development tools for this repository.

Verify that Git and Node.js are available:

```bash
git --version
node --version
```

The Node.js version must be `v24.18.0` or newer within the `v24` release line.

### 2. Download and prepare the repository

Open PowerShell, Command Prompt, Terminal, or your editor's terminal, then run:

```bash
git clone https://github.com/toolpath/toolpath.git
cd toolpath
corepack enable pnpm
pnpm install --frozen-lockfile
```

### 3. Run the TypeScript example

Replace the sample key and file path with your own values.

Windows PowerShell:

```powershell
$env:TOOLPATH_API_KEY = "your-api-key"
pnpm --filter @toolpath/example-typescript analyze -- "C:\path\to\part.step"
```

Windows Command Prompt:

```batch
set TOOLPATH_API_KEY=your-api-key
pnpm --filter @toolpath/example-typescript analyze -- "C:\path\to\part.step"
```

macOS or Linux:

```bash
TOOLPATH_API_KEY="your-api-key" pnpm --filter @toolpath/example-typescript analyze -- "/path/to/part.step"
```

The command displays status messages while it waits, then prints the complete analysis report.

### 4. Run the Python example

Install `uv` using its [platform-specific instructions](https://docs.astral.sh/uv/getting-started/installation/),
then set `TOOLPATH_API_KEY` as shown above.

Windows:

```powershell
uv run --project examples/python python examples/python/src/analyze_part.py "C:\path\to\part.step"
```

macOS or Linux:

```bash
uv run --project examples/python python examples/python/src/analyze_part.py "/path/to/part.step"
```

## License

This project is licensed under the [MIT License](LICENSE).
