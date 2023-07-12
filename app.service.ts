import { Injectable } from '@nestjs/common';
import {
  EventStoreDBClient,
  jsonEvent,
  FORWARDS,
  START,
  JSONEventType,
} from '@eventstore/db-client';
import * as fs from 'fs';
@Injectable()
export class AppService {
  static async connection() {
    const fileContent = fs.readFileSync(
      'C:/Users/masjoodi/Documents/SimpleNest/nest-project/src/ca.crt',
      { encoding: 'utf-8' },
    );
    const privateKey = fs.readFileSync(
      'C:/Users/masjoodi/Documents/SimpleNest/nest-project/src/ca.key',
      { encoding: 'utf-8' },
    );
    const client = new EventStoreDBClient(
      {
        endpoint: {
          address: 'awattest-srv.chargoon.net',
          port: 2113,
        },
      },
      {
        insecure: false,
      }
    );

    interface Reservation {
      reservationId: string;
      movieId: string;
      userId: string;
      seatId: string;
    }

    type SeatReservedEvent = JSONEventType<
      'seat-reserved',
      {
        reservationId: string;
        movieId: string;
        userId: string;
        seatId: string;
      }
    >;

    type SeatChangedEvent = JSONEventType<
      'seat-changed',
      {
        reservationId: string;
        newSeatId: string;
      }
    >;

    type ReservationEvents = SeatReservedEvent | SeatChangedEvent;

    const streamName = 'booking-abc123';

    const event = jsonEvent<SeatReservedEvent>({
      type: 'seat-reserved',
      data: {
        reservationId: 'abc123',
        movieId: 'tt0368226',
        userId: 'nm0802995',
        seatId: '4b',
      },
    });

    const appendResult = await client.appendToStream(streamName, event);

    const events = client.readStream<ReservationEvents>(streamName, {
      fromRevision: START,
      direction: FORWARDS,
      maxCount: 10,
    });

    const reservation: Partial<Reservation> = {};

    for await (const { event } of events) {
      switch (event.type) {
        case 'seat-reserved': {
          reservation.reservationId = event.data.reservationId;
          reservation.movieId = event.data.movieId;
          reservation.seatId = event.data.seatId;
          reservation.userId = event.data.userId;
          break;
        }
        case 'seat-changed': {
          reservation.seatId = event.data.newSeatId;
          break;
        }
        default: {
          const _exhaustiveCheck: never = event;
          break;
        }
      }
    }
  }
}
