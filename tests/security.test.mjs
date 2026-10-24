import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Exercise the actual rendering sink without a browser or npm dependencies.
// Browser layout and the Home Assistant backend remain separate release checks.
function loadCard() {
  const definitions = new Map();
  const context = {
    HTMLElement: class {
      attachShadow() {
        this.shadowRoot = { innerHTML: "", querySelector: () => null, querySelectorAll: () => [] };
      }
      dispatchEvent(event) { this.lastEvent = event; }
    },
    customElements: { get: (name) => definitions.get(name), define: (name, card) => definitions.set(name, card) },
    window: {}, console: { info() {} },
    CustomEvent: class { constructor(type, options) { this.type = type; Object.assign(this, options); } },
    setTimeout: () => 0, clearTimeout() {},
  };
  vm.runInNewContext(readFileSync(new URL("../slzb-card.js", import.meta.url), "utf8"), context);
  return new (definitions.get("slzb-card"))();
}

const attack = '\"><img id="injected" src=x onerror="globalThis.pwned=1"><script>globalThis.pwned=1</script>&';
function render(config, states = {}) {
  const card = loadCard();
  card.setConfig(config);
  card.hass = { states, language: "de", locale: { language: "de" } };
  return card;
}
function assertEscaped(html) {
  assert.doesNotMatch(html, /<img id="injected"|<script>/);
  assert.match(html, /&lt;img id=&quot;injected&quot;/);
  assert.match(html, /&lt;script&gt;/);
}

test("configuration text and attribute delimiters remain escaped at the DOM sink", () => {
  const card = render({ name: attack, title: attack, subtitle: attack, memory_title: attack, disk_title: attack, icon: attack });
  assertEscaped(card.shadowRoot.innerHTML);
});

test("entity state and unit markup remain text", () => {
  const card = render({ mode_entity: "sensor.adversarial" }, {
    "sensor.adversarial": { state: attack, attributes: { unit_of_measurement: attack, icon: attack } },
  });
  assertEscaped(card.shadowRoot.innerHTML);
});

test("numeric values cannot introduce markup through their unit", () => {
  const card = render({ mode_entity: "sensor.unit" }, {
    "sensor.unit": { state: "12", attributes: { unit_of_measurement: attack, icon: attack } },
  });
  assertEscaped(card.shadowRoot.innerHTML);
});

test("configured image URL cannot break out of its quoted src attribute", () => {
  const card = render({ image_url: attack, image_mode: "inline", show_image: true });
  const html = card.shadowRoot.innerHTML;
  assertEscaped(html);
  assert.match(html, /src="&quot;&gt;&lt;img/);
});

test("configured entity identifier is escaped in data attributes", () => {
  const card = render({ mode_entity: attack });
  assertEscaped(card.shadowRoot.innerHTML);
  assert.match(card.shadowRoot.innerHTML, /data-more="&quot;&gt;&lt;img/);
});

test("radio sensor name is escaped in the firmware label", () => {
  const card = render({ zigbee_type_entity: "sensor.radio" }, {
    "sensor.radio": { state: attack, attributes: {} },
  });
  assertEscaped(card.shadowRoot.innerHTML);
});

test("restart confirmation requires a second activation before the service call", () => {
  const card = render({});
  const calls = [];
  card._hass.callService = (...args) => { calls.push(args); };
  const classes = new Set();
  const button = {
    dataset: { press: "button.slzb_restart" }, disabled: false,
    classList: { contains: (name) => classes.has(name), add: (...names) => names.forEach((name) => classes.add(name)), remove: (...names) => names.forEach((name) => classes.delete(name)) },
    querySelector: () => ({}),
  };
  card._press(button);
  assert.equal(calls.length, 0);
  card._press(button);
  assert.equal(calls.length, 1);
  assert.deepEqual([...calls[0].slice(0, 2)], ["button", "press"]);
  assert.equal(calls[0][2].entity_id, "button.slzb_restart");
});
