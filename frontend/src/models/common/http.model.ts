export interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

export interface ApiResponseImportFile {
  message: string;
  ok: boolean;
  successfulCount: number;
  failedRows: any[];
}

// export interface IMeta {
//   arg?: any;
//   requestId: string;
//   requestStatus: TRequestStatus;
//   // total: number;
//   // per_page: number;
//   // current_page: number;
//   // last_page: number;
//   // timestamp: string;
//   // version: string;
//   // requestId: string;
// }

// enum TRequestStatus {
//   fulfilled = 'fulfilled',
// }

export const TStatus = {
  SUCCESS: 'success' as const, /*The request was processed successfully, and the expected data is included in the response.*/

  /**
   * The request could not be processed due to some error.
   * Additional details about the error might be included elsewhere in the response.
   */
  FAILURE: 'failure' as const,

  /**
   * Similar to "failure," but often used to indicate a more severe or
   * unexpected problem, such as a system-level failure.
   */
  ERROR: 'error' as const,

  /**
   *  The request was processed, but there were some issues that the client might need
   *  to know about. This could include validation warnings or other non-fatal problems.
   */
  WARNING: 'warning' as const,

  /**
   *  The request has been received and is being processed, but the final result
   *  is not yet available. This might be used in asynchronous operations.
   */
  PENDING: 'pending' as const,

  /**
   * The request was partially successful. Some parts of the operation might have
   * succeeded while others failed.
   */
  PARTIAL: 'partial' as const
};

export type TStatus = typeof TStatus[keyof typeof TStatus];
