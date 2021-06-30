import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfigService } from '../services/config.service';
import { Location } from '../routing/routing.component';

@Injectable({
  providedIn: 'root'
})

export class TripgoService {

  constructor(private config: ConfigService, private http: HttpClient) {}

  getRegions(): Observable<any> {
    let httpHeaders = new HttpHeaders()
		.set('Accept', 'application/json')
		.set('Content-Type', 'application/json')
		.set('X-TripGo-Key', this.config.DIGITWIN_TRIPGO_API_KEY);

	const body = {
      'v': 2
    };

	const url: string = this.config.DIGITWIN_TRIPGO_API_URL + 'regions.json';

	return this.http.post(url, body, { headers: httpHeaders })
		.pipe(catchError((error: Response) => throwError(error.status)));
  }

  getRouting(fromLocation: Location, toLocation: Location): Observable<any> {
    let from: string = '(' + fromLocation.latitude.toFixed(6) + ',' + fromLocation.longitude.toFixed(6) + ')';
    let to: string = '(' + toLocation.latitude.toFixed(6) + ',' + toLocation.longitude.toFixed(6) + ')';

    let httpHeaders = new HttpHeaders()
		.set('Accept', 'application/json')
		.set('Content-Type', 'application/json')
		.set('X-TripGo-Key', this.config.DIGITWIN_TRIPGO_API_KEY);

	let httpParams = new HttpParams()
		.set('v', '11')
		.set('from', from)
		.set('to', to)
		.set('allModes', 'true');

	const url: string = this.config.DIGITWIN_TRIPGO_API_URL + 'routing.json';

	return this.http.get(url, { headers: httpHeaders, params: httpParams, responseType: 'json'})
		.pipe(catchError((error: Response) => throwError(error.status)));
  }

  polylineEncode(coordinates: number[][], precision: number): string {
    if (!coordinates.length) { return ''; }

    let factor: number = Math.pow(10, Number.isInteger(precision) ? precision : 5);
    let output: string = this.encode(coordinates[0][0], 0, factor) + this.encode(coordinates[0][1], 0, factor);

    for (let i = 1; i < coordinates.length; i++) {
      let a = coordinates[i], b = coordinates[i - 1];
      output += this.encode(a[0], b[0], factor);
      output += this.encode(a[1], b[1], factor);
    }
    return output;
  }

  polylineDecode(str: string, precision: number): number[][] {
    let index = 0,
        lat = 0,
        lng = 0,
        shift = 0,
        result = 0,
        byte = null,
        latitudeChange,
        longitudeChange,
        factor = Math.pow(10, Number.isInteger(precision) ? precision : 5);

    let coordinates: number[][] = [];

    while (index < str.length) {
      byte = null;
      shift = 0;
      result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      latitudeChange = ((result & 1) ? ~(result >> 1) : (result >> 1));

      shift = result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      longitudeChange = ((result & 1) ? ~(result >> 1) : (result >> 1));

      lat += latitudeChange;
      lng += longitudeChange;

      coordinates.push([lat / factor, lng / factor]);
    }
    return coordinates;
  }

  polylineFromGeoJSON( geojson: any, precision: number): string {
    if (geojson && geojson.type === 'Feature') {
      geojson = geojson.geometry;
    }
    if (!geojson || geojson.type !== 'LineString') {
      throw new Error('Input must be a GeoJSON LineString');
    }
    return this.polylineEncode(this.flipped(geojson.coordinates), precision);
  }

  polylineToGeoJSON(str: string, precision: number): any {
    let coordinates = this.polylineDecode(str, precision);
    return {
      type: 'LineString',
      coordinates: this.flipped(coordinates)
    };
  }

  private py2_round(value: number): number {
    return Math.floor(Math.abs(value) + 0.5) * (value >= 0 ? 1 : -1);
  }

  private encode(current: number, previous: number, factor: number): string {
    current = this.py2_round(current * factor);
    previous = this.py2_round(previous * factor);
    let coordinate: number = current - previous;
    coordinate <<= 1;
    if (current - previous < 0) {
      coordinate = ~coordinate;
    }
    let output: string = '';
    while (coordinate >= 0x20) {
      output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
      coordinate >>= 5;
    }
    output += String.fromCharCode(coordinate + 63);
    return output;
  }

  private flipped(coordinates: number[][]): number[][] {
    let flipped = [];
    for (let i = 0; i < coordinates.length; i++) {
      let coord = coordinates[i].slice();
      flipped.push([coord[1], coord[0]]);
    }
    return flipped;
  }
}
