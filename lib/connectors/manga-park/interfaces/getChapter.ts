export interface CommonChapter {
  data?: {
    dateCreate?: number;
    dname?: string;
    id: string;
    imageFile?: {
      urlList?: string[];
    };
    serial?: number;
    sfw_result?: boolean;
    title?: string;
    urlPath?: string;
  };
}

export interface GetChapter {
  data: {
    get_chapterNode: CommonChapter;
  };
}
