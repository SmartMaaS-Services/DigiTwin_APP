import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfigService } from '../services/config.service';

import { GtfsStop } from '../schemas/gtfs/GtfsStop';

@Injectable({
  providedIn: 'root'
})
export class GtfsService {
  constructor(private config: ConfigService, private http: HttpClient) {}

  getGtfsStops(agency: string): Observable<GtfsStop[]> {
    let gtfsFile: string = '';
    switch (agency) {
      case 'KVG': {
        gtfsFile = './assets/' + this.config.DIGITWIN_GTFS_KVG;
        break;
      }
      case 'VKP': {
        gtfsFile = './assets/' + this.config.DIGITWIN_GTFS_VKP;
        break;
      }
      case 'AK': {
        gtfsFile = './assets/' + this.config.DIGITWIN_GTFS_AK;
        break;
      }
      case 'DB': {
        gtfsFile = './assets/' + this.config.DIGITWIN_GTFS_DB;
        break;
      }
    }
    return this.http.get<GtfsStop[]>(gtfsFile).pipe(catchError((error: Response) => throwError(error.status)));
  }
}
