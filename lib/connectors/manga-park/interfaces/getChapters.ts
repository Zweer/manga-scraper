import type { CommonChapter } from './getChapter';

export interface GetChapters {
  data: {
    get_comicChapterList?: CommonChapter[];
  };
}
