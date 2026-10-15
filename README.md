<img src="https://raw.githubusercontent.com/BeGiBue/home-assistant-slzb-card/main/images/slzb-card-logo-160.png" alt="SLZB Card" width="160">

# SLZB Card

Übersichtskarte für den **SMLIGHT SLZB-MRW10U** (PoE-Gerät mit Zigbee, Z-Wave und Thread) in Home Assistant.

Zeigt auf einen Blick:

- Verbindung, Verbindungsmodus, Firmware-Kanal und Funkstandard
- Firmware-Status für Core, Funkmodul und Z-Wave (aktuell / Update verfügbar / wird installiert). Die mittlere Zeile trägt automatisch den Wert der Kachel „Funkstandard“ als Namen, solange der Sensor verfügbar ist, sonst „Zigbee“.
- Neustart-Buttons mit Sicherheitsabfrage (zweimal tippen)
- Freigestelltes Gerätebild, direkt in der Karte eingebettet (optional eigene Bild-URL)
- Passt sich Light-/Dark-Mode und Themes an, läuft auf Handy, Tablet und Desktop

## Installation über HACS

### Automatisch

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=BeGiBue&repository=home-assistant-slzb-card&category=plugin)

Der Button öffnet deine Home-Assistant-Instanz direkt auf der Seite dieses Repositories in HACS. Dort **Herunterladen** wählen und danach den Browser bzw. die Home-Assistant-App komplett neu laden.

### Manuell

1. HACS öffnen → Menü (drei Punkte) → **Benutzerdefinierte Repositories**
2. `https://github.com/BeGiBue/home-assistant-slzb-card` eintragen, Typ **Dashboard** wählen, hinzufügen
3. **SLZB Card** installieren
4. Browser bzw. Home-Assistant-App komplett neu laden

## Card hinzufügen

Im Dashboard-Editor **Karte hinzufügen → SLZB Card** wählen. Mit den Standardwerten reicht:

```yaml
type: custom:slzb-card
```

Alle Entitäten sind bereits mit deinen Namen vorbelegt und können im grafischen Editor geändert werden.

Vollständiges Beispiel:

```yaml
type: custom:slzb-card
title: SLZB-MRW10U
subtitle: Zigbee · Z-Wave · Thread
show_image: true
confirm_actions: true
connection_entity: binary_sensor.slzb_mrw10u_internet
mode_entity: sensor.slzb_mrw10u_verbindungsmodus
channel_entity: sensor.slzb_mrw10u_firmware_kanal
zigbee_type_entity: sensor.slzb_mrw10u_zigbee_typ
core_update_entity: update.slzb_mrw10u_core_firmware
core_restart_entity: button.slzb_mrw10u_kern_neustart
zigbee_update_entity: update.slzb_mrw10u_zigbee_firmware
zigbee_restart_entity: button.slzb_mrw10u_zigbee_neustart
zwave_update_entity: update.slzb_mrw10u_z_wave_firmware
zwave_restart_entity: button.slzb_mrw10u_z_wave_neustart
```

## Optionen

| Option | Standard | Beschreibung |
| --- | --- | --- |
| `title` | `SLZB-MRW10U` | Haupttitel |
| `subtitle` | `Zigbee · Z-Wave · Thread` | Untertitel |
| `show_image` | `true` | Gerätebild anzeigen |
| `image_mode` | `background` | `background` = transparent oben rechts hinter der obersten Zeile, `inline` = neben dem Titel |
| `image_opacity` | `0.55` | Deckkraft des Hintergrundbilds, 0.1 (kaum sichtbar) bis 1 (voll) |
| `image_url` | leer | Eigenes Bild, z. B. `/local/images/slzb.png` (leer = eingebettetes Bild) |
| `confirm_actions` | `true` | Neustart erst nach zweitem Tippen auslösen |

## Größe

Die Karte hat eine feste Höhe von 500 px. Die Höhe bleibt gleich, egal ob ein Update verfügbar ist, ein Wert fehlt oder die Karte breiter oder schmaler wird. Im Sections-Dashboard ist die Breite von 6 bis 12 Spalten einstellbar, die Höhe misst Home Assistant selbst.

## Bedienung

- Tippen auf eine Kachel oder Firmware-Zeile öffnet die Detailansicht der Entität.
- **Neustart**: einmal tippen → Button wird rot und zeigt „Nochmal tippen“ (4 Sekunden Zeit) → zweites Tippen löst den Neustart aus.

## Hinweis

Unabhängiges Community-Projekt, nicht mit SMLIGHT oder Home Assistant verbunden. Das Gerätebild zeigt den SLZB-MRW10U; die Marke und das Produkt gehören ihren jeweiligen Rechteinhabern.

## Lizenz

GNU Affero General Public License v3.0 only (**AGPL-3.0-only**).

Nutzung, Änderungen und Weitergabe sind unter den Bedingungen der AGPL erlaubt; abgeleitete Werke müssen unter derselben Lizenz stehen. Bei modifizierten Versionen, die über ein Netzwerk genutzt werden, muss der entsprechende Quellcode den Nutzern zugänglich gemacht werden.

Den vollständigen Lizenztext enthält die Datei [`LICENSE`](LICENSE).
