import type { IEvents } from '../events.model';


export interface IInsertEventsReq extends Omit<IEvents, 'id' | 'registered_count'> {
  additionalField?: string;
}

export interface IUpdateEventsReq extends IInsertEventsReq {
  id: number;
}


export type IInsertEventsResp = IEvents[];
