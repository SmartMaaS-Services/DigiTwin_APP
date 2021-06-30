import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {

  DIGITWIN_LOG_LEVEL: string;

  DIGITWIN_MAP_CENTER_LONGITUDE: number;
  DIGITWIN_MAP_CENTER_LATITUDE: number;
  DIGITWIN_MAP_INITIAL_ZOOM: number;
  DIGITWIN_MAP_STATION_ZOOM: number;

  DIGITWIN_FIWARE_API_URL: string;
  DIGITWIN_FIWARE_UPDATE: number;

  DIGITWIN_TRIPGO_API_URL: string;
  DIGITWIN_TRIPGO_API_KEY: string;
  DIGITWIN_TRIPGO_REGION: string;

  DIGITWIN_NEXTBIKE: string;
  DIGITWIN_GTFS_KVG: string;
  DIGITWIN_GTFS_VKP: string;
  DIGITWIN_GTFS_AK: string;
  DIGITWIN_GTFS_DB: string;

  constructor (private http: HttpClient) {
    this.DIGITWIN_LOG_LEVEL = 'info';

    this.DIGITWIN_FIWARE_API_URL = 'https://api.digitwin-staging.kielregion.addix.io';
    this.DIGITWIN_FIWARE_UPDATE = 10;

    this.DIGITWIN_MAP_CENTER_LONGITUDE = 10.1329672;
    this.DIGITWIN_MAP_CENTER_LATITUDE = 54.3223492;
    this.DIGITWIN_MAP_INITIAL_ZOOM = 12;
    this.DIGITWIN_MAP_STATION_ZOOM = 18;

    this.DIGITWIN_TRIPGO_API_URL = 'https://api.tripgo.com/v1/';
    this.DIGITWIN_TRIPGO_API_KEY = '3102c8594f7223a6fc8a93f2a8b91a57';
    this.DIGITWIN_TRIPGO_REGION = 'DE_SH_Kiel';

    this.DIGITWIN_NEXTBIKE = 'BikeHireDockingStation.json';
    this.DIGITWIN_GTFS_KVG = 'GtfsStopKVG.json';
    this.DIGITWIN_GTFS_VKP = 'GtfsStopVKP.json';
    this.DIGITWIN_GTFS_AK = 'GtfsStopAK.json';
    this.DIGITWIN_GTFS_DB = 'GtfsStopDB.json';
  }

  initialize(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let configFile: string = './assets/' + 'config.json';
      this.http.get(configFile).toPromise().then((data: any) => {
        if (this.getConfiguration(data)) {
          resolve();
        } else {
          reject(`Invalid data in file '${configFile}: JSON.stringify(${data})`)
        }
      }).catch((error: any) => {
        reject(`Error reading file '${configFile}: JSON.stringify(${error})`);
      });
    });
  }

  private getConfiguration(config: any): boolean {
    let valid: boolean = true;

    if (config.DIGITWIN_LOG_LEVEL) {
      let logLevels: string[] = ['none', 'info', 'warning', 'error'];
      if (logLevels.includes(config.DIGITWIN_LOG_LEVEL)) {
          this.DIGITWIN_LOG_LEVEL = config.DIGITWIN_LOG_LEVEL;
      } else {
          console.log('DIGITWIN_LOG_LEVEL invalid');
          valid = false;
      }
    } else {
      console.log('DIGITWIN_LOG_LEVEL missing');
      valid = false;
    }

    if (config.DIGITWIN_FIWARE_API_URL) {
      this.DIGITWIN_FIWARE_API_URL = config.DIGITWIN_FIWARE_API_URL;
    } else {
      console.log('DIGITWIN_FIWARE_API_URL missing');
      valid = false;
    }

    if (config.DIGITWIN_FIWARE_UPDATE) {
      this.DIGITWIN_FIWARE_UPDATE = config.DIGITWIN_FIWARE_UPDATE;
    } else {
      console.log('DIGITWIN_FIWARE_UPDATE missing');
      valid = false;
    }

    if (config.DIGITWIN_MAP_CENTER_LONGITUDE) {
      this.DIGITWIN_MAP_CENTER_LONGITUDE = config.DIGITWIN_MAP_CENTER_LONGITUDE;
    } else {
      console.log('DIGITWIN_MAP_CENTER_LONGITUDE missing');
      valid = false;
    }

    if (config.DIGITWIN_MAP_CENTER_LATITUDE) {
      this.DIGITWIN_MAP_CENTER_LATITUDE = config.DIGITWIN_MAP_CENTER_LATITUDE;
    } else {
      console.log('DIGITWIN_MAP_CENTER_LATITUDE missing');
      valid = false;
    }

    if (config.DIGITWIN_MAP_INITIAL_ZOOM) {
      this.DIGITWIN_MAP_INITIAL_ZOOM = config.DIGITWIN_MAP_INITIAL_ZOOM;
    } else {
      console.log('DIGITWIN_MAP_INITIAL_ZOOM missing');
      valid = false;
    }

    if (config.DIGITWIN_MAP_STATION_ZOOM) {
      this.DIGITWIN_MAP_STATION_ZOOM = config.DIGITWIN_MAP_STATION_ZOOM;
    } else {
      console.log('DIGITWIN_MAP_STATION_ZOOM missing');
      valid = false;
    }

    if (config.DIGITWIN_TRIPGO_API_URL) {
      this.DIGITWIN_TRIPGO_API_URL = config.DIGITWIN_TRIPGO_API_URL;
    } else {
      console.log('DIGITWIN_TRIPGO_API_URL missing');
      valid = false;
    }

    if (config.DIGITWIN_TRIPGO_API_KEY) {
      this.DIGITWIN_TRIPGO_API_KEY = config.DIGITWIN_TRIPGO_API_KEY;
    } else {
      console.log('DIGITWIN_TRIPGO_API_KEY missing');
      valid = false;
    }

    if (config.DIGITWIN_TRIPGO_REGION) {
      this.DIGITWIN_TRIPGO_REGION = config.DIGITWIN_TRIPGO_REGION;
    } else {
      console.log('DIGITWIN_TRIPGO_REGION missing');
      valid = false;
    }

    if (config.DIGITWIN_NEXTBIKE) {
      this.DIGITWIN_NEXTBIKE = config.DIGITWIN_NEXTBIKE;
    } else {
      console.log('DIGITWIN_NEXTBIKE missing');
      valid = false;
    }

    if (config.DIGITWIN_GTFS_KVG) {
      this.DIGITWIN_GTFS_KVG = config.DIGITWIN_GTFS_KVG;
    } else {
      console.log('DIGITWIN_GTFS_KVG missing');
      valid = false;
    }

    if (config.DIGITWIN_GTFS_VKP) {
      this.DIGITWIN_GTFS_VKP = config.DIGITWIN_GTFS_VKP;
    } else {
      console.log('DIGITWIN_GTFS_VKP missing');
      valid = false;
    }

    if (config.DIGITWIN_GTFS_AK) {
      this.DIGITWIN_GTFS_AK = config.DIGITWIN_GTFS_AK;
    } else {
      console.log('DIGITWIN_GTFS_AK missing');
      valid = false;
    }

    if (config.DIGITWIN_GTFS_DB) {
      this.DIGITWIN_GTFS_DB = config.DIGITWIN_GTFS_DB;
    } else {
      console.log('DIGITWIN_GTFS_DB missing');
      valid = false;
    }

    return valid;
  }
}
