# Security-Review – SLZB Card

Stand: 2026-10-24.

## Ergebnis und Befunde

Im geprüften Projektcode wurden keine bestätigten Sicherheitslücken und insbesondere keine offenen hohen oder kritischen Befunde festgestellt. Das ist ein begrenztes Code-Review und keine Sicherheitsgarantie für Home Assistant, Geräteintegrationen oder den Browser.

| Datei | Risiko / Beobachtung | Schweregrad | Korrektur / Status |
| --- | --- | --- | --- |
| `slzb-card.js` | Eigene Bild-URLs werden direkt vom Browser geladen. Externe Hosts sehen die Browser-IP; konfigurierte HTTP-URLs sind unverschlüsselt. | Niedrig, Konfigurationsrisiko | Lokale `/local/`-Bilder oder vertrauenswürdige HTTPS-Quellen verwenden, keine Zugangsdaten in URLs. In der README dokumentiert; externe Bildquellen bleiben optional verfügbar. |
| `slzb-card.js` | `innerHTML` ist ein sicherheitsrelevanter Sink; kein bestätigter ungefilterter Eingabepfad gefunden. | Information | Vorhandenes Escaping beibehalten und adversariale Regressionstests ausführen; umgesetzt. |

Die Bild-URLs stehen ausschließlich in HTML-escaped, doppelt zitierten `img.src`-Attributen. Es gibt keine dynamischen Navigationslinks, Script-URLs oder HTML-Event-Attribute. Ein Attributausbruch ist durch das Escaping verhindert; eine JavaScript-Ausführung über ein Bild wurde nicht nachgewiesen. Ein URL-Protokollfilter wird daher nicht als behobene XSS-Lücke ausgegeben.

## Geprüfte Vertrauensgrenzen

- Die gesamte JavaScript-Datei wurde gelesen, einschließlich Formschema, Render-Hilfen, CSS-Interpolation und Event-Bindung. `outerHTML`, `insertAdjacentHTML`, `eval` und `new Function` werden nicht eingesetzt.
- Entity-Zustände, Einheiten, formatierte Zustände, Konfigurationstexte, Icons und Entity-Identifier wurden bis zum HTML-Sink verfolgt. Der vorhandene Escaper ersetzt `&`, `<`, `>` und beide Anführungszeichen. Kontrollierte konstante HTML-Fragmente bleiben bewusst Markup.
- Zahlen in dynamischen Styles werden in Zahlen umgewandelt und begrenzt; daraus entsteht kein injizierbarer Attributtext. Event-Handler werden nach dem Rendern als Funktionen gebunden.
- Neustarts laufen über `hass.callService(domain, "press", {entity_id})` nach Benutzerinteraktion und standardmäßig zweitem Tippen. Der konfigurierte Entity-Identifier liefert keine zusätzlichen Rechte; Home Assistant prüft die authentifizierte Service-Anfrage. Die Karte implementiert keine eigene Authentifizierung und verwaltet keine Zugangsdaten.
- Keine eigenen Zugangsdaten, Tokens, persistierten Geheimnisse oder externen API-Endpunkte im Laufzeitcode. Bild-URLs sind die einzige konfigurierbare externe Netzwerkquelle.
- Keine npm-/Python-Laufzeitabhängigkeiten, kein Paketmanager-Manifest oder Lockfile; somit kein Paketbestand für einen Advisory-Abgleich. Das eingebettete Bild ist ein Asset. Home Assistant und Browser gehören zu den technischen Voraussetzungen und müssen unabhängig aktuell gehalten werden. Die CI-Actions sind Validierungswerkzeuge, keine mitgelieferten Laufzeitbibliotheken.

## Tests

Die Sicherheitsgrenze wird durch Tests in `tests/security.test.mjs` abgesichert: Titel/Konfiguration, Entity-Zustand, Einheit bei numerischem Zustand, Bild-URL mit Attributausbruch und Entity-Identifier. Zusätzlich werden der dynamische Funkstandard als Firmware-Label sowie die doppelte Neustart-Bestätigung geprüft. Der Validate-Workflow führt die Syntaxprüfung (`node --check`) und diese Tests bei jedem Push und Pull Request aus; zusätzlich läuft die HACS-Prüfung.

Die Tests rendern die tatsächlichen Kartentemplates mit DOM-Attrappen. Sie prüfen HTML-Ausgabe und Event-/Service-Grenzen, ersetzen aber keinen echten Browser und keinen Home-Assistant-Gerätetest.

## Restrisiken

- Die Entscheidung, externen Bildquellen zu vertrauen, liegt bei der Person, die die Karte konfiguriert (siehe Befund oben).
- Ein manueller Funktionstest in Home Assistant (grafischer Editor, vorhandene Konfiguration, Entitätsdetails, Neustart-Aktionen) wird durch die automatischen Tests nicht ersetzt.
