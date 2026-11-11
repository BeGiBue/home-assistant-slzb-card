#!/usr/bin/env python3
"""Chromium-Tests mit lokalen Home-Assistant-Attrappen; keine realen Geräteaufrufe.

  python tests/browser.py             # Prüfungen
  python tests/browser.py --preview   # zusätzlich Vorschaubilder nach tests/out/

Benötigt: pip install -r requirements-dev.txt  und  playwright install chromium
(oder PLAYWRIGHT_CHROMIUM_EXECUTABLE auf einen vorhandenen Chromium/Chrome setzen).
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

PAGE = """<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:14px;background:#e9edf1;font-family:Roboto,Inter,sans-serif;font-size:14px;
--primary-text-color:#141414;--secondary-text-color:#6b6f76;--primary-color:#009ac7;--success-color:#43a047;
--warning-color:#ff9800;--error-color:#e53935;--card-background-color:#fff}
</style><div id="w"></div><script>
customElements.define('ha-card',class extends HTMLElement{constructor(){super();this.attachShadow({mode:'open'}).innerHTML=
  '<style>:host{display:block;background:#fff;border-radius:16px;border:1px solid #dfe3e8;box-sizing:border-box}</style><slot></slot>'}});
customElements.define('ha-icon',class extends HTMLElement{connectedCallback(){(this.shadowRoot||this.attachShadow({mode:'open'})).innerHTML=
  '<style>:host{display:inline-flex;width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px)}i{flex:1;border-radius:30%;background:currentColor;opacity:.55}</style><i></i>'}});
</script>"""

TEST_JS = r"""
async () => {
  const results = [], check = (name, pass) => results.push({name, pass: !!pass});
  const attack = '"><img id="injected" src=x onerror="window.__injected=1"><script>window.__injected=1<\/script>&';
  const turn = (ms = 0) => new Promise((r) => setTimeout(r, ms));
  const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const st = (state, attributes = {}) => ({state, attributes});
  const baseStates = () => ({
    'binary_sensor.slzb_mrw10u_internet': st('on'),
    'sensor.slzb_mrw10u_verbindungsmodus': st('Ethernet'),
    'sensor.slzb_mrw10u_firmware_kanal': st('Stable'),
    'sensor.slzb_mrw10u_zigbee_typ': st('Zigbee'),
    'update.slzb_mrw10u_core_firmware': st('off', {installed_version: '3.1.6', latest_version: '3.1.6'}),
    'button.slzb_mrw10u_kern_neustart': st('unknown'),
    'update.slzb_mrw10u_zigbee_firmware': st('on', {installed_version: '20250321', latest_version: '20250623'}),
    'button.slzb_mrw10u_zigbee_neustart': st('unknown'),
    'update.slzb_mrw10u_z_wave_firmware': st('off', {installed_version: '7.23.2', latest_version: '7.23.2'}),
    'button.slzb_mrw10u_z_wave_neustart': st('unknown'),
  });
  const fixture = ({width = 350, config = {}, language = 'de', states = baseStates()} = {}) => {
    const w = document.getElementById('w');
    w.replaceChildren();
    w.style.width = width + 'px';
    const card = document.createElement('slzb-card'), calls = [];
    const mk = (s) => ({states: s, language, locale: {language}, callService: (...a) => calls.push(a)});
    card.setConfig(config);
    w.appendChild(card);
    card.hass = mk(states);
    return {card, calls, set: (s) => { card.hass = mk(s); }};
  };
  const q = (card, sel) => card.shadowRoot.querySelector(sel);
  const text = (card, sel) => q(card, sel)?.textContent.replace(/\s+/g, ' ').trim();
  const clean = (root) => !root.querySelector('#injected, script') && !window.__injected &&
    ![...root.querySelectorAll('*')].some((el) => [...el.attributes].some((a) => /^on/i.test(a.name)));

  // ---- Aufbau und Inhalt ----
  {
    const {card} = fixture();
    await frames();
    check('Titel, vier Kacheln und drei Firmware-Zeilen vorhanden',
      text(card, 'h1') === 'SLZB-MRW10U' && card.shadowRoot.querySelectorAll('.tile').length === 4 &&
      card.shadowRoot.querySelectorAll('.fw').length === 3);
    check('Verbindung grün und als verbunden markiert', q(card, '[data-part="t-connection_entity"]').classList.contains('tone-success'));
    check('Aktuelle Firmware zeigt Version und Pill „Aktuell"',
      text(card, '[data-part="f-core"] small') === '3.1.6' && text(card, '[data-part="f-core"] .pill') === 'Aktuell');
    check('Verfügbares Update zeigt neue Version und Pill „Update"',
      text(card, '[data-part="f-zigbee"] small') === '→ 20250623' && text(card, '[data-part="f-zigbee"] .pill') === 'Update' &&
      q(card, '[data-part="f-zigbee"]').classList.contains('tone-warning'));
    check('Kein Blur auf der Card', ![...card.shadowRoot.querySelectorAll('*')].some((el) => {
      const cs = getComputedStyle(el); return (cs.backdropFilter && cs.backdropFilter !== 'none') || /blur/.test(cs.filter);
    }));
  }

  // ---- Einmaliger Aufbau: Werte tauschen, Elemente bleiben ----
  {
    const {card, set} = fixture();
    const haCard = q(card, 'ha-card'), img = q(card, 'img'), restart = q(card, '[data-part="r-core"]'), tile = q(card, '[data-part="t-mode_entity"]');
    tile.focus();
    const s = baseStates();
    s['sensor.slzb_mrw10u_verbindungsmodus'] = st('WLAN');
    s['binary_sensor.slzb_mrw10u_internet'] = st('off');
    set(s);
    check('Wertänderung erscheint', text(card, '[data-part="t-mode_entity"] b') === 'WLAN');
    check('Getrennte Verbindung wird rot', q(card, '[data-part="t-connection_entity"]').classList.contains('tone-error'));
    check('Kein Neuaufbau: Card, Bild und Schaltflächen bleiben dieselben Elemente',
      q(card, 'ha-card') === haCard && q(card, 'img') === img && q(card, '[data-part="r-core"]') === restart && q(card, '[data-part="t-mode_entity"]') === tile);
    check('Tastaturfokus bleibt nach einer Wertänderung erhalten', card.shadowRoot.activeElement === tile);
    const before = q(card, '[data-part="f-zwave"]').firstElementChild;
    set({...s});
    check('Unveränderte Bausteine werden nicht angefasst', q(card, '[data-part="f-zwave"]').firstElementChild === before);
    card.setConfig({title: 'Neu'});
    check('Geänderte Einstellung baut neu auf', text(card, 'h1') === 'Neu' && q(card, 'ha-card') !== haCard);
  }

  // ---- Neustart: Bestätigung übersteht eintreffende Werte ----
  {
    const {card, calls, set} = fixture();
    const btn = q(card, '[data-part="r-zigbee"]');
    btn.click();
    check('Erstes Tippen schaltet nur scharf', btn.classList.contains('arm') && calls.length === 0 && text(card, '[data-part="r-zigbee"] .rl') === 'Nochmal tippen');
    const s = baseStates();
    s['sensor.slzb_mrw10u_verbindungsmodus'] = st('WLAN');
    s['update.slzb_mrw10u_zigbee_firmware'] = st('on', {installed_version: '20250321', latest_version: '20250701'});
    set(s);
    check('Bestätigung bleibt bei eintreffenden Werten stehen', q(card, '[data-part="r-zigbee"]') === btn && btn.classList.contains('arm'));
    btn.click();
    check('Zweites Tippen sendet genau einen Aufruf an die richtige Entität',
      calls.length === 1 && calls[0][0] === 'button' && calls[0][1] === 'press' && calls[0][2].entity_id === 'button.slzb_mrw10u_zigbee_neustart' && btn.classList.contains('sent'));
    const {card: c2, calls: calls2} = fixture({config: {confirm_actions: false}});
    q(c2, '[data-part="r-core"]').click();
    check('Ohne Bestätigung löst das erste Tippen aus', calls2.length === 1 && calls2[0][2].entity_id === 'button.slzb_mrw10u_kern_neustart');
  }

  // ---- Nicht verfügbar / fehlend ----
  {
    const {card, calls, set} = fixture();
    const s = baseStates();
    s['button.slzb_mrw10u_kern_neustart'] = st('unavailable');
    s['update.slzb_mrw10u_core_firmware'] = st('unavailable');
    delete s['sensor.slzb_mrw10u_firmware_kanal'];
    set(s);
    const btn = q(card, '[data-part="r-core"]');
    btn.click();
    check('Nicht verfügbarer Neustart-Button ist gesperrt', btn.disabled && calls.length === 0 && !btn.classList.contains('arm'));
    check('Nicht verfügbares Update wird als solches gezeigt', text(card, '[data-part="f-core"] .pill') === 'nicht verfügbar');
    check('Fehlende Entität wird als „nicht gefunden" gezeigt', text(card, '[data-part="t-channel_entity"] b') === 'nicht gefunden');
    set(baseStates());
    check('Button wird wieder freigegeben', !q(card, '[data-part="r-core"]').disabled && text(card, '[data-part="f-core"] .pill') === 'Aktuell');
  }

  // ---- Installation mit Fortschritt ----
  {
    const {card, set} = fixture();
    const s = baseStates();
    s['update.slzb_mrw10u_zigbee_firmware'] = st('on', {installed_version: '20250321', latest_version: '20250623', in_progress: true, update_percentage: 42});
    set(s);
    check('Fortschritt in der Pill und als Balken', text(card, '[data-part="f-zigbee"] .pill') === '42 %' && q(card, '[data-part="f-zigbee"] .bar u').style.width === '42%');
    s['update.slzb_mrw10u_zigbee_firmware'] = st('on', {in_progress: true, update_percentage: null});
    set({...s});
    check('Installation ohne Prozentangabe', text(card, '[data-part="f-zigbee"] .pill') === 'Installiert …');
    s['update.slzb_mrw10u_zigbee_firmware'] = st('on', {in_progress: true, update_percentage: '250"><b>x'});
    set({...s});
    check('Ungültiger Fortschritt bricht nicht aus dem Style-Attribut aus', q(card, '[data-part="f-zigbee"] .bar u').style.width === '0%' && clean(card.shadowRoot));
  }

  // ---- HTML-Injection: erster Aufbau und Aktualisierung ----
  {
    const s = baseStates();
    const {card, set} = fixture({config: {title: attack, subtitle: attack, image_url: attack, core_restart_entity: 'button.x' + attack}, states: s});
    await turn(50);
    check('Injection über Konfiguration bleibt Text', clean(card.shadowRoot) && text(card, 'h1').includes('<img id="injected"'));
    const {card: c2, set: set2} = fixture();
    const s2 = baseStates();
    s2['sensor.slzb_mrw10u_verbindungsmodus'] = st(attack, {icon: attack});
    s2['sensor.slzb_mrw10u_zigbee_typ'] = st(attack);
    s2['update.slzb_mrw10u_core_firmware'] = st('off', {installed_version: attack, latest_version: attack});
    s2['update.slzb_mrw10u_zigbee_firmware'] = st('on', {installed_version: '1', latest_version: attack});
    set2(s2);
    await turn(50);
    check('Injection über Zustände und Attribute bleibt bei der Aktualisierung Text',
      clean(c2.shadowRoot) && text(c2, '[data-part="t-mode_entity"] b').includes('<img id="injected"') &&
      text(c2, '[data-part="f-core"] small').includes('<img id="injected"') && text(c2, '[data-part="f-zigbee"] b').includes('<img id="injected"'));
    check('Hinweistext des Neustart-Buttons folgt dem Funkstandard als Text', q(c2, '[data-part="r-zigbee"]').title.includes('<img id="injected"'));
  }

  // ---- Bild-Optionen und Sprache ----
  {
    const a = fixture({config: {image_mode: 'inline'}}).card;
    check('Bild neben dem Titel', !!q(a, '.art img') && !q(a, '.bgimg'));
    const b = fixture({config: {show_image: false}}).card;
    check('Bild abschaltbar', !q(b, 'img'));
    const c = fixture({config: {image_opacity: 0.3}}).card;
    check('Deckkraft des Hintergrundbilds einstellbar', q(c, '.bgimg').style.opacity === '0.3');
    const d = fixture({config: {image_url: '/gibt-es-nicht.png'}}).card;
    await turn(400);
    check('Fehlendes eigenes Bild fällt auf das eingebettete zurück', q(d, 'img').getAttribute('src').startsWith('data:image/'));
    const e = fixture({language: 'en'}).card;
    check('Englisch, wenn Home Assistant nicht deutsch ist', text(e, '[data-part="f-core"] .pill') === 'Up to date' && text(e, '[data-part="r-core"] .rl') === 'Restart');
  }

  // ---- Layout: Schriftstufen, kein Überlauf, Höhe ----
  for (const [width, fs] of [[300, '14px'], [350, '14px'], [480, '15px'], [800, '19px'], [1100, '22px']]) {
    const {card} = fixture({width});
    await frames();
    const root = card.shadowRoot, hc = q(card, 'ha-card').getBoundingClientRect();
    const inside = [...root.querySelectorAll('.tile, .fwmain, .restart, .pill, h1, .at b, .at small, .rl')].every((el) => {
      const r = el.getBoundingClientRect(); return r.left >= hc.left - .5 && r.right <= hc.right + .5;
    });
    const noClip = [...root.querySelectorAll('.pill b, .rl')].every((el) => el.scrollWidth <= el.clientWidth + 1);
    const bg = q(card, '.bgimg').getBoundingClientRect(), tiles = q(card, '.tiles').getBoundingClientRect();
    check(width + ' px: Schriftstufe ' + fs, card.style.getPropertyValue('--fs') === fs);
    check(width + ' px: nichts ragt aus der Card, Pills und Button-Texte sind vollständig', inside && noClip && root.querySelector('main').scrollWidth <= Math.ceil(hc.width));
    check(width + ' px: Gerätebild bleibt im Kopfbereich', bg.bottom <= tiles.top + 1);
    check(width + ' px: gemeldete Mindesthöhe deckt den Inhalt', card.getGridOptions().min_rows * 64 - 8 >= q(card, 'main').offsetHeight && card.getGridOptions().min_rows <= Math.ceil((q(card, 'main').offsetHeight + 10) / 64) + 1);
  }
  {
    const {card} = fixture({width: 395});
    await frames();
    const w = document.getElementById('w');
    const fs = () => card.style.getPropertyValue('--fs');
    const seen = [fs()];
    for (const px of [405, 395, 409, 414, 392, 386]) { w.style.width = px + 'px'; await frames(); await frames(); seen.push(fs()); }
    check('Hysterese: ±12 px um die Schwelle kippen die Schriftstufe nicht (' + seen.join(' ') + ')',
      seen.join() === ['14px', '14px', '14px', '14px', '15px', '15px', '14px'].join());
  }
  // Nachgebildete Scrollleiste: Ist die Card höher als H, wird ihr Platz 15 px schmaler (wie bei einer
  // einblendenden Scrollleiste). Um jede Layout-Schwelle darf die Breite danach nicht dauerhaft hin- und herkippen.
  for (const T of [330, 400, 600, 800, 1000]) {
    const host = document.getElementById('w');
    host.replaceChildren();
    host.style.width = 'auto';
    const hass = {states: baseStates(), language: 'de', locale: {language: 'de'}, callService() {}};
    const mk = (W) => {
      const box = document.createElement('div'); box.style.width = W + 'px';
      const c = document.createElement('slzb-card'); c.setConfig({}); box.appendChild(c); host.appendChild(box); c.hass = hass;
      return {box, c};
    };
    const probe = [T - 20, T + 20].map(mk);
    await frames();
    const hs = probe.map((p) => p.c.offsetHeight), lo = Math.min(...hs) - 3, hi = Math.max(...hs) + 3;
    host.replaceChildren();
    const cards = [];
    for (let W = T - 14; W <= T + 30; W += 2) for (let H = lo; H <= hi; H += Math.max(2, Math.ceil((hi - lo) / 6))) cards.push({...mk(W), W, H, cur: W, n: 0});
    await frames();
    for (let f = 0; f < 60; f++) {
      const now = cards.map((o) => o.c.offsetHeight);
      cards.forEach((o, i) => { const want = o.W - (now[i] > o.H ? 15 : 0); if (want !== o.cur) { o.cur = want; o.box.style.width = want + 'px'; o.n++; } });
      await new Promise((r) => requestAnimationFrame(r));
    }
    const worst = Math.max(...cards.map((o) => o.n));
    check('Scrollleiste um ' + T + ' px: Breite pendelt sich ein (höchstens ' + worst + ' Wechsel in 60 Bildern)', worst <= 4);
  }
  {
    const {card} = fixture({width: 325});
    await frames();
    const w = document.getElementById('w'), slim = () => (q(card, 'ha-card').classList.contains('slim') ? 's' : 'n');
    const seen = [slim()];
    for (const px of [335, 325, 339, 344, 322, 316]) { w.style.width = px + 'px'; await frames(); await frames(); seen.push(slim()); }
    check('Hysterese um 330 px: ±12 px kippen das schmale Layout nicht (' + seen.join(' ') + ')', seen.join() === ['s', 's', 's', 's', 'n', 'n', 's'].join());
  }
  {
    const {card} = fixture({width: 350});
    const first = q(card, '.tile');
    first.focus();
    check('Sichtbarer Fokusrahmen', first.matches(':focus-visible') ? parseFloat(getComputedStyle(first).outlineWidth) >= 2 : true);
    const grid = card.getGridOptions();
    check('Sections-Raster: volle Breite, mindestens 6 Spalten', grid.columns === 12 && grid.min_columns === 6 && !('rows' in grid));
  }
  return results;
}
"""

FIXTURE_JS = """([width, variant]) => {
  const w = document.getElementById('w'); w.replaceChildren(); w.style.width = width + 'px';
  const st = (state, attributes = {}) => ({state, attributes});
  const states = {
    'binary_sensor.slzb_mrw10u_internet': st('on'), 'sensor.slzb_mrw10u_verbindungsmodus': st('Ethernet'),
    'sensor.slzb_mrw10u_firmware_kanal': st('Stable'), 'sensor.slzb_mrw10u_zigbee_typ': st('Zigbee'),
    'update.slzb_mrw10u_core_firmware': st('off', {installed_version: '3.1.6', latest_version: '3.1.6'}),
    'update.slzb_mrw10u_zigbee_firmware': variant === 'update' ? st('on', {installed_version: '20250321', latest_version: '20250623', in_progress: true, update_percentage: 42})
      : st('off', {installed_version: '20250623', latest_version: '20250623'}),
    'update.slzb_mrw10u_z_wave_firmware': variant === 'update' ? st('on', {installed_version: '7.23.2', latest_version: '7.24.0'}) : st('off', {installed_version: '7.23.2', latest_version: '7.23.2'}),
    'button.slzb_mrw10u_kern_neustart': st('unknown'), 'button.slzb_mrw10u_zigbee_neustart': st('unknown'), 'button.slzb_mrw10u_z_wave_neustart': st('unknown'),
  };
  const fmt = (s) => ({on: 'Verbunden', off: 'Getrennt'})[s.state] || s.state;
  const c = document.createElement('slzb-card'); c.setConfig({}); w.appendChild(c);
  c.hass = {states, language: 'de', locale: {language: 'de'}, formatEntityState: fmt};
}"""


def launch(p):
    executable = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
    return p.chromium.launch(**({"executable_path": executable, "args": ["--no-sandbox"]} if executable else {}))


def main():
    source = (ROOT / "slzb-card.js").read_text(encoding="utf8")
    errors = []
    with sync_playwright() as p:
        browser = launch(p)
        page = browser.new_page(viewport={"width": 1200, "height": 1000})
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.set_content(PAGE)
        page.add_script_tag(content=source)
        results = page.evaluate(TEST_JS)
        results.append({"name": "keine JavaScript-Fehler", "pass": not errors})
        if "--preview" in sys.argv:
            out = ROOT / "tests" / "out"
            out.mkdir(exist_ok=True)
            for width in (350, 800):
                for variant in ("normal", "update"):
                    shot = browser.new_page(viewport={"width": width + 28, "height": 400}, device_scale_factor=2)
                    shot.set_content(PAGE)
                    shot.add_script_tag(content=source)
                    shot.evaluate(FIXTURE_JS, [width, variant])
                    shot.wait_for_timeout(200)
                    shot.screenshot(path=str(out / f"slzb-{variant}-{width}.png"), full_page=True)
                    shot.close()
        browser.close()
    for result in results:
        print(("PASS " if result["pass"] else "FAIL ") + result["name"])
    failures = sum(not result["pass"] for result in results)
    print(f"\n{len(results)} Prüfungen, {failures} Fehler")
    if errors:
        print(errors)
    return bool(failures)


if __name__ == "__main__":
    raise SystemExit(main())
