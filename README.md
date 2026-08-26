# Toolpath

Official open-source SDKs, UI primitives, and examples for building applications with the
[Toolpath API](https://developers.toolpath.com).

Toolpath analyzes a CAD part so you can understand whether it fits your shop, how it can be
machined, and what it may cost.

## Where to start

| I want to…                    | Use                             | Documentation                                                      |
| ----------------------------- | ------------------------------- | ------------------------------------------------------------------ |
| Call Toolpath from JavaScript | `@toolpath/api`                 | [TypeScript SDK](packages/sdk-typescript)                          |
| Call Toolpath from Python     | `toolpath`                      | [Python SDK](packages/sdk-python)                                  |
| See SDK usage examples        | TypeScript or Python            | [Examples](#part-upload-examples)                                  |
| Start a customer application  | Part Viewer template            | [toolpath-template](https://github.com/toolpath/toolpath-template) |
| Call the API without an SDK   | HTTP, cURL, or another language | [API documentation](https://developers.toolpath.com)               |

The SDKs are generated from the same OpenAPI document, so their request and response types match the
public API contract retained in this repository. They also provide a focused helper for directly
uploading to the presigned URL returned by the create-part operation.

## Before you begin

To analyze a part, you need:

1. A Toolpath account and API key. [Create a key in your Toolpath account](https://portal.toolpath.com/api-keys).
2. A STEP CAD file to upload.
3. One supported programming environment:
   - TypeScript/JavaScript: [Node.js 24](https://nodejs.org/en/download)
   - Python: [Python 3.11 or newer](https://www.python.org/downloads/)

## Part-upload examples

The runnable examples create a part and upload its STEP file; your application controls analysis and
report retrieval through the generated API bindings:

- [TypeScript example](examples/typescript/README.md)
- [Python example](examples/python/README.md)
- [React viewer example](examples/react-viewer/README.md)

## Run the examples from source

### 1. Install the development tools

| Tool                                                          | What it does                                                   | Required for                    |
| ------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------- |
| [Git](https://git-scm.com/downloads)                          | Downloads the repository and tracks source changes             | All source workflows            |
| [Node.js 24.18+](https://nodejs.org/en/download)              | Runs the JavaScript tools; its installer also provides `npm`   | All source workflows            |
| Corepack                                                      | Activates the exact `pnpm` version declared by this repository | All source workflows            |
| pnpm                                                          | Installs and runs this repository's JavaScript dependencies    | All source workflows            |
| [Docker](https://www.docker.com/products/docker-desktop/)     | Runs the pinned TypeScript OpenAPI generator image             | SDK generation and `pnpm check` |
| [Python 3.11+](https://www.python.org/downloads/)             | Runs the Python SDK and example                                | Python only                     |
| [uv](https://docs.astral.sh/uv/getting-started/installation/) | Creates the Python environment and installs its dependencies   | Python only                     |

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
git clone https://github.com/toolpath/ui-packages.git
cd ui-packages
corepack enable pnpm
pnpm install --frozen-lockfile
```

### 3. Run the TypeScript part analysis example

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

The command prints the complete analysis report after the report is ready.

### 4. Run the Python part analysis example

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
