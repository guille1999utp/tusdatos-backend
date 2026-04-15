import type { IUsers } from "./users.model";

export interface ISearchUsersResp {
  items: IUsers[];
  total: number;
}
