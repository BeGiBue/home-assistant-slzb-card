# Security-Review – SLZB Card

Stand: 2026-10-24. Geprüfte Ausgangsbasis: `88687d0332a6e363444f6b5aaa71c78216ae509a` (`main`). Die folgenden Zeilenangaben beziehen sich auf diesen Commit. Zielversion: **2.0.0**.

## Ergebnis und Befunde

Im geprüften Projektcode wurden keine bestätigten Sicherheitslücken und insbesondere keine offenen hohen oder kritischen Befunde festgestellt. Das ist ein begrenztes Code-Review und keine Sicherheitsgarantie für Home Assistant, Geräteintegrationen oder den Browser.

| Repository | Datei / Zeile | Risiko / Beobachtung | Schweregrad | Vorgeschlagene Korrektur / Status |
| --- | --- | --- | --- | --- |
| `home-assistant-slzb-card` | `slzb-card.js:263` | Eigene Bild-URLs werden direkt vom Browser geladen. Externe Hosts sehen die Browser-IP; konfigurierte HTTP-URLs sind unverschlüsselt. | Niedrig, Konfigurationsrisiko | Lokale `/local/`-Bilder oder vertrauenswürdige HTTPS-Quellen verwenden, keine Zugangsdaten in URLs. In README dokumentiert; externe Bildquellen bleiben optional verfügbar. |
| `home-assistant-slzb-card` | `slzb-card.js:269` | `innerHTML` ist ein sicherheitsrelevanter Sink; kein bestätigter ungefilterter Eingabepfad gefunden. | Information | Vorhandenes Escaping beibehalten und adversariale Regressionstests ausführen; umgesetzt. |

Die Bild-URLs stehen ausschließlich in HTML-escaped, doppelt zitierten `img.src`-Attributen. Es gibt keine dynamischen Navigationslinks, Script-URLs oder HTML-Event-Attribute. Ein Attributausbruch ist durch das Escaping verhindert; eine JavaScript-Ausführung über ein Bild wurde nicht nachgewiesen. Ein URL-Protokollfilter wird daher nicht als behobene XSS-Lücke ausgegeben.

## Prüfumfang und Nachprüfung

- Gesamte eigenständige JavaScript-Datei einschließlich Formschema, Render-Hilfen, CSS-Interpolation und Event-Bindung gelesen. `outerHTML`, `insertAdjacentHTML`, `eval` und `new Function` werden nicht eingesetzt.
- Entity-Zustände, Einheiten, formatierte Zustände, Konfigurationstexte, Icons und Entity-Identifier bis zum HTML-Sink verfolgt. Der vorhandene Escaper (`slzb-card.js:50`) ersetzt `&`, `<`, `>`, beide Anführungszeichen. Kontrollierte konstante HTML-Fragmente bleiben bewusst Markup.
- Zahlen in dynamischen Styles werden in Zahlen umgewandelt und begrenzt; daraus entsteht kein injizierbarer Attributtext. Event-Handler werden nach dem Rendern als Funktionen gebunden.
- Neustarts laufen über `hass.callService(domain, "press", {entity_id})` nach Benutzerinteraktion und standardmäßig zweitem Tippen. Der konfigurierte Entity-Identifier liefert keine zusätzlichen Rechte; Home Assistant prüft die authentifizierte Service-Anfrage. Die Karte implementiert keine eigene Authentifizierung und verwaltet keine Zugangsdaten.
- Keine eigenen Zugangsdaten, Tokens, persistierten Geheimnisse oder externen API-Endpunkte im Laufzeitcode. Bild-URLs sind die einzige konfigurierbare externe Netzwerkquelle.
- Keine npm-/Python-Laufzeitabhängigkeiten, kein Paketmanager-Manifest oder Lockfile; somit kein Paketbestand für einen npm-/pip-Advisory-Abgleich. Das eingebettete Bild ist ein Asset. Home Assistant und Browser gehören zu den technischen Voraussetzungen und müssen unabhängig aktuell gehalten werden. CI-Actions sind Entwicklungs-/Validierungswerkzeuge, keine mitgelieferten Laufzeitbibliotheken.

## Änderungen und Tests

Das Review erforderte keinen bestätigten Runtime-Sicherheitsfix. Die bestehende Sicherheitsgrenze wird durch neue Tests in `tests/security.test.mjs` abgesichert: Titel/Konfiguration, Entity-Zustand, Einheit bei numerischem Zustand, Bild-URL mit Attributausbruch und Entity-Identifier. Zusätzlich werden der dynamische Funkstandard als Firmware-Label sowie die doppelte Neustart-Bestätigung geprüft.

- `node --check slzb-card.js`: bestanden.
- `node tests/security.test.mjs`: **7 Tests bestanden**, keine Fehler.
- `node --test tests/security.test.mjs`: bestanden; der Validator führt die Tests auch in CI aus.
- `git diff --check`: bestanden.

Die Node-Tests rendern die tatsächlichen Kartentemplates mit DOM-Attrappen. Sie prüfen HTML-Ausgabe und Event-/Service-Grenzen, ersetzen aber keinen echten Browser und keinen Home-Assistant-Gerätetest. HACS-Prüfung sowie manuelle Prüfung in Home Assistant (grafischer Editor, vorhandene Konfiguration, Entitätsdetails und gegebenenfalls Aktionen) bleiben vor einem Release erforderlich.

## Release-Grenze

Kein offener hoher oder kritischer Security-Befund blockiert diesen Änderungsvorschlag. Die verbleibende Bildquellen-Vertrauensentscheidung ist dokumentiert. README, Changelog und Release Notes beschreiben offiziellen HACS-Katalog und Custom-Repository-Migration ohne Deinstallation. Der Major-Sprung bedeutet nicht automatisch Breaking Changes; Kartentyp und Konfigurationsschlüssel bleiben kompatibel. Es wurden keine Releases oder Tags erstellt.
