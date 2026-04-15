import type { ApiResponse } from "@/models/common/http.model";

export interface IDeleteEventsReq {
  id: number;
}

export type IDeleteEventsResp = ApiResponse<string>;
