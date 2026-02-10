
export type FileInfo={
    fileSize: number,
    fileName: string,
    updateTime: number,
    downloadLink: string,
    timeout: number
}

export type UploadInfo={
    uploadLink:string,
    timeout:number
}

export interface OssStorage{
    getFileInfo(uri:string):Promise<FileInfo>
    getTempUploadLink(uri:string):Promise<UploadInfo>
}
