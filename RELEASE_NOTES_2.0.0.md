# SLZB Card 2.0.0

Das Projekt ist im offiziellen HACS-Katalog verfügbar. Neue Installationen erfolgen über die HACS-Suche.

Bestehende Custom-Repository-Installationen: zuerst die Verfügbarkeit im offiziellen Katalog prüfen, dann nur den Eintrag unter „Benutzerdefinierte Repositories“ entfernen. Die Installation nicht deinstallieren. HACS aktualisieren und die weiterhin erkannte Installation sowie vorhandene Dashboard-Karten prüfen. Konfigurationen und Ressourcen können erhalten bleiben.

Die Major-Version bedeutet nicht automatisch Breaking Changes. Kartentyp und Konfigurationsschlüssel bleiben kompatibel; diese Version erfordert keine Neukonfiguration.

DOM-Ausgaben, Entity-Zustände und Attribute, dynamische Bild-URLs sowie Home-Assistant-Aufrufe wurden geprüft. Es wurde keine bestätigte XSS-Lücke gefunden. Adversariale Rendering-Tests sichern das bestehende Escaping ab. Details und Grenzen stehen in `SECURITY_REVIEW.md`.

Vor Veröffentlichung: Pull-Request-Prüfungen und manuellen Funktionstest in Home Assistant abschließen. Dieses Dokument bereitet ein Release vor; es veröffentlicht keines.
