import { p as E, a as l, A as Fs, r as Gf } from './chunk-62JRHF6Z-BcGjj7J7.js'
import { a as Mt } from './index-Bm4wH5ZD.js'
const q0 = (...e) => e.filter((t) => !!t).join(' '),
  PO = ({ children: e, navigation: t, actions: n, className: r = '' }) =>
    E.jsxs('header', {
      className: q0('flex flex-wrap items-center justify-between gap-3', r),
      children: [
        E.jsxs('div', {
          className: 'flex min-w-0 items-center gap-8',
          children: [
            E.jsx('div', { className: 'shrink-0', children: e }),
            t ? E.jsx('div', { className: 'min-w-0', children: t }) : null,
          ],
        }),
        n ? E.jsx('div', { className: 'shrink-0', children: n }) : null,
      ],
    })
function Uf(e) {
  var t,
    n,
    r = ''
  if (typeof e == 'string' || typeof e == 'number') r += e
  else if (typeof e == 'object')
    if (Array.isArray(e)) {
      var o = e.length
      for (t = 0; t < o; t++) e[t] && (n = Uf(e[t])) && (r && (r += ' '), (r += n))
    } else for (n in e) e[n] && (r && (r += ' '), (r += n))
  return r
}
function X0() {
  for (var e, t, n = 0, r = '', o = arguments.length; n < o; n++)
    (e = arguments[n]) && (t = Uf(e)) && (r && (r += ' '), (r += t))
  return r
}
const J0 = (e, t) => {
    const n = new Array(e.length + t.length)
    for (let r = 0; r < e.length; r++) n[r] = e[r]
    for (let r = 0; r < t.length; r++) n[e.length + r] = t[r]
    return n
  },
  Q0 = (e, t) => ({ classGroupId: e, validator: t }),
  Zf = (e = new Map(), t = null, n) => ({ nextPart: e, validators: t, classGroupId: n }),
  $s = '-',
  nu = [],
  eb = 'arbitrary..',
  tb = (e) => {
    const t = rb(e),
      { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e
    return {
      getClassGroupId: (i) => {
        if (i.startsWith('[') && i.endsWith(']')) return nb(i)
        const a = i.split($s),
          c = a[0] === '' && a.length > 1 ? 1 : 0
        return Kf(a, c, t)
      },
      getConflictingClassGroupIds: (i, a) => {
        if (a) {
          const c = r[i],
            u = n[i]
          return c ? (u ? J0(u, c) : c) : u || nu
        }
        return n[i] || nu
      },
    }
  },
  Kf = (e, t, n) => {
    if (e.length - t === 0) return n.classGroupId
    const o = e[t],
      s = n.nextPart.get(o)
    if (s) {
      const u = Kf(e, t + 1, s)
      if (u) return u
    }
    const i = n.validators
    if (i === null) return
    const a = t === 0 ? e.join($s) : e.slice(t).join($s),
      c = i.length
    for (let u = 0; u < c; u++) {
      const f = i[u]
      if (f.validator(a)) return f.classGroupId
    }
  },
  nb = (e) =>
    e.slice(1, -1).indexOf(':') === -1
      ? void 0
      : (() => {
          const t = e.slice(1, -1),
            n = t.indexOf(':'),
            r = t.slice(0, n)
          return r ? eb + r : void 0
        })(),
  rb = (e) => {
    const { theme: t, classGroups: n } = e
    return ob(n, t)
  },
  ob = (e, t) => {
    const n = Zf()
    for (const r in e) {
      const o = e[r]
      wl(o, n, r, t)
    }
    return n
  },
  wl = (e, t, n, r) => {
    const o = e.length
    for (let s = 0; s < o; s++) {
      const i = e[s]
      sb(i, t, n, r)
    }
  },
  sb = (e, t, n, r) => {
    if (typeof e == 'string') {
      ib(e, t, n)
      return
    }
    if (typeof e == 'function') {
      ab(e, t, n, r)
      return
    }
    lb(e, t, n, r)
  },
  ib = (e, t, n) => {
    const r = e === '' ? t : Yf(t, e)
    r.classGroupId = n
  },
  ab = (e, t, n, r) => {
    if (cb(e)) {
      wl(e(r), t, n, r)
      return
    }
    ;(t.validators === null && (t.validators = []), t.validators.push(Q0(n, e)))
  },
  lb = (e, t, n, r) => {
    const o = Object.entries(e),
      s = o.length
    for (let i = 0; i < s; i++) {
      const [a, c] = o[i]
      wl(c, Yf(t, a), n, r)
    }
  },
  Yf = (e, t) => {
    let n = e
    const r = t.split($s),
      o = r.length
    for (let s = 0; s < o; s++) {
      const i = r[s]
      let a = n.nextPart.get(i)
      ;(a || ((a = Zf()), n.nextPart.set(i, a)), (n = a))
    }
    return n
  },
  cb = (e) => 'isThemeGetter' in e && e.isThemeGetter === !0,
  ub = (e) => {
    if (e < 1) return { get: () => {}, set: () => {} }
    let t = 0,
      n = Object.create(null),
      r = Object.create(null)
    const o = (s, i) => {
      ;((n[s] = i), t++, t > e && ((t = 0), (r = n), (n = Object.create(null))))
    }
    return {
      get(s) {
        let i = n[s]
        if (i !== void 0) return i
        if ((i = r[s]) !== void 0) return (o(s, i), i)
      },
      set(s, i) {
        s in n ? (n[s] = i) : o(s, i)
      },
    }
  },
  Aa = '!',
  ru = ':',
  db = [],
  ou = (e, t, n, r, o) => ({
    modifiers: e,
    hasImportantModifier: t,
    baseClassName: n,
    maybePostfixModifierPosition: r,
    isExternal: o,
  }),
  fb = (e) => {
    const { prefix: t, experimentalParseClassName: n } = e
    let r = (o) => {
      const s = []
      let i = 0,
        a = 0,
        c = 0,
        u
      const f = o.length
      for (let p = 0; p < f; p++) {
        const b = o[p]
        if (i === 0 && a === 0) {
          if (b === ru) {
            ;(s.push(o.slice(c, p)), (c = p + 1))
            continue
          }
          if (b === '/') {
            u = p
            continue
          }
        }
        b === '[' ? i++ : b === ']' ? i-- : b === '(' ? a++ : b === ')' && a--
      }
      const d = s.length === 0 ? o : o.slice(c)
      let g = d,
        h = !1
      d.endsWith(Aa)
        ? ((g = d.slice(0, -1)), (h = !0))
        : d.startsWith(Aa) && ((g = d.slice(1)), (h = !0))
      const m = u && u > c ? u - c : void 0
      return ou(s, h, g, m)
    }
    if (t) {
      const o = t + ru,
        s = r
      r = (i) => (i.startsWith(o) ? s(i.slice(o.length)) : ou(db, !1, i, void 0, !0))
    }
    if (n) {
      const o = r
      r = (s) => n({ className: s, parseClassName: o })
    }
    return r
  },
  pb = (e) => {
    const t = new Map()
    return (
      e.orderSensitiveModifiers.forEach((n, r) => {
        t.set(n, 1e6 + r)
      }),
      (n) => {
        const r = []
        let o = []
        for (let s = 0; s < n.length; s++) {
          const i = n[s],
            a = i[0] === '[',
            c = t.has(i)
          a || c ? (o.length > 0 && (o.sort(), r.push(...o), (o = [])), r.push(i)) : o.push(i)
        }
        return (o.length > 0 && (o.sort(), r.push(...o)), r)
      }
    )
  },
  gb = (e) => ({
    cache: ub(e.cacheSize),
    parseClassName: fb(e),
    sortModifiers: pb(e),
    postfixLookupClassGroupIds: mb(e),
    ...tb(e),
  }),
  mb = (e) => {
    const t = Object.create(null),
      n = e.postfixLookupClassGroups
    if (n) for (let r = 0; r < n.length; r++) t[n[r]] = !0
    return t
  },
  hb = /\s+/,
  bb = (e, t) => {
    const {
        parseClassName: n,
        getClassGroupId: r,
        getConflictingClassGroupIds: o,
        sortModifiers: s,
        postfixLookupClassGroupIds: i,
      } = t,
      a = [],
      c = e.trim().split(hb)
    let u = ''
    for (let f = c.length - 1; f >= 0; f -= 1) {
      const d = c[f],
        {
          isExternal: g,
          modifiers: h,
          hasImportantModifier: m,
          baseClassName: p,
          maybePostfixModifierPosition: b,
        } = n(d)
      if (g) {
        u = d + (u.length > 0 ? ' ' + u : u)
        continue
      }
      let y = !!b,
        v
      if (y) {
        const k = p.substring(0, b)
        v = r(k)
        const R = v && i[v] ? r(p) : void 0
        R && R !== v && ((v = R), (y = !1))
      } else v = r(p)
      if (!v) {
        if (!y) {
          u = d + (u.length > 0 ? ' ' + u : u)
          continue
        }
        if (((v = r(p)), !v)) {
          u = d + (u.length > 0 ? ' ' + u : u)
          continue
        }
        y = !1
      }
      const C = h.length === 0 ? '' : h.length === 1 ? h[0] : s(h).join(':'),
        w = m ? C + Aa : C,
        x = w + v
      if (a.indexOf(x) > -1) continue
      a.push(x)
      const S = o(v, y)
      for (let k = 0; k < S.length; ++k) {
        const R = S[k]
        a.push(w + R)
      }
      u = d + (u.length > 0 ? ' ' + u : u)
    }
    return u
  },
  vb = (...e) => {
    let t = 0,
      n,
      r,
      o = ''
    for (; t < e.length; ) (n = e[t++]) && (r = qf(n)) && (o && (o += ' '), (o += r))
    return o
  },
  qf = (e) => {
    if (typeof e == 'string') return e
    let t,
      n = ''
    for (let r = 0; r < e.length; r++) e[r] && (t = qf(e[r])) && (n && (n += ' '), (n += t))
    return n
  },
  yb = (e, ...t) => {
    let n, r, o, s
    const i = (c) => {
        const u = t.reduce((f, d) => d(f), e())
        return ((n = gb(u)), (r = n.cache.get), (o = n.cache.set), (s = a), a(c))
      },
      a = (c) => {
        const u = r(c)
        if (u) return u
        const f = bb(c, n)
        return (o(c, f), f)
      }
    return ((s = i), (...c) => s(vb(...c)))
  },
  xb = [],
  at = (e) => {
    const t = (n) => n[e] || xb
    return ((t.isThemeGetter = !0), t)
  },
  Xf = /^\[(?:(\w[\w-]*):)?(.+)\]$/i,
  Jf = /^\((?:(\w[\w-]*):)?(.+)\)$/i,
  wb = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/,
  Cb = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  Sb =
    /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  Eb = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,
  Rb = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  kb =
    /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  On = (e) => wb.test(e),
  Re = (e) => !!e && !Number.isNaN(Number(e)),
  Kt = (e) => !!e && Number.isInteger(Number(e)),
  Qi = (e) => e.endsWith('%') && Re(e.slice(0, -1)),
  an = (e) => Cb.test(e),
  Qf = () => !0,
  Ib = (e) => Sb.test(e) && !Eb.test(e),
  Cl = () => !1,
  Tb = (e) => Rb.test(e),
  Pb = (e) => kb.test(e),
  Ob = (e) => !de(e) && !pe(e),
  Mb = (e) =>
    e.startsWith('@container') &&
    ((e[10] === '/' && e[11] !== void 0) ||
      (e[11] === 's' && e[16] !== void 0 && e.startsWith('-size/', 10)) ||
      (e[11] === 'n' && e[18] !== void 0 && e.startsWith('-normal/', 10))),
  Ab = (e) => Wn(e, np, Cl),
  de = (e) => Xf.test(e),
  er = (e) => Wn(e, rp, Ib),
  su = (e) => Wn(e, $b, Re),
  zb = (e) => Wn(e, sp, Qf),
  Lb = (e) => Wn(e, op, Cl),
  iu = (e) => Wn(e, ep, Cl),
  jb = (e) => Wn(e, tp, Pb),
  is = (e) => Wn(e, ip, Tb),
  pe = (e) => Jf.test(e),
  po = (e) => yr(e, rp),
  Db = (e) => yr(e, op),
  au = (e) => yr(e, ep),
  Nb = (e) => yr(e, np),
  _b = (e) => yr(e, tp),
  as = (e) => yr(e, ip, !0),
  Fb = (e) => yr(e, sp, !0),
  Wn = (e, t, n) => {
    const r = Xf.exec(e)
    return r ? (r[1] ? t(r[1]) : n(r[2])) : !1
  },
  yr = (e, t, n = !1) => {
    const r = Jf.exec(e)
    return r ? (r[1] ? t(r[1]) : n) : !1
  },
  ep = (e) => e === 'position' || e === 'percentage',
  tp = (e) => e === 'image' || e === 'url',
  np = (e) => e === 'length' || e === 'size' || e === 'bg-size',
  rp = (e) => e === 'length',
  $b = (e) => e === 'number',
  op = (e) => e === 'family-name',
  sp = (e) => e === 'number' || e === 'weight',
  ip = (e) => e === 'shadow',
  Vb = () => {
    const e = at('color'),
      t = at('font'),
      n = at('text'),
      r = at('font-weight'),
      o = at('tracking'),
      s = at('leading'),
      i = at('breakpoint'),
      a = at('container'),
      c = at('spacing'),
      u = at('radius'),
      f = at('shadow'),
      d = at('inset-shadow'),
      g = at('text-shadow'),
      h = at('drop-shadow'),
      m = at('blur'),
      p = at('perspective'),
      b = at('aspect'),
      y = at('ease'),
      v = at('animate'),
      C = () => ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'],
      w = () => [
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'top-left',
        'left-top',
        'top-right',
        'right-top',
        'bottom-right',
        'right-bottom',
        'bottom-left',
        'left-bottom',
      ],
      x = () => [...w(), pe, de],
      S = () => ['auto', 'hidden', 'clip', 'visible', 'scroll'],
      k = () => ['auto', 'contain', 'none'],
      R = () => [pe, de, c],
      M = () => [On, 'full', 'auto', ...R()],
      j = () => [Kt, 'none', 'subgrid', pe, de],
      P = () => ['auto', { span: ['full', Kt, pe, de] }, Kt, pe, de],
      I = () => [Kt, 'auto', pe, de],
      T = () => ['auto', 'min', 'max', 'fr', pe, de],
      O = () => [
        'start',
        'end',
        'center',
        'between',
        'around',
        'evenly',
        'stretch',
        'baseline',
        'center-safe',
        'end-safe',
      ],
      L = () => ['start', 'end', 'center', 'stretch', 'center-safe', 'end-safe'],
      A = () => ['auto', ...R()],
      z = () => [
        On,
        'auto',
        'full',
        'dvw',
        'dvh',
        'lvw',
        'lvh',
        'svw',
        'svh',
        'min',
        'max',
        'fit',
        ...R(),
      ],
      D = () => [On, 'screen', 'full', 'dvw', 'lvw', 'svw', 'min', 'max', 'fit', ...R()],
      $ = () => [On, 'screen', 'full', 'lh', 'dvh', 'lvh', 'svh', 'min', 'max', 'fit', ...R()],
      F = () => [e, pe, de],
      Q = () => [...w(), au, iu, { position: [pe, de] }],
      q = () => ['no-repeat', { repeat: ['', 'x', 'y', 'space', 'round'] }],
      se = () => ['auto', 'cover', 'contain', Nb, Ab, { size: [pe, de] }],
      Y = () => [Qi, po, er],
      oe = () => ['', 'none', 'full', u, pe, de],
      te = () => ['', Re, po, er],
      le = () => ['solid', 'dashed', 'dotted', 'double'],
      ve = () => [
        'normal',
        'multiply',
        'screen',
        'overlay',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'hard-light',
        'soft-light',
        'difference',
        'exclusion',
        'hue',
        'saturation',
        'color',
        'luminosity',
      ],
      X = () => [Re, Qi, au, iu],
      me = () => ['', 'none', m, pe, de],
      he = () => ['none', Re, pe, de],
      V = () => ['none', Re, pe, de],
      Z = () => [Re, pe, de],
      K = () => [On, 'full', ...R()]
    return {
      cacheSize: 500,
      theme: {
        animate: ['spin', 'ping', 'pulse', 'bounce'],
        aspect: ['video'],
        blur: [an],
        breakpoint: [an],
        color: [Qf],
        container: [an],
        'drop-shadow': [an],
        ease: ['in', 'out', 'in-out'],
        font: [Ob],
        'font-weight': [
          'thin',
          'extralight',
          'light',
          'normal',
          'medium',
          'semibold',
          'bold',
          'extrabold',
          'black',
        ],
        'inset-shadow': [an],
        leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
        perspective: ['dramatic', 'near', 'normal', 'midrange', 'distant', 'none'],
        radius: [an],
        shadow: [an],
        spacing: ['px', Re],
        text: [an],
        'text-shadow': [an],
        tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'],
      },
      classGroups: {
        aspect: [{ aspect: ['auto', 'square', On, de, pe, b] }],
        container: ['container'],
        'container-type': [{ '@container': ['', 'normal', 'size', pe, de] }],
        'container-named': [Mb],
        columns: [{ columns: [Re, de, pe, a] }],
        'break-after': [{ 'break-after': C() }],
        'break-before': [{ 'break-before': C() }],
        'break-inside': [{ 'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column'] }],
        'box-decoration': [{ 'box-decoration': ['slice', 'clone'] }],
        box: [{ box: ['border', 'content'] }],
        display: [
          'block',
          'inline-block',
          'inline',
          'flex',
          'inline-flex',
          'table',
          'inline-table',
          'table-caption',
          'table-cell',
          'table-column',
          'table-column-group',
          'table-footer-group',
          'table-header-group',
          'table-row-group',
          'table-row',
          'flow-root',
          'grid',
          'inline-grid',
          'contents',
          'list-item',
          'hidden',
        ],
        sr: ['sr-only', 'not-sr-only'],
        float: [{ float: ['right', 'left', 'none', 'start', 'end'] }],
        clear: [{ clear: ['left', 'right', 'both', 'none', 'start', 'end'] }],
        isolation: ['isolate', 'isolation-auto'],
        'object-fit': [{ object: ['contain', 'cover', 'fill', 'none', 'scale-down'] }],
        'object-position': [{ object: x() }],
        overflow: [{ overflow: S() }],
        'overflow-x': [{ 'overflow-x': S() }],
        'overflow-y': [{ 'overflow-y': S() }],
        overscroll: [{ overscroll: k() }],
        'overscroll-x': [{ 'overscroll-x': k() }],
        'overscroll-y': [{ 'overscroll-y': k() }],
        position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
        inset: [{ inset: M() }],
        'inset-x': [{ 'inset-x': M() }],
        'inset-y': [{ 'inset-y': M() }],
        start: [{ 'inset-s': M(), start: M() }],
        end: [{ 'inset-e': M(), end: M() }],
        'inset-bs': [{ 'inset-bs': M() }],
        'inset-be': [{ 'inset-be': M() }],
        top: [{ top: M() }],
        right: [{ right: M() }],
        bottom: [{ bottom: M() }],
        left: [{ left: M() }],
        visibility: ['visible', 'invisible', 'collapse'],
        z: [{ z: [Kt, 'auto', pe, de] }],
        basis: [{ basis: [On, 'full', 'auto', a, ...R()] }],
        'flex-direction': [{ flex: ['row', 'row-reverse', 'col', 'col-reverse'] }],
        'flex-wrap': [{ flex: ['nowrap', 'wrap', 'wrap-reverse'] }],
        flex: [{ flex: [Re, On, 'auto', 'initial', 'none', de] }],
        grow: [{ grow: ['', Re, pe, de] }],
        shrink: [{ shrink: ['', Re, pe, de] }],
        order: [{ order: [Kt, 'first', 'last', 'none', pe, de] }],
        'grid-cols': [{ 'grid-cols': j() }],
        'col-start-end': [{ col: P() }],
        'col-start': [{ 'col-start': I() }],
        'col-end': [{ 'col-end': I() }],
        'grid-rows': [{ 'grid-rows': j() }],
        'row-start-end': [{ row: P() }],
        'row-start': [{ 'row-start': I() }],
        'row-end': [{ 'row-end': I() }],
        'grid-flow': [{ 'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense'] }],
        'auto-cols': [{ 'auto-cols': T() }],
        'auto-rows': [{ 'auto-rows': T() }],
        gap: [{ gap: R() }],
        'gap-x': [{ 'gap-x': R() }],
        'gap-y': [{ 'gap-y': R() }],
        'justify-content': [{ justify: [...O(), 'normal'] }],
        'justify-items': [{ 'justify-items': [...L(), 'normal'] }],
        'justify-self': [{ 'justify-self': ['auto', ...L()] }],
        'align-content': [{ content: ['normal', ...O()] }],
        'align-items': [{ items: [...L(), { baseline: ['', 'last'] }] }],
        'align-self': [{ self: ['auto', ...L(), { baseline: ['', 'last'] }] }],
        'place-content': [{ 'place-content': O() }],
        'place-items': [{ 'place-items': [...L(), 'baseline'] }],
        'place-self': [{ 'place-self': ['auto', ...L()] }],
        p: [{ p: R() }],
        px: [{ px: R() }],
        py: [{ py: R() }],
        ps: [{ ps: R() }],
        pe: [{ pe: R() }],
        pbs: [{ pbs: R() }],
        pbe: [{ pbe: R() }],
        pt: [{ pt: R() }],
        pr: [{ pr: R() }],
        pb: [{ pb: R() }],
        pl: [{ pl: R() }],
        m: [{ m: A() }],
        mx: [{ mx: A() }],
        my: [{ my: A() }],
        ms: [{ ms: A() }],
        me: [{ me: A() }],
        mbs: [{ mbs: A() }],
        mbe: [{ mbe: A() }],
        mt: [{ mt: A() }],
        mr: [{ mr: A() }],
        mb: [{ mb: A() }],
        ml: [{ ml: A() }],
        'space-x': [{ 'space-x': R() }],
        'space-x-reverse': ['space-x-reverse'],
        'space-y': [{ 'space-y': R() }],
        'space-y-reverse': ['space-y-reverse'],
        size: [{ size: z() }],
        'inline-size': [{ inline: ['auto', ...D()] }],
        'min-inline-size': [{ 'min-inline': ['auto', ...D()] }],
        'max-inline-size': [{ 'max-inline': ['none', ...D()] }],
        'block-size': [{ block: ['auto', ...$()] }],
        'min-block-size': [{ 'min-block': ['auto', ...$()] }],
        'max-block-size': [{ 'max-block': ['none', ...$()] }],
        w: [{ w: [a, 'screen', ...z()] }],
        'min-w': [{ 'min-w': [a, 'screen', 'none', ...z()] }],
        'max-w': [{ 'max-w': [a, 'screen', 'none', 'prose', { screen: [i] }, ...z()] }],
        h: [{ h: ['screen', 'lh', ...z()] }],
        'min-h': [{ 'min-h': ['screen', 'lh', 'none', ...z()] }],
        'max-h': [{ 'max-h': ['screen', 'lh', ...z()] }],
        'font-size': [{ text: ['base', n, po, er] }],
        'font-smoothing': ['antialiased', 'subpixel-antialiased'],
        'font-style': ['italic', 'not-italic'],
        'font-weight': [{ font: [r, Fb, zb] }],
        'font-stretch': [
          {
            'font-stretch': [
              'ultra-condensed',
              'extra-condensed',
              'condensed',
              'semi-condensed',
              'normal',
              'semi-expanded',
              'expanded',
              'extra-expanded',
              'ultra-expanded',
              Qi,
              de,
            ],
          },
        ],
        'font-family': [{ font: [Db, Lb, t] }],
        'font-features': [{ 'font-features': [de] }],
        'fvn-normal': ['normal-nums'],
        'fvn-ordinal': ['ordinal'],
        'fvn-slashed-zero': ['slashed-zero'],
        'fvn-figure': ['lining-nums', 'oldstyle-nums'],
        'fvn-spacing': ['proportional-nums', 'tabular-nums'],
        'fvn-fraction': ['diagonal-fractions', 'stacked-fractions'],
        tracking: [{ tracking: [o, pe, de] }],
        'line-clamp': [{ 'line-clamp': [Re, 'none', pe, su] }],
        leading: [{ leading: [s, ...R()] }],
        'list-image': [{ 'list-image': ['none', pe, de] }],
        'list-style-position': [{ list: ['inside', 'outside'] }],
        'list-style-type': [{ list: ['disc', 'decimal', 'none', pe, de] }],
        'text-alignment': [{ text: ['left', 'center', 'right', 'justify', 'start', 'end'] }],
        'placeholder-color': [{ placeholder: F() }],
        'text-color': [{ text: F() }],
        'text-decoration': ['underline', 'overline', 'line-through', 'no-underline'],
        'text-decoration-style': [{ decoration: [...le(), 'wavy'] }],
        'text-decoration-thickness': [{ decoration: [Re, 'from-font', 'auto', pe, er] }],
        'text-decoration-color': [{ decoration: F() }],
        'underline-offset': [{ 'underline-offset': [Re, 'auto', pe, de] }],
        'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
        'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
        'text-wrap': [{ text: ['wrap', 'nowrap', 'balance', 'pretty'] }],
        indent: [{ indent: R() }],
        'tab-size': [{ tab: [Kt, pe, de] }],
        'vertical-align': [
          {
            align: [
              'baseline',
              'top',
              'middle',
              'bottom',
              'text-top',
              'text-bottom',
              'sub',
              'super',
              pe,
              de,
            ],
          },
        ],
        whitespace: [
          { whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces'] },
        ],
        break: [{ break: ['normal', 'words', 'all', 'keep'] }],
        wrap: [{ wrap: ['break-word', 'anywhere', 'normal'] }],
        hyphens: [{ hyphens: ['none', 'manual', 'auto'] }],
        content: [{ content: ['none', pe, de] }],
        'bg-attachment': [{ bg: ['fixed', 'local', 'scroll'] }],
        'bg-clip': [{ 'bg-clip': ['border', 'padding', 'content', 'text'] }],
        'bg-origin': [{ 'bg-origin': ['border', 'padding', 'content'] }],
        'bg-position': [{ bg: Q() }],
        'bg-repeat': [{ bg: q() }],
        'bg-size': [{ bg: se() }],
        'bg-image': [
          {
            bg: [
              'none',
              {
                linear: [{ to: ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl'] }, Kt, pe, de],
                radial: ['', pe, de],
                conic: [Kt, pe, de],
              },
              _b,
              jb,
            ],
          },
        ],
        'bg-color': [{ bg: F() }],
        'gradient-from-pos': [{ from: Y() }],
        'gradient-via-pos': [{ via: Y() }],
        'gradient-to-pos': [{ to: Y() }],
        'gradient-from': [{ from: F() }],
        'gradient-via': [{ via: F() }],
        'gradient-to': [{ to: F() }],
        rounded: [{ rounded: oe() }],
        'rounded-s': [{ 'rounded-s': oe() }],
        'rounded-e': [{ 'rounded-e': oe() }],
        'rounded-t': [{ 'rounded-t': oe() }],
        'rounded-r': [{ 'rounded-r': oe() }],
        'rounded-b': [{ 'rounded-b': oe() }],
        'rounded-l': [{ 'rounded-l': oe() }],
        'rounded-ss': [{ 'rounded-ss': oe() }],
        'rounded-se': [{ 'rounded-se': oe() }],
        'rounded-ee': [{ 'rounded-ee': oe() }],
        'rounded-es': [{ 'rounded-es': oe() }],
        'rounded-tl': [{ 'rounded-tl': oe() }],
        'rounded-tr': [{ 'rounded-tr': oe() }],
        'rounded-br': [{ 'rounded-br': oe() }],
        'rounded-bl': [{ 'rounded-bl': oe() }],
        'border-w': [{ border: te() }],
        'border-w-x': [{ 'border-x': te() }],
        'border-w-y': [{ 'border-y': te() }],
        'border-w-s': [{ 'border-s': te() }],
        'border-w-e': [{ 'border-e': te() }],
        'border-w-bs': [{ 'border-bs': te() }],
        'border-w-be': [{ 'border-be': te() }],
        'border-w-t': [{ 'border-t': te() }],
        'border-w-r': [{ 'border-r': te() }],
        'border-w-b': [{ 'border-b': te() }],
        'border-w-l': [{ 'border-l': te() }],
        'divide-x': [{ 'divide-x': te() }],
        'divide-x-reverse': ['divide-x-reverse'],
        'divide-y': [{ 'divide-y': te() }],
        'divide-y-reverse': ['divide-y-reverse'],
        'border-style': [{ border: [...le(), 'hidden', 'none'] }],
        'divide-style': [{ divide: [...le(), 'hidden', 'none'] }],
        'border-color': [{ border: F() }],
        'border-color-x': [{ 'border-x': F() }],
        'border-color-y': [{ 'border-y': F() }],
        'border-color-s': [{ 'border-s': F() }],
        'border-color-e': [{ 'border-e': F() }],
        'border-color-bs': [{ 'border-bs': F() }],
        'border-color-be': [{ 'border-be': F() }],
        'border-color-t': [{ 'border-t': F() }],
        'border-color-r': [{ 'border-r': F() }],
        'border-color-b': [{ 'border-b': F() }],
        'border-color-l': [{ 'border-l': F() }],
        'divide-color': [{ divide: F() }],
        'outline-style': [{ outline: [...le(), 'none', 'hidden'] }],
        'outline-offset': [{ 'outline-offset': [Re, pe, de] }],
        'outline-w': [{ outline: ['', Re, po, er] }],
        'outline-color': [{ outline: F() }],
        shadow: [{ shadow: ['', 'none', f, as, is] }],
        'shadow-color': [{ shadow: F() }],
        'inset-shadow': [{ 'inset-shadow': ['none', d, as, is] }],
        'inset-shadow-color': [{ 'inset-shadow': F() }],
        'ring-w': [{ ring: te() }],
        'ring-w-inset': ['ring-inset'],
        'ring-color': [{ ring: F() }],
        'ring-offset-w': [{ 'ring-offset': [Re, er] }],
        'ring-offset-color': [{ 'ring-offset': F() }],
        'inset-ring-w': [{ 'inset-ring': te() }],
        'inset-ring-color': [{ 'inset-ring': F() }],
        'text-shadow': [{ 'text-shadow': ['none', g, as, is] }],
        'text-shadow-color': [{ 'text-shadow': F() }],
        opacity: [{ opacity: [Re, pe, de] }],
        'mix-blend': [{ 'mix-blend': [...ve(), 'plus-darker', 'plus-lighter'] }],
        'bg-blend': [{ 'bg-blend': ve() }],
        'mask-clip': [
          { 'mask-clip': ['border', 'padding', 'content', 'fill', 'stroke', 'view'] },
          'mask-no-clip',
        ],
        'mask-composite': [{ mask: ['add', 'subtract', 'intersect', 'exclude'] }],
        'mask-image-linear-pos': [{ 'mask-linear': [Re] }],
        'mask-image-linear-from-pos': [{ 'mask-linear-from': X() }],
        'mask-image-linear-to-pos': [{ 'mask-linear-to': X() }],
        'mask-image-linear-from-color': [{ 'mask-linear-from': F() }],
        'mask-image-linear-to-color': [{ 'mask-linear-to': F() }],
        'mask-image-t-from-pos': [{ 'mask-t-from': X() }],
        'mask-image-t-to-pos': [{ 'mask-t-to': X() }],
        'mask-image-t-from-color': [{ 'mask-t-from': F() }],
        'mask-image-t-to-color': [{ 'mask-t-to': F() }],
        'mask-image-r-from-pos': [{ 'mask-r-from': X() }],
        'mask-image-r-to-pos': [{ 'mask-r-to': X() }],
        'mask-image-r-from-color': [{ 'mask-r-from': F() }],
        'mask-image-r-to-color': [{ 'mask-r-to': F() }],
        'mask-image-b-from-pos': [{ 'mask-b-from': X() }],
        'mask-image-b-to-pos': [{ 'mask-b-to': X() }],
        'mask-image-b-from-color': [{ 'mask-b-from': F() }],
        'mask-image-b-to-color': [{ 'mask-b-to': F() }],
        'mask-image-l-from-pos': [{ 'mask-l-from': X() }],
        'mask-image-l-to-pos': [{ 'mask-l-to': X() }],
        'mask-image-l-from-color': [{ 'mask-l-from': F() }],
        'mask-image-l-to-color': [{ 'mask-l-to': F() }],
        'mask-image-x-from-pos': [{ 'mask-x-from': X() }],
        'mask-image-x-to-pos': [{ 'mask-x-to': X() }],
        'mask-image-x-from-color': [{ 'mask-x-from': F() }],
        'mask-image-x-to-color': [{ 'mask-x-to': F() }],
        'mask-image-y-from-pos': [{ 'mask-y-from': X() }],
        'mask-image-y-to-pos': [{ 'mask-y-to': X() }],
        'mask-image-y-from-color': [{ 'mask-y-from': F() }],
        'mask-image-y-to-color': [{ 'mask-y-to': F() }],
        'mask-image-radial': [{ 'mask-radial': [pe, de] }],
        'mask-image-radial-from-pos': [{ 'mask-radial-from': X() }],
        'mask-image-radial-to-pos': [{ 'mask-radial-to': X() }],
        'mask-image-radial-from-color': [{ 'mask-radial-from': F() }],
        'mask-image-radial-to-color': [{ 'mask-radial-to': F() }],
        'mask-image-radial-shape': [{ 'mask-radial': ['circle', 'ellipse'] }],
        'mask-image-radial-size': [
          { 'mask-radial': [{ closest: ['side', 'corner'], farthest: ['side', 'corner'] }] },
        ],
        'mask-image-radial-pos': [{ 'mask-radial-at': w() }],
        'mask-image-conic-pos': [{ 'mask-conic': [Re] }],
        'mask-image-conic-from-pos': [{ 'mask-conic-from': X() }],
        'mask-image-conic-to-pos': [{ 'mask-conic-to': X() }],
        'mask-image-conic-from-color': [{ 'mask-conic-from': F() }],
        'mask-image-conic-to-color': [{ 'mask-conic-to': F() }],
        'mask-mode': [{ mask: ['alpha', 'luminance', 'match'] }],
        'mask-origin': [
          { 'mask-origin': ['border', 'padding', 'content', 'fill', 'stroke', 'view'] },
        ],
        'mask-position': [{ mask: Q() }],
        'mask-repeat': [{ mask: q() }],
        'mask-size': [{ mask: se() }],
        'mask-type': [{ 'mask-type': ['alpha', 'luminance'] }],
        'mask-image': [{ mask: ['none', pe, de] }],
        filter: [{ filter: ['', 'none', pe, de] }],
        blur: [{ blur: me() }],
        brightness: [{ brightness: [Re, pe, de] }],
        contrast: [{ contrast: [Re, pe, de] }],
        'drop-shadow': [{ 'drop-shadow': ['', 'none', h, as, is] }],
        'drop-shadow-color': [{ 'drop-shadow': F() }],
        grayscale: [{ grayscale: ['', Re, pe, de] }],
        'hue-rotate': [{ 'hue-rotate': [Re, pe, de] }],
        invert: [{ invert: ['', Re, pe, de] }],
        saturate: [{ saturate: [Re, pe, de] }],
        sepia: [{ sepia: ['', Re, pe, de] }],
        'backdrop-filter': [{ 'backdrop-filter': ['', 'none', pe, de] }],
        'backdrop-blur': [{ 'backdrop-blur': me() }],
        'backdrop-brightness': [{ 'backdrop-brightness': [Re, pe, de] }],
        'backdrop-contrast': [{ 'backdrop-contrast': [Re, pe, de] }],
        'backdrop-grayscale': [{ 'backdrop-grayscale': ['', Re, pe, de] }],
        'backdrop-hue-rotate': [{ 'backdrop-hue-rotate': [Re, pe, de] }],
        'backdrop-invert': [{ 'backdrop-invert': ['', Re, pe, de] }],
        'backdrop-opacity': [{ 'backdrop-opacity': [Re, pe, de] }],
        'backdrop-saturate': [{ 'backdrop-saturate': [Re, pe, de] }],
        'backdrop-sepia': [{ 'backdrop-sepia': ['', Re, pe, de] }],
        'border-collapse': [{ border: ['collapse', 'separate'] }],
        'border-spacing': [{ 'border-spacing': R() }],
        'border-spacing-x': [{ 'border-spacing-x': R() }],
        'border-spacing-y': [{ 'border-spacing-y': R() }],
        'table-layout': [{ table: ['auto', 'fixed'] }],
        caption: [{ caption: ['top', 'bottom'] }],
        transition: [
          { transition: ['', 'all', 'colors', 'opacity', 'shadow', 'transform', 'none', pe, de] },
        ],
        'transition-behavior': [{ transition: ['normal', 'discrete'] }],
        duration: [{ duration: [Re, 'initial', pe, de] }],
        ease: [{ ease: ['linear', 'initial', y, pe, de] }],
        delay: [{ delay: [Re, pe, de] }],
        animate: [{ animate: ['none', v, pe, de] }],
        backface: [{ backface: ['hidden', 'visible'] }],
        perspective: [{ perspective: [p, pe, de] }],
        'perspective-origin': [{ 'perspective-origin': x() }],
        rotate: [{ rotate: he() }],
        'rotate-x': [{ 'rotate-x': he() }],
        'rotate-y': [{ 'rotate-y': he() }],
        'rotate-z': [{ 'rotate-z': he() }],
        scale: [{ scale: V() }],
        'scale-x': [{ 'scale-x': V() }],
        'scale-y': [{ 'scale-y': V() }],
        'scale-z': [{ 'scale-z': V() }],
        'scale-3d': ['scale-3d'],
        skew: [{ skew: Z() }],
        'skew-x': [{ 'skew-x': Z() }],
        'skew-y': [{ 'skew-y': Z() }],
        transform: [{ transform: [pe, de, '', 'none', 'gpu', 'cpu'] }],
        'transform-origin': [{ origin: x() }],
        'transform-style': [{ transform: ['3d', 'flat'] }],
        translate: [{ translate: K() }],
        'translate-x': [{ 'translate-x': K() }],
        'translate-y': [{ 'translate-y': K() }],
        'translate-z': [{ 'translate-z': K() }],
        'translate-none': ['translate-none'],
        zoom: [{ zoom: [Kt, pe, de] }],
        accent: [{ accent: F() }],
        appearance: [{ appearance: ['none', 'auto'] }],
        'caret-color': [{ caret: F() }],
        'color-scheme': [
          { scheme: ['normal', 'dark', 'light', 'light-dark', 'only-dark', 'only-light'] },
        ],
        cursor: [
          {
            cursor: [
              'auto',
              'default',
              'pointer',
              'wait',
              'text',
              'move',
              'help',
              'not-allowed',
              'none',
              'context-menu',
              'progress',
              'cell',
              'crosshair',
              'vertical-text',
              'alias',
              'copy',
              'no-drop',
              'grab',
              'grabbing',
              'all-scroll',
              'col-resize',
              'row-resize',
              'n-resize',
              'e-resize',
              's-resize',
              'w-resize',
              'ne-resize',
              'nw-resize',
              'se-resize',
              'sw-resize',
              'ew-resize',
              'ns-resize',
              'nesw-resize',
              'nwse-resize',
              'zoom-in',
              'zoom-out',
              pe,
              de,
            ],
          },
        ],
        'field-sizing': [{ 'field-sizing': ['fixed', 'content'] }],
        'pointer-events': [{ 'pointer-events': ['auto', 'none'] }],
        resize: [{ resize: ['none', '', 'y', 'x'] }],
        'scroll-behavior': [{ scroll: ['auto', 'smooth'] }],
        'scrollbar-thumb-color': [{ 'scrollbar-thumb': F() }],
        'scrollbar-track-color': [{ 'scrollbar-track': F() }],
        'scrollbar-gutter': [{ 'scrollbar-gutter': ['auto', 'stable', 'both'] }],
        'scrollbar-w': [{ scrollbar: ['auto', 'thin', 'none'] }],
        'scroll-m': [{ 'scroll-m': R() }],
        'scroll-mx': [{ 'scroll-mx': R() }],
        'scroll-my': [{ 'scroll-my': R() }],
        'scroll-ms': [{ 'scroll-ms': R() }],
        'scroll-me': [{ 'scroll-me': R() }],
        'scroll-mbs': [{ 'scroll-mbs': R() }],
        'scroll-mbe': [{ 'scroll-mbe': R() }],
        'scroll-mt': [{ 'scroll-mt': R() }],
        'scroll-mr': [{ 'scroll-mr': R() }],
        'scroll-mb': [{ 'scroll-mb': R() }],
        'scroll-ml': [{ 'scroll-ml': R() }],
        'scroll-p': [{ 'scroll-p': R() }],
        'scroll-px': [{ 'scroll-px': R() }],
        'scroll-py': [{ 'scroll-py': R() }],
        'scroll-ps': [{ 'scroll-ps': R() }],
        'scroll-pe': [{ 'scroll-pe': R() }],
        'scroll-pbs': [{ 'scroll-pbs': R() }],
        'scroll-pbe': [{ 'scroll-pbe': R() }],
        'scroll-pt': [{ 'scroll-pt': R() }],
        'scroll-pr': [{ 'scroll-pr': R() }],
        'scroll-pb': [{ 'scroll-pb': R() }],
        'scroll-pl': [{ 'scroll-pl': R() }],
        'snap-align': [{ snap: ['start', 'end', 'center', 'align-none'] }],
        'snap-stop': [{ snap: ['normal', 'always'] }],
        'snap-type': [{ snap: ['none', 'x', 'y', 'both'] }],
        'snap-strictness': [{ snap: ['mandatory', 'proximity'] }],
        touch: [{ touch: ['auto', 'none', 'manipulation'] }],
        'touch-x': [{ 'touch-pan': ['x', 'left', 'right'] }],
        'touch-y': [{ 'touch-pan': ['y', 'up', 'down'] }],
        'touch-pz': ['touch-pinch-zoom'],
        select: [{ select: ['none', 'text', 'all', 'auto'] }],
        'will-change': [{ 'will-change': ['auto', 'scroll', 'contents', 'transform', pe, de] }],
        fill: [{ fill: ['none', ...F()] }],
        'stroke-w': [{ stroke: [Re, po, er, su] }],
        stroke: [{ stroke: ['none', ...F()] }],
        'forced-color-adjust': [{ 'forced-color-adjust': ['auto', 'none'] }],
      },
      conflictingClassGroups: {
        'container-named': ['container-type'],
        overflow: ['overflow-x', 'overflow-y'],
        overscroll: ['overscroll-x', 'overscroll-y'],
        inset: [
          'inset-x',
          'inset-y',
          'inset-bs',
          'inset-be',
          'start',
          'end',
          'top',
          'right',
          'bottom',
          'left',
        ],
        'inset-x': ['right', 'left'],
        'inset-y': ['top', 'bottom'],
        flex: ['basis', 'grow', 'shrink'],
        gap: ['gap-x', 'gap-y'],
        p: ['px', 'py', 'ps', 'pe', 'pbs', 'pbe', 'pt', 'pr', 'pb', 'pl'],
        px: ['pr', 'pl'],
        py: ['pt', 'pb'],
        m: ['mx', 'my', 'ms', 'me', 'mbs', 'mbe', 'mt', 'mr', 'mb', 'ml'],
        mx: ['mr', 'ml'],
        my: ['mt', 'mb'],
        size: ['w', 'h'],
        'font-size': ['leading'],
        'fvn-normal': [
          'fvn-ordinal',
          'fvn-slashed-zero',
          'fvn-figure',
          'fvn-spacing',
          'fvn-fraction',
        ],
        'fvn-ordinal': ['fvn-normal'],
        'fvn-slashed-zero': ['fvn-normal'],
        'fvn-figure': ['fvn-normal'],
        'fvn-spacing': ['fvn-normal'],
        'fvn-fraction': ['fvn-normal'],
        'line-clamp': ['display', 'overflow'],
        rounded: [
          'rounded-s',
          'rounded-e',
          'rounded-t',
          'rounded-r',
          'rounded-b',
          'rounded-l',
          'rounded-ss',
          'rounded-se',
          'rounded-ee',
          'rounded-es',
          'rounded-tl',
          'rounded-tr',
          'rounded-br',
          'rounded-bl',
        ],
        'rounded-s': ['rounded-ss', 'rounded-es'],
        'rounded-e': ['rounded-se', 'rounded-ee'],
        'rounded-t': ['rounded-tl', 'rounded-tr'],
        'rounded-r': ['rounded-tr', 'rounded-br'],
        'rounded-b': ['rounded-br', 'rounded-bl'],
        'rounded-l': ['rounded-tl', 'rounded-bl'],
        'border-spacing': ['border-spacing-x', 'border-spacing-y'],
        'border-w': [
          'border-w-x',
          'border-w-y',
          'border-w-s',
          'border-w-e',
          'border-w-bs',
          'border-w-be',
          'border-w-t',
          'border-w-r',
          'border-w-b',
          'border-w-l',
        ],
        'border-w-x': ['border-w-r', 'border-w-l'],
        'border-w-y': ['border-w-t', 'border-w-b'],
        'border-color': [
          'border-color-x',
          'border-color-y',
          'border-color-s',
          'border-color-e',
          'border-color-bs',
          'border-color-be',
          'border-color-t',
          'border-color-r',
          'border-color-b',
          'border-color-l',
        ],
        'border-color-x': ['border-color-r', 'border-color-l'],
        'border-color-y': ['border-color-t', 'border-color-b'],
        translate: ['translate-x', 'translate-y', 'translate-none'],
        'translate-none': ['translate', 'translate-x', 'translate-y', 'translate-z'],
        'scroll-m': [
          'scroll-mx',
          'scroll-my',
          'scroll-ms',
          'scroll-me',
          'scroll-mbs',
          'scroll-mbe',
          'scroll-mt',
          'scroll-mr',
          'scroll-mb',
          'scroll-ml',
        ],
        'scroll-mx': ['scroll-mr', 'scroll-ml'],
        'scroll-my': ['scroll-mt', 'scroll-mb'],
        'scroll-p': [
          'scroll-px',
          'scroll-py',
          'scroll-ps',
          'scroll-pe',
          'scroll-pbs',
          'scroll-pbe',
          'scroll-pt',
          'scroll-pr',
          'scroll-pb',
          'scroll-pl',
        ],
        'scroll-px': ['scroll-pr', 'scroll-pl'],
        'scroll-py': ['scroll-pt', 'scroll-pb'],
        touch: ['touch-x', 'touch-y', 'touch-pz'],
        'touch-x': ['touch'],
        'touch-y': ['touch'],
        'touch-pz': ['touch'],
      },
      conflictingClassGroupModifiers: { 'font-size': ['leading'] },
      postfixLookupClassGroups: ['container-type'],
      orderSensitiveModifiers: [
        '*',
        '**',
        'after',
        'backdrop',
        'before',
        'details-content',
        'file',
        'first-letter',
        'first-line',
        'marker',
        'placeholder',
        'selection',
      ],
    }
  },
  Hb = yb(Vb)
var ap = typeof global == 'object' && global && global.Object === Object && global,
  Bb = typeof self == 'object' && self && self.Object === Object && self,
  xn = ap || Bb || Function('return this')(),
  $n = xn.Symbol,
  lp = Object.prototype,
  Wb = lp.hasOwnProperty,
  Gb = lp.toString,
  go = $n ? $n.toStringTag : void 0
function Ub(e) {
  var t = Wb.call(e, go),
    n = e[go]
  try {
    e[go] = void 0
    var r = !0
  } catch {}
  var o = Gb.call(e)
  return (r && (t ? (e[go] = n) : delete e[go]), o)
}
var Zb = Object.prototype,
  Kb = Zb.toString
function Yb(e) {
  return Kb.call(e)
}
var qb = '[object Null]',
  Xb = '[object Undefined]',
  lu = $n ? $n.toStringTag : void 0
function xr(e) {
  return e == null ? (e === void 0 ? Xb : qb) : lu && lu in Object(e) ? Ub(e) : Yb(e)
}
function cr(e) {
  return e != null && typeof e == 'object'
}
var Jb = '[object Symbol]'
function Sl(e) {
  return typeof e == 'symbol' || (cr(e) && xr(e) == Jb)
}
function Qb(e, t) {
  for (var n = -1, r = e == null ? 0 : e.length, o = Array(r); ++n < r; ) o[n] = t(e[n], n, e)
  return o
}
var tn = Array.isArray,
  cu = $n ? $n.prototype : void 0,
  uu = cu ? cu.toString : void 0
function cp(e) {
  if (typeof e == 'string') return e
  if (tn(e)) return Qb(e, cp) + ''
  if (Sl(e)) return uu ? uu.call(e) : ''
  var t = e + ''
  return t == '0' && 1 / e == -1 / 0 ? '-0' : t
}
function El(e) {
  var t = typeof e
  return e != null && (t == 'object' || t == 'function')
}
function ev(e) {
  return e
}
var tv = '[object AsyncFunction]',
  nv = '[object Function]',
  rv = '[object GeneratorFunction]',
  ov = '[object Proxy]'
function up(e) {
  if (!El(e)) return !1
  var t = xr(e)
  return t == nv || t == rv || t == tv || t == ov
}
var ea = xn['__core-js_shared__'],
  du = (function () {
    var e = /[^.]+$/.exec((ea && ea.keys && ea.keys.IE_PROTO) || '')
    return e ? 'Symbol(src)_1.' + e : ''
  })()
function sv(e) {
  return !!du && du in e
}
var iv = Function.prototype,
  av = iv.toString
function wr(e) {
  if (e != null) {
    try {
      return av.call(e)
    } catch {}
    try {
      return e + ''
    } catch {}
  }
  return ''
}
var lv = /[\\^$.*+?()[\]{}|]/g,
  cv = /^\[object .+?Constructor\]$/,
  uv = Function.prototype,
  dv = Object.prototype,
  fv = uv.toString,
  pv = dv.hasOwnProperty,
  gv = RegExp(
    '^' +
      fv
        .call(pv)
        .replace(lv, '\\$&')
        .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
      '$',
  )
function mv(e) {
  if (!El(e) || sv(e)) return !1
  var t = up(e) ? gv : cv
  return t.test(wr(e))
}
function hv(e, t) {
  return e?.[t]
}
function Cr(e, t) {
  var n = hv(e, t)
  return mv(n) ? n : void 0
}
var za = Cr(xn, 'WeakMap'),
  fu = (function () {
    try {
      var e = Cr(Object, 'defineProperty')
      return (e({}, '', {}), e)
    } catch {}
  })(),
  bv = 9007199254740991,
  vv = /^(?:0|[1-9]\d*)$/
function dp(e, t) {
  var n = typeof e
  return (
    (t = t ?? bv),
    !!t && (n == 'number' || (n != 'symbol' && vv.test(e))) && e > -1 && e % 1 == 0 && e < t
  )
}
function yv(e, t, n) {
  t == '__proto__' && fu
    ? fu(e, t, { configurable: !0, enumerable: !0, value: n, writable: !0 })
    : (e[t] = n)
}
function fp(e, t) {
  return e === t || (e !== e && t !== t)
}
var xv = 9007199254740991
function Rl(e) {
  return typeof e == 'number' && e > -1 && e % 1 == 0 && e <= xv
}
function pp(e) {
  return e != null && Rl(e.length) && !up(e)
}
var wv = Object.prototype
function Cv(e) {
  var t = e && e.constructor,
    n = (typeof t == 'function' && t.prototype) || wv
  return e === n
}
function Sv(e, t) {
  for (var n = -1, r = Array(e); ++n < e; ) r[n] = t(n)
  return r
}
var Ev = '[object Arguments]'
function pu(e) {
  return cr(e) && xr(e) == Ev
}
var gp = Object.prototype,
  Rv = gp.hasOwnProperty,
  kv = gp.propertyIsEnumerable,
  mp = pu(
    (function () {
      return arguments
    })(),
  )
    ? pu
    : function (e) {
        return cr(e) && Rv.call(e, 'callee') && !kv.call(e, 'callee')
      }
function Iv() {
  return !1
}
var hp = typeof exports == 'object' && exports && !exports.nodeType && exports,
  gu = hp && typeof module == 'object' && module && !module.nodeType && module,
  Tv = gu && gu.exports === hp,
  mu = Tv ? xn.Buffer : void 0,
  Pv = mu ? mu.isBuffer : void 0,
  La = Pv || Iv,
  Ov = '[object Arguments]',
  Mv = '[object Array]',
  Av = '[object Boolean]',
  zv = '[object Date]',
  Lv = '[object Error]',
  jv = '[object Function]',
  Dv = '[object Map]',
  Nv = '[object Number]',
  _v = '[object Object]',
  Fv = '[object RegExp]',
  $v = '[object Set]',
  Vv = '[object String]',
  Hv = '[object WeakMap]',
  Bv = '[object ArrayBuffer]',
  Wv = '[object DataView]',
  Gv = '[object Float32Array]',
  Uv = '[object Float64Array]',
  Zv = '[object Int8Array]',
  Kv = '[object Int16Array]',
  Yv = '[object Int32Array]',
  qv = '[object Uint8Array]',
  Xv = '[object Uint8ClampedArray]',
  Jv = '[object Uint16Array]',
  Qv = '[object Uint32Array]',
  Be = {}
Be[Gv] = Be[Uv] = Be[Zv] = Be[Kv] = Be[Yv] = Be[qv] = Be[Xv] = Be[Jv] = Be[Qv] = !0
Be[Ov] =
  Be[Mv] =
  Be[Bv] =
  Be[Av] =
  Be[Wv] =
  Be[zv] =
  Be[Lv] =
  Be[jv] =
  Be[Dv] =
  Be[Nv] =
  Be[_v] =
  Be[Fv] =
  Be[$v] =
  Be[Vv] =
  Be[Hv] =
    !1
function ey(e) {
  return cr(e) && Rl(e.length) && !!Be[xr(e)]
}
function ty(e) {
  return function (t) {
    return e(t)
  }
}
var bp = typeof exports == 'object' && exports && !exports.nodeType && exports,
  Eo = bp && typeof module == 'object' && module && !module.nodeType && module,
  ny = Eo && Eo.exports === bp,
  ta = ny && ap.process,
  hu = (function () {
    try {
      var e = Eo && Eo.require && Eo.require('util').types
      return e || (ta && ta.binding && ta.binding('util'))
    } catch {}
  })(),
  bu = hu && hu.isTypedArray,
  vp = bu ? ty(bu) : ey,
  ry = Object.prototype,
  oy = ry.hasOwnProperty
function sy(e, t) {
  var n = tn(e),
    r = !n && mp(e),
    o = !n && !r && La(e),
    s = !n && !r && !o && vp(e),
    i = n || r || o || s,
    a = i ? Sv(e.length, String) : [],
    c = a.length
  for (var u in e)
    oy.call(e, u) &&
      !(
        i &&
        (u == 'length' ||
          (o && (u == 'offset' || u == 'parent')) ||
          (s && (u == 'buffer' || u == 'byteLength' || u == 'byteOffset')) ||
          dp(u, c))
      ) &&
      a.push(u)
  return a
}
function iy(e, t) {
  return function (n) {
    return e(t(n))
  }
}
var ay = iy(Object.keys, Object),
  ly = Object.prototype,
  cy = ly.hasOwnProperty
function uy(e) {
  if (!Cv(e)) return ay(e)
  var t = []
  for (var n in Object(e)) cy.call(e, n) && n != 'constructor' && t.push(n)
  return t
}
function kl(e) {
  return pp(e) ? sy(e) : uy(e)
}
var dy = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
  fy = /^\w*$/
function Il(e, t) {
  if (tn(e)) return !1
  var n = typeof e
  return n == 'number' || n == 'symbol' || n == 'boolean' || e == null || Sl(e)
    ? !0
    : fy.test(e) || !dy.test(e) || (t != null && e in Object(t))
}
var Mo = Cr(Object, 'create')
function py() {
  ;((this.__data__ = Mo ? Mo(null) : {}), (this.size = 0))
}
function gy(e) {
  var t = this.has(e) && delete this.__data__[e]
  return ((this.size -= t ? 1 : 0), t)
}
var my = '__lodash_hash_undefined__',
  hy = Object.prototype,
  by = hy.hasOwnProperty
function vy(e) {
  var t = this.__data__
  if (Mo) {
    var n = t[e]
    return n === my ? void 0 : n
  }
  return by.call(t, e) ? t[e] : void 0
}
var yy = Object.prototype,
  xy = yy.hasOwnProperty
function wy(e) {
  var t = this.__data__
  return Mo ? t[e] !== void 0 : xy.call(t, e)
}
var Cy = '__lodash_hash_undefined__'
function Sy(e, t) {
  var n = this.__data__
  return ((this.size += this.has(e) ? 0 : 1), (n[e] = Mo && t === void 0 ? Cy : t), this)
}
function ur(e) {
  var t = -1,
    n = e == null ? 0 : e.length
  for (this.clear(); ++t < n; ) {
    var r = e[t]
    this.set(r[0], r[1])
  }
}
ur.prototype.clear = py
ur.prototype.delete = gy
ur.prototype.get = vy
ur.prototype.has = wy
ur.prototype.set = Sy
function Ey() {
  ;((this.__data__ = []), (this.size = 0))
}
function ui(e, t) {
  for (var n = e.length; n--; ) if (fp(e[n][0], t)) return n
  return -1
}
var Ry = Array.prototype,
  ky = Ry.splice
function Iy(e) {
  var t = this.__data__,
    n = ui(t, e)
  if (n < 0) return !1
  var r = t.length - 1
  return (n == r ? t.pop() : ky.call(t, n, 1), --this.size, !0)
}
function Ty(e) {
  var t = this.__data__,
    n = ui(t, e)
  return n < 0 ? void 0 : t[n][1]
}
function Py(e) {
  return ui(this.__data__, e) > -1
}
function Oy(e, t) {
  var n = this.__data__,
    r = ui(n, e)
  return (r < 0 ? (++this.size, n.push([e, t])) : (n[r][1] = t), this)
}
function wn(e) {
  var t = -1,
    n = e == null ? 0 : e.length
  for (this.clear(); ++t < n; ) {
    var r = e[t]
    this.set(r[0], r[1])
  }
}
wn.prototype.clear = Ey
wn.prototype.delete = Iy
wn.prototype.get = Ty
wn.prototype.has = Py
wn.prototype.set = Oy
var Ao = Cr(xn, 'Map')
function My() {
  ;((this.size = 0), (this.__data__ = { hash: new ur(), map: new (Ao || wn)(), string: new ur() }))
}
function Ay(e) {
  var t = typeof e
  return t == 'string' || t == 'number' || t == 'symbol' || t == 'boolean'
    ? e !== '__proto__'
    : e === null
}
function di(e, t) {
  var n = e.__data__
  return Ay(t) ? n[typeof t == 'string' ? 'string' : 'hash'] : n.map
}
function zy(e) {
  var t = di(this, e).delete(e)
  return ((this.size -= t ? 1 : 0), t)
}
function Ly(e) {
  return di(this, e).get(e)
}
function jy(e) {
  return di(this, e).has(e)
}
function Dy(e, t) {
  var n = di(this, e),
    r = n.size
  return (n.set(e, t), (this.size += n.size == r ? 0 : 1), this)
}
function Cn(e) {
  var t = -1,
    n = e == null ? 0 : e.length
  for (this.clear(); ++t < n; ) {
    var r = e[t]
    this.set(r[0], r[1])
  }
}
Cn.prototype.clear = My
Cn.prototype.delete = zy
Cn.prototype.get = Ly
Cn.prototype.has = jy
Cn.prototype.set = Dy
var Ny = 'Expected a function'
function Tl(e, t) {
  if (typeof e != 'function' || (t != null && typeof t != 'function')) throw new TypeError(Ny)
  var n = function () {
    var r = arguments,
      o = t ? t.apply(this, r) : r[0],
      s = n.cache
    if (s.has(o)) return s.get(o)
    var i = e.apply(this, r)
    return ((n.cache = s.set(o, i) || s), i)
  }
  return ((n.cache = new (Tl.Cache || Cn)()), n)
}
Tl.Cache = Cn
var _y = 500
function Fy(e) {
  var t = Tl(e, function (r) {
      return (n.size === _y && n.clear(), r)
    }),
    n = t.cache
  return t
}
var $y =
    /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
  Vy = /\\(\\)?/g,
  Hy = Fy(function (e) {
    var t = []
    return (
      e.charCodeAt(0) === 46 && t.push(''),
      e.replace($y, function (n, r, o, s) {
        t.push(o ? s.replace(Vy, '$1') : r || n)
      }),
      t
    )
  })
function Pl(e) {
  return e == null ? '' : cp(e)
}
function yp(e, t) {
  return tn(e) ? e : Il(e, t) ? [e] : Hy(Pl(e))
}
function fi(e) {
  if (typeof e == 'string' || Sl(e)) return e
  var t = e + ''
  return t == '0' && 1 / e == -1 / 0 ? '-0' : t
}
function xp(e, t) {
  t = yp(t, e)
  for (var n = 0, r = t.length; e != null && n < r; ) e = e[fi(t[n++])]
  return n && n == r ? e : void 0
}
function By(e, t, n) {
  var r = e == null ? void 0 : xp(e, t)
  return r === void 0 ? n : r
}
function Wy(e, t) {
  for (var n = -1, r = t.length, o = e.length; ++n < r; ) e[o + n] = t[n]
  return e
}
function Gy(e, t, n) {
  var r = -1,
    o = e.length
  ;(t < 0 && (t = -t > o ? 0 : o + t),
    (n = n > o ? o : n),
    n < 0 && (n += o),
    (o = t > n ? 0 : (n - t) >>> 0),
    (t >>>= 0))
  for (var s = Array(o); ++r < o; ) s[r] = e[r + t]
  return s
}
function Uy(e, t, n) {
  var r = e.length
  return ((n = n === void 0 ? r : n), !t && n >= r ? e : Gy(e, t, n))
}
var Zy = '\\ud800-\\udfff',
  Ky = '\\u0300-\\u036f',
  Yy = '\\ufe20-\\ufe2f',
  qy = '\\u20d0-\\u20ff',
  Xy = Ky + Yy + qy,
  Jy = '\\ufe0e\\ufe0f',
  Qy = '\\u200d',
  ex = RegExp('[' + Qy + Zy + Xy + Jy + ']')
function wp(e) {
  return ex.test(e)
}
function tx(e) {
  return e.split('')
}
var Cp = '\\ud800-\\udfff',
  nx = '\\u0300-\\u036f',
  rx = '\\ufe20-\\ufe2f',
  ox = '\\u20d0-\\u20ff',
  sx = nx + rx + ox,
  ix = '\\ufe0e\\ufe0f',
  ax = '[' + Cp + ']',
  ja = '[' + sx + ']',
  Da = '\\ud83c[\\udffb-\\udfff]',
  lx = '(?:' + ja + '|' + Da + ')',
  Sp = '[^' + Cp + ']',
  Ep = '(?:\\ud83c[\\udde6-\\uddff]){2}',
  Rp = '[\\ud800-\\udbff][\\udc00-\\udfff]',
  cx = '\\u200d',
  kp = lx + '?',
  Ip = '[' + ix + ']?',
  ux = '(?:' + cx + '(?:' + [Sp, Ep, Rp].join('|') + ')' + Ip + kp + ')*',
  dx = Ip + kp + ux,
  fx = '(?:' + [Sp + ja + '?', ja, Ep, Rp, ax].join('|') + ')',
  px = RegExp(Da + '(?=' + Da + ')|' + fx + dx, 'g')
function gx(e) {
  return e.match(px) || []
}
function mx(e) {
  return wp(e) ? gx(e) : tx(e)
}
function hx(e) {
  return function (t) {
    t = Pl(t)
    var n = wp(t) ? mx(t) : void 0,
      r = n ? n[0] : t.charAt(0),
      o = n ? Uy(n, 1).join('') : t.slice(1)
    return r[e]() + o
  }
}
var bx = hx('toUpperCase')
function vx(e) {
  return bx(Pl(e).toLowerCase())
}
function yx(e, t, n, r) {
  var o = -1,
    s = e == null ? 0 : e.length
  for (r && s && (n = e[++o]); ++o < s; ) n = t(n, e[o], o, e)
  return n
}
function xx() {
  ;((this.__data__ = new wn()), (this.size = 0))
}
function wx(e) {
  var t = this.__data__,
    n = t.delete(e)
  return ((this.size = t.size), n)
}
function Cx(e) {
  return this.__data__.get(e)
}
function Sx(e) {
  return this.__data__.has(e)
}
var Ex = 200
function Rx(e, t) {
  var n = this.__data__
  if (n instanceof wn) {
    var r = n.__data__
    if (!Ao || r.length < Ex - 1) return (r.push([e, t]), (this.size = ++n.size), this)
    n = this.__data__ = new Cn(r)
  }
  return (n.set(e, t), (this.size = n.size), this)
}
function fn(e) {
  var t = (this.__data__ = new wn(e))
  this.size = t.size
}
fn.prototype.clear = xx
fn.prototype.delete = wx
fn.prototype.get = Cx
fn.prototype.has = Sx
fn.prototype.set = Rx
function kx(e, t) {
  for (var n = -1, r = e == null ? 0 : e.length, o = 0, s = []; ++n < r; ) {
    var i = e[n]
    t(i, n, e) && (s[o++] = i)
  }
  return s
}
function Ix() {
  return []
}
var Tx = Object.prototype,
  Px = Tx.propertyIsEnumerable,
  vu = Object.getOwnPropertySymbols,
  Ox = vu
    ? function (e) {
        return e == null
          ? []
          : ((e = Object(e)),
            kx(vu(e), function (t) {
              return Px.call(e, t)
            }))
      }
    : Ix
function Mx(e, t, n) {
  var r = t(e)
  return tn(e) ? r : Wy(r, n(e))
}
function yu(e) {
  return Mx(e, kl, Ox)
}
var Na = Cr(xn, 'DataView'),
  _a = Cr(xn, 'Promise'),
  Fa = Cr(xn, 'Set'),
  xu = '[object Map]',
  Ax = '[object Object]',
  wu = '[object Promise]',
  Cu = '[object Set]',
  Su = '[object WeakMap]',
  Eu = '[object DataView]',
  zx = wr(Na),
  Lx = wr(Ao),
  jx = wr(_a),
  Dx = wr(Fa),
  Nx = wr(za),
  An = xr
;((Na && An(new Na(new ArrayBuffer(1))) != Eu) ||
  (Ao && An(new Ao()) != xu) ||
  (_a && An(_a.resolve()) != wu) ||
  (Fa && An(new Fa()) != Cu) ||
  (za && An(new za()) != Su)) &&
  (An = function (e) {
    var t = xr(e),
      n = t == Ax ? e.constructor : void 0,
      r = n ? wr(n) : ''
    if (r)
      switch (r) {
        case zx:
          return Eu
        case Lx:
          return xu
        case jx:
          return wu
        case Dx:
          return Cu
        case Nx:
          return Su
      }
    return t
  })
var Ru = xn.Uint8Array,
  _x = '__lodash_hash_undefined__'
function Fx(e) {
  return (this.__data__.set(e, _x), this)
}
function $x(e) {
  return this.__data__.has(e)
}
function Vs(e) {
  var t = -1,
    n = e == null ? 0 : e.length
  for (this.__data__ = new Cn(); ++t < n; ) this.add(e[t])
}
Vs.prototype.add = Vs.prototype.push = Fx
Vs.prototype.has = $x
function Vx(e, t) {
  for (var n = -1, r = e == null ? 0 : e.length; ++n < r; ) if (t(e[n], n, e)) return !0
  return !1
}
function Hx(e, t) {
  return e.has(t)
}
var Bx = 1,
  Wx = 2
function Tp(e, t, n, r, o, s) {
  var i = n & Bx,
    a = e.length,
    c = t.length
  if (a != c && !(i && c > a)) return !1
  var u = s.get(e),
    f = s.get(t)
  if (u && f) return u == t && f == e
  var d = -1,
    g = !0,
    h = n & Wx ? new Vs() : void 0
  for (s.set(e, t), s.set(t, e); ++d < a; ) {
    var m = e[d],
      p = t[d]
    if (r) var b = i ? r(p, m, d, t, e, s) : r(m, p, d, e, t, s)
    if (b !== void 0) {
      if (b) continue
      g = !1
      break
    }
    if (h) {
      if (
        !Vx(t, function (y, v) {
          if (!Hx(h, v) && (m === y || o(m, y, n, r, s))) return h.push(v)
        })
      ) {
        g = !1
        break
      }
    } else if (!(m === p || o(m, p, n, r, s))) {
      g = !1
      break
    }
  }
  return (s.delete(e), s.delete(t), g)
}
function Gx(e) {
  var t = -1,
    n = Array(e.size)
  return (
    e.forEach(function (r, o) {
      n[++t] = [o, r]
    }),
    n
  )
}
function Ux(e) {
  var t = -1,
    n = Array(e.size)
  return (
    e.forEach(function (r) {
      n[++t] = r
    }),
    n
  )
}
var Zx = 1,
  Kx = 2,
  Yx = '[object Boolean]',
  qx = '[object Date]',
  Xx = '[object Error]',
  Jx = '[object Map]',
  Qx = '[object Number]',
  e1 = '[object RegExp]',
  t1 = '[object Set]',
  n1 = '[object String]',
  r1 = '[object Symbol]',
  o1 = '[object ArrayBuffer]',
  s1 = '[object DataView]',
  ku = $n ? $n.prototype : void 0,
  na = ku ? ku.valueOf : void 0
function i1(e, t, n, r, o, s, i) {
  switch (n) {
    case s1:
      if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset) return !1
      ;((e = e.buffer), (t = t.buffer))
    case o1:
      return !(e.byteLength != t.byteLength || !s(new Ru(e), new Ru(t)))
    case Yx:
    case qx:
    case Qx:
      return fp(+e, +t)
    case Xx:
      return e.name == t.name && e.message == t.message
    case e1:
    case n1:
      return e == t + ''
    case Jx:
      var a = Gx
    case t1:
      var c = r & Zx
      if ((a || (a = Ux), e.size != t.size && !c)) return !1
      var u = i.get(e)
      if (u) return u == t
      ;((r |= Kx), i.set(e, t))
      var f = Tp(a(e), a(t), r, o, s, i)
      return (i.delete(e), f)
    case r1:
      if (na) return na.call(e) == na.call(t)
  }
  return !1
}
var a1 = 1,
  l1 = Object.prototype,
  c1 = l1.hasOwnProperty
function u1(e, t, n, r, o, s) {
  var i = n & a1,
    a = yu(e),
    c = a.length,
    u = yu(t),
    f = u.length
  if (c != f && !i) return !1
  for (var d = c; d--; ) {
    var g = a[d]
    if (!(i ? g in t : c1.call(t, g))) return !1
  }
  var h = s.get(e),
    m = s.get(t)
  if (h && m) return h == t && m == e
  var p = !0
  ;(s.set(e, t), s.set(t, e))
  for (var b = i; ++d < c; ) {
    g = a[d]
    var y = e[g],
      v = t[g]
    if (r) var C = i ? r(v, y, g, t, e, s) : r(y, v, g, e, t, s)
    if (!(C === void 0 ? y === v || o(y, v, n, r, s) : C)) {
      p = !1
      break
    }
    b || (b = g == 'constructor')
  }
  if (p && !b) {
    var w = e.constructor,
      x = t.constructor
    w != x &&
      'constructor' in e &&
      'constructor' in t &&
      !(typeof w == 'function' && w instanceof w && typeof x == 'function' && x instanceof x) &&
      (p = !1)
  }
  return (s.delete(e), s.delete(t), p)
}
var d1 = 1,
  Iu = '[object Arguments]',
  Tu = '[object Array]',
  ls = '[object Object]',
  f1 = Object.prototype,
  Pu = f1.hasOwnProperty
function p1(e, t, n, r, o, s) {
  var i = tn(e),
    a = tn(t),
    c = i ? Tu : An(e),
    u = a ? Tu : An(t)
  ;((c = c == Iu ? ls : c), (u = u == Iu ? ls : u))
  var f = c == ls,
    d = u == ls,
    g = c == u
  if (g && La(e)) {
    if (!La(t)) return !1
    ;((i = !0), (f = !1))
  }
  if (g && !f)
    return (s || (s = new fn()), i || vp(e) ? Tp(e, t, n, r, o, s) : i1(e, t, c, n, r, o, s))
  if (!(n & d1)) {
    var h = f && Pu.call(e, '__wrapped__'),
      m = d && Pu.call(t, '__wrapped__')
    if (h || m) {
      var p = h ? e.value() : e,
        b = m ? t.value() : t
      return (s || (s = new fn()), o(p, b, n, r, s))
    }
  }
  return g ? (s || (s = new fn()), u1(e, t, n, r, o, s)) : !1
}
function Ol(e, t, n, r, o) {
  return e === t
    ? !0
    : e == null || t == null || (!cr(e) && !cr(t))
      ? e !== e && t !== t
      : p1(e, t, n, r, Ol, o)
}
var g1 = 1,
  m1 = 2
function h1(e, t, n, r) {
  var o = n.length,
    s = o
  if (e == null) return !s
  for (e = Object(e); o--; ) {
    var i = n[o]
    if (i[2] ? i[1] !== e[i[0]] : !(i[0] in e)) return !1
  }
  for (; ++o < s; ) {
    i = n[o]
    var a = i[0],
      c = e[a],
      u = i[1]
    if (i[2]) {
      if (c === void 0 && !(a in e)) return !1
    } else {
      var f = new fn(),
        d
      if (!(d === void 0 ? Ol(u, c, g1 | m1, r, f) : d)) return !1
    }
  }
  return !0
}
function Pp(e) {
  return e === e && !El(e)
}
function b1(e) {
  for (var t = kl(e), n = t.length; n--; ) {
    var r = t[n],
      o = e[r]
    t[n] = [r, o, Pp(o)]
  }
  return t
}
function Op(e, t) {
  return function (n) {
    return n == null ? !1 : n[e] === t && (t !== void 0 || e in Object(n))
  }
}
function v1(e) {
  var t = b1(e)
  return t.length == 1 && t[0][2]
    ? Op(t[0][0], t[0][1])
    : function (n) {
        return n === e || h1(n, e, t)
      }
}
function y1(e, t) {
  return e != null && t in Object(e)
}
function x1(e, t, n) {
  t = yp(t, e)
  for (var r = -1, o = t.length, s = !1; ++r < o; ) {
    var i = fi(t[r])
    if (!(s = e != null && n(e, i))) break
    e = e[i]
  }
  return s || ++r != o
    ? s
    : ((o = e == null ? 0 : e.length), !!o && Rl(o) && dp(i, o) && (tn(e) || mp(e)))
}
function w1(e, t) {
  return e != null && x1(e, t, y1)
}
var C1 = 1,
  S1 = 2
function E1(e, t) {
  return Il(e) && Pp(t)
    ? Op(fi(e), t)
    : function (n) {
        var r = By(n, e)
        return r === void 0 && r === t ? w1(n, e) : Ol(t, r, C1 | S1)
      }
}
function R1(e) {
  return function (t) {
    return t?.[e]
  }
}
function k1(e) {
  return function (t) {
    return xp(t, e)
  }
}
function I1(e) {
  return Il(e) ? R1(fi(e)) : k1(e)
}
function Mp(e) {
  return typeof e == 'function'
    ? e
    : e == null
      ? ev
      : typeof e == 'object'
        ? tn(e)
          ? E1(e[0], e[1])
          : v1(e)
        : I1(e)
}
function T1(e) {
  return function (t, n, r) {
    for (var o = -1, s = Object(t), i = r(t), a = i.length; a--; ) {
      var c = i[++o]
      if (n(s[c], c, s) === !1) break
    }
    return t
  }
}
var P1 = T1()
function Ap(e, t) {
  return e && P1(e, t, kl)
}
function O1(e, t) {
  return function (n, r) {
    if (n == null) return n
    if (!pp(n)) return e(n, r)
    for (var o = n.length, s = -1, i = Object(n); ++s < o && r(i[s], s, i) !== !1; );
    return n
  }
}
var M1 = O1(Ap),
  A1 = '[object Number]'
function zp(e) {
  return typeof e == 'number' || (cr(e) && xr(e) == A1)
}
function $a(e) {
  return e === null
}
function z1(e, t) {
  var n = {}
  return (
    (t = Mp(t)),
    Ap(e, function (r, o, s) {
      yv(n, o, t(r, o, s))
    }),
    n
  )
}
function L1(e, t, n, r, o) {
  return (
    o(e, function (s, i, a) {
      n = r ? ((r = !1), s) : t(n, s, i, a)
    }),
    n
  )
}
function j1(e, t, n) {
  var r = tn(e) ? yx : L1,
    o = arguments.length < 3
  return r(e, Mp(t), n, o, M1)
}
function Ro({ controlled: e, default: t, name: n, state: r = 'value' }) {
  const { current: o } = l.useRef(e !== void 0),
    [s, i] = l.useState(t),
    a = o ? e : s,
    c = l.useCallback((u) => {
      o || i(u)
    }, [])
  return [a, c]
}
const Ou = {}
function ot(e, t) {
  const n = l.useRef(Ou)
  return (n.current === Ou && (n.current = e(t)), n)
}
const ra = Fs[`useInsertionEffect${Math.random().toFixed(1)}`.slice(0, -3)],
  D1 = ra && ra !== l.useLayoutEffect ? ra : (e) => e()
function ne(e) {
  const t = ot(N1).current
  return ((t.next = e), D1(t.effect), t.trampoline)
}
function N1() {
  const e = {
    next: void 0,
    callback: _1,
    trampoline: (...t) => e.callback?.(...t),
    effect: () => {
      e.callback = e.next
    },
  }
  return e
}
function _1() {}
const F1 = () => {},
  ae = typeof document < 'u' ? l.useLayoutEffect : F1,
  Lp = l.createContext({
    register: () => {},
    unregister: () => {},
    subscribeMapChange: () => () => {},
    elementsRef: { current: [] },
    nextIndexRef: { current: 0 },
  })
function $1() {
  return l.useContext(Lp)
}
function Ml(e) {
  const { children: t, elementsRef: n, labelsRef: r, onMapChange: o } = e,
    s = ne(o),
    i = l.useRef(0),
    a = ot(H1).current,
    c = ot(V1).current,
    [u, f] = l.useState(0),
    d = l.useRef(u),
    g = ne((y, v) => {
      ;(c.set(y, v ?? null), (d.current += 1), f(d.current))
    }),
    h = ne((y) => {
      ;(c.delete(y), (d.current += 1), f(d.current))
    }),
    m = l.useMemo(() => {
      const y = new Map()
      return (
        Array.from(c.keys())
          .filter((C) => C.isConnected)
          .sort(B1)
          .forEach((C, w) => {
            const x = c.get(C) ?? {}
            y.set(C, { ...x, index: w })
          }),
        y
      )
    }, [c, u])
  ;(ae(() => {
    if (typeof MutationObserver != 'function' || m.size === 0) return
    const y = new MutationObserver((v) => {
      const C = new Set(),
        w = (x) => (C.has(x) ? C.delete(x) : C.add(x))
      ;(v.forEach((x) => {
        ;(x.removedNodes.forEach(w), x.addedNodes.forEach(w))
      }),
        C.size === 0 && ((d.current += 1), f(d.current)))
    })
    return (
      m.forEach((v, C) => {
        C.parentElement && y.observe(C.parentElement, { childList: !0 })
      }),
      () => {
        y.disconnect()
      }
    )
  }, [m]),
    ae(() => {
      ;(d.current === u &&
        (n.current.length !== m.size && (n.current.length = m.size),
        r && r.current.length !== m.size && (r.current.length = m.size),
        (i.current = m.size)),
        s(m))
    }, [s, m, n, r, u]),
    ae(
      () => () => {
        n.current = []
      },
      [n],
    ),
    ae(
      () => () => {
        r && (r.current = [])
      },
      [r],
    ))
  const p = ne(
    (y) => (
      a.add(y),
      () => {
        a.delete(y)
      }
    ),
  )
  ae(() => {
    a.forEach((y) => y(m))
  }, [a, m])
  const b = l.useMemo(
    () => ({
      register: g,
      unregister: h,
      subscribeMapChange: p,
      elementsRef: n,
      labelsRef: r,
      nextIndexRef: i,
    }),
    [g, h, p, n, r, i],
  )
  return E.jsx(Lp.Provider, { value: b, children: t })
}
function V1() {
  return new Map()
}
function H1() {
  return new Set()
}
function B1(e, t) {
  const n = e.compareDocumentPosition(t)
  return n & Node.DOCUMENT_POSITION_FOLLOWING || n & Node.DOCUMENT_POSITION_CONTAINED_BY
    ? -1
    : n & Node.DOCUMENT_POSITION_PRECEDING || n & Node.DOCUMENT_POSITION_CONTAINS
      ? 1
      : 0
}
const W1 = l.createContext(void 0)
function pi() {
  return l.useContext(W1)?.direction ?? 'ltr'
}
function Ve(e, ...t) {
  const n = new URL('https://base-ui.com/production-error')
  return (
    n.searchParams.set('code', e.toString()),
    t.forEach((r) => n.searchParams.append('args[]', r)),
    `Base UI error #${e}; visit ${n} for the full message.`
  )
}
function Vn(e, t, n, r) {
  const o = ot(jp).current
  return (U1(o, e, t, n, r) && Dp(o, [e, t, n, r]), o.callback)
}
function G1(e) {
  const t = ot(jp).current
  return (Z1(t, e) && Dp(t, e), t.callback)
}
function jp() {
  return { callback: null, cleanup: null, refs: [] }
}
function U1(e, t, n, r, o) {
  return e.refs[0] !== t || e.refs[1] !== n || e.refs[2] !== r || e.refs[3] !== o
}
function Z1(e, t) {
  return e.refs.length !== t.length || e.refs.some((n, r) => n !== t[r])
}
function Dp(e, t) {
  if (((e.refs = t), t.every((n) => n == null))) {
    e.callback = null
    return
  }
  e.callback = (n) => {
    if ((e.cleanup && (e.cleanup(), (e.cleanup = null)), n != null)) {
      const r = Array(t.length).fill(null)
      for (let o = 0; o < t.length; o += 1) {
        const s = t[o]
        if (s != null)
          switch (typeof s) {
            case 'function': {
              const i = s(n)
              typeof i == 'function' && (r[o] = i)
              break
            }
            case 'object': {
              s.current = n
              break
            }
          }
      }
      e.cleanup = () => {
        for (let o = 0; o < t.length; o += 1) {
          const s = t[o]
          if (s != null)
            switch (typeof s) {
              case 'function': {
                const i = r[o]
                typeof i == 'function' ? i() : s(null)
                break
              }
              case 'object': {
                s.current = null
                break
              }
            }
        }
      }
    }
  }
}
const K1 = parseInt(l.version, 10)
function Al(e) {
  return K1 >= e
}
function Mu(e) {
  if (!l.isValidElement(e)) return null
  const t = e,
    n = t.props
  return (Al(19) ? n?.ref : t.ref) ?? null
}
function Va(e, t) {
  if (e && !t) return e
  if (!e && t) return t
  if (e || t) return { ...e, ...t }
}
function Y1(e, t) {
  const n = {}
  for (const r in e) {
    const o = e[r]
    if (t?.hasOwnProperty(r)) {
      const s = t[r](o)
      s != null && Object.assign(n, s)
      continue
    }
    o === !0
      ? (n[`data-${r.toLowerCase()}`] = '')
      : o && (n[`data-${r.toLowerCase()}`] = o.toString())
  }
  return n
}
function q1(e, t) {
  return typeof e == 'function' ? e(t) : e
}
function X1(e, t) {
  return typeof e == 'function' ? e(t) : e
}
const ko = {}
function zo(e, t, n, r, o) {
  let s = { ...Ha(e, ko) }
  return (t && (s = Ts(s, t)), n && (s = Ts(s, n)), r && (s = Ts(s, r)), s)
}
function J1(e) {
  if (e.length === 0) return ko
  if (e.length === 1) return Ha(e[0], ko)
  let t = { ...Ha(e[0], ko) }
  for (let n = 1; n < e.length; n += 1) t = Ts(t, e[n])
  return t
}
function Ts(e, t) {
  return Np(t) ? t(e) : Q1(e, t)
}
function Q1(e, t) {
  if (!t) return e
  for (const n in t) {
    const r = t[n]
    switch (n) {
      case 'style': {
        e[n] = Va(e.style, r)
        break
      }
      case 'className': {
        e[n] = _p(e.className, r)
        break
      }
      default:
        ew(n, r) ? (e[n] = tw(e[n], r)) : (e[n] = r)
    }
  }
  return e
}
function ew(e, t) {
  const n = e.charCodeAt(0),
    r = e.charCodeAt(1),
    o = e.charCodeAt(2)
  return n === 111 && r === 110 && o >= 65 && o <= 90 && (typeof t == 'function' || typeof t > 'u')
}
function Np(e) {
  return typeof e == 'function'
}
function Ha(e, t) {
  return Np(e) ? e(t) : (e ?? ko)
}
function tw(e, t) {
  return t
    ? e
      ? (n) => {
          if (nw(n)) {
            const o = n
            Ba(o)
            const s = t(o)
            return (o.baseUIHandlerPrevented || e?.(o), s)
          }
          const r = t(n)
          return (e?.(n), r)
        }
      : t
    : e
}
function Ba(e) {
  return (
    (e.preventBaseUIHandler = () => {
      e.baseUIHandlerPrevented = !0
    }),
    e
  )
}
function _p(e, t) {
  return t ? (e ? t + ' ' + e : t) : e
}
function nw(e) {
  return e != null && typeof e == 'object' && 'nativeEvent' in e
}
function Ue() {}
const un = Object.freeze([]),
  Ke = Object.freeze({}),
  rw = 500,
  ow = 500,
  sw = { style: { transition: 'none' } },
  iw = 'data-base-ui-click-trigger',
  Fp = { fallbackAxisSide: 'none' },
  $p = { fallbackAxisSide: 'end' },
  aw = { clipPath: 'inset(50%)', position: 'fixed', top: 0, left: 0 }
function Oe(e, t, n = {}) {
  const r = t.render,
    o = lw(t, n)
  if (n.enabled === !1) return null
  const s = n.state ?? Ke
  return uw(e, r, o, s)
}
function lw(e, t = {}) {
  const { className: n, style: r, render: o } = e,
    { state: s = Ke, ref: i, props: a, stateAttributesMapping: c, enabled: u = !0 } = t,
    f = u ? q1(n, s) : void 0,
    d = u ? X1(r, s) : void 0,
    g = u ? Y1(s, c) : Ke,
    h = u ? (Va(g, Array.isArray(a) ? J1(a) : a) ?? Ke) : Ke
  return (
    typeof document < 'u' &&
      (u
        ? Array.isArray(i)
          ? (h.ref = G1([h.ref, Mu(o), ...i]))
          : (h.ref = Vn(h.ref, Mu(o), i))
        : Vn(null, null)),
    u
      ? (f !== void 0 && (h.className = _p(h.className, f)),
        d !== void 0 && (h.style = Va(h.style, d)),
        h)
      : Ke
  )
}
const cw = Symbol.for('react.lazy')
function uw(e, t, n, r) {
  if (t) {
    if (typeof t == 'function') return t(n, r)
    const o = zo(n, t.props)
    o.ref = n.ref
    let s = t
    return (s?.$$typeof === cw && (s = l.Children.toArray(t)[0]), l.cloneElement(s, o))
  }
  if (e && typeof e == 'string') return dw(e, n)
  throw new Error(Ve(8))
}
function dw(e, t) {
  return e === 'button'
    ? l.createElement('button', { type: 'button', ...t, key: t.key })
    : e === 'img'
      ? l.createElement('img', { alt: '', ...t, key: t.key })
      : l.createElement(e, t)
}
const Et = 'none',
  dr = 'trigger-press',
  Ct = 'trigger-hover',
  Fr = 'trigger-focus',
  gi = 'outside-press',
  zl = 'item-press',
  jr = 'input-change',
  zn = 'input-clear',
  fw = 'input-press',
  fr = 'focus-out',
  Bo = 'escape-key',
  Io = 'list-navigation',
  Vp = 'cancel-open',
  Ps = 'sibling-open',
  pw = 'disabled',
  Ll = 'imperative-action'
function ge(e, t, n, r) {
  let o = !1,
    s = !1
  const i = Ke
  return {
    reason: e,
    event: t ?? new Event('base-ui'),
    cancel() {
      o = !0
    },
    allowPropagation() {
      s = !0
    },
    get isCanceled() {
      return o
    },
    get isPropagationAllowed() {
      return s
    },
    trigger: n,
    ...i,
  }
}
function mo(e, t, n) {
  const r = n ?? Ke
  return { reason: e, event: t ?? new Event('base-ui'), ...r }
}
const gw = { ...Fs }
let Au = 0
function mw(e, t = 'mui') {
  const [n, r] = l.useState(e),
    o = e || n
  return (
    l.useEffect(() => {
      n == null && ((Au += 1), r(`${t}-${Au}`))
    }, [n, t]),
    o
  )
}
const zu = gw.useId
function nn(e, t) {
  if (zu !== void 0) {
    const n = zu()
    return e ?? (t ? `${t}-${n}` : n)
  }
  return mw(e, t)
}
function Gn(e) {
  return nn(e, 'base-ui')
}
const hw = []
function mi(e) {
  l.useEffect(e, hw)
}
const cs = null
class bw {
  callbacks = []
  callbacksCount = 0
  nextId = 1
  startId = 1
  isScheduled = !1
  tick = (t) => {
    this.isScheduled = !1
    const n = this.callbacks,
      r = this.callbacksCount
    if (((this.callbacks = []), (this.callbacksCount = 0), (this.startId = this.nextId), r > 0))
      for (let o = 0; o < n.length; o += 1) n[o]?.(t)
  }
  request(t) {
    const n = this.nextId
    return (
      (this.nextId += 1),
      this.callbacks.push(t),
      (this.callbacksCount += 1),
      !this.isScheduled && (requestAnimationFrame(this.tick), (this.isScheduled = !0)),
      n
    )
  }
  cancel(t) {
    const n = t - this.startId
    n < 0 || n >= this.callbacks.length || ((this.callbacks[n] = null), (this.callbacksCount -= 1))
  }
}
const us = new bw()
class qt {
  static create() {
    return new qt()
  }
  static request(t) {
    return us.request(t)
  }
  static cancel(t) {
    return us.cancel(t)
  }
  currentId = cs
  request(t) {
    ;(this.cancel(),
      (this.currentId = us.request(() => {
        ;((this.currentId = cs), t())
      })))
  }
  cancel = () => {
    this.currentId !== cs && (us.cancel(this.currentId), (this.currentId = cs))
  }
  disposeEffect = () => this.cancel
}
function jl() {
  const e = ot(qt.create).current
  return (mi(e.disposeEffect), e)
}
function cn(e) {
  return e == null ? e : 'current' in e ? e.current : e
}
let Lo = (function (e) {
  return ((e.startingStyle = 'data-starting-style'), (e.endingStyle = 'data-ending-style'), e)
})({})
const vw = { [Lo.startingStyle]: '' },
  yw = { [Lo.endingStyle]: '' },
  Sr = {
    transitionStatus(e) {
      return e === 'starting' ? vw : e === 'ending' ? yw : null
    },
  }
function xw(e, t = !1, n = !0) {
  const r = jl()
  return ne((o, s = null) => {
    r.cancel()
    function i() {
      Mt.flushSync(o)
    }
    const a = cn(e)
    if (a == null) return
    const c = a
    if (typeof c.getAnimations != 'function' || globalThis.BASE_UI_ANIMATIONS_DISABLED) o()
    else {
      let u = function () {
          const d = Lo.startingStyle
          if (!c.hasAttribute(d)) {
            r.request(f)
            return
          }
          const g = new MutationObserver(() => {
            c.hasAttribute(d) || (g.disconnect(), f())
          })
          ;(g.observe(c, { attributes: !0, attributeFilter: [d] }),
            s?.addEventListener('abort', () => g.disconnect(), { once: !0 }))
        },
        f = function () {
          Promise.all(c.getAnimations().map((d) => d.finished))
            .then(() => {
              s?.aborted || i()
            })
            .catch(() => {
              const d = c.getAnimations()
              if (n) {
                if (s?.aborted) return
                i()
              } else d.length > 0 && d.some((g) => g.pending || g.playState !== 'finished') && f()
            })
        }
      if (t) {
        u()
        return
      }
      r.request(f)
    }
  })
}
function Dl(e, t = !1, n = !1) {
  const [r, o] = l.useState(e && t ? 'idle' : void 0),
    [s, i] = l.useState(e)
  return (
    e && !s && (i(!0), o('starting')),
    !e && s && r !== 'ending' && !n && o('ending'),
    !e && !s && r === 'ending' && o(void 0),
    ae(() => {
      if (!e && s && r !== 'ending' && n) {
        const a = qt.request(() => {
          o('ending')
        })
        return () => {
          qt.cancel(a)
        }
      }
    }, [e, s, r, n]),
    ae(() => {
      if (!e || t) return
      const a = qt.request(() => {
        o(void 0)
      })
      return () => {
        qt.cancel(a)
      }
    }, [t, e]),
    ae(() => {
      if (!e || !t) return
      e && s && r !== 'idle' && o('starting')
      const a = qt.request(() => {
        o('idle')
      })
      return () => {
        qt.cancel(a)
      }
    }, [t, e, s, o, r]),
    l.useMemo(() => ({ mounted: s, setMounted: i, transitionStatus: r }), [s, r])
  )
}
let Hp = (function (e) {
  return ((e[(e.None = 0)] = 'None'), (e[(e.GuessFromOrder = 1)] = 'GuessFromOrder'), e)
})({})
function hi(e = {}) {
  const { label: t, metadata: n, textRef: r, indexGuessBehavior: o, index: s } = e,
    {
      register: i,
      unregister: a,
      subscribeMapChange: c,
      elementsRef: u,
      labelsRef: f,
      nextIndexRef: d,
    } = $1(),
    g = l.useRef(-1),
    [h, m] = l.useState(
      s ??
        (o === Hp.GuessFromOrder
          ? () => {
              if (g.current === -1) {
                const y = d.current
                ;((d.current += 1), (g.current = y))
              }
              return g.current
            }
          : -1),
    ),
    p = l.useRef(null),
    b = l.useCallback(
      (y) => {
        if (((p.current = y), h !== -1 && y !== null && ((u.current[h] = y), f))) {
          const v = t !== void 0
          f.current[h] = v ? t : (r?.current?.textContent ?? y.textContent)
        }
      },
      [h, u, f, t, r],
    )
  return (
    ae(() => {
      if (s != null) return
      const y = p.current
      if (y)
        return (
          i(y, n),
          () => {
            a(y)
          }
        )
    }, [s, i, a, n]),
    ae(() => {
      if (s == null)
        return c((y) => {
          const v = p.current ? y.get(p.current)?.index : null
          v != null && m(v)
        })
    }, [s, c, m]),
    l.useMemo(() => ({ ref: b, index: h }), [h, b])
  )
}
function ww(e) {
  return e == null || e.hasAttribute('disabled') || e.getAttribute('aria-disabled') === 'true'
}
function bi() {
  return typeof window < 'u'
}
function Un(e) {
  return Nl(e) ? (e.nodeName || '').toLowerCase() : '#document'
}
function Ye(e) {
  var t
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window
}
function Sn(e) {
  var t
  return (t = (Nl(e) ? e.ownerDocument : e.document) || window.document) == null
    ? void 0
    : t.documentElement
}
function Nl(e) {
  return bi() ? e instanceof Node || e instanceof Ye(e).Node : !1
}
function je(e) {
  return bi() ? e instanceof Element || e instanceof Ye(e).Element : !1
}
function Ze(e) {
  return bi() ? e instanceof HTMLElement || e instanceof Ye(e).HTMLElement : !1
}
function Wa(e) {
  return !bi() || typeof ShadowRoot > 'u'
    ? !1
    : e instanceof ShadowRoot || e instanceof Ye(e).ShadowRoot
}
function Er(e) {
  const { overflow: t, overflowX: n, overflowY: r, display: o } = Nt(e)
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && o !== 'inline' && o !== 'contents'
}
function Cw(e) {
  return /^(table|td|th)$/.test(Un(e))
}
function vi(e) {
  try {
    if (e.matches(':popover-open')) return !0
  } catch {}
  try {
    return e.matches(':modal')
  } catch {
    return !1
  }
}
const Sw = /transform|translate|scale|rotate|perspective|filter/,
  Ew = /paint|layout|strict|content/,
  tr = (e) => !!e && e !== 'none'
let oa
function _l(e) {
  const t = je(e) ? Nt(e) : e
  return (
    tr(t.transform) ||
    tr(t.translate) ||
    tr(t.scale) ||
    tr(t.rotate) ||
    tr(t.perspective) ||
    (!yi() && (tr(t.backdropFilter) || tr(t.filter))) ||
    Sw.test(t.willChange || '') ||
    Ew.test(t.contain || '')
  )
}
function Rw(e) {
  let t = bn(e)
  for (; Ze(t) && !pn(t); ) {
    if (_l(t)) return t
    if (vi(t)) return null
    t = bn(t)
  }
  return null
}
function yi() {
  return (
    oa == null &&
      (oa = typeof CSS < 'u' && CSS.supports && CSS.supports('-webkit-backdrop-filter', 'none')),
    oa
  )
}
function pn(e) {
  return /^(html|body|#document)$/.test(Un(e))
}
function Nt(e) {
  return Ye(e).getComputedStyle(e)
}
function xi(e) {
  return je(e)
    ? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
    : { scrollLeft: e.scrollX, scrollTop: e.scrollY }
}
function bn(e) {
  if (Un(e) === 'html') return e
  const t = e.assignedSlot || e.parentNode || (Wa(e) && e.host) || Sn(e)
  return Wa(t) ? t.host : t
}
function Bp(e) {
  const t = bn(e)
  return pn(t) ? (e.ownerDocument || e).body : Ze(t) && Er(t) ? t : Bp(t)
}
function jn(e, t, n) {
  var r
  ;(t === void 0 && (t = []), n === void 0 && (n = !0))
  const o = Bp(e),
    s = o === ((r = e.ownerDocument) == null ? void 0 : r.body),
    i = Ye(o)
  if (s) {
    const a = Ga(i)
    return t.concat(i, i.visualViewport || [], Er(o) ? o : [], a && n ? jn(a) : [])
  } else return t.concat(o, jn(o, [], n))
}
function Ga(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null
}
const Wp = l.createContext(void 0)
function Fl(e = !1) {
  const t = l.useContext(Wp)
  if (t === void 0 && !e) throw new Error(Ve(16))
  return t
}
function kw(e) {
  const {
      focusableWhenDisabled: t,
      disabled: n,
      composite: r = !1,
      tabIndex: o = 0,
      isNativeButton: s,
    } = e,
    i = r && t !== !1,
    a = r && t === !1
  return {
    props: l.useMemo(() => {
      const u = {
        onKeyDown(f) {
          n && t && f.key !== 'Tab' && f.preventDefault()
        },
      }
      return (
        r || ((u.tabIndex = o), !s && n && (u.tabIndex = t ? o : -1)),
        ((s && (t || i)) || (!s && n)) && (u['aria-disabled'] = n),
        s && (!t || a) && (u.disabled = n),
        u
      )
    }, [r, n, t, i, a, s, o]),
  }
}
function Rr(e = {}) {
  const { disabled: t = !1, focusableWhenDisabled: n, tabIndex: r = 0, native: o = !0 } = e,
    s = l.useRef(null),
    i = Fl(!0) !== void 0,
    a = ne(() => {
      const g = s.current
      return !!(g?.tagName === 'A' && g?.href)
    }),
    { props: c } = kw({
      focusableWhenDisabled: n,
      disabled: t,
      composite: i,
      tabIndex: r,
      isNativeButton: o,
    }),
    u = l.useCallback(() => {
      const g = s.current
      Iw(g) && i && t && c.disabled === void 0 && g.disabled && (g.disabled = !1)
    }, [t, c.disabled, i])
  ae(u, [u])
  const f = l.useCallback(
      (g = {}) => {
        const { onClick: h, onMouseDown: m, onKeyUp: p, onKeyDown: b, onPointerDown: y, ...v } = g
        return zo(
          {
            type: o ? 'button' : void 0,
            onClick(w) {
              if (t) {
                w.preventDefault()
                return
              }
              h?.(w)
            },
            onMouseDown(w) {
              t || m?.(w)
            },
            onKeyDown(w) {
              if ((t || (Ba(w), b?.(w)), w.baseUIHandlerPrevented)) return
              const x = w.target === w.currentTarget && !o && !a() && !t,
                S = w.key === 'Enter',
                k = w.key === ' '
              x && ((k || S) && w.preventDefault(), S && h?.(w))
            },
            onKeyUp(w) {
              ;(t || (Ba(w), p?.(w)),
                !w.baseUIHandlerPrevented &&
                  w.target === w.currentTarget &&
                  !o &&
                  !t &&
                  w.key === ' ' &&
                  h?.(w))
            },
            onPointerDown(w) {
              if (t) {
                w.preventDefault()
                return
              }
              y?.(w)
            },
          },
          o ? void 0 : { role: 'button' },
          c,
          v,
        )
      },
      [t, c, o, a],
    ),
    d = ne((g) => {
      ;((s.current = g), u())
    })
  return { getButtonProps: f, buttonRef: d }
}
function Iw(e) {
  return Ze(e) && e.tagName === 'BUTTON'
}
const kr = typeof navigator < 'u',
  sa = Pw(),
  Gp = Mw(),
  $l = Ow(),
  Up = typeof CSS > 'u' || !CSS.supports ? !1 : CSS.supports('-webkit-backdrop-filter:none'),
  Zp =
    sa.platform === 'MacIntel' && sa.maxTouchPoints > 1
      ? !0
      : /iP(hone|ad|od)|iOS/.test(sa.platform),
  Lu = kr && /firefox/i.test($l),
  Kp = kr && /apple/i.test(navigator.vendor),
  Hs = (kr && /android/i.test(Gp)) || /android/i.test($l),
  Tw = kr && Gp.toLowerCase().startsWith('mac') && !navigator.maxTouchPoints,
  Yp = $l.includes('jsdom/')
function Pw() {
  if (!kr) return { platform: '', maxTouchPoints: -1 }
  const e = navigator.userAgentData
  return e?.platform
    ? { platform: e.platform, maxTouchPoints: navigator.maxTouchPoints }
    : { platform: navigator.platform ?? '', maxTouchPoints: navigator.maxTouchPoints ?? -1 }
}
function Ow() {
  if (!kr) return ''
  const e = navigator.userAgentData
  return e && Array.isArray(e.brands)
    ? e.brands.map(({ brand: t, version: n }) => `${t}/${n}`).join(' ')
    : navigator.userAgent
}
function Mw() {
  if (!kr) return ''
  const e = navigator.userAgentData
  return e?.platform ? e.platform : (navigator.platform ?? '')
}
const Ua = 'data-base-ui-focusable',
  qp = 'active',
  Xp = 'selected',
  Jp =
    "input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])",
  Dn = 'ArrowLeft',
  Nn = 'ArrowRight',
  Vl = 'ArrowUp',
  Wo = 'ArrowDown'
function St(e) {
  let t = e.activeElement
  for (; t?.shadowRoot?.activeElement != null; ) t = t.shadowRoot.activeElement
  return t
}
function be(e, t) {
  if (!e || !t) return !1
  const n = t.getRootNode?.()
  if (e.contains(t)) return !0
  if (n && Wa(n)) {
    let r = t
    for (; r; ) {
      if (e === r) return !0
      r = r.parentNode || r.host
    }
  }
  return !1
}
function Bs(e, t) {
  if (!je(e)) return !1
  const n = e
  if (t.hasElement(n)) return !n.hasAttribute('data-trigger-disabled')
  for (const [, r] of t.entries()) if (be(r, n)) return !r.hasAttribute('data-trigger-disabled')
  return !1
}
function Ge(e) {
  return 'composedPath' in e ? e.composedPath()[0] : e.target
}
function Gt(e, t) {
  if (t == null) return !1
  if ('composedPath' in e) return e.composedPath().includes(t)
  const n = e
  return n.target != null && t.contains(n.target)
}
function Aw(e) {
  return e.matches('html,body')
}
function wi(e) {
  return Ze(e) && e.matches(Jp)
}
function Za(e) {
  return e ? e.getAttribute('role') === 'combobox' && wi(e) : !1
}
function Ws(e) {
  if (!e || Yp) return !0
  try {
    return e.matches(':focus-visible')
  } catch {
    return !0
  }
}
function Gs(e) {
  return e ? (e.hasAttribute(Ua) ? e : e.querySelector(`[${Ua}]`) || e) : null
}
function lr(e, t, n = !0) {
  return e
    .filter((o) => o.parentId === t && (!n || o.context?.open))
    .flatMap((o) => [o, ...lr(e, o.id, n)])
}
function ju(e, t) {
  let n = [],
    r = e.find((o) => o.id === t)?.parentId
  for (; r; ) {
    const o = e.find((s) => s.id === r)
    ;((r = o?.parentId), o && (n = n.concat(o)))
  }
  return n
}
function Je(e) {
  ;(e.preventDefault(), e.stopPropagation())
}
function zw(e) {
  return 'nativeEvent' in e
}
function Qp(e) {
  return e.pointerType === '' && e.isTrusted
    ? !0
    : Hs && e.pointerType
      ? e.type === 'click' && e.buttons === 1
      : e.detail === 0 && !e.pointerType
}
function eg(e) {
  return Yp
    ? !1
    : (!Hs && e.width === 0 && e.height === 0) ||
        (Hs &&
          e.width === 1 &&
          e.height === 1 &&
          e.pressure === 0 &&
          e.detail === 0 &&
          e.pointerType === 'mouse') ||
        (e.width < 1 &&
          e.height < 1 &&
          e.pressure === 0 &&
          e.detail === 0 &&
          e.pointerType === 'touch')
}
function pr(e, t) {
  const n = ['mouse', 'pen']
  return (t || n.push('', void 0), n.includes(e))
}
function tg(e) {
  const t = e.type
  return t === 'click' || t === 'mousedown' || t === 'keydown' || t === 'keyup'
}
const Lw = ['top', 'right', 'bottom', 'left'],
  Yr = Math.min,
  gn = Math.max,
  Us = Math.round,
  Dr = Math.floor,
  mn = (e) => ({ x: e, y: e }),
  jw = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' }
function ng(e, t, n) {
  return gn(e, Yr(t, n))
}
function vn(e, t) {
  return typeof e == 'function' ? e(t) : e
}
function Pt(e) {
  return e.split('-')[0]
}
function Zn(e) {
  return e.split('-')[1]
}
function Hl(e) {
  return e === 'x' ? 'y' : 'x'
}
function Bl(e) {
  return e === 'y' ? 'height' : 'width'
}
function Lt(e) {
  const t = e[0]
  return t === 't' || t === 'b' ? 'y' : 'x'
}
function Wl(e) {
  return Hl(Lt(e))
}
function Dw(e, t, n) {
  n === void 0 && (n = !1)
  const r = Zn(e),
    o = Wl(e),
    s = Bl(o)
  let i =
    o === 'x' ? (r === (n ? 'end' : 'start') ? 'right' : 'left') : r === 'start' ? 'bottom' : 'top'
  return (t.reference[s] > t.floating[s] && (i = Zs(i)), [i, Zs(i)])
}
function Nw(e) {
  const t = Zs(e)
  return [Ka(e), t, Ka(t)]
}
function Ka(e) {
  return e.includes('start') ? e.replace('start', 'end') : e.replace('end', 'start')
}
const Du = ['left', 'right'],
  Nu = ['right', 'left'],
  _w = ['top', 'bottom'],
  Fw = ['bottom', 'top']
function $w(e, t, n) {
  switch (e) {
    case 'top':
    case 'bottom':
      return n ? (t ? Nu : Du) : t ? Du : Nu
    case 'left':
    case 'right':
      return t ? _w : Fw
    default:
      return []
  }
}
function Vw(e, t, n, r) {
  const o = Zn(e)
  let s = $w(Pt(e), n === 'start', r)
  return (o && ((s = s.map((i) => i + '-' + o)), t && (s = s.concat(s.map(Ka)))), s)
}
function Zs(e) {
  const t = Pt(e)
  return jw[t] + e.slice(t.length)
}
function Hw(e) {
  var t, n, r, o
  return {
    top: (t = e.top) != null ? t : 0,
    right: (n = e.right) != null ? n : 0,
    bottom: (r = e.bottom) != null ? r : 0,
    left: (o = e.left) != null ? o : 0,
  }
}
function rg(e) {
  return typeof e != 'number' ? Hw(e) : { top: e, right: e, bottom: e, left: e }
}
function Ks(e) {
  const { x: t, y: n, width: r, height: o } = e
  return { width: r, height: o, top: n, left: t, right: t + r, bottom: n + o, x: t, y: n }
}
function ds(e, t, n) {
  return Math.floor(e / t) !== n
}
function $r(e, t) {
  return t < 0 || t >= e.current.length
}
function Os(e, t) {
  return dt(e, { disabledIndices: t })
}
function Ya(e, t) {
  return dt(e, { decrement: !0, startingIndex: e.current.length, disabledIndices: t })
}
function dt(
  e,
  { startingIndex: t = -1, decrement: n = !1, disabledIndices: r, amount: o = 1 } = {},
) {
  let s = t
  do s += n ? -o : o
  while (s >= 0 && s <= e.current.length - 1 && _n(e, s, r))
  return s
}
function og(
  e,
  {
    event: t,
    orientation: n,
    loopFocus: r,
    rtl: o,
    cols: s,
    disabledIndices: i,
    minIndex: a,
    maxIndex: c,
    prevIndex: u,
    stopEvent: f = !1,
  },
) {
  let d = u
  const g = [],
    h = {}
  let m = !1
  {
    let y = null,
      v = -1
    e.current.forEach((C, w) => {
      if (C == null) return
      const x = C.closest('[role="row"]')
      ;(x && (m = !0),
        (x !== y || v === -1) && ((y = x), (v += 1), (g[v] = [])),
        g[v].push(w),
        (h[w] = v))
    })
  }
  const p = m && g.length > 0 && g.some((y) => y.length !== s)
  function b(y) {
    if (!p || u === -1) return
    const v = h[u]
    if (v == null) return
    const C = g[v].indexOf(u)
    let w = y === 'up' ? v - 1 : v + 1
    r && (w < 0 ? (w = g.length - 1) : w >= g.length && (w = 0))
    const x = new Set()
    for (; w >= 0 && w < g.length && !x.has(w); ) {
      x.add(w)
      const S = g[w]
      if (S.length === 0) {
        w = y === 'up' ? w - 1 : w + 1
        continue
      }
      const k = Math.min(C, S.length - 1)
      for (let R = k; R >= 0; R -= 1) {
        const M = S[R]
        if (!_n(e, M, i)) return M
      }
      ;((w = y === 'up' ? w - 1 : w + 1),
        r && (w < 0 ? (w = g.length - 1) : w >= g.length && (w = 0)))
    }
  }
  if (t.key === Vl) {
    const y = b('up')
    if (y !== void 0) (f && Je(t), (d = y))
    else {
      if ((f && Je(t), u === -1)) d = c
      else if (
        ((d = dt(e, { startingIndex: d, amount: s, decrement: !0, disabledIndices: i })),
        r && (u - s < a || d < 0))
      ) {
        const v = u % s,
          C = c % s,
          w = c - (C - v)
        C === v ? (d = c) : (d = C > v ? w : w - s)
      }
      $r(e, d) && (d = u)
    }
  }
  if (t.key === Wo) {
    const y = b('down')
    y !== void 0
      ? (f && Je(t), (d = y))
      : (f && Je(t),
        u === -1
          ? (d = a)
          : ((d = dt(e, { startingIndex: u, amount: s, disabledIndices: i })),
            r &&
              u + s > c &&
              (d = dt(e, { startingIndex: (u % s) - s, amount: s, disabledIndices: i }))),
        $r(e, d) && (d = u))
  }
  if (n === 'both') {
    const y = Dr(u / s)
    ;(t.key === (o ? Dn : Nn) &&
      (f && Je(t),
      u % s !== s - 1
        ? ((d = dt(e, { startingIndex: u, disabledIndices: i })),
          r && ds(d, s, y) && (d = dt(e, { startingIndex: u - (u % s) - 1, disabledIndices: i })))
        : r && (d = dt(e, { startingIndex: u - (u % s) - 1, disabledIndices: i })),
      ds(d, s, y) && (d = u)),
      t.key === (o ? Nn : Dn) &&
        (f && Je(t),
        u % s !== 0
          ? ((d = dt(e, { startingIndex: u, decrement: !0, disabledIndices: i })),
            r &&
              ds(d, s, y) &&
              (d = dt(e, { startingIndex: u + (s - (u % s)), decrement: !0, disabledIndices: i })))
          : r &&
            (d = dt(e, { startingIndex: u + (s - (u % s)), decrement: !0, disabledIndices: i })),
        ds(d, s, y) && (d = u)))
    const v = Dr(c / s) === y
    $r(e, d) &&
      (r && v
        ? (d =
            t.key === (o ? Nn : Dn)
              ? c
              : dt(e, { startingIndex: u - (u % s) - 1, disabledIndices: i }))
        : (d = u))
  }
  return d
}
function sg(e, t, n) {
  const r = []
  let o = 0
  return (
    e.forEach(({ width: s, height: i }, a) => {
      let c = !1
      for (n && (o = 0); !c; ) {
        const u = []
        for (let f = 0; f < s; f += 1) for (let d = 0; d < i; d += 1) u.push(o + f + d * t)
        ;(o % t) + s <= t && u.every((f) => r[f] == null)
          ? (u.forEach((f) => {
              r[f] = a
            }),
            (c = !0))
          : (o += 1)
      }
    }),
    [...r]
  )
}
function ig(e, t, n, r, o) {
  if (e === -1) return -1
  const s = n.indexOf(e),
    i = t[e]
  switch (o) {
    case 'tl':
      return s
    case 'tr':
      return i ? s + i.width - 1 : s
    case 'bl':
      return i ? s + (i.height - 1) * r : s
    case 'br':
      return n.lastIndexOf(e)
    default:
      return -1
  }
}
function ag(e, t) {
  return t.flatMap((n, r) => (e.includes(n) ? [r] : []))
}
function _n(e, t, n) {
  if (typeof n == 'function') return n(t)
  if (n) return n.includes(t)
  const r = e.current[t]
  return r ? r.hasAttribute('disabled') || r.getAttribute('aria-disabled') === 'true' : !1
}
var Bw = [
    'input:not([inert]):not([inert] *)',
    'select:not([inert]):not([inert] *)',
    'textarea:not([inert]):not([inert] *)',
    'a[href]:not([inert]):not([inert] *)',
    'area[href]:not([inert]):not([inert] *)',
    'button:not([inert]):not([inert] *)',
    '[tabindex]:not(slot):not([inert]):not([inert] *)',
    'audio[controls]:not([inert]):not([inert] *)',
    'video[controls]:not([inert]):not([inert] *)',
    '[contenteditable]:not([contenteditable="false"]):not([inert]):not([inert] *)',
    'details>summary:first-of-type:not([inert]):not([inert] *)',
    'details:not([inert]):not([inert] *)',
  ],
  Ys = Bw.join(','),
  lg = typeof Element > 'u',
  qr = lg
    ? function () {}
    : Element.prototype.matches ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector,
  qs =
    !lg && Element.prototype.getRootNode
      ? function (e) {
          var t
          return e == null || (t = e.getRootNode) === null || t === void 0 ? void 0 : t.call(e)
        }
      : function (e) {
          return e?.ownerDocument
        },
  Xs = function (t, n) {
    var r
    n === void 0 && (n = !0)
    var o =
        t == null || (r = t.getAttribute) === null || r === void 0 ? void 0 : r.call(t, 'inert'),
      s = o === '' || o === 'true',
      i =
        s || (n && t && (typeof t.closest == 'function' ? t.closest('[inert]') : Xs(t.parentNode)))
    return i
  },
  Ww = function (t) {
    var n,
      r =
        t == null || (n = t.getAttribute) === null || n === void 0
          ? void 0
          : n.call(t, 'contenteditable')
    return r === '' || r === 'true'
  },
  cg = function (t, n, r) {
    if (Xs(t)) return []
    var o = Array.prototype.slice.apply(t.querySelectorAll(Ys))
    return (n && qr.call(t, Ys) && o.unshift(t), (o = o.filter(r)), o)
  },
  Js = function (t, n, r) {
    for (var o = [], s = Array.from(t); s.length; ) {
      var i = s.shift()
      if (!Xs(i, !1))
        if (i.tagName === 'SLOT') {
          var a = i.assignedElements(),
            c = a.length ? a : i.children,
            u = Js(c, !0, r)
          r.flatten ? o.push.apply(o, u) : o.push({ scopeParent: i, candidates: u })
        } else {
          var f = qr.call(i, Ys)
          f && r.filter(i) && (n || !t.includes(i)) && o.push(i)
          var d = i.shadowRoot || (typeof r.getShadowRoot == 'function' && r.getShadowRoot(i)),
            g = !Xs(d, !1) && (!r.shadowRootFilter || r.shadowRootFilter(i))
          if (d && g) {
            var h = Js(d === !0 ? i.children : d.children, !0, r)
            r.flatten ? o.push.apply(o, h) : o.push({ scopeParent: i, candidates: h })
          } else s.unshift.apply(s, i.children)
        }
    }
    return o
  },
  ug = function (t) {
    return !isNaN(parseInt(t.getAttribute('tabindex'), 10))
  },
  dg = function (t) {
    if (!t) throw new Error('No node provided')
    return t.tabIndex < 0 && (/^(AUDIO|VIDEO|DETAILS)$/.test(t.tagName) || Ww(t)) && !ug(t)
      ? 0
      : t.tabIndex
  },
  Gw = function (t, n) {
    var r = dg(t)
    return r < 0 && n && !ug(t) ? 0 : r
  },
  Uw = function (t, n) {
    return t.tabIndex === n.tabIndex ? t.documentOrder - n.documentOrder : t.tabIndex - n.tabIndex
  },
  fg = function (t) {
    return t.tagName === 'INPUT'
  },
  Zw = function (t) {
    return fg(t) && t.type === 'hidden'
  },
  Kw = function (t) {
    var n =
      t.tagName === 'DETAILS' &&
      Array.prototype.slice.apply(t.children).some(function (r) {
        return r.tagName === 'SUMMARY'
      })
    return n
  },
  Yw = function (t, n) {
    for (var r = 0; r < t.length; r++) if (t[r].checked && t[r].form === n) return t[r]
  },
  qw = function (t) {
    if (!t.name) return !0
    var n = t.form || qs(t),
      r = function (a) {
        return n.querySelectorAll('input[type="radio"][name="' + a + '"]')
      },
      o
    if (typeof window < 'u' && typeof window.CSS < 'u' && typeof window.CSS.escape == 'function')
      o = r(window.CSS.escape(t.name))
    else
      try {
        o = r(t.name)
      } catch (i) {
        return (
          console.error(
            'Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s',
            i.message,
          ),
          !1
        )
      }
    var s = Yw(o, t.form)
    return !s || s === t
  },
  Xw = function (t) {
    return fg(t) && t.type === 'radio'
  },
  Jw = function (t) {
    return Xw(t) && !qw(t)
  },
  Qw = function (t) {
    var n,
      r = t && qs(t),
      o = (n = r) === null || n === void 0 ? void 0 : n.host,
      s = !1
    if (r && r !== t) {
      var i, a, c
      for (
        s = !!(
          ((i = o) !== null &&
            i !== void 0 &&
            (a = i.ownerDocument) !== null &&
            a !== void 0 &&
            a.contains(o)) ||
          (t != null && (c = t.ownerDocument) !== null && c !== void 0 && c.contains(t))
        );
        !s && o;

      ) {
        var u, f, d
        ;((r = qs(o)),
          (o = (u = r) === null || u === void 0 ? void 0 : u.host),
          (s = !!(
            (f = o) !== null &&
            f !== void 0 &&
            (d = f.ownerDocument) !== null &&
            d !== void 0 &&
            d.contains(o)
          )))
      }
    }
    return s
  },
  _u = function (t) {
    var n = t.getBoundingClientRect(),
      r = n.width,
      o = n.height
    return r === 0 && o === 0
  },
  eC = function (t, n) {
    var r = n.displayCheck,
      o = n.getShadowRoot
    if (r === 'full-native' && 'checkVisibility' in t) {
      var s = t.checkVisibility({
        checkOpacity: !1,
        opacityProperty: !1,
        contentVisibilityAuto: !0,
        visibilityProperty: !0,
        checkVisibilityCSS: !0,
      })
      return !s
    }
    var i = getComputedStyle(t),
      a = i.visibility
    if (a === 'hidden' || a === 'collapse') return !0
    var c = qr.call(t, 'details>summary:first-of-type'),
      u = c ? t.parentElement : t
    if (qr.call(u, 'details:not([open]) *')) return !0
    if (!r || r === 'full' || r === 'full-native' || r === 'legacy-full') {
      if (typeof o == 'function') {
        for (var f = t; t; ) {
          var d = t.parentElement,
            g = qs(t)
          if (d && !d.shadowRoot && o(d) === !0) return _u(t)
          t.assignedSlot
            ? (t = t.assignedSlot)
            : !d && g !== t.ownerDocument
              ? (t = g.host)
              : (t = d)
        }
        t = f
      }
      if (Qw(t)) return !t.getClientRects().length
      if (r !== 'legacy-full') return !0
    } else if (r === 'non-zero-area') return _u(t)
    return !1
  },
  tC = function (t) {
    if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(t.tagName))
      for (var n = t.parentElement; n; ) {
        if (n.tagName === 'FIELDSET' && n.disabled) {
          for (var r = 0; r < n.children.length; r++) {
            var o = n.children.item(r)
            if (o.tagName === 'LEGEND')
              return qr.call(n, 'fieldset[disabled] *') ? !0 : !o.contains(t)
          }
          return !0
        }
        n = n.parentElement
      }
    return !1
  },
  qa = function (t, n) {
    return !(n.disabled || Zw(n) || eC(n, t) || Kw(n) || tC(n))
  },
  Xa = function (t, n) {
    return !(Jw(n) || dg(n) < 0 || !qa(t, n))
  },
  nC = function (t) {
    var n = parseInt(t.getAttribute('tabindex'), 10)
    return !!(isNaN(n) || n >= 0)
  },
  pg = function (t) {
    var n = [],
      r = []
    return (
      t.forEach(function (o, s) {
        var i = !!o.scopeParent,
          a = i ? o.scopeParent : o,
          c = Gw(a, i),
          u = i ? pg(o.candidates) : a
        c === 0
          ? i
            ? n.push.apply(n, u)
            : n.push(a)
          : r.push({ documentOrder: s, tabIndex: c, item: o, isScope: i, content: u })
      }),
      r
        .sort(Uw)
        .reduce(function (o, s) {
          return (s.isScope ? o.push.apply(o, s.content) : o.push(s.content), o)
        }, [])
        .concat(n)
    )
  },
  Go = function (t, n) {
    n = n || {}
    var r
    return (
      n.getShadowRoot
        ? (r = Js([t], n.includeContainer, {
            filter: Xa.bind(null, n),
            flatten: !1,
            getShadowRoot: n.getShadowRoot,
            shadowRootFilter: nC,
          }))
        : (r = cg(t, n.includeContainer, Xa.bind(null, n))),
      pg(r)
    )
  },
  rC = function (t, n) {
    n = n || {}
    var r
    return (
      n.getShadowRoot
        ? (r = Js([t], n.includeContainer, {
            filter: qa.bind(null, n),
            flatten: !0,
            getShadowRoot: n.getShadowRoot,
          }))
        : (r = cg(t, n.includeContainer, qa.bind(null, n))),
      r
    )
  },
  gg = function (t, n) {
    if (((n = n || {}), !t)) throw new Error('No node provided')
    return qr.call(t, Ys) === !1 ? !1 : Xa(n, t)
  }
function ke(e) {
  return e?.ownerDocument || document
}
const ro = () => ({
  getShadowRoot: !0,
  displayCheck:
    typeof ResizeObserver == 'function' && ResizeObserver.toString().includes('[native code]')
      ? 'full'
      : 'none',
})
function mg(e, t) {
  const n = Go(e, ro()),
    r = n.length
  if (r === 0) return
  const o = St(ke(e)),
    s = n.indexOf(o),
    i = s === -1 ? (t === 1 ? 0 : r - 1) : s + t
  return n[i]
}
function Gl(e) {
  return mg(ke(e).body, 1) || e
}
function hg(e) {
  return mg(ke(e).body, -1) || e
}
function bg(e, t) {
  if (!e) return null
  const n = Go(ke(e).body, ro()),
    r = n.length
  if (r === 0) return null
  const o = n.indexOf(e)
  if (o === -1) return null
  const s = (o + t + r) % r
  return n[s]
}
function oC(e) {
  return bg(e, 1)
}
function sC(e) {
  return bg(e, -1)
}
function Vr(e, t) {
  const n = t || e.currentTarget,
    r = e.relatedTarget
  return !r || !be(n, r)
}
function iC(e) {
  Go(e, ro()).forEach((n) => {
    ;((n.dataset.tabindex = n.getAttribute('tabindex') || ''), n.setAttribute('tabindex', '-1'))
  })
}
function Fu(e) {
  e.querySelectorAll('[data-tabindex]').forEach((n) => {
    const r = n.dataset.tabindex
    ;(delete n.dataset.tabindex, r ? n.setAttribute('tabindex', r) : n.removeAttribute('tabindex'))
  })
}
const Hr = 'ArrowUp',
  ir = 'ArrowDown',
  jo = 'ArrowLeft',
  Br = 'ArrowRight',
  Uo = 'Home',
  Zo = 'End',
  vg = new Set([jo, Br]),
  aC = new Set([jo, Br, Uo, Zo]),
  yg = new Set([Hr, ir]),
  lC = new Set([Hr, ir, Uo, Zo]),
  xg = new Set([...vg, ...yg]),
  cC = new Set([...xg, Uo, Zo]),
  wg = new Set([Hr, ir, jo, Br, Uo, Zo]),
  uC = 'Shift',
  dC = 'Control',
  fC = 'Alt',
  pC = 'Meta',
  gC = new Set([uC, dC, fC, pC])
function mC(e) {
  return Ze(e) && e.tagName === 'INPUT'
}
function $u(e) {
  return !!((mC(e) && e.selectionStart != null) || (Ze(e) && e.tagName === 'TEXTAREA'))
}
function Vu(e, t, n, r) {
  if (!e || !t || !t.scrollTo) return
  let o = e.scrollLeft,
    s = e.scrollTop
  const i = e.clientWidth < e.scrollWidth,
    a = e.clientHeight < e.scrollHeight
  if (i && r !== 'vertical') {
    const c = Hu(e, t, 'left'),
      u = fs(e),
      f = fs(t)
    ;(n === 'ltr' &&
      (c + t.offsetWidth + f.scrollMarginRight > e.scrollLeft + e.clientWidth - u.scrollPaddingRight
        ? (o = c + t.offsetWidth + f.scrollMarginRight - e.clientWidth + u.scrollPaddingRight)
        : c - f.scrollMarginLeft < e.scrollLeft + u.scrollPaddingLeft &&
          (o = c - f.scrollMarginLeft - u.scrollPaddingLeft)),
      n === 'rtl' &&
        (c - f.scrollMarginRight < e.scrollLeft + u.scrollPaddingLeft
          ? (o = c - f.scrollMarginLeft - u.scrollPaddingLeft)
          : c + t.offsetWidth + f.scrollMarginRight >
              e.scrollLeft + e.clientWidth - u.scrollPaddingRight &&
            (o = c + t.offsetWidth + f.scrollMarginRight - e.clientWidth + u.scrollPaddingRight)))
  }
  if (a && r !== 'horizontal') {
    const c = Hu(e, t, 'top'),
      u = fs(e),
      f = fs(t)
    c - f.scrollMarginTop < e.scrollTop + u.scrollPaddingTop
      ? (s = c - f.scrollMarginTop - u.scrollPaddingTop)
      : c + t.offsetHeight + f.scrollMarginBottom >
          e.scrollTop + e.clientHeight - u.scrollPaddingBottom &&
        (s = c + t.offsetHeight + f.scrollMarginBottom - e.clientHeight + u.scrollPaddingBottom)
  }
  e.scrollTo({ left: o, top: s, behavior: 'auto' })
}
function Hu(e, t, n) {
  const r = n === 'left' ? 'offsetLeft' : 'offsetTop'
  let o = 0
  for (; t.offsetParent && ((o += t[r]), t.offsetParent !== e); ) t = t.offsetParent
  return o
}
function fs(e) {
  const t = getComputedStyle(e)
  return {
    scrollMarginTop: parseFloat(t.scrollMarginTop) || 0,
    scrollMarginRight: parseFloat(t.scrollMarginRight) || 0,
    scrollMarginBottom: parseFloat(t.scrollMarginBottom) || 0,
    scrollMarginLeft: parseFloat(t.scrollMarginLeft) || 0,
    scrollPaddingTop: parseFloat(t.scrollPaddingTop) || 0,
    scrollPaddingRight: parseFloat(t.scrollPaddingRight) || 0,
    scrollPaddingBottom: parseFloat(t.scrollPaddingBottom) || 0,
    scrollPaddingLeft: parseFloat(t.scrollPaddingLeft) || 0,
  }
}
function Kn(e) {
  const { enabled: t = !0, open: n, ref: r, onComplete: o } = e,
    s = ne(o),
    i = xw(r, n, !1)
  l.useEffect(() => {
    if (!t) return
    const a = new AbortController()
    return (
      i(s, a.signal),
      () => {
        a.abort()
      }
    )
  }, [t, n, s, i])
}
const ho = 0
class _t {
  static create() {
    return new _t()
  }
  currentId = ho
  start(t, n) {
    ;(this.clear(),
      (this.currentId = setTimeout(() => {
        ;((this.currentId = ho), n())
      }, t)))
  }
  isStarted() {
    return this.currentId !== ho
  }
  clear = () => {
    this.currentId !== ho && (clearTimeout(this.currentId), (this.currentId = ho))
  }
  disposeEffect = () => this.clear
}
function bt() {
  const e = ot(_t.create).current
  return (mi(e.disposeEffect), e)
}
let Bu = {},
  Wu = {},
  Gu = ''
function hC(e) {
  if (typeof document > 'u') return !1
  const t = ke(e)
  return Ye(t).innerWidth - t.documentElement.clientWidth > 0
}
function bC(e) {
  if (
    !(typeof CSS < 'u' && CSS.supports && CSS.supports('scrollbar-gutter', 'stable')) ||
    typeof document > 'u'
  )
    return !1
  const n = ke(e),
    r = n.documentElement,
    o = n.body,
    s = Er(r) ? r : o,
    i = s.style.overflowY,
    a = r.style.scrollbarGutter
  ;((r.style.scrollbarGutter = 'stable'), (s.style.overflowY = 'scroll'))
  const c = s.offsetWidth
  s.style.overflowY = 'hidden'
  const u = s.offsetWidth
  return ((s.style.overflowY = i), (r.style.scrollbarGutter = a), c === u)
}
function vC(e) {
  const t = ke(e),
    n = t.documentElement,
    r = t.body,
    o = Er(n) ? n : r,
    s = { overflowY: o.style.overflowY, overflowX: o.style.overflowX }
  return (
    Object.assign(o.style, { overflowY: 'hidden', overflowX: 'hidden' }),
    () => {
      Object.assign(o.style, s)
    }
  )
}
function yC(e) {
  const t = ke(e),
    n = t.documentElement,
    r = t.body,
    o = Ye(n)
  let s = 0,
    i = 0,
    a = !1
  const c = qt.create()
  if (Up && (o.visualViewport?.scale ?? 1) !== 1) return () => {}
  function u() {
    const g = o.getComputedStyle(n),
      h = o.getComputedStyle(r),
      b = (g.scrollbarGutter || '').includes('both-edges') ? 'stable both-edges' : 'stable'
    ;((s = n.scrollTop),
      (i = n.scrollLeft),
      (Bu = {
        scrollbarGutter: n.style.scrollbarGutter,
        overflowY: n.style.overflowY,
        overflowX: n.style.overflowX,
      }),
      (Gu = n.style.scrollBehavior),
      (Wu = {
        position: r.style.position,
        height: r.style.height,
        width: r.style.width,
        boxSizing: r.style.boxSizing,
        overflowY: r.style.overflowY,
        overflowX: r.style.overflowX,
        scrollBehavior: r.style.scrollBehavior,
      }))
    const y = n.scrollHeight > n.clientHeight,
      v = n.scrollWidth > n.clientWidth,
      C = g.overflowY === 'scroll' || h.overflowY === 'scroll',
      w = g.overflowX === 'scroll' || h.overflowX === 'scroll',
      x = Math.max(0, o.innerWidth - r.clientWidth),
      S = Math.max(0, o.innerHeight - r.clientHeight),
      k = parseFloat(h.marginTop) + parseFloat(h.marginBottom),
      R = parseFloat(h.marginLeft) + parseFloat(h.marginRight),
      M = Er(n) ? n : r
    if (((a = bC(e)), a)) {
      ;((n.style.scrollbarGutter = b),
        (M.style.overflowY = 'hidden'),
        (M.style.overflowX = 'hidden'))
      return
    }
    ;(Object.assign(n.style, { scrollbarGutter: b, overflowY: 'hidden', overflowX: 'hidden' }),
      (y || C) && (n.style.overflowY = 'scroll'),
      (v || w) && (n.style.overflowX = 'scroll'),
      Object.assign(r.style, {
        position: 'relative',
        height: k || S ? `calc(100dvh - ${k + S}px)` : '100dvh',
        width: R || x ? `calc(100vw - ${R + x}px)` : '100vw',
        boxSizing: 'border-box',
        overflow: 'hidden',
        scrollBehavior: 'unset',
      }),
      (r.scrollTop = s),
      (r.scrollLeft = i),
      n.setAttribute('data-base-ui-scroll-locked', ''),
      (n.style.scrollBehavior = 'unset'))
  }
  function f() {
    ;(Object.assign(n.style, Bu),
      Object.assign(r.style, Wu),
      a ||
        ((n.scrollTop = s),
        (n.scrollLeft = i),
        n.removeAttribute('data-base-ui-scroll-locked'),
        (n.style.scrollBehavior = Gu)))
  }
  function d() {
    ;(f(), c.request(u))
  }
  return (
    u(),
    o.addEventListener('resize', d),
    () => {
      ;(c.cancel(),
        f(),
        typeof o.removeEventListener == 'function' && o.removeEventListener('resize', d))
    }
  )
}
class xC {
  lockCount = 0
  restore = null
  timeoutLock = _t.create()
  timeoutUnlock = _t.create()
  acquire(t) {
    return (
      (this.lockCount += 1),
      this.lockCount === 1 &&
        this.restore === null &&
        this.timeoutLock.start(0, () => this.lock(t)),
      this.release
    )
  }
  release = () => {
    ;((this.lockCount -= 1),
      this.lockCount === 0 && this.restore && this.timeoutUnlock.start(0, this.unlock))
  }
  unlock = () => {
    this.lockCount === 0 && this.restore && (this.restore?.(), (this.restore = null))
  }
  lock(t) {
    if (this.lockCount === 0 || this.restore !== null) return
    const r = ke(t).documentElement,
      o = Ye(r).getComputedStyle(r).overflowY
    if (o === 'hidden' || o === 'clip') {
      this.restore = Ue
      return
    }
    const s = Zp || !hC(t)
    this.restore = s ? vC(t) : yC(t)
  }
}
const wC = new xC()
function Ul(e = !0, t = null) {
  ae(() => {
    if (e) return wC.acquire(t)
  }, [e, t])
}
function ht(e) {
  const t = ot(CC, e).current
  return ((t.next = e), ae(t.effect), t)
}
function CC(e) {
  const t = {
    current: e,
    next: e,
    effect: () => {
      t.current = t.next
    },
  }
  return t
}
function Cg() {
  const e = new Map()
  return {
    emit(t, n) {
      e.get(t)?.forEach((r) => r(n))
    },
    on(t, n) {
      ;(e.has(t) || e.set(t, new Set()), e.get(t).add(n))
    },
    off(t, n) {
      e.get(t)?.delete(n)
    },
  }
}
class Zl {
  nodesRef = { current: [] }
  events = Cg()
  addNode(t) {
    this.nodesRef.current.push(t)
  }
  removeNode(t) {
    const n = this.nodesRef.current.findIndex((r) => r === t)
    n !== -1 && this.nodesRef.current.splice(n, 1)
  }
}
const Sg = l.createContext(null),
  Eg = l.createContext(null),
  En = () => l.useContext(Sg)?.id || null,
  Yn = (e) => {
    const t = l.useContext(Eg)
    return e ?? t
  }
function Rg(e) {
  const t = nn(),
    n = Yn(e),
    r = En()
  return (
    ae(() => {
      if (!t) return
      const o = { id: t, parentId: r }
      return (
        n?.addNode(o),
        () => {
          n?.removeNode(o)
        }
      )
    }, [n, t, r]),
    t
  )
}
function SC(e) {
  const { children: t, id: n } = e,
    r = En()
  return E.jsx(Sg.Provider, {
    value: l.useMemo(() => ({ id: n, parentId: r }), [n, r]),
    children: t,
  })
}
function EC(e) {
  const { children: t, externalTree: n } = e,
    r = ot(() => n ?? new Zl()).current
  return E.jsx(Eg.Provider, { value: r, children: t })
}
function Xr(e) {
  return `data-base-ui-${e}`
}
function Ms(e, t, n) {
  if (n && !pr(n)) return 0
  if (typeof e == 'number') return e
  if (typeof e == 'function') {
    const r = e()
    return typeof r == 'number' ? r : r?.[t]
  }
  return e?.[t]
}
const kg = l.createContext({
  hasProvider: !1,
  timeoutMs: 0,
  delayRef: { current: 0 },
  initialDelayRef: { current: 0 },
  timeout: new _t(),
  currentIdRef: { current: null },
  currentContextRef: { current: null },
})
function RC(e) {
  const { children: t, delay: n, timeoutMs: r = 0 } = e,
    o = l.useRef(n),
    s = l.useRef(n),
    i = l.useRef(null),
    a = l.useRef(null),
    c = bt()
  return E.jsx(kg.Provider, {
    value: l.useMemo(
      () => ({
        hasProvider: !0,
        delayRef: o,
        initialDelayRef: s,
        currentIdRef: i,
        timeoutMs: r,
        currentContextRef: a,
        timeout: c,
      }),
      [r, c],
    ),
    children: t,
  })
}
function kC(e, t = { open: !1 }) {
  const n = 'rootStore' in e ? e.rootStore : e,
    r = n.useState('floatingId'),
    { open: o } = t,
    s = l.useContext(kg),
    {
      currentIdRef: i,
      delayRef: a,
      timeoutMs: c,
      initialDelayRef: u,
      currentContextRef: f,
      hasProvider: d,
      timeout: g,
    } = s,
    [h, m] = l.useState(!1)
  return (
    ae(() => {
      function p() {
        ;(m(!1),
          f.current?.setIsInstantPhase(!1),
          (i.current = null),
          (f.current = null),
          (a.current = u.current))
      }
      if (i.current && !o && i.current === r) {
        if ((m(!1), c)) {
          const b = r
          return (
            g.start(c, () => {
              n.select('open') || (i.current && i.current !== b) || p()
            }),
            () => {
              g.clear()
            }
          )
        }
        p()
      }
    }, [o, r, i, a, c, u, f, g, n]),
    ae(() => {
      if (!o) return
      const p = f.current,
        b = i.current
      ;(g.clear(),
        (f.current = { onOpenChange: n.setOpen, setIsInstantPhase: m }),
        (i.current = r),
        (a.current = { open: 0, close: Ms(u.current, 'close') }),
        b !== null && b !== r
          ? (m(!0), p?.setIsInstantPhase(!0), p?.onOpenChange(!1, ge(Et)))
          : (m(!1), p?.setIsInstantPhase(!1)))
    }, [o, r, n, i, a, c, u, f, g]),
    ae(
      () => () => {
        f.current = null
      },
      [f],
    ),
    l.useMemo(() => ({ hasProvider: d, delayRef: a, isInstantPhase: h }), [d, a, h])
  )
}
const Ig = {
    clipPath: 'inset(50%)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    border: 0,
    padding: 0,
    width: 1,
    height: 1,
    margin: -1,
  },
  Ci = { ...Ig, position: 'fixed', top: 0, left: 0 },
  IC = { ...Ig, position: 'absolute' },
  hn = l.forwardRef(function (t, n) {
    const [r, o] = l.useState()
    ae(() => {
      Kp && o('button')
    }, [])
    const s = { tabIndex: 0, role: r }
    return E.jsx('span', {
      ...t,
      ref: n,
      style: Ci,
      'aria-hidden': r ? void 0 : !0,
      ...s,
      'data-base-ui-focus-guard': '',
    })
  })
let Uu = 0
function To(e, t = {}) {
  const { preventScroll: n = !1, cancelPrevious: r = !0, sync: o = !1 } = t
  r && cancelAnimationFrame(Uu)
  const s = () => e?.focus({ preventScroll: n })
  o ? s() : (Uu = requestAnimationFrame(s))
}
const Wr = { inert: new WeakMap(), 'aria-hidden': new WeakMap(), none: new WeakMap() }
function Zu(e) {
  return e === 'inert' ? Wr.inert : e === 'aria-hidden' ? Wr['aria-hidden'] : Wr.none
}
let ps = new WeakSet(),
  gs = {},
  ia = 0
const Tg = (e) => e && (e.host || Tg(e.parentNode)),
  TC = (e, t) =>
    t
      .map((n) => {
        if (e.contains(n)) return n
        const r = Tg(n)
        return e.contains(r) ? r : null
      })
      .filter((n) => n != null)
function PC(e, t, n, r) {
  const o = 'data-base-ui-inert',
    s = r ? 'inert' : n ? 'aria-hidden' : null,
    i = TC(t, e),
    a = new Set(),
    c = new Set(i),
    u = []
  gs[o] || (gs[o] = new WeakMap())
  const f = gs[o]
  ;(i.forEach(d), g(t), a.clear())
  function d(h) {
    !h || a.has(h) || (a.add(h), h.parentNode && d(h.parentNode))
  }
  function g(h) {
    !h ||
      c.has(h) ||
      [].forEach.call(h.children, (m) => {
        if (Un(m) !== 'script')
          if (a.has(m)) g(m)
          else {
            const p = s ? m.getAttribute(s) : null,
              b = p !== null && p !== 'false',
              y = Zu(s),
              v = (y.get(m) || 0) + 1,
              C = (f.get(m) || 0) + 1
            ;(y.set(m, v),
              f.set(m, C),
              u.push(m),
              v === 1 && b && ps.add(m),
              C === 1 && m.setAttribute(o, ''),
              !b && s && m.setAttribute(s, s === 'inert' ? '' : 'true'))
          }
      })
  }
  return (
    (ia += 1),
    () => {
      ;(u.forEach((h) => {
        const m = Zu(s),
          b = (m.get(h) || 0) - 1,
          y = (f.get(h) || 0) - 1
        ;(m.set(h, b),
          f.set(h, y),
          b || (!ps.has(h) && s && h.removeAttribute(s), ps.delete(h)),
          y || h.removeAttribute(o))
      }),
        (ia -= 1),
        ia ||
          ((Wr.inert = new WeakMap()),
          (Wr['aria-hidden'] = new WeakMap()),
          (Wr.none = new WeakMap()),
          (ps = new WeakSet()),
          (gs = {})))
    }
  )
}
function OC(e, t = !1, n = !1) {
  const r = ke(e[0]).body
  return PC(e.concat(Array.from(r.querySelectorAll('[aria-live]'))), r, t, n)
}
const Pg = l.createContext(null),
  Og = () => l.useContext(Pg),
  MC = Xr('portal')
function Mg(e = {}) {
  const { ref: t, container: n, componentProps: r = Ke, elementProps: o } = e,
    s = nn(),
    a = Og()?.portalNode,
    [c, u] = l.useState(null),
    [f, d] = l.useState(null),
    g = ne((b) => {
      b !== null && d(b)
    }),
    h = l.useRef(null)
  ae(() => {
    if (n === null) {
      h.current && ((h.current = null), d(null), u(null))
      return
    }
    if (s == null) return
    const b = (n && (Nl(n) ? n : n.current)) ?? a ?? document.body
    if (b == null) {
      h.current && ((h.current = null), d(null), u(null))
      return
    }
    h.current !== b && ((h.current = b), d(null), u(b))
  }, [n, a, s])
  const m = Oe('div', r, { ref: [t, g], props: [{ id: s, [MC]: '' }, o] })
  return { portalNode: f, portalSubtree: c && m ? Mt.createPortal(m, c) : null }
}
const Kl = l.forwardRef(function (t, n) {
  const { children: r, container: o, className: s, render: i, renderGuards: a, ...c } = t,
    { portalNode: u, portalSubtree: f } = Mg({
      container: o,
      ref: n,
      componentProps: t,
      elementProps: c,
    }),
    d = l.useRef(null),
    g = l.useRef(null),
    h = l.useRef(null),
    m = l.useRef(null),
    [p, b] = l.useState(null),
    y = p?.modal,
    v = p?.open,
    C = typeof a == 'boolean' ? a : !!p && !p.modal && p.open && !!u
  ;(l.useEffect(() => {
    if (!u || y) return
    function x(S) {
      u && S.relatedTarget && Vr(S) && (S.type === 'focusin' ? Fu : iC)(u)
    }
    return (
      u.addEventListener('focusin', x, !0),
      u.addEventListener('focusout', x, !0),
      () => {
        ;(u.removeEventListener('focusin', x, !0), u.removeEventListener('focusout', x, !0))
      }
    )
  }, [u, y]),
    l.useEffect(() => {
      !u || v || Fu(u)
    }, [v, u]))
  const w = l.useMemo(
    () => ({
      beforeOutsideRef: d,
      afterOutsideRef: g,
      beforeInsideRef: h,
      afterInsideRef: m,
      portalNode: u,
      setFocusManagerState: b,
    }),
    [u],
  )
  return E.jsxs(l.Fragment, {
    children: [
      f,
      E.jsxs(Pg.Provider, {
        value: w,
        children: [
          C &&
            u &&
            E.jsx(hn, {
              'data-type': 'outside',
              ref: d,
              onFocus: (x) => {
                if (Vr(x, u)) h.current?.focus()
                else {
                  const S = p ? p.domReference : null
                  hg(S)?.focus()
                }
              },
            }),
          C && u && E.jsx('span', { 'aria-owns': u.id, style: aw }),
          u && Mt.createPortal(r, u),
          C &&
            u &&
            E.jsx(hn, {
              'data-type': 'outside',
              ref: g,
              onFocus: (x) => {
                if (Vr(x, u)) m.current?.focus()
                else {
                  const S = p ? p.domReference : null
                  ;(Gl(S)?.focus(),
                    p?.closeOnFocusOut && p?.onOpenChange(!1, ge(fr, x.nativeEvent)))
                }
              },
            }),
        ],
      }),
    ],
  })
})
function AC(e, t) {
  const n = Ye(e.target)
  return e instanceof n.KeyboardEvent
    ? 'keyboard'
    : e instanceof n.FocusEvent
      ? t || 'keyboard'
      : 'pointerType' in e
        ? e.pointerType || 'keyboard'
        : 'touches' in e
          ? 'touch'
          : e instanceof n.MouseEvent
            ? t || (e.detail === 0 ? 'keyboard' : 'mouse')
            : ''
}
const Ku = 20
let Ln = []
function Yl() {
  Ln = Ln.filter((e) => e.deref()?.isConnected)
}
function zC(e) {
  ;(Yl(),
    e && Un(e) !== 'body' && (Ln.push(new WeakRef(e)), Ln.length > Ku && (Ln = Ln.slice(-Ku))))
}
function aa() {
  return (Yl(), Ln[Ln.length - 1]?.deref())
}
function LC(e) {
  if (!e) return null
  const t = ro()
  return gg(e, t) ? e : Go(e, t)[0] || e
}
function jC(e) {
  return !e || !e.isConnected
    ? !1
    : typeof e.checkVisibility == 'function'
      ? e.checkVisibility()
      : Nt(e).display !== 'none'
}
function Yu(e, t) {
  if (!t.current.includes('floating') && !e.getAttribute('role')?.includes('dialog')) return
  const n = ro(),
    o = rC(e, n).filter((i) => {
      const a = i.getAttribute('data-tabindex') || ''
      return gg(i, n) || (i.hasAttribute('data-tabindex') && !a.startsWith('-'))
    }),
    s = e.getAttribute('tabindex')
  t.current.includes('floating') || o.length === 0
    ? s !== '0' && e.setAttribute('tabindex', '0')
    : (s !== '-1' ||
        (e.hasAttribute('data-tabindex') && e.getAttribute('data-tabindex') !== '-1')) &&
      (e.setAttribute('tabindex', '-1'), e.setAttribute('data-tabindex', '-1'))
}
function ql(e) {
  const {
      context: t,
      children: n,
      disabled: r = !1,
      initialFocus: o = !0,
      returnFocus: s = !0,
      restoreFocus: i = !1,
      modal: a = !0,
      closeOnFocusOut: c = !0,
      openInteractionType: u = '',
      nextFocusableElement: f,
      previousFocusableElement: d,
      beforeContentFocusGuardRef: g,
      externalTree: h,
    } = e,
    m = 'rootStore' in t ? t.rootStore : t,
    p = m.useState('open'),
    b = m.useState('domReferenceElement'),
    y = m.useState('floatingElement'),
    { events: v, dataRef: C } = m.context,
    w = ne(() => C.current.floatingContext?.nodeId),
    x = o === !1,
    S = Za(b) && x,
    k = l.useRef(['content']),
    R = ht(o),
    M = ht(s),
    j = ht(u),
    P = Yn(h),
    I = Og(),
    T = l.useRef(null),
    O = l.useRef(null),
    L = l.useRef(!1),
    A = l.useRef(!1),
    z = l.useRef(!1),
    D = l.useRef(-1),
    $ = l.useRef(''),
    F = l.useRef(''),
    Q = l.useRef(null),
    q = l.useRef(null),
    se = Vn(Q, g, I?.beforeInsideRef),
    Y = Vn(q, I?.afterInsideRef),
    oe = bt(),
    te = bt(),
    le = jl(),
    ve = I != null,
    X = Gs(y),
    me = ne((Z = X) => (Z ? Go(Z, ro()) : [])),
    he = ne((Z) => {
      const K = me(Z)
      return k.current
        .map(() => K)
        .filter(Boolean)
        .flat()
    })
  ;(l.useEffect(() => {
    if (r || !a) return
    function Z(xe) {
      xe.key === 'Tab' && be(X, St(ke(X))) && me().length === 0 && !S && Je(xe)
    }
    const K = ke(X)
    return (
      K.addEventListener('keydown', Z),
      () => {
        K.removeEventListener('keydown', Z)
      }
    )
  }, [r, b, X, a, k, S, me, he]),
    l.useEffect(() => {
      if (r || !p) return
      const Z = ke(X)
      function K() {
        z.current = !1
      }
      function xe(U) {
        const B = Ge(U),
          _ = be(y, B) || be(b, B) || be(I?.portalNode, B)
        ;((z.current = !_),
          (F.current = U.pointerType || 'keyboard'),
          B?.closest(`[${iw}]`) && (A.current = !0))
      }
      function N() {
        F.current = 'keyboard'
      }
      return (
        Z.addEventListener('pointerdown', xe, !0),
        Z.addEventListener('pointerup', K, !0),
        Z.addEventListener('pointercancel', K, !0),
        Z.addEventListener('keydown', N, !0),
        () => {
          ;(Z.removeEventListener('pointerdown', xe, !0),
            Z.removeEventListener('pointerup', K, !0),
            Z.removeEventListener('pointercancel', K, !0),
            Z.removeEventListener('keydown', N, !0))
        }
      )
    }, [r, y, b, X, p, I]),
    l.useEffect(() => {
      if (r || !c) return
      const Z = ke(X)
      function K() {
        ;((A.current = !0),
          te.start(0, () => {
            A.current = !1
          }))
      }
      function xe(H) {
        const W = Ge(H),
          fe = me().indexOf(W)
        fe !== -1 && (D.current = fe)
      }
      function N(H) {
        const W = H.relatedTarget,
          J = H.currentTarget,
          fe = Ge(H)
        queueMicrotask(() => {
          const we = w(),
            Ae = m.context.triggerElements,
            st =
              W?.hasAttribute(Xr('focus-guard')) &&
              [
                Q.current,
                q.current,
                I?.beforeInsideRef.current,
                I?.afterInsideRef.current,
                I?.beforeOutsideRef.current,
                I?.afterOutsideRef.current,
                cn(d),
                cn(f),
              ].includes(W),
            He = !(
              be(b, W) ||
              be(y, W) ||
              be(W, y) ||
              be(I?.portalNode, W) ||
              (W != null && Ae.hasElement(W)) ||
              Ae.hasMatchingElement((Ee) => be(Ee, W)) ||
              st ||
              (P &&
                (lr(P.nodesRef.current, we).find(
                  (Ee) =>
                    be(Ee.context?.elements.floating, W) ||
                    be(Ee.context?.elements.domReference, W),
                ) ||
                  ju(P.nodesRef.current, we).find(
                    (Ee) =>
                      [Ee.context?.elements.floating, Gs(Ee.context?.elements.floating)].includes(
                        W,
                      ) || Ee.context?.elements.domReference === W,
                  )))
            )
          if ((J === b && X && Yu(X, k), i && J !== b && !jC(fe) && St(Z) === Z.body)) {
            if (Ze(X) && (X.focus(), i === 'popup')) {
              le.request(() => {
                X.focus()
              })
              return
            }
            const Ee = D.current,
              _e = me(),
              tt = _e[Ee] || _e[_e.length - 1] || X
            Ze(tt) && tt.focus()
          }
          if (C.current.insideReactTree) {
            C.current.insideReactTree = !1
            return
          }
          ;(S || !a) &&
            W &&
            He &&
            !A.current &&
            (S || W !== aa()) &&
            ((L.current = !0), m.setOpen(!1, ge(fr, H)))
        })
      }
      function U() {
        z.current ||
          ((C.current.insideReactTree = !0),
          oe.start(0, () => {
            C.current.insideReactTree = !1
          }))
      }
      const B = Ze(b) ? b : null,
        _ = []
      if (!(!y && !B))
        return (
          B &&
            (B.addEventListener('focusout', N),
            B.addEventListener('pointerdown', K),
            _.push(() => {
              ;(B.removeEventListener('focusout', N), B.removeEventListener('pointerdown', K))
            })),
          y &&
            (y.addEventListener('focusin', xe),
            y.addEventListener('focusout', N),
            I &&
              (y.addEventListener('focusout', U, !0),
              _.push(() => {
                y.removeEventListener('focusout', U, !0)
              })),
            _.push(() => {
              ;(y.removeEventListener('focusin', xe), y.removeEventListener('focusout', N))
            })),
          () => {
            _.forEach((H) => {
              H()
            })
          }
        )
    }, [r, b, y, X, a, P, I, m, c, i, me, S, w, k, C, oe, te, le, f, d]),
    l.useEffect(() => {
      if (r || !y || !p) return
      const Z = Array.from(I?.portalNode?.querySelectorAll(`[${Xr('portal')}]`) || []),
        xe = (P ? ju(P.nodesRef.current, w()) : []).find((U) =>
          Za(U.context?.elements.domReference || null),
        )?.context?.elements.domReference,
        N = [
          y,
          xe,
          ...Z,
          T.current,
          O.current,
          Q.current,
          q.current,
          I?.beforeOutsideRef.current,
          I?.afterOutsideRef.current,
          cn(d),
          cn(f),
          S ? b : null,
        ].filter((U) => U != null)
      return OC(N, a || S)
    }, [p, r, b, y, a, k, I, S, P, w, f, d]),
    ae(() => {
      if (!p || r || !Ze(X)) return
      const Z = ke(X),
        K = St(Z)
      queueMicrotask(() => {
        const xe = he(X),
          N = R.current,
          U = typeof N == 'function' ? N(j.current || '') : N
        if (U === void 0 || U === !1) return
        let B
        ;(U === !0 || U === null ? (B = xe[0] || X) : (B = cn(U)),
          (B = B || xe[0] || X),
          !be(X, K) && To(B, { preventScroll: B === X }))
      })
    }, [r, p, X, x, he, R, j]),
    ae(() => {
      if (r || !X) return
      const Z = ke(X),
        K = St(Z)
      zC(K)
      function xe(B) {
        if (
          (B.open || ($.current = AC(B.nativeEvent, F.current)),
          B.reason === Ct && B.nativeEvent.type === 'mouseleave' && (L.current = !0),
          B.reason === gi)
        )
          if (B.nested) L.current = !1
          else if (Qp(B.nativeEvent) || eg(B.nativeEvent)) L.current = !1
          else {
            let _ = !1
            ;(document.createElement('div').focus({
              get preventScroll() {
                return ((_ = !0), !1)
              },
            }),
              _ ? (L.current = !1) : (L.current = !0))
          }
      }
      v.on('openchange', xe)
      const N = Z.createElement('span')
      ;(N.setAttribute('tabindex', '-1'),
        N.setAttribute('aria-hidden', 'true'),
        Object.assign(N.style, Ci),
        ve && b && b.insertAdjacentElement('afterend', N))
      function U() {
        const B = M.current
        let _ = typeof B == 'function' ? B($.current) : B
        if (_ === void 0 || _ === !1) return null
        if ((_ === null && (_ = !0), typeof _ == 'boolean')) {
          const W = b || aa()
          return W && W.isConnected ? W : N
        }
        const H = b || aa() || N
        return cn(_) || H
      }
      return () => {
        v.off('openchange', xe)
        const B = St(Z),
          _ =
            be(y, B) ||
            (P && lr(P.nodesRef.current, w(), !1).some((W) => be(W.context?.elements.floating, B))),
          H = U()
        queueMicrotask(() => {
          const W = LC(H),
            J = typeof M.current != 'boolean'
          ;(M.current &&
            !L.current &&
            Ze(W) &&
            (!(!J && W !== B && B !== Z.body) || _) &&
            W.focus({ preventScroll: !0 }),
            N.remove(),
            (L.current = !1))
        })
      }
    }, [r, y, X, M, C, v, P, ve, b, w]),
    ae(() => {
      if (!Up || p || !y) return
      const Z = St(ke(y))
      !Ze(Z) || !wi(Z) || (be(y, Z) && Z.blur())
    }, [p, y]),
    ae(() => {
      if (!(r || !I))
        return (
          I.setFocusManagerState({
            modal: a,
            closeOnFocusOut: c,
            open: p,
            onOpenChange: m.setOpen,
            domReference: b,
          }),
          () => {
            I.setFocusManagerState(null)
          }
        )
    }, [r, I, a, p, m, c, b]),
    ae(() => {
      if (!(r || !X))
        return (
          Yu(X, k),
          () => {
            queueMicrotask(Yl)
          }
        )
    }, [r, X, k]))
  const V = !r && (a ? !S : !0) && (ve || a)
  return E.jsxs(l.Fragment, {
    children: [
      V &&
        E.jsx(hn, {
          'data-type': 'inside',
          ref: se,
          onFocus: (Z) => {
            if (a) {
              const K = he()
              To(K[K.length - 1])
            } else
              I?.portalNode &&
                ((L.current = !1),
                Vr(Z, I.portalNode) ? Gl(b)?.focus() : cn(d ?? I.beforeOutsideRef)?.focus())
          },
        }),
      n,
      V &&
        E.jsx(hn, {
          'data-type': 'inside',
          ref: Y,
          onFocus: (Z) => {
            a
              ? To(he()[0])
              : I?.portalNode &&
                (c && (L.current = !0),
                Vr(Z, I.portalNode) ? hg(b)?.focus() : cn(f ?? I.afterOutsideRef)?.focus())
          },
        }),
    ],
  })
}
function Si(e, t = {}) {
  const n = 'rootStore' in e ? e.rootStore : e,
    r = n.context.dataRef,
    {
      enabled: o = !0,
      event: s = 'click',
      toggle: i = !0,
      ignoreMouse: a = !1,
      stickIfOpen: c = !0,
      touchOpenDelay: u = 0,
      reason: f = dr,
    } = t,
    d = l.useRef(void 0),
    g = jl(),
    h = bt(),
    m = l.useMemo(
      () => ({
        onPointerDown(p) {
          d.current = p.pointerType
        },
        onMouseDown(p) {
          const b = d.current,
            y = p.nativeEvent,
            v = n.select('open')
          if (p.button !== 0 || s === 'click' || (pr(b, !0) && a)) return
          const C = r.current.openEvent,
            w = C?.type,
            x = n.select('domReferenceElement') !== p.currentTarget,
            S = (v && x) || !(v && i && (!(C && c) || w === 'click' || w === 'mousedown'))
          if (wi(y.target)) {
            const R = ge(f, y, y.target)
            S && b === 'touch' && u > 0
              ? h.start(u, () => {
                  n.setOpen(!0, R)
                })
              : n.setOpen(S, R)
            return
          }
          const k = p.currentTarget
          g.request(() => {
            const R = ge(f, y, k)
            S && b === 'touch' && u > 0
              ? h.start(u, () => {
                  n.setOpen(!0, R)
                })
              : n.setOpen(S, R)
          })
        },
        onClick(p) {
          if (s === 'mousedown-only') return
          const b = d.current
          if (s === 'mousedown' && b) {
            d.current = void 0
            return
          }
          if (pr(b, !0) && a) return
          const y = n.select('open'),
            v = r.current.openEvent,
            C = n.select('domReferenceElement') !== p.currentTarget,
            w = (y && C) || !(y && i && (!(v && c) || tg(v))),
            x = ge(f, p.nativeEvent, p.currentTarget)
          w && b === 'touch' && u > 0
            ? h.start(u, () => {
                n.setOpen(!0, x)
              })
            : n.setOpen(w, x)
        },
        onKeyDown() {
          d.current = void 0
        },
      }),
      [r, s, a, n, c, i, g, h, u, f],
    )
  return l.useMemo(() => (o ? { reference: m } : Ke), [o, m])
}
function DC(e, t) {
  let n = null,
    r = null,
    o = !1
  return {
    contextElement: e || void 0,
    getBoundingClientRect() {
      const s = e?.getBoundingClientRect() || { width: 0, height: 0, x: 0, y: 0 },
        i = t.axis === 'x' || t.axis === 'both',
        a = t.axis === 'y' || t.axis === 'both',
        c =
          ['mouseenter', 'mousemove'].includes(t.dataRef.current.openEvent?.type || '') &&
          t.pointerType !== 'touch'
      let u = s.width,
        f = s.height,
        d = s.x,
        g = s.y
      return (
        n == null && t.x && i && (n = s.x - t.x),
        r == null && t.y && a && (r = s.y - t.y),
        (d -= n || 0),
        (g -= r || 0),
        (u = 0),
        (f = 0),
        !o || c
          ? ((u = t.axis === 'y' ? s.width : 0),
            (f = t.axis === 'x' ? s.height : 0),
            (d = i && t.x != null ? t.x : d),
            (g = a && t.y != null ? t.y : g))
          : o && !c && ((f = t.axis === 'x' ? s.height : f), (u = t.axis === 'y' ? s.width : u)),
        (o = !0),
        { width: u, height: f, x: d, y: g, top: g, right: d + u, bottom: g + f, left: d }
      )
    },
  }
}
function qu(e) {
  return e != null && e.clientX != null
}
function NC(e, t = {}) {
  const n = 'rootStore' in e ? e.rootStore : e,
    r = n.useState('open'),
    o = n.useState('floatingElement'),
    s = n.useState('domReferenceElement'),
    i = n.context.dataRef,
    { enabled: a = !0, axis: c = 'both' } = t,
    u = l.useRef(!1),
    f = l.useRef(null),
    [d, g] = l.useState(),
    [h, m] = l.useState([]),
    p = ne((w, x, S) => {
      u.current ||
        (i.current.openEvent && !qu(i.current.openEvent)) ||
        n.set('positionReference', DC(S ?? s, { x: w, y: x, axis: c, dataRef: i, pointerType: d }))
    }),
    b = ne((w) => {
      r ? f.current || m([]) : p(w.clientX, w.clientY, w.currentTarget)
    }),
    y = pr(d) ? o : r,
    v = l.useCallback(() => {
      if (!y || !a) return
      const w = Ye(o)
      function x(S) {
        const k = Ge(S)
        be(o, k)
          ? (w.removeEventListener('mousemove', x), (f.current = null))
          : p(S.clientX, S.clientY)
      }
      if (!i.current.openEvent || qu(i.current.openEvent)) {
        w.addEventListener('mousemove', x)
        const S = () => {
          ;(w.removeEventListener('mousemove', x), (f.current = null))
        }
        return ((f.current = S), S)
      }
      n.set('positionReference', s)
    }, [y, a, o, i, s, n, p])
  ;(l.useEffect(() => v(), [v, h]),
    l.useEffect(() => {
      a && !o && (u.current = !1)
    }, [a, o]),
    l.useEffect(() => {
      !a && r && (u.current = !0)
    }, [a, r]))
  const C = l.useMemo(() => {
    function w(x) {
      g(x.pointerType)
    }
    return { onPointerDown: w, onPointerEnter: w, onMouseMove: b, onMouseEnter: b }
  }, [b])
  return l.useMemo(() => (a ? { reference: C, trigger: C } : {}), [a, C])
}
function Xu(e, t, n) {
  let { reference: r, floating: o } = e
  const s = Lt(t),
    i = Wl(t),
    a = Bl(i),
    c = Pt(t),
    u = s === 'y',
    f = r.x + r.width / 2 - o.width / 2,
    d = r.y + r.height / 2 - o.height / 2,
    g = r[a] / 2 - o[a] / 2
  let h
  switch (c) {
    case 'top':
      h = { x: f, y: r.y - o.height }
      break
    case 'bottom':
      h = { x: f, y: r.y + r.height }
      break
    case 'right':
      h = { x: r.x + r.width, y: d }
      break
    case 'left':
      h = { x: r.x - o.width, y: d }
      break
    default:
      h = { x: r.x, y: r.y }
  }
  const m = Zn(t)
  return (m && (h[i] += g * (m === 'end' ? 1 : -1) * (n && u ? -1 : 1)), h)
}
async function _C(e, t) {
  var n
  t === void 0 && (t = {})
  const { x: r, y: o, platform: s, rects: i, elements: a, strategy: c } = e,
    {
      boundary: u = 'clippingAncestors',
      rootBoundary: f = 'viewport',
      elementContext: d = 'floating',
      altBoundary: g = !1,
      padding: h = 0,
    } = vn(t, e),
    m = rg(h),
    b = a[g ? (d === 'floating' ? 'reference' : 'floating') : d],
    y = Ks(
      await s.getClippingRect({
        element:
          (n = await (s.isElement == null ? void 0 : s.isElement(b))) == null || n
            ? b
            : b.contextElement ||
              (await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(a.floating))),
        boundary: u,
        rootBoundary: f,
        strategy: c,
      }),
    ),
    v =
      d === 'floating'
        ? { x: r, y: o, width: i.floating.width, height: i.floating.height }
        : i.reference,
    C = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(a.floating)),
    w = ((await (s.isElement == null ? void 0 : s.isElement(C))) &&
      (await (s.getScale == null ? void 0 : s.getScale(C)))) || { x: 1, y: 1 },
    x = Ks(
      s.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: a,
            rect: v,
            offsetParent: C,
            strategy: c,
          })
        : v,
    )
  return {
    top: (y.top - x.top + m.top) / w.y,
    bottom: (x.bottom - y.bottom + m.bottom) / w.y,
    left: (y.left - x.left + m.left) / w.x,
    right: (x.right - y.right + m.right) / w.x,
  }
}
const FC = 50,
  $C = async (e, t, n) => {
    const {
        placement: r = 'bottom',
        strategy: o = 'absolute',
        middleware: s = [],
        platform: i,
      } = n,
      a = i.detectOverflow ? i : { ...i, detectOverflow: _C },
      c = await (i.isRTL == null ? void 0 : i.isRTL(t))
    let u = await i.getElementRects({ reference: e, floating: t, strategy: o }),
      { x: f, y: d } = Xu(u, r, c),
      g = r,
      h = 0
    const m = {}
    for (let p = 0; p < s.length; p++) {
      const b = s[p]
      if (!b) continue
      const { name: y, fn: v } = b,
        {
          x: C,
          y: w,
          data: x,
          reset: S,
        } = await v({
          x: f,
          y: d,
          initialPlacement: r,
          placement: g,
          strategy: o,
          middlewareData: m,
          rects: u,
          platform: a,
          elements: { reference: e, floating: t },
        })
      ;((f = C ?? f),
        (d = w ?? d),
        (m[y] = { ...m[y], ...x }),
        S &&
          h < FC &&
          (h++,
          typeof S == 'object' &&
            (S.placement && (g = S.placement),
            S.rects &&
              (u =
                S.rects === !0
                  ? await i.getElementRects({ reference: e, floating: t, strategy: o })
                  : S.rects),
            ({ x: f, y: d } = Xu(u, g, c))),
          (p = -1)))
    }
    return { x: f, y: d, placement: g, strategy: o, middlewareData: m }
  },
  VC = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: 'flip',
        options: e,
        async fn(t) {
          var n, r
          const {
              placement: o,
              middlewareData: s,
              rects: i,
              initialPlacement: a,
              platform: c,
              elements: u,
            } = t,
            {
              mainAxis: f = !0,
              crossAxis: d = !0,
              fallbackPlacements: g,
              fallbackStrategy: h = 'bestFit',
              fallbackAxisSideDirection: m = 'none',
              flipAlignment: p = !0,
              ...b
            } = vn(e, t)
          if ((n = s.arrow) != null && n.alignmentOffset) return {}
          const y = Pt(o),
            v = Lt(a),
            C = Pt(a) === a,
            w = await (c.isRTL == null ? void 0 : c.isRTL(u.floating)),
            x = g || (C || !p ? [Zs(a)] : Nw(a)),
            S = m !== 'none'
          !g && S && x.push(...Vw(a, p, m, w))
          const k = [a, ...x],
            R = await c.detectOverflow(t, b),
            M = []
          let j = ((r = s.flip) == null ? void 0 : r.overflows) || []
          if ((f && M.push(R[y]), d)) {
            const O = Dw(o, i, w)
            M.push(R[O[0]], R[O[1]])
          }
          if (((j = [...j, { placement: o, overflows: M }]), !M.every((O) => O <= 0))) {
            var P, I
            const O = (((P = s.flip) == null ? void 0 : P.index) || 0) + 1,
              L = k[O]
            if (
              L &&
              (!(d === 'alignment' ? v !== Lt(L) : !1) ||
                j.every((D) => (Lt(D.placement) === v ? D.overflows[0] > 0 : !0)))
            )
              return { data: { index: O, overflows: j }, reset: { placement: L } }
            let A =
              (I = j
                .filter((z) => z.overflows[0] <= 0)
                .sort((z, D) => z.overflows[1] - D.overflows[1])[0]) == null
                ? void 0
                : I.placement
            if (!A)
              switch (h) {
                case 'bestFit': {
                  var T
                  const z =
                    (T = j
                      .filter((D) => {
                        if (S) {
                          const $ = Lt(D.placement)
                          return $ === v || $ === 'y'
                        }
                        return !0
                      })
                      .map((D) => [
                        D.placement,
                        D.overflows.filter(($) => $ > 0).reduce(($, F) => $ + F, 0),
                      ])
                      .sort((D, $) => D[1] - $[1])[0]) == null
                      ? void 0
                      : T[0]
                  z && (A = z)
                  break
                }
                case 'initialPlacement':
                  A = a
                  break
              }
            if (o !== A) return { reset: { placement: A } }
          }
          return {}
        },
      }
    )
  }
function Ju(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width,
  }
}
function Qu(e) {
  return Lw.some((t) => e[t] >= 0)
}
const HC = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: 'hide',
        options: e,
        async fn(t) {
          const { rects: n, platform: r } = t,
            { strategy: o = 'referenceHidden', ...s } = vn(e, t)
          switch (o) {
            case 'referenceHidden': {
              const i = await r.detectOverflow(t, { ...s, elementContext: 'reference' }),
                a = Ju(i, n.reference)
              return { data: { referenceHiddenOffsets: a, referenceHidden: Qu(a) } }
            }
            case 'escaped': {
              const i = await r.detectOverflow(t, { ...s, altBoundary: !0 }),
                a = Ju(i, n.floating)
              return { data: { escapedOffsets: a, escaped: Qu(a) } }
            }
            default:
              return {}
          }
        },
      }
    )
  },
  Ag = new Set(['left', 'top'])
async function BC(e, t) {
  const { placement: n, platform: r, elements: o } = e,
    s = await (r.isRTL == null ? void 0 : r.isRTL(o.floating)),
    i = Pt(n),
    a = Zn(n),
    c = Lt(n) === 'y',
    u = Ag.has(i) ? -1 : 1,
    f = s && c ? -1 : 1,
    d = vn(t, e)
  let {
    mainAxis: g,
    crossAxis: h,
    alignmentAxis: m,
  } = typeof d == 'number'
    ? { mainAxis: d, crossAxis: 0, alignmentAxis: null }
    : { mainAxis: d.mainAxis || 0, crossAxis: d.crossAxis || 0, alignmentAxis: d.alignmentAxis }
  return (
    a && typeof m == 'number' && (h = a === 'end' ? m * -1 : m),
    c ? { x: h * f, y: g * u } : { x: g * u, y: h * f }
  )
}
const WC = function (e) {
    return (
      e === void 0 && (e = 0),
      {
        name: 'offset',
        options: e,
        async fn(t) {
          var n, r
          const { x: o, y: s, placement: i, middlewareData: a } = t,
            c = await BC(t, e)
          return i === ((n = a.offset) == null ? void 0 : n.placement) &&
            (r = a.arrow) != null &&
            r.alignmentOffset
            ? {}
            : { x: o + c.x, y: s + c.y, data: { ...c, placement: i } }
        },
      }
    )
  },
  GC = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: 'shift',
        options: e,
        async fn(t) {
          const { x: n, y: r, placement: o, platform: s } = t,
            {
              mainAxis: i = !0,
              crossAxis: a = !1,
              limiter: c = {
                fn: (v) => {
                  let { x: C, y: w } = v
                  return { x: C, y: w }
                },
              },
              ...u
            } = vn(e, t),
            f = { x: n, y: r },
            d = await s.detectOverflow(t, u),
            g = Lt(o),
            h = Hl(g)
          let m = f[h],
            p = f[g]
          const b = (v, C) =>
            ng(C + d[v === 'y' ? 'top' : 'left'], C, C - d[v === 'y' ? 'bottom' : 'right'])
          ;(i && (m = b(h, m)), a && (p = b(g, p)))
          const y = c.fn({ ...t, [h]: m, [g]: p })
          return { ...y, data: { x: y.x - n, y: y.y - r, enabled: { [h]: i, [g]: a } } }
        },
      }
    )
  },
  UC = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        options: e,
        fn(t) {
          var n, r
          const { x: o, y: s, placement: i, rects: a, middlewareData: c } = t,
            { offset: u = 0, mainAxis: f = !0, crossAxis: d = !0 } = vn(e, t),
            g = { x: o, y: s },
            h = Lt(i),
            m = Hl(h)
          let p = g[m],
            b = g[h]
          const y = vn(u, t),
            v =
              typeof y == 'number'
                ? { mainAxis: y, crossAxis: 0 }
                : {
                    mainAxis: (n = y.mainAxis) != null ? n : 0,
                    crossAxis: (r = y.crossAxis) != null ? r : 0,
                  }
          if (f) {
            const x = m === 'y' ? 'height' : 'width',
              S = a.reference[m] - a.floating[x] + v.mainAxis,
              k = a.reference[m] + a.reference[x] - v.mainAxis
            p < S ? (p = S) : p > k && (p = k)
          }
          if (d) {
            var C, w
            const x = m === 'y' ? 'width' : 'height',
              S = Ag.has(Pt(i)),
              k =
                a.reference[h] -
                a.floating[x] +
                ((S && ((C = c.offset) == null ? void 0 : C[h])) || 0) +
                (S ? 0 : v.crossAxis),
              R =
                a.reference[h] +
                a.reference[x] +
                (S ? 0 : ((w = c.offset) == null ? void 0 : w[h]) || 0) -
                (S ? v.crossAxis : 0)
            b < k ? (b = k) : b > R && (b = R)
          }
          return { [m]: p, [h]: b }
        },
      }
    )
  },
  ZC = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: 'size',
        options: e,
        async fn(t) {
          const { placement: n, rects: r, platform: o, elements: s } = t,
            { apply: i = () => {}, ...a } = vn(e, t),
            c = await o.detectOverflow(t, a),
            u = Pt(n),
            f = Zn(n),
            d = Lt(n) === 'y',
            { width: g, height: h } = r.floating
          let m, p
          u === 'top' || u === 'bottom'
            ? ((m = u),
              (p =
                f === ((await (o.isRTL == null ? void 0 : o.isRTL(s.floating))) ? 'start' : 'end')
                  ? 'left'
                  : 'right'))
            : ((p = u), (m = f === 'end' ? 'top' : 'bottom'))
          const b = h - c.top - c.bottom,
            y = g - c.left - c.right,
            v = Yr(h - c[m], b),
            C = Yr(g - c[p], y),
            w = t.middlewareData.shift,
            x = !w
          let S = v,
            k = C
          ;(w != null && w.enabled.x && (k = y),
            w != null && w.enabled.y && (S = b),
            x && !f && (d ? (k = g - 2 * gn(c.left, c.right)) : (S = h - 2 * gn(c.top, c.bottom))),
            await i({ ...t, availableWidth: k, availableHeight: S }))
          const R = await o.getDimensions(s.floating)
          return g !== R.width || h !== R.height ? { reset: { rects: !0 } } : {}
        },
      }
    )
  }
function zg(e) {
  const t = Nt(e)
  let n = parseFloat(t.width) || 0,
    r = parseFloat(t.height) || 0
  const o = Ze(e),
    s = o ? e.offsetWidth : n,
    i = o ? e.offsetHeight : r,
    a = Us(n) !== s || Us(r) !== i
  return (a && ((n = s), (r = i)), { width: n, height: r, $: a })
}
function Xl(e) {
  return je(e) ? e : e.contextElement
}
function Gr(e) {
  const t = Xl(e)
  if (!Ze(t)) return mn(1)
  const n = t.getBoundingClientRect(),
    { width: r, height: o, $: s } = zg(t)
  let i = (s ? Us(n.width) : n.width) / r,
    a = (s ? Us(n.height) : n.height) / o
  return (
    (!i || !Number.isFinite(i)) && (i = 1),
    (!a || !Number.isFinite(a)) && (a = 1),
    { x: i, y: a }
  )
}
const KC = mn(0)
function Lg(e) {
  const t = Ye(e)
  return !yi() || !t.visualViewport
    ? KC
    : { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop }
}
function YC(e, t, n) {
  return (t === void 0 && (t = !1), !!n && t && n === Ye(e))
}
function gr(e, t, n, r) {
  ;(t === void 0 && (t = !1), n === void 0 && (n = !1))
  const o = e.getBoundingClientRect(),
    s = Xl(e)
  let i = mn(1)
  t && (r ? je(r) && (i = Gr(r)) : (i = Gr(e)))
  const a = YC(s, n, r) ? Lg(s) : mn(0)
  let c = (o.left + a.x) / i.x,
    u = (o.top + a.y) / i.y,
    f = o.width / i.x,
    d = o.height / i.y
  if (s && r) {
    const g = Ye(s),
      h = je(r) ? Ye(r) : r
    let m = g,
      p = Ga(m)
    for (; p && h !== m; ) {
      const b = Gr(p),
        y = p.getBoundingClientRect(),
        v = Nt(p),
        C = y.left + (p.clientLeft + parseFloat(v.paddingLeft)) * b.x,
        w = y.top + (p.clientTop + parseFloat(v.paddingTop)) * b.y
      ;((c *= b.x),
        (u *= b.y),
        (f *= b.x),
        (d *= b.y),
        (c += C),
        (u += w),
        (m = Ye(p)),
        (p = Ga(m)))
    }
  }
  return Ks({ width: f, height: d, x: c, y: u })
}
function Ei(e, t) {
  const n = xi(e).scrollLeft
  return t ? t.left + n : gr(Sn(e)).left + n
}
function jg(e, t) {
  const n = e.getBoundingClientRect(),
    r = n.left + t.scrollLeft - Ei(e, n),
    o = n.top + t.scrollTop
  return { x: r, y: o }
}
function qC(e) {
  let { elements: t, rect: n, offsetParent: r, strategy: o } = e
  const s = o === 'fixed',
    i = Sn(r),
    a = t ? vi(t.floating) : !1
  if (r === i || (a && s)) return n
  let c = { scrollLeft: 0, scrollTop: 0 },
    u = mn(1)
  const f = mn(0),
    d = Ze(r)
  if ((d || !s) && ((Un(r) !== 'body' || Er(i)) && (c = xi(r)), d)) {
    const h = gr(r)
    ;((u = Gr(r)), (f.x = h.x + r.clientLeft), (f.y = h.y + r.clientTop))
  }
  const g = i && !d && !s ? jg(i, c) : mn(0)
  return {
    width: n.width * u.x,
    height: n.height * u.y,
    x: n.x * u.x - c.scrollLeft * u.x + f.x + g.x,
    y: n.y * u.y - c.scrollTop * u.y + f.y + g.y,
  }
}
function XC(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : []
}
function JC(e) {
  const t = xi(e),
    n = e.ownerDocument.body,
    r = gn(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth),
    o = gn(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight)
  let s = -t.scrollLeft + Ei(e)
  const i = -t.scrollTop
  return (
    Nt(n).direction === 'rtl' && (s += gn(e.clientWidth, n.clientWidth) - r),
    { width: r, height: o, x: s, y: i }
  )
}
const QC = 25
function eS(e, t, n) {
  n === void 0 && (n = 'viewport')
  const r = n === 'layoutViewport',
    o = Ye(e),
    s = Sn(e),
    i = o.visualViewport
  let a = s.clientWidth,
    c = s.clientHeight,
    u = 0,
    f = 0
  if (i) {
    const g = !yi() || t === 'fixed'
    r
      ? g || ((u = -i.offsetLeft), (f = -i.offsetTop))
      : ((a = i.width), (c = i.height), g && ((u = i.offsetLeft), (f = i.offsetTop)))
  }
  if (Ei(s) <= 0) {
    const g = s.ownerDocument,
      h = g.body,
      m = getComputedStyle(h),
      p =
        (g.compatMode === 'CSS1Compat' && parseFloat(m.marginLeft) + parseFloat(m.marginRight)) ||
        0,
      b = Math.abs(s.clientWidth - h.clientWidth - p),
      y = getComputedStyle(s).scrollbarGutter === 'stable both-edges' ? b / 2 : b
    y <= QC && (a -= y)
  }
  return { width: a, height: c, x: u, y: f }
}
function tS(e, t) {
  const n = gr(e, !0, t === 'fixed'),
    r = n.top + e.clientTop,
    o = n.left + e.clientLeft,
    s = Gr(e),
    i = e.clientWidth * s.x,
    a = e.clientHeight * s.y,
    c = o * s.x,
    u = r * s.y
  return { width: i, height: a, x: c, y: u }
}
function ed(e, t, n) {
  let r
  if (t === 'viewport' || t === 'layoutViewport') r = eS(e, n, t)
  else if (t === 'document') r = JC(Sn(e))
  else if (je(t)) r = tS(t, n)
  else {
    const o = Lg(e)
    r = { x: t.x - o.x, y: t.y - o.y, width: t.width, height: t.height }
  }
  return Ks(r)
}
function nS(e, t) {
  const n = t.get(e)
  if (n) return n
  let r = jn(e, [], !1).filter((a) => je(a) && Un(a) !== 'body'),
    o = null
  const s = Nt(e).position === 'fixed'
  let i = s ? bn(e) : e
  for (; je(i) && !pn(i); ) {
    const a = Nt(i),
      c = _l(i),
      u = o ? o.position : s ? 'fixed' : ''
    ;(!c && (u === 'fixed' || (u === 'absolute' && a.position === 'static'))
      ? (r = r.filter((d) => d !== i))
      : (o = a),
      (i = bn(i)))
  }
  return (t.set(e, r), r)
}
function rS(e) {
  let { element: t, boundary: n, rootBoundary: r, strategy: o } = e
  const i = [...(n === 'clippingAncestors' ? (vi(t) ? [] : nS(t, this._c)) : [].concat(n)), r],
    a = ed(t, i[0], o)
  let c = a.top,
    u = a.right,
    f = a.bottom,
    d = a.left
  for (let g = 1; g < i.length; g++) {
    const h = ed(t, i[g], o)
    ;((c = gn(h.top, c)), (u = Yr(h.right, u)), (f = Yr(h.bottom, f)), (d = gn(h.left, d)))
  }
  return { width: u - d, height: f - c, x: d, y: c }
}
function oS(e) {
  const { width: t, height: n } = zg(e)
  return { width: t, height: n }
}
function sS(e, t, n) {
  const r = Ze(t),
    o = Sn(t),
    s = n === 'fixed',
    i = gr(e, !0, s, t)
  let a = { scrollLeft: 0, scrollTop: 0 }
  const c = mn(0)
  if ((r || !s) && ((Un(t) !== 'body' || Er(o)) && (a = xi(t)), r)) {
    const g = gr(t, !0, s, t)
    ;((c.x = g.x + t.clientLeft), (c.y = g.y + t.clientTop))
  }
  !r && o && (c.x = Ei(o))
  const u = o && !r && !s ? jg(o, a) : mn(0),
    f = i.left + a.scrollLeft - c.x - u.x,
    d = i.top + a.scrollTop - c.y - u.y
  return { x: f, y: d, width: i.width, height: i.height }
}
function la(e) {
  return Nt(e).position === 'static'
}
function td(e, t) {
  if (!Ze(e) || Nt(e).position === 'fixed') return null
  if (t) return t(e)
  let n = e.offsetParent
  return (Sn(e) === n && (n = n.ownerDocument.body), n)
}
function Dg(e, t) {
  const n = Ye(e)
  if (vi(e)) return n
  if (!Ze(e)) {
    let o = bn(e)
    for (; o && !pn(o); ) {
      if (je(o) && !la(o)) return o
      o = bn(o)
    }
    return n
  }
  let r = td(e, t)
  for (; r && Cw(r) && la(r); ) r = td(r, t)
  return r && pn(r) && la(r) && !_l(r) ? n : r || Rw(e) || n
}
const iS = async function (e) {
  const t = this.getOffsetParent || Dg,
    n = this.getDimensions,
    r = await n(e.floating)
  return {
    reference: sS(e.reference, await t(e.floating), e.strategy),
    floating: { x: 0, y: 0, width: r.width, height: r.height },
  }
}
function aS(e) {
  return Nt(e).direction === 'rtl'
}
const lS = {
  convertOffsetParentRelativeRectToViewportRelativeRect: qC,
  getDocumentElement: Sn,
  getClippingRect: rS,
  getOffsetParent: Dg,
  getElementRects: iS,
  getClientRects: XC,
  getDimensions: oS,
  getScale: Gr,
  isElement: je,
  isRTL: aS,
}
function Ng(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height
}
function cS(e, t, n) {
  let r = null,
    o
  const s = Sn(e)
  function i() {
    var f
    ;(clearTimeout(o), (f = r) == null || f.disconnect(), (r = null))
  }
  function a(f, d) {
    ;(f === void 0 && (f = !1), d === void 0 && (d = 1), i())
    const g = e.getBoundingClientRect(),
      { left: h, top: m, width: p, height: b } = g
    if ((f || t(), !p || !b)) return
    const y = Dr(m),
      v = Dr(s.clientWidth - (h + p)),
      C = Dr(s.clientHeight - (m + b)),
      w = Dr(h),
      S = {
        rootMargin: -y + 'px ' + -v + 'px ' + -C + 'px ' + -w + 'px',
        threshold: gn(0, Yr(1, d)) || 1,
      }
    let k = !0
    function R(M) {
      const j = M[0].intersectionRatio
      if (!Ng(g, e.getBoundingClientRect())) return a()
      if (j !== d) {
        if (!k) return a()
        j
          ? a(!1, j)
          : (o = setTimeout(() => {
              a(!1, 1e-7)
            }, 1e3))
      }
      k = !1
    }
    try {
      r = new IntersectionObserver(R, { ...S, root: s.ownerDocument })
    } catch {
      r = new IntersectionObserver(R, S)
    }
    r.observe(e)
  }
  const c = Ye(e),
    u = () => a(n)
  return (
    c.addEventListener('resize', u),
    a(!0),
    () => {
      ;(c.removeEventListener('resize', u), i())
    }
  )
}
function nd(e, t, n, r) {
  r === void 0 && (r = {})
  const {
      ancestorScroll: o = !0,
      ancestorResize: s = !0,
      elementResize: i = typeof ResizeObserver == 'function',
      layoutShift: a = typeof IntersectionObserver == 'function',
      animationFrame: c = !1,
    } = r,
    u = Xl(e),
    f = o || s ? [...(u ? jn(u) : []), ...(t ? jn(t) : [])] : []
  f.forEach((y) => {
    ;(o && y.addEventListener('scroll', n), s && y.addEventListener('resize', n))
  })
  const d = u && a ? cS(u, n, s) : null
  let g = -1,
    h = null
  i &&
    ((h = new ResizeObserver((y) => {
      let [v] = y
      ;(v &&
        v.target === u &&
        h &&
        t &&
        (h.unobserve(t),
        cancelAnimationFrame(g),
        (g = requestAnimationFrame(() => {
          var C
          ;(C = h) == null || C.observe(t)
        }))),
        n())
    })),
    u && !c && h.observe(u),
    t && h.observe(t))
  let m,
    p = c ? gr(e) : null
  c && b()
  function b() {
    const y = gr(e)
    ;(p && !Ng(p, y) && n(), (p = y), (m = requestAnimationFrame(b)))
  }
  return (
    n(),
    () => {
      var y
      ;(f.forEach((v) => {
        ;(o && v.removeEventListener('scroll', n), s && v.removeEventListener('resize', n))
      }),
        d?.(),
        (y = h) == null || y.disconnect(),
        (h = null),
        c && cancelAnimationFrame(m))
    }
  )
}
const uS = WC,
  dS = GC,
  fS = VC,
  pS = ZC,
  gS = HC,
  mS = UC,
  hS = (e, t, n) => {
    const r = new Map(),
      o = n ?? {},
      s = { ...lS, ...o.platform, _c: r }
    return $C(e, t, { ...o, platform: s })
  }
var bS = typeof document < 'u',
  vS = function () {},
  As = bS ? l.useLayoutEffect : vS
function Qs(e, t) {
  if (e === t) return !0
  if (typeof e != typeof t) return !1
  if (typeof e == 'function' && e.toString() === t.toString()) return !0
  let n, r, o
  if (e && t && typeof e == 'object') {
    if (Array.isArray(e)) {
      if (((n = e.length), n !== t.length)) return !1
      for (r = n; r-- !== 0; ) if (!Qs(e[r], t[r])) return !1
      return !0
    }
    if (((o = Object.keys(e)), (n = o.length), n !== Object.keys(t).length)) return !1
    for (r = n; r-- !== 0; ) if (!{}.hasOwnProperty.call(t, o[r])) return !1
    for (r = n; r-- !== 0; ) {
      const s = o[r]
      if (!(s === '_owner' && e.$$typeof) && !Qs(e[s], t[s])) return !1
    }
    return !0
  }
  return e !== e && t !== t
}
function _g(e) {
  return typeof window > 'u' ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1
}
function rd(e, t) {
  const n = _g(e)
  return Math.round(t * n) / n
}
function ca(e) {
  const t = l.useRef(e)
  return (
    As(() => {
      t.current = e
    }),
    t
  )
}
function yS(e) {
  e === void 0 && (e = {})
  const {
      placement: t = 'bottom',
      strategy: n = 'absolute',
      middleware: r = [],
      platform: o,
      elements: { reference: s, floating: i } = {},
      transform: a = !0,
      whileElementsMounted: c,
      open: u,
    } = e,
    [f, d] = l.useState({
      x: 0,
      y: 0,
      strategy: n,
      placement: t,
      middlewareData: {},
      isPositioned: !1,
    }),
    [g, h] = l.useState(r)
  Qs(g, r) || h(r)
  const [m, p] = l.useState(null),
    [b, y] = l.useState(null),
    v = l.useCallback((D) => {
      D !== S.current && ((S.current = D), p(D))
    }, []),
    C = l.useCallback((D) => {
      D !== k.current && ((k.current = D), y(D))
    }, []),
    w = s || m,
    x = i || b,
    S = l.useRef(null),
    k = l.useRef(null),
    R = l.useRef(f),
    M = c != null,
    j = ca(c),
    P = ca(o),
    I = ca(u),
    T = l.useCallback(() => {
      if (!S.current || !k.current) return
      const D = { placement: t, strategy: n, middleware: g }
      ;(P.current && (D.platform = P.current),
        hS(S.current, k.current, D).then(($) => {
          const F = { ...$, isPositioned: I.current !== !1 }
          O.current &&
            !Qs(R.current, F) &&
            ((R.current = F),
            Mt.flushSync(() => {
              d(F)
            }))
        }))
    }, [g, t, n, P, I])
  As(() => {
    u === !1 &&
      R.current.isPositioned &&
      ((R.current.isPositioned = !1), d((D) => ({ ...D, isPositioned: !1 })))
  }, [u])
  const O = l.useRef(!1)
  ;(As(
    () => (
      (O.current = !0),
      () => {
        O.current = !1
      }
    ),
    [],
  ),
    As(() => {
      if ((w && (S.current = w), x && (k.current = x), w && x)) {
        if (j.current) return j.current(w, x, T)
        T()
      }
    }, [w, x, T, j, M]))
  const L = l.useMemo(
      () => ({ reference: S, floating: k, setReference: v, setFloating: C }),
      [v, C],
    ),
    A = l.useMemo(() => ({ reference: w, floating: x }), [w, x]),
    z = l.useMemo(() => {
      const D = { position: n, left: 0, top: 0 }
      if (!A.floating) return D
      const $ = rd(A.floating, f.x),
        F = rd(A.floating, f.y)
      return a
        ? {
            ...D,
            transform: 'translate(' + $ + 'px, ' + F + 'px)',
            ...(_g(A.floating) >= 1.5 && { willChange: 'transform' }),
          }
        : { position: n, left: $, top: F }
    }, [n, a, A.floating, f.x, f.y])
  return l.useMemo(
    () => ({ ...f, update: T, refs: L, elements: A, floatingStyles: z }),
    [f, T, L, A, z],
  )
}
const xS = (e, t) => {
    const n = uS(e)
    return { name: n.name, fn: n.fn, options: [e, t] }
  },
  wS = (e, t) => {
    const n = dS(e)
    return { name: n.name, fn: n.fn, options: [e, t] }
  },
  CS = (e, t) => ({ fn: mS(e).fn, options: [e, t] }),
  SS = (e, t) => {
    const n = fS(e)
    return { name: n.name, fn: n.fn, options: [e, t] }
  },
  ES = (e, t) => {
    const n = pS(e)
    return { name: n.name, fn: n.fn, options: [e, t] }
  },
  RS = (e, t) => {
    const n = gS(e)
    return { name: n.name, fn: n.fn, options: [e, t] }
  },
  kS = { intentional: 'onClick', sloppy: 'onPointerDown' }
function IS(e) {
  return {
    escapeKey: typeof e == 'boolean' ? e : (e?.escapeKey ?? !1),
    outsidePress: typeof e == 'boolean' ? e : (e?.outsidePress ?? !0),
  }
}
function Ri(e, t = {}) {
  const n = 'rootStore' in e ? e.rootStore : e,
    r = n.useState('open'),
    o = n.useState('floatingElement'),
    s = n.useState('referenceElement'),
    i = n.useState('domReferenceElement'),
    { onOpenChange: a, dataRef: c } = n.context,
    {
      enabled: u = !0,
      escapeKey: f = !0,
      outsidePress: d = !0,
      outsidePressEvent: g = 'sloppy',
      referencePress: h = !1,
      referencePressEvent: m = 'sloppy',
      ancestorScroll: p = !1,
      bubbles: b,
      externalTree: y,
    } = t,
    v = Yn(y),
    C = ne(typeof d == 'function' ? d : () => !1),
    w = typeof d == 'function' ? C : d,
    x = l.useRef(!1),
    { escapeKey: S, outsidePress: k } = IS(b),
    R = l.useRef(null),
    M = bt(),
    j = bt(),
    P = ne(() => {
      ;(j.clear(), (c.current.insideReactTree = !1))
    }),
    I = l.useRef(!1),
    T = l.useRef(''),
    O = ne((V) => {
      T.current = V.pointerType
    }),
    L = ne(() => {
      const V = T.current,
        Z = V === 'pen' || !V ? 'mouse' : V,
        K = typeof g == 'function' ? g() : g
      return typeof K == 'string' ? K : K[Z]
    }),
    A = ne((V) => {
      if (!r || !u || !f || V.key !== 'Escape' || I.current) return
      const Z = c.current.floatingContext?.nodeId,
        K = v ? lr(v.nodesRef.current, Z) : []
      if (!S && K.length > 0) {
        let U = !0
        if (
          (K.forEach((B) => {
            B.context?.open && !B.context.dataRef.current.__escapeKeyBubbles && (U = !1)
          }),
          !U)
        )
          return
      }
      const xe = zw(V) ? V.nativeEvent : V,
        N = ge(Bo, xe)
      ;(n.setOpen(!1, N), !S && !N.isPropagationAllowed && V.stopPropagation())
    }),
    z = ne((V) => {
      const Z = L()
      return (Z === 'intentional' && V.type !== 'click') || (Z === 'sloppy' && V.type === 'click')
    }),
    D = ne(() => {
      ;((c.current.insideReactTree = !0), j.start(0, P))
    }),
    $ = ne((V, Z = !1) => {
      if (z(V)) {
        P()
        return
      }
      if (c.current.insideReactTree) {
        P()
        return
      }
      if ((L() === 'intentional' && Z) || (typeof w == 'function' && !w(V))) return
      const K = Ge(V),
        xe = `[${Xr('inert')}]`,
        N = ke(n.select('floatingElement')).querySelectorAll(xe),
        U = n.context.triggerElements
      if (K && (U.hasElement(K) || U.hasMatchingElement((J) => be(J, K)))) return
      let B = je(K) ? K : null
      for (; B && !pn(B); ) {
        const J = bn(B)
        if (pn(J) || !je(J)) break
        B = J
      }
      if (
        N.length &&
        je(K) &&
        !Aw(K) &&
        !be(K, n.select('floatingElement')) &&
        Array.from(N).every((J) => !be(B, J))
      )
        return
      if (Ze(K) && !('touches' in V)) {
        const J = pn(K),
          fe = Nt(K),
          we = /auto|scroll/,
          Ae = J || we.test(fe.overflowX),
          st = J || we.test(fe.overflowY),
          He = Ae && K.clientWidth > 0 && K.scrollWidth > K.clientWidth,
          Ee = st && K.clientHeight > 0 && K.scrollHeight > K.clientHeight,
          _e = fe.direction === 'rtl',
          tt = Ee && (_e ? V.offsetX <= K.offsetWidth - K.clientWidth : V.offsetX > K.clientWidth),
          Qe = He && V.offsetY > K.clientHeight
        if (tt || Qe) return
      }
      const _ = c.current.floatingContext?.nodeId,
        H = v && lr(v.nodesRef.current, _).some((J) => Gt(V, J.context?.elements.floating))
      if (Gt(V, n.select('floatingElement')) || Gt(V, n.select('domReferenceElement')) || H) return
      const W = v ? lr(v.nodesRef.current, _) : []
      if (W.length > 0) {
        let J = !0
        if (
          (W.forEach((fe) => {
            fe.context?.open && !fe.context.dataRef.current.__outsidePressBubbles && (J = !1)
          }),
          !J)
        )
          return
      }
      ;(n.setOpen(!1, ge(gi, V)), P())
    }),
    F = ne((V) => {
      L() !== 'sloppy' ||
        V.pointerType === 'touch' ||
        !n.select('open') ||
        !u ||
        Gt(V, n.select('floatingElement')) ||
        Gt(V, n.select('domReferenceElement')) ||
        $(V)
    }),
    Q = ne((V) => {
      if (
        L() !== 'sloppy' ||
        !n.select('open') ||
        !u ||
        Gt(V, n.select('floatingElement')) ||
        Gt(V, n.select('domReferenceElement'))
      )
        return
      const Z = V.touches[0]
      Z &&
        ((R.current = {
          startTime: Date.now(),
          startX: Z.clientX,
          startY: Z.clientY,
          dismissOnTouchEnd: !1,
          dismissOnMouseDown: !0,
        }),
        M.start(1e3, () => {
          R.current && ((R.current.dismissOnTouchEnd = !1), (R.current.dismissOnMouseDown = !1))
        }))
    }),
    q = ne((V) => {
      const Z = Ge(V)
      function K() {
        ;(Q(V), Z?.removeEventListener(V.type, K))
      }
      Z?.addEventListener(V.type, K)
    }),
    se = ne((V) => {
      const Z = x.current
      if (
        ((x.current = !1),
        M.clear(),
        V.type === 'mousedown' && R.current && !R.current.dismissOnMouseDown)
      )
        return
      const K = Ge(V)
      function xe() {
        ;(V.type === 'pointerdown' ? F(V) : $(V, Z), K?.removeEventListener(V.type, xe))
      }
      K?.addEventListener(V.type, xe)
    }),
    Y = ne((V) => {
      if (
        L() !== 'sloppy' ||
        !R.current ||
        Gt(V, n.select('floatingElement')) ||
        Gt(V, n.select('domReferenceElement'))
      )
        return
      const Z = V.touches[0]
      if (!Z) return
      const K = Math.abs(Z.clientX - R.current.startX),
        xe = Math.abs(Z.clientY - R.current.startY),
        N = Math.sqrt(K * K + xe * xe)
      ;(N > 5 && (R.current.dismissOnTouchEnd = !0),
        N > 10 && ($(V), M.clear(), (R.current = null)))
    }),
    oe = ne((V) => {
      const Z = Ge(V)
      function K() {
        ;(Y(V), Z?.removeEventListener(V.type, K))
      }
      Z?.addEventListener(V.type, K)
    }),
    te = ne((V) => {
      L() !== 'sloppy' ||
        !R.current ||
        Gt(V, n.select('floatingElement')) ||
        Gt(V, n.select('domReferenceElement')) ||
        (R.current.dismissOnTouchEnd && $(V), M.clear(), (R.current = null))
    }),
    le = ne((V) => {
      const Z = Ge(V)
      function K() {
        ;(te(V), Z?.removeEventListener(V.type, K))
      }
      Z?.addEventListener(V.type, K)
    })
  ;(l.useEffect(() => {
    if (!r || !u) return
    ;((c.current.__escapeKeyBubbles = S), (c.current.__outsidePressBubbles = k))
    const V = new _t()
    function Z(B) {
      n.setOpen(!1, ge(Et, B))
    }
    function K() {
      ;(V.clear(), (I.current = !0))
    }
    function xe() {
      V.start(yi() ? 5 : 0, () => {
        I.current = !1
      })
    }
    const N = ke(o)
    ;(N.addEventListener('pointerdown', O, !0),
      f &&
        (N.addEventListener('keydown', A),
        N.addEventListener('compositionstart', K),
        N.addEventListener('compositionend', xe)),
      w &&
        (N.addEventListener('click', se, !0),
        N.addEventListener('pointerdown', se, !0),
        N.addEventListener('touchstart', q, !0),
        N.addEventListener('touchmove', oe, !0),
        N.addEventListener('touchend', le, !0),
        N.addEventListener('mousedown', se, !0)))
    let U = []
    return (
      p &&
        (je(i) && (U = jn(i)),
        je(o) && (U = U.concat(jn(o))),
        !je(s) && s && s.contextElement && (U = U.concat(jn(s.contextElement)))),
      (U = U.filter((B) => B !== N.defaultView?.visualViewport)),
      U.forEach((B) => {
        B.addEventListener('scroll', Z, { passive: !0 })
      }),
      () => {
        ;(N.removeEventListener('pointerdown', O, !0),
          f &&
            (N.removeEventListener('keydown', A),
            N.removeEventListener('compositionstart', K),
            N.removeEventListener('compositionend', xe)),
          w &&
            (N.removeEventListener('click', se, !0),
            N.removeEventListener('pointerdown', se, !0),
            N.removeEventListener('touchstart', q, !0),
            N.removeEventListener('touchmove', oe, !0),
            N.removeEventListener('touchend', le, !0),
            N.removeEventListener('mousedown', se, !0)),
          U.forEach((B) => {
            B.removeEventListener('scroll', Z)
          }),
          V.clear(),
          (x.current = !1))
      }
    )
  }, [c, o, s, i, f, w, r, a, p, u, S, k, A, $, se, F, q, oe, le, O, n]),
    l.useEffect(P, [w, P]))
  const ve = l.useMemo(
      () => ({
        onKeyDown: A,
        ...(h && {
          [kS[m]]: (V) => {
            n.setOpen(!1, ge(dr, V.nativeEvent))
          },
          ...(m !== 'intentional' && {
            onClick(V) {
              n.setOpen(!1, ge(dr, V.nativeEvent))
            },
          }),
        }),
      }),
      [A, n, h, m],
    ),
    X = ne((V) => {
      const Z = Ge(V.nativeEvent)
      !be(n.select('floatingElement'), Z) || V.button !== 0 || (x.current = !0)
    }),
    me = ne((V) => {
      !r || !u || V.button !== 0 || (x.current = !0)
    }),
    he = l.useMemo(
      () => ({
        onKeyDown: A,
        onPointerDown: X,
        onMouseDown: X,
        onMouseUp: X,
        onClickCapture: D,
        onMouseDownCapture(V) {
          ;(D(), me(V))
        },
        onPointerDownCapture(V) {
          ;(D(), me(V))
        },
        onMouseUpCapture: D,
        onTouchEndCapture: D,
        onTouchMoveCapture: D,
      }),
      [A, X, D, me],
    )
  return l.useMemo(() => (u ? { reference: ve, floating: he, trigger: ve } : {}), [u, ve, he])
}
var ei = Symbol('NOT_FOUND')
function TS(e, t = `expected a function, instead received ${typeof e}`) {
  if (typeof e != 'function') throw new TypeError(t)
}
function PS(e, t = 'expected all items to be functions, instead received the following types: ') {
  if (!e.every((n) => typeof n == 'function')) {
    const n = e
      .map((r) => (typeof r == 'function' ? `function ${r.name || 'unnamed'}()` : typeof r))
      .join(', ')
    throw new TypeError(`${t}[${n}]`)
  }
}
var od = (e) => (Array.isArray(e) ? e : [e])
function OS(e) {
  const t = Array.isArray(e[0]) ? e[0] : e
  return (
    PS(
      t,
      'createSelector expects all input-selectors to be functions, but received the following types: ',
    ),
    t
  )
}
function MS(e, t) {
  const n = [],
    { length: r } = e
  for (let o = 0; o < r; o++) n.push(e[o].apply(null, t))
  return n
}
function AS(e) {
  let t
  return {
    get(n) {
      return t && e(t.key, n) ? t.value : ei
    },
    put(n, r) {
      t = { key: n, value: r }
    },
    getEntries() {
      return t ? [t] : []
    },
    clear() {
      t = void 0
    },
  }
}
function zS(e, t) {
  let n = []
  function r(a) {
    const c = n.findIndex((u) => t(a, u.key))
    if (c > -1) {
      const u = n[c]
      return (c > 0 && (n.splice(c, 1), n.unshift(u)), u.value)
    }
    return ei
  }
  function o(a, c) {
    r(a) === ei && (n.unshift({ key: a, value: c }), n.length > e && n.pop())
  }
  function s() {
    return n
  }
  function i() {
    n = []
  }
  return { get: r, put: o, getEntries: s, clear: i }
}
var LS = (e, t) => e === t
function jS(e) {
  return function (n, r) {
    if (n === null || r === null || n.length !== r.length) return !1
    const { length: o } = n
    for (let s = 0; s < o; s++) if (!e(n[s], r[s])) return !1
    return !0
  }
}
function DS(e, t) {
  const n = typeof t == 'object' ? t : { equalityCheck: t },
    { equalityCheck: r = LS, maxSize: o = 1, resultEqualityCheck: s } = n,
    i = jS(r)
  let a = 0
  const c = o <= 1 ? AS(i) : zS(o, i)
  function u() {
    let f = c.get(arguments)
    if (f === ei) {
      if (((f = e.apply(null, arguments)), a++, s)) {
        const g = c.getEntries().find((h) => s(h.value, f))
        g && ((f = g.value), a !== 0 && a--)
      }
      c.put(arguments, f)
    }
    return f
  }
  return (
    (u.clearCache = () => {
      ;(c.clear(), u.resetResultsCount())
    }),
    (u.resultsCount = () => a),
    (u.resetResultsCount = () => {
      a = 0
    }),
    u
  )
}
var NS = class {
    constructor(e) {
      this.value = e
    }
    deref() {
      return this.value
    }
  },
  _S = () => (typeof WeakRef > 'u' ? NS : WeakRef),
  Fg = _S(),
  FS = 0,
  sd = 1
function ms() {
  return { s: FS, v: void 0, o: null, p: null }
}
function $S(e) {
  return e instanceof Fg ? e.deref() : e
}
function VS(e, t = {}) {
  let n = ms()
  const { resultEqualityCheck: r } = t
  let o,
    s = 0
  function i() {
    let a = n
    const { length: c } = arguments
    for (let d = 0, g = c; d < g; d++) {
      const h = arguments[d]
      if (typeof h == 'function' || (typeof h == 'object' && h !== null)) {
        let m = a.o
        m === null && (a.o = m = new WeakMap())
        const p = m.get(h)
        p === void 0 ? ((a = ms()), m.set(h, a)) : (a = p)
      } else {
        let m = a.p
        m === null && (a.p = m = new Map())
        const p = m.get(h)
        p === void 0 ? ((a = ms()), m.set(h, a)) : (a = p)
      }
    }
    const u = a
    let f
    if (a.s === sd) f = a.v
    else if (((f = e.apply(null, arguments)), s++, r)) {
      const d = $S(o)
      ;(d != null && r(d, f) && ((f = d), s !== 0 && s--),
        (o = (typeof f == 'object' && f !== null) || typeof f == 'function' ? new Fg(f) : f))
    }
    return ((u.s = sd), (u.v = f), f)
  }
  return (
    (i.clearCache = () => {
      ;((n = ms()), i.resetResultsCount())
    }),
    (i.resultsCount = () => s),
    (i.resetResultsCount = () => {
      s = 0
    }),
    i
  )
}
function HS(e, ...t) {
  const n = typeof e == 'function' ? { memoize: e, memoizeOptions: t } : e,
    r = (...o) => {
      let s = 0,
        i = 0,
        a,
        c = {},
        u = o.pop()
      ;(typeof u == 'object' && ((c = u), (u = o.pop())),
        TS(
          u,
          `createSelector expects an output function after the inputs, but received: [${typeof u}]`,
        ))
      const f = { ...n, ...c },
        { memoize: d, memoizeOptions: g = [], argsMemoize: h = VS, argsMemoizeOptions: m = [] } = f,
        p = od(g),
        b = od(m),
        y = OS(o),
        v = d(
          function () {
            return (s++, u.apply(null, arguments))
          },
          ...p,
        ),
        C = h(
          function () {
            i++
            const x = MS(y, arguments)
            return ((a = v.apply(null, x)), a)
          },
          ...b,
        )
      return Object.assign(C, {
        resultFunc: u,
        memoizedResultFunc: v,
        dependencies: y,
        dependencyRecomputations: () => i,
        resetDependencyRecomputations: () => {
          i = 0
        },
        lastResult: () => a,
        recomputations: () => s,
        resetRecomputations: () => {
          s = 0
        },
        memoize: d,
        argsMemoize: h,
      })
    }
  return (Object.assign(r, { withTypes: () => r }), r)
}
const BS = HS({ memoize: DS, memoizeOptions: { maxSize: 1, equalityCheck: Object.is } }),
  G = (e, t, n, r, o, s, ...i) => {
    if (i.length > 0) throw new Error(Ve(1))
    let a
    if (e && t && n && r && o && s)
      a = (c, u, f, d) => {
        const g = e(c, u, f, d),
          h = t(c, u, f, d),
          m = n(c, u, f, d),
          p = r(c, u, f, d),
          b = o(c, u, f, d)
        return s(g, h, m, p, b, u, f, d)
      }
    else if (e && t && n && r && o)
      a = (c, u, f, d) => {
        const g = e(c, u, f, d),
          h = t(c, u, f, d),
          m = n(c, u, f, d),
          p = r(c, u, f, d)
        return o(g, h, m, p, u, f, d)
      }
    else if (e && t && n && r)
      a = (c, u, f, d) => {
        const g = e(c, u, f, d),
          h = t(c, u, f, d),
          m = n(c, u, f, d)
        return r(g, h, m, u, f, d)
      }
    else if (e && t && n)
      a = (c, u, f, d) => {
        const g = e(c, u, f, d),
          h = t(c, u, f, d)
        return n(g, h, u, f, d)
      }
    else if (e && t)
      a = (c, u, f, d) => {
        const g = e(c, u, f, d)
        return t(g, u, f, d)
      }
    else if (e) a = e
    else throw new Error('Missing arguments')
    return a
  },
  WS = (...e) => {
    const t = new WeakMap()
    let n = 1
    const r = e[e.length - 1],
      o = e.length - 1 || 1,
      s = r.length - o
    if (s > 3) throw new Error(Ve(2))
    return (a, c, u, f) => {
      let d = a.__cacheKey__
      d || ((d = { id: n }), (a.__cacheKey__ = d), (n += 1))
      let g = t.get(d)
      if (!g) {
        let h = e
        const m = [void 0, void 0, void 0]
        switch (s) {
          case 0:
            break
          case 1: {
            h = [...e.slice(0, -1), () => m[0], r]
            break
          }
          case 2: {
            h = [...e.slice(0, -1), () => m[0], () => m[1], r]
            break
          }
          case 3: {
            h = [...e.slice(0, -1), () => m[0], () => m[1], () => m[2], r]
            break
          }
          default:
            throw new Error(Ve(2))
        }
        ;((g = BS(...h)), (g.selectorArgs = m), t.set(d, g))
      }
      switch (((g.selectorArgs[0] = c), (g.selectorArgs[1] = u), (g.selectorArgs[2] = f), s)) {
        case 0:
          return g(a)
        case 1:
          return g(a, c)
        case 2:
          return g(a, c, u)
        case 3:
          return g(a, c, u, f)
        default:
          throw new Error('unreachable')
      }
    }
  }
var ua = { exports: {} },
  da = {}
var id
function GS() {
  if (id) return da
  id = 1
  var e = Gf()
  function t(d, g) {
    return (d === g && (d !== 0 || 1 / d === 1 / g)) || (d !== d && g !== g)
  }
  var n = typeof Object.is == 'function' ? Object.is : t,
    r = e.useState,
    o = e.useEffect,
    s = e.useLayoutEffect,
    i = e.useDebugValue
  function a(d, g) {
    var h = g(),
      m = r({ inst: { value: h, getSnapshot: g } }),
      p = m[0].inst,
      b = m[1]
    return (
      s(
        function () {
          ;((p.value = h), (p.getSnapshot = g), c(p) && b({ inst: p }))
        },
        [d, h, g],
      ),
      o(
        function () {
          return (
            c(p) && b({ inst: p }),
            d(function () {
              c(p) && b({ inst: p })
            })
          )
        },
        [d],
      ),
      i(h),
      h
    )
  }
  function c(d) {
    var g = d.getSnapshot
    d = d.value
    try {
      var h = g()
      return !n(d, h)
    } catch {
      return !0
    }
  }
  function u(d, g) {
    return g()
  }
  var f =
    typeof window > 'u' ||
    typeof window.document > 'u' ||
    typeof window.document.createElement > 'u'
      ? u
      : a
  return (
    (da.useSyncExternalStore = e.useSyncExternalStore !== void 0 ? e.useSyncExternalStore : f),
    da
  )
}
var ad
function $g() {
  return (ad || ((ad = 1), (ua.exports = GS())), ua.exports)
}
var Vg = $g(),
  fa = { exports: {} },
  pa = {}
var ld
function US() {
  if (ld) return pa
  ld = 1
  var e = Gf(),
    t = $g()
  function n(u, f) {
    return (u === f && (u !== 0 || 1 / u === 1 / f)) || (u !== u && f !== f)
  }
  var r = typeof Object.is == 'function' ? Object.is : n,
    o = t.useSyncExternalStore,
    s = e.useRef,
    i = e.useEffect,
    a = e.useMemo,
    c = e.useDebugValue
  return (
    (pa.useSyncExternalStoreWithSelector = function (u, f, d, g, h) {
      var m = s(null)
      if (m.current === null) {
        var p = { hasValue: !1, value: null }
        m.current = p
      } else p = m.current
      m = a(
        function () {
          function y(S) {
            if (!v) {
              if (((v = !0), (C = S), (S = g(S)), h !== void 0 && p.hasValue)) {
                var k = p.value
                if (h(k, S)) return (w = k)
              }
              return (w = S)
            }
            if (((k = w), r(C, S))) return k
            var R = g(S)
            return h !== void 0 && h(k, R) ? ((C = S), k) : ((C = S), (w = R))
          }
          var v = !1,
            C,
            w,
            x = d === void 0 ? null : d
          return [
            function () {
              return y(f())
            },
            x === null
              ? void 0
              : function () {
                  return y(x())
                },
          ]
        },
        [f, d, g, h],
      )
      var b = o(u, m[0], m[1])
      return (
        i(
          function () {
            ;((p.hasValue = !0), (p.value = b))
          },
          [b],
        ),
        c(b),
        b
      )
    }),
    pa
  )
}
var cd
function ZS() {
  return (cd || ((cd = 1), (fa.exports = US())), fa.exports)
}
var KS = ZS()
const Ja = []
let Qa
function YS() {
  return Qa
}
function qS(e) {
  Ja.push(e)
}
function Jl(e) {
  const t = (n, r) => {
    const o = ot(XS).current
    let s
    try {
      Qa = o
      for (const i of Ja) i.before(o)
      s = e(n, r)
      for (const i of Ja) i.after(o)
      o.didInitialize = !0
    } finally {
      Qa = void 0
    }
    return s
  }
  return ((t.displayName = e.displayName || e.name), t)
}
function Hg(e) {
  return l.forwardRef(Jl(e))
}
function XS() {
  return { didInitialize: !1 }
}
const JS = Al(19),
  QS = JS ? tE : nE
function re(e, t, n, r, o) {
  return QS(e, t, n, r, o)
}
function eE(e, t, n, r, o) {
  const s = l.useCallback(() => t(e.getSnapshot(), n, r, o), [e, t, n, r, o])
  return Vg.useSyncExternalStore(e.subscribe, s, s)
}
qS({
  before(e) {
    ;((e.syncIndex = 0),
      e.didInitialize ||
        ((e.syncTick = 1),
        (e.syncHooks = []),
        (e.didChangeStore = !0),
        (e.getSnapshot = () => {
          let t = !1
          for (let n = 0; n < e.syncHooks.length; n += 1) {
            const r = e.syncHooks[n],
              o = r.selector(r.store.state, r.a1, r.a2, r.a3)
            ;(r.didChange || !Object.is(r.value, o)) &&
              ((t = !0), (r.value = o), (r.didChange = !1))
          }
          return (t && (e.syncTick += 1), e.syncTick)
        })))
  },
  after(e) {
    e.syncHooks.length > 0 &&
      (e.didChangeStore &&
        ((e.didChangeStore = !1),
        (e.subscribe = (t) => {
          const n = new Set()
          for (const o of e.syncHooks) n.add(o.store)
          const r = []
          for (const o of n) r.push(o.subscribe(t))
          return () => {
            for (const o of r) o()
          }
        })),
      Vg.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot))
  },
})
function tE(e, t, n, r, o) {
  const s = YS()
  if (!s) return eE(e, t, n, r, o)
  const i = s.syncIndex
  s.syncIndex += 1
  let a
  return (
    s.didInitialize
      ? ((a = s.syncHooks[i]),
        (a.store !== e ||
          a.selector !== t ||
          !Object.is(a.a1, n) ||
          !Object.is(a.a2, r) ||
          !Object.is(a.a3, o)) &&
          (a.store !== e && (s.didChangeStore = !0),
          (a.store = e),
          (a.selector = t),
          (a.a1 = n),
          (a.a2 = r),
          (a.a3 = o),
          (a.didChange = !0)))
      : ((a = {
          store: e,
          selector: t,
          a1: n,
          a2: r,
          a3: o,
          value: t(e.getSnapshot(), n, r, o),
          didChange: !1,
        }),
        s.syncHooks.push(a)),
    a.value
  )
}
function nE(e, t, n, r, o) {
  return KS.useSyncExternalStoreWithSelector(e.subscribe, e.getSnapshot, e.getSnapshot, (s) =>
    t(s, n, r, o),
  )
}
class Bg {
  constructor(t) {
    ;((this.state = t), (this.listeners = new Set()), (this.updateTick = 0))
  }
  subscribe = (t) => (
    this.listeners.add(t),
    () => {
      this.listeners.delete(t)
    }
  )
  getSnapshot = () => this.state
  setState(t) {
    if (this.state === t) return
    ;((this.state = t), (this.updateTick += 1))
    const n = this.updateTick
    for (const r of this.listeners) {
      if (n !== this.updateTick) return
      r(t)
    }
  }
  update(t) {
    for (const n in t)
      if (!Object.is(this.state[n], t[n])) {
        this.setState({ ...this.state, ...t })
        return
      }
  }
  set(t, n) {
    Object.is(this.state[t], n) || this.setState({ ...this.state, [t]: n })
  }
  notifyAll() {
    const t = { ...this.state }
    this.setState(t)
  }
  use(t, n, r, o) {
    return re(this, t, n, r, o)
  }
}
class Ko extends Bg {
  constructor(t, n = {}, r) {
    ;(super(t), (this.context = n), (this.selectors = r))
  }
  useSyncedValue(t, n) {
    ;(l.useDebugValue(t),
      ae(() => {
        this.state[t] !== n && this.set(t, n)
      }, [t, n]))
  }
  useSyncedValueWithCleanup(t, n) {
    const r = this
    ae(
      () => (
        r.state[t] !== n && r.set(t, n),
        () => {
          r.set(t, void 0)
        }
      ),
      [r, t, n],
    )
  }
  useSyncedValues(t) {
    const n = this,
      r = Object.values(t)
    ae(() => {
      n.update(t)
    }, [n, ...r])
  }
  useControlledProp(t, n) {
    l.useDebugValue(t)
    const r = n !== void 0
    ae(() => {
      r && !Object.is(this.state[t], n) && super.setState({ ...this.state, [t]: n })
    }, [t, n, r])
  }
  select(t, n, r, o) {
    const s = this.selectors[t]
    return s(this.state, n, r, o)
  }
  useState(t, n, r, o) {
    return (l.useDebugValue(t), re(this, this.selectors[t], n, r, o))
  }
  useContextCallback(t, n) {
    l.useDebugValue(t)
    const r = ne(n ?? Ue)
    this.context[t] = r
  }
  useStateSetter(t) {
    const n = l.useRef(void 0)
    return (
      n.current === void 0 &&
        (n.current = (r) => {
          this.set(t, r)
        }),
      n.current
    )
  }
  observe(t, n) {
    let r
    typeof t == 'function' ? (r = t) : (r = this.selectors[t])
    let o = r(this.state)
    return (
      n(o, o, this),
      this.subscribe((s) => {
        const i = r(s)
        if (!Object.is(o, i)) {
          const a = o
          ;((o = i), n(i, a, this))
        }
      })
    )
  }
}
const rE = {
  open: G((e) => e.open),
  domReferenceElement: G((e) => e.domReferenceElement),
  referenceElement: G((e) => e.positionReference ?? e.referenceElement),
  floatingElement: G((e) => e.floatingElement),
  floatingId: G((e) => e.floatingId),
}
class Ql extends Ko {
  constructor(t) {
    const { nested: n, noEmit: r, onOpenChange: o, triggerElements: s, ...i } = t
    super(
      { ...i, positionReference: i.referenceElement, domReferenceElement: i.referenceElement },
      {
        onOpenChange: o,
        dataRef: { current: {} },
        events: Cg(),
        nested: n,
        noEmit: r,
        triggerElements: s,
      },
      rE,
    )
  }
  setOpen = (t, n) => {
    if (
      ((!t || !this.state.open || tg(n.event)) &&
        (this.context.dataRef.current.openEvent = t ? n.event : void 0),
      !this.context.noEmit)
    ) {
      const r = {
        open: t,
        reason: n.reason,
        nativeEvent: n.event,
        nested: this.context.nested,
        triggerElement: n.trigger,
      }
      this.context.events.emit('openchange', r)
    }
    this.context.onOpenChange?.(t, n)
  }
}
function Wg(e, t) {
  const n = l.useRef(null),
    r = l.useRef(null)
  return l.useCallback(
    (o) => {
      if (e !== void 0) {
        if (n.current !== null) {
          const s = n.current,
            i = r.current,
            a = t.context.triggerElements.getById(s)
          ;(i && a === i && t.context.triggerElements.delete(s),
            (n.current = null),
            (r.current = null))
        }
        o !== null && ((n.current = e), (r.current = o), t.context.triggerElements.add(e, o))
      }
    },
    [t, e],
  )
}
function Gg(e, t, n, r) {
  const o = n.useState('isMountedByTrigger', e),
    s = Wg(e, n),
    i = ne((a) => {
      if ((s(a), !a || !n.select('open'))) return
      const c = n.select('activeTriggerId')
      if (c === e) {
        n.update({ activeTriggerElement: a, ...r })
        return
      }
      c == null && n.update({ activeTriggerId: e, activeTriggerElement: a, ...r })
    })
  return (
    ae(() => {
      o && n.update({ activeTriggerElement: t.current, ...r })
    }, [o, n, t, ...Object.values(r)]),
    { registerTrigger: i, isMountedByThisTrigger: o }
  )
}
function ec(e) {
  const t = e.useState('open')
  ae(() => {
    if (t && !e.select('activeTriggerId') && e.context.triggerElements.size === 1) {
      const n = e.context.triggerElements.entries().next()
      if (!n.done) {
        const [r, o] = n.value
        e.update({ activeTriggerId: r, activeTriggerElement: o })
      }
    }
  }, [t, e])
}
function tc(e, t, n) {
  const { mounted: r, setMounted: o, transitionStatus: s } = Dl(e)
  t.useSyncedValues({ mounted: r, transitionStatus: s })
  const i = ne(() => {
      ;(o(!1),
        t.update({ activeTriggerId: null, activeTriggerElement: null, mounted: !1 }),
        n?.(),
        t.context.onOpenChangeComplete?.(!1))
    }),
    a = t.useState('preventUnmountingOnClose')
  return (
    Kn({
      enabled: !a,
      open: e,
      ref: t.context.popupRef,
      onComplete() {
        e || i()
      },
    }),
    { forceUnmount: i, transitionStatus: s }
  )
}
class Yo {
  constructor() {
    ;((this.elementsSet = new Set()), (this.idMap = new Map()))
  }
  add(t, n) {
    const r = this.idMap.get(t)
    r !== n &&
      (r !== void 0 && this.elementsSet.delete(r), this.elementsSet.add(n), this.idMap.set(t, n))
  }
  delete(t) {
    const n = this.idMap.get(t)
    n && (this.elementsSet.delete(n), this.idMap.delete(t))
  }
  hasElement(t) {
    return this.elementsSet.has(t)
  }
  hasMatchingElement(t) {
    for (const n of this.elementsSet) if (t(n)) return !0
    return !1
  }
  getById(t) {
    return this.idMap.get(t)
  }
  entries() {
    return this.idMap.entries()
  }
  elements() {
    return this.elementsSet.values()
  }
  get size() {
    return this.idMap.size
  }
}
function oE() {
  return new Ql({
    open: !1,
    floatingElement: null,
    referenceElement: null,
    triggerElements: new Yo(),
    floatingId: '',
    nested: !1,
    noEmit: !1,
    onOpenChange: void 0,
  })
}
function nc() {
  return {
    open: !1,
    openProp: void 0,
    mounted: !1,
    transitionStatus: 'idle',
    floatingRootContext: oE(),
    preventUnmountingOnClose: !1,
    payload: void 0,
    activeTriggerId: null,
    activeTriggerElement: null,
    triggerIdProp: void 0,
    popupElement: null,
    positionerElement: null,
    activeTriggerProps: Ke,
    inactiveTriggerProps: Ke,
    popupProps: Ke,
  }
}
const hs = G((e) => e.triggerIdProp ?? e.activeTriggerId),
  rc = {
    open: G((e) => e.openProp ?? e.open),
    mounted: G((e) => e.mounted),
    transitionStatus: G((e) => e.transitionStatus),
    floatingRootContext: G((e) => e.floatingRootContext),
    preventUnmountingOnClose: G((e) => e.preventUnmountingOnClose),
    payload: G((e) => e.payload),
    activeTriggerId: hs,
    activeTriggerElement: G((e) => (e.mounted ? e.activeTriggerElement : null)),
    isTriggerActive: G((e, t) => t !== void 0 && hs(e) === t),
    isOpenedByTrigger: G((e, t) => t !== void 0 && hs(e) === t && e.open),
    isMountedByTrigger: G((e, t) => t !== void 0 && hs(e) === t && e.mounted),
    triggerProps: G((e, t) => (t ? e.activeTriggerProps : e.inactiveTriggerProps)),
    popupProps: G((e) => e.popupProps),
    popupElement: G((e) => e.popupElement),
    positionerElement: G((e) => e.positionerElement),
  }
function Ug(e) {
  const { open: t = !1, onOpenChange: n, elements: r = {} } = e,
    o = nn(),
    s = En() != null,
    i = ot(
      () =>
        new Ql({
          open: t,
          onOpenChange: n,
          referenceElement: r.reference ?? null,
          floatingElement: r.floating ?? null,
          triggerElements: new Yo(),
          floatingId: o,
          nested: s,
          noEmit: !1,
        }),
    ).current
  return (
    ae(() => {
      const a = { open: t, floatingId: o }
      ;(r.reference !== void 0 &&
        ((a.referenceElement = r.reference),
        (a.domReferenceElement = je(r.reference) ? r.reference : null)),
        r.floating !== void 0 && (a.floatingElement = r.floating),
        i.update(a))
    }, [t, o, r.reference, r.floating, i]),
    (i.context.onOpenChange = n),
    (i.context.nested = s),
    (i.context.noEmit = !1),
    i
  )
}
function sE(e = {}) {
  const { nodeId: t, externalTree: n } = e,
    r = Ug(e),
    o = e.rootContext || r,
    s = {
      reference: o.useState('referenceElement'),
      floating: o.useState('floatingElement'),
      domReference: o.useState('domReferenceElement'),
    },
    [i, a] = l.useState(null),
    c = l.useRef(null),
    u = Yn(n)
  ae(() => {
    s.domReference && (c.current = s.domReference)
  }, [s.domReference])
  const f = yS({ ...e, elements: { ...s, ...(i && { reference: i }) } }),
    d = l.useCallback(
      (k) => {
        const R = je(k)
          ? {
              getBoundingClientRect: () => k.getBoundingClientRect(),
              getClientRects: () => k.getClientRects(),
              contextElement: k,
            }
          : k
        ;(a(R), f.refs.setReference(R))
      },
      [f.refs],
    ),
    [g, h] = l.useState(null),
    [m, p] = l.useState(null)
  ;(o.useSyncedValue('referenceElement', g),
    o.useSyncedValue('domReferenceElement', je(g) ? g : null),
    o.useSyncedValue('floatingElement', m))
  const b = l.useCallback(
      (k) => {
        ;((je(k) || k === null) && ((c.current = k), h(k)),
          (je(f.refs.reference.current) ||
            f.refs.reference.current === null ||
            (k !== null && !je(k))) &&
            f.refs.setReference(k))
      },
      [f.refs, h],
    ),
    y = l.useCallback(
      (k) => {
        ;(p(k), f.refs.setFloating(k))
      },
      [f.refs],
    ),
    v = l.useMemo(
      () => ({
        ...f.refs,
        setReference: b,
        setFloating: y,
        setPositionReference: d,
        domReference: c,
      }),
      [f.refs, b, y, d],
    ),
    C = l.useMemo(
      () => ({ ...f.elements, domReference: s.domReference }),
      [f.elements, s.domReference],
    ),
    w = o.useState('open'),
    x = o.useState('floatingId'),
    S = l.useMemo(
      () => ({
        ...f,
        dataRef: o.context.dataRef,
        open: w,
        onOpenChange: o.setOpen,
        events: o.context.events,
        floatingId: x,
        refs: v,
        elements: C,
        nodeId: t,
        rootStore: o,
      }),
      [f, v, C, t, o, w, x],
    )
  return (
    ae(() => {
      o.context.dataRef.current.floatingContext = S
      const k = u?.nodesRef.current.find((R) => R.id === t)
      k && (k.context = S)
    }),
    l.useMemo(() => ({ ...f, context: S, refs: v, elements: C, rootStore: o }), [f, v, C, S, o])
  )
}
function oc(e) {
  const { popupStore: t, noEmit: n = !1, treatPopupAsFloatingElement: r = !1, onOpenChange: o } = e,
    s = nn(),
    i = En() != null,
    a = t.useState('open'),
    c = t.useState('activeTriggerElement'),
    u = t.useState(r ? 'popupElement' : 'positionerElement'),
    f = t.context.triggerElements,
    d = ot(
      () =>
        new Ql({
          open: a,
          referenceElement: c,
          floatingElement: u,
          triggerElements: f,
          onOpenChange: o,
          floatingId: s,
          nested: i,
          noEmit: n,
        }),
    ).current
  return (
    ae(() => {
      const g = { open: a, floatingId: s, referenceElement: c, floatingElement: u }
      ;(je(c) && (g.domReferenceElement = c),
        d.state.positionReference === d.state.referenceElement && (g.positionReference = c),
        d.update(g))
    }, [a, s, c, u, d]),
    (d.context.onOpenChange = o),
    (d.context.nested = i),
    (d.context.noEmit = n),
    d
  )
}
const ga = Tw && Kp
function Zg(e, t = {}) {
  const n = 'rootStore' in e ? e.rootStore : e,
    { events: r, dataRef: o } = n.context,
    { enabled: s = !0, delay: i } = t,
    a = l.useRef(!1),
    c = l.useRef(null),
    u = bt(),
    f = l.useRef(!0)
  ;(l.useEffect(() => {
    const g = n.select('domReferenceElement')
    if (!s) return
    const h = Ye(g)
    function m() {
      const y = n.select('domReferenceElement')
      !n.select('open') && Ze(y) && y === St(ke(y)) && (a.current = !0)
    }
    function p() {
      f.current = !0
    }
    function b() {
      f.current = !1
    }
    return (
      h.addEventListener('blur', m),
      ga && (h.addEventListener('keydown', p, !0), h.addEventListener('pointerdown', b, !0)),
      () => {
        ;(h.removeEventListener('blur', m),
          ga &&
            (h.removeEventListener('keydown', p, !0), h.removeEventListener('pointerdown', b, !0)))
      }
    )
  }, [n, s]),
    l.useEffect(() => {
      if (!s) return
      function g(h) {
        if (h.reason === dr || h.reason === Bo) {
          const m = n.select('domReferenceElement')
          je(m) && ((c.current = m), (a.current = !0))
        }
      }
      return (
        r.on('openchange', g),
        () => {
          r.off('openchange', g)
        }
      )
    }, [r, s, n]))
  const d = l.useMemo(
    () => ({
      onMouseLeave() {
        ;((a.current = !1), (c.current = null))
      },
      onFocus(g) {
        const h = g.currentTarget
        if (a.current) {
          if (c.current === h) return
          ;((a.current = !1), (c.current = null))
        }
        const m = Ge(g.nativeEvent)
        if (je(m)) {
          if (ga && !g.relatedTarget) {
            if (!f.current && !wi(m)) return
          } else if (!Ws(m)) return
        }
        const p = Bs(g.relatedTarget, n.context.triggerElements),
          { nativeEvent: b, currentTarget: y } = g,
          v = typeof i == 'function' ? i() : i
        if ((n.select('open') && p) || v === 0 || v === void 0) {
          n.setOpen(!0, ge(Fr, b, y))
          return
        }
        u.start(v, () => {
          a.current || n.setOpen(!0, ge(Fr, b, y))
        })
      },
      onBlur(g) {
        ;((a.current = !1), (c.current = null))
        const h = g.relatedTarget,
          m = g.nativeEvent,
          p =
            je(h) && h.hasAttribute(Xr('focus-guard')) && h.getAttribute('data-type') === 'outside'
        u.start(0, () => {
          const b = n.select('domReferenceElement'),
            y = St(b ? b.ownerDocument : document)
          ;(!h && y === b) ||
            be(o.current.floatingContext?.refs.floating.current, y) ||
            be(b, y) ||
            p ||
            Bs(h ?? y, n.context.triggerElements) ||
            n.setOpen(!1, ge(Fr, m))
        })
      },
    }),
    [o, n, u, i],
  )
  return l.useMemo(() => (s ? { reference: d, trigger: d } : {}), [s, d])
}
const el = Xr('safe-polygon'),
  iE = `button,a,[role="button"],select,[tabindex]:not([tabindex="-1"]),${Jp}`
function aE(e) {
  return e ? !!e.closest(iE) : !1
}
class sc {
  constructor() {
    ;((this.pointerType = void 0),
      (this.interactedInside = !1),
      (this.handler = void 0),
      (this.blockMouseMove = !0),
      (this.performedPointerEventsMutation = !1),
      (this.unbindMouseMove = () => {}),
      (this.restTimeoutPending = !1),
      (this.openChangeTimeout = new _t()),
      (this.restTimeout = new _t()),
      (this.handleCloseOptions = void 0))
  }
  static create() {
    return new sc()
  }
  dispose = () => {
    ;(this.openChangeTimeout.clear(), this.restTimeout.clear())
  }
  disposeEffect = () => this.dispose
}
function Kg(e) {
  const t = ot(sc.create).current,
    n = e.context.dataRef.current
  return (
    n.hoverInteractionState || (n.hoverInteractionState = t),
    mi(n.hoverInteractionState.disposeEffect),
    n.hoverInteractionState
  )
}
const lE = new Set(['click', 'mousedown'])
function Yg(e, t = {}) {
  const n = 'rootStore' in e ? e.rootStore : e,
    r = n.useState('open'),
    o = n.useState('floatingElement'),
    s = n.useState('domReferenceElement'),
    { dataRef: i } = n.context,
    { enabled: a = !0, closeDelay: c = 0 } = t,
    u = Kg(n),
    f = Yn(),
    d = En(),
    g = ne(() =>
      u.interactedInside ? !0 : i.current.openEvent ? lE.has(i.current.openEvent.type) : !1,
    ),
    h = ne(() => {
      const C = i.current.openEvent?.type
      return C?.includes('mouse') && C !== 'mousedown'
    }),
    m = ne((C) => Bs(C, n.context.triggerElements)),
    p = l.useCallback(
      (C, w = !0) => {
        const x = cE(c, u.pointerType)
        x && !u.handler
          ? u.openChangeTimeout.start(x, () => n.setOpen(!1, ge(Ct, C)))
          : w && (u.openChangeTimeout.clear(), n.setOpen(!1, ge(Ct, C)))
      },
      [c, n, u],
    ),
    b = ne(() => {
      ;(u.unbindMouseMove(), (u.handler = void 0))
    }),
    y = ne(() => {
      if (u.performedPointerEventsMutation) {
        const C = ke(o).body
        ;((C.style.pointerEvents = ''),
          C.removeAttribute(el),
          (u.performedPointerEventsMutation = !1))
      }
    }),
    v = ne((C) => {
      const w = Ge(C)
      if (!aE(w)) {
        u.interactedInside = !1
        return
      }
      u.interactedInside = !0
    })
  ;(ae(() => {
    r ||
      ((u.pointerType = void 0), (u.restTimeoutPending = !1), (u.interactedInside = !1), b(), y())
  }, [r, u, b, y]),
    l.useEffect(
      () => () => {
        b()
      },
      [b],
    ),
    l.useEffect(() => y, [y]),
    ae(() => {
      if (a && r && u.handleCloseOptions?.blockPointerEvents && h() && je(s) && o) {
        u.performedPointerEventsMutation = !0
        const C = ke(o).body
        C.setAttribute(el, '')
        const w = s,
          x = o,
          S = f?.nodesRef.current.find((k) => k.id === d)?.context?.elements.floating
        return (
          S && (S.style.pointerEvents = ''),
          (C.style.pointerEvents = 'none'),
          (w.style.pointerEvents = 'auto'),
          (x.style.pointerEvents = 'auto'),
          () => {
            ;((C.style.pointerEvents = ''),
              (w.style.pointerEvents = ''),
              (x.style.pointerEvents = ''))
          }
        )
      }
    }, [a, r, s, o, u, h, f, d]),
    l.useEffect(() => {
      if (!a) return
      function C(k) {
        g() ||
          !i.current.floatingContext ||
          !n.select('open') ||
          m(k.relatedTarget) ||
          (y(), b(), g() || p(k))
      }
      function w(k) {
        ;(u.openChangeTimeout.clear(), y(), u.handler?.(k), b())
      }
      function x(k) {
        g() || p(k, !1)
      }
      const S = o
      return (
        S &&
          (S.addEventListener('mouseleave', C),
          S.addEventListener('mouseenter', w),
          S.addEventListener('mouseleave', x),
          S.addEventListener('pointerdown', v, !0)),
        () => {
          S &&
            (S.removeEventListener('mouseleave', C),
            S.removeEventListener('mouseenter', w),
            S.removeEventListener('mouseleave', x),
            S.removeEventListener('pointerdown', v, !0))
        }
      )
    }, [a, o, n, i, g, m, p, y, b, v, u]))
}
function cE(e, t) {
  return t && !pr(t) ? 0 : typeof e == 'function' ? e() : e
}
function ma(e) {
  return typeof e == 'function' ? e() : e
}
const uE = { current: null }
function ic(e, t = {}) {
  const n = 'rootStore' in e ? e.rootStore : e,
    { dataRef: r, events: o } = n.context,
    {
      enabled: s = !0,
      delay: i = 0,
      handleClose: a = null,
      mouseOnly: c = !1,
      restMs: u = 0,
      move: f = !0,
      triggerElementRef: d = uE,
      externalTree: g,
      isActiveTrigger: h = !0,
    } = t,
    m = Yn(g),
    p = Kg(n),
    b = ht(a),
    y = ht(i),
    v = ht(u),
    C = ht(s)
  h && (p.handleCloseOptions = b.current?.__options)
  const w = ne(() =>
      p.interactedInside
        ? !0
        : r.current.openEvent
          ? ['click', 'mousedown'].includes(r.current.openEvent.type)
          : !1,
    ),
    x = ne((j) => Bs(j, n.context.triggerElements)),
    S = l.useCallback(
      (j, P = !0) => {
        const I = Ms(y.current, 'close', p.pointerType)
        I && !p.handler
          ? p.openChangeTimeout.start(I, () => n.setOpen(!1, ge(Ct, j)))
          : P && (p.openChangeTimeout.clear(), n.setOpen(!1, ge(Ct, j)))
      },
      [y, n, p],
    ),
    k = ne(() => {
      ;(p.unbindMouseMove(), (p.handler = void 0))
    }),
    R = ne(() => {
      if (p.performedPointerEventsMutation) {
        const j = ke(n.select('domReferenceElement')).body
        ;((j.style.pointerEvents = ''),
          j.removeAttribute(el),
          (p.performedPointerEventsMutation = !1))
      }
    })
  l.useEffect(() => {
    if (!s) return
    function j(P) {
      P.open ||
        (p.openChangeTimeout.clear(),
        p.restTimeout.clear(),
        (p.blockMouseMove = !0),
        (p.restTimeoutPending = !1))
    }
    return (
      o.on('openchange', j),
      () => {
        o.off('openchange', j)
      }
    )
  }, [s, o, p])
  const M = ne((j) => {
    if (w() || !r.current.floatingContext || x(j.relatedTarget)) return
    const P = d.current
    b.current?.({
      ...r.current.floatingContext,
      tree: m,
      x: j.clientX,
      y: j.clientY,
      onClose() {
        ;(R(), k(), !w() && P === n.select('domReferenceElement') && S(j))
      },
    })(j)
  })
  return (
    l.useEffect(() => {
      if (!s) return
      const j = d.current ?? (h ? n.select('domReferenceElement') : null)
      if (!je(j)) return
      function P(O) {
        if (
          (p.openChangeTimeout.clear(),
          (p.blockMouseMove = !1),
          (c && !pr(p.pointerType)) || (ma(v.current) > 0 && !Ms(y.current, 'open')))
        )
          return
        const L = Ms(y.current, 'open', p.pointerType),
          A = n.select('domReferenceElement'),
          z = n.context.triggerElements,
          D =
            (z.hasElement(O.target) || z.hasMatchingElement((q) => be(q, O.target))) &&
            (!A || !be(A, O.target)),
          $ = O.currentTarget ?? null,
          F = n.select('open'),
          Q = !F || D
        D && F
          ? n.setOpen(!0, ge(Ct, O, $))
          : L
            ? p.openChangeTimeout.start(L, () => {
                Q && n.setOpen(!0, ge(Ct, O, $))
              })
            : Q && n.setOpen(!0, ge(Ct, O, $))
      }
      function I(O) {
        if (w()) {
          R()
          return
        }
        p.unbindMouseMove()
        const L = n.select('domReferenceElement'),
          A = ke(L)
        if ((p.restTimeout.clear(), (p.restTimeoutPending = !1), x(O.relatedTarget))) return
        if (b.current && r.current.floatingContext) {
          n.select('open') || p.openChangeTimeout.clear()
          const D = d.current
          p.handler = b.current({
            ...r.current.floatingContext,
            tree: m,
            x: O.clientX,
            y: O.clientY,
            onClose() {
              ;(R(), k(), C.current && !w() && D === n.select('domReferenceElement') && S(O, !0))
            },
          })
          const $ = p.handler
          ;($(O),
            A.addEventListener('mousemove', $),
            (p.unbindMouseMove = () => {
              A.removeEventListener('mousemove', $)
            }))
          return
        }
        ;(p.pointerType !== 'touch' || !be(n.select('floatingElement'), O.relatedTarget)) && S(O)
      }
      function T(O) {
        M(O)
      }
      return (
        n.select('open') && j.addEventListener('mouseleave', T),
        f && j.addEventListener('mousemove', P, { once: !0 }),
        j.addEventListener('mouseenter', P),
        j.addEventListener('mouseleave', I),
        () => {
          ;(j.removeEventListener('mouseleave', T),
            f && j.removeEventListener('mousemove', P),
            j.removeEventListener('mouseenter', P),
            j.removeEventListener('mouseleave', I))
        }
      )
    }, [k, R, r, y, S, n, s, b, M, p, h, w, x, c, f, v, d, m, C]),
    l.useMemo(() => {
      if (!s) return
      function j(P) {
        p.pointerType = P.pointerType
      }
      return {
        onPointerDown: j,
        onPointerEnter: j,
        onMouseMove(P) {
          const { nativeEvent: I } = P,
            T = P.currentTarget,
            O = n.select('domReferenceElement'),
            L = n.context.triggerElements,
            A = n.select('open'),
            z =
              (L.hasElement(P.target) || L.hasMatchingElement(($) => be($, P.target))) &&
              (!O || !be(O, P.target))
          if (
            (c && !pr(p.pointerType)) ||
            (A && !z) ||
            ma(v.current) === 0 ||
            (!z && p.restTimeoutPending && P.movementX ** 2 + P.movementY ** 2 < 2)
          )
            return
          p.restTimeout.clear()
          function D() {
            if (((p.restTimeoutPending = !1), w())) return
            const $ = n.select('open')
            !p.blockMouseMove && (!$ || z) && n.setOpen(!0, ge(Ct, I, T))
          }
          p.pointerType === 'touch'
            ? Mt.flushSync(() => {
                D()
              })
            : z && A
              ? D()
              : ((p.restTimeoutPending = !0), p.restTimeout.start(ma(v.current), D))
        },
      }
    }, [s, p, w, c, n, v])
  )
}
function oo(e = []) {
  const t = e.map((u) => u?.reference),
    n = e.map((u) => u?.floating),
    r = e.map((u) => u?.item),
    o = e.map((u) => u?.trigger),
    s = l.useCallback((u) => bs(u, e, 'reference'), t),
    i = l.useCallback((u) => bs(u, e, 'floating'), n),
    a = l.useCallback((u) => bs(u, e, 'item'), r),
    c = l.useCallback((u) => bs(u, e, 'trigger'), o)
  return l.useMemo(
    () => ({ getReferenceProps: s, getFloatingProps: i, getItemProps: a, getTriggerProps: c }),
    [s, i, a, c],
  )
}
function bs(e, t, n) {
  const r = new Map(),
    o = n === 'item',
    s = {}
  n === 'floating' && ((s.tabIndex = -1), (s[Ua] = ''))
  for (const i in e) (o && e && (i === qp || i === Xp)) || (s[i] = e[i])
  for (let i = 0; i < t.length; i += 1) {
    let a
    const c = t[i]?.[n]
    ;(typeof c == 'function' ? (a = e ? c(e) : null) : (a = c), a && ud(s, a, o, r))
  }
  return (ud(s, e, o, r), s)
}
function ud(e, t, n, r) {
  for (const o in t) {
    const s = t[o]
    ;(n && (o === qp || o === Xp)) ||
      (o.startsWith('on')
        ? (r.has(o) || r.set(o, []),
          typeof s == 'function' &&
            (r.get(o)?.push(s),
            (e[o] = (...i) =>
              r
                .get(o)
                ?.map((a) => a(...i))
                .find((a) => a !== void 0))))
        : (e[o] = s))
  }
}
const dE = 'Escape'
function ki(e, t, n) {
  switch (e) {
    case 'vertical':
      return t
    case 'horizontal':
      return n
    default:
      return t || n
  }
}
function vs(e, t) {
  return ki(t, e === Vl || e === Wo, e === Dn || e === Nn)
}
function ha(e, t, n) {
  return ki(t, e === Wo, n ? e === Dn : e === Nn) || e === 'Enter' || e === ' ' || e === ''
}
function fE(e, t, n) {
  return ki(t, n ? e === Dn : e === Nn, e === Wo)
}
function pE(e, t, n, r) {
  const o = n ? e === Nn : e === Dn,
    s = e === Vl
  return t === 'both' || (t === 'horizontal' && r && r > 1) ? e === dE : ki(t, o, s)
}
function qg(e, t) {
  const n = 'rootStore' in e ? e.rootStore : e,
    r = n.useState('open'),
    o = n.useState('floatingElement'),
    s = n.useState('domReferenceElement'),
    i = n.context.dataRef,
    {
      listRef: a,
      activeIndex: c,
      onNavigate: u = () => {},
      enabled: f = !0,
      selectedIndex: d = null,
      allowEscape: g = !1,
      loopFocus: h = !1,
      nested: m = !1,
      rtl: p = !1,
      virtual: b = !1,
      focusItemOnOpen: y = 'auto',
      focusItemOnHover: v = !0,
      openOnArrowKeyDown: C = !0,
      disabledIndices: w = void 0,
      orientation: x = 'vertical',
      parentOrientation: S,
      cols: k = 1,
      id: R,
      resetOnPointerLeave: M = !0,
      externalTree: j,
    } = t,
    P = Gs(o),
    I = ht(P),
    T = En(),
    O = Yn(j)
  ae(() => {
    i.current.orientation = x
  }, [i, x])
  const L = Za(s),
    A = l.useRef(y),
    z = l.useRef(d ?? -1),
    D = l.useRef(null),
    $ = l.useRef(!0),
    F = ne((_) => {
      u(z.current === -1 ? null : z.current, _)
    }),
    Q = l.useRef(F),
    q = l.useRef(!!o),
    se = l.useRef(r),
    Y = l.useRef(!1),
    oe = l.useRef(!1),
    te = ht(w),
    le = ht(r),
    ve = ht(d),
    X = ht(M),
    me = ne(() => {
      function _(fe) {
        b ? O?.events.emit('virtualfocus', fe) : To(fe, { sync: Y.current, preventScroll: !0 })
      }
      const H = a.current[z.current],
        W = oe.current
      ;(H && _(H),
        (Y.current ? (fe) => fe() : requestAnimationFrame)(() => {
          const fe = a.current[z.current] || H
          if (!fe) return
          ;(H || _(fe),
            V && (W || !$.current) && fe.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }))
        }))
    })
  ;(ae(() => {
    f &&
      (r && o
        ? ((z.current = d ?? -1), A.current && d != null && ((oe.current = !0), F()))
        : q.current && ((z.current = -1), Q.current()))
  }, [f, r, o, d, F]),
    ae(() => {
      if (f) {
        if (!r) {
          Y.current = !1
          return
        }
        if (o)
          if (c == null) {
            if (((Y.current = !1), ve.current != null)) return
            if (
              (q.current && ((z.current = -1), me()),
              (!se.current || !q.current) &&
                A.current &&
                (D.current != null || (A.current === !0 && D.current == null)))
            ) {
              let _ = 0
              const H = () => {
                a.current[0] == null
                  ? (_ < 2 && (_ ? requestAnimationFrame : queueMicrotask)(H), (_ += 1))
                  : ((z.current = D.current == null || ha(D.current, x, p) || m ? Os(a) : Ya(a)),
                    (D.current = null),
                    F())
              }
              H()
            }
          } else $r(a, c) || ((z.current = c), me(), (oe.current = !1))
      }
    }, [f, r, o, c, ve, m, a, x, p, F, me, te]),
    ae(() => {
      if (!f || o || !O || b || !q.current) return
      const _ = O.nodesRef.current,
        H = _.find((fe) => fe.id === T)?.context?.elements.floating,
        W = St(ke(o)),
        J = _.some((fe) => fe.context && be(fe.context.elements.floating, W))
      H && !J && $.current && H.focus({ preventScroll: !0 })
    }, [f, o, O, T, b]),
    ae(() => {
      ;((Q.current = F), (se.current = r), (q.current = !!o))
    }),
    ae(() => {
      r || ((D.current = null), (A.current = y))
    }, [r, y]))
  const he = c != null,
    V = l.useMemo(() => {
      function _(W) {
        if (!le.current) return
        const J = a.current.indexOf(W.currentTarget)
        J !== -1 && z.current !== J && ((z.current = J), F(W))
      }
      return {
        onFocus(W) {
          ;((Y.current = !0), _(W))
        },
        onClick: ({ currentTarget: W }) => W.focus({ preventScroll: !0 }),
        onMouseMove(W) {
          ;((Y.current = !0), (oe.current = !1), v && _(W))
        },
        onPointerLeave(W) {
          if (!le.current || !$.current || W.pointerType === 'touch') return
          Y.current = !0
          const J = W.relatedTarget
          !v ||
            a.current.includes(J) ||
            (X.current &&
              (To(null, { sync: !0 }),
              (z.current = -1),
              F(W),
              b || I.current?.focus({ preventScroll: !0 })))
        },
      }
    }, [le, I, v, a, F, X, b]),
    Z = l.useCallback(
      () => S ?? O?.nodesRef.current.find((_) => _.id === T)?.context?.dataRef?.current.orientation,
      [T, O, S],
    ),
    K = ne((_) => {
      if (
        (($.current = !1),
        (Y.current = !0),
        _.which === 229 || (!le.current && _.currentTarget === I.current))
      )
        return
      if (m && pE(_.key, x, p, k)) {
        ;(vs(_.key, Z()) || Je(_),
          n.setOpen(!1, ge(Io, _.nativeEvent)),
          Ze(s) && (b ? O?.events.emit('virtualfocus', s) : s.focus()))
        return
      }
      const H = z.current,
        W = Os(a, w),
        J = Ya(a, w)
      if (
        (L ||
          (_.key === 'Home' && (Je(_), (z.current = W), F(_)),
          _.key === 'End' && (Je(_), (z.current = J), F(_))),
        k > 1)
      ) {
        const fe = Array.from({ length: a.current.length }, () => ({ width: 1, height: 1 })),
          we = sg(fe, k, !1),
          Ae = we.findIndex((Ee) => Ee != null && !_n(a, Ee, w)),
          st = we.reduce((Ee, _e, tt) => (_e != null && !_n(a, _e, w) ? tt : Ee), -1),
          He =
            we[
              og(
                { current: we.map((Ee) => (Ee != null ? a.current[Ee] : null)) },
                {
                  event: _,
                  orientation: x,
                  loopFocus: h,
                  rtl: p,
                  cols: k,
                  disabledIndices: ag(
                    [
                      ...((typeof w != 'function' ? w : null) ||
                        a.current.map((Ee, _e) => (_n(a, _e, w) ? _e : void 0))),
                      void 0,
                    ],
                    we,
                  ),
                  minIndex: Ae,
                  maxIndex: st,
                  prevIndex: ig(
                    z.current > J ? W : z.current,
                    fe,
                    we,
                    k,
                    _.key === Wo ? 'bl' : _.key === (p ? Dn : Nn) ? 'tr' : 'tl',
                  ),
                  stopEvent: !0,
                },
              )
            ]
        if ((He != null && ((z.current = He), F(_)), x === 'both')) return
      }
      if (vs(_.key, x)) {
        if ((Je(_), r && !b && St(_.currentTarget.ownerDocument) === _.currentTarget)) {
          ;((z.current = ha(_.key, x, p) ? W : J), F(_))
          return
        }
        ;(ha(_.key, x, p)
          ? h
            ? H >= J
              ? g && H !== a.current.length
                ? (z.current = -1)
                : ((Y.current = !1), (z.current = W))
              : (z.current = dt(a, { startingIndex: H, disabledIndices: w }))
            : (z.current = Math.min(J, dt(a, { startingIndex: H, disabledIndices: w })))
          : h
            ? H <= W
              ? g && H !== -1
                ? (z.current = a.current.length)
                : ((Y.current = !1), (z.current = J))
              : (z.current = dt(a, { startingIndex: H, decrement: !0, disabledIndices: w }))
            : (z.current = Math.max(
                W,
                dt(a, { startingIndex: H, decrement: !0, disabledIndices: w }),
              )),
          $r(a, z.current) && (z.current = -1),
          F(_))
      }
    }),
    xe = l.useMemo(
      () => b && r && he && { 'aria-activedescendant': `${R}-${c}` },
      [b, r, he, R, c],
    ),
    N = l.useMemo(
      () => ({
        'aria-orientation': x === 'both' ? void 0 : x,
        ...(L ? {} : xe),
        onKeyDown(_) {
          if (_.key === 'Tab' && _.shiftKey && r && !b) {
            const H = Ge(_.nativeEvent)
            if (H && !be(I.current, H)) return
            ;(Je(_), n.setOpen(!1, ge(fr, _.nativeEvent)), Ze(s) && s.focus())
            return
          }
          K(_)
        },
        onPointerMove() {
          $.current = !0
        },
      }),
      [xe, K, I, x, L, n, r, b, s],
    ),
    U = l.useMemo(() => {
      function _(W) {
        y === 'auto' && Qp(W.nativeEvent) && (A.current = !b)
      }
      function H(W) {
        ;((A.current = y), y === 'auto' && eg(W.nativeEvent) && (A.current = !0))
      }
      return {
        onKeyDown(W) {
          const J = n.select('open')
          $.current = !1
          const fe = W.key.startsWith('Arrow'),
            we = fE(W.key, Z(), p),
            Ae = vs(W.key, x),
            st = (m ? we : Ae) || W.key === 'Enter' || W.key.trim() === ''
          if (b && J) return K(W)
          if (!(!J && !C && fe)) {
            if (st) {
              const He = vs(W.key, Z())
              D.current = m && He ? null : W.key
            }
            if (m) {
              we &&
                (Je(W),
                J
                  ? ((z.current = Os(a, te.current)), F(W))
                  : n.setOpen(!0, ge(Io, W.nativeEvent, W.currentTarget)))
              return
            }
            Ae &&
              (ve.current != null && (z.current = ve.current),
              Je(W),
              !J && C ? n.setOpen(!0, ge(Io, W.nativeEvent, W.currentTarget)) : K(W),
              J && F(W))
          }
        },
        onFocus(W) {
          n.select('open') && !b && ((z.current = -1), F(W))
        },
        onPointerDown: H,
        onPointerEnter: H,
        onMouseDown: _,
        onClick: _,
      }
    }, [K, te, y, a, m, F, n, C, x, Z, p, ve, b]),
    B = l.useMemo(() => ({ ...xe, ...U }), [xe, U])
  return l.useMemo(
    () => (f ? { reference: B, floating: N, item: V, trigger: U } : {}),
    [f, B, N, U, V],
  )
}
const gE = new Map([
  ['select', 'listbox'],
  ['combobox', 'listbox'],
  ['label', !1],
])
function Xg(e, t = {}) {
  const n = 'rootStore' in e ? e.rootStore : e,
    r = n.useState('open'),
    o = n.useState('floatingId'),
    s = n.useState('domReferenceElement'),
    i = n.useState('floatingElement'),
    { role: a = 'dialog' } = t,
    c = nn(),
    u = s?.id || c,
    f = l.useMemo(() => Gs(i)?.id || o, [i, o]),
    d = gE.get(a) ?? a,
    h = En() != null,
    m = l.useMemo(
      () =>
        d === 'tooltip' || a === 'label'
          ? Ke
          : {
              'aria-haspopup': d === 'alertdialog' ? 'dialog' : d,
              'aria-expanded': 'false',
              ...(d === 'listbox' && { role: 'combobox' }),
              ...(d === 'menu' && h && { role: 'menuitem' }),
              ...(a === 'select' && { 'aria-autocomplete': 'none' }),
              ...(a === 'combobox' && { 'aria-autocomplete': 'list' }),
            },
      [d, h, a],
    ),
    p = l.useMemo(
      () =>
        d === 'tooltip' || a === 'label'
          ? { [`aria-${a === 'label' ? 'labelledby' : 'describedby'}`]: r ? f : void 0 }
          : {
              ...m,
              'aria-expanded': r ? 'true' : 'false',
              'aria-controls': r ? f : void 0,
              ...(d === 'menu' && { id: u }),
            },
      [d, f, r, u, a, m],
    ),
    b = l.useMemo(() => {
      const v = { id: f, ...(d && { role: d }) }
      return d === 'tooltip' || a === 'label'
        ? v
        : { ...v, ...(d === 'menu' && { 'aria-labelledby': u }) }
    }, [d, f, u, a]),
    y = l.useCallback(
      ({ active: v, selected: C }) => {
        const w = { role: 'option', ...(v && { id: `${f}-fui-option` }) }
        switch (a) {
          case 'select':
          case 'combobox':
            return { ...w, 'aria-selected': C }
        }
        return {}
      },
      [f, a],
    )
  return l.useMemo(() => ({ reference: p, floating: b, item: y, trigger: m }), [p, b, m, y])
}
function Jg(e, t) {
  const n = 'rootStore' in e ? e.rootStore : e,
    r = n.context.dataRef,
    o = n.useState('open'),
    {
      listRef: s,
      activeIndex: i,
      onMatch: a,
      onTypingChange: c,
      enabled: u = !0,
      resetMs: f = 750,
      selectedIndex: d = null,
    } = t,
    g = bt(),
    h = l.useRef(''),
    m = l.useRef(d ?? i ?? -1),
    p = l.useRef(null)
  ;(ae(() => {
    ;(!o && d !== null) || (g.clear(), (p.current = null), h.current !== '' && (h.current = ''))
  }, [o, d, g]),
    ae(() => {
      o && h.current === '' && (m.current = d ?? i ?? -1)
    }, [o, d, i]))
  const b = ne((x) => {
      x
        ? r.current.typing || ((r.current.typing = x), c?.(x))
        : r.current.typing && ((r.current.typing = x), c?.(x))
    }),
    y = ne((x) => {
      function S(I, T, O) {
        const L = T.find((A) => A?.toLocaleLowerCase().indexOf(O.toLocaleLowerCase()) === 0)
        return L ? I.indexOf(L) : -1
      }
      const k = s.current
      if (
        (h.current.length > 0 &&
          h.current[0] !== ' ' &&
          (S(k, k, h.current) === -1 ? b(!1) : x.key === ' ' && Je(x)),
        k == null || x.key.length !== 1 || x.ctrlKey || x.metaKey || x.altKey)
      )
        return
      o && x.key !== ' ' && (Je(x), b(!0))
      const R = h.current === ''
      ;(R && (m.current = d ?? i ?? -1),
        k.every((I) => (I ? I[0]?.toLocaleLowerCase() !== I[1]?.toLocaleLowerCase() : !0)) &&
          h.current === x.key &&
          ((h.current = ''), (m.current = p.current)),
        (h.current += x.key),
        g.start(f, () => {
          ;((h.current = ''), (m.current = p.current), b(!1))
        }))
      const j = R ? (d ?? i ?? -1) : m.current,
        P = S(k, [...k.slice((j || 0) + 1), ...k.slice(0, (j || 0) + 1)], h.current)
      P !== -1 ? (a?.(P), (p.current = P)) : x.key !== ' ' && ((h.current = ''), b(!1))
    }),
    v = ne((x) => {
      const S = x.relatedTarget,
        k = n.select('domReferenceElement'),
        R = n.select('floatingElement'),
        M = be(k, S),
        j = be(R, S)
      M || j || (g.clear(), (h.current = ''), (m.current = p.current), b(!1))
    }),
    C = l.useMemo(() => ({ onKeyDown: y, onBlur: v }), [y, v]),
    w = l.useMemo(
      () => ({
        onKeyDown: y,
        onKeyUp(x) {
          x.key === ' ' && b(!1)
        },
        onBlur: v,
      }),
      [y, v, b],
    )
  return l.useMemo(() => (u ? { reference: C, floating: w } : {}), [u, C, w])
}
function dd(e, t) {
  const [n, r] = e
  let o = !1
  const s = t.length
  for (let i = 0, a = s - 1; i < s; a = i++) {
    const [c, u] = t[i] || [0, 0],
      [f, d] = t[a] || [0, 0]
    u >= r != d >= r && n <= ((f - c) * (r - u)) / (d - u) + c && (o = !o)
  }
  return o
}
function mE(e, t) {
  return e[0] >= t.x && e[0] <= t.x + t.width && e[1] >= t.y && e[1] <= t.y + t.height
}
function ac(e = {}) {
  const { buffer: t = 0.5, blockPointerEvents: n = !1, requireIntent: r = !0 } = e,
    o = new _t()
  let s = !1,
    i = null,
    a = null,
    c = typeof performance < 'u' ? performance.now() : 0
  function u(d, g) {
    const h = performance.now(),
      m = h - c
    if (i === null || a === null || m === 0) return ((i = d), (a = g), (c = h), null)
    const p = d - i,
      b = g - a,
      v = Math.sqrt(p * p + b * b) / m
    return ((i = d), (a = g), (c = h), v)
  }
  const f = ({ x: d, y: g, placement: h, elements: m, onClose: p, nodeId: b, tree: y }) =>
    function (C) {
      function w() {
        ;(o.clear(), p())
      }
      if ((o.clear(), !m.domReference || !m.floating || h == null || d == null || g == null)) return
      const { clientX: x, clientY: S } = C,
        k = [x, S],
        R = Ge(C),
        M = C.type === 'mouseleave',
        j = be(m.floating, R),
        P = be(m.domReference, R),
        I = m.domReference.getBoundingClientRect(),
        T = m.floating.getBoundingClientRect(),
        O = h.split('-')[0],
        L = d > T.right - T.width / 2,
        A = g > T.bottom - T.height / 2,
        z = mE(k, I),
        D = T.width > I.width,
        $ = T.height > I.height,
        F = (D ? I : T).left,
        Q = (D ? I : T).right,
        q = ($ ? I : T).top,
        se = ($ ? I : T).bottom
      if (j && ((s = !0), !M)) return
      if ((P && (s = !1), P && !M)) {
        s = !0
        return
      }
      if (
        (M && je(C.relatedTarget) && be(m.floating, C.relatedTarget)) ||
        (y && lr(y.nodesRef.current, b).some(({ context: te }) => te?.open))
      )
        return
      if (
        (O === 'top' && g >= I.bottom - 1) ||
        (O === 'bottom' && g <= I.top + 1) ||
        (O === 'left' && d >= I.right - 1) ||
        (O === 'right' && d <= I.left + 1)
      )
        return w()
      let Y = []
      switch (O) {
        case 'top':
          Y = [
            [F, I.top + 1],
            [F, T.bottom - 1],
            [Q, T.bottom - 1],
            [Q, I.top + 1],
          ]
          break
        case 'bottom':
          Y = [
            [F, T.top + 1],
            [F, I.bottom - 1],
            [Q, I.bottom - 1],
            [Q, T.top + 1],
          ]
          break
        case 'left':
          Y = [
            [T.right - 1, se],
            [T.right - 1, q],
            [I.left + 1, q],
            [I.left + 1, se],
          ]
          break
        case 'right':
          Y = [
            [I.right - 1, se],
            [I.right - 1, q],
            [T.left + 1, q],
            [T.left + 1, se],
          ]
          break
      }
      function oe([te, le]) {
        switch (O) {
          case 'top': {
            const ve = [D ? te + t / 2 : L ? te + t * 4 : te - t * 4, le + t + 1],
              X = [D ? te - t / 2 : L ? te + t * 4 : te - t * 4, le + t + 1],
              me = [
                [T.left, L || D ? T.bottom - t : T.top],
                [T.right, L ? (D ? T.bottom - t : T.top) : T.bottom - t],
              ]
            return [ve, X, ...me]
          }
          case 'bottom': {
            const ve = [D ? te + t / 2 : L ? te + t * 4 : te - t * 4, le - t],
              X = [D ? te - t / 2 : L ? te + t * 4 : te - t * 4, le - t],
              me = [
                [T.left, L || D ? T.top + t : T.bottom],
                [T.right, L ? (D ? T.top + t : T.bottom) : T.top + t],
              ]
            return [ve, X, ...me]
          }
          case 'left': {
            const ve = [te + t + 1, $ ? le + t / 2 : A ? le + t * 4 : le - t * 4],
              X = [te + t + 1, $ ? le - t / 2 : A ? le + t * 4 : le - t * 4]
            return [
              ...[
                [A || $ ? T.right - t : T.left, T.top],
                [A ? ($ ? T.right - t : T.left) : T.right - t, T.bottom],
              ],
              ve,
              X,
            ]
          }
          case 'right': {
            const ve = [te - t, $ ? le + t / 2 : A ? le + t * 4 : le - t * 4],
              X = [te - t, $ ? le - t / 2 : A ? le + t * 4 : le - t * 4],
              me = [
                [A || $ ? T.left + t : T.right, T.top],
                [A ? ($ ? T.left + t : T.right) : T.left + t, T.bottom],
              ]
            return [ve, X, ...me]
          }
          default:
            return []
        }
      }
      if (!dd([x, S], Y)) {
        if (s && !z) return w()
        if (!M && r) {
          const te = u(C.clientX, C.clientY)
          if (te !== null && te < 0.1) return w()
        }
        dd([x, S], oe([d, g])) ? !s && r && o.start(40, w) : w()
      }
    }
  return ((f.__options = { blockPointerEvents: n }), f)
}
function hE(e) {
  const t = l.useRef(''),
    n = l.useCallback(
      (o) => {
        o.defaultPrevented || ((t.current = o.pointerType), e(o, o.pointerType))
      },
      [e],
    )
  return {
    onClick: l.useCallback(
      (o) => {
        if (o.detail === 0) {
          e(o, 'keyboard')
          return
        }
        ;('pointerType' in o ? e(o, o.pointerType) : e(o, t.current), (t.current = ''))
      },
      [e],
    ),
    onPointerDown: n,
  }
}
function lc(e) {
  const [t, n] = l.useState(null),
    r = ne((a, c) => {
      e || n(c || (Zp ? 'touch' : ''))
    }),
    o = l.useCallback(() => {
      n(null)
    }, []),
    { onClick: s, onPointerDown: i } = hE(r)
  return l.useMemo(
    () => ({ openMethod: t, reset: o, triggerProps: { onClick: s, onPointerDown: i } }),
    [t, o, s, i],
  )
}
function bE(e) {
  const { store: t, parentContext: n, actionsRef: r } = e,
    o = t.useState('open'),
    s = t.useState('disablePointerDismissal'),
    i = t.useState('modal'),
    a = t.useState('popupElement'),
    { openMethod: c, triggerProps: u, reset: f } = lc(o)
  ec(t)
  const { forceUnmount: d } = tc(o, t, () => {
      f()
    }),
    g = ne((j) => {
      const P = ge(j)
      return (
        (P.preventUnmountOnClose = () => {
          t.set('preventUnmountingOnClose', !0)
        }),
        P
      )
    }),
    h = l.useCallback(() => {
      t.setOpen(!1, g(Ll))
    }, [t, g])
  l.useImperativeHandle(r, () => ({ unmount: d, close: h }), [d, h])
  const m = oc({
      popupStore: t,
      onOpenChange: t.setOpen,
      treatPopupAsFloatingElement: !0,
      noEmit: !0,
    }),
    [p, b] = l.useState(0),
    y = p === 0,
    v = Xg(m),
    C = Ri(m, {
      outsidePressEvent() {
        return t.context.internalBackdropRef.current || t.context.backdropRef.current
          ? 'intentional'
          : { mouse: i === 'trap-focus' ? 'sloppy' : 'intentional', touch: 'sloppy' }
      },
      outsidePress(j) {
        if (
          !t.context.outsidePressEnabledRef.current ||
          ('button' in j && j.button !== 0) ||
          ('touches' in j && j.touches.length !== 1)
        )
          return !1
        const P = Ge(j)
        if (y && !s) {
          const I = P
          return i && (t.context.internalBackdropRef.current || t.context.backdropRef.current)
            ? t.context.internalBackdropRef.current === I ||
                t.context.backdropRef.current === I ||
                (be(I, a) && !I?.hasAttribute('data-base-ui-portal'))
            : !0
        }
        return !1
      },
      escapeKey: y,
    })
  Ul(o && i === !0, a)
  const { getReferenceProps: w, getFloatingProps: x, getTriggerProps: S } = oo([v, C])
  ;(t.useContextCallback('onNestedDialogOpen', (j) => {
    b(j + 1)
  }),
    t.useContextCallback('onNestedDialogClose', () => {
      b(0)
    }),
    l.useEffect(
      () => (
        n?.onNestedDialogOpen && o && n.onNestedDialogOpen(p),
        n?.onNestedDialogClose && !o && n.onNestedDialogClose(),
        () => {
          n?.onNestedDialogClose && o && n.onNestedDialogClose()
        }
      ),
      [o, n, p],
    ))
  const k = l.useMemo(() => w(u), [w, u]),
    R = l.useMemo(() => S(u), [S, u]),
    M = l.useMemo(() => x(), [x])
  t.useSyncedValues({
    openMethod: c,
    activeTriggerProps: k,
    inactiveTriggerProps: R,
    popupProps: M,
    floatingRootContext: m,
    nestedOpenDialogCount: p,
  })
}
const Qg = l.createContext(void 0)
function Ii(e) {
  return l.useContext(Qg)
}
const vE = {
  ...rc,
  modal: G((e) => e.modal),
  nested: G((e) => e.nested),
  nestedOpenDialogCount: G((e) => e.nestedOpenDialogCount),
  disablePointerDismissal: G((e) => e.disablePointerDismissal),
  openMethod: G((e) => e.openMethod),
  descriptionElementId: G((e) => e.descriptionElementId),
  titleElementId: G((e) => e.titleElementId),
  viewportElement: G((e) => e.viewportElement),
  role: G((e) => e.role),
}
class yE extends Ko {
  constructor(t) {
    super(
      xE(t),
      {
        popupRef: l.createRef(),
        backdropRef: l.createRef(),
        internalBackdropRef: l.createRef(),
        outsidePressEnabledRef: { current: !0 },
        triggerElements: new Yo(),
        onOpenChange: void 0,
        onOpenChangeComplete: void 0,
      },
      vE,
    )
  }
  setOpen = (t, n) => {
    if (
      ((n.preventUnmountOnClose = () => {
        this.set('preventUnmountingOnClose', !0)
      }),
      !t &&
        n.trigger == null &&
        this.state.activeTriggerId != null &&
        (n.trigger = this.state.activeTriggerElement ?? void 0),
      this.context.onOpenChange?.(t, n),
      n.isCanceled)
    )
      return
    const r = { open: t, nativeEvent: n.event, reason: n.reason, nested: this.state.nested }
    this.state.floatingRootContext.context.events?.emit('openchange', r)
    const o = { open: t },
      s = n.trigger?.id ?? null
    ;((s || t) && ((o.activeTriggerId = s), (o.activeTriggerElement = n.trigger ?? null)),
      this.update(o))
  }
}
function xE(e = {}) {
  return {
    ...nc(),
    modal: !0,
    disablePointerDismissal: !1,
    popupElement: null,
    viewportElement: null,
    descriptionElementId: void 0,
    titleElementId: void 0,
    openMethod: null,
    nested: !1,
    nestedOpenDialogCount: 0,
    role: 'dialog',
    ...e,
  }
}
function wE(e) {
  const {
      children: t,
      open: n,
      defaultOpen: r = !1,
      onOpenChange: o,
      onOpenChangeComplete: s,
      actionsRef: i,
      handle: a,
      triggerId: c,
      defaultTriggerId: u = null,
    } = e,
    f = Ii(),
    d = !!f,
    g = ot(
      () =>
        a?.store ??
        new yE({
          open: r,
          openProp: n,
          activeTriggerId: u,
          triggerIdProp: c,
          modal: !0,
          disablePointerDismissal: !0,
          nested: d,
          role: 'alertdialog',
        }),
    ).current
  ;(g.useControlledProp('openProp', n),
    g.useControlledProp('triggerIdProp', c),
    g.useSyncedValue('nested', d),
    g.useContextCallback('onOpenChange', o),
    g.useContextCallback('onOpenChangeComplete', s))
  const h = g.useState('payload')
  bE({ store: g, actionsRef: i, parentContext: f?.store.context })
  const m = l.useMemo(() => ({ store: g }), [g])
  return E.jsx(Qg.Provider, { value: m, children: typeof t == 'function' ? t({ payload: h }) : t })
}
let ar = (function (e) {
    return (
      (e.open = 'data-open'),
      (e.closed = 'data-closed'),
      (e[(e.startingStyle = Lo.startingStyle)] = 'startingStyle'),
      (e[(e.endingStyle = Lo.endingStyle)] = 'endingStyle'),
      (e.anchorHidden = 'data-anchor-hidden'),
      (e.side = 'data-side'),
      (e.align = 'data-align'),
      e
    )
  })({}),
  ti = (function (e) {
    return ((e.popupOpen = 'data-popup-open'), (e.pressed = 'data-pressed'), e)
  })({})
const CE = { [ti.popupOpen]: '' },
  SE = { [ti.popupOpen]: '', [ti.pressed]: '' },
  EE = { [ar.open]: '' },
  RE = { [ar.closed]: '' },
  kE = { [ar.anchorHidden]: '' },
  em = {
    open(e) {
      return e ? CE : null
    },
  },
  ni = {
    open(e) {
      return e ? SE : null
    },
  },
  qn = {
    open(e) {
      return e ? EE : RE
    },
    anchorHidden(e) {
      return e ? kE : null
    },
  },
  IE = { ...qn, ...Sr },
  TE = l.forwardRef(function (t, n) {
    const { render: r, className: o, forceRender: s = !1, ...i } = t,
      { store: a } = Ii(),
      c = a.useState('open'),
      u = a.useState('nested'),
      f = a.useState('mounted'),
      d = a.useState('transitionStatus')
    return Oe('div', t, {
      state: { open: c, transitionStatus: d },
      ref: [a.context.backdropRef, n],
      stateAttributesMapping: IE,
      props: [
        {
          role: 'presentation',
          hidden: !f,
          style: { userSelect: 'none', WebkitUserSelect: 'none' },
        },
        i,
      ],
      enabled: s || !u,
    })
  })
let PE = (function (e) {
    return ((e.nestedDialogs = '--nested-dialogs'), e)
  })({}),
  OE = (function (e) {
    return (
      (e[(e.open = ar.open)] = 'open'),
      (e[(e.closed = ar.closed)] = 'closed'),
      (e[(e.startingStyle = ar.startingStyle)] = 'startingStyle'),
      (e[(e.endingStyle = ar.endingStyle)] = 'endingStyle'),
      (e.nested = 'data-nested'),
      (e.nestedDialogOpen = 'data-nested-dialog-open'),
      e
    )
  })({})
const tm = l.createContext(void 0)
function ME() {
  const e = l.useContext(tm)
  if (e === void 0) throw new Error(Ve(26))
  return e
}
const AE = {
    ...qn,
    ...Sr,
    nestedDialogOpen(e) {
      return e ? { [OE.nestedDialogOpen]: '' } : null
    },
  },
  zE = l.forwardRef(function (t, n) {
    const { className: r, finalFocus: o, initialFocus: s, render: i, ...a } = t,
      { store: c } = Ii(),
      u = c.useState('descriptionElementId'),
      f = c.useState('disablePointerDismissal'),
      d = c.useState('floatingRootContext'),
      g = c.useState('popupProps'),
      h = c.useState('modal'),
      m = c.useState('mounted'),
      p = c.useState('nested'),
      b = c.useState('nestedOpenDialogCount'),
      y = c.useState('open'),
      v = c.useState('openMethod'),
      C = c.useState('titleElementId'),
      w = c.useState('transitionStatus'),
      x = c.useState('role')
    ;(ME(),
      Kn({
        open: y,
        ref: c.context.popupRef,
        onComplete() {
          y && c.context.onOpenChangeComplete?.(!0)
        },
      }))
    function S(P) {
      return P === 'touch' ? c.context.popupRef.current : !0
    }
    const k = s === void 0 ? S : s,
      R = b > 0,
      j = Oe('div', t, {
        state: { open: y, nested: p, transitionStatus: w, nestedDialogOpen: R },
        props: [
          g,
          {
            'aria-labelledby': C ?? void 0,
            'aria-describedby': u ?? void 0,
            role: x,
            tabIndex: -1,
            hidden: !m,
            onKeyDown(P) {
              wg.has(P.key) && P.stopPropagation()
            },
            style: { [PE.nestedDialogs]: b },
          },
          a,
        ],
        ref: [n, c.context.popupRef, c.useStateSetter('popupElement')],
        stateAttributesMapping: AE,
      })
    return E.jsx(ql, {
      context: d,
      openInteractionType: v,
      disabled: !m,
      closeOnFocusOut: !f,
      initialFocus: k,
      returnFocus: o,
      modal: h !== !1,
      restoreFocus: 'popup',
      children: j,
    })
  })
function Ti(e) {
  return Al(19) ? e : e ? 'true' : void 0
}
const cc = l.forwardRef(function (t, n) {
    const { cutout: r, ...o } = t
    let s
    if (r) {
      const i = r?.getBoundingClientRect()
      s = `polygon(
      0% 0%,
      100% 0%,
      100% 100%,
      0% 100%,
      0% 0%,
      ${i.left}px ${i.top}px,
      ${i.left}px ${i.bottom}px,
      ${i.right}px ${i.bottom}px,
      ${i.right}px ${i.top}px,
      ${i.left}px ${i.top}px
    )`
    }
    return E.jsx('div', {
      ref: n,
      role: 'presentation',
      'data-base-ui-inert': '',
      ...o,
      style: {
        position: 'fixed',
        inset: 0,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        clipPath: s,
      },
    })
  }),
  LE = l.forwardRef(function (t, n) {
    const { keepMounted: r = !1, ...o } = t,
      { store: s } = Ii(),
      i = s.useState('mounted'),
      a = s.useState('modal'),
      c = s.useState('open')
    return i || r
      ? E.jsx(tm.Provider, {
          value: r,
          children: E.jsxs(Kl, {
            ref: n,
            ...o,
            children: [
              i && a === !0 && E.jsx(cc, { ref: s.context.internalBackdropRef, inert: Ti(!c) }),
              t.children,
            ],
          }),
        })
      : null
  })
function uc(e) {
  const t = l.useRef(!0)
  t.current && ((t.current = !1), e())
}
const nm = l.createContext(void 0),
  rm = l.createContext(void 0),
  om = l.createContext(void 0),
  sm = l.createContext('')
function Rn() {
  const e = l.useContext(nm)
  if (!e) throw new Error(Ve(22))
  return e
}
function Pi() {
  const e = l.useContext(rm)
  if (!e) throw new Error(Ve(23))
  return e
}
function Xn() {
  const e = l.useContext(om)
  if (!e) throw new Error(Ve(24))
  return e
}
function im() {
  return l.useContext(sm)
}
const jE = (e, t) => Object.is(e, t)
function mr(e, t, n) {
  return e == null || t == null ? Object.is(e, t) : n(e, t)
}
function DE(e, t, n) {
  return !e || e.length === 0 ? !1 : e.some((r) => (r === void 0 ? !1 : mr(t, r, n)))
}
function tl(e, t, n) {
  return !e || e.length === 0 ? -1 : e.findIndex((r) => (r === void 0 ? !1 : mr(r, t, n)))
}
function NE(e, t, n) {
  return e.filter((r) => !mr(t, r, n))
}
function nl(e) {
  if (e == null) return ''
  if (typeof e == 'string') return e
  try {
    return JSON.stringify(e)
  } catch {
    return String(e)
  }
}
function dc(e) {
  return e != null && e.length > 0 && typeof e[0] == 'object' && e[0] != null && 'items' in e[0]
}
function _E(e) {
  if (!Array.isArray(e)) return e != null && !('null' in e)
  if (dc(e)) {
    for (const t of e)
      for (const n of t.items) if (n && n.value == null && n.label != null) return !0
    return !1
  }
  for (const t of e) if (t && t.value == null && t.label != null) return !0
  return !1
}
function Rt(e, t) {
  if (t && e != null) return t(e) ?? ''
  if (e && typeof e == 'object') {
    if ('label' in e && e.label != null) return String(e.label)
    if ('value' in e) return String(e.value)
  }
  return nl(e)
}
function bo(e, t) {
  return t && e != null
    ? (t(e) ?? '')
    : e && typeof e == 'object' && 'value' in e && 'label' in e
      ? nl(e.value)
      : nl(e)
}
function am(e, t, n) {
  function r() {
    return Rt(e, n)
  }
  if (n && e != null) return n(e)
  if (e && typeof e == 'object' && 'label' in e && e.label != null) return e.label
  if (t && !Array.isArray(t)) return t[e] ?? r()
  if (Array.isArray(t)) {
    const o = dc(t) ? t.flatMap((s) => s.items) : t
    if (e == null || typeof e != 'object') {
      const s = o.find((i) => i.value === e)
      return s && s.label != null ? s.label : r()
    }
    if ('value' in e) {
      const s = o.find((i) => i && i.value === e.value)
      if (s && s.label != null) return s.label
    }
  }
  return r()
}
function FE(e, t, n) {
  return e.reduce(
    (r, o, s) => (
      s > 0 && r.push(', '),
      r.push(E.jsx(l.Fragment, { children: am(o, t, n) }, s)),
      r
    ),
    [],
  )
}
const ie = {
  id: G((e) => e.id),
  query: G((e) => e.query),
  items: G((e) => e.items),
  selectedValue: G((e) => e.selectedValue),
  hasSelectionChips: G((e) => {
    const t = e.selectedValue
    return Array.isArray(t) && t.length > 0
  }),
  hasSelectedValue: G((e) => {
    const { selectedValue: t, selectionMode: n } = e
    return t == null ? !1 : n === 'multiple' && Array.isArray(t) ? t.length > 0 : !0
  }),
  hasNullItemLabel: G((e, t) => (t ? _E(e.items) : !1)),
  open: G((e) => e.open),
  mounted: G((e) => e.mounted),
  forceMounted: G((e) => e.forceMounted),
  inline: G((e) => e.inline),
  activeIndex: G((e) => e.activeIndex),
  selectedIndex: G((e) => e.selectedIndex),
  isActive: G((e, t) => e.activeIndex === t),
  isSelected: G((e, t) => {
    const n = e.isItemEqualToValue,
      r = e.selectedValue
    return Array.isArray(r) ? r.some((o) => mr(t, o, n)) : mr(t, r, n)
  }),
  transitionStatus: G((e) => e.transitionStatus),
  popupProps: G((e) => e.popupProps),
  inputProps: G((e) => e.inputProps),
  triggerProps: G((e) => e.triggerProps),
  getItemProps: G((e) => e.getItemProps),
  positionerElement: G((e) => e.positionerElement),
  listElement: G((e) => e.listElement),
  triggerElement: G((e) => e.triggerElement),
  inputElement: G((e) => e.inputElement),
  popupSide: G((e) => e.popupSide),
  openMethod: G((e) => e.openMethod),
  inputInsidePopup: G((e) => e.inputInsidePopup),
  selectionMode: G((e) => e.selectionMode),
  listRef: G((e) => e.listRef),
  labelsRef: G((e) => e.labelsRef),
  popupRef: G((e) => e.popupRef),
  emptyRef: G((e) => e.emptyRef),
  inputRef: G((e) => e.inputRef),
  keyboardActiveRef: G((e) => e.keyboardActiveRef),
  chipsContainerRef: G((e) => e.chipsContainerRef),
  clearRef: G((e) => e.clearRef),
  valuesRef: G((e) => e.valuesRef),
  allValuesRef: G((e) => e.allValuesRef),
  name: G((e) => e.name),
  disabled: G((e) => e.disabled),
  readOnly: G((e) => e.readOnly),
  required: G((e) => e.required),
  grid: G((e) => e.grid),
  isGrouped: G((e) => e.isGrouped),
  virtualized: G((e) => e.virtualized),
  onOpenChangeComplete: G((e) => e.onOpenChangeComplete),
  openOnInputClick: G((e) => e.openOnInputClick),
  itemToStringLabel: G((e) => e.itemToStringLabel),
  isItemEqualToValue: G((e) => e.isItemEqualToValue),
  modal: G((e) => e.modal),
  autoHighlight: G((e) => e.autoHighlight),
  submitOnItemClick: G((e) => e.submitOnItemClick),
}
let fd = (function (e) {
  return (
    (e.disabled = 'data-disabled'),
    (e.valid = 'data-valid'),
    (e.invalid = 'data-invalid'),
    (e.touched = 'data-touched'),
    (e.dirty = 'data-dirty'),
    (e.filled = 'data-filled'),
    (e.focused = 'data-focused'),
    e
  )
})({})
const $E = {
    badInput: !1,
    customError: !1,
    patternMismatch: !1,
    rangeOverflow: !1,
    rangeUnderflow: !1,
    stepMismatch: !1,
    tooLong: !1,
    tooShort: !1,
    typeMismatch: !1,
    valid: null,
    valueMissing: !1,
  },
  VE = {
    valid(e) {
      return e === null ? null : e ? { [fd.valid]: '' } : { [fd.invalid]: '' }
    },
  },
  HE = l.createContext({
    invalid: void 0,
    name: void 0,
    validityData: { state: $E, errors: [], error: '', value: '', initialValue: null },
    setValidityData: Ue,
    disabled: void 0,
    touched: !1,
    setTouched: Ue,
    dirty: !1,
    setDirty: Ue,
    filled: !1,
    setFilled: Ue,
    focused: !1,
    setFocused: Ue,
    validate: () => null,
    validationMode: 'onSubmit',
    validationDebounceTime: 0,
    shouldValidateOnChange: () => !1,
    state: { disabled: !1, valid: null, touched: !1, dirty: !1, filled: !1, focused: !1 },
    markedDirtyRef: { current: !1 },
    validation: {
      getValidationProps: (e = Ke) => e,
      getInputValidationProps: (e = Ke) => e,
      inputRef: { current: null },
      commit: async () => {},
    },
  })
function Oi(e = !0) {
  const t = l.useContext(HE)
  if (t.setValidityData === Ue && !e) throw new Error(Ve(28))
  return t
}
function BE(e, t) {
  return { ...e, state: { ...e.state, valid: !t && e.state.valid } }
}
const WE = l.createContext({
  formRef: { current: { fields: new Map() } },
  errors: {},
  clearErrors: Ue,
  validationMode: 'onSubmit',
  submitAttemptedRef: { current: !1 },
})
function lm() {
  return l.useContext(WE)
}
function GE(e) {
  const { enabled: t = !0, value: n, id: r, name: o, controlRef: s, commit: i } = e,
    { formRef: a } = lm(),
    { invalid: c, markedDirtyRef: u, validityData: f, setValidityData: d } = Oi(),
    g = ne(e.getValue)
  ;(ae(() => {
    if (!t) return
    let h = n
    ;(h === void 0 && (h = g()),
      f.initialValue === null && h !== null && d((m) => ({ ...m, initialValue: h })))
  }, [t, d, n, f.initialValue, g]),
    ae(() => {
      !t ||
        !r ||
        a.current.fields.set(r, {
          getValue: g,
          name: o,
          controlRef: s,
          validityData: BE(f, c),
          validate(h = !0) {
            let m = n
            ;(m === void 0 && (m = g()), (u.current = !0), h ? Mt.flushSync(() => i(m)) : i(m))
          },
        })
    }, [i, s, t, a, g, r, c, u, o, f, n]),
    ae(() => {
      const h = a.current.fields
      return () => {
        r && h.delete(r)
      }
    }, [a, r]))
}
const UE = l.createContext({
  controlId: void 0,
  registerControlId: Ue,
  labelId: void 0,
  setLabelId: Ue,
  messageIds: [],
  setMessageIds: Ue,
  getDescriptionProps: (e) => e,
})
function fc() {
  return l.useContext(UE)
}
function cm(e = {}) {
  const { id: t, implicit: n = !1, controlRef: r } = e,
    { controlId: o, registerControlId: s } = fc(),
    i = Gn(t),
    a = n ? o : void 0,
    c = ot(() => Symbol('labelable-control')),
    u = l.useRef(!1),
    f = l.useRef(t != null),
    d = ne(() => {
      !u.current || s === Ue || ((u.current = !1), s(c.current, void 0))
    })
  return (
    ae(() => {
      if (s === Ue) return
      let g
      if (n) {
        const h = r?.current
        je(h) && h.closest('label') != null ? (g = t ?? null) : (g = a ?? i)
      } else if (t != null) ((f.current = !0), (g = t))
      else if (f.current) g = i
      else {
        d()
        return
      }
      if (g === void 0) {
        d()
        return
      }
      ;((u.current = !0), s(c.current, g))
    }, [t, r, a, s, n, i, c, d]),
    l.useEffect(() => d, [d]),
    o ?? i
  )
}
function ZE(e, t) {
  return (n, r) => {
    if (n == null) return !1
    const o = Rt(n, t)
    return e.contains(o, r)
  }
}
function KE(e, t, n) {
  return (r, o) => {
    if (r == null) return !1
    if (!o) return !0
    const s = Rt(r, t),
      i = n != null ? Rt(n, t) : ''
    return i && e.contains(i, o) && i.length === o.length ? !0 : e.contains(s, o)
  }
}
const pd = new Map()
function um(e) {
  return Array.isArray(e) ? e.map((t) => um(t)).join(',') : e == null ? '' : String(e)
}
function YE(e = {}) {
  const t = { usage: 'search', sensitivity: 'base', ignorePunctuation: !0, ...e },
    n = `${um(e.locale)}|${JSON.stringify(t)}`,
    r = pd.get(n)
  if (r) return r
  const o = new Intl.Collator(e.locale, t),
    s = {
      contains(i, a, c) {
        if (!a) return !0
        const u = Rt(i, c)
        for (let f = 0; f <= u.length - a.length; f += 1)
          if (o.compare(u.slice(f, f + a.length), a) === 0) return !0
        return !1
      },
      startsWith(i, a, c) {
        if (!a) return !0
        const u = Rt(i, c)
        return o.compare(u.slice(0, a.length), a) === 0
      },
      endsWith(i, a, c) {
        if (!a) return !0
        const u = Rt(i, c),
          f = a.length
        return u.length >= f && o.compare(u.slice(u.length - f), a) === 0
      },
    }
  return (pd.set(n, s), s)
}
const qE = YE
function ys(e, t) {
  const n = l.useRef(e),
    r = ne(t)
  ;(ae(() => {
    n.current !== e && r(n.current)
  }, [e, r]),
    ae(() => {
      n.current = e
    }, [e]))
}
const dm = Symbol('none'),
  nr = { value: dm, index: -1 }
function XE(e) {
  const {
      id: t,
      onOpenChangeComplete: n,
      defaultSelectedValue: r = null,
      selectedValue: o,
      onSelectedValueChange: s,
      defaultInputValue: i,
      inputValue: a,
      selectionMode: c = 'none',
      onItemHighlighted: u,
      name: f,
      disabled: d = !1,
      readOnly: g = !1,
      required: h = !1,
      inputRef: m,
      grid: p = !1,
      items: b,
      filteredItems: y,
      filter: v,
      openOnInputClick: C = !0,
      autoHighlight: w = !1,
      keepHighlight: x = !1,
      highlightItemOnHover: S = !0,
      loopFocus: k = !0,
      itemToStringLabel: R,
      itemToStringValue: M,
      isItemEqualToValue: j = jE,
      virtualized: P = !1,
      inline: I = !1,
      fillInputOnItemPress: T = !0,
      modal: O = !1,
      limit: L = -1,
      autoComplete: A = 'list',
      formAutoComplete: z,
      locale: D,
      submitOnItemClick: $ = !1,
    } = e,
    { clearErrors: F } = lm(),
    {
      setDirty: Q,
      validityData: q,
      shouldValidateOnChange: se,
      setFilled: Y,
      name: oe,
      disabled: te,
      setTouched: le,
      setFocused: ve,
      validationMode: X,
      validation: me,
    } = Oi(),
    he = cm({ id: t }),
    V = qE({ locale: D }),
    [Z, K] = l.useState(!1),
    [xe, N] = l.useState(null),
    U = l.useRef([]),
    B = l.useRef([]),
    _ = l.useRef(null),
    H = l.useRef(null),
    W = l.useRef(null),
    J = l.useRef(!0),
    fe = l.useRef(!1),
    we = l.useRef(null),
    Ae = l.useRef(null),
    st = l.useRef(null),
    He = l.useRef(nr),
    Ee = l.useRef(null),
    _e = l.useRef([]),
    tt = l.useRef([]),
    Qe = te || d,
    it = oe ?? f,
    We = c === 'multiple',
    Se = c === 'single',
    Te = a !== void 0 || i !== void 0,
    Fe = b !== void 0,
    Ne = y !== void 0
  let Me
  w === 'always' ? (Me = 'always') : (Me = w ? 'input-change' : !1)
  const [Ce, pt] = Ro({
      controlled: o,
      default: We ? (r ?? un) : r,
      name: 'Combobox',
      state: 'selectedValue',
    }),
    lt = l.useMemo(
      () => (v === null ? () => !0 : v !== void 0 ? v : Se && !Z ? KE(V, R, Ce) : ZE(V, R)),
      [v, Se, Ce, Z, V, R],
    ),
    Ut = ot(() => (Te ? (i ?? '') : Se ? Rt(Ce, R) : '')).current,
    [nt, lo] = Ro({ controlled: a, default: Ut, name: 'Combobox', state: 'inputValue' }),
    [qe, Fi] = Ro({ controlled: e.open, default: e.defaultOpen, name: 'Combobox', state: 'open' }),
    Vt = dc(b),
    gt = xe ?? (nt === '' ? '' : String(nt).trim()),
    co = Se ? Rt(Ce, R) : '',
    Mr = Se && !Z && gt !== '' && co !== '' && co.length === gt.length && V.contains(co, gt),
    kn = Mr ? '' : gt,
    Qo = Fe && Ne && Mr,
    In = l.useMemo(() => (b ? (Vt ? b.flatMap((ue) => ue.items) : b) : un), [b, Vt]),
    Ht = l.useMemo(() => {
      if (y && !Qo) return y
      if (!b) return un
      if (Vt) {
        const ye = b,
          Ie = []
        let et = 0
        for (const ct of ye) {
          if (L > -1 && et >= L) break
          const ut = kn === '' ? ct.items : ct.items.filter((ss) => lt(ss, kn, R))
          if (ut.length === 0) continue
          const Jn = L > -1 ? L - et : 1 / 0,
            Qn = ut.slice(0, Jn)
          if (Qn.length > 0) {
            const ss = { ...ct, items: Qn }
            ;(Ie.push(ss), (et += Qn.length))
          }
        }
        return Ie
      }
      if (kn === '') return L > -1 ? In.slice(0, L) : In
      const ue = []
      for (const ye of In) {
        if (L > -1 && ue.length >= L) break
        lt(ye, kn, R) && ue.push(ye)
      }
      return ue
    }, [y, Qo, b, Vt, kn, L, lt, R, In]),
    Tt = l.useMemo(() => (Vt ? Ht.flatMap((ye) => ye.items) : Ht), [Ht, Vt]),
    Pe = ot(
      () =>
        new Bg({
          id: he,
          selectedValue: Ce,
          open: qe,
          filter: lt,
          query: gt,
          items: b,
          selectionMode: c,
          listRef: U,
          labelsRef: B,
          popupRef: _,
          emptyRef: W,
          inputRef: H,
          keyboardActiveRef: J,
          chipsContainerRef: we,
          clearRef: Ae,
          valuesRef: _e,
          allValuesRef: tt,
          selectionEventRef: st,
          name: it,
          disabled: Qe,
          readOnly: g,
          required: h,
          grid: p,
          isGrouped: Vt,
          virtualized: P,
          openOnInputClick: C,
          itemToStringLabel: R,
          isItemEqualToValue: j,
          modal: O,
          autoHighlight: Me,
          submitOnItemClick: $,
          hasInputValue: Te,
          mounted: !1,
          forceMounted: !1,
          transitionStatus: 'idle',
          inline: I,
          activeIndex: null,
          selectedIndex: null,
          popupProps: {},
          inputProps: {},
          triggerProps: {},
          positionerElement: null,
          listElement: null,
          triggerElement: null,
          inputElement: null,
          popupSide: null,
          openMethod: null,
          inputInsidePopup: !0,
          onOpenChangeComplete: n || Ue,
          setOpen: Ue,
          setInputValue: Ue,
          setSelectedValue: Ue,
          setIndices: Ue,
          onItemHighlighted: Ue,
          handleSelection: Ue,
          getItemProps: () => Ke,
          forceMount: Ue,
          requestSubmit: Ue,
        }),
    ).current,
    Tn = c === 'none' ? nt : Ce,
    M0 = l.useMemo(
      () => (c === 'none' ? Tn : Array.isArray(Ce) ? Ce.map((ue) => bo(ue, M)) : bo(Ce, M)),
      [Tn, M, c, Ce],
    ),
    $i = ne(u),
    Vi = ne(n),
    es = re(Pe, ie.activeIndex),
    A0 = re(Pe, ie.selectedIndex),
    ts = re(Pe, ie.positionerElement),
    Qc = re(Pe, ie.listElement),
    uo = re(Pe, ie.triggerElement),
    Hi = re(Pe, ie.inputElement),
    Bt = re(Pe, ie.inline),
    Pn = re(Pe, ie.inputInsidePopup),
    z0 = ht(uo),
    { mounted: eu, setMounted: L0, transitionStatus: Bi } = Dl(qe),
    { openMethod: tu, triggerProps: Wi, reset: j0 } = lc(qe)
  GE({
    id: he,
    name: it,
    commit: me.commit,
    value: Tn,
    controlRef: Pn ? z0 : H,
    getValue: () => M0,
  })
  const ns = ne(() => {
      b ? (B.current = Tt.map((ue) => Rt(ue, R))) : Pe.set('forceMounted', !0)
    }),
    D0 = l.useRef(Ce)
  ae(() => {
    Ce !== D0.current && ns()
  }, [ns, Ce])
  const Wt = ne((ue) => {
      Pe.update(ue)
      const ye = ue.type || 'none'
      if (ue.activeIndex !== void 0)
        if (ue.activeIndex === null)
          He.current !== nr && ((He.current = nr), $i(void 0, mo(ye, void 0, { index: -1 })))
        else {
          const Ie = _e.current[ue.activeIndex]
          ;((He.current = { value: Ie, index: ue.activeIndex }),
            $i(Ie, mo(ye, void 0, { index: ue.activeIndex })))
        }
    }),
    Zt = ne((ue, ye) => {
      if (((fe.current = ye.reason === zn), e.onInputValueChange?.(ue, ye), !ye.isCanceled)) {
        if (ye.reason === jr) {
          const Ie = ye.event,
            et = Ie.inputType
          if (
            Ie.type === 'compositionend' ||
            (et != null && et !== '' && et !== 'insertReplacementText')
          ) {
            const ut = ue.trim() !== ''
            ;(ut && K(!0),
              (Ee.current = { hasQuery: ut }),
              ut && Me && Pe.state.activeIndex == null && Pe.set('activeIndex', 0))
          }
        }
        lo(ue)
      }
    }),
    fo = ne((ue, ye) => {
      if (
        qe !== ue &&
        (ye.reason === 'escape-key' &&
          Fe &&
          Tt.length === 0 &&
          !Pe.state.emptyRef.current &&
          ye.allowPropagation(),
        e.onOpenChange?.(ue, ye),
        !ye.isCanceled &&
          (!ue &&
            Z &&
            (Se
              ? (Bt || N(gt), gt === '' && K(!1))
              : We && (Bt || Pn ? Wt({ activeIndex: null }) : N(gt), Zt('', ge(zn, ye.event)))),
          Fi(ue),
          !ue && Pn && (ye.reason === fr || ye.reason === gi) && (le(!0), ve(!1), X === 'onBlur')))
      ) {
        const Ie = c === 'none' ? nt : Ce
        me.commit(Ie)
      }
    }),
    rs = ne((ue, ye) => {
      if ((s?.(ue, ye), ye.isCanceled)) return
      ;(pt(ue),
        ((c === 'none' && _.current && T) || (Se && !Pe.state.inputInsidePopup)) &&
          Zt(Rt(ue, R), ge(ye.reason, ye.event)),
        Se && ue != null && ye.reason !== jr && Z && !Bt && N(gt))
    }),
    N0 = ne((ue, ye) => {
      let Ie = ye
      if (Ie === void 0) {
        if (es === null) return
        Ie = _e.current[es]
      }
      const et = Ge(ue),
        ct = st.current ?? ue
      st.current = null
      const ut = ge(zl, ct),
        Jn = et?.closest('a')?.getAttribute('href')
      if (Jn) {
        Jn.startsWith('#') && fo(!1, ut)
        return
      }
      if (We) {
        const Qn = Array.isArray(Ce) ? Ce : [],
          Y0 = DE(Qn, Ie, Pe.state.isItemEqualToValue)
            ? NE(Qn, Ie, Pe.state.isItemEqualToValue)
            : [...Qn, Ie]
        if ((rs(Y0, ut), !(H.current ? H.current.value.trim() !== '' : !1))) return
        Pe.state.inputInsidePopup ? Zt('', ge(zn, ut.event)) : fo(!1, ut)
      } else (rs(Ie, ut), fo(!1, ut))
    }),
    Gi = ne(() => {
      if (!Pe.state.submitOnItemClick) return
      const ue = Pe.state.inputElement?.form
      ue && typeof ue.requestSubmit == 'function' && ue.requestSubmit()
    }),
    Ui = ne(() => {
      if (
        (L0(!1),
        Vi?.(!1),
        K(!1),
        j0(),
        N(null),
        Wt(c === 'none' ? { activeIndex: null, selectedIndex: null } : { activeIndex: null }),
        We && H.current && H.current.value !== '' && !fe.current && Zt('', ge(zn)),
        Se)
      )
        if (Pe.state.inputInsidePopup) H.current && H.current.value !== '' && Zt('', ge(zn))
        else {
          const ue = Rt(Ce, R)
          H.current && H.current.value !== ue && Zt(ue, ge(ue === '' ? zn : Et))
        }
    }),
    _0 = l.useMemo(() => (Bt && ts ? { current: ts.closest('[role="dialog"]') } : _), [Bt, ts])
  ;(Kn({
    enabled: !e.actionsRef,
    open: qe,
    ref: _0,
    onComplete() {
      qe || Ui()
    },
  }),
    l.useImperativeHandle(e.actionsRef, () => ({ unmount: Ui }), [Ui]),
    ae(
      function () {
        if (qe || c === 'none') return
        const ye = b ? In : tt.current
        if (We) {
          const Ie = Array.isArray(Ce) ? Ce : [],
            et = Ie[Ie.length - 1],
            ct = tl(ye, et, j)
          Wt({ selectedIndex: ct === -1 ? null : ct })
        } else {
          const Ie = tl(ye, Ce, j)
          Wt({ selectedIndex: Ie === -1 ? null : Ie })
        }
      },
      [qe, Ce, b, c, In, We, j, Wt],
    ),
    ae(() => {
      b && ((_e.current = Tt), (U.current.length = Tt.length))
    }, [b, Tt]),
    ae(() => {
      const ue = Ee.current
      if (
        (ue &&
          (ue.hasQuery
            ? Me && Pe.set('activeIndex', 0)
            : Me === 'always' && Pe.set('activeIndex', 0),
          (Ee.current = null)),
        !qe && !Bt)
      )
        return
      const Ie = Fe || Ne ? Tt : _e.current,
        et = Pe.state.activeIndex
      if (et == null) {
        if (Me === 'always' && Ie.length > 0) {
          Pe.set('activeIndex', 0)
          return
        }
        He.current !== nr &&
          ((He.current = nr), Pe.state.onItemHighlighted(void 0, mo(Et, void 0, { index: -1 })))
        return
      }
      if (et >= Ie.length) {
        ;(He.current !== nr &&
          ((He.current = nr), Pe.state.onItemHighlighted(void 0, mo(Et, void 0, { index: -1 }))),
          Pe.set('activeIndex', null))
        return
      }
      const ct = Ie[et],
        ut = He.current.value,
        Jn = ut !== dm && mr(ct, ut, Pe.state.isItemEqualToValue)
      ;(He.current.index !== et || !Jn) &&
        ((He.current = { value: ct, index: et }),
        Pe.state.onItemHighlighted(ct, mo(Et, void 0, { index: et })))
    }, [es, Me, Ne, Fe, Tt, Bt, qe, Pe]),
    ae(() => {
      if (c === 'none') {
        Y(String(nt) !== '')
        return
      }
      Y(We ? Array.isArray(Ce) && Ce.length > 0 : Ce != null)
    }, [Y, c, nt, Ce, We]),
    l.useEffect(() => {
      Fe && Me && Tt.length === 0 && Wt({ activeIndex: null })
    }, [Fe, Me, Tt.length, Wt]),
    ys(gt, () => {
      !qe || gt === '' || gt === String(Ut) || K(!0)
    }),
    ys(Ce, () => {
      if (
        c !== 'none' &&
        (F(it),
        Q(Ce !== q.initialValue),
        se() ? me.commit(Ce) : me.commit(Ce, !0),
        Se && !Te && !Pn)
      ) {
        const ue = Rt(Ce, R)
        nt !== ue && Zt(ue, ge(Et))
      }
    }),
    ys(nt, () => {
      c === 'none' && (F(it), Q(nt !== q.initialValue), se() ? me.commit(nt) : me.commit(nt, !0))
    }),
    ys(b, () => {
      if (!Se || Te || Pn || Z) return
      const ue = Rt(Ce, R)
      nt !== ue && Zt(ue, ge(Et))
    }))
  const os = Ug({
    open: Bt ? !0 : qe,
    onOpenChange: fo,
    elements: { reference: Pn ? uo : Hi, floating: ts },
  })
  let Zi, Ki
  Bt || ((Zi = p ? 'grid' : 'listbox'), (Ki = qe ? 'true' : 'false'))
  const F0 = l.useMemo(() => {
      const ue = Hi?.tagName === 'INPUT',
        ye = ue || qe,
        Ie = ue
          ? { autoComplete: 'off', spellCheck: 'false', autoCorrect: 'off', autoCapitalize: 'none' }
          : {}
      return (
        ye &&
          ((Ie.role = 'combobox'),
          (Ie['aria-expanded'] = Ki),
          (Ie['aria-haspopup'] = Zi),
          (Ie['aria-controls'] = qe ? Qc?.id : void 0),
          (Ie['aria-autocomplete'] = A)),
        { reference: Ie, floating: { role: 'presentation' } }
      )
    }, [Hi, qe, Ki, Zi, Qc?.id, A]),
    $0 = Si(os, {
      enabled: !g && !Qe && C,
      event: 'mousedown-only',
      toggle: !1,
      touchOpenDelay: Pn ? 0 : 50,
      reason: fw,
    }),
    V0 = Ri(os, {
      enabled: !g && !Qe && !Bt,
      outsidePressEvent: { mouse: 'sloppy', touch: 'intentional' },
      bubbles: Bt ? !0 : void 0,
      outsidePress(ue) {
        const ye = Ge(ue)
        return !be(uo, ye) && !be(Ae.current, ye) && !be(we.current, ye)
      },
    }),
    H0 = qg(os, {
      enabled: !g && !Qe,
      id: he,
      listRef: U,
      activeIndex: es,
      selectedIndex: A0,
      virtual: !0,
      loopFocus: k,
      allowEscape: k && !Me,
      focusItemOnOpen: Z || (c === 'none' && !Me) ? !1 : 'auto',
      focusItemOnHover: S,
      resetOnPointerLeave: !x,
      cols: p ? 2 : 1,
      orientation: p ? 'horizontal' : void 0,
      disabledIndices: un,
      onNavigate(ue, ye) {
        ;(!ye && !qe) ||
          Bi === 'ending' ||
          Wt(
            ye
              ? { activeIndex: ue, type: J.current ? 'keyboard' : 'pointer' }
              : { activeIndex: ue },
          )
      },
    }),
    { getReferenceProps: Yi, getFloatingProps: qi, getItemProps: Xi } = oo([F0, $0, V0, H0])
  ;(uc(() => {
    Pe.update({
      inline: I,
      popupProps: qi(),
      inputProps: Yi(),
      triggerProps: Wi,
      getItemProps: Xi,
      setOpen: fo,
      setInputValue: Zt,
      setSelectedValue: rs,
      setIndices: Wt,
      onItemHighlighted: $i,
      handleSelection: N0,
      forceMount: ns,
      requestSubmit: Gi,
    })
  }),
    ae(() => {
      Pe.update({
        id: he,
        selectedValue: Ce,
        open: qe,
        mounted: eu,
        transitionStatus: Bi,
        items: b,
        inline: I,
        popupProps: qi(),
        inputProps: Yi(),
        triggerProps: Wi,
        openMethod: tu,
        getItemProps: Xi,
        selectionMode: c,
        name: it,
        disabled: Qe,
        readOnly: g,
        required: h,
        grid: p,
        isGrouped: Vt,
        virtualized: P,
        onOpenChangeComplete: Vi,
        openOnInputClick: C,
        itemToStringLabel: R,
        modal: O,
        autoHighlight: Me,
        isItemEqualToValue: j,
        submitOnItemClick: $,
        hasInputValue: Te,
        requestSubmit: Gi,
      })
    }, [
      Pe,
      he,
      Ce,
      qe,
      eu,
      Bi,
      b,
      qi,
      Yi,
      Xi,
      tu,
      Wi,
      c,
      it,
      Qe,
      g,
      h,
      me,
      p,
      Vt,
      P,
      Vi,
      C,
      R,
      O,
      j,
      $,
      Te,
      I,
      Gi,
      Me,
    ]))
  const B0 = Vn(m, me.inputRef),
    W0 = l.useMemo(
      () => ({ query: gt, hasItems: Fe, filteredItems: Ht, flatFilteredItems: Tt }),
      [gt, Fe, Ht, Tt],
    ),
    G0 = l.useMemo(() => (Array.isArray(Tn) ? '' : bo(Tn, M)), [Tn, M]),
    U0 = We && Array.isArray(Ce) && Ce.length > 0,
    Ji = We || c === 'none' ? void 0 : it,
    Z0 = l.useMemo(
      () =>
        !We || !Array.isArray(Ce) || !it
          ? null
          : Ce.map((ue) => {
              const ye = bo(ue, M)
              return E.jsx('input', { type: 'hidden', name: it, value: ye }, ye)
            }),
      [We, Ce, it, M],
    ),
    K0 = E.jsxs(l.Fragment, {
      children: [
        e.children,
        E.jsx('input', {
          ...me.getInputValidationProps({
            onFocus() {
              if (Pn) {
                uo?.focus()
                return
              }
              ;(H.current || uo)?.focus()
            },
            onChange(ue) {
              if (ue.nativeEvent.defaultPrevented) return
              const ye = ue.target.value,
                Ie = ge(Et, ue.nativeEvent)
              function et() {
                if (We) return
                if (c === 'none') {
                  ;(Q(ye !== q.initialValue), Zt(ye, Ie), se() && me.commit(ye))
                  return
                }
                const ct = _e.current.find((ut) => bo(ut, M).toLowerCase() === ye.toLowerCase())
                ct != null && (Q(ct !== q.initialValue), rs?.(ct, Ie), se() && me.commit(ct))
              }
              b ? et() : (ns(), queueMicrotask(et))
            },
          }),
          id: he && Ji == null ? `${he}-hidden-input` : void 0,
          name: Ji,
          autoComplete: z,
          disabled: Qe,
          required: h && !U0,
          readOnly: g,
          value: G0,
          ref: B0,
          style: Ji ? IC : Ci,
          tabIndex: -1,
          'aria-hidden': !0,
        }),
        Z0,
      ],
    })
  return E.jsx(nm.Provider, {
    value: Pe,
    children: E.jsx(rm.Provider, {
      value: os,
      children: E.jsx(om.Provider, {
        value: W0,
        children: E.jsx(sm.Provider, { value: nt, children: K0 }),
      }),
    }),
  })
}
const fm = {
  ...ni,
  ...VE,
  popupSide: (e) => (e ? { 'data-popup-side': e } : null),
  listEmpty: (e) => (e ? { 'data-list-empty': '' } : null),
}
function pm(e) {
  const t = e.getBoundingClientRect(),
    n = window.getComputedStyle(e, '::before'),
    r = window.getComputedStyle(e, '::after')
  if (!(n.content !== 'none' || r.content !== 'none')) return t
  const s = parseFloat(n.width) || 0,
    i = parseFloat(n.height) || 0,
    a = parseFloat(r.width) || 0,
    c = parseFloat(r.height) || 0,
    u = Math.max(t.width, s, a),
    f = Math.max(t.height, i, c),
    d = u - t.width,
    g = f - t.height
  return {
    left: t.left - d / 2,
    right: t.right + d / 2,
    top: t.top - g / 2,
    bottom: t.bottom + g / 2,
  }
}
const xs = 2,
  JE = l.forwardRef(function (t, n) {
    const { render: r, className: o, nativeButton: s = !0, disabled: i = !1, id: a, ...c } = t,
      {
        state: u,
        disabled: f,
        setTouched: d,
        setFocused: g,
        validationMode: h,
        validation: m,
      } = Oi(),
      { labelId: p } = fc(),
      b = Rn(),
      { filteredItems: y } = Xn(),
      v = re(b, ie.selectionMode),
      C = re(b, ie.disabled),
      w = re(b, ie.readOnly),
      x = re(b, ie.required),
      S = re(b, ie.mounted),
      k = re(b, ie.popupSide),
      R = re(b, ie.positionerElement),
      M = re(b, ie.listElement),
      j = re(b, ie.triggerProps),
      P = re(b, ie.triggerElement),
      I = re(b, ie.inputInsidePopup),
      T = re(b, ie.id),
      O = re(b, ie.open),
      L = re(b, ie.selectedValue),
      A = re(b, ie.activeIndex),
      z = re(b, ie.selectedIndex),
      D = re(b, ie.hasSelectedValue),
      $ = Pi(),
      F = im(),
      Q = bt(),
      q = f || C || i,
      se = y.length === 0,
      Y = S && R ? k : null
    cm({ id: I ? a : void 0 })
    const oe = I ? (a ?? T) : a,
      te = l.useRef('')
    function le(N) {
      te.current = N.pointerType
    }
    const ve = $.useState('domReferenceElement')
    l.useEffect(() => {
      I && P && P !== ve && $.set('domReferenceElement', P)
    }, [P, ve, $, I])
    const { reference: X } = Jg($, {
        enabled: !O && !w && !C && v === 'single',
        listRef: b.state.labelsRef,
        activeIndex: A,
        selectedIndex: z,
        onMatch(N) {
          const U = b.state.valuesRef.current[N]
          U !== void 0 && b.state.setSelectedValue(U, ge('none'))
        },
      }),
      { reference: me } = Si($, { enabled: !w && !C, event: 'mousedown' }),
      { buttonRef: he, getButtonProps: V } = Rr({ native: s, disabled: q }),
      Z = { ...u, open: O, disabled: q, popupSide: Y, listEmpty: se, placeholder: !D },
      K = ne((N) => {
        b.set('triggerElement', N)
      })
    return Oe('button', t, {
      ref: [n, he, K],
      state: Z,
      props: [
        j,
        me,
        X,
        {
          id: oe,
          tabIndex: I ? 0 : -1,
          role: I ? 'combobox' : void 0,
          'aria-expanded': O ? 'true' : 'false',
          'aria-haspopup': I ? 'dialog' : 'listbox',
          'aria-controls': O ? M?.id : void 0,
          'aria-required': (I && x) || void 0,
          'aria-labelledby': p,
          onPointerDown: le,
          onPointerEnter: le,
          onFocus() {
            ;(g(!0), !(q || w) && Q.start(0, b.state.forceMount))
          },
          onBlur(N) {
            if (!be(R, N.relatedTarget) && (d(!0), g(!1), h === 'onBlur')) {
              const U = v === 'none' ? F : L
              m.commit(U)
            }
          },
          onMouseDown(N) {
            if (
              q ||
              w ||
              (I || $.set('domReferenceElement', N.currentTarget),
              b.state.forceMount(),
              te.current !== 'touch' &&
                (b.state.inputRef.current?.focus(), I || N.preventDefault()),
              O)
            )
              return
            const U = ke(N.currentTarget)
            function B(_) {
              if (!P) return
              const H = Ge(_),
                W = b.state.positionerElement,
                J = b.state.listElement
              if (be(P, H) || be(W, H) || be(J, H) || H === P) return
              const fe = pm(P),
                we = _.clientX >= fe.left - xs && _.clientX <= fe.right + xs,
                Ae = _.clientY >= fe.top - xs && _.clientY <= fe.bottom + xs
              ;(we && Ae) || b.state.setOpen(!1, ge('cancel-open', _))
            }
            I && U.addEventListener('mouseup', B, { once: !0 })
          },
          onKeyDown(N) {
            q ||
              w ||
              ((N.key === 'ArrowDown' || N.key === 'ArrowUp') &&
                (Je(N),
                b.state.setOpen(!0, ge(Io, N.nativeEvent)),
                b.state.inputRef.current?.focus()))
          },
        },
        m ? m.getValidationProps(c) : c,
        V,
      ],
      stateAttributesMapping: fm,
    })
  }),
  QE = l.createContext(void 0)
function eR() {
  return l.useContext(QE)
}
const gm = l.createContext(void 0)
function pc(e) {
  const t = l.useContext(gm)
  if (t === void 0 && !e) throw new Error(Ve(21))
  return t
}
const tR = l.forwardRef(function (t, n) {
    const { render: r, className: o, disabled: s = !1, id: i, ...a } = t,
      {
        state: c,
        disabled: u,
        setTouched: f,
        setFocused: d,
        validationMode: g,
        validation: h,
      } = Oi(),
      { labelId: m } = fc(),
      p = eR(),
      y = !!pc(!0),
      v = Rn(),
      { filteredItems: C } = Xn(),
      w = im(),
      x = pi(),
      S = re(v, ie.required),
      k = re(v, ie.disabled),
      R = re(v, ie.readOnly),
      M = re(v, ie.name),
      j = re(v, ie.selectionMode),
      P = re(v, ie.autoHighlight),
      I = re(v, ie.inputProps),
      T = re(v, ie.triggerProps),
      O = re(v, ie.open),
      L = re(v, ie.mounted),
      A = re(v, ie.selectedValue),
      z = re(v, ie.popupSide),
      D = re(v, ie.positionerElement),
      $ = re(v, ie.id),
      F = re(v, ie.inline),
      Q = !!P,
      q = L && D ? z : null,
      se = u || k || s,
      Y = C.length === 0,
      te = Gn(i ?? (y || F ? void 0 : $)),
      [le, ve] = l.useState(null),
      X = l.useRef(!1),
      me = l.useRef(null),
      he = l.useRef(!1),
      V = ne((N) => {
        const U = y || v.state.inline
        ;(U && !v.state.hasInputValue && v.state.setInputValue('', ge(Et)),
          v.update({ inputElement: N, inputInsidePopup: U }))
      }),
      Z = { ...c, open: O, disabled: se, readOnly: R, popupSide: q, listEmpty: Y }
    function K(N) {
      if (!p) return
      let U
      const { highlightedChipIndex: B } = p
      if (B !== void 0) {
        if (N.key === 'ArrowLeft') (N.preventDefault(), B > 0 ? (U = B - 1) : (U = void 0))
        else if (N.key === 'ArrowRight')
          (N.preventDefault(), B < A.length - 1 ? (U = B + 1) : (U = void 0))
        else if (N.key === 'Backspace' || N.key === 'Delete') {
          N.preventDefault()
          const _ = B >= A.length - 1 ? A.length - 2 : B
          ;((U = _ >= 0 ? _ : void 0),
            v.state.setIndices({ activeIndex: null, selectedIndex: null, type: 'keyboard' }))
        }
        return U
      }
      return (
        N.key === 'ArrowLeft' && (N.currentTarget.selectionStart ?? 0) === 0 && A.length > 0
          ? (N.preventDefault(), (U = Math.max(A.length - 1, 0)))
          : N.key === 'Backspace' &&
            N.currentTarget.value === '' &&
            A.length > 0 &&
            (v.state.setIndices({ activeIndex: null, selectedIndex: null, type: 'keyboard' }),
            N.preventDefault()),
        U
      )
    }
    return Oe('input', t, {
      state: Z,
      ref: [n, v.state.inputRef, V],
      props: [
        I,
        T,
        {
          type: 'text',
          value: t.value ?? le ?? w,
          'aria-readonly': R || void 0,
          'aria-required': S || void 0,
          'aria-labelledby': m,
          disabled: se,
          readOnly: R,
          required: j === 'none' ? S : void 0,
          ...(j === 'none' && M && { name: M }),
          id: te,
          onFocus() {
            if ((d(!0), !F || !he.current)) return
            he.current = !1
            const N = me.current
            N == null ||
              !Object.hasOwn(v.state.valuesRef.current, N) ||
              v.state.setIndices({ activeIndex: N })
          },
          onBlur() {
            ;(f(!0), d(!1))
            const N = v.state.activeIndex
            if (
              (F &&
                N !== null &&
                P !== 'always' &&
                ((me.current = N), (he.current = !0), v.state.setIndices({ activeIndex: null })),
              g === 'onBlur')
            ) {
              const U = j === 'none' ? w : A
              h.commit(U)
            }
          },
          onCompositionStart(N) {
            Hs || ((X.current = !0), ve(N.currentTarget.value))
          },
          onCompositionEnd(N) {
            X.current = !1
            const U = N.currentTarget.value
            ;(ve(null), v.state.setInputValue(U, ge(jr, N.nativeEvent)))
          },
          onChange(N) {
            const U = N.nativeEvent.inputType,
              B = !U || U === 'insertReplacementText',
              _ = X.current || !B
            if (X.current) {
              const fe = N.currentTarget.value
              ;(ve(fe),
                fe === '' &&
                  !v.state.openOnInputClick &&
                  !v.state.inputInsidePopup &&
                  v.state.setOpen(!1, ge(zn, N.nativeEvent)))
              const we = fe.trim(),
                Ae = Q && we !== ''
              ;(!R &&
                !se &&
                we &&
                _ &&
                (v.state.setOpen(!0, ge(jr, N.nativeEvent)),
                Q ||
                  v.state.setIndices({
                    activeIndex: null,
                    selectedIndex: null,
                    type: v.state.keyboardActiveRef.current ? 'keyboard' : 'pointer',
                  })),
                O &&
                  v.state.activeIndex !== null &&
                  !Ae &&
                  v.state.setIndices({
                    activeIndex: null,
                    selectedIndex: null,
                    type: v.state.keyboardActiveRef.current ? 'keyboard' : 'pointer',
                  }))
              return
            }
            v.state.setInputValue(N.currentTarget.value, ge(jr, N.nativeEvent))
            const H = N.currentTarget.value === '',
              W = ge(zn, N.nativeEvent)
            H &&
              !v.state.inputInsidePopup &&
              (j === 'single' && v.state.setSelectedValue(null, W),
              v.state.openOnInputClick || v.state.setOpen(!1, W))
            const J = N.currentTarget.value.trim()
            ;(!R &&
              !se &&
              J &&
              _ &&
              (v.state.setOpen(!0, ge(jr, N.nativeEvent)),
              Q ||
                v.state.setIndices({
                  activeIndex: null,
                  selectedIndex: null,
                  type: v.state.keyboardActiveRef.current ? 'keyboard' : 'pointer',
                })),
              O &&
                v.state.activeIndex !== null &&
                !Q &&
                v.state.setIndices({
                  activeIndex: null,
                  selectedIndex: null,
                  type: v.state.keyboardActiveRef.current ? 'keyboard' : 'pointer',
                }))
          },
          onKeyDown(N) {
            if (se || R || N.ctrlKey || N.shiftKey || N.altKey || N.metaKey) return
            v.state.keyboardActiveRef.current = !0
            const U = N.currentTarget,
              B = U.scrollWidth - U.clientWidth,
              _ = x === 'rtl'
            if (N.key === 'Home') {
              Je(N)
              const J = Lu && _ ? U.value.length : 0
              ;(U.setSelectionRange(J, J), (U.scrollLeft = 0))
              return
            }
            if (N.key === 'End') {
              Je(N)
              const J = Lu && _ ? 0 : U.value.length
              ;(U.setSelectionRange(J, J), (U.scrollLeft = _ ? -B : B))
              return
            }
            if (!L && N.key === 'Escape') {
              const J = j === 'multiple' && Array.isArray(A) ? A.length === 0 : A === null,
                fe = ge(Bo, N.nativeEvent),
                we = j === 'multiple' ? [] : null
              ;(v.state.setInputValue('', fe),
                v.state.setSelectedValue(we, fe),
                !J && !v.state.inline && !fe.isPropagationAllowed && N.stopPropagation())
              return
            }
            if (
              p &&
              N.key === 'Backspace' &&
              U.value === '' &&
              p.highlightedChipIndex === void 0 &&
              Array.isArray(A) &&
              A.length > 0
            ) {
              const J = A.slice(0, -1)
              ;(v.state.setIndices({
                activeIndex: null,
                selectedIndex: null,
                type: v.state.keyboardActiveRef.current ? 'keyboard' : 'pointer',
              }),
                v.state.setSelectedValue(J, ge(Et, N.nativeEvent)))
              return
            }
            const H = p?.highlightedChipIndex !== void 0,
              W = K(N)
            if (
              (p?.setHighlightedChipIndex(W),
              W !== void 0
                ? p?.chipsRef.current[W]?.focus()
                : H && v.state.inputRef.current?.focus(),
              N.which !== 229 && N.key === 'Enter' && O)
            ) {
              const J = v.state.activeIndex,
                fe = N.nativeEvent
              if (J === null) {
                v.state.setOpen(!1, ge(Et, fe))
                return
              }
              Je(N)
              const we = v.state.listRef.current[J]
              we &&
                ((v.state.selectionEventRef.current = fe),
                we.click(),
                (v.state.selectionEventRef.current = null))
            }
          },
          onPointerMove() {
            v.state.keyboardActiveRef.current = !1
          },
          onPointerDown() {
            v.state.keyboardActiveRef.current = !1
          },
        },
        h ? h.getValidationProps(a) : a,
      ],
      stateAttributesMapping: fm,
    })
  }),
  nR = l.forwardRef(function (t, n) {
    const { className: r, render: o, ...s } = t
    return Oe('span', t, { ref: n, props: [{ 'aria-hidden': !0, children: '▼' }, s] })
  }),
  mm = l.createContext(null)
function rR() {
  return l.useContext(mm)
}
function oR(e) {
  const { children: t, items: n } = e,
    r = l.useMemo(() => ({ items: n }), [n])
  return E.jsx(mm.Provider, { value: r, children: t })
}
function sR(e) {
  const { children: t } = e,
    { filteredItems: n } = Xn(),
    r = rR(),
    o = r ? r.items : n
  return o ? E.jsx(l.Fragment, { children: o.map(t) }) : null
}
const iR = l.forwardRef(function (t, n) {
    var r
    const { render: o, className: s, children: i, ...a } = t,
      c = Rn(),
      u = Pi(),
      f = !!pc(!0),
      { filteredItems: d } = Xn(),
      g = re(c, ie.items),
      h = re(c, ie.labelsRef),
      m = re(c, ie.listRef),
      p = re(c, ie.selectionMode),
      b = re(c, ie.grid),
      y = re(c, ie.popupProps),
      v = re(c, ie.disabled),
      C = re(c, ie.readOnly),
      w = re(c, ie.virtualized),
      x = p === 'multiple',
      S = d.length === 0,
      k = ne((T) => {
        c.set('positionerElement', T)
      }),
      R = ne((T) => {
        c.set('listElement', T)
      }),
      M = l.useMemo(
        () => (typeof i == 'function' ? r || (r = E.jsx(sR, { children: i })) : i),
        [i],
      ),
      j = { empty: S },
      P = u.useState('floatingId'),
      I = Oe('div', t, {
        state: j,
        ref: [n, R, f ? null : k],
        props: [
          y,
          {
            children: M,
            tabIndex: -1,
            id: P,
            role: b ? 'grid' : 'listbox',
            'aria-multiselectable': x ? 'true' : void 0,
            onKeyDown(T) {
              if (!(v || C) && T.key === 'Enter') {
                const O = c.state.activeIndex
                if (O == null) return
                Je(T)
                const L = T.nativeEvent,
                  A = c.state.listRef.current[O]
                A &&
                  ((c.state.selectionEventRef.current = L),
                  A.click(),
                  (c.state.selectionEventRef.current = null))
              }
            },
            onKeyDownCapture() {
              c.state.keyboardActiveRef.current = !0
            },
            onPointerMoveCapture() {
              c.state.keyboardActiveRef.current = !1
            },
          },
          a,
        ],
      })
    return w ? I : E.jsx(Ml, { elementsRef: m, labelsRef: g ? void 0 : h, children: I })
  }),
  hm = l.createContext(void 0)
function aR() {
  const e = l.useContext(hm)
  if (e === void 0) throw new Error(Ve(20))
  return e
}
const lR = l.forwardRef(function (t, n) {
    const { keepMounted: r = !1, ...o } = t,
      s = Rn(),
      i = re(s, ie.mounted),
      a = re(s, ie.forceMounted)
    return i || r || a
      ? E.jsx(hm.Provider, { value: r, children: E.jsx(Kl, { ref: n, ...o }) })
      : null
  }),
  cR = (e) => ({
    name: 'arrow',
    options: e,
    async fn(t) {
      const { x: n, y: r, placement: o, rects: s, platform: i, elements: a, middlewareData: c } = t,
        { element: u, padding: f = 0, offsetParent: d = 'real' } = vn(e, t) || {}
      if (u == null) return {}
      const g = rg(f),
        h = { x: n, y: r },
        m = Wl(o),
        p = Bl(m),
        b = await i.getDimensions(u),
        y = m === 'y',
        v = y ? 'top' : 'left',
        C = y ? 'bottom' : 'right',
        w = y ? 'clientHeight' : 'clientWidth',
        x = s.reference[p] + s.reference[m] - h[m] - s.floating[p],
        S = h[m] - s.reference[m],
        k = d === 'real' ? await i.getOffsetParent?.(u) : a.floating
      let R = a.floating[w] || s.floating[p]
      ;(!R || !(await i.isElement?.(k))) && (R = a.floating[w] || s.floating[p])
      const M = x / 2 - S / 2,
        j = R / 2 - b[p] / 2 - 1,
        P = Math.min(g[v], j),
        I = Math.min(g[C], j),
        T = P,
        O = R - b[p] - I,
        L = R / 2 - b[p] / 2 + M,
        A = ng(T, L, O),
        z =
          !c.arrow &&
          Zn(o) != null &&
          L !== A &&
          s.reference[p] / 2 - (L < T ? P : I) - b[p] / 2 < 0,
        D = z ? (L < T ? L - T : L - O) : 0
      return {
        [m]: h[m] + D,
        data: { [m]: A, centerOffset: L - A - D, ...(z && { alignmentOffset: D }) },
        reset: z,
      }
    },
  }),
  uR = (e, t) => ({ ...cR(e), options: [e, t] }),
  dR = {
    name: 'hide',
    async fn(e) {
      const { width: t, height: n, x: r, y: o } = e.rects.reference,
        s = t === 0 && n === 0 && r === 0 && o === 0
      return { data: { referenceHidden: (await RS().fn(e)).data?.referenceHidden || s } }
    },
  },
  zs = { sideX: 'left', sideY: 'top' },
  fR = {
    name: 'adaptiveOrigin',
    async fn(e) {
      const {
          x: t,
          y: n,
          rects: { floating: r },
          elements: { floating: o },
          platform: s,
          strategy: i,
          placement: a,
        } = e,
        c = Ye(o),
        u = c.getComputedStyle(o)
      if (!(u.transitionDuration !== '0s' && u.transitionDuration !== ''))
        return { x: t, y: n, data: zs }
      const d = await s.getOffsetParent?.(o)
      let g = { width: 0, height: 0 }
      if (i === 'fixed' && c?.visualViewport)
        g = { width: c.visualViewport.width, height: c.visualViewport.height }
      else if (d === c) {
        const v = ke(o)
        g = { width: v.documentElement.clientWidth, height: v.documentElement.clientHeight }
      } else (await s.isElement?.(d)) && (g = await s.getDimensions(d))
      const h = Pt(a)
      let m = t,
        p = n
      ;(h === 'left' && (m = g.width - (t + r.width)),
        h === 'top' && (p = g.height - (n + r.height)))
      const b = h === 'left' ? 'right' : zs.sideX,
        y = h === 'top' ? 'bottom' : zs.sideY
      return { x: m, y: p, data: { sideX: b, sideY: y } }
    },
  }
function bm(e, t, n) {
  const r = e === 'inline-start' || e === 'inline-end'
  return {
    top: 'top',
    right: r ? (n ? 'inline-start' : 'inline-end') : 'right',
    bottom: 'bottom',
    left: r ? (n ? 'inline-end' : 'inline-start') : 'left',
  }[t]
}
function gd(e, t, n) {
  const { rects: r, placement: o } = e
  return {
    side: bm(t, Pt(o), n),
    align: Zn(o) || 'center',
    anchor: { width: r.reference.width, height: r.reference.height },
    positioner: { width: r.floating.width, height: r.floating.height },
  }
}
function gc(e) {
  const {
      anchor: t,
      positionMethod: n = 'absolute',
      side: r = 'bottom',
      sideOffset: o = 0,
      align: s = 'center',
      alignOffset: i = 0,
      collisionBoundary: a,
      collisionPadding: c = 5,
      sticky: u = !1,
      arrowPadding: f = 5,
      disableAnchorTracking: d = !1,
      keepMounted: g = !1,
      floatingRootContext: h,
      mounted: m,
      collisionAvoidance: p,
      shiftCrossAxis: b = !1,
      nodeId: y,
      adaptiveOrigin: v,
      lazyFlip: C = !1,
      externalTree: w,
    } = e,
    [x, S] = l.useState(null)
  !m && x !== null && S(null)
  const k = p.side || 'flip',
    R = p.align || 'flip',
    M = p.fallbackAxisSide || 'end',
    j = typeof t == 'function' ? t : void 0,
    P = ne(j),
    I = j ? P : t,
    T = ht(t),
    L = pi() === 'rtl',
    A =
      x ||
      {
        top: 'top',
        right: 'right',
        bottom: 'bottom',
        left: 'left',
        'inline-end': L ? 'left' : 'right',
        'inline-start': L ? 'right' : 'left',
      }[r],
    z = s === 'center' ? A : `${A}-${s}`
  let D = c
  const $ = 1,
    F = r === 'bottom' ? $ : 0,
    Q = r === 'top' ? $ : 0,
    q = r === 'right' ? $ : 0,
    se = r === 'left' ? $ : 0
  typeof D == 'number'
    ? (D = { top: D + F, right: D + se, bottom: D + Q, left: D + q })
    : D &&
      (D = {
        top: (D.top || 0) + F,
        right: (D.right || 0) + se,
        bottom: (D.bottom || 0) + Q,
        left: (D.left || 0) + q,
      })
  const Y = { boundary: a === 'clipping-ancestors' ? 'clippingAncestors' : a, padding: D },
    oe = l.useRef(null),
    te = ht(o),
    le = ht(i),
    me = [
      xS(
        (Ne) => {
          const Me = gd(Ne, r, L),
            Ce = typeof te.current == 'function' ? te.current(Me) : te.current,
            pt = typeof le.current == 'function' ? le.current(Me) : le.current
          return { mainAxis: Ce, crossAxis: pt, alignmentAxis: pt }
        },
        [typeof o != 'function' ? o : 0, typeof i != 'function' ? i : 0, L, r],
      ),
    ],
    he = R === 'none' && k !== 'shift',
    V = !he && (u || b || k === 'shift'),
    Z =
      k === 'none'
        ? null
        : SS({
            ...Y,
            padding: { top: D.top + $, right: D.right + $, bottom: D.bottom + $, left: D.left + $ },
            mainAxis: !b && k === 'flip',
            crossAxis: R === 'flip' ? 'alignment' : !1,
            fallbackAxisSideDirection: M,
          }),
    K = he
      ? null
      : wS(
          (Ne) => {
            const Me = ke(Ne.elements.floating).documentElement
            return {
              ...Y,
              rootBoundary: b
                ? { x: 0, y: 0, width: Me.clientWidth, height: Me.clientHeight }
                : void 0,
              mainAxis: R !== 'none',
              crossAxis: V,
              limiter:
                u || b
                  ? void 0
                  : CS((Ce) => {
                      if (!oe.current) return {}
                      const { width: pt, height: lt } = oe.current.getBoundingClientRect(),
                        Ut = Lt(Pt(Ce.placement)),
                        nt = Ut === 'y' ? pt : lt,
                        lo = Ut === 'y' ? D.left + D.right : D.top + D.bottom
                      return { offset: nt / 2 + lo / 2 }
                    }),
            }
          },
          [Y, u, b, D, R],
        )
  ;(k === 'shift' || R === 'shift' || s === 'center' ? me.push(K, Z) : me.push(Z, K),
    me.push(
      ES({
        ...Y,
        apply({
          elements: { floating: Ne },
          rects: { reference: Me },
          availableWidth: Ce,
          availableHeight: pt,
        }) {
          const lt = Ne.style
          ;(lt.setProperty('--available-width', `${Ce}px`),
            lt.setProperty('--available-height', `${pt}px`),
            lt.setProperty('--anchor-width', `${Me.width}px`),
            lt.setProperty('--anchor-height', `${Me.height}px`))
        },
      }),
      uR(
        () => ({
          element: oe.current || document.createElement('div'),
          padding: f,
          offsetParent: 'floating',
        }),
        [f],
      ),
      {
        name: 'transformOrigin',
        fn(Ne) {
          const { elements: Me, middlewareData: Ce, placement: pt, rects: lt, y: Ut } = Ne,
            nt = Pt(pt),
            lo = Lt(nt),
            qe = oe.current,
            Fi = Ce.arrow?.x || 0,
            Vt = Ce.arrow?.y || 0,
            gt = qe?.clientWidth || 0,
            co = qe?.clientHeight || 0,
            Mr = Fi + gt / 2,
            kn = Vt + co / 2,
            Qo = Math.abs(Ce.shift?.y || 0),
            In = lt.reference.height / 2,
            Ht = typeof o == 'function' ? o(gd(Ne, r, L)) : o,
            Tt = Qo > Ht,
            Pe = {
              top: `${Mr}px calc(100% + ${Ht}px)`,
              bottom: `${Mr}px ${-Ht}px`,
              left: `calc(100% + ${Ht}px) ${kn}px`,
              right: `${-Ht}px ${kn}px`,
            }[nt],
            Tn = `${Mr}px ${lt.reference.y + In - Ut}px`
          return (
            Me.floating.style.setProperty('--transform-origin', V && lo === 'y' && Tt ? Tn : Pe),
            {}
          )
        },
      },
      dR,
      v,
    ),
    ae(() => {
      !m &&
        h &&
        h.update({ referenceElement: null, floatingElement: null, domReferenceElement: null })
    }, [m, h]))
  const xe = l.useMemo(
      () => ({
        elementResize: !d && typeof ResizeObserver < 'u',
        layoutShift: !d && typeof IntersectionObserver < 'u',
      }),
      [d],
    ),
    {
      refs: N,
      elements: U,
      x: B,
      y: _,
      middlewareData: H,
      update: W,
      placement: J,
      context: fe,
      isPositioned: we,
      floatingStyles: Ae,
    } = sE({
      rootContext: h,
      placement: z,
      middleware: me,
      strategy: n,
      whileElementsMounted: g ? void 0 : (...Ne) => nd(...Ne, xe),
      nodeId: y,
      externalTree: w,
    }),
    { sideX: st, sideY: He } = H.adaptiveOrigin || zs,
    Ee = we ? n : 'fixed',
    _e = l.useMemo(() => {
      const Ne = v ? { position: Ee, [st]: B, [He]: _ } : { position: Ee, ...Ae }
      return (we || (Ne.opacity = 0), Ne)
    }, [v, Ee, st, B, He, _, Ae, we]),
    tt = l.useRef(null)
  ;(ae(() => {
    if (!m) return
    const Ne = T.current,
      Me = typeof Ne == 'function' ? Ne() : Ne,
      pt = (md(Me) ? Me.current : Me) || null || null
    pt !== tt.current && (N.setPositionReference(pt), (tt.current = pt))
  }, [m, N, I, T]),
    l.useEffect(() => {
      if (!m) return
      const Ne = T.current
      typeof Ne != 'function' &&
        md(Ne) &&
        Ne.current !== tt.current &&
        (N.setPositionReference(Ne.current), (tt.current = Ne.current))
    }, [m, N, I, T]),
    l.useEffect(() => {
      if (g && m && U.domReference && U.floating) return nd(U.domReference, U.floating, W, xe)
    }, [g, m, U, W, xe]))
  const Qe = Pt(J),
    it = bm(r, Qe, L),
    We = Zn(J) || 'center',
    Se = !!H.hide?.referenceHidden
  ae(() => {
    C && m && we && S(Qe)
  }, [C, m, we, Qe])
  const Te = l.useMemo(
      () => ({ position: 'absolute', top: H.arrow?.y, left: H.arrow?.x }),
      [H.arrow],
    ),
    Fe = H.arrow?.centerOffset !== 0
  return l.useMemo(
    () => ({
      positionerStyles: _e,
      arrowStyles: Te,
      arrowRef: oe,
      arrowUncentered: Fe,
      side: it,
      align: We,
      physicalSide: Qe,
      anchorHidden: Se,
      refs: N,
      context: fe,
      isPositioned: we,
      update: W,
    }),
    [_e, Te, oe, Fe, it, We, Qe, Se, N, fe, we, W],
  )
}
function md(e) {
  return e != null && 'current' in e
}
function so(e) {
  return e === 'starting' ? sw : Ke
}
const pR = l.forwardRef(function (t, n) {
    const {
        render: r,
        className: o,
        anchor: s,
        positionMethod: i = 'absolute',
        side: a = 'bottom',
        align: c = 'center',
        sideOffset: u = 0,
        alignOffset: f = 0,
        collisionBoundary: d = 'clipping-ancestors',
        collisionPadding: g = 5,
        arrowPadding: h = 5,
        sticky: m = !1,
        disableAnchorTracking: p = !1,
        collisionAvoidance: b = Fp,
        ...y
      } = t,
      v = Rn(),
      { filteredItems: C } = Xn(),
      w = Pi(),
      x = aR(),
      S = re(v, ie.modal),
      k = re(v, ie.open),
      R = re(v, ie.mounted),
      M = re(v, ie.openMethod),
      j = re(v, ie.triggerElement),
      P = re(v, ie.inputElement),
      I = re(v, ie.inputInsidePopup),
      T = re(v, ie.transitionStatus),
      O = C.length === 0,
      A = gc({
        anchor: s ?? (I ? j : P),
        floatingRootContext: w,
        positionMethod: i,
        mounted: R,
        side: a,
        sideOffset: u,
        align: c,
        alignOffset: f,
        arrowPadding: h,
        collisionBoundary: d,
        collisionPadding: g,
        sticky: m,
        disableAnchorTracking: p,
        keepMounted: x,
        collisionAvoidance: b,
        lazyFlip: !0,
      })
    Ul(k && S && M !== 'touch', j)
    const z = l.useMemo(() => {
        const q = { ...A.positionerStyles }
        return (k || (q.pointerEvents = 'none'), { role: 'presentation', hidden: !R, style: q })
      }, [k, R, A.positionerStyles]),
      D = { open: k, side: A.side, align: A.align, anchorHidden: A.anchorHidden, empty: O }
    ae(() => {
      v.set('popupSide', A.side)
    }, [v, A.side])
    const $ = l.useMemo(
        () => ({
          side: A.side,
          align: A.align,
          arrowRef: A.arrowRef,
          arrowUncentered: A.arrowUncentered,
          arrowStyles: A.arrowStyles,
          anchorHidden: A.anchorHidden,
          isPositioned: A.isPositioned,
        }),
        [
          A.side,
          A.align,
          A.arrowRef,
          A.arrowUncentered,
          A.arrowStyles,
          A.anchorHidden,
          A.isPositioned,
        ],
      ),
      F = ne((q) => {
        v.set('positionerElement', q)
      }),
      Q = Oe('div', t, { state: D, ref: [n, F], props: [z, so(T), y], stateAttributesMapping: qn })
    return E.jsxs(gm.Provider, {
      value: $,
      children: [R && S && E.jsx(cc, { inert: Ti(!k), cutout: P ?? j }), Q],
    })
  }),
  gR = { ...qn, ...Sr },
  mR = l.forwardRef(function (t, n) {
    const { render: r, className: o, initialFocus: s, finalFocus: i, ...a } = t,
      c = Rn(),
      u = pc(),
      f = Pi(),
      { filteredItems: d } = Xn(),
      g = re(c, ie.mounted),
      h = re(c, ie.open),
      m = re(c, ie.openMethod),
      p = re(c, ie.transitionStatus),
      b = re(c, ie.inputInsidePopup),
      y = re(c, ie.inputElement),
      v = d.length === 0
    Kn({
      open: h,
      ref: c.state.popupRef,
      onComplete() {
        h && c.state.onOpenChangeComplete(!0)
      },
    })
    const C = {
        open: h,
        side: u.side,
        align: u.align,
        anchorHidden: u.anchorHidden,
        transitionStatus: p,
        empty: v,
      },
      w = Oe('div', t, {
        state: C,
        ref: [n, c.state.popupRef],
        props: [
          {
            role: b ? 'dialog' : 'presentation',
            tabIndex: -1,
            onFocus(R) {
              const M = Ge(R.nativeEvent)
              m !== 'touch' &&
                (be(c.state.listElement, M) || M === R.currentTarget) &&
                c.state.inputRef.current?.focus()
            },
          },
          so(p),
          a,
        ],
        stateAttributesMapping: gR,
      }),
      S = s === void 0 ? (b ? (R) => (R === 'touch' ? c.state.popupRef.current : y) : !1) : s
    let k
    return (
      i != null ? (k = i) : (k = b ? void 0 : !1),
      E.jsx(ql, {
        context: f,
        disabled: !g,
        modal: !b,
        openInteractionType: m,
        initialFocus: S,
        returnFocus: k,
        children: w,
      })
    )
  }),
  vm = l.createContext(void 0)
function hR() {
  const e = l.useContext(vm)
  if (e === void 0) throw new Error(Ve(18))
  return e
}
const bR = l.forwardRef(function (t, n) {
    const { render: r, className: o, items: s, ...i } = t,
      [a, c] = l.useState(),
      u = l.useMemo(() => ({ labelId: a, setLabelId: c, items: s }), [a, c, s]),
      f = Oe('div', t, { ref: n, props: [{ role: 'group', 'aria-labelledby': a }, i] }),
      d = E.jsx(vm.Provider, { value: u, children: f })
    return s ? E.jsx(oR, { items: s, children: d }) : d
  }),
  vR = l.forwardRef(function (t, n) {
    const { render: r, className: o, id: s, ...i } = t,
      { setLabelId: a } = hR(),
      c = Gn(s)
    return (
      ae(
        () => (
          a(c),
          () => {
            a(void 0)
          }
        ),
        [c, a],
      ),
      Oe('div', t, { ref: n, props: [{ id: c }, i] })
    )
  }),
  ym = l.createContext(void 0)
function xm() {
  const e = l.useContext(ym)
  if (!e) throw new Error(Ve(19))
  return e
}
const yR = l.createContext(!1)
function xR() {
  return l.useContext(yR)
}
const wR = l.memo(
    l.forwardRef(function (t, n) {
      const {
          render: r,
          className: o,
          value: s = null,
          index: i,
          disabled: a = !1,
          nativeButton: c = !1,
          ...u
        } = t,
        f = l.useRef(!1),
        d = l.useRef(null),
        g = hi({ index: i, textRef: d, indexGuessBehavior: Hp.GuessFromOrder }),
        h = Rn(),
        m = xR(),
        { flatFilteredItems: p, hasItems: b } = Xn(),
        y = re(h, ie.open),
        v = re(h, ie.selectionMode),
        C = re(h, ie.readOnly),
        w = re(h, ie.virtualized),
        x = re(h, ie.isItemEqualToValue),
        S = v !== 'none',
        k = i ?? (w ? tl(p, s, x) : g.index),
        R = g.index !== -1,
        M = re(h, ie.id),
        j = re(h, ie.isActive, k),
        P = re(h, ie.isSelected, s),
        I = re(h, ie.getItemProps),
        T = l.useRef(null),
        O = M != null && R ? `${M}-${k}` : void 0,
        L = P && S
      ;(ae(() => {
        if (!(R && (w || i != null))) return
        const oe = h.state.listRef.current
        return (
          (oe[k] = T.current),
          () => {
            delete oe[k]
          }
        )
      }, [R, w, k, i, h]),
        ae(() => {
          if (!R || b) return
          const Y = h.state.valuesRef.current
          return (
            (Y[k] = s),
            v !== 'none' && h.state.allValuesRef.current.push(s),
            () => {
              delete Y[k]
            }
          )
        }, [R, b, k, s, h, v]),
        ae(() => {
          if (!y) {
            f.current = !1
            return
          }
          if (!R || b) return
          const Y = h.state.selectedValue,
            oe = Array.isArray(Y) ? Y[Y.length - 1] : Y
          mr(s, oe, x) && h.set('selectedIndex', k)
        }, [R, b, y, h, k, s, x]))
      const A = { disabled: a, selected: L, highlighted: j },
        z = I({ active: j, selected: L })
      ;((z.id = void 0), (z.onFocus = void 0))
      const { getButtonProps: D, buttonRef: $ } = Rr({
        disabled: a,
        focusableWhenDisabled: !0,
        native: c,
      })
      function F(Y) {
        function oe() {
          h.state.handleSelection(Y, s)
        }
        h.state.submitOnItemClick ? (Mt.flushSync(oe), h.state.requestSubmit()) : oe()
      }
      const Q = {
          id: O,
          role: m ? 'gridcell' : 'option',
          'aria-selected': S ? L : void 0,
          tabIndex: void 0,
          onPointerDownCapture(Y) {
            ;((f.current = !0), Y.preventDefault())
          },
          onClick(Y) {
            a || C || F(Y.nativeEvent)
          },
          onMouseUp(Y) {
            const oe = f.current
            ;((f.current = !1), !(a || C || Y.button !== 0 || oe || !j) && F(Y.nativeEvent))
          },
        },
        q = Oe('div', t, { ref: [$, n, g.ref, T], state: A, props: [z, Q, u, D] }),
        se = l.useMemo(() => ({ selected: L, textRef: d }), [L, d])
      return E.jsx(ym.Provider, { value: se, children: q })
    }),
  ),
  CR = l.forwardRef(function (t, n) {
    const { render: r, className: o, children: s, ...i } = t,
      { filteredItems: a } = Xn(),
      c = Rn(),
      u = a.length === 0 ? s : null
    return Oe('div', t, {
      ref: [n, c.state.emptyRef],
      props: [{ children: u, role: 'status', 'aria-live': 'polite', 'aria-atomic': !0 }, i],
    })
  }),
  hd = l.forwardRef(function (t, n) {
    const { className: r, render: o, orientation: s = 'horizontal', ...i } = t
    return Oe('div', t, {
      state: { orientation: s },
      ref: n,
      props: [{ role: 'separator', 'aria-orientation': s }, i],
    })
  })
function SR(e) {
  const { multiple: t = !1, defaultValue: n, value: r, onValueChange: o, autoComplete: s, ...i } = e
  return E.jsx(XE, {
    ...i,
    selectionMode: t ? 'multiple' : 'single',
    selectedValue: r,
    defaultSelectedValue: n,
    onSelectedValueChange: o,
    formAutoComplete: s,
  })
}
function ER(e) {
  const { children: t, placeholder: n } = e,
    r = Rn(),
    o = re(r, ie.itemToStringLabel),
    s = re(r, ie.selectedValue),
    i = re(r, ie.items),
    a = re(r, ie.selectionMode) === 'multiple',
    c = re(r, ie.hasSelectedValue),
    u = !c && n != null && t == null,
    f = re(r, ie.hasNullItemLabel, u)
  let d = null
  return (
    typeof t == 'function'
      ? (d = t(s))
      : t != null
        ? (d = t)
        : !c && n != null && !f
          ? (d = n)
          : a && Array.isArray(s)
            ? (d = FE(s, i, o))
            : (d = am(s, i, o)),
    E.jsx(l.Fragment, { children: d })
  )
}
const RR = l.forwardRef(function (t, n) {
    const r = t.keepMounted ?? !1,
      { selected: o } = xm()
    return r || o ? E.jsx(kR, { ...t, ref: n }) : null
  }),
  kR = l.memo(
    l.forwardRef((e, t) => {
      const { render: n, className: r, keepMounted: o, ...s } = e,
        { selected: i } = xm(),
        a = l.useRef(null),
        { transitionStatus: c, setMounted: u } = Dl(i),
        d = Oe('span', e, {
          ref: [t, a],
          state: { selected: i, transitionStatus: c },
          props: [{ 'aria-hidden': !0, children: '✔️' }, s],
          stateAttributesMapping: Sr,
        })
      return (
        Kn({
          open: i,
          ref: a,
          onComplete() {
            i || u(!1)
          },
        }),
        d
      )
    }),
  ),
  wm = l.createContext(void 0)
function qo(e = !0) {
  const t = l.useContext(wm)
  if (t === void 0 && !e) throw new Error(Ve(25))
  return t
}
const Cm = l.createContext(void 0)
function mc(e) {
  const t = l.useContext(Cm)
  if (t === void 0 && !e) throw new Error(Ve(33))
  return t
}
const hc = l.createContext(void 0)
function rn(e) {
  const t = l.useContext(hc)
  if (t === void 0 && !e) throw new Error(Ve(36))
  return t
}
function IR(e) {
  const {
      closeOnClick: t,
      highlighted: n,
      id: r,
      nodeId: o,
      store: s,
      itemRef: i,
      itemMetadata: a,
    } = e,
    { events: c } = s.useState('floatingTreeRoot'),
    u = qo(!0),
    f = u !== void 0
  return l.useMemo(
    () => ({
      id: r,
      role: 'menuitem',
      tabIndex: n ? 0 : -1,
      onMouseMove(d) {
        o && c.emit('itemhover', { nodeId: o, target: d.currentTarget })
      },
      onClick(d) {
        t && c.emit('close', { domEvent: d, reason: zl })
      },
      onMouseUp(d) {
        if (u) {
          const g = u.initialCursorPointRef.current
          if (
            ((u.initialCursorPointRef.current = null),
            f && g && Math.abs(d.clientX - g.x) <= 1 && Math.abs(d.clientY - g.y) <= 1)
          )
            return
        }
        i.current &&
          s.context.allowMouseUpTriggerRef.current &&
          (!f || d.button === 2) &&
          (!a || a.type === 'regular-item') &&
          i.current.click()
      },
    }),
    [t, n, r, c, o, s, i, u, f, a],
  )
}
const TR = { type: 'regular-item' }
function Sm(e) {
  const {
      closeOnClick: t,
      disabled: n = !1,
      highlighted: r,
      id: o,
      store: s,
      nativeButton: i,
      itemMetadata: a,
      nodeId: c,
    } = e,
    u = l.useRef(null),
    { getButtonProps: f, buttonRef: d } = Rr({ disabled: n, focusableWhenDisabled: !0, native: i }),
    g = IR({
      closeOnClick: t,
      highlighted: r,
      id: o,
      nodeId: c,
      store: s,
      itemRef: u,
      itemMetadata: a,
    }),
    h = l.useCallback(
      (p) =>
        zo(
          g,
          {
            onMouseEnter() {
              a.type === 'submenu-trigger' && a.setActive()
            },
            onKeyUp(b) {
              b.key === ' ' && s.context.typingRef.current && b.preventBaseUIHandler()
            },
          },
          p,
          f,
        ),
      [g, f, s, a],
    ),
    m = Vn(u, d)
  return l.useMemo(() => ({ getItemProps: h, itemRef: m }), [h, m])
}
const bd = l.forwardRef(function (t, n) {
    const {
        render: r,
        className: o,
        id: s,
        label: i,
        nativeButton: a = !1,
        disabled: c = !1,
        closeOnClick: u = !0,
        ...f
      } = t,
      d = hi({ label: i }),
      g = mc(!0),
      h = Gn(s),
      { store: m } = rn(),
      p = m.useState('isActive', d.index),
      b = m.useState('itemProps'),
      { getItemProps: y, itemRef: v } = Sm({
        closeOnClick: u,
        disabled: c,
        highlighted: p,
        id: h,
        store: m,
        nativeButton: a,
        nodeId: g?.nodeId,
        itemMetadata: TR,
      })
    return Oe('div', t, {
      state: { disabled: c, highlighted: p },
      props: [b, f, y],
      ref: [v, n, d.ref],
    })
  }),
  PR = l.createContext(void 0)
function Em(e) {
  return l.useContext(PR)
}
const OR = { ...qn, ...Sr },
  vd = l.forwardRef(function (t, n) {
    const { render: r, className: o, finalFocus: s, ...i } = t,
      { store: a } = rn(),
      { side: c, align: u } = mc(),
      f = Em() != null,
      d = a.useState('open'),
      g = a.useState('transitionStatus'),
      h = a.useState('popupProps'),
      m = a.useState('mounted'),
      p = a.useState('instantType'),
      b = a.useState('activeTriggerElement'),
      y = a.useState('parent'),
      v = a.useState('lastOpenChangeReason'),
      C = a.useState('rootId'),
      w = a.useState('floatingRootContext'),
      x = a.useState('floatingTreeRoot'),
      S = a.useState('closeDelay'),
      k = a.useState('activeTriggerElement'),
      R = y.type === 'context-menu'
    ;(Kn({
      open: d,
      ref: a.context.popupRef,
      onComplete() {
        d && a.context.onOpenChangeComplete?.(!0)
      },
    }),
      l.useEffect(() => {
        function O(L) {
          a.setOpen(!1, ge(L.reason, L.domEvent))
        }
        return (
          x.events.on('close', O),
          () => {
            x.events.off('close', O)
          }
        )
      }, [x.events, a]))
    const M = a.useState('hoverEnabled'),
      j = a.useState('disabled')
    Yg(w, { enabled: M && !j && !R && y.type !== 'menubar', closeDelay: S })
    const P = {
        transitionStatus: g,
        side: c,
        align: u,
        open: d,
        nested: y.type === 'menu',
        instant: p,
      },
      I = Oe('div', t, {
        state: P,
        ref: [n, a.context.popupRef],
        stateAttributesMapping: OR,
        props: [
          h,
          {
            onKeyDown(O) {
              f && wg.has(O.key) && O.stopPropagation()
            },
          },
          so(g),
          i,
          { 'data-rootownerid': C },
        ],
      })
    let T = y.type === void 0 || R
    return (
      (b || (y.type === 'menubar' && v !== gi)) && (T = !0),
      E.jsx(ql, {
        context: w,
        modal: R,
        disabled: !m,
        returnFocus: s === void 0 ? T : s,
        initialFocus: y.type !== 'menu',
        restoreFocus: !0,
        externalTree: y.type !== 'menubar' ? x : void 0,
        previousFocusableElement: k,
        nextFocusableElement: y.type === void 0 ? a.context.triggerFocusTargetRef : void 0,
        beforeContentFocusGuardRef:
          y.type === void 0 ? a.context.beforeContentFocusGuardRef : void 0,
        children: I,
      })
    )
  }),
  Rm = l.createContext(void 0)
function MR() {
  const e = l.useContext(Rm)
  if (e === void 0) throw new Error(Ve(32))
  return e
}
const yd = l.forwardRef(function (t, n) {
    const { keepMounted: r = !1, ...o } = t,
      { store: s } = rn()
    return s.useState('mounted') || r
      ? E.jsx(Rm.Provider, { value: r, children: E.jsx(Kl, { ref: n, ...o }) })
      : null
  }),
  xd = l.forwardRef(function (t, n) {
    const {
        anchor: r,
        positionMethod: o = 'absolute',
        className: s,
        render: i,
        side: a,
        align: c,
        sideOffset: u = 0,
        alignOffset: f = 0,
        collisionBoundary: d = 'clipping-ancestors',
        collisionPadding: g = 5,
        arrowPadding: h = 5,
        sticky: m = !1,
        disableAnchorTracking: p = !1,
        collisionAvoidance: b = Fp,
        ...y
      } = t,
      { store: v } = rn(),
      C = MR(),
      w = qo(!0),
      x = v.useState('parent'),
      S = v.useState('floatingRootContext'),
      k = v.useState('floatingTreeRoot'),
      R = v.useState('mounted'),
      M = v.useState('open'),
      j = v.useState('modal'),
      P = v.useState('activeTriggerElement'),
      I = v.useState('transitionStatus'),
      T = v.useState('lastOpenChangeReason'),
      O = v.useState('floatingNodeId'),
      L = v.useState('floatingParentNodeId')
    let A = r,
      z = u,
      D = f,
      $ = c,
      F = b
    x.type === 'context-menu' &&
      ((A = r ?? x.context?.anchor),
      ($ = $ ?? 'start'),
      !a && $ !== 'center' && ((D = t.alignOffset ?? 2), (z = t.sideOffset ?? -5)))
    let Q = a,
      q = $
    x.type === 'menu'
      ? ((Q = Q ?? 'inline-end'), (q = q ?? 'start'), (F = t.collisionAvoidance ?? $p))
      : x.type === 'menubar' && ((Q = Q ?? 'bottom'), (q = q ?? 'start'))
    const se = x.type === 'context-menu',
      Y = gc({
        anchor: A,
        floatingRootContext: S,
        positionMethod: w ? 'fixed' : o,
        mounted: R,
        side: Q,
        sideOffset: z,
        align: q,
        alignOffset: D,
        arrowPadding: se ? 0 : h,
        collisionBoundary: d,
        collisionPadding: g,
        sticky: m,
        nodeId: O,
        keepMounted: C,
        disableAnchorTracking: p,
        collisionAvoidance: F,
        shiftCrossAxis: se && !('side' in F && F.side === 'flip'),
        externalTree: k,
      }),
      oe = l.useMemo(() => {
        const he = {}
        return (
          M || (he.pointerEvents = 'none'),
          { role: 'presentation', hidden: !R, style: { ...Y.positionerStyles, ...he } }
        )
      }, [M, R, Y.positionerStyles])
    ;(l.useEffect(() => {
      function he(V) {
        V.open &&
          (V.parentNodeId === O && v.set('hoverEnabled', !1),
          V.nodeId !== O &&
            V.parentNodeId === v.select('floatingParentNodeId') &&
            v.setOpen(!1, ge(Ps)))
      }
      return (
        k.events.on('menuopenchange', he),
        () => {
          k.events.off('menuopenchange', he)
        }
      )
    }, [v, k.events, O]),
      l.useEffect(() => {
        if (v.select('floatingParentNodeId') == null) return
        function he(V) {
          if (V.open || V.nodeId !== v.select('floatingParentNodeId')) return
          const Z = V.reason ?? Ps
          v.setOpen(!1, ge(Z))
        }
        return (
          k.events.on('menuopenchange', he),
          () => {
            k.events.off('menuopenchange', he)
          }
        )
      }, [k.events, v]),
      l.useEffect(() => {
        function he(V) {
          !M ||
            V.nodeId !== v.select('floatingParentNodeId') ||
            (V.target && P && P !== V.target && v.setOpen(!1, ge(Ps)))
        }
        return (
          k.events.on('itemhover', he),
          () => {
            k.events.off('itemhover', he)
          }
        )
      }, [k.events, M, P, v]),
      l.useEffect(() => {
        const he = { open: M, nodeId: O, parentNodeId: L, reason: v.select('lastOpenChangeReason') }
        k.events.emit('menuopenchange', he)
      }, [k.events, M, v, O, L]))
    const te = {
        open: M,
        side: Y.side,
        align: Y.align,
        anchorHidden: Y.anchorHidden,
        nested: x.type === 'menu',
      },
      le = l.useMemo(
        () => ({
          side: Y.side,
          align: Y.align,
          arrowRef: Y.arrowRef,
          arrowUncentered: Y.arrowUncentered,
          arrowStyles: Y.arrowStyles,
          nodeId: Y.context.nodeId,
        }),
        [Y.side, Y.align, Y.arrowRef, Y.arrowUncentered, Y.arrowStyles, Y.context.nodeId],
      ),
      ve = Oe('div', t, {
        state: te,
        stateAttributesMapping: qn,
        ref: [n, v.useStateSetter('positionerElement')],
        props: [oe, so(I), y],
      }),
      X =
        R &&
        x.type !== 'menu' &&
        ((x.type !== 'menubar' && j && T !== Ct) || (x.type === 'menubar' && x.context.modal))
    let me = null
    return (
      x.type === 'menubar' ? (me = x.context.contentElement) : x.type === void 0 && (me = P),
      E.jsxs(Cm.Provider, {
        value: le,
        children: [
          X &&
            E.jsx(cc, {
              ref:
                x.type === 'context-menu' || x.type === 'nested-context-menu'
                  ? x.context.internalBackdropRef
                  : null,
              inert: Ti(!M),
              cutout: me,
            }),
          E.jsx(SC, {
            id: O,
            children: E.jsx(Ml, {
              elementsRef: v.context.itemDomElements,
              labelsRef: v.context.itemLabels,
              children: ve,
            }),
          }),
        ],
      })
    )
  }),
  AR = l.createContext(null)
function km(e) {
  return l.useContext(AR)
}
const zR = {
  ...rc,
  disabled: G((e) => (e.parent.type === 'menubar' && e.parent.context.disabled) || e.disabled),
  modal: G(
    (e) => (e.parent.type === void 0 || e.parent.type === 'context-menu') && (e.modal ?? !0),
  ),
  allowMouseEnter: G((e) => e.allowMouseEnter),
  stickIfOpen: G((e) => e.stickIfOpen),
  parent: G((e) => e.parent),
  rootId: G((e) =>
    e.parent.type === 'menu'
      ? e.parent.store.select('rootId')
      : e.parent.type !== void 0
        ? e.parent.context.rootId
        : e.rootId,
  ),
  activeIndex: G((e) => e.activeIndex),
  isActive: G((e, t) => e.activeIndex === t),
  hoverEnabled: G((e) => e.hoverEnabled),
  instantType: G((e) => e.instantType),
  lastOpenChangeReason: G((e) => e.openChangeReason),
  floatingTreeRoot: G((e) =>
    e.parent.type === 'menu' ? e.parent.store.select('floatingTreeRoot') : e.floatingTreeRoot,
  ),
  floatingNodeId: G((e) => e.floatingNodeId),
  floatingParentNodeId: G((e) => e.floatingParentNodeId),
  itemProps: G((e) => e.itemProps),
  closeDelay: G((e) => e.closeDelay),
  keyboardEventRelay: G((e) => {
    if (e.keyboardEventRelay) return e.keyboardEventRelay
    if (e.parent.type === 'menu') return e.parent.store.select('keyboardEventRelay')
  }),
}
class bc extends Ko {
  constructor(t) {
    ;(super(
      { ...LR(), ...t },
      {
        positionerRef: l.createRef(),
        popupRef: l.createRef(),
        typingRef: { current: !1 },
        itemDomElements: { current: [] },
        itemLabels: { current: [] },
        allowMouseUpTriggerRef: { current: !1 },
        triggerFocusTargetRef: l.createRef(),
        beforeContentFocusGuardRef: l.createRef(),
        onOpenChangeComplete: void 0,
        triggerElements: new Yo(),
      },
      zR,
    ),
      (this.unsubscribeParentListener = this.observe('parent', (n) => {
        if ((this.unsubscribeParentListener?.(), n.type === 'menu')) {
          ;((this.unsubscribeParentListener = n.store.subscribe(() => {
            this.notifyAll()
          })),
            (this.context.allowMouseUpTriggerRef = n.store.context.allowMouseUpTriggerRef))
          return
        }
        ;(n.type !== void 0 &&
          (this.context.allowMouseUpTriggerRef = n.context.allowMouseUpTriggerRef),
          (this.unsubscribeParentListener = null))
      })))
  }
  setOpen(t, n) {
    this.state.floatingRootContext.context.events.emit('setOpen', { open: t, eventDetails: n })
  }
  static useStore(t, n) {
    const r = ot(() => new bc(n)).current
    return t ?? r
  }
  unsubscribeParentListener = null
}
function LR() {
  return {
    ...nc(),
    disabled: !1,
    modal: !0,
    allowMouseEnter: !1,
    stickIfOpen: !0,
    parent: { type: void 0 },
    rootId: void 0,
    activeIndex: null,
    hoverEnabled: !0,
    instantType: void 0,
    openChangeReason: null,
    floatingTreeRoot: new Zl(),
    floatingNodeId: void 0,
    floatingParentNodeId: null,
    itemProps: Ke,
    keyboardEventRelay: void 0,
    closeDelay: 0,
  }
}
const Im = l.createContext(void 0)
function Tm() {
  return l.useContext(Im)
}
const vc = Jl(function (t) {
  const {
      children: n,
      open: r,
      onOpenChange: o,
      onOpenChangeComplete: s,
      defaultOpen: i = !1,
      disabled: a = !1,
      modal: c,
      loopFocus: u = !0,
      orientation: f = 'vertical',
      actionsRef: d,
      closeParentOnEsc: g = !1,
      handle: h,
      triggerId: m,
      defaultTriggerId: p = null,
      highlightItemOnHover: b = !0,
    } = t,
    y = qo(!0),
    v = rn(!0),
    C = km(!0),
    w = Tm(),
    x = l.useMemo(
      () =>
        w && v
          ? { type: 'menu', store: v.store }
          : C
            ? { type: 'menubar', context: C }
            : y && !v
              ? { type: 'context-menu', context: y }
              : { type: void 0 },
      [y, v, C, w],
    ),
    S = bc.useStore(h?.store, {
      open: i,
      openProp: r,
      activeTriggerId: p,
      triggerIdProp: m,
      parent: x,
    })
  ;(uc(() => {
    r === void 0 && S.state.open === !1 && i === !0 && S.update({ open: !0, activeTriggerId: p })
  }),
    S.useControlledProp('openProp', r),
    S.useControlledProp('triggerIdProp', m),
    S.useContextCallback('onOpenChangeComplete', s))
  const k = S.useState('floatingTreeRoot'),
    R = Rg(k),
    M = En()
  ae(() => {
    y && !v
      ? S.update({
          parent: { type: 'context-menu', context: y },
          floatingNodeId: R,
          floatingParentNodeId: M,
        })
      : v && S.update({ floatingNodeId: R, floatingParentNodeId: M })
  }, [y, v, R, M, S])
  const j = S.useState('open'),
    P = S.useState('activeTriggerElement'),
    I = S.useState('positionerElement'),
    T = S.useState('hoverEnabled'),
    O = S.useState('modal'),
    L = S.useState('disabled'),
    A = S.useState('lastOpenChangeReason'),
    z = S.useState('parent'),
    D = S.useState('activeIndex'),
    $ = S.useState('payload'),
    F = S.useState('floatingParentNodeId'),
    Q = l.useRef(null),
    q = F != null
  let se
  S.useSyncedValues({ disabled: a, modal: z.type === void 0 ? c : void 0, rootId: nn() })
  const { openMethod: Y, triggerProps: oe, reset: te } = lc(j)
  ec(S)
  const { forceUnmount: le } = tc(j, S, () => {
      ;(S.update({ allowMouseEnter: !1, stickIfOpen: !0 }), te())
    }),
    ve = l.useRef(z.type !== 'context-menu'),
    X = bt()
  ;(l.useEffect(() => {
    if ((j || (Q.current = null), z.type === 'context-menu')) {
      if (!j) {
        ;(X.clear(), (ve.current = !1))
        return
      }
      X.start(500, () => {
        ve.current = !0
      })
    }
  }, [X, j, z.type]),
    Ul(j && O && A !== Ct && Y !== 'touch', I),
    ae(() => {
      !j && !T && S.set('hoverEnabled', !0)
    }, [j, T, S]))
  const me = l.useRef(!0),
    he = bt(),
    V = ne((Se, Te) => {
      const Fe = Te.reason
      if (
        (j === Se && Te.trigger === P && A === Fe) ||
        ((Te.preventUnmountOnClose = () => {
          S.set('preventUnmountingOnClose', !0)
        }),
        !Se && Te.trigger == null && (Te.trigger = P ?? void 0),
        o?.(Se, Te),
        Te.isCanceled)
      )
        return
      const Ne = { open: Se, nativeEvent: Te.event, reason: Te.reason, nested: q }
      se?.emit('openchange', Ne)
      const Me = Te.event
      if (Se === !1 && Me?.type === 'click' && Me.pointerType === 'touch' && !me.current) return
      if (!Se && D !== null) {
        const nt = S.context.itemDomElements.current[D]
        queueMicrotask(() => {
          nt?.setAttribute('tabindex', '-1')
        })
      }
      Se && Fe === Fr
        ? ((me.current = !1),
          he.start(300, () => {
            me.current = !0
          }))
        : ((me.current = !0), he.clear())
      const Ce = (Fe === dr || Fe === zl) && Me.detail === 0 && Me?.isTrusted,
        pt = !Se && (Fe === Bo || Fe == null),
        lt = { open: Se, openChangeReason: Fe }
      Q.current = Te.event ?? null
      const Ut = Te.trigger?.id ?? null
      ;((Ut || Se) && ((lt.activeTriggerId = Ut), (lt.activeTriggerElement = Te.trigger ?? null)),
        S.update(lt),
        z.type === 'menubar' && (Fe === Fr || Fe === fr || Fe === Ct || Fe === Io || Fe === Ps)
          ? S.set('instantType', 'group')
          : Ce || pt
            ? S.set('instantType', Ce ? 'click' : 'dismiss')
            : S.set('instantType', void 0))
    }),
    Z = l.useCallback(
      (Se) => {
        const Te = ge(Se)
        return (
          (Te.preventUnmountOnClose = () => {
            S.set('preventUnmountingOnClose', !0)
          }),
          Te
        )
      },
      [S],
    ),
    K = l.useCallback(() => {
      S.setOpen(!1, Z(Ll))
    }, [S, Z])
  l.useImperativeHandle(d, () => ({ unmount: le, close: K }), [le, K])
  let xe
  ;(z.type === 'context-menu' && (xe = z.context),
    l.useImperativeHandle(xe?.positionerRef, () => I, [I]),
    l.useImperativeHandle(xe?.actionsRef, () => ({ setOpen: V }), [V]))
  const N = oc({ popupStore: S, onOpenChange: V })
  ;((se = N.context.events),
    l.useEffect(() => {
      const Se = ({ open: Te, eventDetails: Fe }) => V(Te, Fe)
      return (
        se.on('setOpen', Se),
        () => {
          se?.off('setOpen', Se)
        }
      )
    }, [se, V]))
  const U = Ri(N, {
      enabled: !L,
      bubbles: { escapeKey: g && z.type === 'menu' },
      outsidePress() {
        return z.type !== 'context-menu' || Q.current?.type === 'contextmenu' ? !0 : ve.current
      },
      externalTree: q ? k : void 0,
    }),
    B = Xg(N, { role: 'menu' }),
    _ = pi(),
    H = l.useCallback(
      (Se) => {
        S.select('activeIndex') !== Se && S.set('activeIndex', Se)
      },
      [S],
    ),
    W = qg(N, {
      enabled: !L,
      listRef: S.context.itemDomElements,
      activeIndex: D,
      nested: z.type !== void 0,
      loopFocus: u,
      orientation: f,
      parentOrientation: z.type === 'menubar' ? z.context.orientation : void 0,
      rtl: _ === 'rtl',
      disabledIndices: un,
      onNavigate: H,
      openOnArrowKeyDown: z.type !== 'context-menu',
      externalTree: q ? k : void 0,
      focusItemOnHover: b,
    }),
    J = l.useCallback(
      (Se) => {
        S.context.typingRef.current = Se
      },
      [S],
    ),
    fe = Jg(N, {
      listRef: S.context.itemLabels,
      activeIndex: D,
      resetMs: rw,
      onMatch: (Se) => {
        j && Se !== D && S.set('activeIndex', Se)
      },
      onTypingChange: J,
    }),
    {
      getReferenceProps: we,
      getFloatingProps: Ae,
      getItemProps: st,
      getTriggerProps: He,
    } = oo([U, B, W, fe]),
    Ee = l.useMemo(() => {
      const Se = zo(
        we(),
        {
          onMouseMove() {
            S.set('allowMouseEnter', !0)
          },
        },
        oe,
      )
      return (delete Se.role, Se)
    }, [we, S, oe]),
    _e = l.useMemo(() => {
      const Se = He()
      if (!Se) return Se
      const Te = zo(Se, oe)
      return (delete Te.role, delete Te['aria-controls'], Te)
    }, [He, oe]),
    tt = l.useMemo(
      () =>
        Ae({
          onMouseMove() {
            ;(S.set('allowMouseEnter', !0), z.type === 'menu' && S.set('hoverEnabled', !1))
          },
          onClick() {
            S.select('hoverEnabled') && S.set('hoverEnabled', !1)
          },
          onKeyDown(Se) {
            const Te = S.select('keyboardEventRelay')
            Te && !Se.isPropagationStopped() && Te(Se)
          },
        }),
      [Ae, z.type, S],
    ),
    Qe = l.useMemo(() => st(), [st])
  S.useSyncedValues({
    floatingRootContext: N,
    activeTriggerProps: Ee,
    inactiveTriggerProps: _e,
    popupProps: tt,
    itemProps: Qe,
  })
  const it = l.useMemo(() => ({ store: S, parent: x }), [S, x]),
    We = E.jsx(hc.Provider, { value: it, children: typeof n == 'function' ? n({ payload: $ }) : n })
  return z.type === void 0 || z.type === 'context-menu'
    ? E.jsx(EC, { externalTree: k, children: We })
    : We
})
function wd(e) {
  const t = rn().store,
    n = l.useMemo(() => ({ parentMenu: t }), [t])
  return E.jsx(Im.Provider, { value: n, children: E.jsx(vc, { ...e }) })
}
function jR(e = {}) {
  const { highlightItemOnHover: t, highlightedIndex: n, onHighlightedIndexChange: r } = Fl(),
    { ref: o, index: s } = hi(e),
    i = n === s,
    a = l.useRef(null),
    c = Vn(o, a)
  return {
    compositeProps: l.useMemo(
      () => ({
        tabIndex: i ? 0 : -1,
        onFocus() {
          r(s)
        },
        onMouseMove() {
          const f = a.current
          if (!t || !f) return
          const d = f.hasAttribute('disabled') || f.ariaDisabled === 'true'
          !i && !d && f.focus()
        },
      }),
      [i, r, s, t],
    ),
    compositeRef: c,
    index: s,
  }
}
function Pm(e) {
  const {
      render: t,
      className: n,
      state: r = Ke,
      props: o = un,
      refs: s = un,
      metadata: i,
      stateAttributesMapping: a,
      tag: c = 'div',
      ...u
    } = e,
    { compositeProps: f, compositeRef: d } = jR({ metadata: i })
  return Oe(c, e, { state: r, ref: [...s, d], props: [f, ...o, u], stateAttributesMapping: a })
}
function yc(e) {
  if (Ze(e) && e.hasAttribute('data-rootownerid'))
    return e.getAttribute('data-rootownerid') ?? void 0
  if (!pn(e)) return yc(bn(e))
}
function DR(e) {
  const { enabled: t = !0, mouseDownAction: n, open: r } = e,
    o = l.useRef(!1)
  return l.useMemo(
    () =>
      t
        ? {
            onMouseDown: (s) => {
              ;((n === 'open' && !r) || (n === 'close' && r)) &&
                ((o.current = !0),
                ke(s.currentTarget).addEventListener(
                  'click',
                  () => {
                    o.current = !1
                  },
                  { once: !0 },
                ))
            },
            onClick: (s) => {
              o.current && ((o.current = !1), s.preventBaseUIHandler())
            },
          }
        : Ke,
    [t, n, r],
  )
}
const ws = 2,
  NR = Hg(function (t, n) {
    const {
        render: r,
        className: o,
        disabled: s = !1,
        nativeButton: i = !0,
        id: a,
        openOnHover: c,
        delay: u = 100,
        closeDelay: f = 0,
        handle: d,
        payload: g,
        ...h
      } = t,
      m = rn(!0),
      p = d?.store ?? m?.store
    if (!p) throw new Error(Ve(85))
    const b = Gn(a),
      y = p.useState('isTriggerActive', b),
      v = p.useState('floatingRootContext'),
      C = p.useState('isOpenedByTrigger', b),
      w = l.useRef(null),
      x = FR(),
      S = Fl(!0),
      k = Yn(),
      R = l.useMemo(() => k ?? new Zl(), [k]),
      M = Rg(R),
      j = En(),
      { registerTrigger: P, isMountedByThisTrigger: I } = Gg(b, w, p, {
        payload: g,
        closeDelay: f,
        parent: x,
        floatingTreeRoot: R,
        floatingNodeId: M,
        floatingParentNodeId: j,
        keyboardEventRelay: S?.relayKeyboardEvent,
      }),
      T = x.type === 'menubar',
      O = p.useState('disabled'),
      L = s || O || (T && x.context.disabled),
      { getButtonProps: A, buttonRef: z } = Rr({ disabled: L, native: i })
    l.useEffect(() => {
      !C && x.type === void 0 && (p.context.allowMouseUpTriggerRef.current = !1)
    }, [p, C, x.type])
    const D = l.useRef(null),
      $ = bt(),
      F = ne((U) => {
        if (!D.current) return
        ;($.clear(), (p.context.allowMouseUpTriggerRef.current = !1))
        const B = U.target
        if (
          be(D.current, B) ||
          be(p.select('positionerElement'), B) ||
          B === D.current ||
          (B != null && yc(B) === p.select('rootId'))
        )
          return
        const _ = pm(D.current)
        ;(U.clientX >= _.left - ws &&
          U.clientX <= _.right + ws &&
          U.clientY >= _.top - ws &&
          U.clientY <= _.bottom + ws) ||
          R.events.emit('close', { domEvent: U, reason: Vp })
      })
    l.useEffect(() => {
      C &&
        p.select('lastOpenChangeReason') === Ct &&
        ke(D.current).addEventListener('mouseup', F, { once: !0 })
    }, [C, F, p])
    const Q = T && x.context.hasSubmenuOpen,
      se = ic(v, {
        enabled: (c ?? Q) && !L && x.type !== 'context-menu' && (!T || (Q && !I)),
        handleClose: ac({ blockPointerEvents: !T }),
        mouseOnly: !0,
        move: !1,
        restMs: x.type === void 0 ? u : void 0,
        delay: { close: f },
        triggerElementRef: w,
        externalTree: R,
        isActiveTrigger: y,
      }),
      Y = _R(C, p.select('lastOpenChangeReason')),
      oe = Si(v, {
        enabled: !L && x.type !== 'context-menu',
        event: C && T ? 'click' : 'mousedown',
        toggle: !0,
        ignoreMouse: !1,
        stickIfOpen: x.type === void 0 ? Y : !1,
      }),
      te = Zg(v, { enabled: !L && Q }),
      le = DR({ open: C, enabled: T, mouseDownAction: 'open' }),
      ve = oo([oe, te]),
      X = { disabled: L, open: C },
      me = p.useState('triggerProps', I),
      he = [D, n, z, P, w],
      V = [
        ve.getReferenceProps(),
        se ?? Ke,
        me,
        {
          'aria-haspopup': 'menu',
          id: b,
          onMouseDown: (U) => {
            if (p.select('open')) return
            ;($.start(200, () => {
              p.context.allowMouseUpTriggerRef.current = !0
            }),
              ke(U.currentTarget).addEventListener('mouseup', F, { once: !0 }))
          },
        },
        T ? { role: 'menuitem' } : {},
        le,
        h,
        A,
      ],
      Z = l.useRef(null),
      K = ne((U) => {
        ;(Mt.flushSync(() => {
          p.setOpen(!1, ge(fr, U.nativeEvent, U.currentTarget))
        }),
          sC(Z.current)?.focus())
      }),
      xe = ne((U) => {
        const B = p.select('positionerElement')
        if (B && Vr(U, B)) p.context.beforeContentFocusGuardRef.current?.focus()
        else {
          Mt.flushSync(() => {
            p.setOpen(!1, ge(fr, U.nativeEvent, U.currentTarget))
          })
          let _ = oC(p.context.triggerFocusTargetRef.current || w.current)
          for (; _ !== null && be(B, _); ) {
            const H = _
            if (((_ = Gl(_)), _ === H)) break
          }
          _?.focus()
        }
      }),
      N = Oe('button', t, { enabled: !T, stateAttributesMapping: ni, state: X, ref: he, props: V })
    return T
      ? E.jsx(Pm, {
          tag: 'button',
          render: r,
          className: o,
          state: X,
          refs: he,
          props: V,
          stateAttributesMapping: ni,
        })
      : C
        ? E.jsxs(l.Fragment, {
            children: [
              E.jsx(hn, { ref: Z, onFocus: K }, `${b}-pre-focus-guard`),
              E.jsx(l.Fragment, { children: N }, b),
              E.jsx(
                hn,
                { ref: p.context.triggerFocusTargetRef, onFocus: xe },
                `${b}-post-focus-guard`,
              ),
            ],
          })
        : E.jsx(l.Fragment, { children: N }, b)
  })
function _R(e, t) {
  const n = bt(),
    [r, o] = l.useState(!1)
  return (
    ae(() => {
      e && t === 'trigger-hover'
        ? (o(!0),
          n.start(ow, () => {
            o(!1)
          }))
        : e || (n.clear(), o(!1))
    }, [e, t, n]),
    r
  )
}
function FR() {
  const e = qo(!0),
    t = rn(!0),
    n = km()
  return l.useMemo(
    () =>
      n
        ? { type: 'menubar', context: n }
        : e && !t
          ? { type: 'context-menu', context: e }
          : { type: void 0 },
    [e, t, n],
  )
}
const Cd = l.forwardRef(function (t, n) {
  const {
      render: r,
      className: o,
      label: s,
      id: i,
      nativeButton: a = !1,
      openOnHover: c = !0,
      delay: u = 100,
      closeDelay: f = 0,
      disabled: d = !1,
      ...g
    } = t,
    h = hi(),
    m = mc(),
    { store: p } = rn(),
    b = Gn(i),
    y = p.useState('open'),
    v = p.useState('floatingRootContext'),
    C = p.useState('floatingTreeRoot'),
    w = Wg(b, p),
    x = l.useCallback(
      (oe) => {
        const te = w(oe)
        return (
          oe !== null &&
            p.select('open') &&
            p.select('activeTriggerId') == null &&
            p.update({ activeTriggerId: b, activeTriggerElement: oe, closeDelay: f }),
          te
        )
      },
      [w, f, p, b],
    ),
    S = l.useRef(null),
    k = l.useCallback(
      (oe) => {
        ;((S.current = oe), p.set('activeTriggerElement', oe))
      },
      [p],
    ),
    R = Tm()
  if (!R?.parentMenu) throw new Error(Ve(37))
  p.useSyncedValue('closeDelay', f)
  const M = R.parentMenu,
    j = M.useState('itemProps'),
    P = M.useState('isActive', h.index),
    I = l.useMemo(
      () => ({
        type: 'submenu-trigger',
        setActive() {
          M.set('activeIndex', h.index)
        },
      }),
      [M, h.index],
    ),
    T = p.useState('disabled'),
    O = d || T,
    { getItemProps: L, itemRef: A } = Sm({
      closeOnClick: !1,
      disabled: O,
      highlighted: P,
      id: b,
      store: p,
      nativeButton: a,
      itemMetadata: I,
      nodeId: m?.nodeId,
    }),
    z = p.useState('hoverEnabled'),
    D = M.useState('allowMouseEnter'),
    $ = ic(v, {
      enabled: z && c && !O,
      handleClose: ac({ blockPointerEvents: !0 }),
      mouseOnly: !0,
      move: !0,
      restMs: u,
      delay: D ? { open: u, close: f } : 0,
      triggerElementRef: S,
      externalTree: C,
    }),
    F = Si(v, { enabled: !O, event: 'mousedown', toggle: !c, ignoreMouse: c, stickIfOpen: !1 }),
    Q = oo([F]),
    q = p.useState('triggerProps', !0)
  return (
    delete q.id,
    Oe('div', t, {
      state: { disabled: O, highlighted: P, open: y },
      stateAttributesMapping: em,
      props: [
        Q.getReferenceProps(),
        $,
        q,
        j,
        {
          tabIndex: y || P ? 0 : -1,
          onBlur() {
            P && M.set('activeIndex', null)
          },
        },
        g,
        L,
      ],
      ref: [n, h.ref, A, x, k],
    })
  )
})
function $R(e) {
  const [t, n] = l.useState({
      getBoundingClientRect() {
        return DOMRect.fromRect({ width: 0, height: 0, x: 0, y: 0 })
      },
    }),
    r = l.useRef(null),
    o = l.useRef(null),
    s = l.useRef(null),
    i = l.useRef(null),
    a = l.useRef(!0),
    c = l.useRef(null),
    u = nn(),
    f = l.useMemo(
      () => ({
        anchor: t,
        setAnchor: n,
        actionsRef: s,
        backdropRef: r,
        internalBackdropRef: o,
        positionerRef: i,
        allowMouseUpTriggerRef: a,
        initialCursorPointRef: c,
        rootId: u,
      }),
      [t, u],
    )
  return E.jsx(wm.Provider, {
    value: f,
    children: E.jsx(hc.Provider, { value: void 0, children: E.jsx(vc, { ...e }) }),
  })
}
const Sd = 500,
  VR = l.forwardRef(function (t, n) {
    const { render: r, className: o, ...s } = t,
      {
        setAnchor: i,
        actionsRef: a,
        internalBackdropRef: c,
        backdropRef: u,
        positionerRef: f,
        allowMouseUpTriggerRef: d,
        initialCursorPointRef: g,
        rootId: h,
      } = qo(!1),
      { store: m } = rn(!1),
      p = m.useState('open'),
      b = m.useState('disabled'),
      y = l.useRef(null),
      v = l.useRef(null),
      C = bt(),
      w = bt(),
      x = l.useRef(!1)
    function S(T, O, L) {
      const A = L.type.startsWith('touch')
      ;((g.current = { x: T, y: O }),
        i({
          getBoundingClientRect() {
            return DOMRect.fromRect({ width: A ? 10 : 0, height: A ? 10 : 0, x: T, y: O })
          },
        }),
        (x.current = !1),
        a.current?.setOpen(!0, ge(dr, L)),
        w.start(Sd, () => {
          x.current = !0
        }))
    }
    function k(T) {
      if (b) return
      ;((d.current = !0),
        Je(T),
        S(T.clientX, T.clientY, T.nativeEvent),
        ke(y.current).addEventListener(
          'mouseup',
          (L) => {
            if (((d.current = !1), !x.current)) return
            ;(w.clear(), (x.current = !1))
            const A = Ge(L)
            be(f.current, A) || (h && A && yc(A) === h) || a.current?.setOpen(!1, ge(Vp, L))
          },
          { once: !0 },
        ))
    }
    function R(T) {
      if (!b && ((d.current = !1), T.touches.length === 1)) {
        T.stopPropagation()
        const O = T.touches[0]
        ;((v.current = { x: O.clientX, y: O.clientY }),
          C.start(Sd, () => {
            v.current && S(v.current.x, v.current.y, T.nativeEvent)
          }))
      }
    }
    function M(T) {
      if (C.isStarted() && v.current && T.touches.length === 1) {
        const O = T.touches[0],
          L = 10,
          A = Math.abs(O.clientX - v.current.x),
          z = Math.abs(O.clientY - v.current.y)
        ;(A > L || z > L) && C.clear()
      }
    }
    function j() {
      ;(C.clear(), (v.current = null))
    }
    return (
      l.useEffect(() => {
        function T(L) {
          if (b) return
          const z = Ge(L)
          ;(be(y.current, z) || be(c.current, z) || be(u.current, z)) && L.preventDefault()
        }
        const O = ke(y.current)
        return (
          O.addEventListener('contextmenu', T),
          () => {
            O.removeEventListener('contextmenu', T)
          }
        )
      }, [u, b, c]),
      Oe('div', t, {
        state: { open: p },
        ref: [y, n],
        props: [
          {
            onContextMenu: k,
            onTouchStart: R,
            onTouchMove: M,
            onTouchEnd: j,
            onTouchCancel: j,
            style: { WebkitTouchCallout: 'none' },
          },
          s,
        ],
        stateAttributesMapping: ni,
      })
    )
  }),
  HR = 'data-composite-item-active',
  BR = []
function WR(e) {
  const {
      itemSizes: t,
      cols: n = 1,
      loopFocus: r = !0,
      dense: o = !1,
      orientation: s = 'both',
      direction: i,
      highlightedIndex: a,
      onHighlightedIndexChange: c,
      rootRef: u,
      enableHomeAndEndKeys: f = !1,
      stopEventPropagation: d = !1,
      disabledIndices: g,
      modifierKeys: h = BR,
    } = e,
    [m, p] = l.useState(0),
    b = n > 1,
    y = l.useRef(null),
    v = Vn(y, u),
    C = l.useRef([]),
    w = l.useRef(!1),
    x = a ?? m,
    S = ne((M, j = !1) => {
      if (((c ?? p)(M), j)) {
        const P = C.current[M]
        Vu(y.current, P, i, s)
      }
    }),
    k = ne((M) => {
      if (M.size === 0 || w.current) return
      w.current = !0
      const j = Array.from(M.keys()),
        P = j.find((T) => T?.hasAttribute(HR)) ?? null,
        I = P ? j.indexOf(P) : -1
      ;(I !== -1 && S(I), Vu(y.current, P, i, s))
    }),
    R = l.useMemo(
      () => ({
        'aria-orientation': s === 'both' ? void 0 : s,
        ref: v,
        onFocus(M) {
          !y.current || !$u(M.target) || M.target.setSelectionRange(0, M.target.value.length ?? 0)
        },
        onKeyDown(M) {
          const j = f ? cC : xg
          if (!j.has(M.key) || GR(M, h) || !y.current) return
          const I = i === 'rtl',
            T = I ? jo : Br,
            O = { horizontal: T, vertical: ir, both: T }[s],
            L = I ? Br : jo,
            A = { horizontal: L, vertical: Hr, both: L }[s]
          if ($u(M.target) && !ww(M.target)) {
            const se = M.target.selectionStart,
              Y = M.target.selectionEnd,
              oe = M.target.value ?? ''
            if (
              se == null ||
              M.shiftKey ||
              se !== Y ||
              (M.key !== A && se < oe.length) ||
              (M.key !== O && se > 0)
            )
              return
          }
          let z = x
          const D = Os(C, g),
            $ = Ya(C, g)
          if (b) {
            const se =
                t || Array.from({ length: C.current.length }, () => ({ width: 1, height: 1 })),
              Y = sg(se, n, o),
              oe = Y.findIndex((le) => le != null && !_n(C, le, g)),
              te = Y.reduce((le, ve, X) => (ve != null && !_n(C, ve, g) ? X : le), -1)
            z =
              Y[
                og(
                  { current: Y.map((le) => (le ? C.current[le] : null)) },
                  {
                    event: M,
                    orientation: s,
                    loopFocus: r,
                    cols: n,
                    disabledIndices: ag(
                      [...(g || C.current.map((le, ve) => (_n(C, ve) ? ve : void 0))), void 0],
                      Y,
                    ),
                    minIndex: oe,
                    maxIndex: te,
                    prevIndex: ig(
                      x > $ ? D : x,
                      se,
                      Y,
                      n,
                      M.key === ir ? 'bl' : M.key === Br ? 'tr' : 'tl',
                    ),
                    rtl: I,
                  },
                )
              ]
          }
          const F = { horizontal: [T], vertical: [ir], both: [T, ir] }[s],
            Q = { horizontal: [L], vertical: [Hr], both: [L, Hr] }[s],
            q = b ? j : { horizontal: f ? aC : vg, vertical: f ? lC : yg, both: j }[s]
          ;(f && (M.key === Uo ? (z = D) : M.key === Zo && (z = $)),
            z === x &&
              (F.includes(M.key) || Q.includes(M.key)) &&
              (r && z === $ && F.includes(M.key)
                ? (z = D)
                : r && z === D && Q.includes(M.key)
                  ? (z = $)
                  : (z = dt(C, {
                      startingIndex: z,
                      decrement: Q.includes(M.key),
                      disabledIndices: g,
                    }))),
            z !== x &&
              !$r(C, z) &&
              (d && M.stopPropagation(),
              q.has(M.key) && M.preventDefault(),
              S(z, !0),
              queueMicrotask(() => {
                C.current[z]?.focus()
              })))
        },
      }),
      [n, o, i, g, C, f, x, b, t, r, v, h, S, s, d],
    )
  return l.useMemo(
    () => ({
      props: R,
      highlightedIndex: x,
      onHighlightedIndexChange: S,
      elementsRef: C,
      disabledIndices: g,
      onMapChange: k,
      relayKeyboardEvent: R.onKeyDown,
    }),
    [R, x, S, C, g, k],
  )
}
function GR(e, t) {
  for (const n of gC.values()) if (!t.includes(n) && e.getModifierState(n)) return !0
  return !1
}
function UR(e) {
  const {
      render: t,
      className: n,
      refs: r = un,
      props: o = un,
      state: s = Ke,
      stateAttributesMapping: i,
      highlightedIndex: a,
      onHighlightedIndexChange: c,
      orientation: u,
      dense: f,
      itemSizes: d,
      loopFocus: g,
      cols: h,
      enableHomeAndEndKeys: m,
      onMapChange: p,
      stopEventPropagation: b = !0,
      rootRef: y,
      disabledIndices: v,
      modifierKeys: C,
      highlightItemOnHover: w = !1,
      tag: x = 'div',
      ...S
    } = e,
    k = pi(),
    {
      props: R,
      highlightedIndex: M,
      onHighlightedIndexChange: j,
      elementsRef: P,
      onMapChange: I,
      relayKeyboardEvent: T,
    } = WR({
      itemSizes: d,
      cols: h,
      loopFocus: g,
      dense: f,
      orientation: u,
      highlightedIndex: a,
      onHighlightedIndexChange: c,
      rootRef: y,
      stopEventPropagation: b,
      enableHomeAndEndKeys: m,
      direction: k,
      disabledIndices: v,
      modifierKeys: C,
    }),
    O = Oe(x, e, { state: s, ref: r, props: [R, ...o, S], stateAttributesMapping: i }),
    L = l.useMemo(
      () => ({
        highlightedIndex: M,
        onHighlightedIndexChange: j,
        highlightItemOnHover: w,
        relayKeyboardEvent: T,
      }),
      [M, j, w, T],
    )
  return E.jsx(Wp.Provider, {
    value: L,
    children: E.jsx(Ml, {
      elementsRef: P,
      onMapChange: (A) => {
        ;(p?.(A), I(A))
      },
      children: O,
    }),
  })
}
const Om = l.forwardRef(function (t, n) {
    const { children: r, container: o, className: s, render: i, ...a } = t,
      { portalNode: c, portalSubtree: u } = Mg({
        container: o,
        ref: n,
        componentProps: t,
        elementProps: a,
      })
    return !u && !c ? null : E.jsxs(l.Fragment, { children: [u, c && Mt.createPortal(r, c)] })
  }),
  xc = l.createContext(void 0)
function wc() {
  const e = l.useContext(xc)
  if (!e) throw new Error(Ve(73))
  return e
}
let Ed = 0
function ZR(e) {
  return ((Ed += 1), `${e}-${Math.random().toString(36).slice(2, 6)}-${Ed}`)
}
function ba(e, t) {
  if (typeof e == 'string') return { description: e }
  if (typeof e == 'function') {
    const n = e(t)
    return typeof n == 'string' ? { description: n } : n
  }
  return e
}
const Cs = WS(
    (e) => e.toasts,
    (e) => {
      const t = new Map()
      let n = 0,
        r = 0
      return (
        e.forEach((o, s) => {
          const i = o.transitionStatus === 'ending'
          ;(t.set(o.id, { value: o, domIndex: s, visibleIndex: i ? -1 : n, offsetY: r }),
            (r += o.height || 0),
            i || (n += 1))
        }),
        t
      )
    },
  ),
  ln = {
    toasts: G((e) => e.toasts),
    isEmpty: G((e) => e.toasts.length === 0),
    toast: G(Cs, (e, t) => e.get(t)?.value),
    toastIndex: G(Cs, (e, t) => e.get(t)?.domIndex ?? -1),
    toastOffsetY: G(Cs, (e, t) => e.get(t)?.offsetY ?? 0),
    toastVisibleIndex: G(Cs, (e, t) => e.get(t)?.visibleIndex ?? -1),
    hovering: G((e) => e.hovering),
    focused: G((e) => e.focused),
    expanded: G((e) => e.hovering || e.focused),
    expandedOrOutOfFocus: G((e) => e.hovering || e.focused || !e.isWindowFocused),
    prevFocusElement: G((e) => e.prevFocusElement),
  }
class KR extends Ko {
  timers = new Map()
  areTimersPaused = !1
  constructor(t) {
    super(t, {}, ln)
  }
  setFocused(t) {
    this.set('focused', t)
  }
  setHovering(t) {
    this.set('hovering', t)
  }
  setIsWindowFocused(t) {
    this.set('isWindowFocused', t)
  }
  setPrevFocusElement(t) {
    this.set('prevFocusElement', t)
  }
  setViewport = (t) => {
    this.set('viewport', t)
  }
  disposeEffect = () => () => {
    ;(this.timers.forEach((t) => {
      t.timeout?.clear()
    }),
      this.timers.clear())
  }
  removeToast(t) {
    const n = ln.toastIndex(this.state, t)
    if (n === -1) return
    this.state.toasts[n]?.onRemove?.()
    const o = [...this.state.toasts]
    ;(o.splice(n, 1), this.setToasts(o))
  }
  addToast = (t) => {
    const { toasts: n, timeout: r, limit: o } = this.state,
      s = t.id || ZR('toast'),
      i = { ...t, id: s, transitionStatus: 'starting' },
      a = [i, ...n],
      c = a.filter((f) => f.transitionStatus !== 'ending')
    if (c.length > o) {
      const f = c.length - o,
        d = c.slice(-f),
        g = new Set(d.map((h) => h.id))
      this.setToasts(
        a.map((h) => {
          const m = g.has(h.id)
          return h.limited !== m ? { ...h, limited: m } : h
        }),
      )
    } else this.setToasts(a.map((f) => (f.limited ? { ...f, limited: !1 } : f)))
    const u = i.timeout ?? r
    return (
      i.type !== 'loading' && u > 0 && this.scheduleTimer(s, u, () => this.closeToast(s)),
      ln.expandedOrOutOfFocus(this.state) && this.pauseTimers(),
      s
    )
  }
  updateToast = (t, n) => {
    this.updateToastInternal(t, n)
  }
  updateToastInternal = (t, n) => {
    const { timeout: r, toasts: o } = this.state,
      s = ln.toast(this.state, t) ?? null
    if (!s || s.transitionStatus === 'ending') return
    const i = { ...s, ...n }
    this.setToasts(o.map((m) => (m.id === t ? { ...m, ...n } : m)))
    const a = i.timeout ?? r,
      c = s?.timeout ?? r,
      u = Object.hasOwn(n, 'timeout'),
      f = i.transitionStatus !== 'ending' && i.type !== 'loading' && a > 0,
      d = this.timers.has(t),
      g = c !== a,
      h = s?.type === 'loading'
    if (!f && d) {
      ;(this.timers.get(t)?.timeout?.clear(), this.timers.delete(t))
      return
    }
    if (f && (!d || g || u || h)) {
      const m = this.timers.get(t)
      ;(m && (m.timeout?.clear(), this.timers.delete(t)),
        this.scheduleTimer(t, a, () => this.closeToast(t)),
        ln.expandedOrOutOfFocus(this.state) && this.pauseTimers())
    }
  }
  closeToast = (t) => {
    ln.toast(this.state, t)?.onClose?.()
    const { limit: r, toasts: o } = this.state
    let s = 0
    const i = o.map((c) => {
        if (c.id === t) return { ...c, transitionStatus: 'ending', height: 0 }
        if (c.transitionStatus === 'ending') return c
        const u = s >= r
        return ((s += 1), c.limited !== u ? { ...c, limited: u } : c)
      }),
      a = this.timers.get(t)
    ;(a && a.timeout && (a.timeout.clear(), this.timers.delete(t)),
      this.handleFocusManagement(t),
      this.setToasts(i))
  }
  promiseToast = (t, n) => {
    const r = ba(n.loading),
      o = this.addToast({ ...r, type: 'loading' }),
      s = t
        .then((i) => {
          const a = ba(n.success, i)
          return (this.updateToast(o, { ...a, type: 'success', timeout: a.timeout }), i)
        })
        .catch((i) => {
          const a = ba(n.error, i)
          return (
            this.updateToast(o, { ...a, type: 'error', timeout: a.timeout }),
            Promise.reject(i)
          )
        })
    return ({}.hasOwnProperty.call(n, 'setPromise') && n.setPromise(s), s)
  }
  pauseTimers() {
    this.areTimersPaused ||
      ((this.areTimersPaused = !0),
      this.timers.forEach((t) => {
        if (t.timeout) {
          t.timeout.clear()
          const n = Date.now() - t.start,
            r = t.delay - n
          t.remaining = r > 0 ? r : 0
        }
      }))
  }
  resumeTimers() {
    this.areTimersPaused &&
      ((this.areTimersPaused = !1),
      this.timers.forEach((t, n) => {
        ;((t.remaining = t.remaining > 0 ? t.remaining : t.delay),
          (t.timeout ??= _t.create()),
          t.timeout.start(t.remaining, () => {
            ;(this.timers.delete(n), t.callback())
          }),
          (t.start = Date.now()))
      }))
  }
  restoreFocusToPrevElement() {
    this.state.prevFocusElement?.focus({ preventScroll: !0 })
  }
  handleDocumentPointerDown = (t) => {
    if (t.pointerType !== 'touch') return
    const n = Ge(t)
    be(this.state.viewport, n) || (this.resumeTimers(), this.update({ hovering: !1, focused: !1 }))
  }
  scheduleTimer(t, n, r) {
    const o = Date.now(),
      s = !ln.expandedOrOutOfFocus(this.state),
      i = s ? _t.create() : void 0
    ;(i?.start(n, () => {
      ;(this.timers.delete(t), r())
    }),
      this.timers.set(t, { timeout: i, start: s ? o : 0, delay: n, remaining: n, callback: r }))
  }
  setToasts(t) {
    const n = { toasts: t }
    ;(t.length === 0 && ((n.hovering = !1), (n.focused = !1)), this.update(n))
  }
  handleFocusManagement(t) {
    const n = St(ke(this.state.viewport))
    if (!this.state.viewport || !be(this.state.viewport, n) || !Ws(n)) return
    const r = ln.toasts(this.state),
      o = ln.toastIndex(this.state, t)
    let s = null,
      i = o + 1
    for (; i < r.length; ) {
      if (r[i].transitionStatus !== 'ending') {
        s = r[i]
        break
      }
      i += 1
    }
    if (!s)
      for (i = o - 1; i >= 0; ) {
        if (r[i].transitionStatus !== 'ending') {
          s = r[i]
          break
        }
        i -= 1
      }
    s ? s.ref?.current?.focus() : this.restoreFocusToPrevElement()
  }
}
const Mm = function (t) {
  const { children: n, timeout: r = 5e3, limit: o = 3, toastManager: s } = t,
    i = ot(
      () =>
        new KR({
          timeout: r,
          limit: o,
          viewport: null,
          toasts: [],
          hovering: !1,
          focused: !1,
          isWindowFocused: !0,
          prevFocusElement: null,
        }),
    ).current
  return (
    mi(i.disposeEffect),
    l.useEffect(
      function () {
        return s
          ? s[' subscribe'](({ action: u, options: f }) => {
              const d = f.id
              u === 'promise' && f.promise
                ? i.promiseToast(f.promise, f)
                : u === 'update' && d
                  ? i.updateToast(d, f)
                  : u === 'close' && d
                    ? i.closeToast(d)
                    : i.addToast(f)
            })
          : void 0
      },
      [i, r, s],
    ),
    i.useSyncedValues({ timeout: r, limit: o }),
    E.jsx(xc.Provider, { value: i, children: n })
  )
}
let YR = (function (e) {
  return ((e.frontmostHeight = '--toast-frontmost-height'), e)
})({})
const Am = l.forwardRef(function (t, n) {
    const { render: r, className: o, children: s, ...i } = t,
      a = wc(),
      c = bt(),
      u = l.useRef(!1),
      f = l.useRef(!1),
      d = a.useState('isEmpty'),
      g = a.useState('toasts'),
      h = a.useState('focused'),
      m = a.useState('expanded'),
      p = a.useState('prevFocusElement'),
      b = g[0]?.height ?? 0,
      y = l.useMemo(() => g.some((I) => I.transitionStatus === 'ending'), [g])
    ;(l.useEffect(() => {
      const I = a.state.viewport
      if (!I) return
      function T(L) {
        d ||
          (L.key === 'F6' &&
            L.target !== I &&
            (L.preventDefault(),
            a.setPrevFocusElement(St(ke(I))),
            I?.focus({ preventScroll: !0 }),
            a.pauseTimers(),
            a.setFocused(!0)))
      }
      const O = Ye(I)
      return (
        O.addEventListener('keydown', T),
        () => {
          O.removeEventListener('keydown', T)
        }
      )
    }, [a, d]),
      l.useEffect(() => {
        const I = a.state.viewport
        if (!I || d) return
        const T = Ye(I)
        function O(A) {
          A.target === T && (a.setIsWindowFocused(!1), a.pauseTimers())
        }
        function L(A) {
          if (A.relatedTarget || A.target === T) return
          const z = Ge(A),
            D = St(ke(I))
          ;((!be(I, z) || !Ws(D)) && a.resumeTimers(), c.start(0, () => a.setIsWindowFocused(!0)))
        }
        return (
          T.addEventListener('blur', O, !0),
          T.addEventListener('focus', L, !0),
          () => {
            ;(T.removeEventListener('blur', O, !0), T.removeEventListener('focus', L, !0))
          }
        )
      }, [a, c, d]),
      l.useEffect(() => {
        const I = a.state.viewport
        if (!I || d) return
        const T = ke(I)
        return (
          T.addEventListener('pointerdown', a.handleDocumentPointerDown, !0),
          () => {
            T.removeEventListener('pointerdown', a.handleDocumentPointerDown, !0)
          }
        )
      }, [d, a]))
    function v(I) {
      const T = a.state.viewport
      T &&
        ((u.current = !0),
        I.relatedTarget === T ? g[0]?.ref?.current?.focus() : a.restoreFocusToPrevElement())
    }
    function C(I) {
      I.key === 'Tab' &&
        I.shiftKey &&
        I.target === a.state.viewport &&
        (I.preventDefault(), a.restoreFocusToPrevElement(), a.resumeTimers())
    }
    l.useEffect(() => {
      !a.state.isWindowFocused ||
        y ||
        !f.current ||
        (a.resumeTimers(), a.setHovering(!1), (f.current = !1))
    }, [y, a])
    function w() {
      ;(a.pauseTimers(), a.setHovering(!0), (f.current = !1))
    }
    function x() {
      y ? (f.current = !0) : (a.resumeTimers(), a.setHovering(!1))
    }
    function S() {
      if (u.current) {
        u.current = !1
        return
      }
      h || (Ws(ke(a.state.viewport).activeElement) && (a.setFocused(!0), a.pauseTimers()))
    }
    function k(I) {
      !h || be(a.state.viewport, I.relatedTarget) || (a.setFocused(!1), a.resumeTimers())
    }
    const R = {
        tabIndex: -1,
        role: 'region',
        'aria-live': 'polite',
        'aria-atomic': !1,
        'aria-relevant': 'additions text',
        'aria-label': 'Notifications',
        onMouseEnter: w,
        onMouseMove: w,
        onMouseLeave: x,
        onFocus: S,
        onBlur: k,
        onKeyDown: C,
        onClick: S,
      },
      M = { expanded: m },
      j = Oe('div', t, {
        ref: [n, a.setViewport],
        state: M,
        props: [
          R,
          { style: { [YR.frontmostHeight]: b ? `${b}px` : void 0 } },
          i,
          {
            children: E.jsxs(l.Fragment, {
              children: [
                !d && p && E.jsx(hn, { onFocus: v }),
                s,
                !d && p && E.jsx(hn, { onFocus: v }),
              ],
            }),
          },
        ],
      }),
      P = l.useMemo(() => g.filter((I) => I.priority === 'high'), [g])
    return E.jsxs(l.Fragment, {
      children: [
        !d && p && E.jsx(hn, { onFocus: v }),
        j,
        !h &&
          P.length > 0 &&
          E.jsx('div', {
            style: Ci,
            children: P.map((I) =>
              E.jsxs(
                'div',
                {
                  role: 'alert',
                  'aria-atomic': !0,
                  children: [
                    E.jsx('div', { children: I.title }),
                    E.jsx('div', { children: I.description }),
                  ],
                },
                I.id,
              ),
            ),
          }),
      ],
    })
  }),
  zm = l.createContext(void 0)
function Xo() {
  const e = l.useContext(zm)
  if (!e) throw new Error(Ve(66))
  return e
}
let rr = (function (e) {
  return (
    (e.index = '--toast-index'),
    (e.offsetY = '--toast-offset-y'),
    (e.height = '--toast-height'),
    (e.swipeMovementX = '--toast-swipe-movement-x'),
    (e.swipeMovementY = '--toast-swipe-movement-y'),
    e
  )
})({})
const qR = {
    ...Sr,
    swipeDirection(e) {
      return e ? { 'data-swipe-direction': e } : null
    },
  },
  vo = 40,
  XR = 10,
  Mn = 0.5,
  JR = 1
function Rd(e, t, n) {
  switch (e) {
    case 'up':
      return -n
    case 'down':
      return n
    case 'left':
      return -t
    case 'right':
      return t
    default:
      return 0
  }
}
function QR(e) {
  const n = window.getComputedStyle(e).transform
  let r = 0,
    o = 0,
    s = 1
  if (n && n !== 'none') {
    const i = n.match(/matrix(?:3d)?\(([^)]+)\)/)
    if (i) {
      const a = i[1].split(', ').map(parseFloat)
      a.length === 6
        ? ((r = a[4]), (o = a[5]), (s = Math.sqrt(a[0] * a[0] + a[1] * a[1])))
        : a.length === 16 && ((r = a[12]), (o = a[13]), (s = a[0]))
    }
  }
  return { x: r, y: o, scale: s }
}
const Lm = l.forwardRef(function (t, n) {
    const { toast: r, render: o, className: s, swipeDirection: i = ['down', 'right'], ...a } = t,
      c = r.positionerProps?.anchor !== void 0
    let u = []
    c || (u = Array.isArray(i) ? i : [i])
    const f = u.length > 0,
      d = wc(),
      [g, h] = l.useState(void 0),
      [m, p] = l.useState(!1),
      [b, y] = l.useState(!1),
      [v, C] = l.useState(!1),
      [w, x] = l.useState({ x: 0, y: 0 }),
      [S, k] = l.useState({ x: 0, y: 0, scale: 1 }),
      [R, M] = l.useState(),
      [j, P] = l.useState(),
      [I, T] = l.useState(null),
      O = l.useRef(null),
      L = l.useRef({ x: 0, y: 0 }),
      A = l.useRef({ x: 0, y: 0, scale: 1 }),
      z = l.useRef(void 0),
      D = l.useRef(0),
      $ = l.useRef(!1),
      F = l.useRef({ x: 0, y: 0 }),
      Q = l.useRef(!1),
      q = d.useState('toastIndex', r.id),
      se = d.useState('toastVisibleIndex', r.id),
      Y = d.useState('toastOffsetY', r.id),
      oe = d.useState('focused'),
      te = d.useState('expanded')
    Kn({
      open: r.transitionStatus !== 'ending',
      ref: O,
      onComplete() {
        r.transitionStatus === 'ending' && d.removeToast(r.id)
      },
    })
    const le = ne((_ = !1) => {
      const H = O.current
      if (!H) return
      const W = H.style.height
      H.style.height = 'auto'
      const J = H.offsetHeight
      H.style.height = W
      function fe() {
        d.updateToastInternal(r.id, {
          ref: O,
          height: J,
          ...(r.transitionStatus === 'starting' ? { transitionStatus: void 0 } : {}),
        })
      }
      _ ? Mt.flushSync(fe) : fe()
    })
    ae(le, [le])
    function ve(_, H) {
      let W = _,
        J = H
      return (
        !u.includes('left') && !u.includes('right')
          ? (W = _ > 0 ? _ ** Mn : -(Math.abs(_) ** Mn))
          : (!u.includes('right') && _ > 0 && (W = _ ** Mn),
            !u.includes('left') && _ < 0 && (W = -(Math.abs(_) ** Mn))),
        !u.includes('up') && !u.includes('down')
          ? (J = H > 0 ? H ** Mn : -(Math.abs(H) ** Mn))
          : (!u.includes('down') && H > 0 && (J = H ** Mn),
            !u.includes('up') && H < 0 && (J = -(Math.abs(H) ** Mn))),
        { x: W, y: J }
      )
    }
    function X(_) {
      if (_.button !== 0) return
      _.pointerType === 'touch' && d.pauseTimers()
      const H = Ge(_.nativeEvent)
      if (!(H && H.closest('button,a,input,textarea,[role="button"],[data-swipe-ignore]'))) {
        if (
          (($.current = !1),
          (z.current = void 0),
          (D.current = 0),
          (L.current = { x: _.clientX, y: _.clientY }),
          (F.current = L.current),
          O.current)
        ) {
          const J = QR(O.current)
          ;((A.current = J), k(J), x({ x: J.x, y: J.y }))
        }
        ;(d.setHovering(!0),
          p(!0),
          y(!1),
          T(null),
          (Q.current = !0),
          O.current?.setPointerCapture(_.pointerId))
      }
    }
    function me(_) {
      if (!m) return
      ;(_.preventDefault(),
        Q.current && ((L.current = { x: _.clientX, y: _.clientY }), (Q.current = !1)))
      const { clientY: H, clientX: W, movementX: J, movementY: fe } = _
      ;(((fe < 0 && H > F.current.y) || (fe > 0 && H < F.current.y)) &&
        (F.current = { x: F.current.x, y: H }),
        ((J < 0 && W > F.current.x) || (J > 0 && W < F.current.x)) &&
          (F.current = { x: W, y: F.current.y }))
      const we = W - L.current.x,
        Ae = H - L.current.y,
        st = H - F.current.y,
        He = W - F.current.x
      if (!b && Math.sqrt(we * we + Ae * Ae) >= JR && (y(!0), I === null)) {
        const We = u.includes('left') || u.includes('right'),
          Se = u.includes('up') || u.includes('down')
        if (We && Se) {
          const Te = Math.abs(we),
            Fe = Math.abs(Ae)
          T(Te > Fe ? 'horizontal' : 'vertical')
        }
      }
      let Ee
      if (!z.current)
        (I === 'vertical'
          ? Ae > 0
            ? (Ee = 'down')
            : Ae < 0 && (Ee = 'up')
          : I === 'horizontal'
            ? we > 0
              ? (Ee = 'right')
              : we < 0 && (Ee = 'left')
            : Math.abs(we) >= Math.abs(Ae)
              ? (Ee = we > 0 ? 'right' : 'left')
              : (Ee = Ae > 0 ? 'down' : 'up'),
          Ee && u.includes(Ee) && ((z.current = Ee), (D.current = Rd(Ee, we, Ae)), h(Ee)))
      else {
        const it = z.current,
          We = Rd(it, He, st)
        We > vo
          ? (($.current = !1), h(it))
          : !(u.includes('left') && u.includes('right')) &&
            !(u.includes('up') && u.includes('down')) &&
            D.current - We >= XR &&
            ($.current = !0)
      }
      const _e = ve(we, Ae)
      let tt = A.current.x,
        Qe = A.current.y
      ;(I === 'horizontal'
        ? (u.includes('left') || u.includes('right')) && (tt += _e.x)
        : (I === 'vertical' || ((u.includes('left') || u.includes('right')) && (tt += _e.x)),
          (u.includes('up') || u.includes('down')) && (Qe += _e.y)),
        x({ x: tt, y: Qe }))
    }
    function he(_) {
      if (!m) return
      if ((p(!1), y(!1), T(null), O.current?.releasePointerCapture(_.pointerId), $.current)) {
        ;(x({ x: S.x, y: S.y }), h(void 0))
        return
      }
      let H = !1
      const W = w.x - S.x,
        J = w.y - S.y
      let fe
      for (const we of u) {
        switch (we) {
          case 'right':
            W > vo && ((H = !0), (fe = 'right'))
            break
          case 'left':
            W < -vo && ((H = !0), (fe = 'left'))
            break
          case 'down':
            J > vo && ((H = !0), (fe = 'down'))
            break
          case 'up':
            J < -vo && ((H = !0), (fe = 'up'))
            break
        }
        if (H) break
      }
      H ? (h(fe), C(!0), d.closeToast(r.id)) : (x({ x: S.x, y: S.y }), h(void 0))
    }
    function V(_) {
      if (_.key === 'Escape') {
        if (!O.current || !be(O.current, St(ke(O.current)))) return
        d.closeToast(r.id)
      }
    }
    l.useEffect(() => {
      if (!f) return
      const _ = O.current
      if (!_) return
      function H(W) {
        be(_, W.target) && W.preventDefault()
      }
      return (
        _.addEventListener('touchmove', H, { passive: !1 }),
        () => {
          _.removeEventListener('touchmove', H)
        }
      )
    }, [f])
    function Z() {
      if (!m && w.x === S.x && w.y === S.y && !v)
        return { [rr.swipeMovementX]: '0px', [rr.swipeMovementY]: '0px' }
      const _ = w.x - S.x,
        H = w.y - S.y
      return {
        transition: m ? 'none' : void 0,
        transform: m ? `translateX(${w.x}px) translateY(${w.y}px) scale(${S.scale})` : void 0,
        [rr.swipeMovementX]: `${_}px`,
        [rr.swipeMovementY]: `${H}px`,
      }
    }
    const K = r.priority === 'high',
      xe = {
        role: K ? 'alertdialog' : 'dialog',
        tabIndex: 0,
        'aria-modal': !1,
        'aria-labelledby': R,
        'aria-describedby': j,
        'aria-hidden': K && !oe ? !0 : void 0,
        onPointerDown: f ? X : void 0,
        onPointerMove: f ? me : void 0,
        onPointerUp: f ? he : void 0,
        onKeyDown: V,
        inert: Ti(r.limited),
        style: {
          ...Z(),
          [rr.index]: r.transitionStatus === 'ending' ? q : se,
          [rr.offsetY]: `${Y}px`,
          [rr.height]: r.height ? `${r.height}px` : void 0,
        },
      },
      N = l.useMemo(
        () => ({
          rootRef: O,
          toast: r,
          titleId: R,
          setTitleId: M,
          descriptionId: j,
          setDescriptionId: P,
          swiping: m,
          swipeDirection: g,
          recalculateHeight: le,
          index: q,
          visibleIndex: se,
          expanded: te,
        }),
        [r, R, j, m, g, le, q, se, te],
      ),
      U = {
        transitionStatus: r.transitionStatus,
        expanded: te,
        limited: r.limited || !1,
        type: r.type,
        swiping: N.swiping,
        swipeDirection: N.swipeDirection,
      },
      B = Oe('div', t, {
        ref: [n, N.rootRef],
        state: U,
        stateAttributesMapping: qR,
        props: [xe, a],
      })
    return E.jsx(zm.Provider, { value: N, children: B })
  }),
  jm = l.forwardRef(function (t, n) {
    const { render: r, className: o, ...s } = t,
      { visibleIndex: i, expanded: a, recalculateHeight: c } = Xo(),
      u = l.useRef(null)
    ae(() => {
      const h = u.current
      if (!h || (c(), typeof ResizeObserver != 'function' || typeof MutationObserver != 'function'))
        return
      const m = new ResizeObserver(() => c(!0)),
        p = new MutationObserver(() => c(!0))
      return (
        m.observe(h),
        p.observe(h, { childList: !0, subtree: !0, characterData: !0 }),
        () => {
          ;(m.disconnect(), p.disconnect())
        }
      )
    }, [c])
    const f = i > 0
    return Oe('div', t, { ref: [n, u], state: { expanded: a, behind: f }, props: s })
  }),
  Dm = l.forwardRef(function (t, n) {
    const { render: r, className: o, id: s, children: i, ...a } = t,
      { toast: c, setDescriptionId: u } = Xo(),
      f = i ?? c.description,
      d = !!f,
      g = nn(s)
    ae(() => {
      if (d)
        return (
          u(g),
          () => {
            u(void 0)
          }
        )
    }, [d, g, u])
    const h = { type: c.type },
      m = Oe('p', t, { ref: n, state: h, props: { ...a, id: g, children: f } })
    return d ? m : null
  }),
  e2 = l.forwardRef(function (t, n) {
    const { render: r, className: o, id: s, children: i, ...a } = t,
      { toast: c, setTitleId: u } = Xo(),
      f = i ?? c.title,
      d = !!f,
      g = nn(s)
    ae(() => {
      if (d)
        return (
          u(g),
          () => {
            u(void 0)
          }
        )
    }, [d, g, u])
    const h = { type: c.type },
      m = Oe('h2', t, { ref: n, state: h, props: { ...a, id: g, children: f } })
    return d ? m : null
  }),
  Nm = l.forwardRef(function (t, n) {
    const { render: r, className: o, disabled: s, nativeButton: i = !0, ...a } = t,
      c = wc(),
      { toast: u } = Xo(),
      f = c.useState('expanded'),
      [d, g] = l.useState(!1),
      { getButtonProps: h, buttonRef: m } = Rr({ disabled: s, native: i }),
      p = { type: u.type }
    return Oe('button', t, {
      ref: [n, m],
      state: p,
      props: [
        {
          'aria-hidden': !f && !d,
          onClick() {
            c.closeToast(u.id)
          },
          onFocus() {
            g(!0)
          },
          onBlur() {
            g(!1)
          },
        },
        a,
        h,
      ],
    })
  }),
  _m = l.forwardRef(function (t, n) {
    const { render: r, className: o, disabled: s, nativeButton: i = !0, ...a } = t,
      { toast: c } = Xo(),
      u = c.actionProps?.children ?? a.children,
      f = !!u,
      { getButtonProps: d, buttonRef: g } = Rr({ disabled: s, native: i }),
      h = { type: c.type },
      m = Oe('button', t, { ref: [n, g], state: h, props: [a, c.actionProps, d, { children: u }] })
    return f ? m : null
  }),
  Fm = Om
function $m() {
  const e = l.useContext(xc)
  if (!e) throw new Error(Ve(73))
  const t = e.useState('toasts')
  return l.useMemo(
    () => ({
      toasts: t,
      add: e.addToast,
      close: e.closeToast,
      update: e.updateToast,
      promise: e.promiseToast,
    }),
    [t, e],
  )
}
const Vm = l.createContext(void 0)
function t2(e = !0) {
  const t = l.useContext(Vm)
  if (t === void 0 && !e) throw new Error(Ve(7))
  return t
}
const n2 = l.forwardRef(function (t, n) {
  const {
      className: r,
      defaultPressed: o = !1,
      disabled: s = !1,
      form: i,
      onPressedChange: a,
      pressed: c,
      render: u,
      type: f,
      value: d,
      nativeButton: g = !0,
      ...h
    } = t,
    m = Gn(d || void 0),
    p = t2(),
    b = p?.value ?? [],
    y = p ? void 0 : o,
    v = (s || p?.disabled) ?? !1,
    [C, w] = Ro({
      controlled: p ? m !== void 0 && b.indexOf(m) > -1 : c,
      default: y,
      name: 'Toggle',
      state: 'pressed',
    }),
    x = ne((I, T) => {
      ;(m && p?.setGroupValue?.(m, I, T), a?.(I, T))
    }),
    { getButtonProps: S, buttonRef: k } = Rr({ disabled: v, native: g }),
    R = { disabled: v, pressed: C },
    M = [k, n],
    j = [
      {
        'aria-pressed': C,
        onClick(I) {
          const T = !C,
            O = ge(Et, I.nativeEvent)
          ;(x(T, O), !O.isCanceled && w(T))
        },
      },
      h,
      S,
    ],
    P = Oe('button', t, { enabled: !p, state: R, ref: M, props: j })
  return p ? E.jsx(Pm, { tag: 'button', render: u, className: r, state: R, refs: M, props: j }) : P
})
let r2 = (function (e) {
  return (
    (e.disabled = 'data-disabled'),
    (e.orientation = 'data-orientation'),
    (e.multiple = 'data-multiple'),
    e
  )
})({})
const kd = {
    multiple(e) {
      return e ? { [r2.multiple]: '' } : null
    },
  },
  o2 = l.forwardRef(function (t, n) {
    const {
        defaultValue: r,
        disabled: o = !1,
        loopFocus: s = !0,
        onValueChange: i,
        orientation: a = 'horizontal',
        multiple: c = !1,
        value: u,
        className: f,
        render: d,
        ...g
      } = t,
      h = Em(),
      m = l.useMemo(() => {
        if (u === void 0) return r ?? []
      }, [u, r]),
      p = l.useMemo(() => u !== void 0 || r !== void 0, [u, r]),
      b = (h?.disabled ?? !1) || o,
      [y, v] = Ro({ controlled: u, default: m, name: 'ToggleGroup', state: 'value' }),
      C = ne((R, M, j) => {
        let P
        if (
          (c ? ((P = y.slice()), M ? P.push(R) : P.splice(y.indexOf(R), 1)) : (P = M ? [R] : []),
          Array.isArray(P))
        ) {
          if ((i?.(P, j), j.isCanceled)) return
          v(P)
        }
      }),
      w = { disabled: b, multiple: c, orientation: a },
      x = l.useMemo(
        () => ({ disabled: b, orientation: a, setGroupValue: C, value: y, isValueInitialized: p }),
        [b, a, C, y, p],
      ),
      S = { role: 'group' },
      k = Oe('div', t, {
        enabled: !!h,
        state: w,
        ref: n,
        props: [S, g],
        stateAttributesMapping: kd,
      })
    return E.jsx(Vm.Provider, {
      value: x,
      children: h
        ? k
        : E.jsx(UR, {
            render: d,
            className: f,
            state: w,
            refs: [n],
            props: [S, g],
            stateAttributesMapping: kd,
            loopFocus: s,
            enableHomeAndEndKeys: !0,
          }),
    })
  }),
  Hm = l.createContext(void 0)
function Mi(e) {
  const t = l.useContext(Hm)
  if (t === void 0 && !e) throw new Error(Ve(72))
  return t
}
const s2 = {
  ...rc,
  disabled: G((e) => e.disabled),
  instantType: G((e) => e.instantType),
  isInstantPhase: G((e) => e.isInstantPhase),
  trackCursorAxis: G((e) => e.trackCursorAxis),
  disableHoverablePopup: G((e) => e.disableHoverablePopup),
  lastOpenChangeReason: G((e) => e.openChangeReason),
  closeDelay: G((e) => e.closeDelay),
  hasViewport: G((e) => e.hasViewport),
}
class Cc extends Ko {
  constructor(t) {
    super(
      { ...i2(), ...t },
      {
        popupRef: l.createRef(),
        onOpenChange: void 0,
        onOpenChangeComplete: void 0,
        triggerElements: new Yo(),
      },
      s2,
    )
  }
  setOpen = (t, n) => {
    const r = n.reason,
      o = r === Ct,
      s = t && r === Fr,
      i = !t && (r === dr || r === Bo)
    if (
      ((n.preventUnmountOnClose = () => {
        this.set('preventUnmountingOnClose', !0)
      }),
      this.context.onOpenChange?.(t, n),
      n.isCanceled)
    )
      return
    const a = () => {
      const c = { open: t, openChangeReason: r }
      s
        ? (c.instantType = 'focus')
        : i
          ? (c.instantType = 'dismiss')
          : r === Ct && (c.instantType = void 0)
      const u = n.trigger?.id ?? null
      ;((u || t) && ((c.activeTriggerId = u), (c.activeTriggerElement = n.trigger ?? null)),
        this.update(c))
    }
    o ? Mt.flushSync(a) : a()
  }
  static useStore(t, n) {
    const r = ot(() => new Cc(n)).current,
      o = t ?? r,
      s = oc({ popupStore: o, onOpenChange: o.setOpen })
    return ((o.state.floatingRootContext = s), o)
  }
}
function i2() {
  return {
    ...nc(),
    disabled: !1,
    instantType: void 0,
    isInstantPhase: !1,
    trackCursorAxis: 'none',
    disableHoverablePopup: !1,
    openChangeReason: null,
    closeDelay: 0,
    hasViewport: !1,
  }
}
const a2 = Jl(function (t) {
  const {
      disabled: n = !1,
      defaultOpen: r = !1,
      open: o,
      disableHoverablePopup: s = !1,
      trackCursorAxis: i = 'none',
      actionsRef: a,
      onOpenChange: c,
      onOpenChangeComplete: u,
      handle: f,
      triggerId: d,
      defaultTriggerId: g = null,
      children: h,
    } = t,
    m = Cc.useStore(f?.store, { open: r, openProp: o, activeTriggerId: g, triggerIdProp: d })
  ;(uc(() => {
    o === void 0 && m.state.open === !1 && r === !0 && m.update({ open: !0, activeTriggerId: g })
  }),
    m.useControlledProp('openProp', o),
    m.useControlledProp('triggerIdProp', d),
    m.useContextCallback('onOpenChange', c),
    m.useContextCallback('onOpenChangeComplete', u))
  const p = m.useState('open'),
    b = !n && p,
    y = m.useState('activeTriggerId'),
    v = m.useState('payload')
  ;(m.useSyncedValues({ trackCursorAxis: i, disableHoverablePopup: s }),
    ae(() => {
      p && n && m.setOpen(!1, ge(pw))
    }, [p, n, m]),
    m.useSyncedValue('disabled', n),
    ec(m))
  const { forceUnmount: C, transitionStatus: w } = tc(b, m),
    x = m.useState('isInstantPhase'),
    S = m.useState('instantType'),
    k = m.useState('lastOpenChangeReason'),
    R = l.useRef(null)
  ;(ae(() => {
    ;(w === 'ending' && k === Et) || (w !== 'ending' && x)
      ? (S !== 'delay' && (R.current = S), m.set('instantType', 'delay'))
      : R.current !== null && (m.set('instantType', R.current), (R.current = null))
  }, [w, x, k, S, m]),
    ae(() => {
      b && y == null && m.set('payload', void 0)
    }, [m, y, b]))
  const M = l.useCallback(() => {
    m.setOpen(!1, l2(m, Ll))
  }, [m])
  l.useImperativeHandle(a, () => ({ unmount: C, close: M }), [C, M])
  const j = m.useState('floatingRootContext'),
    P = Ri(j, { enabled: !n, referencePress: !0 }),
    I = NC(j, { enabled: !n && i !== 'none', axis: i === 'none' ? void 0 : i }),
    { getReferenceProps: T, getFloatingProps: O, getTriggerProps: L } = oo([P, I]),
    A = l.useMemo(() => T(), [T]),
    z = l.useMemo(() => L(), [L]),
    D = l.useMemo(() => O(), [O])
  return (
    m.useSyncedValues({ activeTriggerProps: A, inactiveTriggerProps: z, popupProps: D }),
    E.jsx(Hm.Provider, { value: m, children: typeof h == 'function' ? h({ payload: v }) : h })
  )
})
function l2(e, t) {
  const n = ge(t)
  return (
    (n.preventUnmountOnClose = () => {
      e.set('preventUnmountingOnClose', !0)
    }),
    n
  )
}
const Bm = l.createContext(void 0)
function c2() {
  return l.useContext(Bm)
}
let u2 = (function (e) {
  return (
    (e[(e.popupOpen = ti.popupOpen)] = 'popupOpen'),
    (e.triggerDisabled = 'data-trigger-disabled'),
    e
  )
})({})
const d2 = 600,
  f2 = Hg(function (t, n) {
    const {
        className: r,
        render: o,
        handle: s,
        payload: i,
        disabled: a,
        delay: c,
        closeDelay: u,
        id: f,
        ...d
      } = t,
      g = Mi(!0),
      h = s?.store ?? g
    if (!h) throw new Error(Ve(82))
    const m = Gn(f),
      p = h.useState('isTriggerActive', m),
      b = h.useState('isOpenedByTrigger', m),
      y = h.useState('floatingRootContext'),
      v = l.useRef(null),
      C = c ?? d2,
      w = u ?? 0,
      { registerTrigger: x, isMountedByThisTrigger: S } = Gg(m, v, h, {
        payload: i,
        closeDelay: w,
      }),
      k = c2(),
      { delayRef: R, isInstantPhase: M, hasProvider: j } = kC(y, { open: b })
    h.useSyncedValue('isInstantPhase', M)
    const P = h.useState('disabled'),
      I = a ?? P,
      T = h.useState('trackCursorAxis'),
      O = h.useState('disableHoverablePopup'),
      L = ic(y, {
        enabled: !I,
        mouseOnly: !0,
        move: !1,
        handleClose: !O && T !== 'both' ? ac() : null,
        restMs() {
          const F = k?.delay,
            Q = typeof R.current == 'object' ? R.current.open : void 0
          let q = C
          return (j && (Q !== 0 ? (q = c ?? F ?? C) : (q = 0)), q)
        },
        delay() {
          const F = typeof R.current == 'object' ? R.current.close : void 0
          let Q = w
          return (u == null && j && (Q = F), { close: Q })
        },
        triggerElementRef: v,
        isActiveTrigger: p,
      }),
      A = Zg(y, { enabled: !I }).reference,
      z = { open: b },
      D = h.useState('triggerProps', S)
    return Oe('button', t, {
      state: z,
      ref: [n, x, v],
      props: [L, A, D, { id: m, [u2.triggerDisabled]: I ? '' : void 0 }, d],
      stateAttributesMapping: em,
    })
  }),
  Wm = l.createContext(void 0)
function p2() {
  const e = l.useContext(Wm)
  if (e === void 0) throw new Error(Ve(70))
  return e
}
const g2 = l.forwardRef(function (t, n) {
    const { keepMounted: r = !1, ...o } = t
    return Mi().useState('mounted') || r
      ? E.jsx(Wm.Provider, { value: r, children: E.jsx(Om, { ref: n, ...o }) })
      : null
  }),
  Gm = l.createContext(void 0)
function m2() {
  const e = l.useContext(Gm)
  if (e === void 0) throw new Error(Ve(71))
  return e
}
const h2 = l.forwardRef(function (t, n) {
    const {
        render: r,
        className: o,
        anchor: s,
        positionMethod: i = 'absolute',
        side: a = 'top',
        align: c = 'center',
        sideOffset: u = 0,
        alignOffset: f = 0,
        collisionBoundary: d = 'clipping-ancestors',
        collisionPadding: g = 5,
        arrowPadding: h = 5,
        sticky: m = !1,
        disableAnchorTracking: p = !1,
        collisionAvoidance: b = $p,
        ...y
      } = t,
      v = Mi(),
      C = p2(),
      w = v.useState('open'),
      x = v.useState('mounted'),
      S = v.useState('trackCursorAxis'),
      k = v.useState('disableHoverablePopup'),
      R = v.useState('floatingRootContext'),
      M = v.useState('instantType'),
      j = v.useState('transitionStatus'),
      P = v.useState('hasViewport'),
      I = gc({
        anchor: s,
        positionMethod: i,
        floatingRootContext: R,
        mounted: x,
        side: a,
        sideOffset: u,
        align: c,
        alignOffset: f,
        collisionBoundary: d,
        collisionPadding: g,
        sticky: m,
        arrowPadding: h,
        disableAnchorTracking: p,
        keepMounted: C,
        collisionAvoidance: b,
        adaptiveOrigin: P ? fR : void 0,
      }),
      T = l.useMemo(() => {
        const z = {}
        return (
          (!w || S === 'both' || k) && (z.pointerEvents = 'none'),
          { role: 'presentation', hidden: !x, style: { ...I.positionerStyles, ...z } }
        )
      }, [w, S, k, x, I.positionerStyles]),
      O = l.useMemo(
        () => ({
          open: w,
          side: I.side,
          align: I.align,
          anchorHidden: I.anchorHidden,
          instant: S !== 'none' ? 'tracking-cursor' : M,
        }),
        [w, I.side, I.align, I.anchorHidden, S, M],
      ),
      L = l.useMemo(
        () => ({
          ...O,
          arrowRef: I.arrowRef,
          arrowStyles: I.arrowStyles,
          arrowUncentered: I.arrowUncentered,
        }),
        [O, I.arrowRef, I.arrowStyles, I.arrowUncentered],
      ),
      A = Oe('div', t, {
        state: O,
        props: [T, so(j), y],
        ref: [n, v.useStateSetter('positionerElement')],
        stateAttributesMapping: qn,
      })
    return E.jsx(Gm.Provider, { value: L, children: A })
  }),
  b2 = { ...qn, ...Sr },
  v2 = l.forwardRef(function (t, n) {
    const { className: r, render: o, ...s } = t,
      i = Mi(),
      { side: a, align: c } = m2(),
      u = i.useState('open'),
      f = i.useState('instantType'),
      d = i.useState('transitionStatus'),
      g = i.useState('popupProps'),
      h = i.useState('floatingRootContext')
    Kn({
      open: u,
      ref: i.context.popupRef,
      onComplete() {
        u && i.context.onOpenChangeComplete?.(!0)
      },
    })
    const m = i.useState('disabled'),
      p = i.useState('closeDelay')
    return (
      Yg(h, { enabled: !m, closeDelay: p }),
      Oe('div', t, {
        state: { open: u, side: a, align: c, instant: f, transitionStatus: d },
        ref: [n, i.context.popupRef, i.useStateSetter('popupElement')],
        props: [g, so(d), s],
        stateAttributesMapping: b2,
      })
    )
  }),
  y2 = function (t) {
    const { delay: n, closeDelay: r, timeout: o = 400 } = t,
      s = l.useMemo(() => ({ delay: n, closeDelay: r }), [n, r]),
      i = l.useMemo(() => ({ open: n, close: r }), [n, r])
    return E.jsx(Bm.Provider, {
      value: s,
      children: E.jsx(RC, { delay: i, timeoutMs: o, children: t.children }),
    })
  },
  x2 = new Map([
    [
      'bold',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M236,200a12,12,0,0,1-24,0,84.09,84.09,0,0,0-84-84H61l27.52,27.51a12,12,0,0,1-17,17l-48-48a12,12,0,0,1,0-17l48-48a12,12,0,0,1,17,17L61,92h67A108.12,108.12,0,0,1,236,200Z',
        }),
      ),
    ],
    [
      'duotone',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', { d: 'M80,56v96L32,104Z', opacity: '0.2' }),
        l.createElement('path', {
          d: 'M128,96H88V56a8,8,0,0,0-13.66-5.66l-48,48a8,8,0,0,0,0,11.32l48,48A8,8,0,0,0,88,152V112h40a88.1,88.1,0,0,1,88,88,8,8,0,0,0,16,0A104.11,104.11,0,0,0,128,96ZM72,132.69,43.31,104,72,75.31Z',
        }),
      ),
    ],
    [
      'fill',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M232,200a8,8,0,0,1-16,0,88.1,88.1,0,0,0-88-88H88v40a8,8,0,0,1-13.66,5.66l-48-48a8,8,0,0,1,0-11.32l48-48A8,8,0,0,1,88,56V96h40A104.11,104.11,0,0,1,232,200Z',
        }),
      ),
    ],
    [
      'light',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M230,200a6,6,0,0,1-12,0,90.1,90.1,0,0,0-90-90H46.49l37.75,37.76a6,6,0,1,1-8.48,8.48l-48-48a6,6,0,0,1,0-8.48l48-48a6,6,0,0,1,8.48,8.48L46.49,98H128A102.12,102.12,0,0,1,230,200Z',
        }),
      ),
    ],
    [
      'regular',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M232,200a8,8,0,0,1-16,0,88.1,88.1,0,0,0-88-88H51.31l34.35,34.34a8,8,0,0,1-11.32,11.32l-48-48a8,8,0,0,1,0-11.32l48-48A8,8,0,0,1,85.66,61.66L51.31,96H128A104.11,104.11,0,0,1,232,200Z',
        }),
      ),
    ],
    [
      'thin',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M228,200a4,4,0,0,1-8,0,92.1,92.1,0,0,0-92-92H41.66l41.17,41.17a4,4,0,0,1-5.66,5.66l-48-48a4,4,0,0,1,0-5.66l48-48a4,4,0,0,1,5.66,5.66L41.66,100H128A100.11,100.11,0,0,1,228,200Z',
        }),
      ),
    ],
  ]),
  w2 = new Map([
    [
      'bold',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM104.49,56.48,116,45V88a12,12,0,0,0,24,0V45l11.51,11.51a12,12,0,0,0,17-17l-32-32a12,12,0,0,0-17,0l-32,32a12,12,0,0,0,17,17Zm47,143L140,211V168a12,12,0,0,0-24,0v43l-11.51-11.52a12,12,0,0,0-17,17l32,32a12,12,0,0,0,17,0l32-32a12,12,0,0,0-17-17Z',
        }),
      ),
    ],
    [
      'duotone',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M216,32V224a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V32A16,16,0,0,1,56,16H200A16,16,0,0,1,216,32Z',
          opacity: '0.2',
        }),
        l.createElement('path', {
          d: 'M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM101.66,53.66,120,35.31V96a8,8,0,0,0,16,0V35.31l18.34,18.35a8,8,0,0,0,11.32-11.32l-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32Zm52.68,148.68L136,220.69V160a8,8,0,0,0-16,0v60.69l-18.34-18.35a8,8,0,0,0-11.32,11.32l32,32a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Z',
        }),
      ),
    ],
    [
      'fill',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M88.61,51.06a8,8,0,0,1,1.73-8.72l32-32a8,8,0,0,1,11.32,0l32,32A8,8,0,0,1,160,56H136V96a8,8,0,0,1-16,0V56H96A8,8,0,0,1,88.61,51.06ZM216,120H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm-56,80H136V160a8,8,0,0,0-16,0v40H96a8,8,0,0,0-5.66,13.66l32,32a8,8,0,0,0,11.32,0l32-32A8,8,0,0,0,160,200Z',
        }),
      ),
    ],
    [
      'light',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M222,128a6,6,0,0,1-6,6H40a6,6,0,0,1,0-12H216A6,6,0,0,1,222,128ZM100.24,52.24,122,30.49V96a6,6,0,0,0,12,0V30.49l21.76,21.75a6,6,0,0,0,8.48-8.48l-32-32a6,6,0,0,0-8.48,0l-32,32a6,6,0,0,0,8.48,8.48Zm55.52,151.52L134,225.51V160a6,6,0,0,0-12,0v65.51l-21.76-21.75a6,6,0,0,0-8.48,8.48l32,32a6,6,0,0,0,8.48,0l32-32a6,6,0,0,0-8.48-8.48Z',
        }),
      ),
    ],
    [
      'regular',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM101.66,53.66,120,35.31V96a8,8,0,0,0,16,0V35.31l18.34,18.35a8,8,0,0,0,11.32-11.32l-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32Zm52.68,148.68L136,220.69V160a8,8,0,0,0-16,0v60.69l-18.34-18.35a8,8,0,0,0-11.32,11.32l32,32a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Z',
        }),
      ),
    ],
    [
      'thin',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M220,128a4,4,0,0,1-4,4H40a4,4,0,0,1,0-8H216A4,4,0,0,1,220,128ZM98.83,50.83,124,25.66V96a4,4,0,0,0,8,0V25.66l25.17,25.17a4,4,0,1,0,5.66-5.66l-32-32a4,4,0,0,0-5.66,0l-32,32a4,4,0,0,0,5.66,5.66Zm58.34,154.34L132,230.34V160a4,4,0,0,0-8,0v70.34L98.83,205.17a4,4,0,0,0-5.66,5.66l32,32a4,4,0,0,0,5.66,0l32-32a4,4,0,0,0-5.66-5.66Z',
        }),
      ),
    ],
  ]),
  C2 = new Map([
    [
      'bold',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z',
        }),
      ),
    ],
    [
      'duotone',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', { d: 'M176,128,96,208V48Z', opacity: '0.2' }),
        l.createElement('path', {
          d: 'M181.66,122.34l-80-80A8,8,0,0,0,88,48V208a8,8,0,0,0,13.66,5.66l80-80A8,8,0,0,0,181.66,122.34ZM104,188.69V67.31L164.69,128Z',
        }),
      ),
    ],
    [
      'fill',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M181.66,133.66l-80,80A8,8,0,0,1,88,208V48a8,8,0,0,1,13.66-5.66l80,80A8,8,0,0,1,181.66,133.66Z',
        }),
      ),
    ],
    [
      'light',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M180.24,132.24l-80,80a6,6,0,0,1-8.48-8.48L167.51,128,91.76,52.24a6,6,0,0,1,8.48-8.48l80,80A6,6,0,0,1,180.24,132.24Z',
        }),
      ),
    ],
    [
      'regular',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z',
        }),
      ),
    ],
    [
      'thin',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M178.83,130.83l-80,80a4,4,0,0,1-5.66-5.66L170.34,128,93.17,50.83a4,4,0,0,1,5.66-5.66l80,80A4,4,0,0,1,178.83,130.83Z',
        }),
      ),
    ],
  ]),
  S2 = new Map([
    [
      'bold',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z',
        }),
      ),
    ],
    [
      'duotone',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M232,56V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Z',
          opacity: '0.2',
        }),
        l.createElement('path', {
          d: 'M205.66,85.66l-96,96a8,8,0,0,1-11.32,0l-40-40a8,8,0,0,1,11.32-11.32L104,164.69l90.34-90.35a8,8,0,0,1,11.32,11.32Z',
        }),
      ),
    ],
    [
      'fill',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM205.66,85.66l-96,96a8,8,0,0,1-11.32,0l-40-40a8,8,0,0,1,11.32-11.32L104,164.69l90.34-90.35a8,8,0,0,1,11.32,11.32Z',
        }),
      ),
    ],
    [
      'light',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M228.24,76.24l-128,128a6,6,0,0,1-8.48,0l-56-56a6,6,0,0,1,8.48-8.48L96,191.51,219.76,67.76a6,6,0,0,1,8.48,8.48Z',
        }),
      ),
    ],
    [
      'regular',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z',
        }),
      ),
    ],
    [
      'thin',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M226.83,74.83l-128,128a4,4,0,0,1-5.66,0l-56-56a4,4,0,0,1,5.66-5.66L96,194.34,221.17,69.17a4,4,0,1,1,5.66,5.66Z',
        }),
      ),
    ],
  ]),
  E2 = new Map([
    [
      'bold',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M216,28H88A12,12,0,0,0,76,40V76H40A12,12,0,0,0,28,88V216a12,12,0,0,0,12,12H168a12,12,0,0,0,12-12V180h36a12,12,0,0,0,12-12V40A12,12,0,0,0,216,28ZM156,204H52V100H156Zm48-48H180V88a12,12,0,0,0-12-12H100V52H204Z',
        }),
      ),
    ],
    [
      'duotone',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', { d: 'M216,40V168H168V88H88V40Z', opacity: '0.2' }),
        l.createElement('path', {
          d: 'M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z',
        }),
      ),
    ],
    [
      'fill',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32Zm-8,128H176V88a8,8,0,0,0-8-8H96V48H208Z',
        }),
      ),
    ],
    [
      'light',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M216,34H88a6,6,0,0,0-6,6V82H40a6,6,0,0,0-6,6V216a6,6,0,0,0,6,6H168a6,6,0,0,0,6-6V174h42a6,6,0,0,0,6-6V40A6,6,0,0,0,216,34ZM162,210H46V94H162Zm48-48H174V88a6,6,0,0,0-6-6H94V46H210Z',
        }),
      ),
    ],
    [
      'regular',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z',
        }),
      ),
    ],
    [
      'thin',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M216,36H88a4,4,0,0,0-4,4V84H40a4,4,0,0,0-4,4V216a4,4,0,0,0,4,4H168a4,4,0,0,0,4-4V172h44a4,4,0,0,0,4-4V40A4,4,0,0,0,216,36ZM164,212H44V92H164Zm48-48H172V88a4,4,0,0,0-4-4H92V44H212Z',
        }),
      ),
    ],
  ]),
  R2 = new Map([
    [
      'bold',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M108,60A16,16,0,1,1,92,44,16,16,0,0,1,108,60Zm56,16a16,16,0,1,0-16-16A16,16,0,0,0,164,76ZM92,112a16,16,0,1,0,16,16A16,16,0,0,0,92,112Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,112ZM92,180a16,16,0,1,0,16,16A16,16,0,0,0,92,180Zm72,0a16,16,0,1,0,16,16A16,16,0,0,0,164,180Z',
        }),
      ),
    ],
    [
      'duotone',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M208,32V224a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V32A16,16,0,0,1,64,16H192A16,16,0,0,1,208,32Z',
          opacity: '0.2',
        }),
        l.createElement('path', {
          d: 'M104,60A12,12,0,1,1,92,48,12,12,0,0,1,104,60Zm60,12a12,12,0,1,0-12-12A12,12,0,0,0,164,72ZM92,116a12,12,0,1,0,12,12A12,12,0,0,0,92,116Zm72,0a12,12,0,1,0,12,12A12,12,0,0,0,164,116ZM92,184a12,12,0,1,0,12,12A12,12,0,0,0,92,184Zm72,0a12,12,0,1,0,12,12A12,12,0,0,0,164,184Z',
        }),
      ),
    ],
    [
      'fill',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M192,16H64A16,16,0,0,0,48,32V224a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V32A16,16,0,0,0,192,16ZM100,200a12,12,0,1,1,12-12A12,12,0,0,1,100,200Zm0-60a12,12,0,1,1,12-12A12,12,0,0,1,100,140Zm0-60a12,12,0,1,1,12-12A12,12,0,0,1,100,80Zm56,120a12,12,0,1,1,12-12A12,12,0,0,1,156,200Zm0-60a12,12,0,1,1,12-12A12,12,0,0,1,156,140Zm0-60a12,12,0,1,1,12-12A12,12,0,0,1,156,80Z',
        }),
      ),
    ],
    [
      'light',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M102,60A10,10,0,1,1,92,50,10,10,0,0,1,102,60Zm62,10a10,10,0,1,0-10-10A10,10,0,0,0,164,70ZM92,118a10,10,0,1,0,10,10A10,10,0,0,0,92,118Zm72,0a10,10,0,1,0,10,10A10,10,0,0,0,164,118ZM92,186a10,10,0,1,0,10,10A10,10,0,0,0,92,186Zm72,0a10,10,0,1,0,10,10A10,10,0,0,0,164,186Z',
        }),
      ),
    ],
    [
      'regular',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M104,60A12,12,0,1,1,92,48,12,12,0,0,1,104,60Zm60,12a12,12,0,1,0-12-12A12,12,0,0,0,164,72ZM92,116a12,12,0,1,0,12,12A12,12,0,0,0,92,116Zm72,0a12,12,0,1,0,12,12A12,12,0,0,0,164,116ZM92,184a12,12,0,1,0,12,12A12,12,0,0,0,92,184Zm72,0a12,12,0,1,0,12,12A12,12,0,0,0,164,184Z',
        }),
      ),
    ],
    [
      'thin',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M100,60a8,8,0,1,1-8-8A8,8,0,0,1,100,60Zm64,8a8,8,0,1,0-8-8A8,8,0,0,0,164,68ZM92,120a8,8,0,1,0,8,8A8,8,0,0,0,92,120Zm72,0a8,8,0,1,0,8,8A8,8,0,0,0,164,120ZM92,188a8,8,0,1,0,8,8A8,8,0,0,0,92,188Zm72,0a8,8,0,1,0,8,8A8,8,0,0,0,164,188Z',
        }),
      ),
    ],
  ]),
  k2 = new Map([
    [
      'bold',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z',
        }),
      ),
    ],
    [
      'duotone',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M192,112a80,80,0,1,1-80-80A80,80,0,0,1,192,112Z',
          opacity: '0.2',
        }),
        l.createElement('path', {
          d: 'M229.66,218.34,179.6,168.28a88.21,88.21,0,1,0-11.32,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z',
        }),
      ),
    ],
    [
      'fill',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M168,112a56,56,0,1,1-56-56A56,56,0,0,1,168,112Zm61.66,117.66a8,8,0,0,1-11.32,0l-50.06-50.07a88,88,0,1,1,11.32-11.31l50.06,50.06A8,8,0,0,1,229.66,229.66ZM112,184a72,72,0,1,0-72-72A72.08,72.08,0,0,0,112,184Z',
        }),
      ),
    ],
    [
      'light',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M228.24,219.76l-51.38-51.38a86.15,86.15,0,1,0-8.48,8.48l51.38,51.38a6,6,0,0,0,8.48-8.48ZM38,112a74,74,0,1,1,74,74A74.09,74.09,0,0,1,38,112Z',
        }),
      ),
    ],
    [
      'regular',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z',
        }),
      ),
    ],
    [
      'thin',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M226.83,221.17l-52.7-52.7a84.1,84.1,0,1,0-5.66,5.66l52.7,52.7a4,4,0,0,0,5.66-5.66ZM36,112a76,76,0,1,1,76,76A76.08,76.08,0,0,1,36,112Z',
        }),
      ),
    ],
  ]),
  I2 = new Map([
    [
      'bold',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M140,32V64a12,12,0,0,1-24,0V32a12,12,0,0,1,24,0Zm84,84H192a12,12,0,0,0,0,24h32a12,12,0,0,0,0-24Zm-42.26,48.77a12,12,0,1,0-17,17l22.63,22.63a12,12,0,0,0,17-17ZM128,180a12,12,0,0,0-12,12v32a12,12,0,0,0,24,0V192A12,12,0,0,0,128,180ZM74.26,164.77,51.63,187.4a12,12,0,0,0,17,17l22.63-22.63a12,12,0,1,0-17-17ZM76,128a12,12,0,0,0-12-12H32a12,12,0,0,0,0,24H64A12,12,0,0,0,76,128ZM68.6,51.63a12,12,0,1,0-17,17L74.26,91.23a12,12,0,0,0,17-17Z',
        }),
      ),
    ],
    [
      'duotone',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z',
          opacity: '0.2',
        }),
        l.createElement('path', {
          d: 'M136,32V64a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm88,88H192a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-45.09,47.6a8,8,0,0,0-11.31,11.31l22.62,22.63a8,8,0,0,0,11.32-11.32ZM128,184a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V192A8,8,0,0,0,128,184ZM77.09,167.6,54.46,190.22a8,8,0,0,0,11.32,11.32L88.4,178.91A8,8,0,0,0,77.09,167.6ZM72,128a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H64A8,8,0,0,0,72,128ZM65.78,54.46A8,8,0,0,0,54.46,65.78L77.09,88.4A8,8,0,0,0,88.4,77.09Z',
        }),
      ),
    ],
    [
      'fill',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM48,136a8,8,0,0,1,0-16H72a8,8,0,0,1,0,16Zm46.06,37.25-17,17a8,8,0,0,1-11.32-11.32l17-17a8,8,0,0,1,11.31,11.31Zm0-79.19a8,8,0,0,1-11.31,0l-17-17A8,8,0,0,1,77.09,65.77l17,17A8,8,0,0,1,94.06,94.06ZM136,208a8,8,0,0,1-16,0V184a8,8,0,0,1,16,0Zm0-136a8,8,0,0,1-16,0V48a8,8,0,0,1,16,0Zm54.23,118.23a8,8,0,0,1-11.32,0l-17-17a8,8,0,0,1,11.31-11.31l17,17A8,8,0,0,1,190.23,190.23ZM208,136H184a8,8,0,0,1,0-16h24a8,8,0,0,1,0,16Z',
        }),
      ),
    ],
    [
      'light',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M134,32V64a6,6,0,0,1-12,0V32a6,6,0,0,1,12,0Zm90,90H192a6,6,0,0,0,0,12h32a6,6,0,0,0,0-12Zm-46.5,47A6,6,0,0,0,169,177.5l22.63,22.62a6,6,0,0,0,8.48-8.48ZM128,186a6,6,0,0,0-6,6v32a6,6,0,0,0,12,0V192A6,6,0,0,0,128,186ZM78.5,169,55.88,191.64a6,6,0,1,0,8.48,8.48L87,177.5A6,6,0,1,0,78.5,169ZM70,128a6,6,0,0,0-6-6H32a6,6,0,0,0,0,12H64A6,6,0,0,0,70,128ZM64.36,55.88a6,6,0,0,0-8.48,8.48L78.5,87A6,6,0,1,0,87,78.5Z',
        }),
      ),
    ],
    [
      'regular',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M136,32V64a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm88,88H192a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-45.09,47.6a8,8,0,0,0-11.31,11.31l22.62,22.63a8,8,0,0,0,11.32-11.32ZM128,184a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V192A8,8,0,0,0,128,184ZM77.09,167.6,54.46,190.22a8,8,0,0,0,11.32,11.32L88.4,178.91A8,8,0,0,0,77.09,167.6ZM72,128a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H64A8,8,0,0,0,72,128ZM65.78,54.46A8,8,0,0,0,54.46,65.78L77.09,88.4A8,8,0,0,0,88.4,77.09Z',
        }),
      ),
    ],
    [
      'thin',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M132,32V64a4,4,0,0,1-8,0V32a4,4,0,0,1,8,0Zm92,92H192a4,4,0,0,0,0,8h32a4,4,0,0,0,0-8Zm-47.92,46.43a4,4,0,1,0-5.65,5.65l22.62,22.63a4,4,0,0,0,5.66-5.66ZM128,188a4,4,0,0,0-4,4v32a4,4,0,0,0,8,0V192A4,4,0,0,0,128,188ZM79.92,170.43,57.29,193.05A4,4,0,0,0,63,198.71l22.62-22.63a4,4,0,1,0-5.65-5.65ZM68,128a4,4,0,0,0-4-4H32a4,4,0,0,0,0,8H64A4,4,0,0,0,68,128ZM63,57.29A4,4,0,0,0,57.29,63L79.92,85.57a4,4,0,1,0,5.65-5.65Z',
        }),
      ),
    ],
  ]),
  T2 = new Map([
    [
      'bold',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z',
        }),
      ),
    ],
    [
      'duotone',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M216,56V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Z',
          opacity: '0.2',
        }),
        l.createElement('path', {
          d: 'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z',
        }),
      ),
    ],
    [
      'fill',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM181.66,170.34a8,8,0,0,1-11.32,11.32L128,139.31,85.66,181.66a8,8,0,0,1-11.32-11.32L116.69,128,74.34,85.66A8,8,0,0,1,85.66,74.34L128,116.69l42.34-42.35a8,8,0,0,1,11.32,11.32L139.31,128Z',
        }),
      ),
    ],
    [
      'light',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M204.24,195.76a6,6,0,1,1-8.48,8.48L128,136.49,60.24,204.24a6,6,0,0,1-8.48-8.48L119.51,128,51.76,60.24a6,6,0,0,1,8.48-8.48L128,119.51l67.76-67.75a6,6,0,0,1,8.48,8.48L136.49,128Z',
        }),
      ),
    ],
    [
      'regular',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z',
        }),
      ),
    ],
    [
      'thin',
      l.createElement(
        l.Fragment,
        null,
        l.createElement('path', {
          d: 'M202.83,197.17a4,4,0,0,1-5.66,5.66L128,133.66,58.83,202.83a4,4,0,0,1-5.66-5.66L122.34,128,53.17,58.83a4,4,0,0,1,5.66-5.66L128,122.34l69.17-69.17a4,4,0,1,1,5.66,5.66L133.66,128Z',
        }),
      ),
    ],
  ]),
  P2 = l.createContext({ color: 'currentColor', size: '1em', weight: 'regular', mirrored: !1 }),
  on = l.forwardRef((e, t) => {
    const { alt: n, color: r, size: o, weight: s, mirrored: i, children: a, weights: c, ...u } = e,
      {
        color: f = 'currentColor',
        size: d,
        weight: g = 'regular',
        mirrored: h = !1,
        ...m
      } = l.useContext(P2)
    return l.createElement(
      'svg',
      {
        ref: t,
        xmlns: 'http://www.w3.org/2000/svg',
        width: o ?? d,
        height: o ?? d,
        fill: r ?? f,
        viewBox: '0 0 256 256',
        transform: i || h ? 'scale(-1, 1)' : void 0,
        ...m,
        ...u,
      },
      !!n && l.createElement('title', null, n),
      a,
      c.get(s ?? g),
    )
  })
on.displayName = 'IconBase'
const Um = l.forwardRef((e, t) => l.createElement(on, { ref: t, ...e, weights: x2 }))
Um.displayName = 'ArrowBendUpLeftIcon'
const Zm = l.forwardRef((e, t) => l.createElement(on, { ref: t, ...e, weights: w2 }))
Zm.displayName = 'ArrowsOutLineVerticalIcon'
const Hn = l.forwardRef((e, t) => l.createElement(on, { ref: t, ...e, weights: C2 }))
Hn.displayName = 'CaretRightIcon'
const Km = l.forwardRef((e, t) => l.createElement(on, { ref: t, ...e, weights: S2 }))
Km.displayName = 'CheckIcon'
const Ym = l.forwardRef((e, t) => l.createElement(on, { ref: t, ...e, weights: E2 }))
Ym.displayName = 'CopyIcon'
const qm = l.forwardRef((e, t) => l.createElement(on, { ref: t, ...e, weights: R2 }))
qm.displayName = 'DotsSixVerticalIcon'
const Xm = l.forwardRef((e, t) => l.createElement(on, { ref: t, ...e, weights: k2 }))
Xm.displayName = 'MagnifyingGlassIcon'
const Jm = l.forwardRef((e, t) => l.createElement(on, { ref: t, ...e, weights: I2 }))
Jm.displayName = 'SpinnerGapIcon'
const Sc = l.forwardRef((e, t) => l.createElement(on, { ref: t, ...e, weights: T2 }))
Sc.displayName = 'XIcon'
function O2(e) {
  if (e.sheet) return e.sheet
  for (var t = 0; t < document.styleSheets.length; t++)
    if (document.styleSheets[t].ownerNode === e) return document.styleSheets[t]
}
function M2(e) {
  var t = document.createElement('style')
  return (
    t.setAttribute('data-emotion', e.key),
    e.nonce !== void 0 && t.setAttribute('nonce', e.nonce),
    t.appendChild(document.createTextNode('')),
    t.setAttribute('data-s', ''),
    t
  )
}
var A2 = (function () {
    function e(n) {
      var r = this
      ;((this._insertTag = function (o) {
        var s
        ;(r.tags.length === 0
          ? r.insertionPoint
            ? (s = r.insertionPoint.nextSibling)
            : r.prepend
              ? (s = r.container.firstChild)
              : (s = r.before)
          : (s = r.tags[r.tags.length - 1].nextSibling),
          r.container.insertBefore(o, s),
          r.tags.push(o))
      }),
        (this.isSpeedy = n.speedy === void 0 ? !0 : n.speedy),
        (this.tags = []),
        (this.ctr = 0),
        (this.nonce = n.nonce),
        (this.key = n.key),
        (this.container = n.container),
        (this.prepend = n.prepend),
        (this.insertionPoint = n.insertionPoint),
        (this.before = null))
    }
    var t = e.prototype
    return (
      (t.hydrate = function (r) {
        r.forEach(this._insertTag)
      }),
      (t.insert = function (r) {
        this.ctr % (this.isSpeedy ? 65e3 : 1) === 0 && this._insertTag(M2(this))
        var o = this.tags[this.tags.length - 1]
        if (this.isSpeedy) {
          var s = O2(o)
          try {
            s.insertRule(r, s.cssRules.length)
          } catch {}
        } else o.appendChild(document.createTextNode(r))
        this.ctr++
      }),
      (t.flush = function () {
        ;(this.tags.forEach(function (r) {
          var o
          return (o = r.parentNode) == null ? void 0 : o.removeChild(r)
        }),
          (this.tags = []),
          (this.ctr = 0))
      }),
      e
    )
  })(),
  mt = '-ms-',
  ri = '-moz-',
  ze = '-webkit-',
  Qm = 'comm',
  Ec = 'rule',
  Rc = 'decl',
  z2 = '@import',
  eh = '@keyframes',
  L2 = '@layer',
  j2 = Math.abs,
  Ai = String.fromCharCode,
  D2 = Object.assign
function N2(e, t) {
  return ft(e, 0) ^ 45
    ? (((((((t << 2) ^ ft(e, 0)) << 2) ^ ft(e, 1)) << 2) ^ ft(e, 2)) << 2) ^ ft(e, 3)
    : 0
}
function th(e) {
  return e.trim()
}
function _2(e, t) {
  return (e = t.exec(e)) ? e[0] : e
}
function Le(e, t, n) {
  return e.replace(t, n)
}
function rl(e, t) {
  return e.indexOf(t)
}
function ft(e, t) {
  return e.charCodeAt(t) | 0
}
function Do(e, t, n) {
  return e.slice(t, n)
}
function Xt(e) {
  return e.length
}
function kc(e) {
  return e.length
}
function Ss(e, t) {
  return (t.push(e), e)
}
function F2(e, t) {
  return e.map(t).join('')
}
var zi = 1,
  Jr = 1,
  nh = 0,
  It = 0,
  rt = 0,
  io = ''
function Li(e, t, n, r, o, s, i) {
  return {
    value: e,
    root: t,
    parent: n,
    type: r,
    props: o,
    children: s,
    line: zi,
    column: Jr,
    length: i,
    return: '',
  }
}
function yo(e, t) {
  return D2(Li('', null, null, '', null, null, 0), e, { length: -e.length }, t)
}
function $2() {
  return rt
}
function V2() {
  return ((rt = It > 0 ? ft(io, --It) : 0), Jr--, rt === 10 && ((Jr = 1), zi--), rt)
}
function Ot() {
  return ((rt = It < nh ? ft(io, It++) : 0), Jr++, rt === 10 && ((Jr = 1), zi++), rt)
}
function en() {
  return ft(io, It)
}
function Ls() {
  return It
}
function Jo(e, t) {
  return Do(io, e, t)
}
function No(e) {
  switch (e) {
    case 0:
    case 9:
    case 10:
    case 13:
    case 32:
      return 5
    case 33:
    case 43:
    case 44:
    case 47:
    case 62:
    case 64:
    case 126:
    case 59:
    case 123:
    case 125:
      return 4
    case 58:
      return 3
    case 34:
    case 39:
    case 40:
    case 91:
      return 2
    case 41:
    case 93:
      return 1
  }
  return 0
}
function rh(e) {
  return ((zi = Jr = 1), (nh = Xt((io = e))), (It = 0), [])
}
function oh(e) {
  return ((io = ''), e)
}
function js(e) {
  return th(Jo(It - 1, ol(e === 91 ? e + 2 : e === 40 ? e + 1 : e)))
}
function H2(e) {
  for (; (rt = en()) && rt < 33; ) Ot()
  return No(e) > 2 || No(rt) > 3 ? '' : ' '
}
function B2(e, t) {
  for (; --t && Ot() && !(rt < 48 || rt > 102 || (rt > 57 && rt < 65) || (rt > 70 && rt < 97)); );
  return Jo(e, Ls() + (t < 6 && en() == 32 && Ot() == 32))
}
function ol(e) {
  for (; Ot(); )
    switch (rt) {
      case e:
        return It
      case 34:
      case 39:
        e !== 34 && e !== 39 && ol(rt)
        break
      case 40:
        e === 41 && ol(e)
        break
      case 92:
        Ot()
        break
    }
  return It
}
function W2(e, t) {
  for (; Ot() && e + rt !== 57; ) if (e + rt === 84 && en() === 47) break
  return '/*' + Jo(t, It - 1) + '*' + Ai(e === 47 ? e : Ot())
}
function G2(e) {
  for (; !No(en()); ) Ot()
  return Jo(e, It)
}
function U2(e) {
  return oh(Ds('', null, null, null, [''], (e = rh(e)), 0, [0], e))
}
function Ds(e, t, n, r, o, s, i, a, c) {
  for (
    var u = 0,
      f = 0,
      d = i,
      g = 0,
      h = 0,
      m = 0,
      p = 1,
      b = 1,
      y = 1,
      v = 0,
      C = '',
      w = o,
      x = s,
      S = r,
      k = C;
    b;

  )
    switch (((m = v), (v = Ot()))) {
      case 40:
        if (m != 108 && ft(k, d - 1) == 58) {
          rl((k += Le(js(v), '&', '&\f')), '&\f') != -1 && (y = -1)
          break
        }
      case 34:
      case 39:
      case 91:
        k += js(v)
        break
      case 9:
      case 10:
      case 13:
      case 32:
        k += H2(m)
        break
      case 92:
        k += B2(Ls() - 1, 7)
        continue
      case 47:
        switch (en()) {
          case 42:
          case 47:
            Ss(Z2(W2(Ot(), Ls()), t, n), c)
            break
          default:
            k += '/'
        }
        break
      case 123 * p:
        a[u++] = Xt(k) * y
      case 125 * p:
      case 59:
      case 0:
        switch (v) {
          case 0:
          case 125:
            b = 0
          case 59 + f:
            ;(y == -1 && (k = Le(k, /\f/g, '')),
              h > 0 &&
                Xt(k) - d &&
                Ss(h > 32 ? Td(k + ';', r, n, d - 1) : Td(Le(k, ' ', '') + ';', r, n, d - 2), c))
            break
          case 59:
            k += ';'
          default:
            if ((Ss((S = Id(k, t, n, u, f, o, a, C, (w = []), (x = []), d)), s), v === 123))
              if (f === 0) Ds(k, t, S, S, w, s, d, a, x)
              else
                switch (g === 99 && ft(k, 3) === 110 ? 100 : g) {
                  case 100:
                  case 108:
                  case 109:
                  case 115:
                    Ds(
                      e,
                      S,
                      S,
                      r && Ss(Id(e, S, S, 0, 0, o, a, C, o, (w = []), d), x),
                      o,
                      x,
                      d,
                      a,
                      r ? w : x,
                    )
                    break
                  default:
                    Ds(k, S, S, S, [''], x, 0, a, x)
                }
        }
        ;((u = f = h = 0), (p = y = 1), (C = k = ''), (d = i))
        break
      case 58:
        ;((d = 1 + Xt(k)), (h = m))
      default:
        if (p < 1) {
          if (v == 123) --p
          else if (v == 125 && p++ == 0 && V2() == 125) continue
        }
        switch (((k += Ai(v)), v * p)) {
          case 38:
            y = f > 0 ? 1 : ((k += '\f'), -1)
            break
          case 44:
            ;((a[u++] = (Xt(k) - 1) * y), (y = 1))
            break
          case 64:
            ;(en() === 45 && (k += js(Ot())), (g = en()), (f = d = Xt((C = k += G2(Ls())))), v++)
            break
          case 45:
            m === 45 && Xt(k) == 2 && (p = 0)
        }
    }
  return s
}
function Id(e, t, n, r, o, s, i, a, c, u, f) {
  for (var d = o - 1, g = o === 0 ? s : [''], h = kc(g), m = 0, p = 0, b = 0; m < r; ++m)
    for (var y = 0, v = Do(e, d + 1, (d = j2((p = i[m])))), C = e; y < h; ++y)
      (C = th(p > 0 ? g[y] + ' ' + v : Le(v, /&\f/g, g[y]))) && (c[b++] = C)
  return Li(e, t, n, o === 0 ? Ec : a, c, u, f)
}
function Z2(e, t, n) {
  return Li(e, t, n, Qm, Ai($2()), Do(e, 2, -2), 0)
}
function Td(e, t, n, r) {
  return Li(e, t, n, Rc, Do(e, 0, r), Do(e, r + 1, -1), r)
}
function Ur(e, t) {
  for (var n = '', r = kc(e), o = 0; o < r; o++) n += t(e[o], o, e, t) || ''
  return n
}
function K2(e, t, n, r) {
  switch (e.type) {
    case L2:
      if (e.children.length) break
    case z2:
    case Rc:
      return (e.return = e.return || e.value)
    case Qm:
      return ''
    case eh:
      return (e.return = e.value + '{' + Ur(e.children, r) + '}')
    case Ec:
      e.value = e.props.join(',')
  }
  return Xt((n = Ur(e.children, r))) ? (e.return = e.value + '{' + n + '}') : ''
}
function Y2(e) {
  var t = kc(e)
  return function (n, r, o, s) {
    for (var i = '', a = 0; a < t; a++) i += e[a](n, r, o, s) || ''
    return i
  }
}
function q2(e) {
  return function (t) {
    t.root || ((t = t.return) && e(t))
  }
}
function X2(e) {
  var t = Object.create(null)
  return function (n) {
    return (t[n] === void 0 && (t[n] = e(n)), t[n])
  }
}
var J2 = function (t, n, r) {
    for (var o = 0, s = 0; (o = s), (s = en()), o === 38 && s === 12 && (n[r] = 1), !No(s); ) Ot()
    return Jo(t, It)
  },
  Q2 = function (t, n) {
    var r = -1,
      o = 44
    do
      switch (No(o)) {
        case 0:
          ;(o === 38 && en() === 12 && (n[r] = 1), (t[r] += J2(It - 1, n, r)))
          break
        case 2:
          t[r] += js(o)
          break
        case 4:
          if (o === 44) {
            ;((t[++r] = en() === 58 ? '&\f' : ''), (n[r] = t[r].length))
            break
          }
        default:
          t[r] += Ai(o)
      }
    while ((o = Ot()))
    return t
  },
  ek = function (t, n) {
    return oh(Q2(rh(t), n))
  },
  Pd = new WeakMap(),
  tk = function (t) {
    if (!(t.type !== 'rule' || !t.parent || t.length < 1)) {
      for (
        var n = t.value, r = t.parent, o = t.column === r.column && t.line === r.line;
        r.type !== 'rule';

      )
        if (((r = r.parent), !r)) return
      if (!(t.props.length === 1 && n.charCodeAt(0) !== 58 && !Pd.get(r)) && !o) {
        Pd.set(t, !0)
        for (var s = [], i = ek(n, s), a = r.props, c = 0, u = 0; c < i.length; c++)
          for (var f = 0; f < a.length; f++, u++)
            t.props[u] = s[c] ? i[c].replace(/&\f/g, a[f]) : a[f] + ' ' + i[c]
      }
    }
  },
  nk = function (t) {
    if (t.type === 'decl') {
      var n = t.value
      n.charCodeAt(0) === 108 && n.charCodeAt(2) === 98 && ((t.return = ''), (t.value = ''))
    }
  }
function sh(e, t) {
  switch (N2(e, t)) {
    case 5103:
      return ze + 'print-' + e + e
    case 5737:
    case 4201:
    case 3177:
    case 3433:
    case 1641:
    case 4457:
    case 2921:
    case 5572:
    case 6356:
    case 5844:
    case 3191:
    case 6645:
    case 3005:
    case 6391:
    case 5879:
    case 5623:
    case 6135:
    case 4599:
    case 4855:
    case 4215:
    case 6389:
    case 5109:
    case 5365:
    case 5621:
    case 3829:
      return ze + e + e
    case 5349:
    case 4246:
    case 4810:
    case 6968:
    case 2756:
      return ze + e + ri + e + mt + e + e
    case 6828:
    case 4268:
      return ze + e + mt + e + e
    case 6165:
      return ze + e + mt + 'flex-' + e + e
    case 5187:
      return ze + e + Le(e, /(\w+).+(:[^]+)/, ze + 'box-$1$2' + mt + 'flex-$1$2') + e
    case 5443:
      return ze + e + mt + 'flex-item-' + Le(e, /flex-|-self/, '') + e
    case 4675:
      return ze + e + mt + 'flex-line-pack' + Le(e, /align-content|flex-|-self/, '') + e
    case 5548:
      return ze + e + mt + Le(e, 'shrink', 'negative') + e
    case 5292:
      return ze + e + mt + Le(e, 'basis', 'preferred-size') + e
    case 6060:
      return ze + 'box-' + Le(e, '-grow', '') + ze + e + mt + Le(e, 'grow', 'positive') + e
    case 4554:
      return ze + Le(e, /([^-])(transform)/g, '$1' + ze + '$2') + e
    case 6187:
      return Le(Le(Le(e, /(zoom-|grab)/, ze + '$1'), /(image-set)/, ze + '$1'), e, '') + e
    case 5495:
    case 3959:
      return Le(e, /(image-set\([^]*)/, ze + '$1$`$1')
    case 4968:
      return (
        Le(
          Le(e, /(.+:)(flex-)?(.*)/, ze + 'box-pack:$3' + mt + 'flex-pack:$3'),
          /s.+-b[^;]+/,
          'justify',
        ) +
        ze +
        e +
        e
      )
    case 4095:
    case 3583:
    case 4068:
    case 2532:
      return Le(e, /(.+)-inline(.+)/, ze + '$1$2') + e
    case 8116:
    case 7059:
    case 5753:
    case 5535:
    case 5445:
    case 5701:
    case 4933:
    case 4677:
    case 5533:
    case 5789:
    case 5021:
    case 4765:
      if (Xt(e) - 1 - t > 6)
        switch (ft(e, t + 1)) {
          case 109:
            if (ft(e, t + 4) !== 45) break
          case 102:
            return (
              Le(
                e,
                /(.+:)(.+)-([^]+)/,
                '$1' + ze + '$2-$3$1' + ri + (ft(e, t + 3) == 108 ? '$3' : '$2-$3'),
              ) + e
            )
          case 115:
            return ~rl(e, 'stretch') ? sh(Le(e, 'stretch', 'fill-available'), t) + e : e
        }
      break
    case 4949:
      if (ft(e, t + 1) !== 115) break
    case 6444:
      switch (ft(e, Xt(e) - 3 - (~rl(e, '!important') && 10))) {
        case 107:
          return Le(e, ':', ':' + ze) + e
        case 101:
          return (
            Le(
              e,
              /(.+:)([^;!]+)(;|!.+)?/,
              '$1' +
                ze +
                (ft(e, 14) === 45 ? 'inline-' : '') +
                'box$3$1' +
                ze +
                '$2$3$1' +
                mt +
                '$2box$3',
            ) + e
          )
      }
      break
    case 5936:
      switch (ft(e, t + 11)) {
        case 114:
          return ze + e + mt + Le(e, /[svh]\w+-[tblr]{2}/, 'tb') + e
        case 108:
          return ze + e + mt + Le(e, /[svh]\w+-[tblr]{2}/, 'tb-rl') + e
        case 45:
          return ze + e + mt + Le(e, /[svh]\w+-[tblr]{2}/, 'lr') + e
      }
      return ze + e + mt + e + e
  }
  return e
}
var rk = function (t, n, r, o) {
    if (t.length > -1 && !t.return)
      switch (t.type) {
        case Rc:
          t.return = sh(t.value, t.length)
          break
        case eh:
          return Ur([yo(t, { value: Le(t.value, '@', '@' + ze) })], o)
        case Ec:
          if (t.length)
            return F2(t.props, function (s) {
              switch (_2(s, /(::plac\w+|:read-\w+)/)) {
                case ':read-only':
                case ':read-write':
                  return Ur([yo(t, { props: [Le(s, /:(read-\w+)/, ':' + ri + '$1')] })], o)
                case '::placeholder':
                  return Ur(
                    [
                      yo(t, { props: [Le(s, /:(plac\w+)/, ':' + ze + 'input-$1')] }),
                      yo(t, { props: [Le(s, /:(plac\w+)/, ':' + ri + '$1')] }),
                      yo(t, { props: [Le(s, /:(plac\w+)/, mt + 'input-$1')] }),
                    ],
                    o,
                  )
              }
              return ''
            })
      }
  },
  ok = [rk],
  sk = function (t) {
    var n = t.key
    if (n === 'css') {
      var r = document.querySelectorAll('style[data-emotion]:not([data-s])')
      Array.prototype.forEach.call(r, function (p) {
        var b = p.getAttribute('data-emotion')
        b.indexOf(' ') !== -1 && (document.head.appendChild(p), p.setAttribute('data-s', ''))
      })
    }
    var o = t.stylisPlugins || ok,
      s = {},
      i,
      a = []
    ;((i = t.container || document.head),
      Array.prototype.forEach.call(
        document.querySelectorAll('style[data-emotion^="' + n + ' "]'),
        function (p) {
          for (var b = p.getAttribute('data-emotion').split(' '), y = 1; y < b.length; y++)
            s[b[y]] = !0
          a.push(p)
        },
      ))
    var c,
      u = [tk, nk]
    {
      var f,
        d = [
          K2,
          q2(function (p) {
            f.insert(p)
          }),
        ],
        g = Y2(u.concat(o, d)),
        h = function (b) {
          return Ur(U2(b), g)
        }
      c = function (b, y, v, C) {
        ;((f = v), h(b ? b + '{' + y.styles + '}' : y.styles), C && (m.inserted[y.name] = !0))
      }
    }
    var m = {
      key: n,
      sheet: new A2({
        key: n,
        container: i,
        nonce: t.nonce,
        speedy: t.speedy,
        prepend: t.prepend,
        insertionPoint: t.insertionPoint,
      }),
      nonce: t.nonce,
      inserted: s,
      registered: {},
      insert: c,
    }
    return (m.sheet.hydrate(a), m)
  }
function sl() {
  return (
    (sl = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t]
            for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r])
          }
          return e
        }),
    sl.apply(null, arguments)
  )
}
var va = { exports: {} },
  De = {}
var Od
function ik() {
  if (Od) return De
  Od = 1
  var e = typeof Symbol == 'function' && Symbol.for,
    t = e ? Symbol.for('react.element') : 60103,
    n = e ? Symbol.for('react.portal') : 60106,
    r = e ? Symbol.for('react.fragment') : 60107,
    o = e ? Symbol.for('react.strict_mode') : 60108,
    s = e ? Symbol.for('react.profiler') : 60114,
    i = e ? Symbol.for('react.provider') : 60109,
    a = e ? Symbol.for('react.context') : 60110,
    c = e ? Symbol.for('react.async_mode') : 60111,
    u = e ? Symbol.for('react.concurrent_mode') : 60111,
    f = e ? Symbol.for('react.forward_ref') : 60112,
    d = e ? Symbol.for('react.suspense') : 60113,
    g = e ? Symbol.for('react.suspense_list') : 60120,
    h = e ? Symbol.for('react.memo') : 60115,
    m = e ? Symbol.for('react.lazy') : 60116,
    p = e ? Symbol.for('react.block') : 60121,
    b = e ? Symbol.for('react.fundamental') : 60117,
    y = e ? Symbol.for('react.responder') : 60118,
    v = e ? Symbol.for('react.scope') : 60119
  function C(x) {
    if (typeof x == 'object' && x !== null) {
      var S = x.$$typeof
      switch (S) {
        case t:
          switch (((x = x.type), x)) {
            case c:
            case u:
            case r:
            case s:
            case o:
            case d:
              return x
            default:
              switch (((x = x && x.$$typeof), x)) {
                case a:
                case f:
                case m:
                case h:
                case i:
                  return x
                default:
                  return S
              }
          }
        case n:
          return S
      }
    }
  }
  function w(x) {
    return C(x) === u
  }
  return (
    (De.AsyncMode = c),
    (De.ConcurrentMode = u),
    (De.ContextConsumer = a),
    (De.ContextProvider = i),
    (De.Element = t),
    (De.ForwardRef = f),
    (De.Fragment = r),
    (De.Lazy = m),
    (De.Memo = h),
    (De.Portal = n),
    (De.Profiler = s),
    (De.StrictMode = o),
    (De.Suspense = d),
    (De.isAsyncMode = function (x) {
      return w(x) || C(x) === c
    }),
    (De.isConcurrentMode = w),
    (De.isContextConsumer = function (x) {
      return C(x) === a
    }),
    (De.isContextProvider = function (x) {
      return C(x) === i
    }),
    (De.isElement = function (x) {
      return typeof x == 'object' && x !== null && x.$$typeof === t
    }),
    (De.isForwardRef = function (x) {
      return C(x) === f
    }),
    (De.isFragment = function (x) {
      return C(x) === r
    }),
    (De.isLazy = function (x) {
      return C(x) === m
    }),
    (De.isMemo = function (x) {
      return C(x) === h
    }),
    (De.isPortal = function (x) {
      return C(x) === n
    }),
    (De.isProfiler = function (x) {
      return C(x) === s
    }),
    (De.isStrictMode = function (x) {
      return C(x) === o
    }),
    (De.isSuspense = function (x) {
      return C(x) === d
    }),
    (De.isValidElementType = function (x) {
      return (
        typeof x == 'string' ||
        typeof x == 'function' ||
        x === r ||
        x === u ||
        x === s ||
        x === o ||
        x === d ||
        x === g ||
        (typeof x == 'object' &&
          x !== null &&
          (x.$$typeof === m ||
            x.$$typeof === h ||
            x.$$typeof === i ||
            x.$$typeof === a ||
            x.$$typeof === f ||
            x.$$typeof === b ||
            x.$$typeof === y ||
            x.$$typeof === v ||
            x.$$typeof === p))
      )
    }),
    (De.typeOf = C),
    De
  )
}
var Md
function ak() {
  return (Md || ((Md = 1), (va.exports = ik())), va.exports)
}
var ya, Ad
function lk() {
  if (Ad) return ya
  Ad = 1
  var e = ak(),
    t = {
      childContextTypes: !0,
      contextType: !0,
      contextTypes: !0,
      defaultProps: !0,
      displayName: !0,
      getDefaultProps: !0,
      getDerivedStateFromError: !0,
      getDerivedStateFromProps: !0,
      mixins: !0,
      propTypes: !0,
      type: !0,
    },
    n = { name: !0, length: !0, prototype: !0, caller: !0, callee: !0, arguments: !0, arity: !0 },
    r = { $$typeof: !0, render: !0, defaultProps: !0, displayName: !0, propTypes: !0 },
    o = { $$typeof: !0, compare: !0, defaultProps: !0, displayName: !0, propTypes: !0, type: !0 },
    s = {}
  ;((s[e.ForwardRef] = r), (s[e.Memo] = o))
  function i(m) {
    return e.isMemo(m) ? o : s[m.$$typeof] || t
  }
  var a = Object.defineProperty,
    c = Object.getOwnPropertyNames,
    u = Object.getOwnPropertySymbols,
    f = Object.getOwnPropertyDescriptor,
    d = Object.getPrototypeOf,
    g = Object.prototype
  function h(m, p, b) {
    if (typeof p != 'string') {
      if (g) {
        var y = d(p)
        y && y !== g && h(m, y, b)
      }
      var v = c(p)
      u && (v = v.concat(u(p)))
      for (var C = i(m), w = i(p), x = 0; x < v.length; ++x) {
        var S = v[x]
        if (!n[S] && !(b && b[S]) && !(w && w[S]) && !(C && C[S])) {
          var k = f(p, S)
          try {
            a(m, S, k)
          } catch {}
        }
      }
    }
    return m
  }
  return ((ya = h), ya)
}
lk()
var ck = !0
function uk(e, t, n) {
  var r = ''
  return (
    n.split(' ').forEach(function (o) {
      e[o] !== void 0 ? t.push(e[o] + ';') : o && (r += o + ' ')
    }),
    r
  )
}
var ih = function (t, n, r) {
    var o = t.key + '-' + n.name
    ;(r === !1 || ck === !1) && t.registered[o] === void 0 && (t.registered[o] = n.styles)
  },
  dk = function (t, n, r) {
    ih(t, n, r)
    var o = t.key + '-' + n.name
    if (t.inserted[n.name] === void 0) {
      var s = n
      do (t.insert(n === s ? '.' + o : '', s, t.sheet, !0), (s = s.next))
      while (s !== void 0)
    }
  }
function fk(e) {
  for (var t = 0, n, r = 0, o = e.length; o >= 4; ++r, o -= 4)
    ((n =
      (e.charCodeAt(r) & 255) |
      ((e.charCodeAt(++r) & 255) << 8) |
      ((e.charCodeAt(++r) & 255) << 16) |
      ((e.charCodeAt(++r) & 255) << 24)),
      (n = (n & 65535) * 1540483477 + (((n >>> 16) * 59797) << 16)),
      (n ^= n >>> 24),
      (t =
        ((n & 65535) * 1540483477 + (((n >>> 16) * 59797) << 16)) ^
        ((t & 65535) * 1540483477 + (((t >>> 16) * 59797) << 16))))
  switch (o) {
    case 3:
      t ^= (e.charCodeAt(r + 2) & 255) << 16
    case 2:
      t ^= (e.charCodeAt(r + 1) & 255) << 8
    case 1:
      ;((t ^= e.charCodeAt(r) & 255), (t = (t & 65535) * 1540483477 + (((t >>> 16) * 59797) << 16)))
  }
  return (
    (t ^= t >>> 13),
    (t = (t & 65535) * 1540483477 + (((t >>> 16) * 59797) << 16)),
    ((t ^ (t >>> 15)) >>> 0).toString(36)
  )
}
var pk = {
    animationIterationCount: 1,
    aspectRatio: 1,
    borderImageOutset: 1,
    borderImageSlice: 1,
    borderImageWidth: 1,
    boxFlex: 1,
    boxFlexGroup: 1,
    boxOrdinalGroup: 1,
    columnCount: 1,
    columns: 1,
    flex: 1,
    flexGrow: 1,
    flexPositive: 1,
    flexShrink: 1,
    flexNegative: 1,
    flexOrder: 1,
    gridRow: 1,
    gridRowEnd: 1,
    gridRowSpan: 1,
    gridRowStart: 1,
    gridColumn: 1,
    gridColumnEnd: 1,
    gridColumnSpan: 1,
    gridColumnStart: 1,
    msGridRow: 1,
    msGridRowSpan: 1,
    msGridColumn: 1,
    msGridColumnSpan: 1,
    fontWeight: 1,
    lineHeight: 1,
    opacity: 1,
    order: 1,
    orphans: 1,
    scale: 1,
    tabSize: 1,
    widows: 1,
    zIndex: 1,
    zoom: 1,
    WebkitLineClamp: 1,
    fillOpacity: 1,
    floodOpacity: 1,
    stopOpacity: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
    strokeMiterlimit: 1,
    strokeOpacity: 1,
    strokeWidth: 1,
  },
  gk = /[A-Z]|^ms/g,
  mk = /_EMO_([^_]+?)_([^]*?)_EMO_/g,
  ah = function (t) {
    return t.charCodeAt(1) === 45
  },
  zd = function (t) {
    return t != null && typeof t != 'boolean'
  },
  xa = X2(function (e) {
    return ah(e) ? e : e.replace(gk, '-$&').toLowerCase()
  }),
  Ld = function (t, n) {
    switch (t) {
      case 'animation':
      case 'animationName':
        if (typeof n == 'string')
          return n.replace(mk, function (r, o, s) {
            return ((Jt = { name: o, styles: s, next: Jt }), o)
          })
    }
    return pk[t] !== 1 && !ah(t) && typeof n == 'number' && n !== 0 ? n + 'px' : n
  }
function _o(e, t, n) {
  if (n == null) return ''
  var r = n
  if (r.__emotion_styles !== void 0) return r
  switch (typeof n) {
    case 'boolean':
      return ''
    case 'object': {
      var o = n
      if (o.anim === 1) return ((Jt = { name: o.name, styles: o.styles, next: Jt }), o.name)
      var s = n
      if (s.styles !== void 0) {
        var i = s.next
        if (i !== void 0)
          for (; i !== void 0; ) ((Jt = { name: i.name, styles: i.styles, next: Jt }), (i = i.next))
        var a = s.styles + ';'
        return a
      }
      return hk(e, t, n)
    }
    case 'function': {
      if (e !== void 0) {
        var c = Jt,
          u = n(e)
        return ((Jt = c), _o(e, t, u))
      }
      break
    }
  }
  var f = n
  return f
}
function hk(e, t, n) {
  var r = ''
  if (Array.isArray(n)) for (var o = 0; o < n.length; o++) r += _o(e, t, n[o]) + ';'
  else
    for (var s in n) {
      var i = n[s]
      if (typeof i != 'object') {
        var a = i
        zd(a) && (r += xa(s) + ':' + Ld(s, a) + ';')
      } else if (Array.isArray(i) && typeof i[0] == 'string' && t == null)
        for (var c = 0; c < i.length; c++) zd(i[c]) && (r += xa(s) + ':' + Ld(s, i[c]) + ';')
      else {
        var u = _o(e, t, i)
        switch (s) {
          case 'animation':
          case 'animationName': {
            r += xa(s) + ':' + u + ';'
            break
          }
          default:
            r += s + '{' + u + '}'
        }
      }
    }
  return r
}
var jd = /label:\s*([^\s;{]+)\s*(;|$)/g,
  Jt
function lh(e, t, n) {
  if (e.length === 1 && typeof e[0] == 'object' && e[0] !== null && e[0].styles !== void 0)
    return e[0]
  var r = !0,
    o = ''
  Jt = void 0
  var s = e[0]
  if (s == null || s.raw === void 0) ((r = !1), (o += _o(n, t, s)))
  else {
    var i = s
    o += i[0]
  }
  for (var a = 1; a < e.length; a++)
    if (((o += _o(n, t, e[a])), r)) {
      var c = s
      o += c[a]
    }
  jd.lastIndex = 0
  for (var u = '', f; (f = jd.exec(o)) !== null; ) u += '-' + f[1]
  var d = fk(o) + u
  return { name: d, styles: o, next: Jt }
}
var bk = function (t) {
    return t()
  },
  vk = Fs.useInsertionEffect ? Fs.useInsertionEffect : !1,
  yk = vk || bk,
  ch = l.createContext(typeof HTMLElement < 'u' ? sk({ key: 'css' }) : null)
ch.Provider
var xk = function (t) {
    return l.forwardRef(function (n, r) {
      var o = l.useContext(ch)
      return t(n, o, r)
    })
  },
  wk = l.createContext({}),
  Ic = {}.hasOwnProperty,
  il = '__EMOTION_TYPE_PLEASE_DO_NOT_USE__',
  Ck = function (t, n) {
    var r = {}
    for (var o in n) Ic.call(n, o) && (r[o] = n[o])
    return ((r[il] = t), r)
  },
  Sk = function (t) {
    var n = t.cache,
      r = t.serialized,
      o = t.isStringTag
    return (
      ih(n, r, o),
      yk(function () {
        return dk(n, r, o)
      }),
      null
    )
  },
  Ek = xk(function (e, t, n) {
    var r = e.css
    typeof r == 'string' && t.registered[r] !== void 0 && (r = t.registered[r])
    var o = e[il],
      s = [r],
      i = ''
    typeof e.className == 'string'
      ? (i = uk(t.registered, s, e.className))
      : e.className != null && (i = e.className + ' ')
    var a = lh(s, void 0, l.useContext(wk))
    i += t.key + '-' + a.name
    var c = {}
    for (var u in e) Ic.call(e, u) && u !== 'css' && u !== il && (c[u] = e[u])
    return (
      (c.className = i),
      n && (c.ref = n),
      l.createElement(
        l.Fragment,
        null,
        l.createElement(Sk, { cache: t, serialized: a, isStringTag: typeof o == 'string' }),
        l.createElement(o, c),
      )
    )
  }),
  Rk = Ek,
  ce = function (t, n) {
    var r = arguments
    if (n == null || !Ic.call(n, 'css')) return l.createElement.apply(void 0, r)
    var o = r.length,
      s = new Array(o)
    ;((s[0] = Rk), (s[1] = Ck(t, n)))
    for (var i = 2; i < o; i++) s[i] = r[i]
    return l.createElement.apply(null, s)
  }
;(function (e) {
  var t
  t || (t = e.JSX || (e.JSX = {}))
})(ce || (ce = {}))
function At() {
  for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n]
  return lh(t)
}
function al() {
  return (
    (uh = al =
      Object.assign ||
      function (e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = arguments[t]
          for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
        }
        return e
      }),
    al.apply(this, arguments)
  )
}
var uh = al,
  vt = uh,
  kk = function (e, t) {
    if (e == null) return {}
    var n,
      r,
      o = {},
      s = Object.keys(e)
    for (r = 0; r < s.length; r++) ((n = s[r]), t.indexOf(n) >= 0 || (o[n] = e[n]))
    return o
  },
  $t = function (e, t) {
    if (e == null) return {}
    var n,
      r,
      o = kk(e, t)
    if (Object.getOwnPropertySymbols) {
      var s = Object.getOwnPropertySymbols(e)
      for (r = 0; r < s.length; r++)
        ((n = s[r]),
          t.indexOf(n) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, n) && (o[n] = e[n])))
    }
    return o
  },
  Ir = l.createContext(null),
  Qr = function (e) {
    var t = e.current.querySelector('.tr-header')
    return Array.from(t?.querySelectorAll('.th') || [])
  },
  dh = function (e, t, n, r) {
    return Array.from(e.current.querySelectorAll(n)).forEach(function (o) {
      var s = Array.from(o.querySelectorAll(r)),
        i = s.length
      s.forEach(function (a, c) {
        return t(a, c, i)
      })
    })
  },
  Ik = function (e, t) {
    return dh(e, t, '.tr-header', '.th')
  },
  Tk = function (e, t) {
    return dh(e, t, '.tr-body', '.td')
  },
  eo = function (e, t) {
    return {
      index: t,
      minWidth: +e.getAttribute('data-resize-min-width'),
      width: e.getBoundingClientRect().width,
      isStiff: e.classList.contains('stiff'),
      isHide: e.getAttribute('data-hide') === 'true',
      isColSpan: e.classList.contains('colspan'),
    }
  },
  sn = l.createContext(null),
  Pk = function (e) {
    var t = e.tableElementRef,
      n = e.tableMemoryRef,
      r = e.layout,
      o = e.children,
      s = l.useMemo(
        function () {
          return { layout: r, tableElementRef: t, tableMemoryRef: n }
        },
        [r, t, n],
      )
    return ce(sn.Provider, { value: s }, o)
  },
  fh = function (e, t) {
    var n = Qr(e).map(eo)
    t.current.dataColumns = n
  },
  oi = function (e, t, n) {
    var r = t.current.style.getPropertyValue('--data-table-library_grid-template-columns') !== e
    t.current &&
      e &&
      r &&
      (t.current.style.setProperty('--data-table-library_grid-template-columns', e), fh(t, n))
  },
  ph = function (e, t) {
    t != null && t.onLayoutChange && e && t.onLayoutChange(e)
  },
  gh = `
  `
    .concat(
      function () {},
      `
  padding: 0;
  margin: 0;

  `,
    )
    .concat(
      function () {},
      `
  display: flex;
  align-items: center;

  `,
    )
    .concat(
      function () {},
      `
  align-self: stretch;


  & > div {
    `,
    )
    .concat(
      function () {},
      `
    flex: 1;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &.hide {
    display: none;
  }

  &.pin-left,
  &.pin-right {
    position: sticky;
    z-index: 2;
  }

  `,
    )
    .concat(
      function () {},
      `
  background-color: inherit;
`,
    ),
  Ok = At(gh, ';', ''),
  Dd = l.forwardRef(function (e, t) {
    var n = l.useContext(sn)
    if (!n) throw new Error('No Layout Context.')
    var r = n.layout,
      o = r != null && r.isDiv ? 'div' : 'td'
    return ce(o, vt({ css: Ok, ref: t }, e))
  }),
  Mk = At(
    gh,
    ' z-index:1;text-align:left;position:sticky;top:0;&.pin-left,&.pin-right{z-index:3;}',
    '',
  ),
  Nd = l.forwardRef(function (e, t) {
    var n = l.useContext(sn)
    if (!n) throw new Error('No Layout Context.')
    var r = n.layout,
      o = r != null && r.isDiv ? 'div' : 'th'
    return ce(o, vt({ css: Mk, ref: t }, e))
  }),
  Ak = {
    name: '1k13m5t',
    styles: 'z-index:2;position:absolute;top:0;right:0;bottom:0;width:1px;margin:4px 0',
  },
  _d = function (e) {
    var t = typeof e == 'boolean' || e?.resizerWidth == null ? 10 : e.resizerWidth,
      n = typeof e == 'boolean' || e?.resizerHighlight == null ? 'transparent' : e.resizerHighlight
    return {
      handle: Ak,
      area: At(
        'z-index:1;position:absolute;top:0;right:0;bottom:0;cursor:ew-resize;width:',
        t,
        'px;height:100%;&:hover,&.active{background-color:',
        n,
        ';}',
        '',
      ),
    }
  },
  mh = function (e, t) {
    ;(t == null || t > e.length) && (t = e.length)
    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n]
    return r
  },
  Fd = mh,
  hh = function (e, t) {
    if (e) {
      if (typeof e == 'string') return Fd(e, t)
      var n = Object.prototype.toString.call(e).slice(8, -1)
      return (
        n === 'Object' && e.constructor && (n = e.constructor.name),
        n === 'Map' || n === 'Set'
          ? Array.from(e)
          : n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
            ? Fd(e, t)
            : void 0
      )
    }
  },
  zk = function (e) {
    if (Array.isArray(e)) return e
  },
  Lk = function (e, t) {
    if (typeof Symbol < 'u' && Symbol.iterator in Object(e)) {
      var n = [],
        r = !0,
        o = !1,
        s = void 0
      try {
        for (
          var i, a = e[Symbol.iterator]();
          !(r = (i = a.next()).done) && (n.push(i.value), !t || n.length !== t);
          r = !0
        );
      } catch (c) {
        ;((o = !0), (s = c))
      } finally {
        try {
          r || a.return == null || a.return()
        } finally {
          if (o) throw s
        }
      }
      return n
    }
  },
  jk = hh,
  Dk = function () {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
  },
  Bn = function (e, t) {
    return zk(e) || Lk(e, t) || jk(e, t) || Dk()
  }
function bh(e) {
  var t,
    n,
    r = ''
  if (typeof e == 'string' || typeof e == 'number') r += e
  else if (typeof e == 'object')
    if (Array.isArray(e))
      for (t = 0; t < e.length; t++) e[t] && (n = bh(e[t])) && (r && (r += ' '), (r += n))
    else for (t in e) e[t] && (r && (r += ' '), (r += t))
  return r
}
function Ft() {
  for (var e = 0, t, n, r = ''; e < arguments.length; )
    (t = arguments[e++]) && (n = bh(t)) && (r && (r += ' '), (r += n))
  return r
}
var zt = function (e, t, n) {
    return (
      t in e
        ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 })
        : (e[t] = n),
      e
    )
  },
  Nk = mh,
  _k = function (e) {
    if (Array.isArray(e)) return Nk(e)
  },
  Fk = function (e) {
    if (typeof Symbol < 'u' && Symbol.iterator in Object(e)) return Array.from(e)
  },
  $k = hh,
  Vk = function () {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)
  },
  dn = function (e) {
    return _k(e) || Fk(e) || $k(e) || Vk()
  },
  ll = null,
  Hk = function () {
    return ll || (ll = l.createContext(null))
  },
  vh = function () {
    return l.useContext(ll)
  }
function $d(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function Vd(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? $d(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : $d(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var Bk = function (e, t) {
    var n = l.useContext(sn)
    if (!n) throw new Error('No Layout Context.')
    var r = n.tableElementRef,
      o = n.tableMemoryRef,
      s = n.layout,
      i = l.useRef(null),
      a = l.useRef(null),
      c = l.useRef(''),
      u = l.useRef(null),
      f = l.useRef(!1),
      d = l.useCallback(
        function (m) {
          var p
          ;(m.preventDefault(),
            (c.current = r.current.style.getPropertyValue(
              '--data-table-library_grid-template-columns',
            )),
            (f.current = !0),
            (u.current = i.current.offsetWidth - m.pageX),
            (p = i.current) === null ||
              p === void 0 ||
              p.querySelector('.resizer-area').classList.add('active'))
        },
        [r],
      ),
      g = l.useCallback(
        function (m) {
          if (f.current) {
            m.preventDefault()
            var p = u.current + m.pageX,
              b = (function (y, v, C, w) {
                var x = Qr(C)
                    .map(eo)
                    .filter(function (z) {
                      return !z.isHide
                    }),
                  S = x.findIndex(function (z) {
                    return z.index === y
                  }),
                  k = (x = x.map(function (z, D) {
                    return Vd(Vd({}, z), {}, { index: D })
                  })).reduce(function (z, D, $) {
                    return z || ($ > S && D.width !== 0 ? D : z)
                  }, null),
                  R = x.reduce(function (z, D) {
                    return z + D.width
                  }, 0),
                  M = x[S].minWidth,
                  j = w > M && w !== 0 ? w : M,
                  P = j - x[S].width,
                  I = x.map(function (z, D) {
                    if (k && S === D) return k.width - P > M ? j : z.width
                    if (k?.index === D) {
                      var $ = z.width - P
                      return $ > M ? $ : z.width
                    }
                    return z.width
                  }),
                  T =
                    R -
                    I.reduce(function (z, D) {
                      return z + D
                    }, 0)
                I[S] = I[S] + T
                var O = !1,
                  L = x
                    .slice(0)
                    .reverse()
                    .map(function (z, D) {
                      var $ = I.slice(0).reverse()[D],
                        F = ($ / R) * 100
                      return z.isStiff || (v != null && v.horizontalScroll)
                        ? ''.concat($, 'px')
                        : O
                          ? 'minmax(0, '.concat(F, '%)')
                          : ((O = !0), 'minmax(0, 1fr)')
                    })
                    .slice(0)
                    .reverse()
                    .join(' '),
                  A = function (z, D) {
                    if (dn(Array.from(z.classList)).includes('pin-left')) {
                      var $ = I.reduce(function (Q, q, se) {
                        return se >= D ? Q : Q + q
                      }, 0)
                      z.style.left = ''.concat($, 'px')
                    }
                    if (dn(Array.from(z.classList)).includes('pin-right')) {
                      var F = I.reduceRight(function (Q, q, se) {
                        return se <= D ? Q : Q + q
                      }, 0)
                      z.style.right = ''.concat(F, 'px')
                    }
                  }
                return (Ik(C, A), Tk(C, A), L)
              })(e, s, r, p)
            oi(b, r, o)
          }
        },
        [e, s, r, o],
      ),
      h = l.useCallback(
        function () {
          var m
          f.current = !1
          var p = r.current.style.getPropertyValue('--data-table-library_grid-template-columns')
          if (c.current !== p) {
            ph(p, s)
            var b = Qr(r).map(eo)
            o.current.dataColumns = b
          }
          ;(m = i.current) === null ||
            m === void 0 ||
            m.querySelector('.resizer-area').classList.remove('active')
        },
        [s, r, o],
      )
    return (
      l.useEffect(
        function () {
          var m = a.current
          return (
            m &&
              (m.addEventListener('mousedown', d),
              document.addEventListener('mousemove', g),
              document.addEventListener('mouseup', h)),
            function () {
              m &&
                (m.removeEventListener('mousedown', d),
                document.removeEventListener('mousemove', g),
                document.removeEventListener('mouseup', h))
            }
          )
        },
        [t, d, g, h],
      ),
      { cellRef: i, resizeRef: a }
    )
  },
  Wk = [
    'index',
    'className',
    'hide',
    'pinLeft',
    'pinRight',
    'stiff',
    'isFooter',
    'includePreviousColSpan',
    'previousColSpans',
    'gridColumnStart',
    'gridColumnEnd',
    'resize',
    'role',
    'children',
    'style',
  ]
function Hd(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function Bd(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? Hd(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : Hd(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var Wd = function (e, t) {
    return t.find(function (n) {
      return n.index === e
    })
  },
  Tc = function (e) {
    var t = e.index,
      n = e.className,
      r = e.hide,
      o = e.pinLeft,
      s = e.pinRight,
      i = e.stiff,
      a = e.isFooter,
      c = e.includePreviousColSpan,
      u = e.previousColSpans,
      f = e.gridColumnStart,
      d = e.gridColumnEnd,
      g = e.resize,
      h = e.role,
      m = h === void 0 ? 'columnheader' : h,
      p = e.children,
      b = e.style,
      y = $t(e, Wk),
      v = l.useContext(Ir)
    ;(function (j, P) {
      var I = l.useContext(sn)
      if (!I) throw new Error('No Layout Context.')
      var T = I.layout,
        O = I.tableElementRef,
        L = I.tableMemoryRef
      l.useLayoutEffect(
        function () {
          var A = L.current.dataColumns,
            z = Qr(O).map(eo),
            D = Wd(j, A),
            $ = D?.isHide === !!P
          if (A != null && A.length && !$) {
            var F = z
              .filter(function (q) {
                return !q.isHide
              })
              .map(function (q) {
                if (q.isStiff || (T != null && T.horizontalScroll)) {
                  var se = Wd(q.index, A)
                  return se ? ''.concat(se.width || 2 * se.minWidth, 'px') : 'minmax(0px, 1fr)'
                }
                return 'minmax(0px, 1fr)'
              })
              .join(' ')
            ;(oi(F, O, L), ph(F, T))
            var Q = Qr(O).map(eo)
            L.current.dataColumns = Q
          }
        },
        [j, P, T, O, L],
      )
    })(t, r)
    var C = Bk(t, r),
      w = C.cellRef,
      x = C.resizeRef,
      S = f && d,
      k = S ? d - f - 1 : 0,
      R = c ? f + u : f,
      M = c ? d + u : d
    return ce(
      l.Fragment,
      null,
      ce(
        Nd,
        vt(
          {
            role: m,
            'data-table-library_th': '',
            'data-hide': !!r,
            'data-resize-min-width': typeof g == 'boolean' || g?.minWidth == null ? 75 : g.minWidth,
            style: Bd(Bd({}, S ? { gridColumnStart: R, gridColumnEnd: M } : {}), b),
            css: At(v?.BaseCell, ' ', a ? v?.FooterCell : v?.HeaderCell, ';', ''),
            className: Ft('th', n, { stiff: i, hide: r, resize: g, 'pin-left': o, 'pin-right': s }),
            ref: w,
          },
          y,
        ),
        ce('div', null, p),
        g &&
          !r &&
          ce(
            'div',
            { className: 'resizer-area', ref: x, css: _d(g).area },
            ce('span', { className: 'resizer-handle', css: _d(g).handle }),
          ),
      ),
      Array.from({ length: k }, function (j, P) {
        return ce(Nd, { key: P, className: Ft('th', 'hide', 'colspan') })
      }),
    )
  },
  cl = null,
  Gk = function () {
    return cl || (cl = l.createContext(null))
  },
  yh = function () {
    return l.useContext(cl)
  },
  Pc = function (e) {
    return (
      e.target.tagName === 'svg' ||
      e.target.tagName === 'path' ||
      e.target.tagName === 'DIV' ||
      e.target.tagName === 'SPAN' ||
      e.target.tagName === 'TD'
    )
  },
  Uk = [
    'index',
    'className',
    'hide',
    'pinLeft',
    'pinRight',
    'stiff',
    'includePreviousColSpan',
    'previousColSpans',
    'gridColumnStart',
    'gridColumnEnd',
    'onClick',
    'children',
    'style',
  ]
function Gd(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function Ud(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? Gd(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : Gd(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var ji = function (e) {
    e.index
    var t = e.className,
      n = e.hide,
      r = e.pinLeft,
      o = e.pinRight,
      s = e.stiff,
      i = e.includePreviousColSpan,
      a = e.previousColSpans,
      c = e.gridColumnStart,
      u = e.gridColumnEnd,
      f = e.onClick,
      d = e.children,
      g = e.style,
      h = $t(e, Uk),
      m = l.useContext(Ir),
      p = c && u,
      b = p ? u - c - 1 : 0,
      y = i ? c + a : c,
      v = i ? u + a : u
    return ce(
      l.Fragment,
      null,
      ce(
        Dd,
        vt(
          {
            role: 'gridcell',
            'data-table-library_td': '',
            style: Ud(Ud({}, p ? { gridColumnStart: y, gridColumnEnd: v } : {}), g),
            css: At(m?.BaseCell, ' ', m?.Cell, ';', ''),
            className: Ft('td', t, { stiff: s, hide: n, 'pin-left': r, 'pin-right': o }),
            onClick: f,
          },
          h,
        ),
        ce('div', null, d),
      ),
      Array.from({ length: b }, function () {
        return ce(Dd, { className: Ft('td', 'hide', 'colspan') })
      }),
    )
  },
  ul = null,
  Zk = function () {
    return ul || (ul = l.createContext(null))
  },
  Oc = function () {
    return l.useContext(ul)
  },
  dl = null,
  Kk = function () {
    return dl || (dl = l.createContext(null))
  },
  xh = function () {
    var e = l.useState(!1),
      t = Bn(e, 2),
      n = t[0],
      r = t[1]
    return (
      l.useEffect(
        function () {
          var o = function (i) {
              i.shiftKey ? r(!0) : n && r(!1)
            },
            s = function () {
              n && r(!1)
            }
          return (
            document &&
              (document.addEventListener('keydown', o), document.addEventListener('keyup', s)),
            function () {
              document &&
                (document.removeEventListener('keydown', o),
                document.removeEventListener('keyup', s))
            }
          )
        },
        [n],
      ),
      n
    )
  },
  wh = function () {
    return { select: Oc(), tree: yh(), sort: vh(), pagination: l.useContext(dl) }
  },
  Mc = function (e) {
    var t = e.sort,
      n = e.pagination,
      r = e.tree
    return function (o) {
      var s = dn(o)
      return ((s = t ? t.modifier(s) : s), (s = n ? n.modifier(s) : s), (s = r ? r.modifier(s) : s))
    }
  },
  Yk = function (e) {
    return e.reduce(function (t, n) {
      return (
        Object.keys(n).forEach(function (r) {
          ;(t[r] || (t[r] = ''),
            (t[r] = `
        `
              .concat(
                t[r],
                `
        `,
              )
              .concat(
                n[r],
                `
      `,
              )))
        }),
        t
      )
    }, {})
  },
  qk = function (e) {
    return Array.isArray(e) ? Yk(e) : e
  },
  Xk = ['children'],
  Jk = function (e) {
    var t = e.children,
      n = $t(e, Xk),
      r = l.useContext(Ir),
      o = l.useContext(sn)
    if (!o) throw new Error('No Layout Context.')
    var s = o.layout,
      i = s != null && s.isDiv ? 'div' : 'tbody'
    return ce(
      i,
      vt(
        {
          css: At(r?.Body, ' display:contents;', ''),
          'data-table-library_body': '',
          className: 'tbody',
        },
        n,
      ),
      t,
    )
  },
  Qk = ['isFooter', 'children'],
  si = function (e) {
    var t = e.isFooter,
      n = e.children,
      r = $t(e, Qk),
      o = l.useContext(Ir),
      s = l.useContext(sn)
    if (!s) throw new Error('No Layout Context.')
    var i = s.layout,
      a = i != null && i.isDiv ? 'div' : t ? 'tfoot' : 'thead'
    return ce(
      a,
      vt(
        {
          role: 'rowgroup',
          className: Ft({ tfoot: t, thead: !t }),
          css: At(
            `
  display: contents;
`,
            ' ',
            t ? o?.Footer : o?.Header,
            ';',
            '',
          ),
        },
        r,
      ),
      l.Children.map(n, function (c) {
        if (l.isValidElement(c)) return l.cloneElement(c)
      }),
    )
  },
  Zd = null,
  eI = function () {
    return Zd || (Zd = l.createContext(null))
  },
  tI = [
    'data',
    'theme',
    'layout',
    'sort',
    'pagination',
    'select',
    'tree',
    'onInit',
    'className',
    'children',
  ],
  nI = {
    Table: `
    height: 100%;
  `,
  },
  rI = l.forwardRef(function (e, t) {
    var n = e.data,
      r = e.theme,
      o = e.layout,
      s = e.sort,
      i = e.pagination,
      a = e.select,
      c = e.tree,
      u = e.onInit,
      f = u === void 0 ? function () {} : u,
      d = e.className,
      g = d === void 0 ? 'table' : d,
      h = e.children,
      m = $t(e, tI),
      p = (function (A) {
        var z = l.useRef(null)
        return (A && (z = A), z)
      })(t),
      b = (function (A) {
        var z = l.useRef(null)
        return (z.current || (z.current = { onlyOnce: !1, dataColumns: [] }), z)
      })(),
      y = Mc({ sort: s, pagination: i, tree: c })(n.nodes),
      v = (function (A, z) {
        var D = l.useState(!1),
          $ = Bn(D, 2),
          F = $[0],
          Q = $[1]
        return [
          F,
          function (q) {
            q && (F || (Q(!0), (z.current = q), A(q)))
          },
        ]
      })(f, p),
      C = Bn(v, 2),
      w = C[0],
      x = C[1],
      S = xh(),
      k = []
    ;(o != null && o.fixedHeader && (k = k.concat(nI)), r && (k = k.concat(r)))
    var R,
      M = qk(k),
      j = o != null && o.isDiv ? 'div' : 'table',
      P = eI(),
      I = Hk(),
      T = Zk(),
      O = Gk(),
      L = Kk()
    return ce(
      j,
      vt(
        {
          role: 'grid',
          'data-table-library_table': '',
          css: At(
            ((R = { isShiftDown: S }),
            `
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  overflow: auto;
  position: relative;

  border-collapse: collapse;

  display: grid;

  --data-table-library_grid-template-columns: '';
  grid-template-columns: var(--data-table-library_grid-template-columns);

  button * {
    pointer-events: none;
  }

  `.concat(
              R.isShiftDown
                ? `
    user-select: none; /* standard syntax */
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */
    `
                : '',
              `
  `,
            )),
            ' ',
            M?.Table,
            ';',
            '',
          ),
          className: Ft(g),
          ref: x,
        },
        m,
      ),
      w &&
        ce(
          P.Provider,
          { value: n },
          ce(
            Ir.Provider,
            { value: M },
            ce(
              I.Provider,
              { value: s },
              ce(
                T.Provider,
                { value: a },
                ce(
                  O.Provider,
                  { value: c },
                  ce(
                    L.Provider,
                    { value: i },
                    ce(Pk, { layout: o, tableElementRef: p, tableMemoryRef: b }, h && h(y)),
                  ),
                ),
              ),
            ),
          ),
        ),
    )
  }),
  Ch = function () {
    return `
  display: contents;

  &.disabled td {
    cursor: auto;
  }

  `.concat(
      function () {},
      `
  background-color: #ffffff;
`,
    )
  },
  oI = l.forwardRef(function (e, t) {
    var n = l.useContext(sn)
    if (!n) throw new Error('No Layout Context.')
    var r = n.layout,
      o = r != null && r.isDiv ? 'div' : 'tr'
    return ce(o, vt({ css: At(Ch(), ';', ''), ref: t }, e))
  }),
  sI = l.forwardRef(function (e, t) {
    var n = l.useContext(sn)
    if (!n) throw new Error('No Layout Context.')
    var r = n.layout,
      o = r != null && r.isDiv ? 'div' : 'tr'
    return ce(o, vt({ css: At(Ch(), ';', ''), ref: t }, e))
  }),
  Sh = function (e) {
    return e.type ? e.type === l.Fragment : e === l.Fragment
  },
  Eh = function (e, t) {
    return l.Children.toArray(e).reduce(function (n, r, o) {
      return l.isValidElement(r)
        ? o >= t
          ? n
          : r.props.gridColumnStart || r.props.gridColumnEnd
            ? n + r.props.gridColumnEnd - r.props.gridColumnStart - 1
            : n
        : n
    }, 0)
  },
  iI = ['className', 'role', 'isFooter', 'children']
function Kd(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function Yd(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? Kd(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : Kd(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var aI = function (e) {
    var t,
      n = e.className,
      r = e.role,
      o = r === void 0 ? 'rowheader' : r,
      s = e.isFooter,
      i = e.children,
      a = $t(e, iI),
      c = l.useContext(Ir),
      u = l.useRef(null)
    return (
      (t = l.useContext(sn)),
      l.useLayoutEffect(
        function () {
          var f
          if (!t) throw new Error('No Layout Context.')
          var d = t.layout,
            g = t.tableElementRef,
            h = t.tableMemoryRef,
            m = Qr(g).map(eo)
          if ((f = h.current) === null || f === void 0 || !f.onlyOnce)
            if (((h.current.onlyOnce = !0), d != null && d.resizedLayout)) {
              var p = d?.resizedLayout
              oi(p, g, h)
            } else if (d != null && d.custom) fh(g, h)
            else {
              var b = m
                .filter(function (y) {
                  return !y.isHide
                })
                .map(function () {
                  return 'minmax(0px, 1fr)'
                })
                .join(' ')
              oi(b, g, h)
            }
        },
        [t],
      ),
      ce(
        sI,
        vt(
          {
            role: o,
            'data-table-library_tr-header': '',
            css: At(c?.BaseRow, ' ', s ? c?.FooterRow : c?.HeaderRow, ';', ''),
            className: Ft('tr', n, { 'tr-footer': s, 'tr-header': !s }),
            ref: u,
          },
          a,
        ),
        l.Children.toArray(i)
          .filter(Boolean)
          .map(function (f, d) {
            if (l.isValidElement(f)) {
              var g = {}
              return (
                Sh(f) || (g = Yd(Yd({}, g), {}, { index: d, previousColSpans: Eh(i, d) })),
                l.cloneElement(f, g)
              )
            }
          }),
      )
    )
  },
  lI = function () {},
  cI = function (e, t, n, r, o) {
    ;(function (s) {
      var i = s.onSingleClick,
        a = s.onDoubleClick,
        c = s.ref,
        u = l.useRef(0)
      l.useEffect(function () {
        var f = c.current,
          d = function (g) {
            a &&
              ((u.current += 1),
              setTimeout(function () {
                ;(u.current === 1 ? i(g) : u.current === 2 && a(g), (u.current = 0))
              }, 300))
          }
        return (
          f?.addEventListener('click', d),
          function () {
            f?.removeEventListener('click', d)
          }
        )
      })
    })({
      onSingleClick:
        t && !o
          ? function (s) {
              return t(r, s)
            }
          : lI,
      onDoubleClick:
        n && !o
          ? function (s) {
              return n(r, s)
            }
          : null,
      ref: e,
    })
  },
  uI = ['item', 'className', 'disabled', 'onClick', 'onDoubleClick', 'children']
function qd(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function Es(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? qd(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : qd(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var dI = function (e) {
    var t = e.item,
      n = e.className,
      r = e.disabled,
      o = e.onClick,
      s = e.onDoubleClick,
      i = e.children,
      a = $t(e, uI),
      c = (function (b, y) {
        return Object.values(b)
          .filter(Boolean)
          .filter(function (v) {
            return v?.hasOwnProperty('_getRowProps')
          })
          .map(function (v) {
            return v._getRowProps(y, b)
          })
      })(wh(), e),
      u = l.useContext(Ir),
      f = (function (b, y) {
        var v = b.reduce(
          function (C, w) {
            var x = w.theme,
              S = w.className,
              k = w.onClick,
              R = `
        `
                .concat(
                  C.themeByFeature,
                  `
        `,
                )
                .concat(
                  x,
                  `
      `,
                ),
              M = Ft(C.classNamesByFeature, S),
              j = C.clickable || !!k
            return Es(
              Es({}, C),
              {},
              {
                themeByFeature: R,
                classNamesByFeature: M,
                clickable: j,
                onClickByFeature: function (P, I) {
                  ;(k(P, I), C.onClickByFeature(P, I))
                },
              },
            )
          },
          {
            themeByFeature: '',
            classNamesByFeature: '',
            clickable: !!y,
            onClickByFeature: function (C, w) {
              y && Pc(w) && y(C, w)
            },
          },
        )
        return {
          themeByFeature: v.themeByFeature,
          classNamesByFeature: v.classNamesByFeature,
          clickable: v.clickable,
          onClickByFeature: v.onClickByFeature,
        }
      })(c, o),
      d = f.themeByFeature,
      g = f.classNamesByFeature,
      h = f.clickable,
      m = f.onClickByFeature,
      p = l.useRef(null)
    return (
      cI(p, m, s, t, r),
      ce(
        oI,
        vt(
          {
            role: 'row',
            'data-table-library_tr-body': '',
            onClick:
              r || s
                ? function () {}
                : function (b) {
                    return m(t, b)
                  },
            css: At(d, ' ', u?.BaseRow, ' ', u?.Row, ';', ''),
            className: Ft('tr', 'tr-body', g, n, { disabled: r, clickable: h || !!s }),
            ref: p,
          },
          a,
        ),
        l.Children.toArray(i)
          .filter(Boolean)
          .map(function (b, y) {
            if (l.isValidElement(b)) {
              var v = {}
              return (
                Sh(b) || (v = Es(Es({}, v), {}, { index: y, previousColSpans: Eh(i, y) })),
                l.cloneElement(b, v)
              )
            }
          }),
      )
    )
  },
  Ac = function (e, t, n) {
    l.useEffect(function () {}, [t, e, n])
  },
  Rh = function (e, t, n, r, o) {
    var s = l.useReducer(e, t),
      i = Bn(s, 2),
      a = i[0],
      c = i[1],
      u = l.useRef(null),
      f = l.useRef(null)
    return (
      l.useEffect(
        function () {
          f.current &&
            (r.forEach(function (d) {
              return d(f.current, u.current, void 0)
            }),
            (f.current = null),
            (u.current = null))
        },
        [o, r, a],
      ),
      [
        a,
        function (d) {
          n.forEach(function (h) {
            return h(d, a, void 0)
          })
          var g = e(a, d)
          ;((u.current = g), (f.current = d), c(d))
        },
      ]
    )
  },
  wa = function (e, t) {
    return JSON.stringify(e) === JSON.stringify(t)
  },
  kh = function (e, t, n) {
    var r = l.useRef(e),
      o = l.useRef(e)
    l.useEffect(
      function () {
        ;(wa(t, o.current) && (wa(e, r.current) || wa(e, t) || n()),
          (r.current = e),
          (o.current = t))
      },
      [t, n, e],
    )
  },
  to
;(function (e) {
  ;((e[(e.RowClick = 0)] = 'RowClick'), (e[(e.ButtonClick = 1)] = 'ButtonClick'))
})(to || (to = {}))
var fI = function (e) {
    var t = e.margin
    return At(
      'display:flex;align-items:center;background:none;color:inherit;border:none;padding:0;font:inherit;cursor:pointer;outline:inherit;width:100%;height:100%;&.narrow{width:auto;}&.active{font-weight:bold;}span{display:flex;align-items:center;justify-content:center;}&.prefix{margin-right:',
      t || 0,
      ';}&.suffix{margin-left:',
      t || 0,
      ';}&.no-shrink{flex-shrink:0;}div{text-align:left;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}div:after{display:block;content:attr(title);font-weight:bold;height:0;overflow:hidden;visibility:hidden;}',
    )
  },
  pI = ['margin'],
  Ih = l.forwardRef(function (e, t) {
    var n = e.margin,
      r = $t(e, pI)
    return ce('button', vt({ type: 'button', ref: t }, r, { css: fI({ margin: n }) }))
  }),
  Th = function (e) {
    var t = e.width,
      n = e.height,
      r = e.viewBox,
      o = e.strokeWidth
    return ce(
      'svg',
      {
        id: 'svg-icon-chevron-single-down',
        'data-name': 'svg-icon-chevron-single-down',
        'data-testid': 'svg-icon-chevron-single-down',
        xmlns: 'http://www.w3.org/2000/svg',
        width: t || '36rem',
        height: n || '36rem',
        viewBox: r || '0 0 36 36',
        strokeWidth: o || '0rem',
      },
      ce('polygon', { points: '0 15 0 12 18 21 36 12 36 15 18 24 0 15' }),
    )
  },
  Po = function (e) {
    return !e.nodes
  },
  gI = function (e) {
    var t
    return !(e == null || (t = e.nodes) === null || t === void 0 || !t.length)
  },
  mI = function e(t, n) {
    return t.reduce(function (r, o) {
      return r || (o.id === n ? o : o.nodes ? e(o.nodes, n) : r)
    }, null)
  }
function Xd(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function Ar(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? Xd(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : Xd(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var Ph = function e(t) {
    return (t || []).reduce(function (n, r) {
      return ((n = n.concat(r)), r.nodes && (n = n.concat(e(r.nodes))), n)
    }, [])
  },
  hI = function e(t, n, r) {
    var o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0,
      s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0,
      i = arguments.length > 5 ? arguments[5] : void 0
    return (n || []).reduce(function (a, c) {
      var u, f
      f = c.nodes
        ? Ar(
            Ar({}, c),
            {},
            {
              nodes: c.nodes.map(function (g) {
                return g.id
              }),
            },
          )
        : c
      var d = {
        treeXLevel: o,
        treeYLevel: s,
        parentNode: i || t,
        ancestors: i
          ? [i].concat(dn((u = i?.ancestors) !== null && u !== void 0 ? u : []))
          : [i || t],
      }
      return (
        (f = Ar(Ar({}, f), d)),
        (a = a.concat(f)),
        gI(c) && r.includes(c.id) && (a = a.concat(e(t, c.nodes, r, o + 1, s, Ar(Ar({}, c), d)))),
        a
      )
    }, [])
  },
  Jd = function (e, t) {
    return e.every(function (n) {
      return t.includes(n)
    })
  }
function Qd(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function Xe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? Qd(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : Qd(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var Oh = 'ADD_BY_ID',
  Mh = 'REMOVE_BY_ID',
  Ah = 'ADD_BY_IDS',
  zh = 'REMOVE_BY_IDS',
  Lh = 'ADD_BY_ID_EXCLUSIVELY',
  jh = 'REMOVE_BY_ID_EXCLUSIVELY',
  Dh = 'ADD_ALL',
  Nh = 'REMOVE_ALL',
  bI = function (e, t) {
    switch (t.type) {
      case Oh:
        return (function (n, r) {
          return Xe(Xe({}, n), {}, { id: null, ids: n.ids.concat(r.payload.id) })
        })(e, t)
      case Mh:
        return (function (n, r) {
          return Xe(
            Xe({}, n),
            {},
            {
              id: null,
              ids: n.ids.filter(function (o) {
                return o !== r.payload.id
              }),
            },
          )
        })(e, t)
      case Ah:
        return (function (n, r) {
          var o =
            r.payload.options.isCarryForward && n.id != null
              ? dn(Array.from(new Set(r.payload.ids.concat(n.id))))
              : n.ids.concat(r.payload.ids)
          return Xe(Xe({}, n), {}, { id: null, ids: o })
        })(e, t)
      case zh:
        return (function (n, r) {
          return Xe(
            Xe({}, n),
            {},
            {
              id: null,
              ids: n.ids.filter(function (o) {
                return !r.payload.ids.includes(o)
              }),
            },
          )
        })(e, t)
      case Lh:
        return (function (n, r) {
          return Xe(Xe({}, n), {}, { id: r.payload.id, ids: [] })
        })(e, t)
      case jh:
        return (function (n) {
          return Xe(Xe({}, n), {}, { id: null, ids: [] })
        })(e)
      case Dh:
        return (function (n, r) {
          return Xe(
            Xe({}, n),
            {},
            { id: null, ids: dn(Array.from(new Set([].concat(dn(n.ids), dn(r.payload.ids))))) },
          )
        })(e, t)
      case Nh:
        return (function (n) {
          return Xe(Xe({}, n), {}, { id: null, ids: [] })
        })(e)
      case 'SET':
        return (function (n, r) {
          return Xe(Xe({}, n), r.payload)
        })(e, t)
      default:
        throw new Error()
    }
  },
  vI = { isCarryForward: !0, isPartialToAll: !1 },
  xo = function (e) {
    return Xe(Xe({}, vI), e)
  },
  Ca = function (e, t) {
    var n = mI(t, e)
    return [n].concat(dn(Ph(n?.nodes))).map(function (r) {
      return r.id
    })
  },
  _h = function (e, t, n, r) {
    var o = Rh(bI, t, [], [n], r),
      s = Bn(o, 2),
      i = s[0],
      a = s[1],
      c = l.useRef({ lastToggledId: null, currentShiftIds: [] }),
      u = !i.ids.length,
      f =
        !!e.nodes.length &&
        Jd(
          e.nodes.map(function (P) {
            return P.id
          }),
          i.ids,
        ),
      d = l.useCallback(
        function (P) {
          return a({ type: Oh, payload: { id: P } })
        },
        [a],
      ),
      g = l.useCallback(
        function (P) {
          return a({ type: Mh, payload: { id: P } })
        },
        [a],
      ),
      h = l.useCallback(
        function (P) {
          ;(i.ids.includes(P) ? g(P) : d(P),
            (c.current.lastToggledId = P),
            (c.current.currentShiftIds = []))
        },
        [i, d, g],
      ),
      m = l.useCallback(
        function (P, I) {
          var T = xo(I)
          a({ type: Ah, payload: { ids: P, options: T } })
        },
        [a],
      ),
      p = l.useCallback(
        function (P) {
          a({ type: zh, payload: { ids: P } })
        },
        [a],
      ),
      b = l.useCallback(
        function (P, I) {
          var T,
            O,
            L = xo(I),
            A = Ca(P, e.nodes)
          ;(L.isPartialToAll ||
            ((T = A),
            (O = i.ids),
            T.every(function (z) {
              return !O.includes(z)
            })
              ? m(A, L)
              : p(A)),
            L.isPartialToAll && (Jd(A, i.ids) ? p(A) : m(A, L)),
            (c.current.lastToggledId = P),
            (c.current.currentShiftIds = []))
        },
        [e.nodes, i.ids, m, p],
      ),
      y = l.useCallback(
        function (P, I) {
          var T = xo(I),
            O = Ca(P, e.nodes)
          m(O, T)
        },
        [e.nodes, m],
      ),
      v = l.useCallback(
        function (P) {
          var I = Ca(P, e.nodes)
          p(I)
        },
        [e.nodes, p],
      ),
      C = l.useCallback(
        function (P) {
          a({ type: Lh, payload: { id: P } })
        },
        [a],
      ),
      w = l.useCallback(
        function () {
          a({ type: jh })
        },
        [a],
      ),
      x = l.useCallback(
        function (P) {
          ;(P === i.id ? w() : C(P),
            (c.current.lastToggledId = P),
            (c.current.currentShiftIds = []))
        },
        [i, w, C],
      ),
      S = l.useCallback(
        function (P) {
          a({ type: Dh, payload: { ids: P } })
        },
        [a],
      ),
      k = l.useCallback(
        function () {
          a({ type: Nh })
        },
        [a],
      ),
      R = l.useCallback(
        function (P) {
          var I = xo(P),
            T = Ph(e.nodes).map(function (O) {
              return O.id
            })
          ;(I.isPartialToAll || (u ? S(T) : k()), I.isPartialToAll && (f ? k() : S(T)))
        },
        [e.nodes, u, S, k, f],
      ),
      M = l.useCallback(
        function (P, I, T) {
          var O = xo(I)
          c.current.currentShiftIds.length &&
            (p(c.current.currentShiftIds), (c.current.currentShiftIds = []))
          var L = c.current.lastToggledId,
            A = P,
            z = T(e.nodes).map(function (q) {
              return q.id
            }),
            D = z.findIndex(function (q) {
              return q === L
            }),
            $ = z.findIndex(function (q) {
              return q === A
            })
          if (D > $) {
            var F = [$, D]
            ;((D = F[0]), ($ = F[1]))
          }
          var Q = z.slice(D, $ + 1)
          ;(m(Q, O), (c.current.currentShiftIds = Q))
        },
        [e.nodes, m, p],
      )
    kh(t, i, function () {
      return a({ type: 'SET', payload: t })
    })
    var j = l.useMemo(
      function () {
        return {
          onAddById: d,
          onRemoveById: g,
          onToggleById: h,
          onAddByIds: m,
          onRemoveByIds: p,
          onToggleByIdRecursively: b,
          onAddByIdRecursively: y,
          onRemoveByIdRecursively: v,
          onAddByIdExclusively: C,
          onRemoveByIdExclusively: w,
          onToggleByIdExclusively: x,
          onToggleByIdShift: M,
          onAddAll: S,
          onRemoveAll: k,
          onToggleAll: R,
        }
      },
      [S, d, m, k, g, p, C, w, x, R, h, b, M, y, v],
    )
    return [Xe(Xe({}, i), {}, { none: u, all: f }), j]
  },
  yI = ['item', 'treeIcon', 'children']
function ef(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function ii(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? ef(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : ef(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var xI = {
    name: 'v16uam',
    styles:
      'display:flex;align-items:center;&>div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
  },
  Sa = function (e, t, n) {
    return e
      ? typeof e == 'function'
        ? l.cloneElement(e(t), ii({}, n))
        : l.cloneElement(e, ii({}, n))
      : null
  },
  Fh = function (e) {
    var t = e.item,
      n = e.treeIcon,
      r = n === void 0 ? {} : n,
      o = e.children,
      s = $t(e, yI),
      i = yh()
    if (!i)
      throw new Error('No Tree Context. No return value from useTree provided to Table component.')
    var a = i.state,
      c = i.fns,
      u = ii(ii({}, i.options.treeIcon), r),
      f = (function (d, g, h, m, p, b) {
        var y = { height: ''.concat(h), width: ''.concat(h) },
          v = g.ids.includes(d.id)
        return !Po(d) && v ? Sa(b, d, y) : Po(d) || v ? Sa(m, d, y) : Sa(p, d, y)
      })(t, a, u.size, u.iconDefault, u.iconRight, u.iconDown)
    return ce(
      ji,
      s,
      ce(
        'div',
        { css: xI },
        ce(
          Ih,
          {
            className: 'prefix narrow no-shrink',
            margin: f ? u.margin : u.noIconMargin,
            onClick: function () {
              Po(t) || c.onToggleById(t.id)
            },
          },
          f ? ce('div', null, f) : ce('div', null),
        ),
        ce('div', null, o),
      ),
    )
  }
function tf(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function or(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? tf(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : tf(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var wI = function (e, t) {
    var n = e.item,
      r = t.tree
    if (!r) throw new Error("No 'tree' in getRowProps. That's odd")
    var o = r.state.ids.includes(n.id),
      s = n.treeYLevel || r.options.treeYLevel,
      i = n.treeXLevel || r.options.treeXLevel
    return {
      theme: `
    &.row-tree-clickable {
      cursor: pointer;
    }

    .td:nth-of-type(`
        .concat(
          s + 1,
          `) > div {
      padding-left: `,
        )
        .concat(
          i * r.options.indentation,
          `px;
    }
  `,
        ),
      className: Ft('row-tree', {
        'row-tree-clickable': r.options.clickType === to.RowClick,
        'row-tree-expanded': o,
        'row-tree-leaf': Po(n),
      }),
      onClick: function (a, c) {
        Pc(c) && (Po(a) || (r.options.clickType === to.RowClick && r.fns.onToggleById(a.id)))
      },
    }
  },
  CI = { ids: [] },
  $h = {
    margin: '4px',
    size: '14px',
    noIconMargin: '0px',
    iconDefault: null,
    iconRight: ce(function (e) {
      var t = e.width,
        n = e.height,
        r = e.viewBox,
        o = e.strokeWidth
      return ce(
        'svg',
        {
          id: 'svg-icon-chevron-single-right',
          'data-name': 'svg-icon-chevron-single-right',
          'data-testid': 'svg-icon-chevron-single-right',
          xmlns: 'http://www.w3.org/2000/svg',
          width: t || '36rem',
          height: n || '36rem',
          viewBox: r || '0 0 36 36',
          strokeWidth: o || '0rem',
        },
        ce('polygon', { points: '15 36 12 36 21 18 12 0 15 0 24 18 15 36' }),
      )
    }, null),
    iconDown: ce(Th, null),
  },
  SI = {
    isServer: !1,
    treeIcon: $h,
    clickType: to.RowClick,
    indentation: 20,
    treeXLevel: 0,
    treeYLevel: 0,
  },
  EI = function (e, t, n, r) {
    var o,
      s,
      i = or(or({}, CI), (o = t?.state) !== null && o !== void 0 ? o : {}),
      a = t != null && t.onChange ? t.onChange : function () {},
      c = _h(e, i, a, r),
      u = Bn(c, 2),
      f = u[0],
      d = u[1]
    Ac('tree', r, f)
    var g = or(
      or(or({}, SI), n ?? {}),
      {},
      { treeIcon: or(or({}, $h), (s = n?.treeIcon) !== null && s !== void 0 ? s : {}) },
    )
    return {
      state: f,
      fns: d,
      options: g,
      _getRowProps: wI,
      modifier: function (h) {
        return g.isServer ? h : hI(e, h, f.ids, g.treeXLevel, g.treeYLevel, null)
      },
      components: { CellTree: Fh },
    }
  },
  Fo,
  $o
;((function (e) {
  ;((e[(e.Prefix = 0)] = 'Prefix'), (e[(e.Suffix = 1)] = 'Suffix'))
})(Fo || (Fo = {})),
  (function (e) {
    ;((e[(e.Alternate = 0)] = 'Alternate'), (e[(e.AlternateWithReset = 1)] = 'AlternateWithReset'))
  })($o || ($o = {})))
function nf(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function wo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? nf(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : nf(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var RI = function (e) {
    var t = e.sort,
      n = e.sortKey,
      r = e.sortIcon,
      o = r === void 0 ? {} : r,
      s = e.children,
      i = t.state,
      a = t.fns,
      c = wo(wo({}, t.options.sortIcon), o),
      u = c.position === Fo.Prefix,
      f = c.position === Fo.Suffix,
      d = (function (g, h, m, p, b, y) {
        var v = { height: ''.concat(m), width: ''.concat(m) }
        return g.sortKey === h && g.reverse
          ? y
            ? l.cloneElement(y, wo({}, v))
            : null
          : g.sortKey !== h || g.reverse
            ? p
              ? l.cloneElement(p, wo({}, v))
              : null
            : b
              ? l.cloneElement(b, wo({}, v))
              : null
      })(i, n, c.size, c.iconDefault, c.iconUp, c.iconDown)
    return ce(
      Ih,
      {
        className: Ft({ active: i.sortKey === n }),
        onClick: function () {
          return a.onToggleSort({ sortKey: n })
        },
      },
      u && d && ce('span', { style: { marginRight: c.margin } }, d),
      ce('div', { title: typeof s == 'string' ? s : '' }, s),
      f && d && ce('span', { style: { marginLeft: c.margin } }, d),
    )
  },
  kI = ['sortKey', 'sortIcon', 'children'],
  Vh = l.memo(function (e) {
    var t = e.sortKey,
      n = e.sortIcon,
      r = n === void 0 ? {} : n,
      o = e.children,
      s = $t(e, kI),
      i = vh()
    if (!i)
      throw new Error('No Sort Context. No return value from useSort provided to Table component.')
    return ce(Tc, s, ce(RI, { sort: i, sortKey: t, sortIcon: r }, o))
  })
function rf(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function xt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? rf(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : rf(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var Hh = 'TOGGLE_SORT',
  II = function (e, t) {
    switch (t.type) {
      case Hh:
        return (function (n, r) {
          var o = r.payload.value.sortKey === n.sortKey,
            s = n.reverse
          if (o && s && r.payload.options.sortToggleType === $o.AlternateWithReset)
            return { sortKey: 'NONE', reverse: !1 }
          var i = o && !s
          return xt(xt({}, r.payload.value), {}, { reverse: i })
        })(e, t)
      case 'SET':
        return (function (n, r) {
          return xt(xt({}, n), r.payload)
        })(e, t)
      default:
        throw new Error()
    }
  },
  TI = { sortKey: 'NONE', reverse: !1 },
  Bh = {
    position: Fo.Suffix,
    margin: '4px',
    size: '14px',
    iconDefault: ce(function (e) {
      var t = e.width,
        n = e.height,
        r = e.viewBox,
        o = e.strokeWidth
      return ce(
        'svg',
        {
          id: 'svg-icon-chevron-single-up-down',
          'data-name': 'svg-icon-chevron-single-up-down',
          'data-testid': 'svg-icon-chevron-single-up-down',
          xmlns: 'http://www.w3.org/2000/svg',
          width: t || '36rem',
          height: n || '36rem',
          viewBox: r || '0 0 36 36',
          strokeWidth: o || '0rem',
        },
        ce('polygon', { points: '36 12 36 15 18 6 0 15 0 12 18 3 36 12' }),
        ce('polygon', { points: '0 24 0 21 18 30 36 21 36 24 18 33 0 24' }),
      )
    }, null),
    iconUp: ce(function (e) {
      var t = e.width,
        n = e.height,
        r = e.viewBox,
        o = e.strokeWidth
      return ce(
        'svg',
        {
          id: 'svg-icon-chevron-single-up',
          'data-name': 'svg-icon-chevron-single-up',
          'data-testid': 'svg-icon-chevron-single-up',
          xmlns: 'http://www.w3.org/2000/svg',
          width: t || '36rem',
          height: n || '36rem',
          viewBox: r || '0 0 36 36',
          strokeWidth: o || '0rem',
        },
        ce('polygon', { points: '36 21 36 24 18 15 0 24 0 21 18 12 36 21' }),
      )
    }, null),
    iconDown: ce(Th, null),
  },
  PI = { isServer: !1, sortToggleType: $o.Alternate, sortIcon: Bh, isRecursive: !0 },
  OI = function (e, t, n, r) {
    var o,
      s = xt(xt({}, TI), (o = t?.state) !== null && o !== void 0 ? o : {}),
      i = t != null && t.onChange ? t.onChange : function () {},
      a = Rh(II, s, [], [i], r),
      c = Bn(a, 2),
      u = c[0],
      f = c[1],
      d = l.useCallback(
        function (b) {
          return f({ type: Hh, payload: { value: b, options: n } })
        },
        [n, f],
      )
    kh(s, u, function () {
      return f({ type: 'SET', payload: s })
    })
    var g = l.useCallback(
        function (b, y, v) {
          var C =
            y[u.sortKey] ||
            function (w) {
              return w
            }
          return (
            u.reverse
              ? function (w) {
                  return C(w).reverse()
                }
              : C
          )(b).reduce(function (w, x) {
            return v && x.nodes
              ? w.concat(xt(xt({}, x), {}, { nodes: g(x.nodes, y, v) }))
              : w.concat(x)
          }, [])
        },
        [u],
      ),
      h = l.useMemo(
        function () {
          return { onToggleSort: d }
        },
        [d],
      )
    Ac('sort', r, u)
    var m = xt(xt(xt({}, PI), n), {}, { sortIcon: xt(xt({}, Bh), n ? n.sortIcon : {}) }),
      p = xt(xt({}, u), {}, { sortFn: g })
    return {
      state: p,
      fns: h,
      options: m,
      modifier: function (b) {
        return m.isServer ? b : p.sortFn(b, m.sortFns, m.isRecursive)
      },
      components: { HeaderCellSort: Vh },
    }
  },
  Vo,
  jt
;((function (e) {
  ;((e[(e.RowClick = 0)] = 'RowClick'), (e[(e.ButtonClick = 1)] = 'ButtonClick'))
})(Vo || (Vo = {})),
  (function (e) {
    ;((e[(e.SingleSelect = 0)] = 'SingleSelect'), (e[(e.MultiSelect = 1)] = 'MultiSelect'))
  })(jt || (jt = {})))
var MI = '#e0e0e0',
  AI = { name: 'e0dnmk', styles: 'cursor:pointer' },
  zI = l.forwardRef(function (e, t) {
    return ce('input', vt({ type: 'checkbox', ref: t }, e, { css: AI }))
  }),
  Wh = function (e) {
    var t = e.checked,
      n = e.isIndeterminate,
      r = e.onChange
    return ce(zI, {
      ref: function (o) {
        o &&
          (t
            ? ((o.indeterminate = !1), (o.checked = !0))
            : n
              ? ((o.indeterminate = !0), (o.checked = !1))
              : ((o.indeterminate = !1), (o.checked = !1)))
      },
      type: 'checkbox',
      onChange: r,
    })
  },
  LI = ['item'],
  jI = l.memo(function (e) {
    var t = e.item,
      n = $t(e, LI),
      r = Oc(),
      o = wh(),
      s = xh()
    if (!r)
      throw new Error(
        'No Select Context. No return value from useRowSelect provided to Table component.',
      )
    var i =
        (r.options.buttonSelect === jt.SingleSelect && r.state.id === t.id) ||
        r.state.ids.includes(t.id),
      a = l.useCallback(
        function () {
          var c = r.options.buttonSelect === jt.MultiSelect
          s && c
            ? r.fns.onToggleByIdShift(t.id, r.options, Mc(o))
            : c
              ? r.fns.onToggleByIdRecursively(t.id, {
                  isCarryForward: r.options.isCarryForward,
                  isPartialToAll: r.options.isPartialToAll,
                })
              : r.fns.onToggleByIdExclusively(t.id)
        },
        [s, o, t.id, r],
      )
    return ce(ji, vt({ stiff: !0 }, n), ce(Wh, { checked: !!i, onChange: a }))
  }),
  DI = l.memo(function (e) {
    var t = Oc()
    if (!t)
      throw new Error(
        'No Select Context. No return value from useRowSelect provided to Table component.',
      )
    var n = t.state.all,
      r =
        (!t.state.all && !t.state.none) ||
        (t.options.buttonSelect === jt.SingleSelect && t.state.id != null)
    return ce(
      Tc,
      vt({ stiff: !0 }, e),
      ce(Wh, {
        checked: !!n,
        isIndeterminate: r,
        onChange: function () {
          return t.fns.onToggleAll({ isPartialToAll: t.options.isPartialToAll })
        },
      }),
    )
  })
function of(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function Rs(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? of(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : of(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var NI = function (e, t) {
    var n = e.item,
      r = t.select
    if (!r) throw new Error("No 'select' in getRowProps. That's odd")
    var o = r.state.ids.includes(n.id),
      s = r.state.id === n.id
    return {
      theme: `
    &.row-select-selected,
    &.row-select-single-selected {
      font-weight: bold;

      background-color: `.concat(
        MI,
        `;
    }

    &.row-select-clickable {
      cursor: pointer;
    }
  `,
      ),
      className: Ft('row-select', {
        'row-select-clickable': r.options.clickType === Vo.RowClick,
        'row-select-selected': o,
        'row-select-single-selected': s,
      }),
      onClick: function (i, a) {
        if (Pc(a) && r.options.clickType === Vo.RowClick) {
          var c =
              r.options.rowSelect === jt.MultiSelect || r.options.buttonSelect === jt.MultiSelect,
            u = r.options.rowSelect === jt.MultiSelect,
            f = !!a.metaKey,
            d = !!a.shiftKey
          f && c
            ? r.fns.onToggleById(i.id)
            : d && c
              ? r.fns.onToggleByIdShift(i.id, r.options, Mc(t))
              : u
                ? r.fns.onToggleById(i.id)
                : r.fns.onToggleByIdExclusively(i.id)
        }
      },
    }
  },
  _I = { ids: [], id: null },
  FI = {
    clickType: Vo.RowClick,
    rowSelect: jt.SingleSelect,
    buttonSelect: jt.MultiSelect,
    isCarryForward: !0,
    isPartialToAll: !1,
  },
  $I = function (e, t, n, r) {
    var o,
      s = Rs(Rs({}, _I), (o = t?.state) !== null && o !== void 0 ? o : {}),
      i = t != null && t.onChange ? t.onChange : function () {},
      a = _h(e, s, i, r),
      c = Bn(a, 2),
      u = c[0],
      f = c[1]
    return (
      Ac('select', r, u),
      {
        state: u,
        fns: f,
        options: Rs(Rs({}, FI), n ?? {}),
        _getRowProps: NI,
        components: { HeaderCellSelect: DI, CellSelect: jI },
      }
    )
  }
function sf(e) {
  if (e === void 0)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
  return e
}
function fl(e, t) {
  return (
    (fl = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, r) {
          return ((n.__proto__ = r), n)
        }),
    fl(e, t)
  )
}
function VI(e, t) {
  ;((e.prototype = Object.create(t.prototype)), (e.prototype.constructor = e), fl(e, t))
}
var af =
  Number.isNaN ||
  function (t) {
    return typeof t == 'number' && t !== t
  }
function HI(e, t) {
  return !!(e === t || (af(e) && af(t)))
}
function BI(e, t) {
  if (e.length !== t.length) return !1
  for (var n = 0; n < e.length; n++) if (!HI(e[n], t[n])) return !1
  return !0
}
function Ea(e, t) {
  t === void 0 && (t = BI)
  var n,
    r = [],
    o,
    s = !1
  function i() {
    for (var a = [], c = 0; c < arguments.length; c++) a[c] = arguments[c]
    return (
      (s && n === this && t(a, r)) || ((o = e.apply(this, a)), (s = !0), (n = this), (r = a)),
      o
    )
  }
  return i
}
var WI = typeof performance == 'object' && typeof performance.now == 'function',
  lf = WI
    ? function () {
        return performance.now()
      }
    : function () {
        return Date.now()
      }
function cf(e) {
  cancelAnimationFrame(e.id)
}
function GI(e, t) {
  var n = lf()
  function r() {
    lf() - n >= t ? e.call(null) : (o.id = requestAnimationFrame(r))
  }
  var o = { id: requestAnimationFrame(r) }
  return o
}
var Ra = -1
function uf(e) {
  if ((e === void 0 && (e = !1), Ra === -1 || e)) {
    var t = document.createElement('div'),
      n = t.style
    ;((n.width = '50px'),
      (n.height = '50px'),
      (n.overflow = 'scroll'),
      document.body.appendChild(t),
      (Ra = t.offsetWidth - t.clientWidth),
      document.body.removeChild(t))
  }
  return Ra
}
var zr = null
function df(e) {
  if ((e === void 0 && (e = !1), zr === null || e)) {
    var t = document.createElement('div'),
      n = t.style
    ;((n.width = '50px'), (n.height = '50px'), (n.overflow = 'scroll'), (n.direction = 'rtl'))
    var r = document.createElement('div'),
      o = r.style
    return (
      (o.width = '100px'),
      (o.height = '100px'),
      t.appendChild(r),
      document.body.appendChild(t),
      t.scrollLeft > 0
        ? (zr = 'positive-descending')
        : ((t.scrollLeft = 1),
          t.scrollLeft === 0 ? (zr = 'negative') : (zr = 'positive-ascending')),
      document.body.removeChild(t),
      zr
    )
  }
  return zr
}
var UI = 150,
  ZI = function (t, n) {
    return t
  }
function KI(e) {
  var t,
    n = e.getItemOffset,
    r = e.getEstimatedTotalSize,
    o = e.getItemSize,
    s = e.getOffsetForIndexAndAlignment,
    i = e.getStartIndexForOffset,
    a = e.getStopIndexForStartIndex,
    c = e.initInstanceProps,
    u = e.shouldResetStyleCacheOnItemSizeChange,
    f = e.validateProps
  return (
    (t = (function (d) {
      VI(g, d)
      function g(m) {
        var p
        return (
          (p = d.call(this, m) || this),
          (p._instanceProps = c(p.props, sf(p))),
          (p._outerRef = void 0),
          (p._resetIsScrollingTimeoutId = null),
          (p.state = {
            instance: sf(p),
            isScrolling: !1,
            scrollDirection: 'forward',
            scrollOffset:
              typeof p.props.initialScrollOffset == 'number' ? p.props.initialScrollOffset : 0,
            scrollUpdateWasRequested: !1,
          }),
          (p._callOnItemsRendered = void 0),
          (p._callOnItemsRendered = Ea(function (b, y, v, C) {
            return p.props.onItemsRendered({
              overscanStartIndex: b,
              overscanStopIndex: y,
              visibleStartIndex: v,
              visibleStopIndex: C,
            })
          })),
          (p._callOnScroll = void 0),
          (p._callOnScroll = Ea(function (b, y, v) {
            return p.props.onScroll({
              scrollDirection: b,
              scrollOffset: y,
              scrollUpdateWasRequested: v,
            })
          })),
          (p._getItemStyle = void 0),
          (p._getItemStyle = function (b) {
            var y = p.props,
              v = y.direction,
              C = y.itemSize,
              w = y.layout,
              x = p._getItemStyleCache(u && C, u && w, u && v),
              S
            if (x.hasOwnProperty(b)) S = x[b]
            else {
              var k = n(p.props, b, p._instanceProps),
                R = o(p.props, b, p._instanceProps),
                M = v === 'horizontal' || w === 'horizontal',
                j = v === 'rtl',
                P = M ? k : 0
              x[b] = S = {
                position: 'absolute',
                left: j ? void 0 : P,
                right: j ? P : void 0,
                top: M ? 0 : k,
                height: M ? '100%' : R,
                width: M ? R : '100%',
              }
            }
            return S
          }),
          (p._getItemStyleCache = void 0),
          (p._getItemStyleCache = Ea(function (b, y, v) {
            return {}
          })),
          (p._onScrollHorizontal = function (b) {
            var y = b.currentTarget,
              v = y.clientWidth,
              C = y.scrollLeft,
              w = y.scrollWidth
            p.setState(function (x) {
              if (x.scrollOffset === C) return null
              var S = p.props.direction,
                k = C
              if (S === 'rtl')
                switch (df()) {
                  case 'negative':
                    k = -C
                    break
                  case 'positive-descending':
                    k = w - v - C
                    break
                }
              return (
                (k = Math.max(0, Math.min(k, w - v))),
                {
                  isScrolling: !0,
                  scrollDirection: x.scrollOffset < k ? 'forward' : 'backward',
                  scrollOffset: k,
                  scrollUpdateWasRequested: !1,
                }
              )
            }, p._resetIsScrollingDebounced)
          }),
          (p._onScrollVertical = function (b) {
            var y = b.currentTarget,
              v = y.clientHeight,
              C = y.scrollHeight,
              w = y.scrollTop
            p.setState(function (x) {
              if (x.scrollOffset === w) return null
              var S = Math.max(0, Math.min(w, C - v))
              return {
                isScrolling: !0,
                scrollDirection: x.scrollOffset < S ? 'forward' : 'backward',
                scrollOffset: S,
                scrollUpdateWasRequested: !1,
              }
            }, p._resetIsScrollingDebounced)
          }),
          (p._outerRefSetter = function (b) {
            var y = p.props.outerRef
            ;((p._outerRef = b),
              typeof y == 'function'
                ? y(b)
                : y != null &&
                  typeof y == 'object' &&
                  y.hasOwnProperty('current') &&
                  (y.current = b))
          }),
          (p._resetIsScrollingDebounced = function () {
            ;(p._resetIsScrollingTimeoutId !== null && cf(p._resetIsScrollingTimeoutId),
              (p._resetIsScrollingTimeoutId = GI(p._resetIsScrolling, UI)))
          }),
          (p._resetIsScrolling = function () {
            ;((p._resetIsScrollingTimeoutId = null),
              p.setState({ isScrolling: !1 }, function () {
                p._getItemStyleCache(-1, null)
              }))
          }),
          p
        )
      }
      g.getDerivedStateFromProps = function (p, b) {
        return (YI(p, b), f(p), null)
      }
      var h = g.prototype
      return (
        (h.scrollTo = function (p) {
          ;((p = Math.max(0, p)),
            this.setState(function (b) {
              return b.scrollOffset === p
                ? null
                : {
                    scrollDirection: b.scrollOffset < p ? 'forward' : 'backward',
                    scrollOffset: p,
                    scrollUpdateWasRequested: !0,
                  }
            }, this._resetIsScrollingDebounced))
        }),
        (h.scrollToItem = function (p, b) {
          b === void 0 && (b = 'auto')
          var y = this.props,
            v = y.itemCount,
            C = y.layout,
            w = this.state.scrollOffset
          p = Math.max(0, Math.min(p, v - 1))
          var x = 0
          if (this._outerRef) {
            var S = this._outerRef
            C === 'vertical'
              ? (x = S.scrollWidth > S.clientWidth ? uf() : 0)
              : (x = S.scrollHeight > S.clientHeight ? uf() : 0)
          }
          this.scrollTo(s(this.props, p, b, w, this._instanceProps, x))
        }),
        (h.componentDidMount = function () {
          var p = this.props,
            b = p.direction,
            y = p.initialScrollOffset,
            v = p.layout
          if (typeof y == 'number' && this._outerRef != null) {
            var C = this._outerRef
            b === 'horizontal' || v === 'horizontal' ? (C.scrollLeft = y) : (C.scrollTop = y)
          }
          this._callPropsCallbacks()
        }),
        (h.componentDidUpdate = function () {
          var p = this.props,
            b = p.direction,
            y = p.layout,
            v = this.state,
            C = v.scrollOffset,
            w = v.scrollUpdateWasRequested
          if (w && this._outerRef != null) {
            var x = this._outerRef
            if (b === 'horizontal' || y === 'horizontal')
              if (b === 'rtl')
                switch (df()) {
                  case 'negative':
                    x.scrollLeft = -C
                    break
                  case 'positive-ascending':
                    x.scrollLeft = C
                    break
                  default:
                    var S = x.clientWidth,
                      k = x.scrollWidth
                    x.scrollLeft = k - S - C
                    break
                }
              else x.scrollLeft = C
            else x.scrollTop = C
          }
          this._callPropsCallbacks()
        }),
        (h.componentWillUnmount = function () {
          this._resetIsScrollingTimeoutId !== null && cf(this._resetIsScrollingTimeoutId)
        }),
        (h.render = function () {
          var p = this.props,
            b = p.children,
            y = p.className,
            v = p.direction,
            C = p.height,
            w = p.innerRef,
            x = p.innerElementType,
            S = p.innerTagName,
            k = p.itemCount,
            R = p.itemData,
            M = p.itemKey,
            j = M === void 0 ? ZI : M,
            P = p.layout,
            I = p.outerElementType,
            T = p.outerTagName,
            O = p.style,
            L = p.useIsScrolling,
            A = p.width,
            z = this.state.isScrolling,
            D = v === 'horizontal' || P === 'horizontal',
            $ = D ? this._onScrollHorizontal : this._onScrollVertical,
            F = this._getRangeToRender(),
            Q = F[0],
            q = F[1],
            se = []
          if (k > 0)
            for (var Y = Q; Y <= q; Y++)
              se.push(
                l.createElement(b, {
                  data: R,
                  key: j(Y, R),
                  index: Y,
                  isScrolling: L ? z : void 0,
                  style: this._getItemStyle(Y),
                }),
              )
          var oe = r(this.props, this._instanceProps)
          return l.createElement(
            I || T || 'div',
            {
              className: y,
              onScroll: $,
              ref: this._outerRefSetter,
              style: sl(
                {
                  position: 'relative',
                  height: C,
                  width: A,
                  overflow: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  willChange: 'transform',
                  direction: v,
                },
                O,
              ),
            },
            l.createElement(x || S || 'div', {
              children: se,
              ref: w,
              style: {
                height: D ? '100%' : oe,
                pointerEvents: z ? 'none' : void 0,
                width: D ? oe : '100%',
              },
            }),
          )
        }),
        (h._callPropsCallbacks = function () {
          if (typeof this.props.onItemsRendered == 'function') {
            var p = this.props.itemCount
            if (p > 0) {
              var b = this._getRangeToRender(),
                y = b[0],
                v = b[1],
                C = b[2],
                w = b[3]
              this._callOnItemsRendered(y, v, C, w)
            }
          }
          if (typeof this.props.onScroll == 'function') {
            var x = this.state,
              S = x.scrollDirection,
              k = x.scrollOffset,
              R = x.scrollUpdateWasRequested
            this._callOnScroll(S, k, R)
          }
        }),
        (h._getRangeToRender = function () {
          var p = this.props,
            b = p.itemCount,
            y = p.overscanCount,
            v = this.state,
            C = v.isScrolling,
            w = v.scrollDirection,
            x = v.scrollOffset
          if (b === 0) return [0, 0, 0, 0]
          var S = i(this.props, x, this._instanceProps),
            k = a(this.props, S, x, this._instanceProps),
            R = !C || w === 'backward' ? Math.max(1, y) : 1,
            M = !C || w === 'forward' ? Math.max(1, y) : 1
          return [Math.max(0, S - R), Math.max(0, Math.min(b - 1, k + M)), S, k]
        }),
        g
      )
    })(l.PureComponent)),
    (t.defaultProps = {
      direction: 'ltr',
      itemData: void 0,
      layout: 'vertical',
      overscanCount: 2,
      useIsScrolling: !1,
    }),
    t
  )
}
var YI = function (t, n) {
    ;(t.children,
      t.direction,
      t.height,
      t.layout,
      t.innerTagName,
      t.outerTagName,
      t.width,
      n.instance)
  },
  qI = 50,
  Nr = function (t, n, r) {
    var o = t,
      s = o.itemSize,
      i = r.itemMetadataMap,
      a = r.lastMeasuredIndex
    if (n > a) {
      var c = 0
      if (a >= 0) {
        var u = i[a]
        c = u.offset + u.size
      }
      for (var f = a + 1; f <= n; f++) {
        var d = s(f)
        ;((i[f] = { offset: c, size: d }), (c += d))
      }
      r.lastMeasuredIndex = n
    }
    return i[n]
  },
  XI = function (t, n, r) {
    var o = n.itemMetadataMap,
      s = n.lastMeasuredIndex,
      i = s > 0 ? o[s].offset : 0
    return i >= r ? Gh(t, n, s, 0, r) : JI(t, n, Math.max(0, s), r)
  },
  Gh = function (t, n, r, o, s) {
    for (; o <= r; ) {
      var i = o + Math.floor((r - o) / 2),
        a = Nr(t, i, n).offset
      if (a === s) return i
      a < s ? (o = i + 1) : a > s && (r = i - 1)
    }
    return o > 0 ? o - 1 : 0
  },
  JI = function (t, n, r, o) {
    for (var s = t.itemCount, i = 1; r < s && Nr(t, r, n).offset < o; ) ((r += i), (i *= 2))
    return Gh(t, n, Math.min(r, s - 1), Math.floor(r / 2), o)
  },
  ff = function (t, n) {
    var r = t.itemCount,
      o = n.itemMetadataMap,
      s = n.estimatedItemSize,
      i = n.lastMeasuredIndex,
      a = 0
    if ((i >= r && (i = r - 1), i >= 0)) {
      var c = o[i]
      a = c.offset + c.size
    }
    var u = r - i - 1,
      f = u * s
    return a + f
  },
  QI = KI({
    getItemOffset: function (t, n, r) {
      return Nr(t, n, r).offset
    },
    getItemSize: function (t, n, r) {
      return r.itemMetadataMap[n].size
    },
    getEstimatedTotalSize: ff,
    getOffsetForIndexAndAlignment: function (t, n, r, o, s, i) {
      var a = t.direction,
        c = t.height,
        u = t.layout,
        f = t.width,
        d = a === 'horizontal' || u === 'horizontal',
        g = d ? f : c,
        h = Nr(t, n, s),
        m = ff(t, s),
        p = Math.max(0, Math.min(m - g, h.offset)),
        b = Math.max(0, h.offset - g + h.size + i)
      switch ((r === 'smart' && (o >= b - g && o <= p + g ? (r = 'auto') : (r = 'center')), r)) {
        case 'start':
          return p
        case 'end':
          return b
        case 'center':
          return Math.round(b + (p - b) / 2)
        default:
          return o >= b && o <= p ? o : o < b ? b : p
      }
    },
    getStartIndexForOffset: function (t, n, r) {
      return XI(t, r, n)
    },
    getStopIndexForStartIndex: function (t, n, r, o) {
      for (
        var s = t.direction,
          i = t.height,
          a = t.itemCount,
          c = t.layout,
          u = t.width,
          f = s === 'horizontal' || c === 'horizontal',
          d = f ? u : i,
          g = Nr(t, n, o),
          h = r + d,
          m = g.offset + g.size,
          p = n;
        p < a - 1 && m < h;

      )
        (p++, (m += Nr(t, p, o).size))
      return p
    },
    initInstanceProps: function (t, n) {
      var r = t,
        o = r.estimatedItemSize,
        s = { itemMetadataMap: {}, estimatedItemSize: o || qI, lastMeasuredIndex: -1 }
      return (
        (n.resetAfterIndex = function (i, a) {
          ;(a === void 0 && (a = !0),
            (s.lastMeasuredIndex = Math.min(s.lastMeasuredIndex, i - 1)),
            n._getItemStyleCache(-1),
            a && n.forceUpdate())
        }),
        s
      )
    },
    shouldResetStyleCacheOnItemSizeChange: !1,
    validateProps: function (t) {
      t.itemSize
    },
  })
let Dt
typeof window < 'u' ? (Dt = window) : typeof self < 'u' ? (Dt = self) : (Dt = global)
let pl = null,
  gl = null
const pf = 20,
  ka = Dt.clearTimeout,
  gf = Dt.setTimeout,
  Ia = Dt.cancelAnimationFrame || Dt.mozCancelAnimationFrame || Dt.webkitCancelAnimationFrame,
  mf = Dt.requestAnimationFrame || Dt.mozRequestAnimationFrame || Dt.webkitRequestAnimationFrame
Ia == null || mf == null
  ? ((pl = ka),
    (gl = function (t) {
      return gf(t, pf)
    }))
  : ((pl = function ([t, n]) {
      ;(Ia(t), ka(n))
    }),
    (gl = function (t) {
      const n = mf(function () {
          ;(ka(r), t())
        }),
        r = gf(function () {
          ;(Ia(n), t())
        }, pf)
      return [n, r]
    }))
function eT(e) {
  let t, n, r, o, s, i, a
  const c = typeof document < 'u' && document.attachEvent
  if (!c) {
    ;((i = function (y) {
      const v = y.__resizeTriggers__,
        C = v.firstElementChild,
        w = v.lastElementChild,
        x = C.firstElementChild
      ;((w.scrollLeft = w.scrollWidth),
        (w.scrollTop = w.scrollHeight),
        (x.style.width = C.offsetWidth + 1 + 'px'),
        (x.style.height = C.offsetHeight + 1 + 'px'),
        (C.scrollLeft = C.scrollWidth),
        (C.scrollTop = C.scrollHeight))
    }),
      (s = function (y) {
        return (
          y.offsetWidth !== y.__resizeLast__.width || y.offsetHeight !== y.__resizeLast__.height
        )
      }),
      (a = function (y) {
        if (
          y.target.className &&
          typeof y.target.className.indexOf == 'function' &&
          y.target.className.indexOf('contract-trigger') < 0 &&
          y.target.className.indexOf('expand-trigger') < 0
        )
          return
        const v = this
        ;(i(this),
          this.__resizeRAF__ && pl(this.__resizeRAF__),
          (this.__resizeRAF__ = gl(function () {
            s(v) &&
              ((v.__resizeLast__.width = v.offsetWidth),
              (v.__resizeLast__.height = v.offsetHeight),
              v.__resizeListeners__.forEach(function (x) {
                x.call(v, y)
              }))
          })))
      }))
    let g = !1,
      h = ''
    r = 'animationstart'
    const m = 'Webkit Moz O ms'.split(' ')
    let p = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' '),
      b = ''
    {
      const y = document.createElement('fakeelement')
      if ((y.style.animationName !== void 0 && (g = !0), g === !1)) {
        for (let v = 0; v < m.length; v++)
          if (y.style[m[v] + 'AnimationName'] !== void 0) {
            ;((b = m[v]), (h = '-' + b.toLowerCase() + '-'), (r = p[v]), (g = !0))
            break
          }
      }
    }
    ;((n = 'resizeanim'),
      (t = '@' + h + 'keyframes ' + n + ' { from { opacity: 0; } to { opacity: 0; } } '),
      (o = h + 'animation: 1ms ' + n + '; '))
  }
  const u = function (g) {
    if (!g.getElementById('detectElementResize')) {
      const h =
          (t || '') +
          '.resize-triggers { ' +
          (o || '') +
          'visibility: hidden; opacity: 0; } .resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: -1; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',
        m = g.head || g.getElementsByTagName('head')[0],
        p = g.createElement('style')
      ;((p.id = 'detectElementResize'),
        (p.type = 'text/css'),
        e != null && p.setAttribute('nonce', e),
        p.styleSheet ? (p.styleSheet.cssText = h) : p.appendChild(g.createTextNode(h)),
        m.appendChild(p))
    }
  }
  return {
    addResizeListener: function (g, h) {
      if (c) g.attachEvent('onresize', h)
      else {
        if (!g.__resizeTriggers__) {
          const m = g.ownerDocument,
            p = Dt.getComputedStyle(g)
          ;(p && p.position === 'static' && (g.style.position = 'relative'),
            u(m),
            (g.__resizeLast__ = {}),
            (g.__resizeListeners__ = []),
            ((g.__resizeTriggers__ = m.createElement('div')).className = 'resize-triggers'))
          const b = m.createElement('div')
          ;((b.className = 'expand-trigger'), b.appendChild(m.createElement('div')))
          const y = m.createElement('div')
          ;((y.className = 'contract-trigger'),
            g.__resizeTriggers__.appendChild(b),
            g.__resizeTriggers__.appendChild(y),
            g.appendChild(g.__resizeTriggers__),
            i(g),
            g.addEventListener('scroll', a, !0),
            r &&
              ((g.__resizeTriggers__.__animationListener__ = function (C) {
                C.animationName === n && i(g)
              }),
              g.__resizeTriggers__.addEventListener(r, g.__resizeTriggers__.__animationListener__)))
        }
        g.__resizeListeners__.push(h)
      }
    },
    removeResizeListener: function (g, h) {
      if (c) g.detachEvent('onresize', h)
      else if (
        (g.__resizeListeners__.splice(g.__resizeListeners__.indexOf(h), 1),
        !g.__resizeListeners__.length)
      ) {
        ;(g.removeEventListener('scroll', a, !0),
          g.__resizeTriggers__.__animationListener__ &&
            (g.__resizeTriggers__.removeEventListener(
              r,
              g.__resizeTriggers__.__animationListener__,
            ),
            (g.__resizeTriggers__.__animationListener__ = null)))
        try {
          g.__resizeTriggers__ = !g.removeChild(g.__resizeTriggers__)
        } catch {}
      }
    },
  }
}
class tT extends l.Component {
  constructor(...t) {
    ;(super(...t),
      (this.state = { height: this.props.defaultHeight || 0, width: this.props.defaultWidth || 0 }),
      (this._autoSizer = null),
      (this._detectElementResize = null),
      (this._didLogDeprecationWarning = !1),
      (this._parentNode = null),
      (this._resizeObserver = null),
      (this._timeoutId = null),
      (this._onResize = () => {
        this._timeoutId = null
        const { disableHeight: n, disableWidth: r, onResize: o } = this.props
        if (this._parentNode) {
          const s = window.getComputedStyle(this._parentNode) || {},
            i = parseFloat(s.paddingLeft || '0'),
            a = parseFloat(s.paddingRight || '0'),
            c = parseFloat(s.paddingTop || '0'),
            u = parseFloat(s.paddingBottom || '0'),
            f = this._parentNode.getBoundingClientRect(),
            d = f.height - c - u,
            g = f.width - i - a
          if ((!n && this.state.height !== d) || (!r && this.state.width !== g)) {
            this.setState({ height: d, width: g })
            const h = () => {
              this._didLogDeprecationWarning ||
                ((this._didLogDeprecationWarning = !0),
                console.warn(
                  'scaledWidth and scaledHeight parameters have been deprecated; use width and height instead',
                ))
            }
            typeof o == 'function' &&
              o({
                height: d,
                width: g,
                get scaledHeight() {
                  return (h(), d)
                },
                get scaledWidth() {
                  return (h(), g)
                },
              })
          }
        }
      }),
      (this._setRef = (n) => {
        this._autoSizer = n
      }))
  }
  componentDidMount() {
    const { nonce: t } = this.props,
      n = this._autoSizer ? this._autoSizer.parentNode : null
    if (
      n != null &&
      n.ownerDocument &&
      n.ownerDocument.defaultView &&
      n instanceof n.ownerDocument.defaultView.HTMLElement
    ) {
      this._parentNode = n
      const r = n.ownerDocument.defaultView.ResizeObserver
      ;(r != null
        ? ((this._resizeObserver = new r(() => {
            this._timeoutId = setTimeout(this._onResize, 0)
          })),
          this._resizeObserver.observe(n))
        : ((this._detectElementResize = eT(t)),
          this._detectElementResize.addResizeListener(n, this._onResize)),
        this._onResize())
    }
  }
  componentWillUnmount() {
    this._parentNode &&
      (this._detectElementResize &&
        this._detectElementResize.removeResizeListener(this._parentNode, this._onResize),
      this._timeoutId !== null && clearTimeout(this._timeoutId),
      this._resizeObserver && this._resizeObserver.disconnect())
  }
  render() {
    const {
        children: t,
        defaultHeight: n,
        defaultWidth: r,
        disableHeight: o = !1,
        disableWidth: s = !1,
        doNotBailOutOnEmptyChildren: i = !1,
        nonce: a,
        onResize: c,
        style: u = {},
        tagName: f = 'div',
        ...d
      } = this.props,
      { height: g, width: h } = this.state,
      m = { overflow: 'visible' },
      p = {}
    let b = !1
    return (
      o || (g === 0 && (b = !0), (m.height = 0), (p.height = g), (p.scaledHeight = g)),
      s || (h === 0 && (b = !0), (m.width = 0), (p.width = h), (p.scaledWidth = h)),
      i && (b = !1),
      l.createElement(f, { ref: this._setRef, style: { ...m, ...u }, ...d }, !b && t(p))
    )
  }
}
var hf = function (e, t, n) {
    var r = 0
    return (e && (typeof e == 'number' && (r = e), typeof e == 'function' && (r = e(t, n))), r)
  },
  bf = { display: 'grid', gridTemplateColumns: 'var(--data-table-library_grid-template-columns)' },
  nT = ['children']
function vf(e, t) {
  var n = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e)
    ;(t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable
      })),
      n.push.apply(n, r))
  }
  return n
}
function Co(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {}
    t % 2
      ? vf(Object(n), !0).forEach(function (r) {
          zt(e, r, n[r])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : vf(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r))
          })
  }
  return e
}
var rT = function (e) {
  var t = e.tableList,
    n = e.rowHeight,
    r = e.header,
    o = e.body,
    s = e.tableOptions,
    i = e.rowOptions
  return ce(
    l.Fragment,
    null,
    s?.renderBeforeTable && s.renderBeforeTable(),
    ce(tT, null, function (a) {
      var c = a.width,
        u = a.height
      return ce(
        QI,
        {
          height: u,
          width: c,
          itemCount: t.length,
          itemSize: function (f) {
            return hf(n, t[f], f)
          },
          innerElementType: l.forwardRef(function (f, d) {
            var g = f.children,
              h = $t(f, nT)
            return ce(
              'div',
              vt({ ref: d }, h),
              ce(
                'div',
                {
                  style: Co(Co({}, bf), {}, { position: 'sticky', insetBlockStart: 0, zIndex: 3 }),
                },
                ce(si, null, r()),
              ),
              ce(Jk, null, g),
            )
          }),
          itemData: { items: t },
        },
        function (f) {
          var d = f.index,
            g = f.style,
            h = f.data
          return ce(
            'div',
            { style: Co(Co(Co({}, g), bf), {}, { top: +(g.top || 0) + hf(n, h.items[d], d) }) },
            i?.renderBeforeRow && i.renderBeforeRow(h.items[d], d),
            o(h.items[d], d),
            i?.renderAfterRow && i.renderAfterRow(h.items[d], d),
          )
        },
      )
    }),
    s?.renderAfterTable && s.renderAfterTable(),
  )
}
function oT(e, t) {
  const n = getComputedStyle(e),
    r = parseFloat(n.fontSize)
  return t * r
}
function sT(e, t) {
  const n = getComputedStyle(e.ownerDocument.body),
    r = parseFloat(n.fontSize)
  return t * r
}
function iT(e) {
  return (e / 100) * window.innerHeight
}
function aT(e) {
  return (e / 100) * window.innerWidth
}
function lT(e) {
  switch (typeof e) {
    case 'number':
      return [e, 'px']
    case 'string': {
      const t = parseFloat(e)
      return e.endsWith('%')
        ? [t, '%']
        : e.endsWith('px')
          ? [t, 'px']
          : e.endsWith('rem')
            ? [t, 'rem']
            : e.endsWith('em')
              ? [t, 'em']
              : e.endsWith('vh')
                ? [t, 'vh']
                : e.endsWith('vw')
                  ? [t, 'vw']
                  : [t, '%']
    }
  }
}
function So({ groupSize: e, panelElement: t, styleProp: n }) {
  let r
  const [o, s] = lT(n)
  switch (s) {
    case '%': {
      r = (o / 100) * e
      break
    }
    case 'px': {
      r = o
      break
    }
    case 'rem': {
      r = sT(t, o)
      break
    }
    case 'em': {
      r = oT(t, o)
      break
    }
    case 'vh': {
      r = iT(o)
      break
    }
    case 'vw': {
      r = aT(o)
      break
    }
  }
  return r
}
function kt(e) {
  return parseFloat(e.toFixed(3))
}
function no({ group: e }) {
  const { orientation: t, panels: n } = e
  return n.reduce(
    (r, o) => ((r += t === 'horizontal' ? o.element.offsetWidth : o.element.offsetHeight), r),
    0,
  )
}
function ml(e) {
  const { panels: t } = e,
    n = no({ group: e })
  return n === 0
    ? t.map((r) => ({
        groupResizeBehavior: r.panelConstraints.groupResizeBehavior,
        collapsedSize: 0,
        collapsible: r.panelConstraints.collapsible === !0,
        defaultSize: void 0,
        disabled: r.panelConstraints.disabled,
        minSize: 0,
        maxSize: 100,
        panelId: r.id,
      }))
    : t.map((r) => {
        const { element: o, panelConstraints: s } = r
        let i = 0
        if (s.collapsedSize !== void 0) {
          const f = So({ groupSize: n, panelElement: o, styleProp: s.collapsedSize })
          i = kt((f / n) * 100)
        }
        let a
        if (s.defaultSize !== void 0) {
          const f = So({ groupSize: n, panelElement: o, styleProp: s.defaultSize })
          a = kt((f / n) * 100)
        }
        let c = 0
        if (s.minSize !== void 0) {
          const f = So({ groupSize: n, panelElement: o, styleProp: s.minSize })
          c = kt((f / n) * 100)
        }
        let u = 100
        if (s.maxSize !== void 0) {
          const f = So({ groupSize: n, panelElement: o, styleProp: s.maxSize })
          u = kt((f / n) * 100)
        }
        return {
          groupResizeBehavior: s.groupResizeBehavior,
          collapsedSize: i,
          collapsible: s.collapsible === !0,
          defaultSize: a,
          disabled: s.disabled,
          minSize: c,
          maxSize: u,
          panelId: r.id,
        }
      })
}
function $e(e, t = 'Assertion error') {
  if (!e) throw Error(t)
}
function hl(e, t) {
  return Array.from(t).sort(e === 'horizontal' ? cT : uT)
}
function cT(e, t) {
  const n = e.element.offsetLeft - t.element.offsetLeft
  return n !== 0 ? n : e.element.offsetWidth - t.element.offsetWidth
}
function uT(e, t) {
  const n = e.element.offsetTop - t.element.offsetTop
  return n !== 0 ? n : e.element.offsetHeight - t.element.offsetHeight
}
function Uh(e) {
  return e !== null && typeof e == 'object' && 'nodeType' in e && e.nodeType === Node.ELEMENT_NODE
}
function Zh(e, t) {
  return {
    x:
      e.x >= t.left && e.x <= t.right
        ? 0
        : Math.min(Math.abs(e.x - t.left), Math.abs(e.x - t.right)),
    y:
      e.y >= t.top && e.y <= t.bottom
        ? 0
        : Math.min(Math.abs(e.y - t.top), Math.abs(e.y - t.bottom)),
  }
}
function dT({ orientation: e, rects: t, targetRect: n }) {
  const r = { x: n.x + n.width / 2, y: n.y + n.height / 2 }
  let o,
    s = Number.MAX_VALUE
  for (const i of t) {
    const { x: a, y: c } = Zh(r, i),
      u = e === 'horizontal' ? a : c
    u < s && ((s = u), (o = i))
  }
  return ($e(o, 'No rect found'), o)
}
let ks
function Kh() {
  return (
    ks === void 0 &&
      (typeof matchMedia == 'function'
        ? (ks = !!matchMedia('(pointer:coarse)').matches)
        : (ks = !1)),
    ks
  )
}
function Yh(e) {
  const { element: t, orientation: n, panels: r, separators: o } = e,
    s = hl(
      n,
      Array.from(t.children)
        .filter(Uh)
        .map((m) => ({ element: m })),
    ).map(({ element: m }) => m),
    i = []
  let a = !1,
    c = !1,
    u = -1,
    f = -1,
    d = 0,
    g,
    h = []
  {
    let m = -1
    for (const p of s)
      p.hasAttribute('data-panel') &&
        (m++, p.hasAttribute('data-disabled') || (d++, u === -1 && (u = m), (f = m)))
  }
  if (d > 1) {
    let m = -1
    for (const p of s)
      if (p.hasAttribute('data-panel')) {
        m++
        const b = r.find((y) => y.element === p)
        if (b) {
          if (g) {
            const y = g.element.getBoundingClientRect(),
              v = p.getBoundingClientRect()
            let C
            if (c) {
              const w =
                  n === 'horizontal'
                    ? new DOMRect(y.right, y.top, 0, y.height)
                    : new DOMRect(y.left, y.bottom, y.width, 0),
                x =
                  n === 'horizontal'
                    ? new DOMRect(v.left, v.top, 0, v.height)
                    : new DOMRect(v.left, v.top, v.width, 0)
              switch (h.length) {
                case 0: {
                  C = [w, x]
                  break
                }
                case 1: {
                  const S = h[0],
                    k = dT({
                      orientation: n,
                      rects: [y, v],
                      targetRect: S.element.getBoundingClientRect(),
                    })
                  C = [S, k === y ? x : w]
                  break
                }
                default: {
                  C = h
                  break
                }
              }
            } else
              h.length
                ? (C = h)
                : (C = [
                    n === 'horizontal'
                      ? new DOMRect(y.right, v.top, v.left - y.right, v.height)
                      : new DOMRect(v.left, y.bottom, v.width, v.top - y.bottom),
                  ])
            for (const w of C) {
              let x = 'width' in w ? w : w.element.getBoundingClientRect()
              const S = Kh() ? e.resizeTargetMinimumSize.coarse : e.resizeTargetMinimumSize.fine
              if (x.width < S) {
                const R = S - x.width
                x = new DOMRect(x.x - R / 2, x.y, x.width + R, x.height)
              }
              if (x.height < S) {
                const R = S - x.height
                x = new DOMRect(x.x, x.y - R / 2, x.width, x.height + R)
              }
              const k = m <= u || m > f
              ;(!a &&
                !k &&
                i.push({
                  group: e,
                  groupSize: no({ group: e }),
                  panels: [g, b],
                  separator: 'width' in w ? void 0 : w,
                  rect: x,
                }),
                (a = !1))
            }
          }
          ;((c = !1), (g = b), (h = []))
        }
      } else if (p.hasAttribute('data-separator')) {
        p.ariaDisabled !== null && (a = !0)
        const b = o.find((y) => y.element === p)
        b ? h.push(b) : ((g = void 0), (h = []))
      } else c = !0
  }
  return i
}
class qh {
  #e = {}
  addListener(t, n) {
    const r = this.#e[t]
    return (
      r === void 0 ? (this.#e[t] = [n]) : r.includes(n) || r.push(n),
      () => {
        this.removeListener(t, n)
      }
    )
  }
  emit(t, n) {
    const r = this.#e[t]
    if (r !== void 0)
      if (r.length === 1) r[0].call(null, n)
      else {
        let o = !1,
          s = null
        const i = Array.from(r)
        for (let a = 0; a < i.length; a++) {
          const c = i[a]
          try {
            c.call(null, n)
          } catch (u) {
            s === null && ((o = !0), (s = u))
          }
        }
        if (o) throw s
      }
  }
  removeAllListeners() {
    this.#e = {}
  }
  removeListener(t, n) {
    const r = this.#e[t]
    if (r !== void 0) {
      const o = r.indexOf(n)
      o >= 0 && r.splice(o, 1)
    }
  }
}
let Qt = new Map()
const Xh = new qh()
function fT(e) {
  ;((Qt = new Map(Qt)), Qt.delete(e))
}
function yf(e, t) {
  for (const [n] of Qt) if (n.id === e) return n
}
function Fn(e, t) {
  for (const [n, r] of Qt) if (n.id === e) return r
  if (t) throw Error(`Could not find data for Group with id ${e}`)
}
function Tr() {
  return Qt
}
function zc(e, t) {
  return Xh.addListener('groupChange', (n) => {
    n.group.id === e && t(n)
  })
}
function yn(e, t) {
  const n = Qt.get(e)
  ;((Qt = new Map(Qt)), Qt.set(e, t), Xh.emit('groupChange', { group: e, prev: n, next: t }))
}
function pT(e, t, n) {
  let r,
    o = { x: 1 / 0, y: 1 / 0 }
  for (const s of t) {
    const i = Zh(n, s.rect)
    switch (e) {
      case 'horizontal': {
        i.x <= o.x && ((r = s), (o = i))
        break
      }
      case 'vertical': {
        i.y <= o.y && ((r = s), (o = i))
        break
      }
    }
  }
  return r ? { distance: o, hitRegion: r } : void 0
}
function gT(e) {
  return (
    e !== null &&
    typeof e == 'object' &&
    'nodeType' in e &&
    e.nodeType === Node.DOCUMENT_FRAGMENT_NODE
  )
}
function mT(e, t) {
  if (e === t) throw new Error('Cannot compare node with itself')
  const n = { a: Cf(e), b: Cf(t) }
  let r
  for (; n.a.at(-1) === n.b.at(-1); ) ((r = n.a.pop()), n.b.pop())
  $e(r, 'Stacking order can only be calculated for elements with a common ancestor')
  const o = { a: wf(xf(n.a)), b: wf(xf(n.b)) }
  if (o.a === o.b) {
    const s = r.childNodes,
      i = { a: n.a.at(-1), b: n.b.at(-1) }
    let a = s.length
    for (; a--; ) {
      const c = s[a]
      if (c === i.a) return 1
      if (c === i.b) return -1
    }
  }
  return Math.sign(o.a - o.b)
}
const hT =
  /\b(?:position|zIndex|opacity|transform|webkitTransform|mixBlendMode|filter|webkitFilter|isolation)\b/
function bT(e) {
  const t = getComputedStyle(Jh(e) ?? e).display
  return t === 'flex' || t === 'inline-flex'
}
function vT(e) {
  const t = getComputedStyle(e)
  return !!(
    t.position === 'fixed' ||
    (t.zIndex !== 'auto' && (t.position !== 'static' || bT(e))) ||
    +t.opacity < 1 ||
    ('transform' in t && t.transform !== 'none') ||
    ('webkitTransform' in t && t.webkitTransform !== 'none') ||
    ('mixBlendMode' in t && t.mixBlendMode !== 'normal') ||
    ('filter' in t && t.filter !== 'none') ||
    ('webkitFilter' in t && t.webkitFilter !== 'none') ||
    ('isolation' in t && t.isolation === 'isolate') ||
    hT.test(t.willChange) ||
    t.webkitOverflowScrolling === 'touch'
  )
}
function xf(e) {
  let t = e.length
  for (; t--; ) {
    const n = e[t]
    if (($e(n, 'Missing node'), vT(n))) return n
  }
  return null
}
function wf(e) {
  return (e && Number(getComputedStyle(e).zIndex)) || 0
}
function Cf(e) {
  const t = []
  for (; e; ) (t.push(e), (e = Jh(e)))
  return t
}
function Jh(e) {
  const { parentNode: t } = e
  return gT(t) ? t.host : t
}
function yT(e, t) {
  return e.x < t.x + t.width && e.x + e.width > t.x && e.y < t.y + t.height && e.y + e.height > t.y
}
function xT({ groupElement: e, hitRegion: t, pointerEventTarget: n }) {
  if (!Uh(n) || n.contains(e) || e.contains(n)) return !0
  if (mT(n, e) > 0) {
    let r = n
    for (; r; ) {
      if (r.contains(e)) return !0
      if (yT(r.getBoundingClientRect(), t)) return !1
      r = r.parentElement
    }
  }
  return !0
}
function Lc(e, t) {
  const n = []
  return (
    t.forEach((r, o) => {
      if (o.disabled) return
      const s = Yh(o),
        i = pT(o.orientation, s, { x: e.clientX, y: e.clientY })
      i &&
        i.distance.x <= 0 &&
        i.distance.y <= 0 &&
        xT({
          groupElement: o.element,
          hitRegion: i.hitRegion.rect,
          pointerEventTarget: e.target,
        }) &&
        n.push(i.hitRegion)
    }),
    n
  )
}
function wT(e, t) {
  if (e.length !== t.length) return !1
  for (let n = 0; n < e.length; n++) if (e[n] != t[n]) return !1
  return !0
}
function wt(e, t, n = 0) {
  return Math.abs(kt(e) - kt(t)) <= n
}
function Yt(e, t) {
  return wt(e, t) ? 0 : e > t ? 1 : -1
}
function _r({ overrideDisabledPanels: e, panelConstraints: t, prevSize: n, size: r }) {
  const { collapsedSize: o = 0, collapsible: s, disabled: i, maxSize: a = 100, minSize: c = 0 } = t
  if (i && !e) return n
  if (Yt(r, c) < 0)
    if (s) {
      const u = (o + c) / 2
      Yt(r, u) < 0 ? (r = o) : (r = c)
    } else r = c
  return ((r = Math.min(a, r)), (r = kt(r)), r)
}
function Ho({
  delta: e,
  initialLayout: t,
  panelConstraints: n,
  pivotIndices: r,
  prevLayout: o,
  trigger: s,
}) {
  if (wt(e, 0)) return t
  const i = s === 'imperative-api',
    a = Object.values(t),
    c = Object.values(o),
    u = [...a],
    [f, d] = r
  ;($e(f != null, 'Invalid first pivot index'), $e(d != null, 'Invalid second pivot index'))
  let g = 0
  switch (s) {
    case 'keyboard': {
      {
        const p = e < 0 ? d : f,
          b = n[p]
        $e(b, `Panel constraints not found for index ${p}`)
        const { collapsedSize: y = 0, collapsible: v, minSize: C = 0 } = b
        if (v) {
          const w = a[p]
          if (($e(w != null, `Previous layout not found for panel index ${p}`), wt(w, y))) {
            const x = C - w
            Yt(x, Math.abs(e)) > 0 && (e = e < 0 ? 0 - x : x)
          }
        }
      }
      {
        const p = e < 0 ? f : d,
          b = n[p]
        $e(b, `No panel constraints found for index ${p}`)
        const { collapsedSize: y = 0, collapsible: v, minSize: C = 0 } = b
        if (v) {
          const w = a[p]
          if (($e(w != null, `Previous layout not found for panel index ${p}`), wt(w, C))) {
            const x = w - y
            Yt(x, Math.abs(e)) > 0 && (e = e < 0 ? 0 - x : x)
          }
        }
      }
      break
    }
    default: {
      const p = e < 0 ? d : f,
        b = n[p]
      $e(b, `Panel constraints not found for index ${p}`)
      const y = a[p],
        { collapsible: v, collapsedSize: C, minSize: w } = b
      if (v && Yt(y, w) < 0)
        if (e > 0) {
          const x = w - C,
            S = x / 2,
            k = y + e
          Yt(k, w) < 0 && (e = Yt(e, S) <= 0 ? 0 : x)
        } else {
          const x = w - C,
            S = 100 - x / 2,
            k = y - e
          Yt(k, w) < 0 && (e = Yt(100 + e, S) > 0 ? 0 : -x)
        }
      break
    }
  }
  {
    const p = e < 0 ? 1 : -1
    let b = e < 0 ? d : f,
      y = 0
    for (;;) {
      const C = a[b]
      $e(C != null, `Previous layout not found for panel index ${b}`)
      const w =
        _r({ overrideDisabledPanels: i, panelConstraints: n[b], prevSize: C, size: 100 }) - C
      if (((y += w), (b += p), b < 0 || b >= n.length)) break
    }
    const v = Math.min(Math.abs(e), Math.abs(y))
    e = e < 0 ? 0 - v : v
  }
  {
    let p = e < 0 ? f : d
    for (; p >= 0 && p < n.length; ) {
      const b = Math.abs(e) - Math.abs(g),
        y = a[p]
      $e(y != null, `Previous layout not found for panel index ${p}`)
      const v = y - b,
        C = _r({ overrideDisabledPanels: i, panelConstraints: n[p], prevSize: y, size: v })
      if (
        !wt(y, C) &&
        ((g += y - C),
        (u[p] = C),
        g.toFixed(3).localeCompare(Math.abs(e).toFixed(3), void 0, { numeric: !0 }) >= 0)
      )
        break
      e < 0 ? p-- : p++
    }
  }
  if (wT(c, u)) return o
  {
    const p = e < 0 ? d : f,
      b = a[p]
    $e(b != null, `Previous layout not found for panel index ${p}`)
    const y = b + g,
      v = _r({ overrideDisabledPanels: i, panelConstraints: n[p], prevSize: b, size: y })
    if (((u[p] = v), !wt(v, y))) {
      let C = y - v,
        w = e < 0 ? d : f
      for (; w >= 0 && w < n.length; ) {
        const x = u[w]
        $e(x != null, `Previous layout not found for panel index ${w}`)
        const S = x + C,
          k = _r({ overrideDisabledPanels: i, panelConstraints: n[w], prevSize: x, size: S })
        if ((wt(x, k) || ((C -= k - x), (u[w] = k)), wt(C, 0))) break
        e > 0 ? w-- : w++
      }
    }
  }
  const h = Object.values(u).reduce((p, b) => b + p, 0)
  if (!wt(h, 100, 0.1)) return o
  const m = Object.keys(o)
  return u.reduce((p, b, y) => ((p[m[y]] = b), p), {})
}
function hr(e, t) {
  if (Object.keys(e).length !== Object.keys(t).length) return !1
  for (const n in e) if (t[n] === void 0 || Yt(e[n], t[n]) !== 0) return !1
  return !0
}
function br({ layout: e, panelConstraints: t }) {
  const n = Object.values(e),
    r = [...n],
    o = r.reduce((a, c) => a + c, 0)
  if (r.length !== t.length)
    throw Error(`Invalid ${t.length} panel layout: ${r.map((a) => `${a}%`).join(', ')}`)
  if (!wt(o, 100) && r.length > 0)
    for (let a = 0; a < t.length; a++) {
      const c = r[a]
      $e(c != null, `No layout data found for index ${a}`)
      const u = (100 / o) * c
      r[a] = u
    }
  let s = 0
  for (let a = 0; a < t.length; a++) {
    const c = n[a]
    $e(c != null, `No layout data found for index ${a}`)
    const u = r[a]
    $e(u != null, `No layout data found for index ${a}`)
    const f = _r({ overrideDisabledPanels: !0, panelConstraints: t[a], prevSize: c, size: u })
    u != f && ((s += u - f), (r[a] = f))
  }
  if (!wt(s, 0))
    for (let a = 0; a < t.length; a++) {
      const c = r[a]
      $e(c != null, `No layout data found for index ${a}`)
      const u = c + s,
        f = _r({ overrideDisabledPanels: !0, panelConstraints: t[a], prevSize: c, size: u })
      if (c !== f && ((s -= f - c), (r[a] = f), wt(s, 0))) break
    }
  const i = Object.keys(e)
  return r.reduce((a, c, u) => ((a[i[u]] = c), a), {})
}
function Qh({ groupId: e, panelId: t }) {
  const n = () => {
      const a = Tr()
      for (const [
        c,
        {
          defaultLayoutDeferred: u,
          derivedPanelConstraints: f,
          layout: d,
          groupSize: g,
          separatorToPanels: h,
        },
      ] of a)
        if (c.id === e)
          return {
            defaultLayoutDeferred: u,
            derivedPanelConstraints: f,
            group: c,
            groupSize: g,
            layout: d,
            separatorToPanels: h,
          }
      throw Error(`Group ${e} not found`)
    },
    r = () => {
      const a = n().derivedPanelConstraints.find((c) => c.panelId === t)
      if (a !== void 0) return a
      throw Error(`Panel constraints not found for Panel ${t}`)
    },
    o = () => {
      const a = n().group.panels.find((c) => c.id === t)
      if (a !== void 0) return a
      throw Error(`Layout not found for Panel ${t}`)
    },
    s = () => {
      const a = n().layout[t]
      if (a !== void 0) return a
      throw Error(`Layout not found for Panel ${t}`)
    },
    i = (a) => {
      const c = s()
      if (a === c) return
      const {
          defaultLayoutDeferred: u,
          derivedPanelConstraints: f,
          group: d,
          groupSize: g,
          layout: h,
          separatorToPanels: m,
        } = n(),
        p = d.panels.findIndex((C) => C.id === t),
        b = p === d.panels.length - 1,
        y = Ho({
          delta: b ? c - a : a - c,
          initialLayout: h,
          panelConstraints: f,
          pivotIndices: b ? [p - 1, p] : [p, p + 1],
          prevLayout: h,
          trigger: 'imperative-api',
        }),
        v = br({ layout: y, panelConstraints: f })
      hr(h, v) ||
        yn(d, {
          defaultLayoutDeferred: u,
          derivedPanelConstraints: f,
          groupSize: g,
          layout: v,
          separatorToPanels: m,
        })
    }
  return {
    collapse: () => {
      const { collapsible: a, collapsedSize: c } = r(),
        { mutableValues: u } = o(),
        f = s()
      a && f !== c && ((u.expandToSize = f), i(c))
    },
    expand: () => {
      const { collapsible: a, collapsedSize: c, minSize: u } = r(),
        { mutableValues: f } = o(),
        d = s()
      if (a && d === c) {
        let g = f.expandToSize ?? u
        ;(g === 0 && (g = 1), i(g))
      }
    },
    getSize: () => {
      const { group: a } = n(),
        c = s(),
        { element: u } = o(),
        f = a.orientation === 'horizontal' ? u.offsetWidth : u.offsetHeight
      return { asPercentage: c, inPixels: f }
    },
    isCollapsed: () => {
      const { collapsible: a, collapsedSize: c } = r(),
        u = s()
      return a && wt(c, u)
    },
    resize: (a) => {
      const { group: c } = n(),
        { element: u } = o(),
        f = no({ group: c }),
        d = So({ groupSize: f, panelElement: u, styleProp: a }),
        g = kt((d / f) * 100)
      i(g)
    },
  }
}
function Sf(e) {
  if (e.defaultPrevented) return
  const t = Tr()
  Lc(e, t).forEach((n) => {
    if (n.separator && !n.separator.disableDoubleClick) {
      const r = n.panels.find((o) => o.panelConstraints.defaultSize !== void 0)
      if (r) {
        const o = r.panelConstraints.defaultSize,
          s = Qh({ groupId: n.group.id, panelId: r.id })
        s && o !== void 0 && (s.resize(o), e.preventDefault())
      }
    }
  })
}
function Ns(e) {
  const t = Tr()
  for (const [n] of t) if (n.separators.some((r) => r.element === e)) return n
  throw Error('Could not find parent Group for separator element')
}
function e0({ groupId: e }) {
  const t = () => {
    const n = Tr()
    for (const [r, o] of n) if (r.id === e) return { group: r, ...o }
    throw Error(`Could not find Group with id "${e}"`)
  }
  return {
    getLayout() {
      const { defaultLayoutDeferred: n, layout: r } = t()
      return n ? {} : r
    },
    setLayout(n) {
      const {
          defaultLayoutDeferred: r,
          derivedPanelConstraints: o,
          group: s,
          groupSize: i,
          layout: a,
          separatorToPanels: c,
        } = t(),
        u = br({ layout: n, panelConstraints: o })
      return r
        ? a
        : (hr(a, u) ||
            yn(s, {
              defaultLayoutDeferred: r,
              derivedPanelConstraints: o,
              groupSize: i,
              layout: u,
              separatorToPanels: c,
            }),
          u)
    },
  }
}
function sr(e, t) {
  const n = Ns(e),
    r = Fn(n.id, !0),
    o = n.separators.find((f) => f.element === e)
  $e(o, 'Matching separator not found')
  const s = r.separatorToPanels.get(o)
  $e(s, 'Matching panels not found')
  const i = s.map((f) => n.panels.indexOf(f)),
    a = e0({ groupId: n.id }).getLayout(),
    c = Ho({
      delta: t,
      initialLayout: a,
      panelConstraints: r.derivedPanelConstraints,
      pivotIndices: i,
      prevLayout: a,
      trigger: 'keyboard',
    }),
    u = br({ layout: c, panelConstraints: r.derivedPanelConstraints })
  hr(a, u) ||
    yn(n, {
      defaultLayoutDeferred: r.defaultLayoutDeferred,
      derivedPanelConstraints: r.derivedPanelConstraints,
      groupSize: r.groupSize,
      layout: u,
      separatorToPanels: r.separatorToPanels,
    })
}
function Ef(e) {
  if (e.defaultPrevented) return
  const t = e.currentTarget,
    n = Ns(t)
  if (!n.disabled)
    switch (e.key) {
      case 'ArrowDown': {
        ;(e.preventDefault(), n.orientation === 'vertical' && sr(t, 5))
        break
      }
      case 'ArrowLeft': {
        ;(e.preventDefault(), n.orientation === 'horizontal' && sr(t, -5))
        break
      }
      case 'ArrowRight': {
        ;(e.preventDefault(), n.orientation === 'horizontal' && sr(t, 5))
        break
      }
      case 'ArrowUp': {
        ;(e.preventDefault(), n.orientation === 'vertical' && sr(t, -5))
        break
      }
      case 'End': {
        ;(e.preventDefault(), sr(t, 100))
        break
      }
      case 'Enter': {
        e.preventDefault()
        const r = Ns(t),
          o = Fn(r.id, !0),
          { derivedPanelConstraints: s, layout: i, separatorToPanels: a } = o,
          c = r.separators.find((g) => g.element === t)
        $e(c, 'Matching separator not found')
        const u = a.get(c)
        $e(u, 'Matching panels not found')
        const f = u[0],
          d = s.find((g) => g.panelId === f.id)
        if (($e(d, 'Panel metadata not found'), d.collapsible)) {
          const g = i[f.id],
            h =
              d.collapsedSize === g
                ? (r.mutableState.expandedPanelSizes[f.id] ?? d.minSize)
                : d.collapsedSize
          sr(t, h - g)
        }
        break
      }
      case 'F6': {
        e.preventDefault()
        const r = Ns(t).separators.map((i) => i.element),
          o = Array.from(r).findIndex((i) => i === e.currentTarget)
        $e(o !== null, 'Index not found')
        const s = e.shiftKey ? (o > 0 ? o - 1 : r.length - 1) : o + 1 < r.length ? o + 1 : 0
        r[s].focus({ preventScroll: !0 })
        break
      }
      case 'Home': {
        ;(e.preventDefault(), sr(t, -100))
        break
      }
    }
}
let Zr = { cursorFlags: 0, state: 'inactive' }
const jc = new qh()
function vr() {
  return Zr
}
function CT(e) {
  return jc.addListener('change', e)
}
function ST(e) {
  const t = Zr,
    n = { ...Zr }
  ;((n.cursorFlags = e), (Zr = n), jc.emit('change', { prev: t, next: n }))
}
function Kr(e) {
  const t = Zr
  ;((Zr = e), jc.emit('change', { prev: t, next: e }))
}
function Rf(e) {
  if (e.defaultPrevented || (e.pointerType === 'mouse' && e.button > 0)) return
  const t = Tr(),
    n = Lc(e, t),
    r = new Map()
  let o = !1
  ;(n.forEach((s) => {
    s.separator && (o || ((o = !0), s.separator.element.focus({ preventScroll: !0 })))
    const i = t.get(s.group)
    i && r.set(s.group, i.layout)
  }),
    Kr({
      cursorFlags: 0,
      hitRegions: n,
      initialLayoutMap: r,
      pointerDownAtPoint: { x: e.clientX, y: e.clientY },
      state: 'active',
    }),
    n.length && e.preventDefault())
}
const ET = (e) => e,
  Ta = () => {},
  t0 = 1,
  n0 = 2,
  r0 = 4,
  o0 = 8,
  kf = 3,
  If = 12
let Is
function Tf() {
  return (
    Is === void 0 &&
      ((Is = !1),
      typeof window < 'u' &&
        (window.navigator.userAgent.includes('Chrome') ||
          window.navigator.userAgent.includes('Firefox')) &&
        (Is = !0)),
    Is
  )
}
function RT({ cursorFlags: e, groups: t, state: n }) {
  let r = 0,
    o = 0
  switch (n) {
    case 'active':
    case 'hover':
      t.forEach((s) => {
        if (!s.mutableState.disableCursor)
          switch (s.orientation) {
            case 'horizontal': {
              r++
              break
            }
            case 'vertical': {
              o++
              break
            }
          }
      })
  }
  if (!(r === 0 && o === 0)) {
    switch (n) {
      case 'active': {
        if (e && Tf()) {
          const s = (e & t0) !== 0,
            i = (e & n0) !== 0,
            a = (e & r0) !== 0,
            c = (e & o0) !== 0
          if (s) return a ? 'se-resize' : c ? 'ne-resize' : 'e-resize'
          if (i) return a ? 'sw-resize' : c ? 'nw-resize' : 'w-resize'
          if (a) return 's-resize'
          if (c) return 'n-resize'
        }
        break
      }
    }
    return Tf()
      ? r > 0 && o > 0
        ? 'move'
        : r > 0
          ? 'ew-resize'
          : 'ns-resize'
      : r > 0 && o > 0
        ? 'grab'
        : r > 0
          ? 'col-resize'
          : 'row-resize'
  }
}
const Pf = new WeakMap()
function Dc(e) {
  if (e.defaultView === null || e.defaultView === void 0) return
  let { prevStyle: t, styleSheet: n } = Pf.get(e) ?? {}
  n === void 0 &&
    ((n = new e.defaultView.CSSStyleSheet()), e.adoptedStyleSheets && e.adoptedStyleSheets.push(n))
  const r = vr()
  switch (r.state) {
    case 'active':
    case 'hover': {
      const o = RT({
          cursorFlags: r.cursorFlags,
          groups: r.hitRegions.map((i) => i.group),
          state: r.state,
        }),
        s = `*, *:hover {cursor: ${o} !important; }`
      if (t === s) return
      ;((t = s),
        o
          ? n.cssRules.length === 0
            ? n.insertRule(s)
            : n.replaceSync(s)
          : n.cssRules.length === 1 && n.deleteRule(0))
      break
    }
    case 'inactive': {
      ;((t = void 0), n.cssRules.length === 1 && n.deleteRule(0))
      break
    }
  }
  Pf.set(e, { prevStyle: t, styleSheet: n })
}
function s0({
  document: e,
  event: t,
  hitRegions: n,
  initialLayoutMap: r,
  mountedGroups: o,
  pointerDownAtPoint: s,
  prevCursorFlags: i,
}) {
  let a = 0
  n.forEach((u) => {
    const { group: f, groupSize: d } = u,
      { orientation: g, panels: h } = f,
      { disableCursor: m } = f.mutableState
    let p = 0
    s
      ? g === 'horizontal'
        ? (p = ((t.clientX - s.x) / d) * 100)
        : (p = ((t.clientY - s.y) / d) * 100)
      : g === 'horizontal'
        ? (p = t.clientX < 0 ? -100 : 100)
        : (p = t.clientY < 0 ? -100 : 100)
    const b = r.get(f),
      y = o.get(f)
    if (!b || !y) return
    const {
      defaultLayoutDeferred: v,
      derivedPanelConstraints: C,
      groupSize: w,
      layout: x,
      separatorToPanels: S,
    } = y
    if (C && x && S) {
      const k = Ho({
        delta: p,
        initialLayout: b,
        panelConstraints: C,
        pivotIndices: u.panels.map((R) => h.indexOf(R)),
        prevLayout: x,
        trigger: 'mouse-or-touch',
      })
      if (hr(k, x)) {
        if (p !== 0 && !m)
          switch (g) {
            case 'horizontal': {
              a |= p < 0 ? t0 : n0
              break
            }
            case 'vertical': {
              a |= p < 0 ? r0 : o0
              break
            }
          }
      } else
        yn(u.group, {
          defaultLayoutDeferred: v,
          derivedPanelConstraints: C,
          groupSize: w,
          layout: k,
          separatorToPanels: S,
        })
    }
  })
  let c = 0
  ;(t.movementX === 0 ? (c |= i & kf) : (c |= a & kf),
    t.movementY === 0 ? (c |= i & If) : (c |= a & If),
    ST(c),
    Dc(e))
}
function Of(e) {
  const t = Tr(),
    n = vr()
  n.state === 'active' &&
    s0({
      document: e.currentTarget,
      event: e,
      hitRegions: n.hitRegions,
      initialLayoutMap: n.initialLayoutMap,
      mountedGroups: t,
      prevCursorFlags: n.cursorFlags,
    })
}
function Mf(e) {
  if (e.defaultPrevented) return
  const t = vr(),
    n = Tr()
  switch (t.state) {
    case 'active': {
      if (e.buttons === 0) {
        ;(Kr({ cursorFlags: 0, state: 'inactive' }),
          t.hitRegions.forEach((r) => {
            const o = Fn(r.group.id, !0)
            yn(r.group, o)
          }))
        return
      }
      for (const r of t.hitRegions)
        if (r.separator) {
          const { element: o } = r.separator
          o.hasPointerCapture?.(e.pointerId) || o.setPointerCapture?.(e.pointerId)
        }
      s0({
        document: e.currentTarget,
        event: e,
        hitRegions: t.hitRegions,
        initialLayoutMap: t.initialLayoutMap,
        mountedGroups: n,
        pointerDownAtPoint: t.pointerDownAtPoint,
        prevCursorFlags: t.cursorFlags,
      })
      break
    }
    default: {
      const r = Lc(e, n)
      ;(r.length === 0
        ? t.state !== 'inactive' && Kr({ cursorFlags: 0, state: 'inactive' })
        : Kr({ cursorFlags: 0, hitRegions: r, state: 'hover' }),
        Dc(e.currentTarget))
      break
    }
  }
}
function Af(e) {
  e.relatedTarget instanceof HTMLIFrameElement &&
    vr().state === 'hover' &&
    Kr({ cursorFlags: 0, state: 'inactive' })
}
function zf(e) {
  if (e.defaultPrevented || (e.pointerType === 'mouse' && e.button > 0)) return
  const t = vr()
  t.state === 'active' &&
    (Kr({ cursorFlags: 0, state: 'inactive' }),
    t.hitRegions.length > 0 &&
      (Dc(e.currentTarget),
      t.hitRegions.forEach((n) => {
        const r = Fn(n.group.id, !0)
        yn(n.group, r)
      }),
      e.preventDefault()))
}
function Lf(e) {
  let t = 0,
    n = 0
  const r = {}
  for (const s of e)
    if (s.defaultSize !== void 0) {
      t++
      const i = kt(s.defaultSize)
      ;((n += i), (r[s.panelId] = i))
    } else r[s.panelId] = void 0
  const o = e.length - t
  if (o !== 0) {
    const s = kt((100 - n) / o)
    for (const i of e) i.defaultSize === void 0 && (r[i.panelId] = s)
  }
  return r
}
function kT(e, t, n) {
  if (!n[0]) return
  const r = e.panels.find((c) => c.element === t)
  if (!r || !r.onResize) return
  const o = no({ group: e }),
    s = e.orientation === 'horizontal' ? r.element.offsetWidth : r.element.offsetHeight,
    i = r.mutableValues.prevSize,
    a = { asPercentage: kt((s / o) * 100), inPixels: s }
  ;((r.mutableValues.prevSize = a), r.onResize(a, r.id, i))
}
function IT(e, t) {
  if (Object.keys(e).length !== Object.keys(t).length) return !1
  for (const n in e) if (e[n] !== t[n]) return !1
  return !0
}
function TT({ group: e, nextGroupSize: t, prevGroupSize: n, prevLayout: r }) {
  if (n <= 0 || t <= 0 || n === t) return r
  let o = 0,
    s = 0,
    i = !1
  const a = new Map(),
    c = []
  for (const d of e.panels) {
    const g = r[d.id] ?? 0
    if (d.panelConstraints.groupResizeBehavior === 'preserve-pixel-size') {
      i = !0
      const h = (g / 100) * n,
        m = kt((h / t) * 100)
      ;(a.set(d.id, m), (o += m))
    } else (c.push(d.id), (s += g))
  }
  if (!i || c.length === 0) return r
  const u = 100 - o,
    f = { ...r }
  if (
    (a.forEach((d, g) => {
      f[g] = d
    }),
    s > 0)
  )
    for (const d of c) {
      const g = r[d] ?? 0
      f[d] = kt((g / s) * u)
    }
  else {
    const d = kt(u / c.length)
    for (const g of c) f[g] = d
  }
  return f
}
function PT(e, t) {
  const n = e.map((o) => o.id),
    r = Object.keys(t)
  if (n.length !== r.length) return !1
  for (const o of n) if (!r.includes(o)) return !1
  return !0
}
const Lr = new Map()
function OT(e) {
  let t = !0
  $e(e.element.ownerDocument.defaultView, 'Cannot register an unmounted Group')
  const n = e.element.ownerDocument.defaultView.ResizeObserver,
    r = new Set(),
    o = new Set(),
    s = new n((m) => {
      for (const p of m) {
        const { borderBoxSize: b, target: y } = p
        if (y === e.element) {
          if (t) {
            const v = no({ group: e })
            if (v === 0) return
            const C = Fn(e.id)
            if (!C) return
            const w = ml(e),
              x = C.defaultLayoutDeferred ? Lf(w) : C.layout,
              S = TT({ group: e, nextGroupSize: v, prevGroupSize: C.groupSize, prevLayout: x }),
              k = br({ layout: S, panelConstraints: w })
            if (
              !C.defaultLayoutDeferred &&
              hr(C.layout, k) &&
              IT(C.derivedPanelConstraints, w) &&
              C.groupSize === v
            )
              return
            yn(e, {
              defaultLayoutDeferred: !1,
              derivedPanelConstraints: w,
              groupSize: v,
              layout: k,
              separatorToPanels: C.separatorToPanels,
            })
          }
        } else kT(e, y, b)
      }
    })
  ;(s.observe(e.element),
    e.panels.forEach((m) => {
      ;($e(!r.has(m.id), `Panel ids must be unique; id "${m.id}" was used more than once`),
        r.add(m.id),
        m.onResize && s.observe(m.element))
    }))
  const i = no({ group: e }),
    a = ml(e),
    c = e.panels.map(({ id: m }) => m).join(',')
  let u = e.mutableState.defaultLayout
  u && (PT(e.panels, u) || (u = void 0))
  const f = e.mutableState.layouts[c] ?? u ?? Lf(a),
    d = br({ layout: f, panelConstraints: a }),
    g = e.element.ownerDocument
  Lr.set(g, (Lr.get(g) ?? 0) + 1)
  const h = new Map()
  return (
    Yh(e).forEach((m) => {
      m.separator && h.set(m.separator, m.panels)
    }),
    yn(e, {
      defaultLayoutDeferred: i === 0,
      derivedPanelConstraints: a,
      groupSize: i,
      layout: d,
      separatorToPanels: h,
    }),
    e.separators.forEach((m) => {
      ;($e(!o.has(m.id), `Separator ids must be unique; id "${m.id}" was used more than once`),
        o.add(m.id),
        m.element.addEventListener('keydown', Ef))
    }),
    Lr.get(g) === 1 &&
      (g.addEventListener('dblclick', Sf, !0),
      g.addEventListener('pointerdown', Rf, !0),
      g.addEventListener('pointerleave', Of),
      g.addEventListener('pointermove', Mf),
      g.addEventListener('pointerout', Af),
      g.addEventListener('pointerup', zf, !0)),
    function () {
      ;((t = !1),
        Lr.set(g, Math.max(0, (Lr.get(g) ?? 0) - 1)),
        fT(e),
        e.separators.forEach((m) => {
          m.element.removeEventListener('keydown', Ef)
        }),
        Lr.get(g) ||
          (g.removeEventListener('dblclick', Sf, !0),
          g.removeEventListener('pointerdown', Rf, !0),
          g.removeEventListener('pointerleave', Of),
          g.removeEventListener('pointermove', Mf),
          g.removeEventListener('pointerout', Af),
          g.removeEventListener('pointerup', zf, !0)),
        s.disconnect())
    }
  )
}
function MT() {
  const [e, t] = l.useState({}),
    n = l.useCallback(() => t({}), [])
  return [e, n]
}
function Nc(e) {
  const t = l.useId()
  return `${e ?? t}`
}
const Pr = typeof window < 'u' ? l.useLayoutEffect : l.useEffect
function Oo(e) {
  const t = l.useRef(e)
  return (
    Pr(() => {
      t.current = e
    }, [e]),
    l.useCallback((...n) => t.current?.(...n), [t])
  )
}
function _c(...e) {
  return Oo((t) => {
    e.forEach((n) => {
      if (n)
        switch (typeof n) {
          case 'function': {
            n(t)
            break
          }
          case 'object': {
            n.current = t
            break
          }
        }
    })
  })
}
function Fc(e) {
  const t = l.useRef({ ...e })
  return (
    Pr(() => {
      for (const n in e) t.current[n] = e[n]
    }, [e]),
    t.current
  )
}
const i0 = l.createContext(null)
function AT(e, t) {
  const n = l.useRef({ getLayout: () => ({}), setLayout: ET })
  ;(l.useImperativeHandle(t, () => n.current, []),
    Pr(() => {
      Object.assign(n.current, e0({ groupId: e }))
    }))
}
function a0({
  children: e,
  className: t,
  defaultLayout: n,
  disableCursor: r,
  disabled: o,
  elementRef: s,
  groupRef: i,
  id: a,
  onLayoutChange: c,
  onLayoutChanged: u,
  orientation: f = 'horizontal',
  resizeTargetMinimumSize: d = { coarse: 20, fine: 10 },
  style: g,
  ...h
}) {
  const m = l.useRef({ onLayoutChange: {}, onLayoutChanged: {} }),
    p = Oo((P) => {
      hr(m.current.onLayoutChange, P) || ((m.current.onLayoutChange = P), c?.(P))
    }),
    b = Oo((P) => {
      hr(m.current.onLayoutChanged, P) || ((m.current.onLayoutChanged = P), u?.(P))
    }),
    y = Nc(a),
    v = l.useRef(null),
    [C, w] = MT(),
    x = l.useRef({
      lastExpandedPanelSizes: {},
      layouts: {},
      panels: [],
      resizeTargetMinimumSize: d,
      separators: [],
    }),
    S = _c(v, s)
  AT(y, i)
  const k = Oo((P, I) => {
      const T = vr(),
        O = yf(P),
        L = Fn(P)
      if (L) {
        let A = !1
        return (
          T.state === 'active' && (A = T.hitRegions.some((z) => z.group === O)),
          { flexGrow: L.layout[I] ?? 1, pointerEvents: A ? 'none' : void 0 }
        )
      }
      if (n?.[I]) return { flexGrow: n?.[I] }
    }),
    R = Fc({ defaultLayout: n, disableCursor: r }),
    M = l.useMemo(
      () => ({
        get disableCursor() {
          return !!R.disableCursor
        },
        getPanelStyles: k,
        id: y,
        orientation: f,
        registerPanel: (P) => {
          const I = x.current
          return (
            (I.panels = hl(f, [...I.panels, P])),
            w(),
            () => {
              ;((I.panels = I.panels.filter((T) => T !== P)), w())
            }
          )
        },
        registerSeparator: (P) => {
          const I = x.current
          return (
            (I.separators = hl(f, [...I.separators, P])),
            w(),
            () => {
              ;((I.separators = I.separators.filter((T) => T !== P)), w())
            }
          )
        },
        updatePanelProps: (P, { disabled: I }) => {
          const T = x.current.panels.find((A) => A.id === P)
          T && (T.panelConstraints.disabled = I)
          const O = yf(y),
            L = Fn(y)
          O && L && yn(O, { ...L, derivedPanelConstraints: ml(O) })
        },
        updateSeparatorProps: (P, { disabled: I, disableDoubleClick: T }) => {
          const O = x.current.separators.find((L) => L.id === P)
          O && ((O.disabled = I), (O.disableDoubleClick = T))
        },
      }),
      [k, y, w, f, R],
    ),
    j = l.useRef(null)
  return (
    Pr(() => {
      const P = v.current
      if (P === null) return
      const I = x.current
      let T
      if (R.defaultLayout !== void 0 && Object.keys(R.defaultLayout).length === I.panels.length) {
        T = {}
        for (const F of I.panels) {
          const Q = R.defaultLayout[F.id]
          Q !== void 0 && (T[F.id] = Q)
        }
      }
      const O = {
        disabled: !!o,
        element: P,
        id: y,
        mutableState: {
          defaultLayout: T,
          disableCursor: !!R.disableCursor,
          expandedPanelSizes: x.current.lastExpandedPanelSizes,
          layouts: x.current.layouts,
        },
        orientation: f,
        panels: I.panels,
        resizeTargetMinimumSize: I.resizeTargetMinimumSize,
        separators: I.separators,
      }
      j.current = O
      const L = OT(O),
        { defaultLayoutDeferred: A, derivedPanelConstraints: z, layout: D } = Fn(O.id, !0)
      !A && z.length > 0 && (p(D), b(D))
      const $ = zc(y, (F) => {
        const { defaultLayoutDeferred: Q, derivedPanelConstraints: q, layout: se } = F.next
        if (Q || q.length === 0) return
        const Y = O.panels.map(({ id: te }) => te).join(',')
        ;((O.mutableState.layouts[Y] = se),
          q.forEach((te) => {
            if (te.collapsible) {
              const { layout: le } = F.prev ?? {}
              if (le) {
                const ve = wt(te.collapsedSize, se[te.panelId]),
                  X = wt(te.collapsedSize, le[te.panelId])
                ve && !X && (O.mutableState.expandedPanelSizes[te.panelId] = le[te.panelId])
              }
            }
          }))
        const oe = vr().state !== 'active'
        ;(p(se), oe && b(se))
      })
      return () => {
        ;((j.current = null), L(), $())
      }
    }, [o, y, b, p, f, C, R]),
    l.useEffect(() => {
      const P = j.current
      P && ((P.mutableState.defaultLayout = n), (P.mutableState.disableCursor = !!r))
    }),
    E.jsx(i0.Provider, {
      value: M,
      children: E.jsx('div', {
        ...h,
        className: t,
        'data-group': !0,
        'data-testid': y,
        id: y,
        ref: S,
        style: {
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          ...g,
          display: 'flex',
          flexDirection: f === 'horizontal' ? 'row' : 'column',
          flexWrap: 'nowrap',
          touchAction: f === 'horizontal' ? 'pan-y' : 'pan-x',
        },
        children: e,
      }),
    })
  )
}
a0.displayName = 'Group'
function _s(e, t) {
  return `react-resizable-panels:${[e, ...t].join(':')}`
}
function zT({ id: e, panelIds: t, storage: n }) {
  const r = _s(e, []),
    o = n.getItem(r)
  if (o)
    try {
      const s = JSON.parse(o)
      if (t) {
        const i = t.join(','),
          a = s[i]
        if (a && Array.isArray(a.layout) && t.length === a.layout.length) {
          const c = {}
          for (let u = 0; u < t.length; u++) c[t[u]] = a.layout[u]
          return c
        }
      } else {
        const i = Object.keys(s)
        if (i.length === 1) {
          const a = s[i[0]]
          if (a && Array.isArray(a.layout)) {
            const c = i[0].split(',')
            if (c.length === a.layout.length) {
              const u = {}
              for (let f = 0; f < c.length; f++) u[c[f]] = a.layout[f]
              return u
            }
          }
        }
      }
    } catch {}
}
function LT({ debounceSaveMs: e = 100, panelIds: t, storage: n = localStorage, ...r }) {
  const o = t !== void 0,
    s = 'id' in r ? r.id : r.groupId,
    i = _s(s, t ?? []),
    a = l.useSyncExternalStore(
      jT,
      () => n.getItem(i),
      () => n.getItem(i),
    ),
    c = l.useMemo(() => {
      if (a) {
        const p = JSON.parse(a),
          b = Object.values(p)
        if (Array.from(b).every((y) => typeof y == 'number')) return p
      }
    }, [a]),
    u = l.useMemo(() => {
      if (!c) return zT({ id: s, panelIds: t, storage: n })
    }, [c, s, t, n]),
    f = c ?? u,
    d = l.useRef(null),
    g = l.useCallback(() => {
      const p = d.current
      p && ((d.current = null), clearTimeout(p))
    }, [])
  l.useLayoutEffect(
    () => () => {
      g()
    },
    [g],
  )
  const h = l.useCallback(
      (p) => {
        g()
        let b
        o ? (b = _s(s, Object.keys(p))) : (b = _s(s, []))
        try {
          n.setItem(b, JSON.stringify(p))
        } catch (y) {
          console.error(y)
        }
      },
      [g, o, s, n],
    ),
    m = l.useCallback(
      (p) => {
        ;(g(),
          e === 0
            ? h(p)
            : (d.current = setTimeout(() => {
                h(p)
              }, e)))
      },
      [g, e, h],
    )
  return { defaultLayout: f, onLayoutChange: m, onLayoutChanged: h }
}
function jT() {
  return function () {}
}
function DT() {
  return l.useState(null)
}
function l0() {
  return l.useRef(null)
}
function $c() {
  const e = l.useContext(i0)
  return (
    $e(e, 'Group Context not found; did you render a Panel or Separator outside of a Group?'),
    e
  )
}
function NT(e, t) {
  const { id: n } = $c(),
    r = l.useRef({
      collapse: Ta,
      expand: Ta,
      getSize: () => ({ asPercentage: 0, inPixels: 0 }),
      isCollapsed: () => !1,
      resize: Ta,
    })
  ;(l.useImperativeHandle(t, () => r.current, []),
    Pr(() => {
      Object.assign(r.current, Qh({ groupId: n, panelId: e }))
    }))
}
function c0({
  children: e,
  className: t,
  collapsedSize: n = '0%',
  collapsible: r = !1,
  defaultSize: o,
  disabled: s,
  elementRef: i,
  groupResizeBehavior: a = 'preserve-relative-size',
  id: c,
  maxSize: u = '100%',
  minSize: f = '0%',
  onResize: d,
  panelRef: g,
  style: h,
  ...m
}) {
  const p = !!c,
    b = Nc(c),
    y = Fc({ disabled: s }),
    v = l.useRef(null),
    C = _c(v, i),
    { getPanelStyles: w, id: x, orientation: S, registerPanel: k, updatePanelProps: R } = $c(),
    M = d !== null,
    j = Oo((O, L, A) => {
      d?.(O, c, A)
    })
  ;(Pr(() => {
    const O = v.current
    if (O !== null) {
      const L = {
        element: O,
        id: b,
        idIsStable: p,
        mutableValues: { expandToSize: void 0, prevSize: void 0 },
        onResize: M ? j : void 0,
        panelConstraints: {
          groupResizeBehavior: a,
          collapsedSize: n,
          collapsible: r,
          defaultSize: o,
          disabled: y.disabled,
          maxSize: u,
          minSize: f,
        },
      }
      return k(L)
    }
  }, [a, n, r, o, M, b, p, u, f, j, k, y]),
    l.useEffect(() => {
      R(b, { disabled: s })
    }, [s, b, R]),
    NT(b, g))
  const P = () => {
      const O = w(x, b)
      if (O) return JSON.stringify(O)
    },
    I = l.useSyncExternalStore((O) => zc(x, O), P, P)
  let T
  return (
    I
      ? (T = JSON.parse(I))
      : o
        ? (T = { flexGrow: void 0, flexShrink: void 0, flexBasis: o })
        : (T = { flexGrow: 1 }),
    E.jsx('div', {
      ...m,
      'data-disabled': s || void 0,
      'data-panel': !0,
      'data-testid': b,
      id: b,
      ref: C,
      style: { ..._T, display: 'flex', flexBasis: 0, flexShrink: 1, overflow: 'visible', ...T },
      children: E.jsx('div', {
        className: t,
        style: {
          maxHeight: '100%',
          maxWidth: '100%',
          flexGrow: 1,
          overflow: 'auto',
          ...h,
          touchAction: S === 'horizontal' ? 'pan-y' : 'pan-x',
        },
        children: e,
      }),
    })
  )
}
c0.displayName = 'Panel'
const _T = {
  minHeight: 0,
  maxHeight: '100%',
  height: 'auto',
  minWidth: 0,
  maxWidth: '100%',
  width: 'auto',
  border: 'none',
  borderWidth: 0,
  padding: 0,
  margin: 0,
}
function FT() {
  return l.useState(null)
}
function u0() {
  return l.useRef(null)
}
function $T({ layout: e, panelConstraints: t, panelId: n, panelIndex: r }) {
  let o, s
  const i = e[n],
    a = t.find((c) => c.panelId === n)
  if (a) {
    const c = a.maxSize,
      u = a.collapsible ? a.collapsedSize : a.minSize,
      f = [r, r + 1]
    ;((s = br({
      layout: Ho({
        delta: u - i,
        initialLayout: e,
        panelConstraints: t,
        pivotIndices: f,
        prevLayout: e,
      }),
      panelConstraints: t,
    })[n]),
      (o = br({
        layout: Ho({
          delta: c - i,
          initialLayout: e,
          panelConstraints: t,
          pivotIndices: f,
          prevLayout: e,
        }),
        panelConstraints: t,
      })[n]))
  }
  return { valueControls: n, valueMax: o, valueMin: s, valueNow: i }
}
function d0({
  children: e,
  className: t,
  disabled: n,
  disableDoubleClick: r,
  elementRef: o,
  id: s,
  style: i,
  ...a
}) {
  const c = Nc(s),
    u = Fc({ disabled: n, disableDoubleClick: r }),
    [f, d] = l.useState({}),
    [g, h] = l.useState('inactive'),
    m = l.useRef(null),
    p = _c(m, o),
    {
      disableCursor: b,
      id: y,
      orientation: v,
      registerSeparator: C,
      updateSeparatorProps: w,
    } = $c(),
    x = v === 'horizontal' ? 'vertical' : 'horizontal'
  ;(Pr(() => {
    const k = m.current
    if (k !== null) {
      const R = {
          disabled: u.disabled,
          disableDoubleClick: u.disableDoubleClick,
          element: k,
          id: c,
        },
        M = C(R),
        j = CT((I) => {
          h(
            I.next.state !== 'inactive' && I.next.hitRegions.some((T) => T.separator === R)
              ? I.next.state
              : 'inactive',
          )
        }),
        P = zc(y, (I) => {
          const { derivedPanelConstraints: T, layout: O, separatorToPanels: L } = I.next,
            A = L.get(R)
          if (A) {
            const z = A[0],
              D = A.indexOf(z)
            d($T({ layout: O, panelConstraints: T, panelId: z.id, panelIndex: D }))
          }
        })
      return () => {
        ;(j(), P(), M())
      }
    }
  }, [y, c, C, u]),
    l.useEffect(() => {
      w(c, { disabled: n, disableDoubleClick: r })
    }, [n, r, c, w]))
  let S
  return (
    n && !b && (S = 'not-allowed'),
    E.jsx('div', {
      ...a,
      'aria-controls': f.valueControls,
      'aria-disabled': n || void 0,
      'aria-orientation': x,
      'aria-valuemax': f.valueMax,
      'aria-valuemin': f.valueMin,
      'aria-valuenow': f.valueNow,
      children: e,
      className: t,
      'data-separator': n ? 'disabled' : g,
      'data-testid': c,
      id: c,
      ref: p,
      role: 'separator',
      style: {
        flexBasis: 'auto',
        cursor: S,
        ...i,
        flexGrow: 0,
        flexShrink: 0,
        touchAction: 'none',
      },
      tabIndex: n ? void 0 : 0,
    })
  )
}
d0.displayName = 'Separator'
var ee = (...e) => Hb(X0(e)),
  VT = ({ className: e, children: t = 'created', ...n }) =>
    E.jsx('span', { className: ee(e), ...n, children: typeof t == 'string' ? vx(t) : t }),
  HT = E.jsx('span', {}),
  Vc = l.memo(
    ({
      children: e,
      tip: t,
      delay: n = 0,
      closeDelay: r,
      timeout: o,
      defaultOpen: s,
      open: i,
      onOpenChange: a,
      onOpenChangeComplete: c,
      trackCursorAxis: u,
      disableFocusTrigger: f = !1,
      hoverable: d = !1,
      disabled: g,
      sideOffset: h = 8,
      className: m,
      ...p
    }) => {
      const [b, y] = l.useState(s ?? !1),
        v = i ?? b,
        C = l.useMemo(() => ({ delay: n, closeDelay: r, timeout: o }), [n, r, o]),
        w = l.useMemo(
          () => ({ defaultOpen: s, trackCursorAxis: u, onOpenChangeComplete: c, disabled: g }),
          [s, u, c, g],
        ),
        x = l.useCallback(
          (k, R) => {
            ;(f && R.reason === 'trigger-focus') || (y(k), a?.(k, R))
          },
          [f, a],
        ),
        S = l.useMemo(() => ee('z-50', { 'pointer-events-none': !d }, m), [d, m])
      return t
        ? E.jsx(y2, {
            ...C,
            children: E.jsxs(a2, {
              open: v,
              onOpenChange: x,
              ...w,
              children: [
                E.jsx(f2, { 'data-trigger': !0, delay: n, closeDelay: r, render: HT, children: e }),
                E.jsx(g2, {
                  children: E.jsx(h2, {
                    className: S,
                    sideOffset: h,
                    ...p,
                    children: E.jsx(v2, {
                      className: ee(
                        'bg-gray-800/90 text-white dark:bg-black/50 dark:backdrop-blur-sm dark:text-zinc-100 text-xs rounded-md break-words font-body font-medium',
                        'dark:border dark:border-zinc-900',
                        'px-3 py-1 transition duration-300 ease-in-out max-w-72',
                        'data-[side=top]:origin-bottom data-[side=top]:-mb-1',
                        'data-[side=bottom]:origin-top data-[side=bottom]:-mt-1',
                        'data-[side=left]:origin-right',
                        'data-[side=right]:origin-left',
                      ),
                      children: t,
                    }),
                  }),
                }),
              ],
            }),
          })
        : E.jsx('span', { children: e })
    },
  ),
  bl = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  vl = (e) => {
    const t = e.getHours(),
      n = e.getMinutes(),
      r = t >= 12 ? 'PM' : 'AM',
      o = t % 12 || 12,
      s = n.toString().padStart(2, '0')
    return `${o}:${s} ${r}`
  },
  BT = (e) => `${bl[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()} at ${vl(e)}`,
  WT = (e, t, n = new Date()) => {
    const r = n.getTime() - e.getTime(),
      o = Math.floor(r / 6e4),
      s = Math.floor(r / 36e5),
      i = Math.floor(r / 864e5)
    return o < 1
      ? 'Just now'
      : s < 1
        ? `${o}m ago`
        : i < 1
          ? `${s}h ago`
          : i < 2
            ? `Yesterday${t ? '' : ` at ${vl(e)}`}`
            : Math.floor(r / (365.25 * 864e5)) < 1
              ? `${bl[e.getMonth()]} ${e.getDate()}${t ? '' : ` at ${vl(e)}`}`
              : `${bl[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
  },
  GT = ({ date: e, hideTime: t = !1, className: n, ...r }) => {
    const o = l.useMemo(() => new Date(e), [e]),
      s = l.useMemo(() => WT(o, t), [o, t]),
      i = l.useMemo(() => BT(o), [o])
    return E.jsxs(E.Fragment, {
      children: [
        ' ',
        E.jsx(Vc, {
          tip: i,
          children: E.jsx('span', { className: ee('inline-block', n), ...r, children: s }),
        }),
      ],
    })
  },
  UT = ({ className: e, children: t, ...n }) =>
    E.jsx('div', {
      className: ee(
        'truncate break-words text-xs leading-4 font-semibold tracking-normal text-gray-300 dark:text-zinc-400 md:line-clamp-2 md:whitespace-normal',
        e,
      ),
      ...n,
      children: t,
    }),
  ZT = ({ className: e, children: t, ...n }) =>
    t == null
      ? null
      : E.jsxs(E.Fragment, {
          children: [' by ', E.jsx('span', { className: ee(e), ...n, children: t })],
        })
Object.assign(UT, { Action: VT, At: GT, By: ZT })
var KT = l.createContext(null),
  YT = () => l.useContext(KT),
  ai = ({ children: e, className: t, ref: n, ...r }) => {
    const s = YT()?.LinkComponent ?? 'a'
    return E.jsx(s, {
      ref: n,
      className: ee('cursor-pointer text-info underline-offset-2 hover:underline', t),
      ...r,
      children: e,
    })
  }
function qT({ children: e, className: t = '', ...n }) {
  return E.jsx('svg', { className: ee('pointer-events-none fill-current', t), ...n, children: e })
}
var Pa = qT,
  XT = ({ className: e }) =>
    E.jsx('div', {
      className: 'mx-auto inline-block',
      children: E.jsxs('div', {
        className: 'flex items-center',
        children: [
          E.jsx(Pa, {
            viewBox: '0 0 24 24',
            className: ee(
              'opacity-85 mx-1 h-3 w-3',
              e,
              'animate-[pulse_1.5s_ease-in-out_infinite]',
            ),
            children: E.jsx('circle', { cx: '12', cy: '12', r: '12' }),
          }),
          E.jsx(Pa, {
            viewBox: '0 0 24 24',
            className: ee(
              'opacity-85 mx-1 h-3 w-3',
              e,
              'animate-[pulse_1.5s_ease-in-out_0.5s_infinite]',
            ),
            children: E.jsx('circle', { cx: '12', cy: '12', r: '12' }),
          }),
          E.jsx(Pa, {
            viewBox: '0 0 24 24',
            className: ee(
              'opacity-85 mx-1 h-3 w-3',
              e,
              'animate-[pulse_1.5s_ease-in-out_1.5s_infinite]',
            ),
            children: E.jsx('circle', { cx: '12', cy: '12', r: '12' }),
          }),
        ],
      }),
    }),
  Hc = ({
    variant: e = 'default',
    size: t = 'md',
    shape: n = 'default',
    type: r = 'button',
    className: o,
    isLoading: s = !1,
    children: i,
    onClick: a,
    asLink: c = !1,
    href: u,
    form: f,
    full: d = !1,
    disabled: g,
    ref: h,
    ...m
  }) => {
    const p = e === 'muted' && !g,
      b = e === 'primary' && !g,
      y = e === 'success' && !g,
      v = e === 'secondary' && !g,
      C = e === 'info' && !g,
      w = e === 'danger' && !g,
      x = e === 'primary' || e === 'success' || e === 'info' || e === 'danger',
      S = n === 'pill',
      k = ee(
        'flex flex-col items-center group rounded outline-none font-semibold',
        'cursor-pointer select-none transition duration-200 ease-in-out',
        'focus-visible:ring-2 focus-visible:ring-info/75',
        'text-gray dark:text-zinc-50 focus-visible:bg-gray-100 dark:focus-visible:bg-zinc-800',
        {
          'text-white focus-visible:bg-success': y,
          'text-white focus-visible:bg-primary': b,
          'text-white focus-visible:bg-info': C,
          'focus-visible:bg-gray-50': p,
          'text-white focus-visible:bg-danger': w,
          'text-gray-400 dark:text-zinc-200 focus-visible:bg-white dark:focus-visible:bg-zinc-800 focus-visible:rounded-md':
            v,
          'text-gray-300 dark:text-zinc-400 cursor-not-allowed': g && !x,
          'text-white/90 dark:text-zinc-100 cursor-not-allowed': g && x,
          'text-gray-200 dark:text-zinc-500': e === 'muted' && g,
          'block text-center': c,
          'rounded-lg': t === 'lg' && !S,
          'rounded-full focus-visible:rounded-full': S,
          'w-full': d,
        },
      ),
      R = (P) => {
        typeof a == 'function' && (c || P.preventDefault(), a(P))
      },
      M = ({ children: P }) =>
        E.jsx('div', {
          className: ee(
            'whitespace-nowrap rounded px-3 py-1 font-body text-xs font-semibold tracking-normal',
            'bg-gray-100 group-hover:bg-gray-200/75 dark:bg-zinc-800 dark:group-hover:bg-zinc-900',
            'transition duration-200 ease-in-out',
            {
              'bg-primary group-hover:bg-primary-darken group-active:bg-primary-darken dark:bg-primary dark:group-hover:bg-primary-darken dark:group-active:bg-primary-darken':
                b,
              'bg-success group-hover:bg-success-darken group-active:bg-success-darken dark:bg-success dark:group-hover:bg-success-darken dark:group-active:bg-success-darken':
                y,
              'bg-info group-hover:bg-info group-active:bg-info dark:bg-info dark:group-hover:bg-info dark:group-active:bg-info':
                C,
              'bg-gray-50 group-hover:bg-gray-100 group-active:bg-gray-100 dark:bg-zinc-800 dark:group-hover:bg-zinc-900 dark:group-active:bg-zinc-900':
                p,
              'bg-danger group-hover:bg-danger-darken group-active:bg-danger-darken dark:bg-danger dark:group-hover:bg-danger-darken dark:group-active:bg-danger-darken':
                w,
              'border border-gray-100 bg-white dark:bg-zinc-900 dark:border-zinc-800 group-hover:bg-gray-50 dark:group-hover:bg-zinc-800 group-active:bg-gray-50 dark:group-active:bg-zinc-800 dark:group-hover:border-zinc-800':
                v,
              'bg-primary/50 dark:bg-primary/45': g && e === 'primary',
              'bg-success/50 dark:bg-success/45': g && e === 'success',
              'bg-info/50 dark:bg-info/45': g && e === 'info',
              'bg-danger/50 dark:bg-danger/45': g && e === 'danger',
              'dark:bg-zinc-900 group-hover:bg-gray-100 dark:group-hover:bg-zinc-900 dark:group-active:bg-zinc-900':
                g && !x,
              'group-active:scale-95': !g,
              'px-1.5 py-px text-2xs': t === 'sm',
              'px-4 py-2 text-base': t === 'lg',
              'rounded-lg': t === 'lg' && !S,
              'rounded-full': S,
              'px-8': S && t === 'lg',
              'w-full': d,
            },
            o,
          ),
          children: P,
        }),
      j = s
        ? E.jsx(M, {
            children: E.jsx(XT, {
              className: ee({
                'h-2 w-1': t === 'sm',
                'h-2 w-1.5': t === 'md',
                'h-3 w-2': t === 'lg',
              }),
            }),
          })
        : E.jsx(M, { children: i })
    return c
      ? E.jsx(ai, {
          ref: h,
          href: g ? '#' : u,
          'aria-disabled': g,
          onClick: R,
          className: ee('text-inherit no-underline hover:no-underline', k),
          ...m,
          children: j,
        })
      : E.jsx('button', {
          ref: h,
          'aria-label': s ? 'Loading...' : '',
          type: r,
          form: r === 'submit' ? f : void 0,
          onClick: R,
          className: k,
          ...m,
          disabled: g,
          children: j,
        })
  }
l.createContext(null)
var Bc = l.createContext({}),
  JT = ({
    size: e = 'md',
    variant: t = 'default',
    disabled: n = !1,
    invalid: r = !1,
    itemToStringLabel: o,
    children: s,
  }) => {
    const i = l.useMemo(
      () => ({ size: e, variant: t, disabled: n, invalid: r, itemToStringLabel: o }),
      [e, t, n, r, o],
    )
    return E.jsx(Bc.Provider, { value: i, children: s })
  },
  Di = () => l.useContext(Bc)
Bc.Consumer
var f0 = ({ children: e, ...t }) => E.jsx(nR, { ...t, children: e }),
  p0 = ({ className: e, children: t, nativeButton: n = !1, render: r, ...o }) => {
    const s = (i) =>
      E.jsx('div', {
        ...i,
        tabIndex: -1,
        className: ee('block outline-none w-full', e),
        children: i.children,
      })
    return E.jsx(JE, {
      nativeButton: n,
      render: n ? r : s,
      className: n ? e : '',
      ...o,
      children: t,
    })
  },
  g0 = ({ children: e, ...t }) => E.jsx(ER, { ...t, children: e }),
  QT = ({ placeholder: e = 'Select Option', icon: t, children: n }) => {
    const { size: r, variant: o, disabled: s, invalid: i } = Di()
    return E.jsxs(p0, {
      nativeButton: !0,
      render: void 0,
      tabIndex: 0,
      className: ee(
        'group [&:has(~[data-input])]:data-[popup-open]:hidden',
        'w-full rounded flex gap-1 items-center text-left',
        'outline-none font-medium',
        'data-[popup-open]:data-[popup-side="top"]:rounded-t-none',
        'data-[popup-open]:data-[popup-side="bottom"]:rounded-b-none',
        {
          'px-1': o !== 'ghost',
          'focus-visible:ring-2 ring-info/75': !i,
          'border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-visible:ring-1 focus-visible:border-info':
            o === 'secondary' && !i,
          'bg-gray-50 dark:bg-zinc-800': (o === 'default' || (s && o === 'secondary')) && !i,
          'bg-gray-100 dark:bg-zinc-800': o === 'muted' && !i,
          'border border-[#FFD4E0] bg-[#FFD4E0]/25 focus-visible:border-[#FFD4E0] focus-visible:ring-2 ring-[#FFD4E0] dark:border-danger/50 dark:bg-danger/25 dark:ring-danger/50 dark:focus-visible:border-danger/50':
            i && !s,
          'h-9': r === 'xl' && o !== 'ghost',
          'h-7': r === 'lg' && o !== 'ghost',
          'h-6': r === 'md' && o !== 'ghost',
          'h-5': r === 'sm' && o !== 'ghost',
          'text-lg': r === 'xl',
          'text-sm': r === 'lg',
          'text-xs': r === 'md',
          'text-2xs': r === 'sm',
          'cursor-not-allowed': s,
        },
      ),
      children: [
        t &&
          E.jsx(t, {
            'data-icon': !0,
            className: ee('text-gray-300 dark:text-zinc-400 shrink-0', {
              'group-hover:text-gray-400 dark:group-hover:text-zinc-100': !s,
              'text-gray-200 dark:text-zinc-500': s,
              'size-2.5': r === 'sm',
              'size-3.5': r === 'md' || r === 'lg',
              'size-4': r === 'xl',
            }),
          }),
        E.jsx('div', {
          className: ee('truncate dark:text-zinc-100', {
            'text-gray-400': o === 'secondary',
            'text-gray-500': o !== 'secondary' && o !== 'ghost',
            'text-inherit': o === 'ghost',
            'group-hover:text-gray-500 dark:group-hover:text-zinc-50': !s,
            'text-gray-200 dark:text-zinc-400': s,
            'pl-1': !t && o !== 'ghost',
          }),
          children: E.jsx(g0, {
            placeholder: e,
            className: ee('truncate dark:text-zinc-100', {
              'text-gray-400': o === 'secondary',
              'text-gray-500': o !== 'secondary' && o !== 'ghost',
              'text-inherit': o === 'ghost',
              'group-hover:text-gray-500 dark:group-hover:text-zinc-50': !s,
              'text-gray-200 dark:text-zinc-400': s,
            }),
          }),
        }),
        !!n && n,
        E.jsx(f0, {
          className: ee('ml-auto', {
            'opacity-0 group-hover:opacity-100 group-data-[popup-open]:opacity-100': o === 'ghost',
          }),
          children: E.jsx(Zm, { className: 'size-3.5 text-gray-200 dark:text-zinc-400' }),
        }),
      ],
    })
  },
  eP = l.memo(
    ({
      children: e,
      size: t = 'md',
      variant: n = 'default',
      invalid: r = !1,
      onOpenChange: o,
      ...s
    }) => {
      if (!s.items) throw new Error('Combobox requires an `items` prop.')
      const [i, a] = l.useState(''),
        c = l.useCallback(
          (u, f) => {
            ;(u && a(''), o?.(u, f))
          },
          [o],
        )
      return E.jsx(JT, {
        disabled: !!s.disabled,
        size: t,
        variant: n,
        invalid: r,
        itemToStringLabel: s.itemToStringLabel,
        children: E.jsx(SR, {
          'data-variant': n,
          'data-size': t,
          'data-invalid': r || void 0,
          inputValue: i,
          onInputValueChange: a,
          onOpenChange: c,
          ...s,
          children: e,
        }),
      })
    },
  ),
  tP = ({ className: e, children: t = 'No matches', ...n }) =>
    E.jsx(CR, {
      className: ee(
        'w-full [[data-empty]_&]:py-4 text-center text-gray-300 text-xs dark:text-zinc-400',
        e,
      ),
      ...n,
      children: t,
    }),
  nP = ({ children: e, ...t }) => E.jsx(bR, { ...t, children: e }),
  rP = ({ className: e, children: t, ...n }) =>
    E.jsx(vR, {
      className: ee(
        'px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-300 font-body dark:text-zinc-500',
        e,
      ),
      ...n,
      children: t,
    }),
  oP = ({ className: e, ...t }) => {
    const { size: n } = Di(),
      r = l.useRef(null),
      o = l.useRef(null),
      s = l.useCallback((i) => {
        ;(r.current && (r.current.disconnect(), (r.current = null)),
          i &&
            (i.hasAttribute('data-popup-open') && ((o.current = document.activeElement), i.focus()),
            (r.current = new MutationObserver((a) => {
              for (const c of a)
                c.type === 'attributes' &&
                  c.attributeName === 'data-popup-open' &&
                  (i.hasAttribute('data-popup-open')
                    ? ((o.current = document.activeElement), i.focus())
                    : (o.current?.focus(), (o.current = null)))
            })),
            r.current.observe(i, { attributes: !0 })))
      }, [])
    return E.jsx(tR, {
      ref: s,
      'data-input': !0,
      className: ee(
        'w-full rounded border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-body font-medium text-gray-400 dark:text-zinc-100 outline-none',
        'placeholder:text-gray-200 dark:placeholder:text-zinc-300 px-1.5',
        'focus-visible:border-info focus-visible:ring-2 focus-visible:ring-info/60',
        'hidden data-[popup-open]:block',
        'data-[popup-open]:ring-0 data-[popup-open]:border-gray-200 dark:data-[popup-open]:border-zinc-500',
        'data-[popup-open]:data-[popup-side="top"]:rounded-t-none',
        'data-[popup-open]:data-[popup-side="bottom"]:rounded-b-none',
        'disabled:bg-gray-50 disabled:text-gray-200 dark:disabled:bg-zinc-950 dark:disabled:text-zinc-400',
        {
          'h-5 text-2xs': n === 'sm',
          'h-6 text-xs': n === 'md',
          'h-7 text-xs': n === 'lg',
          'h-9 text-base': n === 'xl',
        },
        e,
      ),
      ...t,
    })
  },
  sP = ({ className: e, children: t, value: n, ...r }) => {
    const { itemToStringLabel: o } = Di(),
      s = l.useRef(null),
      [i, a] = l.useState(!1)
    l.useEffect(() => {
      const f = s.current
      if (!f) return
      const d = () => {
        const h = [f, ...f.querySelectorAll('*')]
        a(h.some((m) => m.scrollWidth > m.clientWidth))
      }
      d()
      const g = new ResizeObserver(d)
      return (g.observe(f), () => g.disconnect())
    }, [t])
    const c = typeof n == 'string' ? n : (o?.(n) ?? null),
      u = i ? c : null
    return E.jsxs(wR, {
      className: ee(
        'group flex w-full items-center px-2 py-1 text-left gap-1 text-xs',
        'font-body font-medium text-gray-400 dark:text-zinc-300 outline-none',
        'hover:bg-gray-50 hover:text-gray-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
        'data-[highlighted]:bg-gray-50 data-[highlighted]:text-gray-500 dark:data-[highlighted]:bg-zinc-900 dark:data-[highlighted]:text-zinc-100',
        'data-[selected]:text-gray-500 dark:data-[selected]:text-zinc-500 dark:data-[selected]:text-white cursor-pointer',
        'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
        e,
      ),
      value: n,
      ...r,
      children: [
        E.jsx('div', {
          ref: s,
          className: 'flex-1 truncate',
          children: E.jsx(Vc, {
            tip: u,
            side: 'right',
            sideOffset: 12,
            delay: 500,
            children: E.jsx(E.Fragment, { children: t }),
          }),
        }),
        E.jsx(Um, {
          className:
            'size-4 text-gray-300 dark:text-zinc-400 hidden group-data-[highlighted]:block group-hover:hidden group-data-[highlighted]:group-hover:hidden group-data-[selected]:hidden',
        }),
      ],
    })
  },
  iP = ({ children: e, ...t }) => E.jsx(RR, { ...t, children: e }),
  aP = ({ className: e, children: t, ...n }) =>
    E.jsx(iR, {
      className: ee('hide-scrollbar max-h-32 overflow-auto outline-none', e),
      ...n,
      children: t,
    }),
  lP = ({
    className: e,
    anchor: t,
    positionMethod: n,
    side: r,
    sideOffset: o,
    align: s,
    alignOffset: i,
    collisionBoundary: a,
    collisionPadding: c,
    sticky: u,
    arrowPadding: f,
    disableAnchorTracking: d,
    collisionAvoidance: g,
    children: h,
    ...m
  }) => {
    const p = {
        className: 'outline-none z-50',
        side: r || 'bottom',
        align: s || 'start',
        sideOffset: o ?? -1,
        anchor: t,
        positionMethod: n,
        alignOffset: i,
        collisionBoundary: a,
        collisionPadding: c,
        sticky: u,
        arrowPadding: f,
        disableAnchorTracking: d,
        collisionAvoidance: g,
      },
      b = ee(
        'w-[var(--anchor-width)] font-body divide-gray-100 dark:divide-zinc-800 rounded-b border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-1',
        'transition duration-300 ease-in-out',
        'focus:outline-none',
        'data-[side=bottom]:rounded-t-none data-[side=bottom]:rounded-b',
        'data-[side=top]:rounded-b-none data-[side=top]:rounded-t',
        e,
      )
    return E.jsx(lR, {
      children: E.jsx(pR, { ...p, children: E.jsx(mR, { className: b, ...m, children: h }) }),
    })
  }
Object.assign(eP, {
  Empty: tP,
  Group: nP,
  GroupLabel: rP,
  Input: oP,
  Item: sP,
  ItemIndicator: iP,
  List: aP,
  Popover: lP,
  Trigger: p0,
  Button: QT,
  Value: g0,
  Icon: f0,
  useCombobox: Di,
})
var cP = ({ children: e, className: t, ...n }) =>
    E.jsx('div', {
      className: ee('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end p-2 pt-4', t),
      ...n,
      children: e,
    }),
  li = l.createContext(null),
  m0 = () => {
    const e = l.useContext(li)
    if (!e) throw new Error('Dialog compound components must be used within a Dialog.Provider')
    return e
  },
  uP = ({ children: e, className: t, variant: n, ...r }) => {
    const { onConfirm: o, variant: s } = m0()
    return E.jsx(Hc, {
      variant: n ?? s,
      size: 'md',
      className: ee('w-full flex-1 sm:w-auto sm:flex-none font-medium', t),
      onClick: o,
      'data-testid': 'confirm-dialog-confirm-button',
      ...r,
      children: e,
    })
  },
  dP = ({ children: e, className: t, variant: n = 'secondary', ...r }) => {
    const { onDismiss: o } = m0()
    return E.jsx(Hc, {
      variant: n,
      size: 'md',
      className: ee('w-full flex-1 sm:w-auto sm:flex-none font-medium', t),
      onClick: o,
      ...r,
      children: e,
    })
  },
  fP = ({ children: e, className: t, ...n }) =>
    E.jsx('div', {
      className: ee('p-2 pt-4 font-body text-sm font-medium text-gray-400 dark:text-zinc-200', t),
      ...n,
      children: e,
    }),
  h0 = l.createContext(null),
  pP = ({ children: e }) => {
    const [t, n] = l.useState(null),
      [r, o] = l.useState(!1),
      s = l.useRef(null),
      i = l.useRef(!1),
      a = l.useCallback(
        (g) =>
          new Promise((h) => {
            ;((i.current = !1), (s.current = h), n(g), o(!0))
          }),
        [],
      ),
      c = l.useCallback(() => {
        ;(i.current || ((i.current = !0), s.current?.(!0)), o(!1))
      }, []),
      u = l.useCallback(() => {
        ;(i.current || ((i.current = !0), s.current?.(!1)), o(!1))
      }, []),
      f = l.useCallback(
        (g) => {
          g || u()
        },
        [u],
      ),
      d = { onConfirm: c, onDismiss: u, variant: 'danger' }
    return E.jsxs(h0.Provider, {
      value: { confirm: a },
      children: [
        e,
        E.jsx(wE, {
          open: r,
          onOpenChange: f,
          children: E.jsxs(LE, {
            children: [
              E.jsx(TE, {
                className: ee(
                  'fixed inset-0 z-[1000] bg-gray-900/70 dark:bg-black/50 backdrop-blur',
                  'transition-opacity duration-200 ease-in-out',
                  'data-[starting-style]:opacity-0',
                  'data-[ending-style]:opacity-0',
                ),
              }),
              E.jsx(zE, { children: E.jsx(li.Provider, { value: d, children: t }) }),
            ],
          }),
        }),
      ],
    })
  },
  gP = () => {
    const e = l.useContext(h0)
    if (!e) throw new Error('useDialog must be used within a Dialog.Provider')
    return e
  },
  mP = ({ children: e, variant: t, className: n, ...r }) => {
    const o = l.useContext(li),
      s = {
        onConfirm: o?.onConfirm ?? (() => {}),
        onDismiss: o?.onDismiss ?? (() => {}),
        variant: t,
      }
    return E.jsx(li.Provider, {
      value: s,
      children: E.jsx('div', {
        className: ee(
          'fixed left-1/2 top-[15vh] z-[1001] -translate-x-1/2',
          'flex w-[calc(100%-2rem)] max-w-sm flex-col rounded-xl bg-white shadow-xl outline-none',
          'dark:bg-zinc-900 dark:text-zinc-100 p-1.5',
          'transition-all duration-100',
          'data-[starting-style]:scale-50 data-[starting-style]:opacity-0',
          'data-[ending-style]:scale-50 data-[ending-style]:opacity-0',
          n,
        ),
        ...r,
        children: e,
      }),
    })
  },
  hP = ({ children: e, className: t, ...n }) =>
    E.jsx('div', {
      className: ee(
        'border-b border-gray-100 dark:border-zinc-800 px-3 py-2 text-base font-bold text-gray dark:text-zinc-100',
        t,
      ),
      ...n,
      children: e,
    })
Object.assign(mP, {
  Provider: pP,
  Title: hP,
  Message: fP,
  Actions: cP,
  Confirm: uP,
  Dismiss: dP,
  useDialog: gP,
})
var b0 = l.createContext({ size: 'md' }),
  bP = ({ variant: e = 'info', children: t }) => {
    const { size: n } = l.useContext(b0),
      r = t != null && n !== 'sm'
    return E.jsx('span', {
      'aria-hidden': 'true',
      className: ee(
        'absolute flex items-center justify-center rounded-full font-bold text-white select-none',
        {
          'bg-info': e === 'info',
          'bg-success': e === 'success',
          'bg-primary': e === 'primary',
          'bg-danger': e === 'danger',
          'bg-warning': e === 'warning',
        },
        r
          ? {
              '-right-2 -top-2 h-4 min-w-4 px-1 text-2xs': n === 'xl',
              '-right-1.5 -top-1.5 h-3.5 min-w-3.5 px-0.5 text-3xs': n === 'lg',
              '-right-1 -top-1 h-3 min-w-3 px-0.5 text-3xs': n === 'md',
            }
          : {
              '-right-0.5 -top-0.5 size-2.5': n === 'xl',
              '-right-0.5 -top-0.5 size-2': n === 'lg',
              '-right-0.5 -top-0.5 size-1.5': n === 'md',
              '-right-px -top-px size-1': n === 'sm',
            },
      ),
      children: r && t,
    })
  },
  vP = ({
    variant: e = 'default',
    size: t = 'md',
    disabled: n = !1,
    children: r,
    className: o,
    toggled: s = !1,
    invalid: i = !1,
    deemphasize: a = !1,
    ref: c,
    ...u
  }) =>
    E.jsx(b0.Provider, {
      value: { size: t },
      children: E.jsx('button', {
        ref: c,
        type: 'button',
        disabled: n,
        'data-disabled': n,
        'data-toggled': s || void 0,
        'data-invalid': i || void 0,
        ...u,
        className: ee(
          'flex justify-center items-center rounded-sm shrink-0',
          'transition-transform duraiton-150 ease-in-out',
          'outline-none focus-visible:ring-2 ring-info/75',
          {
            'bg-[#FFD4E0]/50 border border-[#FFD4E0]': i && !n,
            '!bg-info-lighten text-gray-500 dark:!bg-info/20 dark:ring-1 dark:ring-info/40 dark:text-zinc-50':
              s && !i,
            'hover:bg-gray-100 dark:hover:bg-zinc-900 active:bg-gray-100 dark:active:bg-zinc-900 active:scale-95':
              !s && !n && !i && e !== 'secondary',
            'border border-gray-100 bg-white dark:border-zinc-800 dark:bg-zinc-900':
              e === 'secondary' && !i,
            'text-gray-400 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 active:bg-gray-50 dark:active:bg-zinc-800 active:scale-95':
              e === 'secondary' && !n && !s,
            'hover:!bg-info-lighten/80 dark:hover:!bg-info/25 active:!bg-info-lighten/90 dark:active:!bg-info/30 active:scale-95':
              s && !n && !i,
            'text-gray-500 active:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:text-zinc-100':
              e === 'default' && !a && !n && !s,
            'text-gray-300 hover:text-gray-400 active:text-gray-500 dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:text-zinc-100':
              e === 'default' && a && !n && !s,
            'text-gray-300 hover:text-gray-400 active:text-gray-400 dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:text-zinc-100':
              e === 'muted' && !a && !n && !s,
            'text-gray-200 hover:text-gray-300 active:text-gray-400 dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:text-zinc-100':
              e === 'muted' && a && !n && !s,
            'text-gray-200 hover:bg-transparent active:bg-transparent active:scale-100 active:text-gray-200 cursor-not-allowed dark:text-zinc-400 dark:hover:bg-transparent dark:active:bg-transparent dark:active:scale-100 dark:active:text-zinc-400':
              n,
            'hover:bg-white active:bg-white dark:hover:bg-zinc-900 dark:active:bg-zinc-900':
              e === 'secondary' && n,
            'size-8 [&_svg]:size-6 rounded': t === 'xl',
            'size-6 [&_svg]:size-4': t === 'lg',
            'size-5 [&_svg]:size-3.5': t === 'md',
            'size-4 [&_svg]:size-2.5': t === 'sm',
          },
          o,
        ),
        children: r,
      }),
    }),
  Wc = Object.assign(vP, { Indicator: bP }),
  OO = ({
    type: e = 'text',
    name: t,
    id: n,
    value: r,
    className: o,
    disabled: s = !1,
    variant: i = 'default',
    icon: a,
    iconPosition: c = 'left',
    suffix: u,
    prefix: f,
    size: d = 'lg',
    textEnd: g = !1,
    invalid: h = !1,
    showSpinner: m = !1,
    copyable: p = !1,
    onCopyError: b,
    onValueChange: y,
    ref: v,
    ...C
  }) => {
    const [w, x] = l.useState(!1),
      S = l.useRef(null)
    l.useEffect(
      () => () => {
        S.current && clearTimeout(S.current)
      },
      [],
    )
    const k = () => navigator.clipboard.writeText(typeof r == 'string' ? r : String(r ?? '')),
      R = () => {
        ;(S.current && clearTimeout(S.current), (S.current = setTimeout(() => x(!1), 1500)))
      },
      M = async () => {
        try {
          ;(await k(), x(!0), R())
        } catch {
          b?.()
        }
      },
      j = (A) => {
        const z = A.target.value
        if (e === 'number') {
          if (z === '') {
            y?.(null)
            return
          }
          if (isNaN(Number(z))) return
        }
        ;(y?.(z), C?.onChange?.(A))
      },
      P = (A) => {
        const { min: z, max: D } = C,
          $ = A.target.value
        ;(z && Number($) < Number(z) && y?.(String(z)),
          D && Number($) > Number(D) && y?.(String(D)),
          C?.onBlur?.(A))
      },
      I = ee(
        {
          'text-gray-400 dark:text-zinc-400': (i === 'muted' || i === 'default') && !s,
          'text-gray-200 dark:text-zinc-400': i === 'secondary' || s,
        },
        c === 'left'
          ? { 'ml-1 w-3': d === 'md', '-mr-1 ml-1.5 w-4': d === 'lg', '-mr-1 ml-2 w-5': d === 'xl' }
          : {
              'mr-1 w-3': d === 'md',
              '-ml-1 mr-1.5 w-4': d === 'lg',
              '-ml-1 mr-2 w-5': d === 'xl',
            },
      ),
      T =
        e === 'search' && !a
          ? E.jsx(Xm, { 'data-icon': !0, className: I })
          : a
            ? E.jsx(a, { 'data-icon': !0, className: I })
            : null
    let O = C.placeholder
    !C.placeholder && e === 'search' && (O = 'Search')
    const L = {
      inputMode: 'numeric',
      step: 'any',
      autoComplete: 'off',
      autoCorrect: 'off',
      spellCheck: !1,
      'data-lpignore': !0,
      'aria-roledescription': 'Number field',
    }
    return E.jsxs('div', {
      className: ee(
        'relative flex w-full flex-nowrap items-stretch font-medium',
        { 'group/input': p },
        {
          'focus-within:ring-2 ring-info/50 dark:ring-info/75': !h,
          'text-gray-400 dark:text-zinc-100 border border-gray-200 bg-white focus-within:border-info dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:border-info':
            i === 'secondary',
          'bg-gray-50 dark:bg-zinc-800': i === 'default',
          'bg-gray-100 dark:bg-zinc-800': i === 'muted',
          'bg-transparent': i === 'ghost',
          'text-gray-500 dark:text-zinc-100': (i === 'default' || i === 'muted') && !s,
          'text-inherit': i === 'ghost' && !s,
          'text-gray-200 dark:text-zinc-400': s,
          'h-6 rounded text-xs': d === 'md',
          'h-7 rounded-md text-sm': d === 'lg',
          'h-9 rounded-md text-lg': d === 'xl',
          'border border-[#FFD4E0] dark:border-danger/50 bg-[#FFD4E0]/25 dark:bg-danger/25 focus-within:border-[#FFD4E0] dark:focus-within:border-danger focus-within:ring-2 ring-[#FFD4E0] dark:ring-danger/50':
            h && !s,
        },
        o,
      ),
      'data-disabled': s || void 0,
      'data-invalid': h || void 0,
      children: [
        f &&
          E.jsx('div', {
            'data-prefix': !0,
            className: ee('flex items-center text-white font-medium', {
              'bg-gray-200': i === 'secondary' || i === 'muted',
              'dark:bg-zinc-800': i === 'secondary',
              'dark:bg-zinc-700/50': i === 'muted',
              'bg-gray-100 dark:bg-zinc-800/50': i === 'default',
              'bg-[#FFD4E0]': h && !s,
              'rounded-l-sm px-1.5 text-xs': d === 'md',
              'rounded-l px-1.5 text-sm': d === 'lg',
              'rounded-l px-2': d === 'xl',
            }),
            children: f,
          }),
        c === 'left' && T,
        E.jsx('input', {
          ref: v,
          type: e,
          'data-testid': n,
          'data-input': !0,
          'data-1p-ignore': !0,
          id: n,
          placeholder: O,
          name: t,
          value: r,
          autoComplete: 'off',
          className: ee('w-px flex-1 grow bg-transparent leading-normal', 'outline-none', {
            'search-close-icon': e === 'search',
            'cursor-not-allowed select-none': s,
            'text-end': g,
            'placeholder-gray-200 dark:placeholder-zinc-400': i === 'secondary',
            'placeholder-gray-300 dark:placeholder-zinc-400':
              i === 'default' || i === 'muted' || i === 'ghost',
            'px-1': d === 'md' && i !== 'ghost',
            'pl-2 pr-1.5': d === 'lg' && i !== 'ghost',
            'px-2': d === 'xl' && i !== 'ghost',
            'px-0': i === 'ghost',
            'appearance-none': e === 'number' && !m,
          }),
          onChange: j,
          onBlur: P,
          disabled: s,
          ...(e === 'number' ? L : {}),
          ...C,
        }),
        c === 'right' && T,
        p &&
          E.jsx('div', {
            className: 'flex items-center',
            children: E.jsx(Vc, {
              tip: 'Copy to clipboard',
              disabled: !r,
              children: E.jsx(Wc, {
                size: 'sm',
                variant: 'muted',
                'aria-label': 'Copy to clipboard',
                onClick: M,
                className: ee(
                  'transition-opacity group-hover/input:opacity-100 focus:opacity-100',
                  r ? 'opacity-0' : 'invisible',
                ),
                children: w ? E.jsx(Km, {}) : E.jsx(Ym, {}),
              }),
            }),
          }),
        u &&
          E.jsx('div', {
            'data-suffix': !0,
            className: ee('flex items-center text-white font-medium', {
              'bg-gray-200': i === 'secondary' || i === 'muted',
              'dark:bg-zinc-800': i === 'secondary',
              'dark:bg-zinc-700/50': i === 'muted',
              'bg-gray-100 dark:bg-zinc-800/50': i === 'default',
              'bg-[#FFD4E0]': h && !s,
              'rounded-r-sm px-1.5 text-xs': d === 'md',
              'rounded-r px-1.5': d === 'lg',
              'rounded-r px-2': d === 'xl',
            }),
            children: u,
          }),
      ],
    })
  },
  MO = ({ children: e, size: t = 'md', variant: n = 'default', className: r }) =>
    E.jsx('span', {
      className: ee(
        'inline-flex items-center justify-center whitespace-nowrap border font-semibold tracking-wide',
        {
          'h-3 px-1 text-3xs rounded-sm': t === 'sm',
          'h-4 px-1.5 text-2xs rounded': t === 'md',
          'h-6 px-2 text-xs rounded': t === 'lg',
        },
        {
          'border-gray bg-gray/25 text-gray dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-100':
            n === 'default',
          'border-gray-300 bg-gray-300/25 text-gray-400 dark:border-zinc-700 dark:bg-zinc-700/25 dark:text-zinc-200':
            n === 'secondary',
          'border-success bg-success/25 text-success dark:text-success': n === 'success',
          'border-primary bg-primary/25 text-primary dark:text-primary': n === 'primary',
          'border-info bg-info/25 text-info dark:text-info': n === 'info',
          'border-danger bg-danger/25 text-danger dark:text-danger': n === 'danger',
        },
        'data-[content]:leading-none',
        r,
      ),
      children: E.jsx('span', { 'data-content': !0, children: e }),
    }),
  v0 = l.createContext({ breakpoint: 'md' }),
  yP = () => l.useContext(v0),
  xP = ({ children: e, breakpoint: t = 'md' }) =>
    E.jsx(v0.Provider, { value: { breakpoint: t }, children: e }),
  wP = ({ children: e, breakpoint: t = 'md', className: n }) =>
    E.jsx(xP, {
      breakpoint: t,
      children: E.jsx('ul', {
        className: ee(
          'flex whitespace-nowrap text-sm font-medium text-gray-300 dark:text-zinc-500',
          n,
        ),
        children: e,
      }),
    }),
  CP = ({ to: e, children: t, current: n = !1, previous: r = !1, className: o }) => {
    const { breakpoint: s } = yP()
    return E.jsx('li', {
      className: ee(
        'hidden items-center',
        {
          'sm:flex': s === 'sm',
          'md:flex': s === 'md',
          'lg:flex': s === 'lg',
          'xl:flex': s === 'xl',
          flex: r,
          hidden: !r,
        },
        o,
      ),
      children: n
        ? E.jsx('span', {
            'data-content': !0,
            className: 'flex truncate pl-2 text-gray-300 dark:text-zinc-500',
            children: t,
          })
        : E.jsxs(E.Fragment, {
            children: [
              E.jsx(ai, {
                href: e,
                'data-content': !0,
                className: ee(
                  'no-underline hover:no-underline',
                  'flex items-center rounded px-2 text-gray-300 dark:text-zinc-500',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-info/75',
                ),
                children: E.jsxs(E.Fragment, {
                  children: [
                    r &&
                      E.jsx(Hn, {
                        'data-previous': !0,
                        className: ee(
                          'flex size-5 rotate-180 truncate text-gray-300 dark:text-zinc-500',
                          {
                            'sm:hidden': s === 'sm',
                            'md:hidden': s === 'md',
                            'lg:hidden': s === 'lg',
                            'xl:hidden': s === 'xl',
                          },
                        ),
                      }),
                    t,
                  ],
                }),
              }),
              E.jsx(Hn, {
                'data-separator': !0,
                className: ee('hidden size-5 text-gray-300 dark:text-zinc-500', {
                  'sm:flex': s === 'sm',
                  'md:flex': s === 'md',
                  'lg:flex': s === 'lg',
                  'xl:flex': s === 'xl',
                }),
              }),
            ],
          }),
    })
  }
Object.assign(wP, { Item: CP })
var AO = ({ children: e, className: t }) =>
    E.jsx('div', {
      className: ee(
        'rounded-xl border border-gray-100 bg-white dark:border-zinc-800 dark:bg-zinc-900',
        t,
      ),
      children: e,
    }),
  Gc = l.createContext({}),
  y0 = ({ context: e = !1, submenu: t = !1, children: n }) => {
    const r = l.useMemo(() => ({ context: e, submenu: t }), [e, t])
    return E.jsx(Gc.Provider, { value: r, children: n })
  },
  Or = () => l.useContext(Gc)
Gc.Consumer
var SP = ({ className: e, ...t }) => {
    const { context: n } = Or(),
      r = ee('mx-1 border-t border-gray-100 dark:border-zinc-800', e)
    return n ? E.jsx(hd, { className: r, ...t }) : E.jsx(hd, { className: r, ...t })
  },
  EP = ({
    children: e,
    className: t,
    disabled: n,
    variant: r = 'default',
    ref: o,
    onClick: s,
    ...i
  }) => {
    const { context: a } = Or(),
      c = (h) => {
        ;(h.stopPropagation(), s?.(h))
      },
      u = l.useRef(null),
      f = l.useRef(!1),
      d = l.useCallback(
        (h) => {
          ;((u.current = h), typeof o == 'function' ? o(h) : o && 'current' in o && (o.current = h))
        },
        [o],
      )
    l.useEffect(() => {
      if (!a) return
      const h = u.current
      if (!h) return
      let m
      const p = (y) => {
          y.button === 2 &&
            (y.stopImmediatePropagation(),
            y.preventDefault(),
            (f.current = !0),
            (m = setTimeout(() => {
              f.current = !1
            }, 100)))
        },
        b = (y) => {
          f.current &&
            (y.stopImmediatePropagation(),
            y.preventDefault(),
            (f.current = !1),
            m && (clearTimeout(m), (m = void 0)))
        }
      return (
        h.addEventListener('mouseup', p, !0),
        h.addEventListener('click', b, !0),
        () => {
          ;(h.removeEventListener('mouseup', p, !0),
            h.removeEventListener('click', b, !0),
            m && clearTimeout(m))
        }
      )
    }, [a])
    const g = ee(
      'group flex w-full items-center p-2 py-1 text-left whitespace-nowrap',
      'text-xs font-medium outline-none cursor-pointer',
      {
        'cursor-not-allowed border-gray-200 dark:border-zinc-800 text-gray-100 dark:text-zinc-500':
          n,
        'text-gray data-[highlighted]:bg-gray-50 text-gray-500 dark:text-zinc-100 dark:data-[highlighted]:bg-zinc-800':
          !n && r === 'default',
        'text-danger dark:text-red-300 data-[highlighted]:bg-red-100 dark:data-[highlighted]:bg-danger-darken dark:data-[highlighted]:text-red-100':
          !n && r === 'danger',
      },
      'font-body',
      t,
    )
    return a
      ? E.jsx(bd, { ...i, onClick: c, disabled: n, ref: d, className: g, children: e })
      : E.jsx(bd, { ...i, onClick: c, disabled: n, ref: o, className: g, children: e })
  },
  RP = ({ context: e = !1, ...t }) =>
    E.jsxs(y0, { context: e, children: [!e && E.jsx(vc, { ...t }), e && E.jsx($R, { ...t })] }),
  kP = ({
    className: e,
    anchor: t,
    positionMethod: n,
    side: r,
    sideOffset: o,
    align: s,
    alignOffset: i,
    collisionBoundary: a,
    collisionPadding: c,
    sticky: u,
    arrowPadding: f,
    disableAnchorTracking: d,
    collisionAvoidance: g,
    children: h,
    ...m
  }) => {
    const { context: p, submenu: b } = Or(),
      y = {
        className: 'outline-none z-50',
        side: r || (p || b ? 'right' : 'bottom'),
        align: s || (p || b ? 'start' : 'end'),
        anchor: t,
        positionMethod: n,
        sideOffset: o,
        alignOffset: i,
        collisionBoundary: a,
        collisionPadding: c,
        sticky: u,
        arrowPadding: f,
        disableAnchorTracking: d,
        collisionAvoidance: g,
      },
      v = ee(
        'outline-none border border-gray-100 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 overflow-hidden font-body',
        e,
      )
    return p
      ? E.jsx(yd, {
          children: E.jsx(xd, { ...y, children: E.jsx(vd, { className: v, ...m, children: h }) }),
        })
      : E.jsx(yd, {
          children: E.jsx(xd, { ...y, children: E.jsx(vd, { className: v, ...m, children: h }) }),
        })
  },
  IP = ({ ...e }) => {
    const { context: t } = Or()
    return E.jsxs(y0, {
      context: t ?? !1,
      submenu: !0,
      children: [!t && E.jsx(wd, { ...e }), t && E.jsx(wd, { ...e })],
    })
  },
  TP = ({ className: e, children: t, ...n }) => {
    const { context: r } = Or(),
      o = ee(
        'group flex w-full items-center p-2 py-1 text-left whitespace-nowrap',
        'text-xs font-medium outline-none text-gray dark:text-zinc-200 data-[highlighted]:bg-gray-50 dark:data-[highlighted]:bg-zinc-800',
        'font-body',
        e,
      )
    return r
      ? E.jsxs(Cd, {
          className: o,
          ...n,
          children: [
            E.jsx('div', { className: 'flex-1', children: t }),
            E.jsx(Hn, { className: 'size-4' }),
          ],
        })
      : E.jsx(Cd, {
          nativeButton: !1,
          render: (s) =>
            E.jsxs('div', {
              ...s,
              tabIndex: -1,
              className: o,
              children: [
                E.jsx('div', { className: 'flex-1', children: s.children }),
                E.jsx(Hn, { className: 'size-4' }),
              ],
            }),
          ...n,
          children: t,
        })
  },
  PP = ({ className: e, children: t, ...n }) => {
    const { context: r } = Or()
    return r
      ? E.jsx(VR, { className: ee('inline-block outline-none', e), ...n, children: t })
      : E.jsx(NR, {
          nativeButton: !1,
          onClick: (o) => o.stopPropagation(),
          render: (o) =>
            E.jsx('div', {
              ...o,
              tabIndex: -1,
              className: ee('inline-block outline-none', e),
              children: o.children,
            }),
          ...n,
          children: t,
        })
  }
Object.assign(RP, {
  Divider: SP,
  Item: EP,
  Popover: kP,
  SubmenuTrigger: TP,
  Submenu: IP,
  Trigger: PP,
  useMenu: Or,
})
var Uc = l.createContext(null),
  OP = ({ children: e, ...t }) => E.jsx(Mm, { ...t, children: E.jsx(MP, { children: e }) }),
  MP = ({ children: e }) => {
    const t = $m()
    return E.jsx(Uc.Provider, { value: t, children: e })
  },
  AP = () => {
    const e = l.useContext(Uc)
    if (!e) throw new Error('useNotificationManager must be used within a Notification.Provider')
    return l.useMemo(
      () => ({
        toasts: e.toasts,
        close: e.close,
        update: e.update,
        promise: e.promise,
        add: ({ variant: t = 'info', ...n }) =>
          e.add({ ...n, data: { ...n.data, variant: t, type: 'notification' } }),
      }),
      [e],
    )
  },
  zP = () => {
    const e = l.useContext(Uc)
    if (!e)
      throw new Error('useNotificationToastManager must be used within a Notification.Provider')
    return e
  },
  LP = () => {
    const { toasts: e } = zP(),
      t = (n) => n.data?.variant ?? 'info'
    return E.jsx(Fm, {
      children: E.jsx(Am, {
        className: ee(
          'font-body text-base font-medium tracking-normal fixed left-1/2 top-5 z-[1100] -translate-x-1/2 transform',
          {
            'flex w-full flex-col px-4 pb-8 sm:w-[512px] sm:px-0': e.length,
            'pointer-events-none': !e.length,
          },
        ),
        children: e.map((n) => {
          const r = t(n)
          return E.jsxs(
            Lm,
            {
              toast: n,
              swipeDirection: ['up', 'left', 'right'],
              tabIndex: -1,
              className: ee(
                'hide-scrollbar outline-none relative flex max-h-[140px] w-full max-w-lg items-start gap-2 self-center overflow-y-scroll rounded-lg p-2 pl-3 shadow-md',
                'transition-all duration-300 ease-out',
                'absolute top-0 left-0 right-0',
                '[z-index:calc(1100-var(--toast-index))]',
                '[transform:scale(calc(1-0.05*var(--toast-index)))_translateY(calc(var(--toast-index)*12px))_translateX(var(--toast-swipe-movement-x,0px))]',
                '[filter:brightness(calc(1-0.08*var(--toast-index)))]',
                'data-[expanded]:[transform:translateY(calc(var(--toast-offset-y)+var(--toast-index)*8px))_translateX(var(--toast-swipe-movement-x,0px))]',
                'data-[expanded]:[filter:brightness(1)]',
                'data-[starting-style]:[transform:scale(calc(1-0.05*var(--toast-index)))_translateY(-150%)]',
                'data-[starting-style]:opacity-0',
                'data-[ending-style]:opacity-0',
                'data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y,0px)-150%))]',
                'data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y,0px)+150%))]',
                'data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)-150%))]',
                'data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)+150%))]',
                {
                  'bg-gray-500 text-white dark:bg-zinc-900 dark:text-zinc-100 dark:ring-1 dark:ring-zinc-800':
                    r === 'info',
                  'bg-warning text-gray dark:text-zinc-950': r === 'warning',
                  'bg-danger text-white dark:text-zinc-50': r === 'danger',
                  'bg-success text-white dark:text-zinc-50': r === 'success',
                },
              ),
              children: [
                E.jsxs(jm, {
                  className:
                    'mr-8 flex flex-1 flex-col whitespace-pre-line break-words overflow-hidden transition-opacity duration-300 data-[behind]:opacity-0 data-[expanded]:opacity-100',
                  children: [
                    E.jsx(Dm, {}),
                    E.jsx(_m, {
                      className: ee(
                        'mt-1 inline-block w-fit rounded-md px-0 py-0 text-sm font-semibold underline underline-offset-2 transition-all duration-200 text-left',
                        'hover:no-underline focus-visible:no-underline outline-none',
                        {
                          'text-gray hover:text-black focus-visible:text-black dark:text-zinc-950 dark:hover:text-black dark:focus-visible:text-black':
                            r === 'warning',
                          'text-white/80 hover:text-white focus-visible:text-white dark:text-zinc-50/80 dark:hover:text-zinc-50 dark:focus-visible:text-zinc-50':
                            r === 'danger' || r === 'success' || r === 'info',
                        },
                      ),
                    }),
                  ],
                }),
                E.jsx(Nm, {
                  'aria-label': 'Close',
                  nativeButton: !0,
                  render: (o) =>
                    E.jsx('div', {
                      className: 'absolute right-2 top-2',
                      children: E.jsx(Wc, {
                        size: 'lg',
                        className:
                          '[&_svg]:size-5 rounded active:bg-black/10 hover:bg-black/10 focus-visible:bg-black/10 focus-visible:ring-0 dark:active:bg-black/20 dark:hover:bg-black/20 dark:focus-visible:bg-black/20',
                        ...o,
                        children: E.jsx(Sc, {
                          className: ee({
                            'text-gray dark:text-zinc-950': r === 'warning',
                            'text-white dark:text-zinc-50':
                              r === 'danger' || r === 'success' || r === 'info',
                          }),
                        }),
                      }),
                    }),
                }),
              ],
            },
            n.id,
          )
        }),
      }),
    })
  }
Object.assign({ List: LP, Provider: OP, useNotificationManager: AP })
var Zc = l.createContext({}),
  jP = ({
    children: e,
    density: t = 'dense',
    select: n = !1,
    multiselect: r = !1,
    keyboardNavigation: o = !0,
    selectedRows: s,
    setSelectedRows: i,
    editingCell: a,
    setEditingCell: c,
    defaultCollapsedGroups: u = [],
    columns: f,
    isEmpty: d,
    onBeforeSelectionChange: g,
  }) => {
    const [h, m] = l.useState({}),
      [p, b] = l.useState(null),
      [y, v] = l.useState(null),
      [C, w] = l.useState(() => u),
      x = i ? s : h,
      S = i || m,
      k = c ? a : p,
      R = c || b,
      M = l.useMemo(
        () => ({
          select: n,
          multiselect: r,
          keyboardNavigation: o,
          density: t,
          columns: f,
          isEmpty: d,
          cursor: y,
          setCursor: v,
          selectedRows: x ?? {},
          setSelectedRows: S,
          editingCell: k ?? null,
          setEditingCell: R,
          collapsedGroups: C,
          setCollapsedGroups: w,
          onBeforeSelectionChange: g,
        }),
        [n, r, o, t, f, d, y, x, S, k, R, C, g],
      )
    return E.jsx(Zc.Provider, { value: M, children: e })
  },
  yt = () => l.useContext(Zc)
Zc.Consumer
var Kc = l.createContext({}),
  jf = ({ item: e, index: t, groupIndex: n, children: r }) => {
    const { selectedRows: o, select: s, cursor: i } = yt(),
      a = o?.id === e.id && !o?.ids?.length,
      c = a || !!o?.ids?.includes(e.id),
      u = a && t === i,
      [f, d] = l.useState(!1),
      g = l.useMemo(
        () => ({
          item: e,
          index: t,
          groupIndex: n,
          isOnlySelected: a,
          isDirectlySelected: u,
          isSelected: c,
          isHovered: s ? f : !1,
          setIsHovered: d,
        }),
        [e, t, n, a, u, c, s, f],
      )
    return E.jsx(Kc.Provider, { value: g, children: r })
  },
  ao = () => l.useContext(Kc),
  Df = Kc.Consumer,
  Yc = l.createContext({}),
  DP = ({ index: e, isHovered: t, children: n }) => {
    const { select: r, editingCell: o, setEditingCell: s } = yt(),
      { item: i, index: a } = ao(),
      c = o !== null && o[0] === a && o[1] === i.id && o[2] === e,
      u = l.useCallback(() => {
        s((d) => (d ? null : [a, i.id, e]))
      }, [s, a, i?.id, e]),
      f = l.useMemo(
        () => ({ index: e, isEditing: r ? c : !1, isHovered: t, toggleIsEditing: u }),
        [e, r, c, t, u],
      )
    return E.jsx(Yc.Provider, { value: f, children: n })
  },
  NP = () => l.useContext(Yc),
  _P = Yc.Consumer,
  x0 = l.createContext(!1),
  FP = x0.Provider,
  $P = () => l.useContext(x0),
  VP = () => {
    const { isSelected: e, isHovered: t } = ao()
    return E.jsx('div', {
      className: 'absolute top-0 right-0 w-1 h-full py-1 shrink-0',
      children: E.jsx('div', {
        className: ee('w-1 h-full border-r border-gray-50 dark:border-zinc-800', {
          'border-gray-100 dark:border-zinc-800': e || t,
        }),
      }),
    })
  },
  HP = l.memo(function ({ children: t, className: n, divider: r = !0, tree: o = !1, ...s }) {
    const { columns: i, select: a, editingCell: c, density: u } = yt(),
      { isSelected: f, isHovered: d, item: g, index: h } = ao(),
      m = $P(),
      [p, b] = l.useState(!1),
      y = s.index === i,
      v = s.index - (a ? 1 : 0),
      C = c !== null && c[0] === h && c[1] === g.id && c[2] === v + 1,
      w = o ? Fh : ji
    return E.jsx(w, {
      item: o ? g : void 0,
      onMouseEnter: () => b(!0),
      onMouseLeave: () => b(!1),
      className: 'border-b border-gray-50 dark:border-zinc-800 relative',
      ...s,
      children: E.jsx(DP, {
        isHovered: p,
        index: v,
        children: E.jsx(_P, {
          children: ({ isEditing: x }) =>
            E.jsxs(E.Fragment, {
              children: [
                E.jsx('div', {
                  className: ee(
                    'flex flex-row items-center text-xs font-medium px-1.5 flex-1',
                    u === 'roomy' ? 'h-11' : 'h-8',
                    {
                      'bg-gray-50 dark:bg-zinc-800': f || d,
                      'text-gray-300 dark:text-zinc-500': m,
                    },
                    n,
                  ),
                  children: t,
                }),
                r && !y && !x && !C && E.jsx(VP, {}),
              ],
            }),
        }),
      }),
    })
  }),
  Nf = () =>
    E.jsx('div', {
      className: 'absolute top-0 right-0 w-1 h-full py-1 shrink-0',
      children: E.jsx('div', {
        className: 'w-1 h-full border-r border-gray-100 dark:border-zinc-800',
      }),
    }),
  _f = ({ flipped: e = !1 }) =>
    E.jsx('div', {
      className: 'pr-2 text-center flex flex-row-reverse shrink-0',
      children: E.jsx('svg', {
        className: ee('pointer-events-none fill-current text-gray dark:text-zinc-100 size-2', {
          'rotate-180': e,
        }),
        viewBox: '0 0 5 3',
        children: E.jsx('path', { d: 'M0 2.5L2.5 0L5 2.5H0Z' }),
      }),
    }),
  BP = ({ accessory: e, children: t, className: n, style: r, ...o }) =>
    E.jsxs('span', {
      className: ee('gap-1', n),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minWidth: 0,
        width: '100%',
        textAlign: 'left',
        ...r,
      },
      ...o,
      children: [
        E.jsx('span', {
          style: {
            display: 'block',
            flex: '0 1 auto',
            minWidth: 0,
            overflow: 'hidden',
            textAlign: 'left',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
          children: t,
        }),
        e,
      ],
    }),
  WP = ({ children: e, className: t, onClick: n, onMouseDown: r, style: o, ...s }) => {
    const i = (c) => {
        ;(c.stopPropagation(), n?.(c))
      },
      a = (c) => {
        ;(c.stopPropagation(), r?.(c))
      }
    return E.jsx('span', {
      className: ee('inline-flex shrink-0 items-center', t),
      onClick: i,
      onMouseDown: a,
      style: { ...o, pointerEvents: 'auto' },
      ...s,
      children: e,
    })
  },
  w0 = ({
    children: e,
    sortKey: t,
    sortFn: n,
    resize: r = { minWidth: 25, resizerWidth: 8 },
    width: o = '0px',
    divider: s = !0,
    ...i
  }) => {
    const { columns: a, select: c, isEmpty: u, density: f } = yt(),
      d = i.index === a - (c ? 0 : 1),
      g = 'border-b border-gray-100 dark:border-zinc-800 relative',
      h = ee(
        'flex flex-row items-center text-xs font-medium px-1.5 select-none',
        f === 'roomy' ? 'h-11' : 'h-8',
      )
    return u || (!t && !n)
      ? E.jsxs(Tc, {
          className: g,
          resize: r,
          ...i,
          children: [E.jsx('div', { className: h, children: e }), s && !d && E.jsx(Nf, {})],
        })
      : E.jsxs(Vh, {
          className: g,
          sortKey: i.index,
          resize: r,
          sortIcon: {
            iconDefault: null,
            iconDown: E.jsx(_f, { flipped: !0 }),
            iconUp: E.jsx(_f, {}),
          },
          ...i,
          children: [
            E.jsx('div', { className: ee(h, 'min-w-0 w-full justify-start'), children: e }),
            s && !d && E.jsx(Nf, {}),
          ],
        })
  },
  yl = ({ children: e, noOffset: t = !1, className: n, ...r }) => {
    const { select: o, multiselect: s } = yt()
    return E.jsxs(aI, {
      className: ee('!bg-white dark:!bg-zinc-900', n),
      ...r,
      children: [
        (o || s) &&
          !t &&
          E.jsx(w0, {
            resize: !1,
            divider: !1,
            className: 'stiff border-b border-gray-100 dark:border-zinc-800',
          }),
        e,
      ],
    })
  },
  GP = l.memo(({ children: e, onClick: t, disabled: n = !1, ...r }) => {
    const {
        item: o,
        isSelected: s,
        setIsHovered: i,
        isHovered: a,
        index: c,
        isDirectlySelected: u,
      } = ao(),
      { select: f, multiselect: d, setCursor: g, onBeforeSelectionChange: h, density: m } = yt(),
      p = (v) => {
        if (h && h(o, c) === !1) {
          ;(typeof v?.stopPropagation == 'function' && v.stopPropagation(),
            typeof v?.preventDefault == 'function' && v.preventDefault())
          return
        }
        ;(g(c), t && t(v))
      },
      b = () => {
        i(!0)
      },
      y = () => {
        i(!1)
      }
    return (
      l.useEffect(
        () => () => {
          i(!1)
        },
        [i],
      ),
      E.jsx(FP, {
        value: n,
        children: E.jsxs(dI, {
          item: o,
          onMouseEnter: b,
          onMouseLeave: y,
          onClick: p,
          'data-row-index': c,
          'data-disabled': n || void 0,
          ...r,
          children: [
            (f || d) &&
              E.jsx(ji, {
                className: 'border-b border-gray-50 dark:border-zinc-800 stiff',
                children: E.jsx('div', {
                  className: ee(
                    'flex flex-row-reverse items-center w-full',
                    m === 'roomy' ? 'h-11' : 'h-8',
                    {
                      'bg-gray-50 dark:bg-zinc-800': s || a,
                      'text-gray-300 dark:text-zinc-500': n,
                    },
                  ),
                  children:
                    u &&
                    E.jsx('div', {
                      className: 'flex flex-row-reverse items-center h-7 text-xs font-medium',
                      children: E.jsx('div', { className: 'w-1 h-full bg-info rounded-sm' }),
                    }),
                }),
              }),
            e,
          ],
        }),
      })
    )
  }),
  UP = (e, t) => {
    const [n, r] = l.useState(t || []),
      [o, s] = l.useState(null),
      i = (p) => p.flatMap((b) => [b, ...i(b.nodes ?? [])]),
      a = (p, b) =>
        p.reduce(
          (y, v) => {
            if (y) return y
            if (v.id === b) return v
            if (v.nodes?.length) return a(v.nodes, b)
          },
          void 0,
        ),
      c = (p) =>
        p.nodes?.length
          ? p.nodes.filter((b) => b && b.id != null).flatMap((b) => [b.id, ...c(b)])
          : [],
      u = (p, b, y = []) =>
        p.reduce((v, C) => {
          if (v.length > 0) return v
          if (C.id === b) return y
          if (C.nodes?.length) {
            const w = u(C.nodes, b, [...y, C.id])
            if (w.length > 0 || C.nodes.some((x) => x.id === b))
              return w.length > 0 ? w : [...y, C.id]
          }
          return v
        }, []),
      f = (p, b, y) =>
        u(p, b)
          .slice()
          .reverse()
          .reduce(
            (w, x) => {
              if (w.stopped) return w
              const S = a(p, x)
              return S
                ? c(S).every((M) => y.includes(M) || w.ids.includes(M))
                  ? { stopped: !1, ids: [...w.ids, x] }
                  : { stopped: !0, ids: w.ids }
                : w
            },
            { stopped: !1, ids: [] },
          ).ids,
      d = (p) => {
        const b = a(e, p.id),
          y = b ? c(b) : [],
          v = y.filter((C) => n.includes(C)).length
        return {
          hasChildren: y.length > 0,
          allChecked: y.length > 0 && v === y.length,
          someChecked: v > 0 && v < y.length,
          descendantIds: y,
        }
      },
      g = (p) => {
        const { allChecked: b } = d(p)
        return n.includes(p.id) || b
      }
    return {
      isChecked: g,
      isIndeterminate: (p) => {
        const { hasChildren: b, someChecked: y } = d(p)
        return b && !g(p) && y
      },
      handleCheck: (p, b, y) => {
        if (y?.shiftKey && o !== null && b) {
          const S = i(e),
            k = S.findIndex((M) => M.id === o),
            R = S.findIndex((M) => M.id === p.id)
          if (k !== -1 && R !== -1) {
            const M = Math.min(k, R),
              j = Math.max(k, R),
              P = S.slice(M, j + 1)
            ;(r((I) =>
              P.reduce(
                (T, O) => {
                  const { descendantIds: L } = d(O),
                    z = [O.id, ...L].filter((F) => !T.includes(F)),
                    D = [...T, ...z],
                    $ = f(e, O.id, D).filter((F) => !D.includes(F))
                  return [...D, ...$]
                },
                [...I],
              ),
            ),
              s(p.id))
            return
          }
        }
        const { descendantIds: C } = d(p),
          w = [p.id, ...C],
          x = u(e, p.id)
        ;(r((S) => {
          if (b) {
            const R = w.filter((P) => !S.includes(P)),
              M = [...S, ...R],
              j = f(e, p.id, M).filter((P) => !M.includes(P))
            return [...M, ...j]
          }
          const k = [...w, ...x]
          return S.filter((R) => !k.includes(R))
        }),
          s(p.id))
      },
      checkedItems: n,
    }
  },
  C0 = ({
    header: e,
    emptyButtonLabel: t = 'No items to display',
    emptyButtonText: n,
    onClickEmptyButton: r,
  }) => {
    const { columns: o, select: s } = yt(),
      i = l.useMemo(() => typeof n == 'string' && n !== '' && typeof r == 'function', [n, r])
    return E.jsxs(E.Fragment, {
      children: [
        e && E.jsx(si, { children: e }),
        E.jsx('div', {
          'data-testid': 'table-empty-state',
          className: 'flex flex-row items-center h-64 w-full min-h-32',
          style: { gridColumn: `span ${o + (s ? 1 : 0)}` },
          children: E.jsxs('div', {
            className:
              'flex w-full flex-col items-center gap-2.5 text-center text-sm font-medium text-gray-400 dark:text-zinc-200 pb-10',
            children: [
              E.jsx('label', { htmlFor: i ? 'empty-table-button' : void 0, children: t }),
              i &&
                E.jsx('button', {
                  'aria-label': n,
                  type: 'button',
                  onClick: r,
                  className:
                    'flex flex-col items-center group rounded outline-none font-medium cursor-pointer select-none transition duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-info/75 text-gray dark:text-zinc-200 focus-visible:bg-gray-100 dark:focus-visible:bg-zinc-800',
                  id: 'empty-table-button',
                  children: E.jsx('div', {
                    className:
                      'whitespace-nowrap rounded px-3 py-1 font-body text-xs font-medium tracking-normal bg-gray-100 group-hover:bg-gray-200/75 transition duration-200 ease-in-out group-active:scale-95 mx-auto dark:bg-zinc-800 dark:group-hover:bg-zinc-700',
                    children: n,
                  }),
                }),
            ],
          }),
        }),
      ],
    })
  },
  ZP = (e, t, n) => {
    const {
        cursor: r,
        setCursor: o,
        setSelectedRows: s,
        selectedRows: i,
        editingCell: a,
        setEditingCell: c,
        multiselect: u,
        keyboardNavigation: f,
        density: d,
        onBeforeSelectionChange: g,
      } = yt(),
      h = Ni(d),
      m = l.useRef(n)
    l.useEffect(() => {
      m.current = n
    }, [n])
    const p = l.useRef(r),
      b = l.useRef(e),
      y = l.useRef(i),
      v = l.useRef(u),
      C = l.useRef(a)
    ;(l.useEffect(() => {
      p.current = r
    }, [r]),
      l.useEffect(() => {
        b.current = e
      }, [e]),
      l.useEffect(() => {
        y.current = i
      }, [i]),
      l.useEffect(() => {
        v.current = u
      }, [u]),
      l.useEffect(() => {
        C.current = a
      }, [a]))
    const w = l.useCallback(
        () => (t?.current ? t.current.contains(document.activeElement) : !0),
        [t],
      ),
      x = l.useCallback(
        (I) => {
          if (!t?.current) return
          const T = t.current.querySelector('[data-table-library_table] > div > div')
          if (!T) return
          const O = T.scrollTop,
            L = T.clientHeight,
            A = I * h,
            z = A + h
          if (A < O || z > O + L) {
            const $ = A + h / 2 - L / 2
            T.scrollTop = Math.max(0, $)
          }
        },
        [t, h],
      ),
      S = l.useCallback((I, T) => {
        if (!T || !v.current) return { ids: [], id: I }
        const O = y.current,
          L = []
        return (
          O?.id != null && L.push(O.id),
          O?.ids?.length && L.push(...O.ids),
          L.indexOf(I) === -1 && L.push(I),
          { ids: Array.from(new Set(L)), id: null }
        )
      }, []),
      k = l.useRef(g)
    l.useEffect(() => {
      k.current = g
    }, [g])
    const R = l.useCallback((I, T) => {
        if (!k.current) return !0
        const O = I != null ? m.current?.find((L) => L.id === I) : null
        return k.current(O, T) !== !1
      }, []),
      M = l.useCallback(
        (I = !1) => {
          const T = b.current,
            O = p.current
          if (T.length === 0) return
          const L = T.findIndex(($) => $[0] === O),
            A = L + 1 >= T.length ? 0 : L + 1,
            z = T[A][0],
            D = T[A][1]
          R(D, z) && (s(S(D, I)), x(z))
        },
        [s, x, S, R],
      ),
      j = l.useCallback(
        (I = !1) => {
          const T = b.current,
            O = p.current
          if (T.length === 0) return
          const L = T.findIndex(($) => $[0] === O),
            A = L - 1 < 0 ? T.length - 1 : L - 1,
            z = T[A][0],
            D = T[A][1]
          R(D, z) && (s(S(D, I)), x(z))
        },
        [s, x, S, R],
      )
    ;(l.useEffect(() => {
      if (f === !1) return
      const I = (T) => {
        if (!w() || $a(p.current)) return
        const O = T.ctrlKey || T.metaKey || T.shiftKey
        T.key === 'ArrowUp'
          ? (T.preventDefault(), j(O))
          : T.key === 'ArrowDown' && (T.preventDefault(), M(O))
      }
      return (window.addEventListener('keydown', I), () => window.removeEventListener('keydown', I))
    }, [f, w, M, j]),
      l.useEffect(() => {
        if (f === !1) return
        const I = (T) => {
          T.key !== 'Escape' ||
            !w() ||
            (C.current ? c(null) : y.current && R(null, null) && s({ ids: [], id: null }))
        }
        return (
          window.addEventListener('keydown', I),
          () => window.removeEventListener('keydown', I)
        )
      }, [f, w, c, s, R]))
    const P = l.useCallback(() => {
      if (i && i.id) {
        const I = e.filter((T) => i.id === T[1])
        if (I.length > 0)
          if ($a(r)) r !== I[0][0] && o(I[0][0])
          else {
            const T = e.find((L) => L[0] === r)
            if (T && T[1] === i.id) return
            const O = I.reduce((L, A) => {
              const z = Math.abs(L[0] - r)
              return Math.abs(A[0] - r) < z ? A : L
            })
            r !== O[0] && o(O[0])
          }
      } else o(null)
    }, [r, i, e])
    l.useEffect(P, [i, e])
  },
  Ff = ({ indexes: e, children: t, containerRef: n, data: r }) => (
    ZP(e, n, r),
    E.jsx(E.Fragment, { children: t })
  ),
  KP = ({ children: e, className: t }) => {
    const { columns: n, select: r, density: o } = yt()
    return E.jsx('div', {
      className: ee(
        'w-full bg-white dark:bg-zinc-950 flex flex-row items-center justify-center px-2 text-xs text-gray-300 dark:text-zinc-200 font-normal border-b border-gray-100 dark:border-zinc-800',
        t,
      ),
      style: { gridColumn: `span ${n + (r ? 1 : 0)}`, height: Ni(o) * 2 },
      children: e,
    })
  },
  Oa = ({ groupIndex: e, children: t, rowIndex: n, inHeader: r = !1, className: o }) => {
    const { columns: s, select: i, setCollapsedGroups: a, collapsedGroups: c, density: u } = yt(),
      f = c.findIndex((g) => g === e) !== -1,
      d = () => {
        a((g) => (g.findIndex((m) => m === e) !== -1 ? g.filter((m) => m !== e) : [...g, e]))
      }
    return E.jsxs('button', {
      type: 'button',
      onClick: d,
      tabIndex: -1,
      'data-row-index': n,
      className: ee(
        `w-full ${u === 'roomy' ? 'h-11' : 'h-8'} pt-1.5 bg-white dark:bg-zinc-900 flex flex-row items-center border-b border-gray-100 dark:border-zinc-800 gap-2 px-2 text-xs font-medium text-gray dark:text-zinc-100 truncate`,
        o,
      ),
      style: { gridColumn: `span ${s + (i ? 1 : 0)}` },
      children: [
        E.jsx(Hn, {
          className: ee(
            'pointer-events-none fill-current text-gray dark:text-zinc-100 size-3 -rotate-90',
            { 'rotate-90': f },
          ),
        }),
        E.jsx('span', { children: t }),
      ],
    })
  },
  S0 = '__groupEmptyState',
  E0 = '__groupEmptyStateSpacer',
  $f = (e = !1) => ({ [S0]: !0, [E0]: e }),
  Vf = (e) => e?.[S0] === !0,
  YP = (e) => e?.[E0] === !0,
  ci = (e) => typeof e?.id > 'u',
  Hf = ({ itemId: e, index: t }) =>
    E.jsx(
      'div',
      {
        className: 'w-2 h-3 border-l border-b border-gray-100 dark:border-zinc-800',
        style: { marginLeft: '9px' },
      },
      `${e}-${t}`,
    ),
  Bf = ({ itemId: e, index: t }) =>
    E.jsx(
      'div',
      { className: 'w-1.5 mr-2 ml-1 h-full border-r border-gray-100 dark:border-zinc-800' },
      `${e}-${t}`,
    ),
  qP = ({ itemId: e, index: t }) =>
    E.jsxs(
      'div',
      {
        className: 'flex flex-col items-start',
        children: [
          E.jsx('div', {
            className: 'w-2 h-3 border-l border-b border-gray-100 dark:border-zinc-800',
            style: { marginLeft: '9px' },
          }),
          E.jsx('div', {
            className: 'w-2 h-3 border-l border-gray-100 dark:border-zinc-800',
            style: { marginLeft: '9px' },
          }),
        ],
      },
      `${e}-${t}`,
    ),
  XP = ({ itemId: e, index: t }) =>
    E.jsxs(
      'div',
      {
        className: 'flex flex-col items-start',
        children: [
          E.jsx('div', {
            className: 'w-2 h-3 border-l border-gray-100 dark:border-zinc-800',
            style: { marginLeft: '9px' },
          }),
          E.jsx('div', {
            className: 'w-2 h-3 border-l border-gray-100 dark:border-zinc-800',
            style: { marginLeft: '9px' },
          }),
        ],
      },
      `${e}-${t}`,
    ),
  JP = ({ itemId: e, index: t }) => E.jsx('div', { className: 'w-5' }, `${e}-${t}`),
  QP = (e) => {
    const t = []
    let n = e
    for (; n?.parentNode; ) {
      const r = n.parentNode,
        o = r.nodes ? r.nodes[r.nodes.length - 1].id === n.id : !1
      ;(t.unshift(o), (n = r))
    }
    return t
  },
  eO = ({ item: e, isExpanded: t = !1 }) => {
    const n = QP(e),
      r = e?.treeXLevel || 0,
      o = e.parentNode,
      s = o?.nodes ? o.nodes[o.nodes.length - 1].id === e.id : !1,
      i = !!e.nodes?.length,
      a = s && (!t || !i)
    return E.jsx('div', {
      className: `flex flex-row h-6 ${a ? 'items-start' : 'items-center'}`,
      children: Array.from({ length: r }).map((c, u) => {
        const f = u === r - 1,
          d = n[u] ?? !1,
          g = `${e.id}-${u}`
        return f
          ? i
            ? a
              ? E.jsx(Hf, { itemId: e.id, index: u }, g)
              : E.jsx(qP, { itemId: e.id, index: u }, g)
            : s
              ? E.jsx(Hf, { itemId: e.id, index: u }, g)
              : E.jsx(Bf, { itemId: e.id, index: u }, g)
          : d
            ? E.jsx(JP, { itemId: e.id, index: u }, g)
            : i
              ? E.jsx(XP, { itemId: e.id, index: u }, g)
              : E.jsx(Bf, { itemId: e.id, index: u }, g)
      }),
    })
  },
  Ma = ({ item: e, type: t = 'IconDefault' }) => {
    const { isHovered: n, isSelected: r } = ao(),
      { density: o } = yt(),
      s = t === 'IconDown'
    return E.jsxs('div', {
      className: ee('flex flex-row items-center', o === 'roomy' ? 'h-11' : 'h-8', {
        'bg-gray-50 dark:bg-zinc-800': n || r,
      }),
      children: [
        E.jsx(eO, { item: e, isExpanded: s }),
        t === 'IconDefault' && E.jsx('div', { className: 'w-5' }),
        t === 'IconRight' && E.jsx(Hn, { className: 'size-5 text-gray-300 dark:text-zinc-100' }),
        t === 'IconDown' &&
          E.jsx(Hn, { className: 'size-5 text-gray-300 dark:text-zinc-100 rotate-90' }),
      ],
    })
  },
  tO = (e, t) => {
    const { select: n, multiselect: r } = yt(),
      o = n || r,
      s = l.Children.toArray(e.props.children).filter((d) => l.isValidElement(d)),
      i = (d) => (d === void 0 ? 'minmax(0px, 1fr)' : typeof d == 'number' ? `${d}px` : d),
      a = `${o ? '8px' : ''} ${s
        .map((d) => {
          const g = d.props.width
          return i(g)
        })
        .join(' ')}`,
      [c, u] = l.useState(a)
    return (
      l.useEffect(() => {
        if (s.length === 0) return
        if (!t) {
          u(a)
          return
        }
        const d = `table-${t}`,
          g = localStorage.getItem(d)
        if (!g) {
          u(a)
          return
        }
        const h = g.match(/(?:minmax\([^()]*\)|[^\s]+)/g)
        if (!h || h.length !== s.length + (o ? 1 : 0)) {
          ;(localStorage.removeItem(d), u(a))
          return
        }
        u(g)
      }, [s.length, o, t, a]),
      {
        handleLayoutChange: (d) => {
          if (!t) return
          const g = `table-${t}`,
            h = d.match(/(?:minmax\([^()]*\)|[^\s]+)/g)
          if (!h) return
          o && h.shift()
          let m = h
            .map((p, b) => {
              const y = s[b],
                v = y?.props?.width
              return y?.props?.resize !== !1 || !v
                ? p.includes('minmax')
                  ? p
                  : `minmax(${p}, 1fr)`
                : i(v)
            })
            .join(' ')
          ;(o && (m = `8px ${m}`), localStorage.setItem(g, m), u(m))
        },
        columnLayout: c,
      }
    )
  },
  nO = (e, t, n) => {
    const { collapsedGroups: r, density: o } = yt(),
      s = Ni(o),
      [i, a] = l.useState(0)
    if (n) {
      if (!Array.isArray(n.counts)) throw new Error('Grouped counts must be an array.')
      if (n.counts.reduce((p, b) => p + b, 0) !== e?.length)
        throw new Error('All items must be assigned to a group.')
    }
    const c = l.useMemo(() => {
        if (!n) return e || []
        let m = 0
        return n.counts
          .map((b, y) => {
            const v = r?.includes(y),
              C = v ? [] : e.slice(m, m + b),
              w = [n.header(y), ...C]
            return (b === 0 && !v && n.emptyState && w.push($f(), $f(!0)), (m += b), w)
          })
          .flat()
      }, [e, n, r]),
      u = l.useMemo(() => {
        if (!n) return []
        const m = []
        return (
          n.counts.forEach((p, b) => {
            if (r?.includes(b)) m.push(b)
            else {
              const y = p === 0 && n.emptyState
              for (let v = 0; v < p + 1 + (y ? 2 : 0); v++) m.push(b)
            }
          }),
          m
        )
      }, [n, r]),
      f = l.useCallback((m) => u[m] ?? 0, [u]),
      d = l.useMemo(() => {
        if (n) return f(i)
      }, [n, i, f]),
      g = l.useMemo(() => {
        if (!n || n.counts.length === 0) return null
        const m = f(i)
        return n.header(m)
      }, [n, i, f]),
      h = l.useCallback(() => {
        if (!n || !t.current) return
        const m = Number(
          t.current.querySelector('[data-table-library_table] > div > div')?.scrollTop,
        )
        if (m >= 0 && m <= s) a(0)
        else
          try {
            c.reduce((p, b, y) => {
              const v = s,
                C = zp(p) ? p : s,
                w = C + v
              if (m >= C && m <= w) throw (a(y), 'BREAK')
              return w
            })
          } catch (p) {
            if (p !== 'BREAK') throw p
          }
      }, [n, t, c, s])
    return { data: c, handleScroll: h, currentGroup: g, getGroupIndex: f, currentGroupIndex: d }
  },
  rO = (e, t) => {
    const n = {},
      { select: r } = yt(),
      o = (i) => (a) =>
        zp(a[0][i])
          ? a.sort((c, u) => c[i] - u[i])
          : a.sort((c, u) => (c[i] < u[i] ? -1 : c[i] > u[i] ? 1 : 0))
    l.Children.toArray(e.props.children).forEach((i, a) => {
      if (!l.isValidElement(i)) return
      const c = i.props.sortKey
      n[r ? a + 1 : a] = i.props.sortFn ? i.props.sortFn : o(c)
    })
    const s = (i) => (a) => {
      const c = j1(a, (d, g) => (ci(g) ? d.push([]) : d[d.length - 1].push(g), d), [])
      c.map((d) => (d.length ? i(d) : d))
      const u = [],
        f = a.filter((d) => ci(d))
      for (let d = 0; d < f.length; d++) (u.push(f[d]), u.push(c[d]))
      return u
    }
    return t ? z1(n, s) : n
  },
  oO = 33,
  sO = 45,
  Ni = (e = 'dense') => (e === 'roomy' ? sO : oO),
  iO = ({
    data: e,
    density: t,
    selectedRows: n,
    setSelectedRows: r,
    editingCell: o,
    setEditingCell: s,
    defaultSort: i,
    onSortChange: a,
    keyboardNavigation: c,
    onBeforeSelectionChange: u,
    defaultCollapsedGroups: f,
    header: d,
    children: g,
    tree: h = !1,
    scrollable: m = !1,
    ...p
  }) => {
    if (
      (p.select || p.multiselect) &&
      e.some((b) => b === null || typeof b != 'object' || !('id' in b))
    )
      throw new Error("One or more objects are missing an 'id' property")
    if (!l.isValidElement(d)) throw new Error('Invalid header element provided to Table component')
    if (h && p.grouped) throw new Error('Tree and grouped modes cannot be used together')
    return E.jsx(jP, {
      columns: l.Children.count(d.props.children) + (p.select || p.multiselect ? 1 : 0),
      density: t,
      select: p.select,
      multiselect: p.multiselect,
      keyboardNavigation: c,
      selectedRows: n,
      setSelectedRows: r,
      editingCell: o,
      setEditingCell: s,
      defaultCollapsedGroups: f,
      isEmpty: !p.grouped && !e?.length,
      onBeforeSelectionChange: u,
      children: E.jsx(aO, {
        data: e,
        header: d,
        tree: h,
        defaultSort: i,
        onSortChange: a,
        scrollable: m,
        ...p,
        children: g,
      }),
    })
  },
  aO = ({
    data: e,
    select: t = !1,
    multiselect: n = !1,
    header: r,
    children: o,
    id: s,
    empty: i,
    grouped: a,
    tree: c = !1,
    defaultSort: u,
    onSortChange: f,
    scrollable: d = !1,
    virtualized: g = !0,
    ...h
  }) => {
    if (!l.isValidElement(r)) throw new Error('Invalid header element provided to Table component')
    const m = l.useRef(null),
      p = l.useRef(null),
      b = r,
      y = rO(b, !!a),
      { handleLayoutChange: v, columnLayout: C } = tO(b, s),
      {
        data: w,
        handleScroll: x,
        currentGroup: S,
        currentGroupIndex: k,
        getGroupIndex: R,
      } = nO(e, m, a),
      { selectedRows: M, setSelectedRows: j, isEmpty: P, density: I } = yt(),
      T = l.useRef(!1),
      O = l.useRef(M)
    O.current = M
    const L = l.useCallback(
        (N, U) => {
          if (T.current) {
            T.current = !1
            return
          }
          const B = U
          if (N?.type === 'ADD_BY_ID') {
            const _ = N.payload?.id,
              H = O.current,
              W = []
            ;(H?.id != null && W.push(H.id),
              H?.ids?.length && W.push(...H.ids),
              _ != null && W.push(_))
            const J = Array.from(new Set(W))
            ;((T.current = !0), j({ id: null, ids: J }))
            return
          }
          if (B?.ids && Array.isArray(B.ids) && B.ids.length > 0) {
            const _ = Array.from(new Set(B.ids))
            ;((T.current = !0), j({ id: null, ids: _ }))
          } else j(B)
        },
        [j],
      ),
      A = l.useMemo(
        () => ({
          Table: `
      grid-auto-rows: max-content;
      --data-table-library_grid-template-columns: ${C};
      ${d ? '' : 'overflow: clip;'}
    `,
          Row: 'background-color: inherit !important;',
          HeaderRow:
            'z-index: 1; background-color: white; .dark & { background-color: rgb(63 63 70); }',
          Cell: `
      > div:first-of-type > div:first-of-type > div:first-of-type { flex: 1; }
      & button.prefix { margin-right: 0 !important; }
    `,
          HeaderCell: `
      > div:first-of-type > button:first-of-type > div:first-of-type {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      & .resizer-area {
        cursor: col-resize !important;
        min-width: 8px;
      }
    `,
        }),
        [C, d],
      ),
      z = l.useMemo(() => ({ onLayoutChange: v, fixedHeader: !0, isDiv: !0, custom: !0 }), [v]),
      D = l.useMemo(() => ({ nodes: w }), [w]),
      $ = (N, U) => {
        const B = l.Children.toArray(r.props.children)
        for (let _ = 0; _ < B.length; _++) {
          const H = B[_]
          if (!l.isValidElement(H)) continue
          const W = H.key?.toString(),
            J = H.props.sortKey
          if (W === N || J === N) return U ? _ + 1 : _
        }
      },
      F = (N, U) => {
        if (N == null) return { direction: 'asc' }
        const [B, _] = Array.isArray(N) ? N : [N, 'asc'],
          H = _ === 'desc' ? 'desc' : 'asc'
        return { sortKey: typeof B == 'number' ? B : $(B, U), direction: H }
      },
      Q = l.useMemo(() => ({ onChange: () => {} }), []),
      q = l.useMemo(
        () => ({
          clickType: to.ButtonClick,
          indentation: 0,
          treeIcon: {
            iconDefault: (N) => E.jsx(Ma, { item: N, type: 'IconDefault' }),
            iconRight: (N) => E.jsx(Ma, { item: N, type: 'IconRight' }),
            iconDown: (N) => E.jsx(Ma, { item: N, type: 'IconDown' }),
          },
        }),
        [],
      ),
      se = EI(D, Q, q),
      Y = l.useRef(f)
    Y.current = f
    const oe = l.useCallback((N, U) => {
        const B = U,
          _ = B.reverse ? 'desc' : 'asc'
        Y.current?.({ sortKey: B.sortKey ?? null, reverse: B.reverse ?? !1, direction: _ })
      }, []),
      { sortKey: te, direction: le } = F(u, t),
      ve = l.useMemo(
        () => (te != null ? { sortKey: te, reverse: le === 'desc' } : void 0),
        [te, le],
      ),
      X = l.useMemo(() => ({ state: ve, onChange: oe }), [ve, oe]),
      me = l.useMemo(
        () => ({ sortFns: P ? [] : y, sortToggleType: $o.AlternateWithReset }),
        [P, y],
      ),
      he = OI(D, X, me),
      V = l.useMemo(() => ({ state: M, onChange: L }), [M, L]),
      Z = l.useMemo(
        () => (n ? {} : { rowSelect: jt.SingleSelect, buttonSelect: jt.SingleSelect }),
        [n],
      ),
      K = $I(D, V, Z),
      xe = l.useCallback(() => {
        p.current?.focus()
      }, [])
    return E.jsx('div', {
      ref: p,
      tabIndex: 0,
      onMouseDown: xe,
      className: `w-full h-full overflow-x-scroll ${d ? 'overflow-y-auto' : ''} hide-scrollbar relative tracking-normal text-gray-500 dark:text-zinc-100 bg-white dark:bg-zinc-950 antialiased outline-none`,
      children: E.jsx(rI, {
        data: D,
        theme: A,
        sort: he,
        layout: z,
        tree: c ? se : void 0,
        ref: m,
        select: t || n ? K : void 0,
        ...h,
        children: (N) => {
          const U = N.map((B, _) => (ci(B) || Vf(B) ? null : [_, B.id])).filter((B) => !$a(B))
          if (P) {
            if (i) {
              if (l.isValidElement(i)) return l.cloneElement(i, { header: r })
              throw new Error('Invalid empty component provided to Table component')
            }
            return E.jsx(C0, { header: r })
          }
          return c || !g
            ? E.jsxs(Ff, {
                indexes: U,
                containerRef: p,
                data: N,
                children: [
                  E.jsxs(si, {
                    children: [
                      r,
                      !!a &&
                        E.jsx(yl, {
                          noOffset: !0,
                          children: E.jsx(Oa, { inHeader: !0, groupIndex: k ?? 0, children: S }),
                        }),
                    ],
                  }),
                  N.map((B, _) =>
                    E.jsx(
                      jf,
                      {
                        item: B,
                        index: _,
                        groupIndex: a ? R(_) : void 0,
                        children: E.jsx(Df, { children: ({ item: H }) => o(H, _) }),
                      },
                      B.id,
                    ),
                  ),
                ],
              })
            : E.jsx(Ff, {
                indexes: U,
                containerRef: p,
                data: N,
                children: E.jsx(
                  rT,
                  {
                    tableList: he.state.reverse && a ? [...N].reverse() : N,
                    rowHeight: Ni(I),
                    header: () => (
                      a && x(),
                      E.jsxs(si, {
                        children: [
                          r,
                          !!a &&
                            E.jsx(yl, {
                              noOffset: !0,
                              children: E.jsx(Oa, {
                                inHeader: !0,
                                groupIndex: k ?? 0,
                                children: S,
                              }),
                            }),
                        ],
                      })
                    ),
                    body: (B, _) => {
                      if (Vf(B)) {
                        if (YP(B)) return null
                        const H = R(_)
                        return E.jsx(KP, { children: a?.emptyState?.(H) })
                      }
                      return ci(B)
                        ? E.jsx(Oa, { groupIndex: R(_), rowIndex: _, children: B })
                        : E.jsx(jf, {
                            item: B,
                            index: _,
                            groupIndex: a ? R(_) : void 0,
                            children: E.jsx(Df, { children: ({ item: H }) => o(H, _) }),
                          })
                    },
                  },
                  I,
                ),
              })
        },
      }),
    })
  }
Object.assign(iO, {
  HeaderRow: yl,
  HeaderCell: w0,
  HeaderCellContent: BP,
  HeaderCellInteractive: WP,
  Row: GP,
  Cell: HP,
  useTable: yt,
  useRow: ao,
  useCell: NP,
  useCheckbox: UP,
  Empty: C0,
})
var lO = l.forwardRef(
  (
    {
      name: e,
      id: t,
      value: n,
      rows: r = 3,
      className: o,
      textAreaClassName: s,
      disabled: i = !1,
      variant: a = 'default',
      size: c = 'lg',
      invalid: u = !1,
      onValueChange: f,
      ...d
    },
    g,
  ) => {
    const h = (m) => {
      ;(f?.(m.target.value), d.onChange?.(m))
    }
    return E.jsx('div', {
      className: ee(
        'relative flex w-full rounded-md font-medium',
        {
          'focus-within:ring-2 ring-info/50 dark:ring-info/75': !u,
          'text-gray-400 dark:text-zinc-200 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:border-info dark:focus-within:border-info':
            a === 'secondary',
          'bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-100': a === 'default',
          'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-100': a === 'muted' || i,
          'bg-gray-200 dark:bg-zinc-800': a === 'muted' && i,
          'border border-[#FFD4E0] dark:border-danger/50 bg-[#FFD4E0]/25 dark:bg-danger/25 focus-within:border-[#FFD4E0] dark:focus-within:border-danger focus-within:ring-2 ring-[#FFD4E0] dark:ring-danger/50':
            u && !i,
        },
        o,
      ),
      'data-disabled': i || void 0,
      'data-invalid': u || void 0,
      children: E.jsx('textarea', {
        ref: g,
        id: t,
        name: e,
        'data-testid': t,
        'data-textarea': !0,
        value: n,
        rows: r,
        disabled: i,
        onChange: h,
        className: ee(
          'w-full bg-transparent leading-normal outline-none',
          'resize-y',
          {
            'cursor-not-allowed select-none': i,
            'placeholder-gray-200 dark:placeholder-zinc-400': a === 'secondary',
            'placeholder-gray-300 dark:placeholder-zinc-400': a === 'default' || a === 'muted',
            'px-1 py-1 text-xs': c === 'md',
            'px-2 py-1.5 text-sm': c === 'lg',
            'px-2 py-2 text-base': c === 'xl',
          },
          s,
        ),
        ...d,
      }),
    })
  },
)
lO.displayName = 'TextArea'
var R0 = l.createContext(null),
  qc = () => {
    const e = l.useContext(R0)
    if (!e) throw new Error('Tabs.Tab must be used within a Tabs component')
    return e
  },
  cO = ({ children: e, value: t, onValueChange: n, size: r }) => {
    const o = { value: t, onValueChange: n, size: r }
    return E.jsx(R0.Provider, { value: o, children: e })
  },
  uO = ({ className: e, children: t }) => {
    const { size: n } = qc()
    return E.jsx('div', {
      role: 'tablist',
      className: ee(
        'flex flex-nowrap',
        {
          'items-start gap-6': n === 'lg',
          'h-10 items-center gap-0.5 shrink-0 px-1.5 overflow-x-scroll hide-scrollbar': n === 'md',
        },
        e,
      ),
      children: t,
    })
  },
  dO = ({
    value: e,
    className: t,
    children: n,
    onClick: r,
    asLink: o = !1,
    href: s,
    type: i = 'button',
    ref: a,
    ...c
  }) => {
    const { value: u, onValueChange: f, size: d } = qc(),
      g = e === u,
      h = (C) => {
        C.scrollIntoView?.({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      },
      b = {
        role: 'tab',
        tabIndex: g ? -1 : 0,
        'aria-selected': g,
        onClick: (C) => {
          ;(f(e), h(C.currentTarget), r?.(C))
        },
        onFocus: (C) => {
          C.currentTarget.matches(':focus-visible') && h(C.currentTarget)
        },
        ...c,
      }
    if (d === 'md') {
      const C = ee(
        'whitespace-nowrap text-xs text-gray-300 dark:text-zinc-400 font-medium select-none',
        'rounded p-1 px-2 hover:text-gray-700 hover:bg-gray-50 dark:hover:text-zinc-100 dark:hover:bg-zinc-800',
        'outline-none focus-visible:ring-2 ring-info/75',
        { 'text-gray-700 bg-gray-50 dark:text-zinc-100 dark:bg-zinc-800': g },
        t,
      )
      return o
        ? E.jsx(ai, {
            ref: a,
            href: s,
            className: ee('text-inherit no-underline hover:no-underline', C),
            ...b,
            children: n,
          })
        : E.jsx('button', { ref: a, type: i, className: C, ...b, children: n })
    }
    const y = ee(
        '-mb-px rounded py-2 px-0 text-sm font-bold text-gray-300 dark:text-zinc-400 text-center',
        'whitespace-nowrap',
        { 'rounded-b-none border-b-4 border-info text-gray-500 dark:text-zinc-100': g },
      ),
      v = ee(
        'rounded-xl px-3 py-1 outline-none',
        'focus-visible:ring-2 focus-visible:ring-info/75',
        'transition-all duration-200 ease-in-out',
        {
          'hover:text-gray-500 hover:bg-gray-100/50 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50':
            !g,
        },
        t,
      )
    return o
      ? E.jsx('div', {
          'data-wrapper': !0,
          className: y,
          children: E.jsx(ai, {
            ref: a,
            href: s,
            className: ee('text-inherit no-underline hover:no-underline', v),
            ...b,
            children: n,
          }),
        })
      : E.jsx('div', {
          'data-wrapper': !0,
          className: y,
          children: E.jsx('button', { ref: a, type: i, className: v, ...b, children: n }),
        })
  },
  fO = ({ value: e, onValueChange: t, size: n = 'lg', className: r, children: o }) =>
    E.jsx(cO, {
      value: e,
      onValueChange: t,
      size: n,
      children: E.jsx('div', {
        className: ee(
          'border-b border-gray-100 dark:border-zinc-800',
          { 'overflow-x-auto overflow-y-hidden hide-scrollbar': n === 'lg' },
          r,
        ),
        children: o,
      }),
    }),
  zO = Object.assign(fO, { List: uO, Tab: dO, useTabs: qc }),
  Xc = l.createContext(null),
  pO = Xc.Consumer,
  _i = () => {
    const e = l.useContext(Xc)
    if (!e) throw new Error('Toggle.Item must be used within a Toggle component')
    return e
  },
  gO = ({ children: e, value: t, onValueChange: n, disabled: r, size: o, isBinaryToggle: s }) => {
    const i = l.useRef(null),
      a = l.useRef(new Map()),
      c = l.useCallback((f, d) => {
        d ? a.current.set(f, d) : a.current.delete(f)
      }, []),
      u = {
        value: t,
        onValueChange: n,
        disabled: r,
        size: o,
        isBinaryToggle: s,
        registerItem: c,
        containerRef: i,
        itemRefs: a,
      }
    return E.jsx(Xc.Provider, { value: u, children: e })
  },
  xl = ({ value: e, className: t, children: n }) => {
    const { value: r, disabled: o, size: s, isBinaryToggle: i, registerItem: a } = _i(),
      c = e === r,
      u = l.useCallback(
        (d) => {
          a(e, d)
        },
        [a, e],
      ),
      f = i || c ? -1 : void 0
    return E.jsx(n2, {
      ref: u,
      value: e,
      disabled: o,
      tabIndex: f,
      'aria-label': typeof n == 'string' ? n : void 0,
      'data-selected': c || void 0,
      'data-unselected': !c || void 0,
      className: ee(
        'relative z-10 inline-flex items-center justify-center font-semibold',
        'outline-none transition-colors duration-150 whitespace-nowrap',
        'text-gray-400 dark:text-zinc-400 data-[pressed]:text-gray-600 dark:data-[pressed]:text-zinc-100 dark:hover:text-zinc-100',
        {
          'h-5 px-2 text-3xs rounded-sm': s === 'sm',
          'h-6 px-3 text-2xs rounded': s === 'md',
          'h-8 px-4 text-xs rounded-md': s === 'lg',
          'focus-visible:text-gray-600 dark:focus-visible:text-zinc-400': !i,
          'cursor-not-allowed': o,
        },
        t,
      ),
      children: n,
    })
  },
  mO = () => {
    const { value: e, containerRef: t, itemRefs: n } = _i(),
      [r, o] = l.useState(null),
      [s, i] = l.useState(null),
      a = l.useRef(!1),
      [c, u] = l.useState(!1),
      f = l.useCallback(() => {
        const d = t.current,
          g = n.current?.get(e)
        !d || !g || (o(g.offsetWidth), i(g.offsetLeft))
      }, [e, t, n])
    return (
      l.useEffect(() => {
        f()
      }, [f]),
      l.useEffect(() => {
        r !== null &&
          s !== null &&
          !a.current &&
          ((a.current = !0),
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              u(!0)
            })
          }))
      }, [r, s]),
      l.useEffect(() => {
        const d = new ResizeObserver(() => {
          f()
        })
        return (
          t.current && d.observe(t.current),
          n.current?.forEach((g) => {
            d.observe(g)
          }),
          () => {
            d.disconnect()
          }
        )
      }, [f, t, n]),
      { width: r, left: s, animationsEnabled: c }
    )
  },
  hO = () => {
    const { size: e } = _i(),
      { width: t, left: n, animationsEnabled: r } = mO()
    return t === null || n === null
      ? null
      : E.jsx('span', {
          'aria-hidden': 'true',
          'data-indicator': !0,
          className: ee('absolute top-0.5 z-0 bg-white dark:bg-zinc-700 shadow-sm', {
            'h-[calc(100%-4px)] rounded-sm': e === 'sm',
            'h-[calc(100%-4px)] rounded': e === 'md',
            'h-[calc(100%-4px)] rounded-md': e === 'lg',
            'transition-[left,width] duration-200 ease-out': r,
          }),
          style: { width: t, left: n },
        })
  },
  bO = ({
    value: e,
    onValueChange: t,
    disabled: n = !1,
    size: r = 'md',
    className: o,
    children: s,
  }) => {
    const i = l.Children.toArray(s).filter((u) => l.isValidElement(u) && u.type === xl).length,
      a = l.Children.toArray(s)
        .filter((u) => l.isValidElement(u) && u.type === xl)
        .map((u) => u.props.value),
      c = i === 2
    return E.jsx(gO, {
      value: e,
      onValueChange: t,
      disabled: n,
      size: r,
      isBinaryToggle: c,
      children: E.jsx(pO, {
        children: (u) => {
          if (!u) return null
          const { containerRef: f } = u,
            d = (m) => {
              if (c) {
                const p = a.find((b) => b !== e)
                p && t(p)
                return
              }
              m.length > 0 && m[0] !== e && t(m[0])
            },
            h = c
              ? {
                  tabIndex: n ? void 0 : 0,
                  onKeyDown: (m) => {
                    if (!(n || !c) && (m.key === ' ' || m.key === 'Enter')) {
                      m.preventDefault()
                      const p = a.find((b) => b !== e)
                      p && t(p)
                    }
                  },
                  role: 'switch',
                  'aria-checked': e === a[1],
                }
              : { role: 'group' }
          return E.jsxs(o2, {
            ref: f,
            value: [e],
            onValueChange: d,
            disabled: n,
            ...h,
            className: ee(
              'relative inline-flex items-center bg-gray-100 dark:bg-zinc-900 px-0.5',
              'outline outline-0.5 outline-offset-0 outline-gray-200 dark:outline-zinc-800',
              {
                'h-5 rounded': r === 'sm',
                'h-6 rounded-md': r === 'md',
                'h-8 rounded-lg': r === 'lg',
                'focus-visible:ring-2 focus-visible:ring-info/75 focus-visible:outline-none': c,
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-info/75': !c,
                'cursor-not-allowed opacity-60': n,
              },
              o,
            ),
            children: [E.jsx(hO, {}), s],
          })
        },
      }),
    })
  }
Object.assign(bO, { Item: xl, useToggle: _i })
var k0 = l.createContext(null),
  vO = ({ children: e, ...t }) => E.jsx(Mm, { ...t, children: E.jsx(yO, { children: e }) }),
  yO = ({ children: e }) => {
    const t = $m()
    return E.jsx(k0.Provider, { value: t, children: e })
  },
  I0 = () => {
    const e = l.useContext(k0)
    if (!e) throw new Error('useToastManager must be used within a Toast.Provider')
    return e
  },
  xO = () => {
    const { toasts: e } = I0()
    return E.jsx(Fm, {
      'data-foo': !0,
      children: E.jsx(Am, {
        className: ee(
          'font-body text-base font-medium tracking-normal fixed bottom-6 right-6 z-[100]',
          { 'flex w-full max-w-sm flex-col pt-8': e.length, 'pointer-events-none': !e.length },
        ),
        children: e.map((t) => {
          const n = t?.type === 'loading',
            r = t.data,
            o = r?.content,
            s = r?.persistent,
            i = r?.className
          return E.jsx(
            Lm,
            {
              toast: t,
              tabIndex: -1,
              swipeDirection: s ? [] : ['down', 'left', 'right'],
              onKeyDown: s
                ? (a) => {
                    a.key === 'Escape' && a.stopPropagation()
                  }
                : void 0,
              className: ee(
                'relative flex w-full flex-col rounded-lg border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-md outline-none',
                'transition-all duration-300 ease-out',
                'absolute bottom-0 left-0 right-0',
                '[z-index:calc(1000-var(--toast-index))]',
                '[transform:scale(calc(1-0.05*var(--toast-index)))_translateY(calc(var(--toast-index)*-12px))_translateX(var(--toast-swipe-movement-x,0px))]',
                '[filter:brightness(calc(1-0.08*var(--toast-index)))]',
                'data-[expanded]:[transform:translateY(calc(-1*var(--toast-offset-y)-var(--toast-index)*8px))_translateX(var(--toast-swipe-movement-x,0px))]',
                'data-[expanded]:[filter:brightness(1)]',
                'data-[starting-style]:[transform:scale(calc(1-0.05*var(--toast-index)))_translateY(150%)]',
                'data-[starting-style]:opacity-0',
                'data-[ending-style]:opacity-0',
                'data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y,0px)+150%))]',
                'data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)-150%))]',
                'data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)+150%))]',
                i,
              ),
              children:
                o ||
                E.jsxs(E.Fragment, {
                  children: [
                    E.jsxs('div', {
                      className: 'flex w-full flex-col gap-1 rounded-lg px-2 py-3',
                      children: [
                        E.jsxs('div', {
                          className: 'flex items-center gap-2 px-2',
                          children: [
                            n &&
                              E.jsx(Jm, {
                                className:
                                  'size-4 shrink-0 animate-spin text-gray-300 dark:text-zinc-200',
                              }),
                            E.jsx(e2, {
                              className:
                                'flex-1 whitespace-pre-line break-words text-sm font-bold text-gray-500 dark:text-zinc-200',
                            }),
                          ],
                        }),
                        E.jsx(jm, {
                          className:
                            'flex flex-col px-2 transition-opacity duration-300 data-[behind]:opacity-0 data-[expanded]:opacity-100',
                          children: E.jsx(Dm, {
                            className:
                              'flex-1 whitespace-pre-line break-words text-sm font-medium text-gray-500 dark:text-zinc-200',
                          }),
                        }),
                        E.jsx('div', {
                          className: 'mt-1 flex flex-wrap items-center justify-end gap-2 px-1',
                          children: E.jsx(_m, {
                            nativeButton: !0,
                            render: (a) =>
                              E.jsx(Hc, {
                                className: 'rounded-lg py-2',
                                variant: 'success',
                                ...a,
                                children: a.children,
                              }),
                          }),
                        }),
                      ],
                    }),
                    E.jsx(Nm, {
                      'aria-label': 'Close',
                      nativeButton: !0,
                      render: (a) =>
                        E.jsx('div', {
                          className: 'absolute right-2 top-2',
                          children: E.jsx(Wc, {
                            size: 'lg',
                            ...a,
                            children: E.jsx(Sc, { className: 'text-gray-300 dark:text-zinc-400' }),
                          }),
                        }),
                    }),
                  ],
                }),
            },
            t.id,
          )
        }),
      }),
    })
  }
Object.assign({ List: xO, Provider: vO, useToastManager: I0 })
var T0 = l.createContext('horizontal'),
  Jc = () => l.useContext(T0),
  P0 = ({ onExpand: e }) => {
    const n = Jc() === 'vertical'
    return E.jsx('button', {
      type: 'button',
      'data-handle': !0,
      onMouseDown: e,
      onKeyDown: (r) => {
        r.key === ' ' && (r.preventDefault(), e())
      },
      className: `flex h-full relative w-full items-center justify-center group outline-none focus-visible:ring-2 ring-info/75 ring-inset ${n ? 'cursor-row-resize' : 'cursor-col-resize'}`,
      children: E.jsx(qm, {
        'data-handle-icon': !0,
        className: `size-4 text-gray-200 dark:text-zinc-500 group-hover:text-gray-300 dark:group-hover:text-zinc-400 ${n ? 'rotate-90' : ''}`,
      }),
    })
  },
  O0 = l.createContext(null),
  wO = () => l.useContext(O0),
  CO = ({ orientation: e = 'horizontal', onLayoutChanged: t, ...n }) => {
    const r = l0(),
      o = l.useCallback(() => {
        t && r.current && t(r.current.getLayout())
      }, [t, r])
    return E.jsx(T0.Provider, {
      value: e,
      children: E.jsx(O0.Provider, {
        value: o,
        children: E.jsx(a0, { orientation: e, groupRef: r, onLayoutChanged: t, ...n }),
      }),
    })
  },
  SO = 20,
  EO = ({
    collapsible: e,
    collapsedSize: t = e ? SO : void 0,
    panelRef: n,
    onResize: r,
    onExpand: o,
    onCollapse: s,
    defaultSize: i,
    children: a,
    ...c
  }) => {
    const u = u0(),
      f = n ?? (e ? u : void 0),
      d = typeof t == 'number' ? t : 0,
      [g, h] = l.useState(typeof i == 'number' ? i : d + 1),
      m = l.useRef(!1),
      p = wO(),
      b = l.useCallback(
        (v, C, w) => {
          const x = !!(e && v.inPixels <= d),
            S = m.current
          ;(x !== S
            ? ((m.current = x), Mt.flushSync(() => h(v.inPixels)), x ? s?.() : o?.(), c.id && p?.())
            : h(v.inPixels),
            r?.(v, C, w))
        },
        [e, d, r, o, s, c.id, p],
      ),
      y = l.useCallback(() => {
        ;(f && 'current' in f && f.current?.expand(), o?.(), c.id && p?.())
      }, [f, o, c.id, p])
    return E.jsx(c0, {
      collapsible: e,
      collapsedSize: t,
      panelRef: f,
      onResize: e ? b : r,
      defaultSize: i,
      ...c,
      children: e && g <= d ? E.jsx(P0, { onExpand: y }) : a,
    })
  },
  RO = ({ elementRef: e, className: t, ...n }) => {
    const r = Jc(),
      o = l.useCallback(
        (s) => {
          ;(s && (s.tabIndex = -1), typeof e == 'function' ? e(s) : e && (e.current = s))
        },
        [e],
      )
    return E.jsx(d0, {
      elementRef: o,
      className: ee(
        'border-gray-100 dark:border-zinc-800 outline-none',
        { 'border-r': r === 'horizontal', 'border-t': r === 'vertical' },
        t,
      ),
      ...n,
    })
  },
  Wf
;((e) => {
  ;((e.Group = CO),
    (e.Panel = EO),
    (e.Separator = RO),
    (e.Collapsed = P0),
    (e.isCoarsePointer = Kh),
    (e.useDefaultLayout = LT),
    (e.useGroupCallbackRef = DT),
    (e.useGroupRef = l0),
    (e.usePanelCallbackRef = FT),
    (e.useOrientation = Jc),
    (e.usePanelRef = u0))
})(Wf || (Wf = {}))
export {
  PO as A,
  Hc as B,
  AO as C,
  Wc as I,
  Wf as P,
  Vc as T,
  sl as _,
  MO as a,
  OO as b,
  lO as c,
  zO as d,
}
