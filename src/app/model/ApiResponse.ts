export class ApiResponse<T> {
    Data: T;
    IsSuccess: boolean;
    ErrorMessage: string;
}