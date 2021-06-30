import { NgModule } from '@angular/core';
import { APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MobilityComponent } from './mobility/mobility.component';
import { RoutingComponent } from './routing/routing.component';
import { ConfigService } from './services/config.service';
import { LoggerService } from './services/logger.service';
import { FiwareService } from './services/fiware.service';
import { TripgoService } from './services/tripgo.service';
import { NextbikeService } from './services/nextbike.service';
import { GtfsService } from './services/gtfs.service';

export function initializeApp(config: ConfigService) {
  return(): Promise<void> => { return config.initialize() };
}

@NgModule({
  declarations: [
    AppComponent,
    MobilityComponent,
    RoutingComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule
  ],
  providers: [
    ConfigService,
    LoggerService,
    FiwareService,
    TripgoService,
    NextbikeService,
    GtfsService,
    { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [ConfigService], multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
