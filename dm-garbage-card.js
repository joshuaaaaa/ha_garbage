// dm-garbage-card: karta pro svoz odpadu ve stylu "DashboardModern"
// (stejná vizuální rodina jako dm-server-card / dm-nas-card / dm-fritz-card).
// Zobrazuje dynamický obrázek podle druhu odpadu, den svozu, čas, kdy
// popelnici vystavit, odpočet do nejbližšího svozu a tlačítko „Vyneseno".
// Soubor je soběstačný: nevyžaduje zbytek rodiny dm-*, stačí tenhle jeden.
//
// Nastavení (ozubené kolo vpravo nahoře): ve výchozím stavu otevře nativní
// okno se seznamem entit předaných v `settings_sections` (žádná další
// závislost). Pokud už používáš integraci browser_mod a máš radši její popup,
// předej v konfiguraci `legacy_settings_popup` (viz README) a použije se ten.
//
// Volitelná tlačítka v záhlaví:
//  - megafon: `alexa_settings_path` = cesta na TVOJI sdílenou stránku
//    s nastavením hlasových hlášení (např. "/lovelace/centrum-oznameni").
//  - kalendář: `calendar_path` = cesta na kalendář se svozy (např. "/calendar").
// Když je nenastavíš, tlačítka se prostě nezobrazí.
//
// Autor: Simonz82

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const ICON_GEAR =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>';
const ICON_TIMER =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/></svg>';
const ICON_TREND =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 6h6v6"/></svg>';
const ICON_CALENDAR =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>';
const ICON_TRUCK =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16V6a1 1 0 0 1 1-1h10v11"/><path d="M14 9h3.5l2.5 3v4"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/></svg>';
const ICON_MEGAPHONE =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l3.5 4.5V5.5L6 10H4a1 1 0 0 0-1 1z"/><path d="M13 8a3 3 0 0 1 0 8"/><path d="M16 5.5a6.5 6.5 0 0 1 0 13"/></svg>';
const ICON_CHECK =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
const ICON_RECYCLE =
  '<svg viewBox="0 0 96 96" width="27" height="27"><path fill="#0f2942" d="M30 30h36l-4 50a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6l-4-50z"/><rect x="26" y="22" width="44" height="8" rx="3" fill="#0f2942"/><rect x="40" y="12" width="16" height="8" rx="2" fill="#0f2942"/><path fill="#22c55e" d="M48 38c-5 4-8 8-8 12a8 8 0 0 0 16 0c0-2-.5-4-1.5-6 0 2-1.5 3.5-3 3-1.5-.5-1.5-3.5-.5-5.5-2 .5-3 1.5-3 1.5z"/></svg>';

const STYLE = `
:host{display:block;--dm-blue:#0ea5e9;--dm-blue-deep:#0369a1;--dm-dim:var(--secondary-text-color,#64748b);--dm-card:var(--card-background-color,#ffffff);--dm-border:var(--divider-color,#e6ecf4);--dm-soft:rgba(148,163,184,.10);--dm-text:var(--primary-text-color,#0f172a)}
.dm-ap-card{position:relative;display:flex;flex-direction:column;border:1px solid var(--dm-border);border-radius:22px;background:var(--dm-card);box-shadow:0 12px 30px rgba(15,23,42,.06);overflow:hidden}
.dm-ap-top{display:flex;align-items:center;gap:7px;padding:12px 12px 9px}
.dm-ap-chip{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;border-radius:11px;background:#eff6ff;box-shadow:inset 0 0 0 1px rgba(59,130,246,.10)}
.dm-ap-chip svg{width:27px;height:27px}
.dm-ap-headings{display:flex;flex-direction:column;min-width:0;flex:1;gap:1px}
.dm-ap-name{font-size:14.5px;font-weight:900;letter-spacing:-.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dm-text)}
.dm-ap-badge{display:inline-flex;align-items:center;gap:4px;flex:0 0 auto;padding:4px 7px;border-radius:999px;font-size:9.5px;font-weight:900;letter-spacing:.4px;text-transform:uppercase;white-space:nowrap}
.dm-ap-badge.run{background:#dcfce7;color:#15803d}
.dm-ap-badge.off{background:#f1f5f9;color:#64748b}
[data-theme-dark] .dm-ap-badge.off,:host-context([data-theme="dark"]) .dm-ap-badge.off{background:rgba(148,163,184,.16);color:#94a3b8}
.dm-ap-dot{width:7px;height:7px;border-radius:50%;background:currentColor}
.dm-ap-tools{display:flex;gap:4px;flex:0 0 auto}
.dm-ap-tool{width:37px;height:37px;display:grid;place-items:center;border:1px solid var(--dm-border);border-radius:11px;background:var(--dm-card);color:var(--dm-dim);cursor:pointer}
.dm-ap-tool svg{width:19px;height:19px}
.dm-ap-tool:hover{border-color:#bae6fd;color:var(--dm-blue-deep)}
.dm-ap-top-row{display:flex;align-items:stretch;gap:10px;margin:0 13px;padding-bottom:10px}
.dm-ap-hero{position:relative;flex:1 1 50%;min-width:0;display:flex;align-items:center;justify-content:center;height:182px;margin:0;border-radius:18px;background:radial-gradient(120% 90% at 50% 8%,rgba(224,242,254,.65),rgba(241,245,249,.35) 60%,transparent);overflow:visible;cursor:pointer}
.dm-c-garbage-img{width:100%;height:100%;object-fit:contain;transform:scale(0.95)}
.dm-ap-cycle-side{flex:1 1 50%;min-width:0;display:flex;flex-direction:column;padding:11px 13px;border-radius:16px;background:var(--dm-soft)}
.dm-ap-cycle-cap{display:flex;align-items:center;gap:6px;margin-top:-3px;margin-bottom:15px;font-size:11px;font-weight:900;letter-spacing:1.4px;text-transform:uppercase;color:var(--dm-dim)}
.dm-ap-cycle-list{display:flex;flex-direction:column;flex:1;justify-content:flex-start;gap:4px}
.dm-ap-cycle-row{display:flex;align-items:baseline;justify-content:space-between;gap:8px;min-width:0}
.dm-ap-cycle-row[hidden]{display:none}
.dm-ap-cycle-row small{flex:0 0 auto;font-size:10.5px;font-weight:900;letter-spacing:.7px;text-transform:uppercase;color:var(--dm-dim)}
.dm-ap-cycle-row b{min-width:0;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13.5px;font-weight:400;letter-spacing:-.1px;color:var(--dm-text)}
.dm-ap-cycle-row-b{padding:4px 8px;border-radius:9px;border:1px solid var(--dm-border);background:var(--dm-card);align-items:center}
.dm-ap-cycle-label{display:flex;align-items:center;gap:5px;min-width:0}
.dm-ap-cycle-ic{display:flex;align-items:center;flex:0 0 auto;color:var(--dm-blue)}
.dm-ap-warn{display:flex;align-items:center;gap:6px;margin:0 13px 12px;padding:9px 12px;border-radius:13px;background:#fee2e2;color:#b91c1c;font-size:13px;font-weight:800}
.dm-ap-warn.ok{background:#dcfce7;color:#15803d}
.dm-ap-warn[hidden]{display:none}
.dm-ap-done{display:flex;align-items:center;justify-content:center;gap:7px;width:calc(100% - 26px);margin:0 13px 13px;padding:11px 12px;border:1px solid var(--dm-border);border-radius:14px;background:var(--dm-soft);color:var(--dm-text);font-family:inherit;font-size:13.5px;font-weight:800;cursor:pointer}
.dm-ap-done:hover{border-color:#bae6fd}
.dm-ap-done.done{background:#dcfce7;border-color:#bbf7d0;color:#15803d}
.dm-ap-done[hidden]{display:none}

.dm-ap-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(6px)}
.dm-ap-overlay[hidden]{display:none}
.dm-ap-dialog{width:min(440px,100%);max-height:min(84vh,720px);overflow:auto;background:var(--dm-card);color:var(--dm-text);border:1px solid var(--dm-border);border-radius:22px;box-shadow:0 24px 70px rgba(15,23,42,.3)}
.dm-ap-dialog-head{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 16px 10px;background:var(--dm-card);border-bottom:1px solid var(--dm-border);z-index:1}
.dm-ap-dialog-head h3{margin:0;font-size:17px;font-weight:900}
.dm-ap-dialog-close{width:30px;height:30px;flex:0 0 auto;display:grid;place-items:center;border:0;border-radius:10px;background:var(--dm-soft);color:var(--dm-dim);cursor:pointer}
.dm-ap-dialog-body{padding:12px 16px 18px;display:flex;flex-direction:column;gap:16px}
.dm-ap-sec{display:flex;flex-direction:column;gap:6px}
.dm-ap-sec-cap{font-size:11.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:var(--dm-blue-deep);margin:0 0 8px;padding-bottom:5px;border-bottom:2px solid var(--dm-border)}
.dm-ap-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;border-radius:13px;background:var(--dm-soft)}
.dm-ap-row.today{box-shadow:inset 0 0 0 2px #bae6fd}
.dm-ap-row-label{font-size:14.5px;font-weight:750;color:var(--dm-text)}
.dm-ap-row-val{font-size:14.5px;font-weight:500;color:var(--dm-dim)}

@media (max-width:600px){
  .dm-ap-overlay{align-items:flex-end;padding:0;backdrop-filter:blur(4px)}
  .dm-ap-dialog{width:100%;max-width:100%;height:94vh;max-height:94vh;border-radius:22px 22px 0 0;display:flex;flex-direction:column}
  .dm-ap-dialog-body{flex:1}
}
`;

const PRAZDNO = ["Nic", "unknown", "unavailable", ""];

class DmGarbageCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) throw new Error("entity je povinná");
    this._config = {
      name: "Svoz odpadu",
      state_images: {},
      settings_sections: [
        {
          title: "Dny svozu",
          rows: [],
        },
      ],
      ...config,
    };
    this._root = this._root || this.attachShadow({ mode: "open" });
    const alexaBtn = this._config.alexa_settings_path
      ? `<button type="button" class="dm-ap-tool dm-ap-alexa" title="Hlasová oznámení">${ICON_MEGAPHONE}</button>`
      : "";
    const calBtn = this._config.calendar_path
      ? `<button type="button" class="dm-ap-tool dm-ap-cal" title="Kalendář svozů">${ICON_CALENDAR}</button>`
      : "";
    this._root.innerHTML = `<style>${STYLE}</style>
      <article class="dm-ap-card">
        <div class="dm-ap-top">
          <span class="dm-ap-chip">${ICON_RECYCLE}</span>
          <span class="dm-ap-headings">
            <span class="dm-ap-name"></span>
          </span>
          <span class="dm-ap-badge"><i class="dm-ap-dot"></i><span class="dm-ap-badge-label"></span></span>
          <span class="dm-ap-tools">
            ${calBtn}
            ${alexaBtn}
            <button type="button" class="dm-ap-tool dm-ap-settings" title="Nastavení">${ICON_GEAR}</button>
          </span>
        </div>
        <div class="dm-ap-top-row">
          <div class="dm-ap-hero">
            <img class="dm-c-garbage-img" alt="">
          </div>
          <div class="dm-ap-cycle-side">
            <span class="dm-ap-cycle-cap">Přehled</span>
            <div class="dm-ap-cycle-list">
              <div class="dm-ap-cycle-row dm-ap-cycle-row-b"><span class="dm-ap-cycle-label"><span class="dm-ap-cycle-ic">${ICON_CALENDAR}</span><small>Dnes je</small></span><b class="dm-c-weekday">—</b></div>
              <div class="dm-ap-cycle-row dm-ap-cycle-row-b"><span class="dm-ap-cycle-label"><span class="dm-ap-cycle-ic">${ICON_TIMER}</span><small>Vystavit od</small></span><b class="dm-c-exposetime">—</b></div>
              <div class="dm-ap-cycle-row dm-ap-cycle-row-b"><span class="dm-ap-cycle-label"><span class="dm-ap-cycle-ic">${ICON_TREND}</span><small>Den svozu</small></span><b class="dm-c-pickupday">—</b></div>
              <div class="dm-ap-cycle-row dm-ap-cycle-row-b dm-c-next-row" hidden><span class="dm-ap-cycle-label"><span class="dm-ap-cycle-ic">${ICON_TRUCK}</span><small>Příští svoz</small></span><b class="dm-c-next">—</b></div>
            </div>
          </div>
        </div>
        <div class="dm-ap-warn" hidden></div>
        <button type="button" class="dm-ap-done" hidden></button>
      </article>`;
    this._root.querySelector(".dm-ap-name").textContent = this._config.name;

    this._root.querySelector(".dm-ap-settings").addEventListener("click", (e) => {
      e.stopPropagation();
      if (this._config.legacy_settings_popup) {
        // Popup z browser_mod (HACS), pokud ho už používáš a máš ho radši než nativní dialog.
        const event = new Event("ll-custom", { bubbles: true, composed: true });
        event.detail = { browser_mod: this._config.legacy_settings_popup };
        this.dispatchEvent(event);
      } else {
        this._openSettings();
      }
    });

    const alexaEl = this._root.querySelector(".dm-ap-alexa");
    if (alexaEl) {
      alexaEl.addEventListener("click", (e) => {
        e.stopPropagation();
        this._navigate(this._config.alexa_settings_path);
      });
    }

    const calEl = this._root.querySelector(".dm-ap-cal");
    if (calEl) {
      calEl.addEventListener("click", (e) => {
        e.stopPropagation();
        this._navigate(this._config.calendar_path);
      });
    }

    this._root.querySelector(".dm-ap-hero").addEventListener("click", () => {
      this._moreInfo(this._config.entity);
    });

    this._root.querySelector(".dm-ap-done").addEventListener("click", (e) => {
      e.stopPropagation();
      if (!this._config.done_entity || !this._hass) return;
      this._hass.callService("input_boolean", "toggle", { entity_id: this._config.done_entity });
    });
  }

  _navigate(path) {
    history.pushState(null, "", path);
    window.dispatchEvent(new CustomEvent("location-changed", { bubbles: true, composed: true }));
  }

  _moreInfo(entityId) {
    const e = new Event("hass-more-info", { bubbles: true, composed: true });
    e.detail = { entityId };
    this.dispatchEvent(e);
  }

  _row(label, valueHtml, extraClass = "") {
    return `<div class="dm-ap-row ${extraClass}"><span class="dm-ap-row-label">${esc(label)}</span>${valueHtml}</div>`;
  }

  _openDialog(title, bodyHtml) {
    let overlay = this._root.querySelector(".dm-ap-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "dm-ap-overlay";
      overlay.hidden = true;
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.hidden = true;
      });
      this._root.appendChild(overlay);
    }
    overlay.innerHTML = `<div class="dm-ap-dialog">
      <div class="dm-ap-dialog-head"><h3>${esc(title)}</h3><button type="button" class="dm-ap-dialog-close">${ICON_CLOSE}</button></div>
      <div class="dm-ap-dialog-body">${bodyHtml}</div>
    </div>`;
    overlay.querySelector(".dm-ap-dialog-close").addEventListener("click", () => {
      overlay.hidden = true;
    });
    overlay.hidden = false;
    return overlay;
  }

  _settingsRowHtml(hass, row) {
    const st = hass.states[row.entity];
    if (!st) return this._row(row.label, `<span class="dm-ap-row-val">nedostupné</span>`);
    const unit = st.attributes?.unit_of_measurement || "";
    // Řádek dne, na který svoz opravdu připadá, se zvýrazní.
    const dnesniDen = ["ne", "po", "ut", "st", "ct", "pa", "so"][new Date().getDay()];
    const today = row.entity.endsWith("_" + dnesniDen) ? "today" : "";
    return `<div class="dm-ap-row ${today}" data-open-entity="${esc(row.entity)}" style="cursor:pointer">
      <span class="dm-ap-row-label">${esc(row.label)}</span>
      <span class="dm-ap-row-val">${esc(st.state)}${unit ? " " + esc(unit) : ""}</span>
    </div>`;
  }

  _openSettings() {
    const hass = this._hass;
    const sections = (this._config.settings_sections || [])
      .map(
        (sec) => `<div class="dm-ap-sec">
          <div class="dm-ap-sec-cap">${esc(sec.title)}</div>
          ${sec.rows.map((row) => this._settingsRowHtml(hass, row)).join("")}
        </div>`,
      )
      .join("");

    const overlay = this._openDialog("Nastavení", sections);

    overlay.querySelectorAll("[data-open-entity]").forEach((row) => {
      row.addEventListener("click", () => {
        this._moreInfo(row.dataset.openEntity);
      });
    });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    const cfg = this._config;

    const st = hass.states[cfg.entity];
    const state = st?.state;

    const badge = this._root.querySelector(".dm-ap-badge");
    badge.classList.remove("run", "off");
    const nicKVystaveni = !state || PRAZDNO.includes(state);
    badge.classList.add(nicKVystaveni ? "off" : "run");
    this._root.querySelector(".dm-ap-badge-label").textContent = state || "N/A";

    const img = this._root.querySelector(".dm-c-garbage-img");
    const imgUrl = (cfg.state_images || {})[state] || (cfg.state_images || {}).Nic || "";
    if (img.getAttribute("data-src") !== imgUrl) {
      img.src = imgUrl;
      img.setAttribute("data-src", imgUrl);
      img.alt = state || "";
    }

    if (cfg.weekday_entity) {
      this._root.querySelector(".dm-c-weekday").textContent = hass.states[cfg.weekday_entity]?.state ?? "—";
    }
    if (cfg.expose_time_entity) {
      const t = hass.states[cfg.expose_time_entity]?.state;
      this._root.querySelector(".dm-c-exposetime").textContent = t ? t.slice(0, 5) : "—";
    }
    if (cfg.pickup_day_entity) {
      this._root.querySelector(".dm-c-pickupday").textContent = hass.states[cfg.pickup_day_entity]?.state ?? "—";
    }

    // Příští svoz – zobrazí se, jen když je entita nakonfigurovaná.
    const nextRow = this._root.querySelector(".dm-c-next-row");
    const nextSt = cfg.next_pickup_entity ? hass.states[cfg.next_pickup_entity] : null;
    nextRow.hidden = !nextSt;
    if (nextSt) {
      this._root.querySelector(".dm-c-next").textContent = nextSt.attributes?.popis || nextSt.state;
    }

    // Tlačítko „Vyneseno" + pruh s připomínkou
    const doneSt = cfg.done_entity ? hass.states[cfg.done_entity] : null;
    const done = doneSt?.state === "on";
    const btn = this._root.querySelector(".dm-ap-done");
    btn.hidden = !doneSt;
    if (doneSt) {
      btn.classList.toggle("done", done);
      btn.innerHTML = `${ICON_CHECK}<span>${done ? "Vyneseno – hotovo" : "Označit jako vyneseno"}</span>`;
    }

    const warn = this._root.querySelector(".dm-ap-warn");
    if (nicKVystaveni) {
      warn.hidden = true;
    } else if (done) {
      warn.hidden = false;
      warn.classList.add("ok");
      warn.textContent = `✅ Popelnice (${state}) je venku`;
    } else {
      warn.hidden = false;
      warn.classList.remove("ok");
      warn.textContent = `🗑️ Dnes večer vystav: ${state}`;
    }
  }

  getCardSize() {
    return 5;
  }

  static getConfigElement() {
    return null;
  }

  static getStubConfig() {
    return {
      entity: "sensor.svoz_odpadu",
      weekday_entity: "sensor.den_v_tydnu",
      pickup_day_entity: "sensor.den_svozu",
      next_pickup_entity: "sensor.pristi_svoz",
      expose_time_entity: "input_datetime.svoz_odpadu_zacatek_oznameni",
      done_entity: "input_boolean.svoz_odpadu_vyneseno",
      state_images: {
        "Papír": "/local/odpad/papir.png",
        Sklo: "/local/odpad/sklo.png",
        Plast: "/local/odpad/plast.png",
        Bioodpad: "/local/odpad/bio.png",
        "Bio a směsný": "/local/odpad/bio_a_smesny.png",
        "Směsný odpad": "/local/odpad/smesny.png",
        Nic: "/local/odpad/nic.png",
      },
    };
  }
}

customElements.define("dm-garbage-card", DmGarbageCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "dm-garbage-card",
  name: "DM Garbage Card",
  description: "Karta pro svoz odpadu: dynamický obrázek podle druhu odpadu, den svozu, čas vystavení a odpočet do příštího svozu",
  author: "Simonz82",
});
