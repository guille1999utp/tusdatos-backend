export const transformToQueryString = (url:string, obj: Record<string, any>): string => {
    const params = new URLSearchParams(obj).toString();
    return `${url}?${params}`;
};
