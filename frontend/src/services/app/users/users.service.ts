import { clientHTTP } from "@/api/configAxios";
import { handleApiErrors } from "@/services/utilities/handle-api-error.utility";
import { transformToQueryString } from "@/services/utilities/transformToQueryString";

import type { IGetUsersResp } from "@/models/app/users/get-all/get-all-users.model";
import type { ISearchUsersResp } from "@/models/app/users/search-users.model";

interface IFilters {
  [key: string]: string;
}

export default class UsersService {
  private static readonly baseUrl = "auth/list/users";

  public static async getAll(filters?: IFilters): Promise<IGetUsersResp> {
    return handleApiErrors<IGetUsersResp>(() =>
      clientHTTP.get<IGetUsersResp>(
        filters ? transformToQueryString(this.baseUrl, filters) : this.baseUrl
      )
    );
  }

  public static async search(
    filters: { q?: string; skip?: string; limit?: string }
  ): Promise<ISearchUsersResp> {
    return handleApiErrors<ISearchUsersResp>(() =>
      clientHTTP.get<ISearchUsersResp>(
        transformToQueryString("auth/users/search", filters as Record<string, string>)
      )
    );
  }

  public static async updateRole(
    userId: number,
    role: string,
    errorCallback: (msg: string) => void
  ): Promise<{ msg: string; logout_required?: boolean }> {
    return handleApiErrors(
      () => clientHTTP.put(`auth/role/${userId}`, { role }),
      errorCallback
    );
  }

  public static async deleteUser(
    userId: number,
    errorCallback?: (msg: string) => void
  ): Promise<{ msg: string }> {
    return handleApiErrors<{ msg: string }>(
      () => clientHTTP.delete(`auth/users/${userId}`),
      errorCallback
    );
  }
}
