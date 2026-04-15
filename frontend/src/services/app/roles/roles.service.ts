import { clientHTTP } from "@/api/configAxios";
import type { IGetRolesResp } from "@/models/app/roles/get-all/get-all-roles.model";
import { handleApiErrors } from "@/services/utilities/handle-api-error.utility";
import { transformToQueryString } from "@/services/utilities/transformToQueryString";


interface IFilters {
  [key: string]: string;
}

export default class RolesService {
  private static readonly baseUrl = "auth/list/roles";

  public static async getAll(filters?: IFilters): Promise<IGetRolesResp> {
    return handleApiErrors<IGetRolesResp>(() =>
      clientHTTP.get<IGetRolesResp>(
        filters ? transformToQueryString(this.baseUrl, filters) : this.baseUrl
      )
    );
  }

}
