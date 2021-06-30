import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';

import { ConfigService } from './services/config.service';
import { LoggerService } from './services/logger.service';
import { FiwareService } from './services/fiware.service';
import { TripgoService } from './services/tripgo.service';
import { NextbikeService } from './services/nextbike.service';
import { GtfsService } from './services/gtfs.service';

import { MobilityRegion } from './schemas/MobilityRegion';
import { MobilityService } from './schemas/MobilityService';
import { MobilityStation } from './schemas/MobilityStation';

import { GtfsStop } from './schemas/gtfs/GtfsStop';
import { BikeHireDockingStation } from './schemas/fiware/BikeHireDockingStation';

import { Location, Trip } from './routing/routing.component';

import { faDirections, faPlus, faMinus, faLayerGroup, faBicycle, faBus, faTrain, faMapMarkerAlt, faInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'Digital Twin App';

  faDirections = faDirections;
  faPlus = faPlus;
  faMinus = faMinus;
  faLayerGroup = faLayerGroup;
  faBicycle = faBicycle;
  faBus = faBus;
  faTrain = faTrain;
  faMapMarkerAlt = faMapMarkerAlt;
  faInfo = faInfo;

  public startLocation: Location;
  public endLocation: Location;

  public showMobility: boolean = false;
  public showRouting: boolean = false;

  private agencies: string[] = ['KVG', 'VKP', 'AK', 'DB'];
  private nextbike: string = 'Sprottenflotte';

  private map: any;

  private mobilityRegionMarkers: L.LayerGroup;
  private showMobilityRegionMarkers: boolean;
  private mobilityStationMarkers: L.LayerGroup;
  private showMobilityStationMarkers: boolean;
  private mobilityServiceMarkers: L.LayerGroup;
  private showMobilityServiceMarkers: boolean;

  private layerGroupMap: Map<string, L.LayerGroup>;
  private showLayerGroup: Map<string, boolean>;
  private markerClusterGroup: L.MarkerClusterGroup;
  private showMarkerClusterGroup: boolean;
  
  private startIcon: any;
  private endIcon: any;

  private startMarker: any = null;
  private endMarker: any = null;

  private tripLayerGroup: L.LayerGroup;
  private showTripLayerGroup: boolean;

  constructor(private config: ConfigService, private logger: LoggerService, private fiwareService: FiwareService, private tripgoService: TripgoService, private nextbikeService:NextbikeService, private gtfsService: GtfsService) {
    this.logger.info('*** Digital Twin APP ***');

    this.mobilityRegionMarkers = new L.LayerGroup();
    this.showMobilityRegionMarkers = false;
    this.mobilityStationMarkers = new L.LayerGroup();
    this.showMobilityStationMarkers = false;
    this.mobilityServiceMarkers = new L.LayerGroup();
    this.showMobilityServiceMarkers = false;

    this.layerGroupMap = new Map<string, L.LayerGroup>();
    this.showLayerGroup = new Map<string, boolean>();

    this.showLayerGroup.set(this.nextbike, false);
    for (let agency of this.agencies) {
      this.showLayerGroup.set(agency, false);
    }

    this.markerClusterGroup = L.markerClusterGroup();
    this.showMarkerClusterGroup = false;

    this.startLocation = {} as Location;
    this.endLocation = {} as Location;

    this.startIcon = new L.Icon({
      iconUrl: './assets/StartMarker.png',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -42]
    });

    this.endIcon = new L.Icon({
      iconUrl: './assets/EndMarker.png',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -42]
    });

    this.startMarker = null;
    this.endMarker = null;

    this.tripLayerGroup = new L.LayerGroup();
    this.showTripLayerGroup = false;
  }

  ngOnInit(): void {
    this.map = new L.Map('map', { zoomControl: false })
      .setView([this.config.DIGITWIN_MAP_CENTER_LATITUDE, this.config.DIGITWIN_MAP_CENTER_LONGITUDE], this.config.DIGITWIN_MAP_INITIAL_ZOOM);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19})
      .addTo(this.map);

    this.getMobilityRegions();
    this.getMobilityStations();
    this.getMobilityServices();
  }

  ngAfterViewInit(): void {
    this.showMobilityRegions();
    this.showMobilityStations();
    this.hideMobilityServices();

    this.layerGroupMap.set(this.nextbike, this.getBikeHireDockingStations());
    for (let agency of this.agencies) {
      this.layerGroupMap.set(agency, this.getGtfsStops(agency));
    }

    this.markerClusterGroup = this.getPublicTransport(this.agencies);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e.latlng)
    });

    this.map.on('popupopen', (e: L.PopupEvent) => {
      this.onMapPopupOpen(e);
    });

    this.map.on('zoom', (e: L.LayerEvent) => {
      this.onMapZoom(e);
    });
  }

  ngOnDestroy(): void {
  }

  displayTripEvent(trip: Trip): void {
    this.hideTripLayerGroup();
    this.tripLayerGroup.clearLayers();

    for (let segment of trip.segments) {
      let color: string = '#95C11F';
      if (segment.modeIcon) {
        switch (segment.modeIcon) {
          case 'walking':
            color = '#95C11F';
            break;
          case 'bicycle':
            color = 'green';
            break;
          case 'bus':
            color = 'lightskyblue';
            break;
          case 'train':
            color = 'blue';
            break;
          case 'motorbike':
            color = 'orange';
            break;
          case 'car':
            color = 'red';
            break;
          case 'taxi':
            color = 'violet';
            break;
        }
      }

      if (segment.streets) {
        for (let street of segment.streets) {
          let polyline: L.LatLng[] = [];
          for (let point = 0; point < street.waypoints.length; point++) {
            polyline.push(new L.LatLng(street.waypoints[point][0], street.waypoints[point][1]));
          }
          if (polyline.length > 0) {
            L.polyline(polyline, {color: color, weight: 5, opacity: 0.8}).addTo(this.tripLayerGroup);
            L.circleMarker(polyline[0], {color: color, weight: 5, opacity: 0.8, fillColor: '#FFFFFF', fillOpacity: 1, radius: 5}).addTo(this.tripLayerGroup);
            L.circleMarker(polyline[polyline.length - 1], {color: color, weight: 5, opacity: 0.8, fillColor: '#FFFFFF', fillOpacity: 1, radius: 5}).addTo(this.tripLayerGroup);
          }
        }
      }

      if (segment.shapes) {
        for (let shape of segment.shapes) {
          if (shape.travelled) {
            let polyline: L.LatLng[] = [];
            for (let point = 0; point < shape.waypoints.length; point++) {
              polyline.push(new L.LatLng(shape.waypoints[point][0], shape.waypoints[point][1]));
            }
            if (polyline.length > 0) {
              L.polyline(polyline, {color: color, weight: 5, opacity: 0.8}).addTo(this.tripLayerGroup);
              L.circleMarker(polyline[0], {color: color, weight: 5, opacity: 0.8, fillColor: '#FFFFFF', fillOpacity: 1, radius: 5}).addTo(this.tripLayerGroup);
              L.circleMarker(polyline[polyline.length - 1], {color: color, weight: 5, opacity: 0.8, fillColor: '#FFFFFF', fillOpacity: 1, radius: 5}).addTo(this.tripLayerGroup);
            }
          }
        }
      }
    }
    this.displayTripLayerGroup();
  }

  clearTripEvent(): void {
    this.hideTripLayerGroup();
    this.tripLayerGroup.clearLayers();
  }

  private displayTripLayerGroup(): void {
    if (!this.showTripLayerGroup) {
      this.tripLayerGroup.addTo(this.map);
      this.showTripLayerGroup = true;
    }
  }

  private hideTripLayerGroup(): void {
    if (this.showTripLayerGroup) {
      this.tripLayerGroup.removeFrom(this.map);
      this.showTripLayerGroup = false;
    }
  }

  private onMapZoom(e: L.LayerEvent): void {
    let zoomLevel: number = this.map.getZoom();
    if (zoomLevel >= this.config.DIGITWIN_MAP_STATION_ZOOM) {
      this.showMobilityServices();
    } else {
      this.hideMobilityServices();
    }
  }

  zoomIn(): void {
    this.map.zoomIn();
  }

  zoomOut(): void {
    this.map.zoomOut();
  }

  centerMap(): void {
    this.map.setView([this.config.DIGITWIN_MAP_CENTER_LATITUDE, this.config.DIGITWIN_MAP_CENTER_LONGITUDE], this.config.DIGITWIN_MAP_INITIAL_ZOOM);
  }

  toggleMobility(): void {
    this.showMobility = !this.showMobility;
  }

  toggleRouting(): void {
    this.showRouting = !this.showRouting;
  }

  togglePublicTransport(): void {
    this.showMarkerClusterGroup = !this.showMarkerClusterGroup;
    if (this.showMarkerClusterGroup) {
      this.markerClusterGroup.addTo(this.map);
      for (let [provider, show] of this.showLayerGroup) {
        if (show) this.toggleProvider(provider);
      }
    } else {
      this.markerClusterGroup.removeFrom(this.map);
    }
  }

  toggleNextbike(): void {
    this.toggleProvider(this.nextbike);
  }

  toggleKVG(): void {
    this.toggleProvider('KVG');
  }

  toggleVKP(): void {
    this.toggleProvider('VKP');
  }

  toggleAK(): void {
    this.toggleProvider('AK');
  }

  toggleDB(): void {
    this.toggleProvider('DB');
  }

  private toggleProvider(provider: string): void {
    let display = this.showLayerGroup.get(provider);
    if (display != undefined) {
      display = !display;
      this.showLayerGroup.set(provider, display);

      let layerGroup = this.layerGroupMap.get(provider);
      if (layerGroup != undefined) {
        if (display) {
          layerGroup.addTo(this.map);
          if (this.showMarkerClusterGroup) {
            this.togglePublicTransport();
          }
        } else {
          layerGroup.removeFrom(this.map);
        }
      }
    }
  }

  private onMapClick(latlng: L.LatLng): void {
    new L.Popup()
      .setLatLng(latlng)
      .setContent(this.createRoutingPopup(latlng))
      .openOn(this.map);
  }

  private onMapPopupOpen(e: L.PopupEvent): void {
    let popup: L.Popup = e.popup;

    let buttonStart = L.DomUtil.get('button-set-start-marker');
    if (buttonStart) {
      L.DomEvent.addListener(buttonStart, 'click', (e: any) => {
        let latlng = popup.getLatLng();
        if (latlng) {
          this.setStartMarker(latlng);
        }
        popup.removeFrom(this.map);
      });
    }

    let buttonEnd = L.DomUtil.get('button-set-end-marker');
    if (buttonEnd) {
      L.DomEvent.addListener(buttonEnd, 'click', (e: any) => {
        let latlng = popup.getLatLng();
        if (latlng) {
          this.setEndMarker(latlng);
        }
        popup.removeFrom(this.map);
      });
    }
  }

  private setStartMarker(latlng: L.LatLng): void {
    this.removeStartMarker();
    this.hideTripLayerGroup();

    this.startMarker = new L.Marker(latlng, {icon: this.startIcon, title: 'Startpunkt', opacity: 0.8})
      .bindPopup(this.createStartMarkerPopup(latlng))
      .addTo(this.map);

    this.startMarker.on('popupopen', (e: L.PopupEvent) => {
      let buttonRemove = L.DomUtil.get('button-remove-start-marker');
      if (buttonRemove) {
        L.DomEvent.addListener(buttonRemove, 'click', (e: any) => {
          this.startMarker.closePopup();
          this.removeStartMarker();
        });
      }
    });

    this.startLocation = { latitude: latlng.lat, longitude: latlng.lng };
  }

  private setEndMarker(latlng: L.LatLng): void {
    this.removeEndMarker();
    this.hideTripLayerGroup();

    this.endMarker = new L.Marker(latlng, {icon: this.endIcon, title: 'Endpunkt', opacity: 0.8})
      .bindPopup(this.createEndMarkerPopup(latlng))
      .addTo(this.map);

    this.endMarker.on('popupopen', (e: L.PopupEvent) => {
      let buttonRemove = L.DomUtil.get('button-remove-end-marker');
      if (buttonRemove) {
        L.DomEvent.addListener(buttonRemove, 'click', (e: any) => {
          this.endMarker.closePopup();
          this.removeEndMarker();
        });
      }
    });

    this.endLocation = { latitude: latlng.lat, longitude: latlng.lng };
  }

  private removeStartMarker(): void {
    this.hideTripLayerGroup();

    if (this.startMarker) {
      this.startMarker.removeFrom(this.map);
      this.startMarker = null;
    }
    this.startLocation = {} as Location;
  }

  private removeEndMarker(): void {
    this.hideTripLayerGroup();

    if (this.endMarker) {
      this.endMarker.removeFrom(this.map);
      this.endMarker = null;
    }
    this.endLocation = {} as Location;
  }

  private createRoutingPopup(latlng: L.LatLng): string {
    return `
      <div class="container">
        <div class="header">Routenplanung</div>
        <table class="text">
          <tbody>
            <tr>
              <td class="item">Breitengrad:</td>
              <td class="text">${latlng.lat.toString()}</td>
            </tr>
            <tr>
              <td class="item">Längengrad:</td>
              <td class="text">${latlng.lng.toString()}</td>
            </tr>
          </tbody>
        </table>
        <div row>
          <div class="button-group text-center mt-3">
            <button type="button" id="button-set-start-marker" class="btn px-3 py-2 mr-2">Startpunkt</button>
            <button type="button" id="button-set-end-marker" class="btn px-3 py-2">Endpunkt</button>
          </div>
        </div>
      </div>
      <style>
        div.leaflet-popup-content {
          width: auto !important;
        }
        .header {
          color: #95C11F;
          font-size: 1.5em;
          font-weight: bold;
          padding-bottom: 5px;
        }
        .item {
          color: black;
          font-size: 1.1em;
          font-weight: normal;
          padding-right: 5px;
        }
        .text {
          color: grey;
          font-size: 1.1em;
          font-weight: normal;
        }
        #button-set-start-marker {
          color: white;
          font-size: 1.2em;
          font-weight: bold;
          background-color: #95C11F;
        }
        #button-set-end-marker {
          color: white;
          font-size: 1.2em;
          font-weight: bold;
          background-color: #95C11F;
        }
        td {
          vertical-align: top;
        }
      </style>`;
  }

  private createStartMarkerPopup(latlng: L.LatLng): string {
    return `
      <div class="container">
        <div class="header">Startpunkt</div>
        <table class="text">
          <tbody>
            <tr>
              <td class="item">Breitengrad:</td>
              <td class="text">${latlng.lat.toString()}</td>
            </tr>
            <tr>
              <td class="item">Längengrad:</td>
              <td class="text">${latlng.lng.toString()}</td>
            </tr>
          </tbody>
        </table>
        <div row>
          <div class="col text-center mt-3">
            <button type="button" id="button-remove-start-marker" class="btn px-3 py-2">Entfernen</button>
          </div>
        </div>
      </div>
      <style>
        div.leaflet-popup-content {
          width: auto !important;
        }
        .header {
          color: #95C11F;
          font-size: 1.5em;
          font-weight: bold;
          padding-bottom: 5px;
        }
        .item {
          color: black;
          font-size: 1.1em;
          font-weight: normal;
          padding-right: 5px;
        }
        .text {
          color: grey;
          font-size: 1.1em;
          font-weight: normal;
        }
        #button-remove-start-marker {
          color: white;
          font-size: 1.2em;
          font-weight: bold;
          background-color: #95C11F;
        }
        td {
          vertical-align: top;
        }
      </style>`;
  }

  private createEndMarkerPopup(latlng: L.LatLng): string {
    return `
      <div class="container">
        <div class="header">Endpunkt</div>
        <table class="text">
          <tbody>
            <tr>
              <td class="item">Breitengrad:</td>
              <td class="text">${latlng.lat.toString()}</td>
            </tr>
            <tr>
              <td class="item">Längengrad:</td>
              <td class="text">${latlng.lng.toString()}</td>
            </tr>
          </tbody>
        </table>
        <div row>
          <div class="col text-center mt-3">
            <button type="button" id="button-remove-end-marker" class="btn px-3 py-2">Entfernen</button>
          </div>
        </div>
      </div>
      <style>
        div.leaflet-popup-content {
          width: auto !important;
        }
        .header {
          color: #95C11F;
          font-size: 1.5em;
          font-weight: bold;
          padding-bottom: 5px;
        }
        .item {
          color: black;
          font-size: 1.1em;
          font-weight: normal;
          padding-right: 5px;
        }
        .text {
          color: grey;
          font-size: 1.1em;
          font-weight: normal;
        }
        #button-remove-end-marker {
          color: white;
          font-size: 1.2em;
          font-weight: bold;
          background-color: #95C11F;
        }
        td {
          vertical-align: top;
        }
      </style>`;
  }

  private getMobilityRegions(): void {
    this.fiwareService.getMobilityRegions().subscribe((data) => {
      let mobilityRegions: MobilityRegion[] = data;
      for (let region of mobilityRegions) {
        if (region.location && region.location.type == 'Point') {
          const coordinates: number[] = <number[]>region.location.coordinates;
          L.marker([coordinates[1], coordinates[0]], { title: region.name })
            .addTo(this.mobilityRegionMarkers)
            .bindPopup(this.createMobilityRegionPopup(region))
            .on('click', (event: L.LeafletMouseEvent): void => {
              this.map.setView(event.latlng, this.config.DIGITWIN_MAP_INITIAL_ZOOM);
            });
        }
      }
    });
  }

  private showMobilityRegions(): void {
    if (!this.showMobilityRegionMarkers) {
      this.mobilityRegionMarkers.addTo(this.map);
      this.showMobilityRegionMarkers = true;
    }
  }

  private hideMobilityRegions(): void {
    if (this.showMobilityRegionMarkers) {
      this.mobilityRegionMarkers.removeFrom(this.map);
      this.showMobilityRegionMarkers = false;
    }
  }

  private getMobilityStations(): void {
    this.fiwareService.getMobilityStations().subscribe((data) => {
      let mobilityStations: MobilityStation[] = data;
      for (let station of mobilityStations) {
        if (station.location && station.location.type == 'Point') {
          const coordinates: number[] = <number[]>station.location.coordinates;
          L.marker([coordinates[1], coordinates[0]], { title: station.name })
            .addTo(this.mobilityStationMarkers)
            .bindPopup(this.createMobilityStationPopup(station))
            .on('click', (event: L.LeafletMouseEvent): void => {
              this.map.setView(event.latlng, this.config.DIGITWIN_MAP_STATION_ZOOM);
            });
        }
      }
    });
  }

  private showMobilityStations(): void {
    if (!this.showMobilityStationMarkers) {
      this.mobilityStationMarkers.addTo(this.map);
      this.showMobilityStationMarkers = true;
    }
  }

  private hideMobilityStations(): void {
    if (this.showMobilityStationMarkers) {
      this.mobilityStationMarkers.removeFrom(this.map);
      this.showMobilityStationMarkers = false;
    }
  }

  private getMobilityServices(): void {
    this.fiwareService.getMobilityServices().subscribe((data) => {
      let mobilityServices: MobilityService[] = data;
      for (let service of mobilityServices) {
        if (service.location && service.location.type == 'Point') {
          const coordinates: number[] = <number[]>service.location.coordinates;
          L.marker([coordinates[1], coordinates[0]], { title: service.name })
            .addTo(this.mobilityServiceMarkers)
            .bindPopup(this.createMobilityServicePopup(service));
        }
      }
    });
  }

  private showMobilityServices(): void {
    if (!this.showMobilityServiceMarkers) {
      this.mobilityServiceMarkers.addTo(this.map);
      this.showMobilityServiceMarkers = true;
    }
  }

  private hideMobilityServices(): void {
    if (this.showMobilityServiceMarkers) {
      this.mobilityServiceMarkers.removeFrom(this.map);
      this.showMobilityServiceMarkers = false;
    }
  }

  private getBikeHireDockingStations(): L.LayerGroup {
    let layerGroup: L.LayerGroup = new L.LayerGroup();
    this.nextbikeService.getBikeHireDockingStations().subscribe((data: BikeHireDockingStation[]) => {
      let stations: BikeHireDockingStation[] = data;
      for (let station of stations) {
        if (station.location && station.location.type == 'Point' && station.location.coordinates.length == 2) {
          let latlng: L.LatLng = new L.LatLng(station.location.coordinates[1], station.location.coordinates[0]);
          L.marker(latlng, { title: station.name })
            .addTo(layerGroup)
            .bindPopup(this.createNextbikePopup(station));
        }
      }
    });
    return layerGroup;
  }

  private getGtfsStops(agency: string): L.LayerGroup {
    let layerGroup: L.LayerGroup = new L.LayerGroup();
    this.gtfsService.getGtfsStops(agency).subscribe((data: GtfsStop[]) => {
      let stops: GtfsStop[] = data;
      for (let stop of stops) {
        if (stop.location && stop.location.type == 'Point' && stop.location.coordinates.length == 2) {
          let latlng: L.LatLng = new L.LatLng(stop.location.coordinates[1], stop.location.coordinates[0]);
          L.marker(latlng, { title: stop.name })
            .addTo(layerGroup)
            .bindPopup(this.createGtfsStopPopup(stop));
        }
      }
    });
    return layerGroup;
  }

  private getPublicTransport(agencies: string[]): L.MarkerClusterGroup {
    let markerClusterGroup: L.MarkerClusterGroup = L.markerClusterGroup();
    this.nextbikeService.getBikeHireDockingStations().subscribe((data: BikeHireDockingStation[]) => {
      let stations: BikeHireDockingStation[] = data;
      for (let station of stations) {
        if (station.location && station.location.type == 'Point' && station.location.coordinates.length == 2) {
          let latlng: L.LatLng = new L.LatLng(station.location.coordinates[1], station.location.coordinates[0]);
          let marker = L.marker(latlng, { title: station.name }).bindPopup(this.createNextbikePopup(station));
          markerClusterGroup.addLayer(marker);
        }
      }
      for (let agency of agencies) {
        this.gtfsService.getGtfsStops(agency).subscribe((data: GtfsStop[]) => {
          let stops: GtfsStop[] = data;
          for (let stop of stops) {
            if (stop.location && stop.location.type == 'Point' && stop.location.coordinates.length == 2) {
              let latlng: L.LatLng = new L.LatLng(stop.location.coordinates[1], stop.location.coordinates[0]);
              let marker = L.marker(latlng, { title: stop.name }).bindPopup(this.createGtfsStopPopup(stop));
              markerClusterGroup.addLayer(marker);
            }
          }
        });
      }
    });
    return markerClusterGroup;
  }

  private createMobilityRegionPopup(region: MobilityRegion): string {
    return `
      <div class="popup">
        <div class="header">${region.name}</div>
        <table class="text">
          <tbody>
            <tr>
              <td class="item">Beschreibung:</td>
              <td>${region.description}</td>
            </tr>
            <tr>
              <td class="item">Breitengrad:</td>
              <td>${(region.location) ? region.location.coordinates[1] : ''}</td>
            </tr>
            <tr>
              <td class="item">Längengrad:</td>
              <td>${(region.location) ? region.location.coordinates[0] : ''}</td>
            </tr>
            <tr>
              <td class="item">FIWARE ID:</td>
              <td>${region.id}</td>
            </tr>
          </tbody>
      </div>
      <style>
        div.leaflet-popup-content {
          width: auto !important;
        }
        .popup {
          margin: 10px;
        }
        .header {
          color: #95C11F;
          font-size: 1.2em;
          font-weight: bold;
          padding-bottom: 5px;
        }
        .item {
          color: black;
          font-size: 1em;
          font-weight: normal;
          padding-right: 5px;
        }
        .text {
          color: grey;
          font-size: 1em;
          font-weight: normal;
        }
        td {
          vertical-align: top;
        }
      </style>`;
  }

  private createMobilityStationPopup(station: MobilityStation): string {
    return `
      <div class="popup">
        <div class="header">${station.name}</div>
        <table class="text">
          <tbody>
            <tr>
              <td class="item">Beschreibung:</td>
              <td>${station.description}</td>
            </tr>
            <tr>
              <td class="item">Breitengrad:</td>
              <td>${station.location.coordinates[1]}</td>
            </tr>
            <tr>
              <td class="item">Längengrad:</td>
              <td>${station.location.coordinates[0]}</td>
            </tr>
            <tr>
              <td class="item">FIWARE ID:</td>
              <td>${station.id}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <style>
        div.leaflet-popup-content {
          width: auto !important;
        }
        .popup {
          margin: 10px;
        }
        .header {
          color: #95C11F;
          font-size: 1.2em;
          font-weight: bold;
          padding-bottom: 5px;
        }
        .item {
          color: black;
          font-size: 1em;
          font-weight: normal;
          padding-right: 5px;
        }
        .text {
          color: grey;
          font-size: 1em;
          font-weight: normal;
        }
        td {
          vertical-align: top;
        }
      </style>`;
  }

  private createMobilityServicePopup(service: MobilityService): string {
    return `
      <div class="popup">
        <div class="header">${service.name}</div>
        <table class="text">
          <tbody>
            <tr>
              <td class="item">Beschreibung:</td>
              <td>${service.description}</td>
            </tr>
            <tr>
              <td class="item">Breitengrad:</td>
              <td>${(service.location) ? service.location.coordinates[1] : ''}</td>
            </tr>
            <tr>
              <td class="item">Längengrad:</td>
              <td>${(service.location) ? service.location.coordinates[0] : ''}</td>
            </tr>
            <tr>
              <td class="item">Service:</td>
              <td>${service.service}</td>
            </tr>
            <tr>
              <td class="item">Provider:</td>
              <td>${service.refServiceProvider}</td>
            </tr>
            <tr>
              <td class="item">FIWARE ID:</td>
              <td>${service.id}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <style>
        div.leaflet-popup-content {
          width: auto !important;
        }
        .popup {
          margin: 10px;
        }
        .header {
          color: #95C11F;
          font-size: 1.2em;
          font-weight: bold;
          padding-bottom: 5px;
        }
        .item {
          color: black;
          font-size: 1em;
          font-weight: normal;
          padding-right: 5px;
        }
        .text {
          color: grey;
          font-size: 1em;
          font-weight: normal;
        }
        td {
          vertical-align: top;
        }
      </style>`;
  }

  private createNextbikePopup(station: BikeHireDockingStation): string {
    return `
      <div class="popup">
        <div class="header">${station.name}</div>
        <table class="text">
          <tbody>
            <tr>
              <td class="item">Betreiber:</td>
              <td>${station.description}</td>
            </tr>
            <tr>
              <td class="item">Breitengrad:</td>
              <td>${station.location.coordinates[1]}</td>
            </tr>
            <tr>
              <td class="item">Längengrad:</td>
              <td>${station.location.coordinates[0]}</td>
            </tr>
            <tr>
              <td class="item">FIWARE ID:</td>
              <td>${station.id}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <style>
        div.leaflet-popup-content {
          width: auto !important;
        }
        .popup {
          margin: 10px;
        }
        .header {
          color: #95C11F;
          font-size: 1.2em;
          font-weight: bold;
          padding-bottom: 5px;
        }
        .item {
          color: black;
          font-size: 1em;
          font-weight: normal;
          padding-right: 5px;
        }
        .text {
          color: grey;
          font-size: 1em;
          font-weight: normal;
        }
        td {
          vertical-align: top;
        }
      </style>`;
  }

  private createGtfsStopPopup(stop: GtfsStop): string {
    return `
      <div class="popup">
        <div class="header">${stop.name}</div>
        <table class="text">
          <tbody>
            <tr>
              <td class="item">Betreiber:</td>
              <td>${stop.description}</td>
            </tr>
            <tr>
              <td class="item">Breitengrad:</td>
              <td>${stop.location.coordinates[1]}</td>
            </tr>
            <tr>
              <td class="item">Längengrad:</td>
              <td>${stop.location.coordinates[0]}</td>
            </tr>
            <tr>
              <td class="item">FIWARE ID:</td>
              <td>${stop.id}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <style>
        div.leaflet-popup-content {
          width: auto !important;
        }
        .popup {
          margin: 10px;
        }
        .header {
          color: #95C11F;
          font-size: 1.2em;
          font-weight: bold;
          padding-bottom: 5px;
        }
        .item {
          color: black;
          font-size: 1em;
          font-weight: normal;
          padding-right: 5px;
        }
        .text {
          color: grey;
          font-size: 1em;
          font-weight: normal;
        }
        td {
          vertical-align: top;
        }
      </style>`;
  }
}
