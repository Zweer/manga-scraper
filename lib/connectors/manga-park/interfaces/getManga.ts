export enum OriginalStatus {
  ONGOING = 'ongoing',
  PENDING = 'pending',
  COMPLETED = 'completed',
  HIATUS = 'hiatus',
  CANCELLED = 'cancelled',
}

export interface CommonManga {
  data?: {
    artists?: string[];
    authors?: string[];
    chaps_normal?: number;
    chaps_others?: number;
    dateCreate?: number;
    extraInfo?: string;
    genres?: string[];
    id: string;
    name?: string;
    originalStatus: OriginalStatus;
    score_avg?: number;
    sfw_result?: boolean;
    slug?: string;
    summary?: string;
    urlCover300?: string;
    urlCover600?: string;
    urlCover900?: string;
    urlCoverOri?: string;
    urlPath?: string;
  };
}

export interface GetManga {
  data: {
    get_comicNode: CommonManga;
  };
}
