# Toolpath Python SDK

Async SDK for the Toolpath Engine API.

```python
import asyncio
import os

from toolpath import Toolpath


async def main() -> None:
    toolpath = Toolpath(os.environ["TOOLPATH_API_KEY"])
    report = await toolpath.analyze_part("/path/to/part.step")
    print(report.to_dict())


asyncio.run(main())
```

`Toolpath` is the stable, hand-written workflow façade. Its `api` property exposes the generated
authenticated client for lower-level use. Generated operations and models are available under
`toolpath.generated`; do not edit them by hand.
