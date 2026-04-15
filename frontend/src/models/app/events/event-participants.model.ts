export interface IEventParticipant {
  user_id: number;
  name: string;
  email: string;
  role: "organizador" | "asistente" | "usuario";
}

export interface IPaginatedEventParticipants {
  items: IEventParticipant[];
  total: number;
}
