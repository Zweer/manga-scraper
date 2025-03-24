import type { CommonManga } from './getManga';

export interface MangaParkGetMangas {
  data: {
    get_searchComic: {
      paging: {
        page: number;
        pages: number;
      };
      items: CommonManga[];
    };
  };
}
