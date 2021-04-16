import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { DateTime } from 'luxon';
import Generator from './Generator';
import airports from './Data/airports';
import FlightCache from './FlightCache';

const app = express();

// Enable cross origin requests
app.use(cors());

// Inject middleware to parse JSON body objects
app.use(bodyParser.json());

// Inject middleware to parse URL-encoded form body objects
app.use(bodyParser.urlencoded({ extended: true }));

// Establish Routing
app.get('/', (_: express.Request, res: express.Response) => {
  res.send('👋');
});

// /flights
// Retrieve a list of flights for a given day
// filtered by origin and/or destination
app.get('/flights', (req, res) => {
  const dateFormatText = 'YYYY-MM-DD';
  const { query } = req;
  if (!query || !query.date) {
    res.status(400).send(`'date' is a required parameter and must use the following format: ${dateFormatText}`);
    return;
  }

  const date = DateTime.fromISO(query.date, { zone: 'utc' });
  const date2 = DateTime.fromISO(query.date2, { zone: 'utc' });
  const seed = date.toISODate();
  const seed2 = date2.toISODate();

  if (!seed) {
    res.status(400).send(`'date' value (${query.date}) is malformed; 'date' must use the following format: ${dateFormatText}`);
    return;
  }

  if(!seed2) {
    const gen = new Generator(seed);
    let flights = [];
    // Test cache for data
    const cachedFlights = FlightCache.getFlights(seed);
    var origin = airports[0];
    var destination = airports[0];
    for (let i = 0; i < airports.length; i += 1) {
      if(airports[i].code === query.origin) {
        origin = airports[i];
      }
    }
    for (let j = airports.length - 1; j >= 0; j -= 1) {
      if(airports[j].code === query.destination) {
        destination = airports[j];
      }
    }
      if (origin.code !== destination.code) {

        // For each O&D pair, create flights based on # per day
        const numFlights = gen.numFlightsForRoute();

        // 1am - 11pm (22 hours)
        const flightTimeOffset = 22 / numFlights;

        let time = date
          .startOf('day')
          .plus({ hour: 1 })
          .setZone(origin.timezone, { keepLocalTime: true });

        for (let k = 0; k <= numFlights; k += 1) {
          time = time.plus({ hours: flightTimeOffset, minutes: gen.random(-20, 20) });
          flights.push(gen.flight(origin, destination, time));
        }
      }

    // Respond with matching flights
    res.json(flights);
  }
  else {
    const gen = new Generator(seed);
    const gen2 = new Generator(seed2);
    let flights = [];
    let flights2 = [];

    // Test cache for data
    const cachedFlights = FlightCache.getFlights(seed);
    var origin = airports[0];
    var destination = airports[0];
    for (let i = 0; i < airports.length; i += 1) {
      if(airports[i].code === query.origin) {
        origin = airports[i];
      }
    }
    for (let j = airports.length - 1; j >= 0; j -= 1) {
      if(airports[j].code === query.destination) {
        destination = airports[j];
      }
    }
      if (origin.code !== destination.code) {

        // For each O&D pair, create flights based on # per day
        const numFlights = gen.numFlightsForRoute();

        // 1am - 11pm (22 hours)
        const flightTimeOffset = 22 / numFlights;

        let time = date
          .startOf('day')
          .plus({ hour: 1 })
          .setZone(origin.timezone, { keepLocalTime: true });

        let time2 = date2
          .startOf('day')
          .plus({ hour: 1 })
          .setZone(origin.timezone, { keepLocalTime: true });

        for (let k = 0; k <= numFlights; k += 1) {
          time = time.plus({ hours: flightTimeOffset, minutes: gen.random(-20, 20) });
          flights.push(gen.pairFlight(origin, destination, time, time2));
        }
      }

    // Respond with matching flights
    res.json(flights);
  }

});

export default app;
