import seedrandom from 'seedrandom';
import haversine from 'haversine-distance';
import { DateTime } from 'luxon';
import aircraft from './Data/aircraft';
import airports from './Data/airports';

const createRandomGenerator = (seed: string): (() => number) => {
  if (seed === undefined || seed === null) {
    // With a null seed, this method will no longer be deterministic, which is not intended
    throw new Error('Seed cannont be null as it causes unexpected behavior');
  }
  // Create a method which returns a random number between 'min' and 'max'
  const random = seedrandom(seed);
  return (min = 0, max = 0): number => {
    const r = random();
    return Math.floor(r * (max - min + 1) + min);
  };
};

// Convert meters to miles
const metersToMiles = (num: number): number => num / 1609.344;

// Determine miles value for distance between two locations (lat/lon)
const calcDistance = (a: AirportLocation, b: AirportLocation): number => Math.round(metersToMiles(haversine(a, b)));

export default class Generator {
  random: (min?: number, max?: number) => number;

  constructor(seed: string) {
    // Generate the random method with the given seed
    // Calls to this method will return a random value, however,
    // generating a new this.random with the same seed will
    // yield the same results for the nth and n+1th calls
    // (i.e., results from f(x) = 5, 7, 4, 1 and results from
    // g(x) using the same seed = 5, 7, 4, 1
    this.random = createRandomGenerator(seed);
  }

  // Determine the number of flights for a given route for a specific day
  numFlightsForRoute(): number {
    // Use those values to create a hash and use that value as the seed
    // to create a new random method to be used for numFlights
    return this.random(5, 15);
  }

  // Randomly generate a flight for the given origin and destination
  flight(origin: Airport, destination: Airport, departureTime: DateTime): Flight {
    // Generate a random flight number
    const flightNumber: string = this.random(1, 9999)
      .toFixed(0)
      .padStart(4, '0');

    // Calculate distance of route based on lat/lon
    const distance = calcDistance(origin.location, destination.location);

    var connection = null;

    if(distance > 1500) {
      const long = ((origin.location.longitude + destination.location.longitude) / 2) * (this.random(800, 1200) / 1000);
      const lat = ((origin.location.latitude + destination.location.latitude) / 2) * (this.random(800, 1200) / 1000);
      const midpoint: AirportLocation = {
        latitude: lat,
        longitude: long
      };
      for(let i = 0; i < airports.length; i++) {
        if(calcDistance(airports[i].location,midpoint) < 75) {
          connection = airports[i];
          break;
        }
      }
      if(this.random(100, 1000) < 200) {
        connection = null;
      }
    }

    const layover: FlightDuration = {
      locale: '',
      hours: this.random(0, 6) * (this.random(300, 1700) / 1000),
      minutes: this.random(15, 59),
    };
    layover.minutes = Math.floor(layover.minutes);
    layover.hours = Math.floor(layover.hours);
    layover.locale = `${layover.hours}h ${layover.minutes}m`;

    if(connection == null) {
      layover.hours = 0;
      layover.minutes = 0;
      layover.locale = `${layover.hours}h ${layover.minutes}m`;
    }

    // Assign random aircraft
    const randAircraft = aircraft[this.random(0, aircraft.length - 1)];

    // Determine flight duration based on distance and aircraft speed
    const duration: FlightDuration = {
      locale: '',
      hours: (distance / randAircraft.speed) * (this.random(1000, 1100) / 1000),
      minutes: 0,
    };
    duration.minutes = Math.floor(60 * (duration.hours - Math.floor(duration.hours))) + layover.minutes;
    duration.hours = Math.ceil(duration.hours) + layover.hours;
    duration.locale = `${duration.hours}h ${duration.minutes}m`;

    if(duration.minutes > 59) {
      duration.hours = duration.hours + (Math.floor(duration.minutes / 60));
      duration.minutes = duration.minutes % 60;
      duration.locale = `${duration.hours}h ${duration.minutes}m`;
    }

    const arrivalTime = departureTime.plus({ hours: duration.hours, minutes: duration.minutes }).setZone(destination.timezone);

    const oneWayCost = Math.ceil((((distance / 5) + 115) * this.random(500, 1100) / 1000) / (duration.hours / 5));

    return {
      flightNumber,
      origin,
      destination,
      distance,
      connection,
      duration,
      layover,
      departureTime: departureTime.toISO(),
      arrivalTime: arrivalTime.toISO(),
      aircraft: randAircraft,
      oneWayCost,
    };
  }

  pairFlight(origin: Airport, destination: Airport, departureTime: DateTime, returnTime: DateTime): DepRetPair {
    const initialFlight = this.flight(origin, destination, departureTime);

    const returnFlight = this.flight(destination, origin, returnTime);

    const cost = Math.ceil((initialFlight.oneWayCost + returnFlight.oneWayCost) / 2.5);

    return {
      initialFlight,
      returnFlight,
      cost,
    }
  };
}
