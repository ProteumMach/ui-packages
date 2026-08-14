# Toolpath Python SDK

Python bindings and a presigned-upload helper for the Toolpath Engine API.

```python
import asyncio
from pathlib import Path

from toolpath import AuthenticatedClient, upload_to_presigned_url
from toolpath.generated.api.parts import create_part
from toolpath.generated.models import CreatePartResponse

async def main() -> None:
    file_path = Path("/path/to/part.step")
    api = AuthenticatedClient("https://api.toolpath.com", token="your-api-key")
    created = await create_part.asyncio(client=api, filename=file_path.name)
    if not isinstance(created, CreatePartResponse):
        raise RuntimeError("Could not create part")

    await upload_to_presigned_url(created.upload_url, file_path.read_bytes())


asyncio.run(main())
```

Use the generated operations in `toolpath.generated` for every Engine API operation.
`upload_to_presigned_url()` performs the direct PUT after the create-part operation returns its upload
URL. The generated package must not be edited by hand.
