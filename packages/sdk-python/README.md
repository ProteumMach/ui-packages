# Toolpath Python SDK

Generated Python client for the Toolpath Engine API.

```python
import os

from toolpath import AuthenticatedClient

client = AuthenticatedClient(
    base_url="https://api.toolpath.com",
    token=os.environ["TOOLPATH_API_KEY"],
)
```

See <https://developers.toolpath.com> for authentication and workflow documentation. Generated
operations are grouped under `toolpath.api`, and response models are exported from `toolpath.models`.

This package is generated from the versioned OpenAPI input retained in the
[`toolpath/toolpath`](https://github.com/toolpath/toolpath) repository. Do not edit generated modules
by hand.
