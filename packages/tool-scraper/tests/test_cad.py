"""The vendor CAD lookup: payload -> URL, and CSV -> annotated CSV.

The network is mocked at the module seam (`cad.fetch_cad`), the same place
`test_scrape.py` mocks `scrape.fetch` — nothing in this suite makes a request,
and the fixture below is a real captured response with the irrelevant fields
dropped.

The last two run over a scrape where one exists on the machine, and skip with
a reason where it does not.
"""

from __future__ import annotations

import csv

import corpus
import pytest

from toolpath_scraper.vendors.kennametal import cad

# Captured from
# product-config.net/catalog3/cad?d=kennametal&id=6694846 on 2026-08-05.
PAYLOAD = {
    'productID': '6694846',
    'cadAvailable': True,
    'cadDownloadAvailable': True,
    'authenticatedDownload': False,
    'staticURLs': {
        'stp-gtm': 'https://cdn.example/domains/kennametal/zip-g/BT30ER11060M_GTM.stp',
        'stp-lwm': 'https://cdn.example/domains/kennametal/zip-l/BT30ER11060M_LWM.stp',
        'x_t': 'https://cdn.example/domains/kennametal/zip-x/BT30ER11060M.x_t',
    },
}

LWM = PAYLOAD['staticURLs']['stp-lwm']


# ── payload -> URL ─────────────────────────────────────────────────────────

def test_the_lightweight_step_is_the_one_taken():
    """Not the full graphical model sitting beside it in the same payload."""
    assert cad.lightweight_step_url(PAYLOAD) == LWM


@pytest.mark.parametrize('payload, why', [
    ({**PAYLOAD, 'cadAvailable': False}, 'vendor says no CAD for this part'),
    ({**PAYLOAD, 'staticURLs': {}}, 'no static files at all'),
    ({**PAYLOAD, 'staticURLs': {'stp-gtm': LWM}}, 'full model only'),
    ({'productID': '1'}, 'no staticURLs key'),
    ({**PAYLOAD, 'staticURLs': {'stp-lwm': ''}}, 'empty url'),
])
def test_a_part_without_a_lightweight_model_is_none_not_an_error(payload, why):
    """None is a real state — the vendor's own UI has a "request a model"
    case — and the app renders it as an absence rather than a dead link."""
    assert cad.lightweight_step_url(payload) is None, why


# ── CSV annotation ─────────────────────────────────────────────────────────

def _write_csv(path, materials):
    with open(path, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['Material Number', 'ISO Catalog Number'])
        w.writeheader()
        for m in materials:
            w.writerow({'Material Number': m, 'ISO Catalog Number': f'C{m}'})
    return path


@pytest.mark.parametrize('count', [0, 1, 2, 5])
def test_every_row_gets_a_column_at_any_size(tmp_path, monkeypatch, count):
    monkeypatch.setattr(cad, 'fetch_cad', lambda material: {
        'cadAvailable': True,
        'staticURLs': {'stp-lwm': f'https://cdn.example/{material}_LWM.stp'},
    })
    path = _write_csv(tmp_path / 'h.csv', [str(i) for i in range(count)])

    assert cad.annotate_csv(path, delay=0) == count

    rows = list(csv.DictReader(open(path, newline='')))
    assert len(rows) == count
    for i, row in enumerate(rows):
        assert row[cad.CAD_COLUMN] == f'https://cdn.example/{i}_LWM.stp'


def test_a_row_with_no_model_keeps_its_place_with_an_empty_cell(
        tmp_path, monkeypatch):
    """Dropping the row would delete a holder that really exists, and
    counting it would report a model this app cannot offer."""
    monkeypatch.setattr(cad, 'fetch_cad', lambda material: {
        'cadAvailable': material != '2',
        'staticURLs': {'stp-lwm': f'https://cdn.example/{material}_LWM.stp'},
    })
    path = _write_csv(tmp_path / 'h.csv', ['1', '2', '3'])

    assert cad.annotate_csv(path, delay=0) == 2

    rows = list(csv.DictReader(open(path, newline='')))
    assert [r['Material Number'] for r in rows] == ['1', '2', '3']
    assert rows[1][cad.CAD_COLUMN] == ''


def test_re_running_rebuilds_the_column_instead_of_duplicating_it(
        tmp_path, monkeypatch):
    calls = []

    def fake(material):
        calls.append(material)
        return {'cadAvailable': True,
                'staticURLs': {'stp-lwm': f'https://cdn.example/{material}-'
                                          f'{len(calls)}.stp'}}

    monkeypatch.setattr(cad, 'fetch_cad', fake)
    path = _write_csv(tmp_path / 'h.csv', ['1'])

    cad.annotate_csv(path, delay=0)
    cad.annotate_csv(path, delay=0)

    with open(path, newline='') as f:
        header = next(csv.reader(f))
    assert header.count(cad.CAD_COLUMN) == 1
    rows = list(csv.DictReader(open(path, newline='')))
    assert rows[0][cad.CAD_COLUMN] == 'https://cdn.example/1-2.stp'


# ── mirroring the STEP models ──────────────────────────────────────────────
# `download_family_steps` is the input step of the profile-measuring runbook.
# The network is mocked one level lower than above — at `download_step` rather
# than `fetch_cad` — because the URL is already in the CSV by this point and
# what this function decides is which rows to fetch and what to call the files.


def _write_holder_csv(path, rows):
    """`rows` is (catalog number, CAD url) — the two columns this reads."""
    with open(path, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['ISO Catalog Number', cad.CAD_COLUMN])
        w.writeheader()
        for catalog, url in rows:
            w.writerow({'ISO Catalog Number': catalog, cad.CAD_COLUMN: url})
    return path


def _fake_download(written):
    def download(url, dest):
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(url)
        written.append((url, dest))
        return len(url)
    return download


@pytest.mark.parametrize('count', [0, 1, 2, 5])
def test_every_row_with_a_model_is_downloaded_at_any_size(
        tmp_path, monkeypatch, count):
    monkeypatch.setattr(cad, 'download_step', _fake_download([]))
    rows = [(f'BT30ER16{i:03d}M', f'https://cdn.example/{i}_LWM.stp')
            for i in range(count)]
    path = _write_holder_csv(tmp_path / 'h.csv', rows)

    got = cad.download_family_steps(path, tmp_path / 'step', delay=0)

    assert got == [(catalog, len(url)) for catalog, url in rows]
    assert sorted(p.name for p in (tmp_path / 'step').glob('*')) == sorted(
        f'{catalog}.stp' for catalog, _ in rows)


def test_a_file_is_named_for_the_catalog_number_not_the_url(
        tmp_path, monkeypatch):
    """The filename is what a human reads in the probe's output, and
    `BT30ER16060M` says what the part is where a CDN path does not."""
    monkeypatch.setattr(cad, 'download_step', _fake_download([]))
    path = _write_holder_csv(
        tmp_path / 'h.csv',
        [('BT30ER16060M', 'https://cdn.example/zip-l/6694846_LWM.stp')])

    cad.download_family_steps(path, tmp_path / 'step', delay=0)

    assert (tmp_path / 'step' / 'BT30ER16060M.stp').is_file()


def test_a_row_with_no_model_is_skipped_rather_than_failed(
        tmp_path, monkeypatch):
    """`lightweight_step_url`'s documented None case arriving here as an empty
    cell. Failing the run would make one absent model block a whole family."""
    monkeypatch.setattr(cad, 'download_step', _fake_download([]))
    path = _write_holder_csv(tmp_path / 'h.csv', [
        ('A', 'https://cdn.example/a.stp'),
        ('B', ''),
        ('C', '   '),
        ('D', 'https://cdn.example/d.stp'),
    ])

    got = cad.download_family_steps(path, tmp_path / 'step', delay=0)

    assert [catalog for catalog, _ in got] == ['A', 'D']
    assert not (tmp_path / 'step' / 'B.stp').exists()


def test_the_delay_falls_between_downloads_and_not_before_the_first(
        tmp_path, monkeypatch):
    """Politeness between requests, not latency added to a one-row family."""
    slept = []
    monkeypatch.setattr(cad, 'download_step', _fake_download([]))
    monkeypatch.setattr(cad.time, 'sleep', slept.append)
    path = _write_holder_csv(tmp_path / 'h.csv', [
        (c, f'https://cdn.example/{c}.stp') for c in ('A', 'B', 'C')])

    cad.download_family_steps(path, tmp_path / 'step', delay=0.4)

    assert slept == [0.4, 0.4]


def test_a_skipped_row_does_not_spend_a_delay(tmp_path, monkeypatch):
    """The count that matters is downloads, not rows — a family that is mostly
    blank should not sleep its way through the gaps."""
    slept = []
    monkeypatch.setattr(cad, 'download_step', _fake_download([]))
    monkeypatch.setattr(cad.time, 'sleep', slept.append)
    path = _write_holder_csv(tmp_path / 'h.csv', [
        ('A', 'https://cdn.example/a.stp'), ('B', ''), ('C', '')])

    cad.download_family_steps(path, tmp_path / 'step', delay=0.4)

    assert slept == []


def test_the_output_directory_is_required_and_never_inferred(tmp_path,
                                                             monkeypatch):
    """The same rule `convert_family` follows, and it matters more here: these
    are ~3 MB of gitignored vendor binaries, and a default that pointed into
    `data/` is the one mistake that silently commits them."""
    monkeypatch.setattr(cad, 'download_step', _fake_download([]))
    path = _write_holder_csv(
        tmp_path / 'h.csv', [('A', 'https://cdn.example/a.stp')])

    with pytest.raises(TypeError):
        cad.download_family_steps(path)


# ── The scraped corpus, where there is one ─────────────────────────────────
# These check the *data* rather than the scraper, so they skip with a named
# reason where no scrape exists. See `corpus.py`.

ADAPTERS = 'bt30_er_collet_adapters_metric.csv'
CHUCKS = 'bt30_hydraulic_chucks_form_ad_metric.csv'


@pytest.mark.parametrize('name', [ADAPTERS, CHUCKS])
def test_every_scraped_url_names_the_row_it_sits_on(name):
    """The tripwire for a misaligned scrape.

    A per-row scrape's real failure mode is not a bad request, it is the right
    shape of answer attached to the wrong part — a working download that hands
    you a different holder's model, which no schema check and no type would
    catch. Kennametal names the file after the catalog number, so a URL that
    landed on the wrong row says so: `BT30ER16060M_LWM.stp` beside a row for
    `BT30ER16100M` is the bug.
    """
    rows = corpus.rows(name)
    assert rows, name
    for row in rows:
        url = row[cad.CAD_COLUMN]
        catalog = row['ISO Catalog Number']
        assert url.endswith(f'/{catalog}_LWM.stp'), f'{catalog}: {url}'


@pytest.mark.parametrize('name', [ADAPTERS, CHUCKS])
def test_every_holder_scraped_so_far_has_a_model(name):
    """Not a rule about the vendor — a record of the data as scraped. All
    twenty have one today; if a future family does not, this failing is the
    prompt to check that the absence is real rather than a broken run."""
    for row in corpus.rows(name):
        assert row[cad.CAD_COLUMN], row['ISO Catalog Number']
