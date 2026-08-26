"""Console entry points. Argv handling only — no scraping logic lives here.

    toolpath-kennametal-scrape        family page -> CSV
    toolpath-regofix-scrape           ProductFinder index -> toolholding CSV
    toolpath-destinytool-scrape       Firestore products -> End Mill CSV
    toolpath-kennametal-thread-pitch  add the derived Thread Pitch column
    toolpath-kennametal-cad           add the vendor CAD model column
    toolpath-kennametal-materials     add the ISO workpiece-group column
    toolpath-download-cad             mirror the vendor STEP models

**Every command prints the resolved scrape root before it does anything.** The
default is derived from this package's own location, which is right in a
working tree and meaningless in `site-packages`, so where a scrape lands is a
thing to state rather than to assume.

The convert commands are not here. This package acquires; a Fusion library or
an assembly catalog is a different product, and none of it is in this tree.
"""

from __future__ import annotations

import sys
import urllib.parse
from pathlib import Path

from toolpath_scraper import receipts
from toolpath_scraper.families import (
    COLLET_FAMILIES,
    FAMILIES,
    HOLDER_FAMILIES,
    describe_root,
    family_brand,
    family_csv,
    step_dir,
)
from toolpath_scraper.identity import BRANDS
from toolpath_scraper.vendors.destinytool.scrape import (
    DOCUMENTS_URL,
    scrape_end_mills,
)
from toolpath_scraper.vendors.kennametal.cad import (
    annotate_csv,
    download_family_steps,
)
from toolpath_scraper.vendors.kennametal.materials import (
    add_material_groups_to_csv,
)
from toolpath_scraper.vendors.kennametal.scrape import (
    ACTIVE_ONLY,
    BASE,
    scrape_family,
)
from toolpath_scraper.vendors.kennametal.thread_column import (
    add_thread_pitch_to_csv,
)
from toolpath_scraper.vendors.regofix.scrape import (
    SEARCH_URL,
    scrape_collets,
    scrape_holders,
)

SCRAPE_USAGE = (
    'usage: toolpath-kennametal-scrape [--brand kennametal|widia]\n'
    '                                  FAMILY_CODE OUTPUT_CSV [Name=Value ...]\n\n'
    'Trailing Name=Value args are appended to every row as constant columns,\n'
    'for facts the vendor table does not state (e.g. "Thread System=metric").\n'
    'The output path is used verbatim; scraped CSVs belong under the scrape\n'
    'root, in <brand>/csv/.'
)


def _announce() -> None:
    """State where scraped data is read from and written to.

    Every entry point calls this first, help included: somebody reading the
    usage text is the person most likely to be about to point a scrape at the
    wrong place.
    """
    print(describe_root())


def scrape_main(argv: list[str] | None = None) -> None:
    argv = list(sys.argv[1:] if argv is None else argv)
    _announce()
    if not argv or argv[0] in ('-h', '--help'):
        print(SCRAPE_USAGE)
        return
    brand = 'kennametal'
    if '--brand' in argv:
        i = argv.index('--brand')
        if i + 1 >= len(argv):
            raise SystemExit('--brand needs a value\n\n' + SCRAPE_USAGE)
        brand = argv[i + 1]
        del argv[i:i + 2]
    if brand not in BRANDS:
        raise SystemExit(f'unknown brand: {brand} (known: {sorted(BRANDS)})')
    if len(argv) < 2:
        raise SystemExit(SCRAPE_USAGE)

    code, out = argv[0], argv[1]
    tags = [tuple(a.split('=', 1)) for a in argv[2:] if '=' in a]
    count = scrape_family(code, out, brand, tags)
    _wrote(out, brand, BASE.format(
        code=code, query=urllib.parse.quote(ACTIVE_ONLY, safe=''),
        **BRANDS[brand]), count, family_code=code)


#: The PG series a BT 30 holder can take. PG 32 and PG 48 collets exist and no
#: BT 30 holder in this catalog accepts one, so scraping them would add parts
#: that fit nothing.
BT30_COLLET_SIZES = ('6', '10', '15', '25')

REGOFIX_USAGE = (
    'usage: toolpath-regofix-scrape holders OUT.csv\n'
    '       toolpath-regofix-scrape collets "<PRODUCT GROUP>" OUT.csv\n\n'
    'Scrapes the REGO-FIX ProductFinder index. The output path is used\n'
    'verbatim — pass the full path into <root>/regofix/csv/.\n\n'
    "holders  every powRgrip BT/PG holder whose taper is BT 30 or BT+ 30,\n"
    "         with geometry from each part's DIN 4000 document.\n"
    'collets  one powRgrip collet product group, restricted to PG sizes\n'
    f'         {", ".join(BT30_COLLET_SIZES)}. The group is the vendor\'s own\n'
    '         `product_group_name`, e.g. "Standard", "Coolant flush",\n'
    '         "Tapping collet TAP".'
)


def regofix_scrape_main(argv: list[str] | None = None) -> None:
    argv = list(sys.argv[1:] if argv is None else argv)
    _announce()
    if not argv or argv[0] in ('-h', '--help'):
        print(REGOFIX_USAGE)
        return
    what, rest = argv[0], argv[1:]
    if what == 'holders':
        if len(rest) != 1:
            raise SystemExit(REGOFIX_USAGE)
        out = rest[0]
        count = scrape_holders(out)
    elif what == 'collets':
        if len(rest) != 2:
            raise SystemExit(REGOFIX_USAGE)
        group, out = rest
        count = scrape_collets(out, group, BT30_COLLET_SIZES)
    else:
        raise SystemExit(f'unknown subcommand {what!r}\n\n' + REGOFIX_USAGE)
    _wrote(out, 'regofix', SEARCH_URL, count)


DESTINYTOOL_USAGE = (
    'usage: toolpath-destinytool-scrape OUTPUT_CSV\n\n'
    'Pages the whole Destiny Tool `products` Firestore collection and writes\n'
    'every End Mill row. The output path is used verbatim — pass the full\n'
    'path into <root>/destinytool/csv/.'
)


def destinytool_scrape_main(argv: list[str] | None = None) -> None:
    argv = list(sys.argv[1:] if argv is None else argv)
    _announce()
    if not argv or argv[0] in ('-h', '--help'):
        print(DESTINYTOOL_USAGE)
        return
    if len(argv) != 1:
        raise SystemExit(DESTINYTOOL_USAGE)
    out = argv[0]
    count = scrape_end_mills(out)
    _wrote(out, 'destinytool', DOCUMENTS_URL, count)


def scrape_cad_main(argv: list[str] | None = None) -> None:
    """Hits the network, so it names its CSVs explicitly rather than
    defaulting to all of them."""
    argv = list(sys.argv[1:] if argv is None else argv)
    _announce()
    if not argv or argv[0] in ('-h', '--help'):
        print('usage: toolpath-kennametal-cad HOLDERS.csv [more.csv ...]\n\n'
              'Adds the vendor CAD model URL column, in place. One request\n'
              'per row against product-config.net; safe to re-run.\n\n'
              'known holder families:\n'
              + '\n'.join(f'  {n}' for n in sorted(HOLDER_FAMILIES)))
        return
    for name in _holder_names(argv):
        found = annotate_csv(family_csv(name))
        print(f'{name}: {found} CAD models')


def download_cad_main(argv: list[str] | None = None) -> None:
    """Mirror the vendor STEP models locally, for a holder-profile probe.

    Network, like `toolpath-kennametal-cad`, so it names its CSVs explicitly.
    Nothing is redistributed: this is a working copy for measuring, and only a
    derived profile is ever meant to leave.
    """
    argv = list(sys.argv[1:] if argv is None else argv)
    _announce()
    if not argv or argv[0] in ('-h', '--help'):
        print('usage: toolpath-download-cad HOLDERS.csv [more.csv ...]\n\n'
              "Downloads each row's STEP model into <root>/<brand>/step.\n"
              'Run toolpath-kennametal-cad first — a CSV with no CAD column\n'
              'yields nothing and says so.\n\n'
              'known holder families:\n'
              + '\n'.join(f'  {n}' for n in sorted(HOLDER_FAMILIES)))
        return
    for name in _holder_names(argv):
        written = download_family_steps(
            family_csv(name), step_dir(family_brand(name)))
        total = sum(size for _, size in written)
        print(f'{name}: {len(written)} STEP files, {total // 1024} KB')


def scrape_materials_main(argv: list[str] | None = None) -> None:
    """Hits the network, so it names its CSVs explicitly. The family code and
    brand come from config, so a re-run needs neither typed again."""
    argv = list(sys.argv[1:] if argv is None else argv)
    _announce()
    if not argv or argv[0] in ('-h', '--help'):
        print('usage: toolpath-kennametal-materials FAMILY.csv [more.csv ...]\n\n'
              'Adds the ISO workpiece-group column, in place. One request per\n'
              'material group (32) per family; safe to re-run.\n\n'
              'known families:\n'
              + '\n'.join(f'  {n}' for n in sorted(FAMILIES)))
        return
    for name in (Path(a).name for a in argv):
        cfg = FAMILIES.get(name)
        if cfg is None:
            raise SystemExit(
                f'unknown family CSV: {name} (known: {sorted(FAMILIES)})')
        matched = add_material_groups_to_csv(
            family_csv(name), cfg['family_code'], cfg.get('brand', 'kennametal'))
        print(f'{name}: {matched} rows with a material group')


def thread_pitch_main(argv: list[str] | None = None) -> None:
    argv = list(sys.argv[1:] if argv is None else argv)
    _announce()
    if not argv or argv[0] in ('-h', '--help'):
        print('usage: toolpath-kennametal-thread-pitch TAP.csv [more.csv ...]\n\n'
              'Adds a Thread Pitch column derived from D1-TDZ, in place.\n'
              'Safe to re-run.')
        return
    for path in argv:
        count = add_thread_pitch_to_csv(path)
        print(f'{path}: {count} rows updated')


def _holder_names(argv: list[str]) -> list[str]:
    """Argv as holder-family CSV names, refusing anything unknown by name.

    A path's directory is ignored: the family's own brand decides where its CSV
    lives, and honouring a typed directory would let one vendor's receipt be
    written into another's.
    """
    names = [Path(a).name for a in argv]
    unknown = [n for n in names if n not in HOLDER_FAMILIES]
    if unknown:
        raise SystemExit(
            f'unknown holder CSV: {", ".join(unknown)} '
            f'(known: {sorted(HOLDER_FAMILIES)})')
    return names


def _wrote(out: str, brand: str, source: str, rows: int,
           family_code: str | None = None) -> None:
    """Report a scrape and record its receipt.

    One function because the two belong together: a scrape that reported a
    count and wrote no receipt would be exactly the state this package is
    trying to stop existing — data with nothing saying where it came from.
    """
    receipt = receipts.write(out, brand, source, rows, family_code)
    print(f'wrote {rows} rows to {out}')
    print(f'  receipt: {receipt.name}')

    declared = COLLET_FAMILIES.get(Path(out).name) or HOLDER_FAMILIES.get(
        Path(out).name) or FAMILIES.get(Path(out).name)
    if declared and 'rows' in declared:
        receipts.check_rows(Path(out).name, declared['rows'],
                            receipts.read(out))
