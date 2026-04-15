export interface IFile {
    file: File;
}

export interface ImportFile {
    params: IFile;
    errorCallback: (msg: string) => void;
}