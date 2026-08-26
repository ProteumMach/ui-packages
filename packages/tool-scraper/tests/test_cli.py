"""The console entry points.

Argv handling only, so these assert on argv parsing, on what gets called, and
on the two things every command does whatever it is asked: state where scraped
data lands, and leave a receipt beside what it wrote.
"""

from __future__ import annotations

import csv
import json

import pytest

from toolpath_scraper import cli, receipts
from toolpath_scraper.families import FAMILIES, SCRAPE_ROOT_ENV
from toolpath_scraper.vendors.kennametal import thread_column

# ── The scrape root, on every command ──────────────────────────────────────

@pytest.mark.parametrize('command', [
    cli.scrape_main, cli.regofix_scrape_main, cli.destinytool_scrape_main,
    cli.scrape_cad_main, cli.download_cad_main, cli.scrape_materials_main,
    cli.thread_pitch_main,
])
def test_every_command_states_where_scraped_data_lands(command, capsys):
    """The default root is derived from this package's own location, which is
    right in a working tree and meaningless in `site-packages`. A scrape that
    wrote somewhere surprising should say so on the way, not be discovered
    afterwards — and the person reading the usage text is the one most likely
    to be about to point a scrape at the wrong place."""
    command([])

    assert 'scrape root:' in capsys.readouterr().out


def test_the_root_says_whether_it_came_from_the_environment(monkeypatch, capsys,
                                                            tmp_path):
    """"No corpus" and "a corpus somewhere this run is not looking" are the
    same symptom and different problems."""
    # Cleared rather than assumed: this suite runs on machines that hold a
    # corpus and set the variable, and the default branch is still what a
    # fresh clone gets.
    monkeypatch.delenv(SCRAPE_ROOT_ENV, raising=False)
    cli.scrape_main([])
    assert f'({SCRAPE_ROOT_ENV} default)' in capsys.readouterr().out

    monkeypatch.setenv(SCRAPE_ROOT_ENV, str(tmp_path))
    cli.scrape_main([])
    out = capsys.readouterr().out
    assert f'({SCRAPE_ROOT_ENV} set)' in out
    assert str(tmp_path) in out


# ── toolpath-kennametal-scrape ─────────────────────────────────────────────

def _fake_scrape(monkeypatch, rows=3):
    seen = {}

    def fake(code, out, brand, tags):
        seen.update(code=code, out=out, brand=brand, tags=tags)
        return rows

    monkeypatch.setattr(cli, 'scrape_family', fake)
    return seen


def test_scrape_rejects_unknown_brand():
    with pytest.raises(SystemExit, match='unknown brand'):
        cli.scrape_main(['--brand', 'sandvik', '123', 'out.csv'])


def test_scrape_requires_code_and_output():
    with pytest.raises(SystemExit, match='usage: toolpath-kennametal-scrape'):
        cli.scrape_main(['100003658'])


def test_scrape_defaults_to_kennametal(monkeypatch, tmp_path):
    seen = _fake_scrape(monkeypatch)

    cli.scrape_main(['100003658', str(tmp_path / 'out.csv')])

    assert seen['brand'] == 'kennametal'
    assert seen['code'] == '100003658'
    assert seen['tags'] == []


def test_scrape_parses_brand_flag_and_tag_columns(monkeypatch, tmp_path):
    seen = _fake_scrape(monkeypatch)

    cli.scrape_main(['--brand', 'widia', '103354322', str(tmp_path / 'out.csv'),
                     'Thread System=metric'])

    assert seen['brand'] == 'widia'
    assert seen['code'] == '103354322'
    assert seen['tags'] == [('Thread System', 'metric')]


def test_scrape_brand_flag_needs_a_value():
    with pytest.raises(SystemExit, match='--brand needs a value'):
        cli.scrape_main(['100003658', 'out.csv', '--brand'])


# ── The receipt ────────────────────────────────────────────────────────────

def test_a_scrape_leaves_a_receipt_naming_what_it_fetched(monkeypatch,
                                                          tmp_path, capsys):
    """Git used to carry this. The CSVs are not committed here, so the URL,
    the family code, the timestamp and the row count have nowhere else to
    live — and none of it can be backfilled afterwards."""
    _fake_scrape(monkeypatch, rows=259)
    out = tmp_path / 'out.csv'

    cli.scrape_main(['100003658', str(out)])

    receipt = receipts.read(out)
    assert receipt.rows == 259
    assert receipt.brand == 'kennametal'
    assert receipt.family_code == '100003658'
    assert '100003658' in receipt.source
    assert receipt.source.startswith('https://www.kennametal.com/')
    assert 'receipt: out.csv.scrape.json' in capsys.readouterr().out


def test_a_widia_scrape_records_widias_host_and_not_kennametals(monkeypatch,
                                                                tmp_path):
    """A source URL that named the wrong host would send whoever re-checks a
    column to a page that 404s, which reads as the family being discontinued."""
    _fake_scrape(monkeypatch)
    out = tmp_path / 'out.csv'

    cli.scrape_main(['--brand', 'widia', '103354322', str(out)])

    assert receipts.read(out).source.startswith('https://www.widia.com/')


def test_a_destinytool_scrape_records_no_family_code(monkeypatch, tmp_path):
    """None rather than an empty string: this vendor's scrape target is a
    collection, not a family page, and `''` would read as a code the vendor
    left blank."""
    monkeypatch.setattr(
        cli, 'scrape_end_mills',
        lambda out: FAMILIES['destinytool_end_mills_inch.csv']['rows'])
    out = tmp_path / 'destinytool_end_mills_inch.csv'

    cli.destinytool_scrape_main([str(out)])

    receipt = receipts.read(out)
    assert receipt.family_code is None
    assert receipt.brand == 'destinytool'
    assert receipt.source.startswith('https://firestore.googleapis.com/')


def test_a_scrape_that_disagrees_with_the_hand_count_is_refused(monkeypatch,
                                                                tmp_path):
    """The one check two independently-arrived-at numbers make possible. A
    truncated response, a facet that started filtering, a discontinued half of
    a family — all produce a CSV that parses cleanly and is wrong, and none is
    visible from the file alone."""
    monkeypatch.setattr(cli, 'scrape_end_mills', lambda out: 12)
    out = tmp_path / 'destinytool_end_mills_inch.csv'

    with pytest.raises(SystemExit, match='wrote 12 rows where this family'):
        cli.destinytool_scrape_main([str(out)])


def test_a_scrape_matching_the_hand_count_passes(monkeypatch, tmp_path):
    monkeypatch.setattr(
        cli, 'scrape_end_mills',
        lambda out: FAMILIES['destinytool_end_mills_inch.csv']['rows'])

    cli.destinytool_scrape_main([str(tmp_path / 'destinytool_end_mills_inch.csv')])


def test_a_receipt_is_replaced_rather_than_accumulated(monkeypatch, tmp_path):
    """It describes the file sitting next to it. A history of scrapes that
    produced files no longer there is a log, not a receipt."""
    _fake_scrape(monkeypatch, rows=1)
    out = tmp_path / 'out.csv'
    cli.scrape_main(['1', str(out)])

    _fake_scrape(monkeypatch, rows=2)
    cli.scrape_main(['1', str(out)])

    assert json.loads(receipts.path_for(out).read_text())['rows'] == 2


def test_a_csv_with_no_receipt_is_readable_rather_than_refused(tmp_path):
    """A scrape taken before receipts existed is still a usable CSV. Refusing
    it would be refusing data over its paperwork."""
    csv_path = tmp_path / 'out.csv'
    csv_path.write_text('Material Number\n1\n')

    assert receipts.read(csv_path) is None


# ── toolpath-kennametal-cad ────────────────────────────────────────────────

def test_scrape_cad_rejects_a_csv_that_is_not_a_holder_family():
    """Collet and tool families are rejected rather than silently scraped:
    this pass covers holders, and the column would land somewhere nothing
    reads it."""
    with pytest.raises(SystemExit, match='unknown holder CSV'):
        cli.scrape_cad_main(['er_standard_collets_metric.csv'])


def test_scrape_cad_names_its_files_rather_than_defaulting_to_all(capsys):
    """Unlike a converter, a bare invocation prints usage instead of doing
    every family — this one makes a network request per row."""
    cli.scrape_cad_main([])

    assert 'usage: toolpath-kennametal-cad' in capsys.readouterr().out


def test_scrape_cad_reads_the_csv_from_the_familys_own_brand(monkeypatch,
                                                             capsys):
    """A typed directory is ignored on purpose: honouring one would let a
    vendor's receipt be written into another vendor's directory."""
    calls = []
    monkeypatch.setattr(cli, 'annotate_csv', lambda path: calls.append(path) or 12)

    cli.scrape_cad_main(['/elsewhere/bt30_er_collet_adapters_metric.csv'])

    assert len(calls) == 1
    assert calls[0] == cli.family_csv('bt30_er_collet_adapters_metric.csv')
    assert 'kennametal' in str(calls[0])
    assert '12 CAD models' in capsys.readouterr().out


# ── toolpath-kennametal-materials ──────────────────────────────────────────

def test_scrape_materials_rejects_a_csv_that_is_not_a_tool_family():
    """The toolholding CSVs are rejected rather than swept: the facet indexes
    cutting tools, and a holder family has no `family_code` to query with."""
    with pytest.raises(SystemExit, match='unknown family CSV'):
        cli.scrape_materials_main(['bt30_er_collet_adapters_metric.csv'])


def test_scrape_materials_names_its_files_rather_than_defaulting_to_all(capsys):
    """32 requests per family, thirteen families — a bare invocation prints
    usage rather than spending 400 requests on a typo."""
    cli.scrape_materials_main([])

    assert 'usage: toolpath-kennametal-materials' in capsys.readouterr().out


def test_scrape_materials_takes_the_code_and_brand_from_config(monkeypatch,
                                                               capsys):
    """The whole reason `family_code` is config: a re-run needs neither the
    code nor the brand typed again, and a WIDIA family must not be swept
    against kennametal.com — which would 404 rather than return zero rows."""
    seen = {}

    def fake(path, code, brand, **_: object):
        seen.update(path=path, code=code, brand=brand)
        return 3

    monkeypatch.setattr(cli, 'add_material_groups_to_csv', fake)
    cli.scrape_materials_main(
        ['/elsewhere/varimill_chip_splitter_570t_radiused_5fl_cyl_inch.csv'])

    assert seen['path'].name == (
        'varimill_chip_splitter_570t_radiused_5fl_cyl_inch.csv')
    assert seen['code'] == '100680824'
    assert seen['brand'] == 'widia'
    assert '3 rows with a material group' in capsys.readouterr().out


def test_every_family_on_the_swept_platform_carries_the_code_its_sweep_needs():
    """A Kennametal/WIDIA family added without one fails here rather than at
    the network. `family_code` is a fact about that platform, not about every
    cutting-tool vendor: Destiny Tool has no family code and no facet sweep at
    all — its `isoMaterialGroups` is a field on the row itself."""
    for name, cfg in FAMILIES.items():
        if cfg.get('brand', 'kennametal') not in ('kennametal', 'widia'):
            continue
        assert cfg['family_code'].isdigit(), name


# ── toolpath-kennametal-thread-pitch ───────────────────────────────────────

TAP_CSV = (
    'Material Number,D1-TDZ,L_in,Thread System\n'
    '1540362,#2-56,1.75,inch\n'
    '1540363,1/4 - 20,2.0,inch\n'
)

METRIC_TAP_CSV = (
    'Material Number,D1-TDZ,L_mm,Thread System\n'
    '1543707,M2X0.4,44.45,metric\n'
    '1543708,M12X1.75,80,metric\n'
)


@pytest.mark.parametrize('body, expected', [
    (TAP_CSV, ['0.017857', '0.05']),
    (METRIC_TAP_CSV, ['0.4', '1.75']),
])
def test_thread_pitch_column_derived_in_native_units(tmp_path, body, expected):
    path = tmp_path / 'taps.csv'
    path.write_text(body)

    thread_column.add_thread_pitch_to_csv(path)

    with open(path, newline='') as f:
        assert [r['Thread Pitch'] for r in csv.DictReader(f)] == expected


def test_thread_pitch_column_lands_right_after_the_designation(tmp_path):
    path = tmp_path / 'taps.csv'
    path.write_text(TAP_CSV)

    thread_column.add_thread_pitch_to_csv(path)

    with open(path, newline='') as f:
        header = next(csv.reader(f))
    assert header[header.index('D1-TDZ') + 1] == 'Thread Pitch'


def test_thread_pitch_is_idempotent(tmp_path):
    """Safe to re-run: an existing column is dropped and rebuilt rather than
    duplicated."""
    path = tmp_path / 'taps.csv'
    path.write_text(TAP_CSV)

    thread_column.add_thread_pitch_to_csv(path)
    once = path.read_text()
    thread_column.add_thread_pitch_to_csv(path)

    assert path.read_text() == once


def test_thread_pitch_rejects_an_unparseable_designation(tmp_path):
    path = tmp_path / 'taps.csv'
    path.write_text('Material Number,D1-TDZ,Thread System\n1,garbage,inch\n')

    with pytest.raises(ValueError):
        thread_column.add_thread_pitch_to_csv(path)


def test_thread_pitch_cli_reports_each_file(tmp_path, capsys):
    a, b = tmp_path / 'a.csv', tmp_path / 'b.csv'
    a.write_text(TAP_CSV)
    b.write_text(METRIC_TAP_CSV)

    cli.thread_pitch_main([str(a), str(b)])

    out = capsys.readouterr().out
    assert f'{a}: 2 rows updated' in out
    assert f'{b}: 2 rows updated' in out
