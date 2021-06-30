import { Component, OnInit, OnDestroy } from '@angular/core';
import { FiwareService } from '../services/fiware.service';
import { ConfigService } from '../services/config.service';

import { MobilityRegion } from '../schemas/MobilityRegion';
import { MobilityService } from '../schemas/MobilityService';
import { MobilityStation } from '../schemas/MobilityStation';

import { OffStreetParking } from '../schemas/fiware/OffStreetParking';
import { OnStreetParking } from '../schemas/fiware/OnStreetParking';
import { ParkingSpot } from '../schemas/fiware/ParkingSpot';

import { BikeHireDockingStation } from '../schemas/fiware/BikeHireDockingStation';
import { TransportStation } from '../schemas/fiware/TransportStation';

import { WeatherObserved } from '../schemas/fiware/WeatherObserved';
import { AirQualityObserved } from '../schemas/fiware/AirQualityObserved';

import { faWalking, faBicycle, faBiking, faMotorcycle, faCar, faTaxi, faBus, faTrain, faMapMarkerAlt, faInfo, faRss } from '@fortawesome/free-solid-svg-icons';
import { faThermometerHalf, faCloudRain, faTemperatureHigh, faWind, faLocationArrow, faSmog } from '@fortawesome/free-solid-svg-icons';

type ServiceInfo = {
  category: string,
  data: Data[]
}

type Data = {
  realtime: RealtimeData[],
  static: string[]
}

type RealtimeData = {
  icon: string,
  name: string,
  value: string
}

@Component({
  selector: 'app-mobility',
  templateUrl: './mobility.component.html',
  styleUrls: ['./mobility.component.css']
})

export class MobilityComponent implements OnInit, OnDestroy {
  regionId: string = 'urn:ngsi:MobilityRegion:KielRegion';
  regionName: string = 'KielRegion';

  stationId: string = 'urn:ngsi:MobilityStation:KielRegion:Oppendorf';
  stationName: string = 'Kiel - Bahnhof Oppendorf';

  faWalking = faWalking;
  faBicycle = faBicycle;
  faBiking = faBiking;
  faMotorcycle = faMotorcycle;
  faCar = faCar;
  faTaxi = faTaxi;
  faBus = faBus;
  faTrain = faTrain;
  faMapMarkerAlt = faMapMarkerAlt;
  faInfo = faInfo;
  faRss = faRss;
  faThermometerHalf = faThermometerHalf;
  faCloudRain = faCloudRain;
  faTemperatureHigh = faTemperatureHigh;
  faWind = faWind;
  faLocationArrow = faLocationArrow;
  faSmog = faSmog;

  public serviceInfo: ServiceInfo[] = [];

  private mobilityRegion: MobilityRegion | undefined;
  private mobilityStation: MobilityStation | undefined;
  private mobilityServices: MobilityService[] | undefined;

  private offStreetParkings: OffStreetParking[];
  private onStreetParkings: OnStreetParking[];
  private parkingSpots: ParkingSpot[];

  private bikeHireDockingStations: BikeHireDockingStation[];
  private transportStations: TransportStation[];

  private weatherObserveds: WeatherObserved[];
  private airQualityOberserveds: AirQualityObserved[];

  private timer: any = null;

  constructor(private config: ConfigService, private fiwareService: FiwareService) {
    this.mobilityRegion = undefined;
    this.mobilityStation = undefined;
    this.mobilityServices = undefined;

    this.serviceInfo = [];

    this.offStreetParkings = [];
    this.onStreetParkings = [];
    this.parkingSpots = [];
    this.bikeHireDockingStations = [];
    this.transportStations = [];
    this.weatherObserveds = [];
    this.airQualityOberserveds = [];
  }

  ngOnInit(): void {
    this.getMobilityConfiguration();
    this.startTimer(this.config.DIGITWIN_FIWARE_UPDATE * 1000);
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer(timeout: number): void {
    this.stopTimer();
    this.timer = setInterval(() => { this.updateData(); }, timeout)
  }

  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateData(): void {
    if (this.mobilityRegion && this.mobilityStation && this.mobilityServices) {
      for (let offStreetParking of this.offStreetParkings) {
        this.fiwareService.getOffStreetParking(offStreetParking.id).subscribe((data) => {
          let actualData: OffStreetParking = data;
          let updateInfo: boolean = false;

          if (typeof actualData.availableSpotNumber !== 'undefined') {
            if (actualData.availableSpotNumber != offStreetParking.availableSpotNumber) {
              offStreetParking.availableSpotNumber = actualData.availableSpotNumber;
              updateInfo = true;
            }
          }

          if (typeof actualData.name !== 'undefined') {
            if (actualData.name != offStreetParking.name) {
              offStreetParking.name = actualData.name;
              updateInfo = true;
            }
          }

          if (typeof actualData.totalSpotNumber !== 'undefined') {
            if (actualData.totalSpotNumber != offStreetParking.totalSpotNumber) {
              offStreetParking.totalSpotNumber = actualData.totalSpotNumber;
              updateInfo = true;
            }
          }

          if (typeof actualData.occupiedSpotNumber !== 'undefined') {
            if (actualData.occupiedSpotNumber != offStreetParking.occupiedSpotNumber) {
              offStreetParking.occupiedSpotNumber = actualData.occupiedSpotNumber;
              updateInfo = true;
            }
          }

          if (typeof actualData.occupancy !== 'undefined') {
            if (actualData.occupancy != offStreetParking.occupancy) {
              offStreetParking.occupancy = actualData.occupancy;
              updateInfo = true;
            }
          }

          if (updateInfo) this.getServiceInfo();
        });
      }

      for (let onStreetParking of this.onStreetParkings) {
        this.fiwareService.getOnStreetParking(onStreetParking.id).subscribe((data) => {
          let actualData: OnStreetParking = data;
          let updateInfo: boolean = false;

          if (typeof actualData.availableSpotNumber !== 'undefined') {
            if (actualData.availableSpotNumber != onStreetParking.availableSpotNumber) {
              onStreetParking.availableSpotNumber = actualData.availableSpotNumber;
              updateInfo = true;
            }
          }

          if (typeof actualData.name !== 'undefined') {
            if (actualData.name != onStreetParking.name) {
              onStreetParking.name = actualData.name;
              updateInfo = true;
            }
          }

          if (typeof actualData.totalSpotNumber !== 'undefined') {
            if (actualData.totalSpotNumber != onStreetParking.totalSpotNumber) {
              onStreetParking.totalSpotNumber = actualData.totalSpotNumber;
              updateInfo = true;
            }
          }

          if (updateInfo) this.getServiceInfo();
        });
      }

      for (let parkingSpot of this.parkingSpots) {
        this.fiwareService.getParkingSpot(parkingSpot.id).subscribe((data) => {
          let actualData: ParkingSpot = data;
          let updateInfo: boolean = false;

          if (typeof actualData.name !== 'undefined') {
            if (actualData.name != parkingSpot.name) {
              parkingSpot.name = actualData.name;
              updateInfo = true;
            }
          }

          if (typeof actualData.status !== 'undefined') {
            if (actualData.status != parkingSpot.status) {
              parkingSpot.status = actualData.status;
              updateInfo = true;
            }
          }

          if (updateInfo) this.getServiceInfo();
        });
      }

      for (let bikeHireDockingStation of this.bikeHireDockingStations) {
        this.fiwareService.getBikeHireDockingStation(bikeHireDockingStation.id).subscribe((data) => {
          let actualData: BikeHireDockingStation = data;
          let updateInfo: boolean = false;

          if (typeof actualData.availableBikeNumber !== 'undefined') {
            if (actualData.availableBikeNumber != bikeHireDockingStation.availableBikeNumber) {
              bikeHireDockingStation.availableBikeNumber = actualData.availableBikeNumber;
              updateInfo = true;
            }
          }

          if (typeof actualData.description !== 'undefined') {
            if (actualData.description != bikeHireDockingStation.description) {
              bikeHireDockingStation.description = actualData.description;
              updateInfo = true;
            }
          }

          if (typeof actualData.totalSlotNumber !== 'undefined') {
            if (actualData.totalSlotNumber != bikeHireDockingStation.totalSlotNumber) {
              bikeHireDockingStation.totalSlotNumber = actualData.totalSlotNumber;
              updateInfo = true;
            }
          }

          if (typeof actualData.freeSlotNumber !== 'undefined') {
            if (actualData.freeSlotNumber != bikeHireDockingStation.freeSlotNumber) {
              bikeHireDockingStation.freeSlotNumber = actualData.freeSlotNumber;
              updateInfo = true;
            }
          }

          if (typeof actualData.status !== 'undefined') {
            if (actualData.status != bikeHireDockingStation.status) {
              bikeHireDockingStation.status = actualData.status;
              updateInfo = true;
            }
          }

          if (updateInfo) this.getServiceInfo();
        });
      }

      for (let transportStation of this.transportStations) {
        this.fiwareService.getTransportStation(transportStation.id).subscribe((data) => {
          let actualData: TransportStation = data;
          let updateInfo: boolean = false;

          if (typeof actualData.name !== 'undefined') {
            if (actualData.name != transportStation.name) {
              transportStation.name = actualData.name;
              updateInfo = true;
            }
          }

          if (updateInfo) this.getServiceInfo();
        });
      }

      for (let weatherObserved of this.weatherObserveds) {
        this.fiwareService.getWeatherObserved(weatherObserved.id).subscribe((data) => {
          let actualData: WeatherObserved = data;
          let updateInfo: boolean = false;

          if (typeof actualData.temperature !== 'undefined') {
            if (actualData.temperature != weatherObserved.temperature) {
              weatherObserved.temperature = actualData.temperature;
              updateInfo = true;
            }
          }

          if (typeof actualData.relativeHumidity !== 'undefined') {
            if (actualData.relativeHumidity != weatherObserved.relativeHumidity) {
              weatherObserved.relativeHumidity = actualData.relativeHumidity;
              updateInfo = true;
            }
          }

          if (typeof actualData.atmosphericPressure !== 'undefined') {
            if (actualData.atmosphericPressure != weatherObserved.atmosphericPressure) {
              weatherObserved.atmosphericPressure = actualData.atmosphericPressure;
              updateInfo = true;
            }
          }

          if (typeof actualData.windSpeed !== 'undefined') {
            if (actualData.windSpeed != weatherObserved.windSpeed) {
              weatherObserved.windSpeed = actualData.windSpeed;
              updateInfo = true;
            }
          }

          if (typeof actualData.windDirection !== 'undefined') {
            if (actualData.windDirection != weatherObserved.windDirection) {
              weatherObserved.windDirection = actualData.windDirection;
              updateInfo = true;
            }
          }

          if (updateInfo) this.getServiceInfo();
        });
      }

      for (let airQualityObserved of this.airQualityOberserveds) {
        this.fiwareService.getAirQualityObserved(airQualityObserved.id).subscribe((data) => {
          let actualData: AirQualityObserved = data;
          let updateInfo: boolean = false;

          if (typeof actualData.pm10 !== 'undefined') {
            if (actualData.pm10 != airQualityObserved.pm10) {
              airQualityObserved.pm10 = actualData.pm10;
              updateInfo = true;
            }
          }

          if (updateInfo) this.getServiceInfo();
        });
      }
    }
  }

  getMobilityConfiguration(): void {
    this.fiwareService.getMobilityStation(this.stationId).subscribe((data) => {
      this.mobilityStation = data;
      this.fiwareService.getMobilityRegion(this.mobilityStation.refMobilityRegion).subscribe((data) => {
        this.mobilityRegion = data;
        this.fiwareService.getMobilityServices().subscribe((data) => {
          this.mobilityServices = [];
          for (let service of data) {
            if (this.mobilityStation && service.refMobilityStation == this.mobilityStation.id) {
              this.mobilityServices.push(service);
            }
          }
          this.getServiceConfiguration();
        });
      });
    });
  }

  getServiceConfiguration(): void {
    if (this.mobilityRegion && this.mobilityStation && this.mobilityServices) {
      let offStreetParkingProviders: string[] = [];
      let onStreetParkingProviders: string[] = [];
      let parkingSpotProviders: string[] = [];
      let bikeHireDockingStationProviders: string[] = [];
      let transportStationProviders: string[] = [];
      let weatherObservedProviders: string[] = [];
      let airQualityObservedProviders: string[] = [];

      for (let service of this.mobilityServices) {
        if (service.refServiceProvider) {
          switch (service.service) {
            case '/parking/offstreet':
              offStreetParkingProviders.push(service.refServiceProvider);
              break;
            case '/parking/onstreet':
              onStreetParkingProviders.push(service.refServiceProvider);
              break;
            case '/parking/spots':
              parkingSpotProviders.push(service.refServiceProvider);
              break;
            case '/transportation/bikehiredockingstations':
              bikeHireDockingStationProviders.push(service.refServiceProvider);
              break;
            case '/transportation/transportstations':
              transportStationProviders.push(service.refServiceProvider);
              break;
            case '/info/weather':
              weatherObservedProviders.push(service.refServiceProvider);
              break;
            case '/info/airquality':
              airQualityObservedProviders.push(service.refServiceProvider);
              break;
          }
        }
      }

      for (let provider of offStreetParkingProviders) {
        this.fiwareService.getOffStreetParking(provider).subscribe((data) => {
          this.offStreetParkings.push(data);
          this.getServiceInfo();
        });
      }

      for (let provider of onStreetParkingProviders) {
        this.fiwareService.getOnStreetParking(provider).subscribe((data) => {
          this.onStreetParkings.push(data);
          this.getServiceInfo();
        });
      }

      for (let provider of parkingSpotProviders) {
        this.fiwareService.getParkingSpot(provider).subscribe((data) => {
          this.parkingSpots.push(data);
          this.getServiceInfo();
        });
      }

      for (let provider of bikeHireDockingStationProviders) {
        this.fiwareService.getBikeHireDockingStation(provider).subscribe((data) => {
          this.bikeHireDockingStations.push(data);
          this.getServiceInfo();
        });
      }

      for (let provider of transportStationProviders) {
        this.fiwareService.getTransportStation(provider).subscribe((data) => {
          this.transportStations.push(data);
          this.getServiceInfo();
        });
      }

      for (let provider of weatherObservedProviders) {
        this.fiwareService.getWeatherObserved(provider).subscribe((data) => {
          this.weatherObserveds.push(data);
          this.getServiceInfo();
        });
      }

      for (let provider of airQualityObservedProviders) {
        this.fiwareService.getAirQualityObserved(provider).subscribe((data) => {
          this.airQualityOberserveds.push(data);
          this.getServiceInfo();
        });
      }
    }
    this.getServiceInfo();
  }

  getServiceInfo(): void {
    this.serviceInfo = [];
    if (this.mobilityRegion && this.mobilityStation && this.mobilityServices) {
      this.regionName = this.mobilityRegion.name;
      this.stationName = this.mobilityStation.name;

      let parkingInfo: ServiceInfo = { category: 'Parken', data: [] };
      for (let offStreetParking of this.offStreetParkings) {
        let data: Data = { realtime: [], static: [] };
        if (typeof offStreetParking.availableSpotNumber !== 'undefined') {
          let realtimeData: RealtimeData = {
            icon: 'faCar',
            name: 'Freie Parkplätze:',
            value: offStreetParking.availableSpotNumber.toString()
          };
          data.realtime.push(realtimeData);
        }
        if (typeof offStreetParking.name !== 'undefined') {
          let staticData: string = offStreetParking.name;
          if (typeof offStreetParking.totalSpotNumber !== 'undefined') {
            staticData = staticData.concat(' - Stellplätze: ', offStreetParking.totalSpotNumber.toString());
          }
          if (typeof offStreetParking.occupiedSpotNumber !== 'undefined') {
            staticData = staticData.concat(' - belegt: ', offStreetParking.occupiedSpotNumber.toString());
          }
          if (typeof offStreetParking.occupancy !== 'undefined') {
            staticData = staticData.concat(' - Auslastung: ', (offStreetParking.occupancy * 100).toFixed(0), ' %');
          }
          data.static.push(staticData);
        }
        parkingInfo.data.push(data);
      }
      for (let onStreetParking of this.onStreetParkings) {
        let data: Data = { realtime: [], static: [] };
        if (typeof onStreetParking.availableSpotNumber !== 'undefined') {
          let realtimeData: RealtimeData = {
            icon: 'faCar',
            name: 'Freie Parkplätze:',
            value: onStreetParking.availableSpotNumber.toString()
          };
          data.realtime.push(realtimeData);
        }
        if (typeof onStreetParking.name !== 'undefined') {
          let staticData: string = onStreetParking.name;
          if (typeof onStreetParking.totalSpotNumber !== 'undefined') {
            staticData = staticData.concat(' - Stellplätze: ', onStreetParking.totalSpotNumber.toString());
          }
          data.static.push(staticData);
        }
        parkingInfo.data.push(data);
      }
      this.serviceInfo.push(parkingInfo);

      let bikeHireInfo: ServiceInfo = { category: 'Bikesharing', data: [] };
      for (let bikeHireDockingStation of this.bikeHireDockingStations) {
        let data: Data = { realtime: [], static: [] };
        if (typeof bikeHireDockingStation.availableBikeNumber !== 'undefined') {
          let realtimeData: RealtimeData = {
            icon: 'faBicycle',
            name: 'Verfügbare Fahrräder:',
            value: bikeHireDockingStation.availableBikeNumber.toString()
          };
          data.realtime.push(realtimeData);
        }
        if (typeof bikeHireDockingStation.description !== 'undefined') {
          let staticData: string = bikeHireDockingStation.description;
          if (typeof bikeHireDockingStation.totalSlotNumber !== 'undefined') {
            staticData = staticData.concat(' - Stellplätze: ', bikeHireDockingStation.totalSlotNumber.toString());
          }
          if (typeof bikeHireDockingStation.freeSlotNumber !== 'undefined') {
            staticData = staticData.concat(' - frei: ', bikeHireDockingStation.freeSlotNumber.toString());
          }
          if (typeof bikeHireDockingStation.status !== 'undefined') {
            staticData = staticData.concat(' - Status: ', (bikeHireDockingStation.status=='working') ? 'in Betrieb' : 'in Wartung');
          }
          data.static.push(staticData);
        }
        bikeHireInfo.data.push(data);
      }
      this.serviceInfo.push(bikeHireInfo);

      let transportInfo: ServiceInfo = { category: 'ÖPNV', data: [] };
      for (let transportStation of this.transportStations) {
        let data: Data = { realtime: [], static: [] };
        let realtimeData: RealtimeData = {
          icon: 'faTaxi',
          name: 'Station:',
          value: transportStation.name
        };
        if (transportStation.stationType == 'bus') {
          realtimeData.icon = 'faBus';
          realtimeData.name = 'Bushaltestelle:';
        }
        if (transportStation.stationType == 'train') {
          realtimeData.icon = 'faTrain';
          realtimeData.name = 'Bahnstation:';
        }
        data.realtime.push(realtimeData);
        transportInfo.data.push(data);
      }
      this.serviceInfo.push(transportInfo);

      let generalInfo: ServiceInfo = { category: 'Allgemeine Informationen', data: [] };
      for (let weatherObserved of this.weatherObserveds) {
        let data: Data = { realtime: [], static: [] };
        if (typeof weatherObserved.temperature !== 'undefined') {
          let realtimeData: RealtimeData = {
            icon: 'faThermometerHalf',
            name: 'Temperatur:',
            value: weatherObserved.temperature.toFixed(1) + ' °C'
          };
          data.realtime.push(realtimeData);
        }
        if (typeof weatherObserved.relativeHumidity !== 'undefined') {
          let realtimeData: RealtimeData = {
            icon: 'faCloudRain',
            name: 'Luftfeuchtigkeit:',
            value: weatherObserved.relativeHumidity.toFixed(0) + ' %'
          };
          data.realtime.push(realtimeData);
        }
        if (typeof weatherObserved.atmosphericPressure !== 'undefined') {
          let realtimeData: RealtimeData = {
            icon: 'faTemperatureHigh',
            name: 'Luftdruck:',
            value: weatherObserved.atmosphericPressure.toFixed(1) + ' mbar'
          };
          data.realtime.push(realtimeData);
        }
        if (typeof weatherObserved.windSpeed !== 'undefined') {
          let realtimeData: RealtimeData = {
            icon: 'faWind',
            name: 'Windgeschwindigkeit:',
            value: weatherObserved.windSpeed.toFixed(2) + ' km/h'
          };
          data.realtime.push(realtimeData);
        }
        if (typeof weatherObserved.windDirection !== 'undefined') {
          let realtimeData: RealtimeData = {
            icon: 'faLocationArrow',
            name: 'Windrichtung:',
            value: weatherObserved.windDirection.toFixed(0) + ' Grad'
          };
          data.realtime.push(realtimeData);
        }
        generalInfo.data.push(data);
      }
      for (let airQualityObserved of this.airQualityOberserveds) {
        let data: Data = { realtime: [], static: [] };
        if (typeof airQualityObserved.pm10 !== 'undefined') {
          let realtimeData: RealtimeData = {
            icon: 'faSmog',
            name: 'Feinstaub:',
            value: airQualityObserved.pm10.toFixed(1) + ' pm10'
          };
          data.realtime.push(realtimeData);
        }
        generalInfo.data.push(data);
      }
      this.serviceInfo.push(generalInfo);
    }
  }
}
