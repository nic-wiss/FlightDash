declare module 'haversine-distance';

declare interface Aircraft {
  make: string;
  model: string;
  speed: number;
  passengerCapacity: {
    total: number;
    main: number;
    first: number;
  };
}

declare interface Airport {
  code: string; // Airport code, typically 3 characters
  name: string;
  stateCode: string;
  city: string; // Airport city name
  countryCode: string;
  countryName: string;
  timezone: string; // IANA timezone string
  location: AirportLocation;
}

declare interface AirportLocation {
  latitude: number;
  longitude: number;
}

declare interface FlightDuration {
  hours: number;
  minutes: number;
  locale: string;
}

declare interface Flight {
  flightNumber: string;
  aircraft: Aircraft;
  origin: Airport;
  destination: Airport;
  distance: number;
  connection: Airport;
  layover: FlightDuration;
  duration: FlightDuration;
  departureTime: string;
  arrivalTime: string;
  oneWayCost: number;
}

declare interface FlightQueryParams {
  date: string;
  date2?: string;
  origin?: string;
  destination?: string;
}

declare interface DepRetPair {
  initialFlight: Flight;
  returnFlight: Flight;
  cost: number;
}
