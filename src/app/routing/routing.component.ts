import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { TripgoService } from '../services/tripgo.service';

import { faWalking, faBicycle, faBiking, faMotorcycle, faCar, faTaxi, faBus, faTrain, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

type RegionInfo = {
  region: string,
  modes: string[];
}

type TripInfo = {
  trip: Trip,
  selected: boolean;
  category: string,
  arrivalTime: string,
  useWalking: boolean,
  useBicycle: boolean,
  useBus: boolean,
  useTrain: boolean,
  useMotorcycle: boolean,
  useCar: boolean,
  useTaxi: boolean,
  assessment: string
}

export type Location = {
  latitude: number,
  longitude: number
}

type RoutingInfo = {
  groups: Group[]
}

type Group = {
  trips: Trip[]
}

export type Trip = {
  availability: string,
  arrivalTime: number,
  departureTime: number,
  caloriesCost: number,
  carbonCost: number,
  hassleCost: number,
  moneyCost?: number,
  currency?: string,
  currencySymbol?: string,
  weightedScore: number,
  segments: Segment[]
}

export type Segment = {
  startTime: number,
  endTime: number,
  availability: string,
  visibility: string,
  type: string,
  action: string,
  from?: {
    latitude: number,
    longitude: number,
    address: string
  },
  to?: {
    latitude: number,
    longitude: number,
    address: string
  },
  shapes?: Shape[],
  streets?: Street[],
  mode?: string,
  modeText?: string,
  modeIcon?: string
}

export type Shape = {
  waypoints: number[][],
  operator: string,
  travelled: boolean,
  serviceName?: string,
  serviceDirection?: string
}

export type Street = {
  waypoints: number[][],
  name?: string,
  meters?: string,
  instructions?: string
}

type SegmentTemplate = {
  hashCode: number,
  availability: string,
  visibility: string,
  type: string,
  action: string,
  from?: {
    latitude: number,
    longitude: number,
    address: string
  },
  to?: {
    latitude: number,
    longitude: number,
    address: string
  },
  shapes?: Shape[],
  streets?: Street[],
  mode?: string,
  modeText?: string,
  modeIcon?: string
}

@Component({
  selector: 'app-routing',
  templateUrl: './routing.component.html',
  styleUrls: ['./routing.component.css']
})
export class RoutingComponent implements OnInit, OnDestroy {
  @Input() set startLocation(startLocation: Location) {
    if (startLocation.latitude && startLocation.longitude) {
      this.startPoint = '(' + startLocation.latitude.toFixed(6) + ',' + startLocation.longitude.toFixed(6) + ')';
    } else {
      this.startPoint = '';
    }
    this.fromLocation = startLocation;
    this.clearTripInfo();
  }
  @Input() set endLocation(endLocation: Location) {
    if (endLocation.latitude && endLocation.longitude) {
      this.endPoint = '(' + endLocation.latitude.toFixed(6) + ',' + endLocation.longitude.toFixed(6) + ')';
    } else {
      this.endPoint = '';
    }
    this.toLocation = endLocation;
    this.clearTripInfo();
  }
  @Output() displayTripEvent = new EventEmitter<Trip>();
  @Output() clearTripEvent = new EventEmitter();

  startPoint: string = '';
  endPoint: string = '';

  faWalking = faWalking;
  faBicycle = faBicycle;
  faBiking = faBiking;
  faMotorcycle = faMotorcycle;
  faCar = faCar;
  faTaxi = faTaxi;
  faBus = faBus;
  faTrain = faTrain;
  faMapMarkerAlt = faMapMarkerAlt;

  public tripInfo: TripInfo[];
  public showTripInfo: boolean;

  private regionInfo: RegionInfo;
  private routingInfo: RoutingInfo;

  private fromLocation: Location;
  private toLocation: Location;

  private recommendedTrip: Trip;
  private fastestTrip: Trip;
  private ecoFriendlyTrip: Trip;
  private healtyTrip: Trip;

  constructor(private config: ConfigService, private tripgoService: TripgoService) {
    this.regionInfo = { region: config.DIGITWIN_TRIPGO_REGION, modes: [] };
    this.routingInfo = { groups: [] };

    this.tripInfo = [];
    this.showTripInfo = false;

    this.fromLocation = {} as Location;
    this.toLocation = {} as Location;

    this.recommendedTrip = {} as Trip;
    this.fastestTrip = {} as Trip;
    this.ecoFriendlyTrip = {} as Trip;
    this.healtyTrip = {} as Trip;
  }

  ngOnInit(): void {
    this.getRegionInfo(this.config.DIGITWIN_TRIPGO_REGION);
  }

  ngOnDestroy(): void {
    this.clearTripEvent.emit();
  }

  getRoutes(): void {
    if (this.startPoint.length > 0 && this.endPoint.length > 0) {
      this.getRoutingInfo(this.fromLocation, this.toLocation);
    }
  }

  selectTripInfo(selectedTripInfo: TripInfo): void {
    for (let info of this.tripInfo) {
      if (info == selectedTripInfo) {
        info.selected = true;
        this.displayTripEvent.emit(info.trip);
      } else {
        info.selected = false;
      }
    }
  }

  private getRoutingInfo(fromLocation: Location, toLocation: Location): void {
    this.resetRoutingInfo();

    this.tripgoService.getRouting(fromLocation, toLocation).subscribe((data) => {
      if (data.segmentTemplates) {
        let segmentTemplateMap: Map<number, SegmentTemplate> = this.getSegmentTemplates(data.segmentTemplates);
        if (data.groups) {
          for (let group of data.groups) {
            let routingGroup: Group = { trips: [] };
            if (group.trips) {
              for (let trip of group.trips) {
                let routingTrip: Trip = {
                  availability: trip.availability,
                  arrivalTime: trip.arrive,
                  departureTime: trip.depart,
                  caloriesCost: trip.caloriesCost,
                  carbonCost: trip.carbonCost,
                  hassleCost: trip.hassleCost,
                  weightedScore: trip.weightedScore,
                  segments: []
                };
                if (typeof trip.moneyCost !== 'undefined') {
                  routingTrip.moneyCost = trip.moneyCost;
                }
                if (trip.currency) {
                  routingTrip.currency = trip.currency;
                }
                if (trip.currencySymbol) {
                  routingTrip.currencySymbol = trip.currencySymbol;
                }
                for (let segment of trip.segments) {
                  let hashCode: number = segment.segmentTemplateHashCode;
                  let template = segmentTemplateMap.get(hashCode);
                  if (template) {
                    let routingSegment: Segment = {
                      startTime: segment.startTime,
                      endTime: segment.endTime,
                      availability: template.availability,
                      visibility: template.visibility,
                      type: template.type,
                      action: template.action
                    };
                    if (template.from) {
                      routingSegment.from = template.from;
                    }
                    if (template.to) {
                      routingSegment.to = template.to;
                    }
                    if (template.shapes) {
                      routingSegment.shapes = template.shapes;
                    }
                    if (template.streets) {
                      routingSegment.streets = template.streets;
                    }
                    if (template.mode) {
                      routingSegment.mode = template.mode;
                    }
                    if (template.modeText) {
                      routingSegment.modeText = template.modeText;
                    }
                    if (template.modeIcon) {
                      routingSegment.modeIcon = template.modeIcon;
                    }
                    routingTrip.segments.push(routingSegment);
                  }
                }
                routingGroup.trips.push(routingTrip);
              }
            }
            this.routingInfo.groups.push(routingGroup);
          }
        }
        this.getTrips();
      }
    });
  }

  private getTrips(): void {
    for (let region of this.routingInfo.groups) {
      for (let trip of region.trips) {
        if (!this.recommendedTrip.segments) {
          this.recommendedTrip = trip;
        } else {
          if (trip.weightedScore < this.recommendedTrip.weightedScore) {
            this.recommendedTrip = trip;
          }
        }
        if (!this.fastestTrip.segments) {
          this.fastestTrip = trip;
        } else {
          if (trip.arrivalTime - trip.departureTime < this.fastestTrip.arrivalTime - this.fastestTrip.departureTime) {
            this.fastestTrip = trip;
          }
        }
        if (!this.ecoFriendlyTrip.segments) {
          this.ecoFriendlyTrip = trip;
        } else {
          if (trip.carbonCost < this.ecoFriendlyTrip.carbonCost) {
            this.ecoFriendlyTrip = trip;
          }
        }
        if (!this.healtyTrip.segments) {
          this.healtyTrip = trip;
        } else {
          if (trip.caloriesCost > this.healtyTrip.caloriesCost) {
            this.healtyTrip = trip;
          }
        }
      }
    }

    this.displayTripInfo();
  }

  private displayTripInfo(): void {
    this.showTripInfo = false;
    this.tripInfo = [];

    if (this.recommendedTrip.segments) {
      this.tripInfo.push(this.getTripInfo(this.recommendedTrip, 'Empfohlen'));
    }
    if (this.fastestTrip.segments) {
      this.tripInfo.push(this.getTripInfo(this.fastestTrip, 'Schnell'));
    }
    if (this.ecoFriendlyTrip.segments) {
      this.tripInfo.push(this.getTripInfo(this.ecoFriendlyTrip, 'Umweltfreundlich'));
    }
    if (this.healtyTrip.segments) {
      this.tripInfo.push(this.getTripInfo(this.healtyTrip, 'Gesund'));
    }

    this.showTripInfo = true;
  }

  private getTripInfo(trip: Trip, category: string): TripInfo {
    let arrivalDate: Date = new Date(trip.arrivalTime * 1000);
    let arrivalTime: string = arrivalDate.getHours().toString().padStart(2, '0') + ':' + arrivalDate.getMinutes().toString().padStart(2, '0');

    let duration: string = Math.round((trip.arrivalTime - trip.departureTime) / 60).toString() + ' min.';
    let money: string = 'kostenlos';
    if (typeof trip.moneyCost !== 'undefined') {
      money = trip.moneyCost + ' ' + trip.currencySymbol;
    }
    let carbon: string = trip.carbonCost + ' kg CO2';
    let calories: string = trip.caloriesCost + ' kcal';
    let assessment: string = duration + ' - ' + money + ' - ' + carbon + ' - ' + calories;

    let tripInfo: TripInfo = {
      selected: false,
      category: category,
      trip: trip,
      arrivalTime: arrivalTime,
      useWalking: false,
      useBicycle: false,
      useBus: false,
      useTrain: false,
      useMotorcycle: false,
      useCar: false,
      useTaxi: false,
      assessment: assessment
    };

    for (let segment of trip.segments) {
      if (segment.modeIcon) {
        switch (segment.modeIcon) {
          case 'walk':
            tripInfo.useWalking = true;
            break;
          case 'bicycle':
            tripInfo.useBicycle = true;
            break;
          case 'bus':
            tripInfo.useBus = true;
            break;
          case 'train':
            tripInfo.useTrain = true;
            break;
          case 'motorbike':
            tripInfo.useMotorcycle = true;
            break;
          case 'car':
            tripInfo.useCar = true;
            break;
          case 'taxi':
            tripInfo.useTaxi = true;
            break;
        }
      }
    }
    return tripInfo;
  }

  private clearTripInfo(): void {
    this.showTripInfo = false;
    this.tripInfo = [];
  }

  private getSegmentTemplates(segmentTemplates: any): Map<number, SegmentTemplate> {
    let segmentTemplateMap: Map<number, SegmentTemplate> = new Map<number, SegmentTemplate>();
    for (let template of segmentTemplates) {
      let segmentTemplate: SegmentTemplate = {
        hashCode: template.hashCode,
        availability: template.type,
        visibility: template.visibility,
        type: template.type,
        action: template.action
      };
      if (template.from) {
        segmentTemplate.from = {
          latitude: template.from.lat,
          longitude: template.from.lng,
          address: template.from.address
        }
      }
      if (template.to) {
        segmentTemplate.to = {
          latitude: template.to.lat,
          longitude: template.to.lng,
          address: template.to.address
        }
      }
      if (template.shapes) {
        segmentTemplate.shapes = [];
        for (let shape of template.shapes) {
          let segmentShape: Shape = {
            waypoints: this.tripgoService.polylineDecode(shape.encodedWaypoints, 5),
            operator: shape.operator,
            travelled: shape.travelled
          };
          if (shape.serviceName) {
            segmentShape.serviceName = shape.serviceName;
          }
          if (shape.serviceDirection) {
            segmentShape.serviceDirection = shape.serviceDirection;
          }
          segmentTemplate.shapes.push(segmentShape);
        }
      }
      if (template.streets) {
        segmentTemplate.streets = [];
        for (let street of template.streets) {
          let segmentStreet: Street = {
            waypoints: this.tripgoService.polylineDecode(street.encodedWaypoints, 5)
          };
          if (street.name) {
            segmentStreet.name = street.name;
          }
          if (street.metres) {
            segmentStreet.meters = street.metres;
          }
          if (street.instructions) {
            segmentStreet.instructions = street.instructions;
          }
          segmentTemplate.streets.push(segmentStreet);
        }
      }
      if (template.modeIdentifier) {
        segmentTemplate.mode = template.modeIdentifier;
      }
      if (template.modeInfo) {
        segmentTemplate.modeText = template.modeInfo.alt;
        segmentTemplate.modeIcon = template.modeInfo.localIcon;
      }
      segmentTemplateMap.set(segmentTemplate.hashCode, segmentTemplate);
    }
    return segmentTemplateMap;
  }

  resetRoutingInfo(): void {
    this.routingInfo = { groups: [] };

    this.showTripInfo = false;
    this.tripInfo = [];

    this.recommendedTrip = {} as Trip;
    this.fastestTrip = {} as Trip;
    this.ecoFriendlyTrip = {} as Trip;
    this.healtyTrip = {} as Trip;
  }

  private getRegionInfo(regionName: string): void {
    this.resetRegionInfo(regionName);

    let modes: string[] = [];
    this.tripgoService.getRegions().subscribe((data) => {
      if (data.regions) {
        for (let region of data.regions) {
          if (region.name && region.name == regionName) {
            if (region.modes) {
              modes = <string[]>region.modes;
            }
          }
        }
      }
      this.regionInfo.modes = modes;
    });
  }

  private resetRegionInfo(regionName: string): void {
    this.regionInfo = { region: regionName, modes: []};
  }
}
