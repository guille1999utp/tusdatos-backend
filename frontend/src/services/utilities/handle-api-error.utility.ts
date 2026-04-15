import { toast } from 'react-hot-toast';
import axios, { type AxiosResponse }  from 'axios';
import { ERROR_CODE, ERROR_MESSAGE, ERROR_STATUS, type IAxiosError } from '@/models/common/axios-error';

type ApiResponse<T> = T;

/** FastAPI suele devolver `{ detail: string | object[] }`; otros endpoints usan `{ message: string }`. */
export function getFastApiErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const d = data as { message?: unknown; detail?: unknown };
  if (typeof d.message === "string" && d.message.trim()) return d.message.trim();
  const detail = d.detail;
  if (typeof detail === "string" && detail.trim()) return detail.trim();
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item: unknown) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item && typeof (item as { msg: unknown }).msg === "string") {
          return (item as { msg: string }).msg;
        }
        return "";
      })
      .filter(Boolean);
    return parts.join(" ");
  }
  return "";
}

const handleAxiosError = (message: string) => {
  message = message.trim();
  toast.error(message);
};

/**
 * Asynchronous function that handles API errors.
 * This function wraps an API call and handles various types of errors,
 * displaying an appropriate error message if needed.
 *
 * @param {() => Promise<AxiosResponse<T>>} apiCall - The API call to be executed.
 * @param {(msg: string) => void} [errorCallback] - Optional callback to be executed when an error occurs.
 * @returns {Promise<T>} - The data from the API response, if the call is successful.
 * @throws {IAxiosError} - If the API call fails.
 */

export const handleApiErrors = async <T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  errorCallback?: (msg: string, errors?: Record<string, string[]>) => void
): Promise<T> => {
  try {
    const response = await apiCall();
    const responseData: ApiResponse<T> = response.data;

    return responseData;
  } catch (error: any) {
    const { response, code } = error as IAxiosError;
    if (code === ERROR_CODE.ERR_NETWORK) {
      handleAxiosError(ERROR_MESSAGE.ERR_NETWORK);
    } else if (!response) {
      handleAxiosError(ERROR_MESSAGE.ERROR);
    } else if (response.status === ERROR_STATUS.SERVER_ERROR) {
      handleAxiosError(ERROR_MESSAGE.SERVER_ERROR);
    } else if (response.status === ERROR_STATUS.METHOD_NOT_ALLOWED) {
      handleAxiosError(ERROR_MESSAGE.ERROR);
    } else if (response.status === ERROR_STATUS.UNAUTHORIZED) {
      handleAxiosError(ERROR_MESSAGE.UNAUTHORIZED);
    } else if (response.status === ERROR_STATUS.NOT_FOUND) {
      handleAxiosError(ERROR_MESSAGE.NOT_FOUND);
    } else if (response.status === ERROR_STATUS.UNPROCESSABLE_CONTENT) {
      const errors = response.data.errors || {};
      const msg = getFastApiErrorMessage(response.data) || response.data.message || ERROR_MESSAGE.BAD_REQUEST;
      if (errorCallback) {
        errorCallback(msg, errors);
      }

      return Promise.reject({ message: msg, errors });
    } else if (errorCallback && response.status === ERROR_STATUS.BAD_REQUEST) {
      const errors = response.data.errors || {};
      const msg = getFastApiErrorMessage(response.data) || response.data.message || ERROR_MESSAGE.BAD_REQUEST;
      errorCallback(msg, errors);

      return Promise.reject({ message: msg, errors });
    } else if (axios.isAxiosError(error)) {
      const msg = getFastApiErrorMessage(response.data) || response.data.message || ERROR_MESSAGE.ERROR;
      handleAxiosError(msg);
    } else {
      handleAxiosError(ERROR_MESSAGE.ERROR);
    }

    return Promise.reject(error);
  }
};
