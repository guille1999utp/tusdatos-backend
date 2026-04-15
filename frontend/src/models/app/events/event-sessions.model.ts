export interface IEventSession {
  id: number;
  event_id: number;
  title: string;
  speaker: string;
  start_time: string;
  end_time: string;
  capacity: number;
}

export interface IEventSessionCreate {
  title: string;
  speaker: string;
  start_time: string;
  end_time: string;
  capacity: number;
}
