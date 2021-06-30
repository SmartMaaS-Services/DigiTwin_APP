<h2 align="center">
  <a href="https://smart-maas.eu/en/"><img src="https://github.com/SmartMaaS-Services/Transaction-Context-Manager/blob/main/docs/images/Header.jpeg" alt="Smart MaaS" width="500"></a>
  <br>
      SMART MOBILITY SERVICE PLATFORM
  <br>
  <a href="https://smart-maas.eu/en/"><img src="https://github.com/SmartMaaS-Services/Transaction-Context-Manager/blob/main/docs/images/Logos-Smart-MaaS.png" alt="Smart MaaS" width="250"></a>
  <br>
</h2>

<p align="center">
  <a href="mailto:info@smart-maas.eu">Contact</a> •
  <a href="https://github.com/SmartMaaS-Services/DigiTwin_APP/issues">Issues</a> •
  <a href="https://smart-maas.eu/en/">Project Page</a>
</p>


***

<h1 align="center">
  <a>
    DigiTwin APP
  </a>
</h1>

***


Die DigiTwin APP ist das Beispielhafte Frontend zum DigiTiwin.

Hier werden die Datenmodelle

* MobilityRegion
* MobilityStation
* MobilityService

Zur Anwendung gebracht.


Eine *MobilityRegion* ist ein zusammenhängender Verkehrsraum in dem ein hoher Anteil des täglichen Verkehrs abgewickelt wird.

Die Teilnehmer nutzen alle Möglichkeiten der Mobilität und werden innerhalb einer dieser MobilityRegion durch das Angebot von *MobilityStations* zum umstieg zwischen den Verkehrsmitteln ermutigt.
Ziel dieser Stationen ist es möglichst viel Individualverkehr in ÖPNV zu wandeln den Anreiz zu schaffen alternative Verkehrsmittel zu nutzen.

Im Rahmen von SmartMaaS wurde das Konzept dieser MobilityRegions auf eine FIWARE basierte Plattform übertragen.

Dazu wurden neue Datenmodelle geschaffen die untereinander die Struktur der MobilityRegion abbilden können.

![Uebersicht](/doc/images/Uebersicht_DigiTwin.png)



Eine Routing Funktionalität ist über TripGo in der DigiTwin App aufgenommen worden.

Die App liefert den Status der Mobilitätsstation übersichtlich als Sidebar.

Hier kat man je nach angebotenem MobilityService die Informationen zu z.B. den Parkplätzen, den Rädern der Sprottenflotte oder den Abfahrzeiten.

## Umsetzung

Aufbauend auf eine FIWARE Installation für die KielRegion wurde ein Tenant DigiTwin erstellt der zum einen die neuen Datenmodelle MobilityRegion, MobilityStation und MobilityService aufnimmt und zum anderen die vorhandenen Datenmodelle zu MobilityServices macht.
So ist die Verwaltung der App an diese 3 DatenModell Typen gebunden.

Es muss eine MobilityRegion erzeugt werden:

### MobilityRegion

	{
        "id": "urn:ngsi:MobilityRegion:KielRegion",
        "type": "MobilityRegion",
        "description": {
            "type": "Text",
            "value": "Mobilitätsplattform der KielRegion GmbH"
        },
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [
                    10.1329672,
                    54.3223492
                ]
            }
        },
        "name": {
            "type": "Text",
            "value": "KielRegion"
        }
	}

Dieser MobitityRegion werden dann die MobilityStations zugeordnet:

### MobitityRegion

	[
    {
        "id": "urn:ngsi:MobilityStation:KielRegion:Oppendorf",
        "type": "MobilityStation",
        "description": {
            "type": "Text",
            "value": "Mobilitätsstation Kiel - Bahnhof Oppendorf"
        },
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [
                    10.2086699,
                    54.3262973
                ]
            }
        },
        "name": {
            "type": "Text",
            "value": "Kiel - Bahnhof Oppendorf"
        },
        "refMobilityRegion": {
            "type": "Text",
            "value": "urn:ngsi:MobilityRegion:KielRegion"
        }
    },
    {
        "id": "urn:ngsi:MobilityStation:KielRegion:Hamdorf",
        "type": "MobilityStation",
        "description": {
            "type": "Text",
            "value": "Mobilitätsstation Kiel - Hamdorf",
            "metadata": {}
        },
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [
                    9.514357,
                    54.226997
                ]
            }
        },
        "name": {
            "type": "Text",
            "value": "Hamdorf"
        },
        "refMobilityRegion": {
            "type": "Text",
            "value": "urn:ngsi:MobilityRegion:KielRegion"
        }
    }
	]

Die Mobilitätsstation Russee ist noch nicht gebaut worden.

Darum haben wir nur Oppendorf als Beispiel und Hamdorf als eine zweite Station in den Daten.

Die an den Stationen angebotenen *MobilityServices* werden im 3. Datenmodell aufgenommen und können dort den Gegebenheiten der jeweiligen Station angepasst werden.

### MobilityServices

	[
    {
        "id": "urn:ngsi:MobilityService:KielRegion:Oppendorf:Parking",
        "type": "MobilityService",
        "description": {
            "type": "Text",
            "value": "Parkplatz Bahnhof Oppendorf"
        },
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [
                    10.208399,
                    54.326328
                ]
            }
        },
        "name": {
            "type": "Text",
            "value": "Parkplatz"
        },
        "refMobilityStation": {
            "type": "Text",
            "value": "urn:ngsi:MobilityStation:KielRegion:Oppendorf"
        },
        "refServiceProvider": {
            "type": "Text",
            "value": "urn:ngsi:OffStreetParking:KielRegion:Oppendorf"
        },
        "service": {
            "type": "Text",
            "value": "/parking/offstreet"
        }
    },
    {
        "id": "urn:ngsi:MobilityService:KielRegion:Oppendorf:BikeHire",
        "type": "MobilityService",
        "description": {
            "type": "Text",
            "value": "Sprottenflotte Bahnhof Oppendorf"
        },
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [
                    10.207911,
                    54.326055
                ]
            }
        },
        "name": {
            "type": "Text",
            "value": "Sprottenflotte"
        },
        "refMobilityStation": {
            "type": "Text",
            "value": "urn:ngsi:MobilityStation:KielRegion:Oppendorf"
        },
        "refServiceProvider": {
            "type": "Text",
            "value": "urn:ngsi:BikeHireDockingStation:KielRegion:20050"
        },
        "service": {
            "type": "Text",
            "value": "/transportation/bikehiredockingstations"
        }
    },
    {
        "id": "urn:ngsi:MobilityService:KielRegion:Oppendorf:Bus",
        "type": "MobilityService",
        "description": {
            "type": "Text",
            "value": "KVG Bushaltestelle Bahnhof Oppendorf"
        },
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [
                    10.208553,
                    54.326222
                ]
            }
        },
        "name": {
            "type": "Text",
            "value": "Bushaltestelle"
        },
        "refMobilityStation": {
            "type": "Text",
            "value": "urn:ngsi:MobilityStation:KielRegion:Oppendorf"
        },
        "refServiceProvider": {
            "type": "Text",
            "value": "urn:ngsi:TransportStation:KVG:284"
        },
        "service": {
            "type": "Text",
            "value": "/transportation/transportstations"
        }
    },
    {
        "id": "urn:ngsi:MobilityService:KielRegion:Oppendorf:Train",
        "type": "MobilityService",
        "description": {
            "type": "Text",
            "value": "DB Bahnstation Bahnhof Oppendorf"
        },
        "location": {
            "type": "StructuredValue",
            "value": {
                "type": "Point",
                "coordinates": [
                    10.208855,
                    54.326332
                ]
            }
        },
        "name": {
            "type": "Text",
            "value": "Bahnstation"
        },
        "refMobilityStation": {
            "type": "Text",
            "value": "urn:ngsi:MobilityStation:KielRegion:Oppendorf"
        },
        "refServiceProvider": {
            "type": "Text",
            "value": "urn:ngsi:TransportStation:DB:08004"
        },
        "service": {
            "type": "Text",
            "value": "/transportation/transportstations"
        }
    },
    {
        "id": "urn:ngsi:MobilityService:KielRegion:Oppendorf:AirQuality",
        "type": "MobilityService",
        "description": {
            "type": "Text",
            "value": "Infoservice Luftqualität Bahnhof Oppendorf"
        },
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [
                    10.208026,
                    54.326155
                ]
            }
        },
        "name": {
            "type": "Text",
            "value": "Luftqualität"
        },
        "refMobilityStation": {
            "type": "Text",
            "value": "urn:ngsi:MobilityStation:KielRegion:Oppendorf"
        },
        "refServiceProvider": {
            "type": "Text",
            "value": "urn:ngsi:AirQualityObserved:Umweltbundesamt:DESH057"
        },
        "service": {
            "type": "Text",
            "value": "/info/airquality"
        }
    },
    {
        "id": "urn:ngsi:MobilityService:KielRegion:Oppendorf:Weather",
        "type": "MobilityService",
        "description": {
            "type": "Text",
            "value": "Infoservice Wetter Bahnhof Oppendorf"
        },
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [
                    10.208005,
                    54.326238
                ]
            }
        },
        "name": {
            "type": "Text",
            "value": "Wetter"
        },
        "refMobilityStation": {
            "type": "Text",
            "value": "urn:ngsi:MobilityStation:KielRegion:Oppendorf"
        },
        "refServiceProvider": {
            "type": "Text",
            "value": "urn:ngsi:WeatherObserved:KielRegion:Oppendorf"
        },
        "service": {
            "type": "Text",
            "value": "/info/weather"
        }
    },
    {
        "id": "urn:ngsi:MobilityService:KielRegion:Oppendorf:Parking:Sonderparkplatz",
        "type": "MobilityService",
        "description": {
            "type": "Text",
            "value": "Sonderparkplatz Bahnhof Oppendorf"
        },
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [
                    10.208635,
                    54.326435
                ]
            }
        },
        "name": {
            "type": "Text",
            "value": "Sonderparkplatz"
        },
        "refMobilityStation": {
            "type": "Text",
            "value": "urn:ngsi:MobilityStation:KielRegion:Oppendorf"
        },
        "refServiceProvider": {
            "type": "Text",
            "value": "urn:ngsi:OffStreetParking:KielRegion:Oppendorf:SonderParkplatz"
        },
        "service": {
            "type": "Text",
            "value": "/parking/offstreet"
        }
    },
    {
        "id": "urn:ngsi:MobilityService:KielRegion:Hamdorf:Bus",
        "type": "MobilityService",
        "refServiceProvider": {
            "type": "Text",
            "value": "urn:ngsi:TransportStation:AK:05291"
        }
    }
	]

## Die DigiTwin API

Die DigiTwin API ist hier: https://github.com/SmartMaaS-Services/DigiTwin_API/

damit die DigiTwin APP auch ohne Anmeldung funktioniert wurde eine REST API erstellt die den Zugriff auf die Daten der MobilitätsRegion ermöglicht.
Die Folgenden Endpunkte sind in dieser API abgebildet:

Endpunkt | Beschreibung
---------|-------------
/mobility/regions | Die MobilityRegion
/mobility/stations | Die MobilityStations
/mobility/services | Die MobilityServices
/parking/onstreet | Alle Objekte für den Parkservice vom Type OnStreetParking
/parking/offstreet | Alle Objekte für den Parkservice vom Type OffStreetParking
/parking/spots | Alle Objekte für den Parkservice vom Type  ParkingSpot
/transportation/bikehiredockingstations | Alle Objekte für den Transportation Service BikeHire
/transportation/transportstations | Alle Objekte für den Transportation Service Station (Bushaltestellen oder Bahnhöfe)
/info/weather | Alle Objekte für den Info Service Weather
/info/airquality | Alle Objekte für den Info Service Airquality

## Enviroment Variablen der DigiTwin APP

Enviroment | Variablen
---------- | ---------
DIGITWIN_LOG_LEVEL | LogLevel
DIGITWIN_FIWARE_API_URL | Wo findet die App die API
DIGITWIN_FIWARE_UPDATE | Zeit in Sekunden wie oft die API angefragt wird
DIGITWIN_MAP_CENTER_LONGITUDE | LONGITUDE für das Zentrum der MAP
DIGITWIN_MAP_CENTER_LATITUDE | LATITUDE für das Zentrum der MAP 
DIGITWIN_MAP_INITIAL_ZOOM | Zoom Level beim Starten
DIGITWIN_MAP_STATION_ZOOM | Zoom Level für die Staions
DIGITWIN_TRIPGO_API_URL | URL für die Routing API
DIGITWIN_TRIPGO_API_KEY | Key der Routing API
DIGITWIN_TRIPGO_REGION | Region für das Routing


## neue Datenmodelle

Die neuen Datemodelle liegen hier im REPO https://github.com/SmartMaaS-Services/DiGiTwin_DataModel
und sind nach https://smartdatamodels.org/ übertragen worden.
