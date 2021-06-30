import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfigService } from '../services/config.service';

import { MobilityRegion } from '../schemas/MobilityRegion';
import { MobilityStation } from '../schemas/MobilityStation';
import { MobilityService } from '../schemas/MobilityService';

import { OffStreetParking } from '../schemas/fiware/OffStreetParking';
import { OnStreetParking } from '../schemas/fiware/OnStreetParking';
import { ParkingSpot } from '../schemas/fiware/ParkingSpot';

import { BikeHireDockingStation } from '../schemas/fiware/BikeHireDockingStation';
import { TransportStation } from '../schemas/fiware/TransportStation';

import { WeatherObserved } from '../schemas/fiware/WeatherObserved';
import { AirQualityObserved } from '../schemas/fiware/AirQualityObserved';

@Injectable({
  providedIn: 'root'
})

export class FiwareService {

  constructor(private config: ConfigService, private http: HttpClient) {}

  getMobilityRegions(): Observable<MobilityRegion[]> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/mobility/regions';
    return this.http.get<MobilityRegion[]>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getMobilityRegion(id: string): Observable<MobilityRegion> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/mobility/regions/' + id;
    return this.http.get<MobilityRegion>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getMobilityStations(): Observable<MobilityStation[]> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/mobility/stations';
    return this.http.get<MobilityStation[]>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getMobilityStation(id: string): Observable<MobilityStation> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/mobility/stations/' + id;
    return this.http.get<MobilityStation>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getMobilityServices(): Observable<MobilityService[]> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/mobility/services';
    return this.http.get<MobilityService[]>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getMobilityService(id: string): Observable<MobilityService> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/mobility/services/' + id;
    return this.http.get<MobilityService>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getOffStreetParkings(): Observable<OffStreetParking[]> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/parking/offstreet';
    return this.http.get<OffStreetParking[]>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getOffStreetParking(id: string): Observable<OffStreetParking> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/parking/offstreet/' + id;
    return this.http.get<OffStreetParking>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getOnStreetParkings(): Observable<OnStreetParking[]> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/parking/onstreet';
    return this.http.get<OnStreetParking[]>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getOnStreetParking(id: string): Observable<OnStreetParking> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/parking/onstreet/' + id;
    return this.http.get<OnStreetParking>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getParkingSpots(): Observable<ParkingSpot[]> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/parking/spots';
    return this.http.get<ParkingSpot[]>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getParkingSpot(id: string): Observable<ParkingSpot> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/parking/spots/' + id;
    return this.http.get<ParkingSpot>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getBikeHireDockingStations(): Observable<BikeHireDockingStation[]> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/transportation/bikehiredockingstations';
    return this.http.get<BikeHireDockingStation[]>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getBikeHireDockingStation(id: string): Observable<BikeHireDockingStation> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/transportation/bikehiredockingstations/' + id;
    return this.http.get<BikeHireDockingStation>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getTransportStations(): Observable<TransportStation[]> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/transportation/transportstations';
    return this.http.get<TransportStation[]>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getTransportStation(id: string): Observable<TransportStation> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/transportation/transportstations/' + id;
    return this.http.get<TransportStation>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getWeatherObserveds(): Observable<WeatherObserved[]> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/info/weather';
    return this.http.get<WeatherObserved[]>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getWeatherObserved(id: string): Observable<WeatherObserved> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/info/weather/' + id;
    return this.http.get<WeatherObserved>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getAirQualityObserveds(): Observable<AirQualityObserved[]> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/info/airquality';
    return this.http.get<AirQualityObserved[]>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }

  getAirQualityObserved(id: string): Observable<AirQualityObserved> {
    const url: string = this.config.DIGITWIN_FIWARE_API_URL + '/info/airquality/' + id;
    return this.http.get<AirQualityObserved>(url).pipe(catchError((error: Response) => throwError(error.status)));
  }
}
