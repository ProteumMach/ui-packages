"""Per-vendor adapters: everything that knows how one manufacturer publishes.

The line between this package and its parent is **what a fact is about**. A
module here knows a vendor's transport, its column vocabulary, or its own
dimension codes; a module in the parent knows the domain — what a tool record
is, how a guid is minted, what the ISO workpiece groups are.

The test of the line is that two vendors' adapters share no code with each
other, and it is a test rather than a claim: `tests/test_vendor_boundary.py`
derives its module lists from this tree and fails when a core module imports a
vendor or a vendor imports another vendor. What adapters share is the core, and
that sharing is the point — it is what makes two vendors' tools comparable.
"""
