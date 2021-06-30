import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfigService } from '../services/config.service';

import { BikeHireDockingStation } from '../schemas/fiware/BikeHireDockingStation';

@Injectable({
  providedIn: 'root'
})
export class NextbikeService {
  constructor(private config: ConfigService, private http: HttpClient) {}

  getBikeHireDockingStations(): Observable<BikeHireDockingStation[]> {
    let nextbikeFile: string =  './assets/' + this.config.DIGITWIN_NEXTBIKE;
    return this.http.get<BikeHireDockingStation[]>(nextbikeFile).pipe(catchError((error: Response) => throwError(error.status)));
  }
}
