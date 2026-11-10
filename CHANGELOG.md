# Changelog

## 2.2.0 - 2026-11-10

- New look in line with the NAS, Eaton UPS and TouchKio cards: tinted icons, larger title, firmware rows with version number and a status pill ("Up to date", "Update" with the new version, progress in percent with a bar while installing). / Neues Aussehen passend zu NAS-, Eaton-UPS- und TouchKio-Card: getönte Symbole, größerer Titel, Firmware-Zeilen mit Versionsnummer und Status-Pill („Aktuell", „Update" mit der neuen Version, Fortschritt in Prozent mit Balken während der Installation).
- The card is built once and then only swaps the values that changed. "Tap again" on a restart button and the keyboard focus now survive incoming values, and the device image is no longer reloaded. / Die Karte wird einmal aufgebaut und tauscht danach nur geänderte Werte. „Nochmal tippen" am Neustart-Button und der Tastaturfokus überstehen jetzt eintreffende Werte, das Gerätebild wird nicht mehr neu geladen.
- Text and spacing grow with the card width (phone, tablet, kiosk); a few pixels of width change no longer make the size flip. / Schrift und Abstände wachsen mit der Kartenbreite (Handy, Tablet, Kiosk); wenige Pixel Breitenänderung lassen die Größe nicht mehr kippen.
- The fixed minimum height of 500 px is gone; the card reports the height it needs to the Sections dashboard. / Die feste Mindesthöhe von 500 px entfällt; die Karte meldet dem Sections-Dashboard die benötigte Höhe.
- The background image stays in the header area and no longer covers tiles on wide cards. / Das Hintergrundbild bleibt im Kopfbereich und überdeckt auf breiten Karten keine Kacheln mehr.
- Visible focus outline and press feedback on all buttons; no blur effects (easier on a Raspberry Pi kiosk); respects "reduce motion". / Sichtbarer Fokusrahmen und Rückmeldung beim Antippen auf allen Schaltflächen; keine Blur-Effekte (schont einen Raspberry-Pi-Kiosk); beachtet „Bewegung reduzieren".
- Card type, options and entities are unchanged; no dashboard changes needed. / Kartentyp, Optionen und Entitäten bleiben unverändert; am Dashboard ist nichts anzupassen.
- Browser tests added (no rebuild on value changes, confirmation, layout at several widths). / Browser-Tests ergänzt (kein Neuaufbau bei Wertänderungen, Bestätigung, Layout in mehreren Breiten).

## 2.1.0 - 2026-11-04

- The card and its editor now appear in English by default and in German when Home Assistant is set to German. / Karte und Editor erscheinen jetzt standardmäßig auf Englisch und auf Deutsch, wenn Home Assistant auf Deutsch eingestellt ist.
- README shortened and available in English and German. / README gekürzt und auf Englisch und Deutsch verfügbar.

## 2.0.1 - 2026-10-27

- Aufräumarbeiten ohne Funktionsänderung: mehrfach vorhandene Prüfung auf nicht erreichbare Geräte zusammengeführt, nie zutreffende Sicherheitsnetze und ein ungenutzter Sonderfall im Editor entfernt. Aussehen, Konfiguration und Verhalten bleiben unverändert.
- Repository verschlankt: nicht benötigte Logo-Dateien und die Pflicht-Dateien `RELEASE_NOTES_<Version>.md` entfernt (der Release-Text kommt jetzt aus diesem Changelog).

## 2.0.0 - 2026-10-24

- Aufnahme in den offiziellen HACS-Katalog; Installation über die HACS-Suche als Standardweg dokumentiert.
- Migration bestehender Custom-Repositories beschrieben: nur den benutzerdefinierten Eintrag entfernen, die Installation und vorhandene Dashboard-Konfigurationen erhalten.
- README auf Funktionen, Voraussetzungen, Konfiguration und Bedienung ausgerichtet.
- Adversariale Rendering-Tests für DOM-Ausgaben, Entity-Werte, Attribute, Bild-URLs und Home-Assistant-Schnittstellen ergänzt.
- Major-Version als Kennzeichnung des HACS-Katalogeintrags: kein automatischer Hinweis auf Breaking Changes; vorhandene Kartentypen und Konfigurationen bleiben kompatibel.

## 1.0.5

- Neue, im Browser erstellte Vorschauen aus dem unveränderten Original-Code in der README.
- Vorschau-Bilder über absolute Raw-URLs für die Anzeige in GitHub und HACS eingebunden.
- Versionsangaben für das Patch-Release aktualisiert.

Keine Änderungen an der Funktionsweise der Karte oder Integration.

