/*
 * SLZB Card – Übersichtskarte für den SMLIGHT SLZB-MRW10U (Zigbee / Z-Wave / Thread, PoE)
 * Version 2.0.1
 * Ein einzelnes JavaScript-File, kein Build nötig. Stil angelehnt an die NAS-Card,
 * der Code ist komplett eigenständig geschrieben.
 */

const SLZB_VERSION = "2.0.1";

const SLZB_DEFAULTS = {
  title: "SLZB-MRW10U",
  subtitle: "Zigbee · Z-Wave · Thread",
  show_image: true,
  image_url: "",
  image_mode: "background",
  image_opacity: 0.55,
  confirm_actions: true,
  connection_entity: "binary_sensor.slzb_mrw10u_internet",
  mode_entity: "sensor.slzb_mrw10u_verbindungsmodus",
  channel_entity: "sensor.slzb_mrw10u_firmware_kanal",
  zigbee_type_entity: "sensor.slzb_mrw10u_zigbee_typ",
  core_update_entity: "update.slzb_mrw10u_core_firmware",
  core_restart_entity: "button.slzb_mrw10u_kern_neustart",
  zigbee_update_entity: "update.slzb_mrw10u_zigbee_firmware",
  zigbee_restart_entity: "button.slzb_mrw10u_zigbee_neustart",
  zwave_update_entity: "update.slzb_mrw10u_z_wave_firmware",
  zwave_restart_entity: "button.slzb_mrw10u_z_wave_neustart",
};

const SLZB_LABELS = {
  title: "Titel",
  subtitle: "Untertitel",
  show_image: "Gerätebild anzeigen",
  image_url: "Eigene Bild-URL (leer = mitgeliefertes Bild)",
  image_mode: "Bildposition",
  image_opacity: "Bild-Deckkraft (nur Hintergrund)",
  confirm_actions: "Neustart mit zweitem Tippen bestätigen",
  connection_entity: "Verbindung (Binärsensor)",
  mode_entity: "Verbindungsmodus",
  channel_entity: "Firmware-Kanal",
  zigbee_type_entity: "Funkstandard (Zigbee-Typ)",
  core_update_entity: "Core: Update",
  core_restart_entity: "Core: Neustart-Button",
  zigbee_update_entity: "Zigbee: Update",
  zigbee_restart_entity: "Zigbee: Neustart-Button",
  zwave_update_entity: "Z-Wave: Update",
  zwave_restart_entity: "Z-Wave: Neustart-Button",
};

const slzbEsc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const slzbUnavailable = (st) => st.state === "unavailable" || st.state === "unknown";

/* Freigestelltes Gerätebild (WebP mit Transparenz), direkt eingebettet. */
const SLZB_IMAGE = "data:image/webp;base64,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";

class SlzbCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = { ...SLZB_DEFAULTS };
    this._sig = "";
  }

  /* ---------- Home-Assistant-Schnittstelle ---------- */

  setConfig(config) {
    this._config = { ...SLZB_DEFAULTS, ...(config || {}) };
    this._sig = "";
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  static getStubConfig() {
    return { ...SLZB_DEFAULTS };
  }

  static getConfigForm() {
    const ent = (name, domain) => ({ name, selector: { entity: { domain } } });
    return {
      schema: [
        {
          type: "expandable",
          name: "",
          title: "Allgemein",
          schema: [
            { name: "title", selector: { text: {} } },
            { name: "subtitle", selector: { text: {} } },
            { name: "show_image", selector: { boolean: {} } },
            {
              name: "image_mode",
              selector: {
                select: {
                  mode: "dropdown",
                  options: [
                    { value: "background", label: "Hintergrund (oben rechts)" },
                    { value: "inline", label: "Neben dem Titel" },
                  ],
                },
              },
            },
            { name: "image_opacity", selector: { number: { min: 0.1, max: 1, step: 0.05, mode: "slider" } } },
            { name: "image_url", selector: { text: {} } },
            { name: "confirm_actions", selector: { boolean: {} } },
          ],
        },
        {
          type: "expandable",
          name: "",
          title: "Verbindung",
          schema: [
            ent("connection_entity", "binary_sensor"),
            ent("mode_entity", "sensor"),
            ent("channel_entity", "sensor"),
            ent("zigbee_type_entity", "sensor"),
          ],
        },
        {
          type: "expandable",
          name: "",
          title: "Firmware & Neustart",
          schema: [
            ent("core_update_entity", "update"),
            ent("core_restart_entity", "button"),
            ent("zigbee_update_entity", "update"),
            ent("zigbee_restart_entity", "button"),
            ent("zwave_update_entity", "update"),
            ent("zwave_restart_entity", "button"),
          ],
        },
      ],
      computeLabel: (schema) => SLZB_LABELS[schema.name] || schema.name,
    };
  }

  getCardSize() {
    return 10;
  }

  getGridOptions() {
    // Höhe nicht vorgeben: Home Assistant misst die (feste) Kartenhöhe selbst, so wird nie etwas abgeschnitten
    return { columns: 12, min_columns: 6 };
  }

  connectedCallback() {
    this._update();
  }

  /* ---------- Hilfsfunktionen ---------- */

  _state(id) {
    return id && this._hass ? this._hass.states[id] : undefined;
  }

  _fmt(st) {
    try {
      if (typeof this._hass.formatEntityState === "function") return this._hass.formatEntityState(st);
    } catch (e) {
      /* Fallback unten */
    }
    const unit = st.attributes?.unit_of_measurement;
    return unit ? `${st.state} ${unit}` : st.state;
  }

  _icon(st, fallback) {
    return st?.attributes?.icon || fallback;
  }

  _entityIds() {
    return Object.keys(SLZB_DEFAULTS)
      .filter((k) => k.endsWith("_entity"))
      .map((k) => this._config[k])
      .filter(Boolean);
  }

  _update() {
    if (!this._hass) return;
    const sig = JSON.stringify([
      this._config,
      this._entityIds().map((id) => {
        const s = this._state(id);
        return s ? [s.state, s.attributes.installed_version, s.attributes.latest_version, s.attributes.in_progress, s.attributes.update_percentage] : null;
      }),
    ]);
    if (sig === this._sig) return;
    this._sig = sig;
    this._render();
  }

  /* ---------- Rendering ---------- */

  _tile(label, id, icon, kind) {
    const st = this._state(id);
    const value = st ? this._fmt(st) : "nicht gefunden";
    let tone = "";
    if (!st) tone = "off";
    else if (slzbUnavailable(st)) tone = "warn";
    else if (kind === "connection") tone = st.state === "on" ? "ok" : "bad";
    return `
      <button class="tile ${tone}" data-more="${slzbEsc(id)}">
        <span class="chip"><ha-icon icon="${slzbEsc(this._icon(st, icon))}"></ha-icon></span>
        <span class="txt"><span class="lab">${slzbEsc(label)}</span><span class="val">${slzbEsc(value)}</span></span>
      </button>`;
  }

  _fwRow(label, icon, updId, btnId) {
    const up = this._state(updId);
    const btn = this._state(btnId);
    let tone = "off";
    let status = "nicht gefunden";
    if (up) {
      const a = up.attributes || {};
      if (slzbUnavailable(up)) {
        tone = "warn";
        status = "nicht verfügbar";
      } else if (a.in_progress) {
        tone = "warn";
        status = a.update_percentage != null ? `Installiert ${Math.round(a.update_percentage)} %` : "Installiert …";
      } else if (up.state === "on") {
        tone = "warn";
        status = "Update verfügbar";
      } else {
        tone = "ok";
        status = "Aktuell";
      }
    }
    const disabled = !btn || btn.state === "unavailable" ? "disabled" : "";
    return `
      <div class="fw">
        <button class="fwmain ${tone}" data-more="${slzbEsc(updId)}">
          <span class="chip"><ha-icon icon="${slzbEsc(icon)}"></ha-icon></span>
          <span class="txt">
            <span class="lab">${slzbEsc(label)}</span>
            <span class="val">${slzbEsc(status)}</span>
          </span>
        </button>
        <button class="restart" data-press="${slzbEsc(btnId)}" ${disabled} title="${slzbEsc(label)} neu starten">
          <ha-icon icon="mdi:restart"></ha-icon><span class="rl">Neustart</span>
        </button>
      </div>`;
  }

  _render() {
    const c = this._config;
    const radio = this._state(c.zigbee_type_entity);
    const radioLabel = radio && !slzbUnavailable(radio) ? this._fmt(radio) : "Zigbee";
    const inline = c.image_mode !== "background";
    const imgSrc = c.image_url || SLZB_IMAGE;
    const opacity = Math.min(1, Math.max(0.1, Number(c.image_opacity) || 0.55));
    const wrap = inline ? `class="art"` : `class="bgimg" style="opacity:${opacity}"`;
    const image = c.show_image === false ? "" : `<div ${wrap}><img data-fallback src="${slzbEsc(imgSrc)}" alt=""></div>`;

    this.shadowRoot.innerHTML = `
      <style>${SlzbCard.css}</style>
      <ha-card>
        <div class="main">
          ${inline ? "" : image}
          <div class="top ${inline ? "inline" : ""}">
            <div class="title">
              <span class="bigchip"><ha-icon icon="mdi:access-point-network"></ha-icon></span>
              <div class="tt">
                <h1>${slzbEsc(c.title)}</h1>
                <p>${slzbEsc(c.subtitle)}</p>
              </div>
            </div>
            ${inline ? image : ""}
          </div>

          <div class="tiles">
            ${this._tile("Verbindung", c.connection_entity, "mdi:lan-connect", "connection")}
            ${this._tile("Modus", c.mode_entity, "mdi:connection")}
            ${this._tile("Firmware-Kanal", c.channel_entity, "mdi:update")}
            ${this._tile("Funkstandard", c.zigbee_type_entity, "mdi:zigbee")}
          </div>

          <div class="sec"><ha-icon icon="mdi:cog-refresh-outline"></ha-icon><span>Firmware &amp; Neustart</span></div>
          <div class="fws">
            ${this._fwRow("Core", "mdi:chip", c.core_update_entity, c.core_restart_entity)}
            ${this._fwRow(radioLabel, "mdi:zigbee", c.zigbee_update_entity, c.zigbee_restart_entity)}
            ${this._fwRow("Z-Wave", "mdi:z-wave", c.zwave_update_entity, c.zwave_restart_entity)}
          </div>
        </div>
      </ha-card>`;

    this.shadowRoot.querySelectorAll("[data-more]").forEach((el) => {
      el.addEventListener("click", () => this._moreInfo(el.dataset.more));
    });
    this.shadowRoot.querySelectorAll("[data-press]").forEach((el) => {
      el.addEventListener("click", () => this._press(el));
    });
    this.shadowRoot.querySelectorAll("img[data-fallback]").forEach((img) => {
      img.addEventListener("error", () => {
        if (img.getAttribute("src") !== SLZB_IMAGE) img.setAttribute("src", SLZB_IMAGE);
        else if (img.parentElement) img.parentElement.style.display = "none";
      });
    });
  }

  /* ---------- Aktionen ---------- */

  _moreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } })
    );
  }

  _press(btn) {
    const id = btn.dataset.press;
    if (!id || btn.disabled || !this._hass) return;
    const label = btn.querySelector(".rl");
    const reset = () => {
      btn.classList.remove("arm", "sent");
      label.textContent = "Neustart";
    };

    if (this._config.confirm_actions !== false && !btn.classList.contains("arm")) {
      btn.classList.add("arm");
      label.textContent = "Nochmal tippen";
      clearTimeout(btn._t);
      btn._t = setTimeout(reset, 4000);
      return;
    }

    clearTimeout(btn._t);
    btn.classList.remove("arm");
    btn.classList.add("sent");
    label.textContent = "Gesendet";
    this._hass.callService(id.split(".")[0], "press", { entity_id: id });
    btn._t = setTimeout(reset, 2500);
  }

  /* ---------- Styles ---------- */

  static get css() {
    return `
      :host { display: block; }
      ha-card {
        overflow: hidden;
        container-type: inline-size;
      }
      .main {
        --line: color-mix(in srgb, var(--primary-text-color, #888) 14%, transparent);
        --fill: color-mix(in srgb, var(--primary-text-color, #888) 6%, transparent);
        --ok: var(--success-color, #43a047);
        --warn: var(--warning-color, #ffa600);
        --bad: var(--error-color, #db4437);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        color: var(--primary-text-color);
        position: relative;
        isolation: isolate;
        box-sizing: border-box;
        min-height: 500px;      /* feste Kartenhöhe; der Inhalt ist kürzer, es wird nichts abgeschnitten */
      }
      .main > :not(.bgimg) { position: relative; z-index: 1; }
      button {
        font: inherit;
        color: inherit;
        background: none;
        border: 0;
        padding: 0;
        margin: 0;
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      /* Kopf */
      .top { display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; gap: 12px; height: 72px; }
      .top.inline { grid-template-columns: minmax(0, 1fr) auto; }
      .title { display: flex; align-items: center; gap: 12px; min-width: 0; }
      .bigchip {
        flex: none; width: 48px; height: 48px; border-radius: 16px;
        display: grid; place-items: center;
        background: color-mix(in srgb, var(--primary-color, #03a9f4) 18%, transparent);
        color: var(--primary-color, #03a9f4);
        --mdc-icon-size: 28px;
      }
      .tt { min-width: 0; }
      h1 { margin: 0; font-size: 1.35em; font-weight: 600; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .tt p { margin: 2px 0 0; color: var(--secondary-text-color); font-size: .9em; }
      .art { position: relative; width: clamp(110px, 44%, 190px); }
      .art::before {
        content: ""; position: absolute; inset: 6% 2%; border-radius: 50%; z-index: 0;
        background: radial-gradient(closest-side, color-mix(in srgb, var(--primary-text-color, #888) 14%, transparent), transparent);
      }
      .art img { position: relative; z-index: 1; }
      .art img, .bgimg img {
        display: block; width: 100%; height: auto; object-fit: contain;
        filter: drop-shadow(0 0 1.5px color-mix(in srgb, var(--primary-text-color, #888) 55%, transparent))
                drop-shadow(0 6px 8px rgba(0, 0, 0, .22));
      }
      .art img { max-height: 72px; }
      /* Hintergrundbild oben rechts, zum Rand hin ausgeblendet (wie in der NAS-Card) */
      .bgimg {
        position: absolute; top: 6px; right: 8px; width: 50%;
        opacity: .55; pointer-events: none; z-index: 0;
        -webkit-mask-image: radial-gradient(ellipse 85% 85% at 55% 45%, #000 50%, transparent 100%);
        mask-image: radial-gradient(ellipse 85% 85% at 55% 45%, #000 50%, transparent 100%);
      }

      /* Kacheln */
      .tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      .tile, .fwmain {
        display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 10px;
        box-sizing: border-box; height: 63px; overflow: hidden; padding: 6px 12px;
        border-radius: 16px; background: var(--fill); border: 1px solid var(--line);
        -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
        transition: background .15s;
      }
      .tile:active, .fwmain:active { background: var(--line); }
      .chip {
        width: 36px; height: 36px; border-radius: 12px; display: grid; place-items: center;
        background: var(--line); color: var(--secondary-text-color); --mdc-icon-size: 20px;
      }
      .txt { display: flex; flex-direction: column; min-width: 0; gap: 1px; line-height: 1.25; }
      .lab { font-size: .75em; color: var(--secondary-text-color); letter-spacing: .02em; }
      .val { font-size: 1em; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      .ok   .chip { background: color-mix(in srgb, var(--ok) 20%, transparent);   color: var(--ok); }
      .warn .chip { background: color-mix(in srgb, var(--warn) 22%, transparent); color: var(--warn); }
      .bad  .chip { background: color-mix(in srgb, var(--bad) 20%, transparent);  color: var(--bad); }
      .off  .val  { color: var(--secondary-text-color); font-weight: 400; }
      .ok.tile .val { color: var(--ok); }
      .bad.tile .val { color: var(--bad); }

      /* Abschnitt */
      .sec { display: flex; align-items: center; gap: 8px; height: 20px; color: var(--secondary-text-color); font-size: .85em; font-weight: 600; letter-spacing: .03em; --mdc-icon-size: 18px; }
      .sec::after { content: ""; flex: 1; height: 1px; background: var(--line); }

      /* Firmware-Zeilen */
      .fws { display: grid; grid-template-columns: 1fr; gap: 8px; }
      .fw { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
      .restart {
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
        box-sizing: border-box; height: 63px; min-width: 84px; padding: 8px 10px; border-radius: 16px;
        background: var(--fill); border: 1px solid var(--line);
        color: var(--secondary-text-color); --mdc-icon-size: 20px;
        transition: background .15s, color .15s, border-color .15s;
      }
      .restart .rl { font-size: .72em; font-weight: 600; white-space: nowrap; }
      .restart:active { background: var(--line); }
      .restart[disabled] { opacity: .4; pointer-events: none; }
      .restart.arm { background: color-mix(in srgb, var(--bad) 18%, transparent); border-color: var(--bad); color: var(--bad); }
      .restart.sent { background: color-mix(in srgb, var(--ok) 18%, transparent); border-color: var(--ok); color: var(--ok); }
    `;
  }
}

if (!customElements.get("slzb-card")) {
  customElements.define("slzb-card", SlzbCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "slzb-card")) {
  window.customCards.push({
    type: "slzb-card",
    name: "SLZB Card",
    description: "Übersicht für den SMLIGHT SLZB-MRW10U (Verbindung, Firmware, Neustart)",
    preview: false,
  });
}

console.info(
  `%c SLZB-CARD %c v${SLZB_VERSION} `,
  "color:white;background:#03a9f4;font-weight:700;border-radius:3px 0 0 3px",
  "color:#03a9f4;background:white;font-weight:700;border-radius:0 3px 3px 0"
);
