import type { IEvents } from "../events.model";

export interface IPaginatedEvents {
  items: IEvents[];
  total: number;
}

export type IGetEventsResp = IPaginatedEvents;