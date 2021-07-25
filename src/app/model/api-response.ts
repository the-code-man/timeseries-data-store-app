export interface ApiResponse<T> {
    Data: T;
    IsSuccess: boolean;
    ErrorMessage: string;
}