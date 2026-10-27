# Changelog

## 2.0.1 - 2026-10-27

- Aufräumarbeiten ohne Funktionsänderung: mehrfach vorhandene Prüfung auf nicht erreichbare Geräte zusammengeführt, nie zutreffende Sicherheitsnetze und ein ungenutzter Sonderfall im Editor entfernt. Aussehen, Konfiguration und Verhalten bleiben unverändert.
- Repository verschlankt: nicht benötigte Logo-Dateien und die Pflicht-Dateien `RELEASE_NOTES_<Version>.md` entfernt (der Release-Text kommt jetzt aus diesem Changelog), Security-Review gekürzt.

## 2.0.0 - 2026-10-24

- Aufnahme in den offiziellen HACS-Katalog; Installation über die HACS-Suche als Standardweg dokumentiert.
- Migration bestehender Custom-Repositories beschrieben: nur den benutzerdefinierten Eintrag entfernen, die Installation und vorhandene Dashboard-Konfigurationen erhalten.
- README auf Funktionen, Voraussetzungen, Konfiguration und Bedienung ausgerichtet.
- Security-Review der DOM-Ausgaben, Entity-Werte, Attribute, Bild-URLs und Home-Assistant-Schnittstellen dokumentiert; adversariale Rendering-Tests ergänzt. Keine bestätigte XSS-Lücke im geprüften Stand gefunden.
- Major-Version als Kennzeichnung des HACS-Katalogeintrags: kein automatischer Hinweis auf Breaking Changes; vorhandene Kartentypen und Konfigurationen bleiben kompatibel.

## 1.0.5

- Neue, im Browser erstellte Vorschauen aus dem unveränderten Original-Code in der README.
- Vorschau-Bilder über absolute Raw-URLs für die Anzeige in GitHub und HACS eingebunden.
- Versionsangaben für das Patch-Release aktualisiert.

Keine Änderungen an der Funktionsweise der Karte oder Integration.

