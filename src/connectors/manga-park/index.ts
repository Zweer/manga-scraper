import { readFileSync } from 'fs';
import { join } from 'path';

import axios from 'axios';

import { Connector } from '../abstract';
import { Chapter } from '../../interfaces/chapter';
import { Manga, Status } from '../../interfaces/manga';

import { MangaParkGetMangas } from './interfaces/getMangas';
import { MangaParkGetManga } from './interfaces/getManga';

function matchStatus(
  status: MangaParkGetManga['data']['get_comicNode']['data']['originalStatus'],
): Status {
  switch (status) {
    case 'ongoing':
      return Status.Ongoing;

    case 'completed':
      return Status.Completed;

    case null:
      return Status.Unknown;

    default:
      throw new Error(`Unknown status: ${status}`);
  }
}

const graphqlQuery = readFileSync(join(__dirname, 'queries.graphql'), 'utf8');

export class MangaParkConnector extends Connector {
  static readonly BASE_URL = 'https://mangapark.net';

  constructor() {
    super();

    this.request = axios.create({
      baseURL: `${MangaParkConnector.BASE_URL}/apo`,
      headers: {
        'x-origin': MangaParkConnector.BASE_URL,
        'x-referer': `${MangaParkConnector.BASE_URL}/`,
        cookie: 'nsfw=2;',
      },
    });
  }

  async getMangas(search?: string): Promise<Manga[]> {
    const mangas: Manga[] = [];
    const operationName = 'getMangas';
    const query = graphqlQuery;
    const variables = {
      select: {
        page: 1,
        size: 1000,
        word: search,
        sortby: 'field_score',
      },
    };

    for (let page = 1, run = true; run; page += 1) {
      variables.select.page = page;

      const { data } = await this.request.post<MangaParkGetMangas>('/', {
        operationName,
        query,
        variables,
      });

      mangas.push(
        ...data.data.get_searchComic.items.map((manga) => ({
          id: manga.data.id,
          title: manga.data.name!,
          excerpt: manga.data.summary,
          image: manga.data.urlCoverOri,
          url: `${MangaParkConnector.BASE_URL}${manga.data.urlPath}`,
          releasedAt: manga.data.dateCreate ? new Date(manga.data.dateCreate) : undefined,
          status: matchStatus(manga.data.originalStatus),
          genres: manga.data.genres ?? [],
          score: manga.data.score_avg,
          chaptersCount: (manga.data.chaps_normal ?? 0) + (manga.data.chaps_others ?? 0),
        })),
      );

      run = page < data.data.get_searchComic.paging.pages;
    }

    return mangas;
  }

  async getChapters({ id }: Manga): Promise<Chapter[]> {
    const operationName = 'getManga';
    const query = graphqlQuery;
    const variables = {
      getComicNodeId: id,
      comicId: id,
    };

    const { data } = await this.request.post<MangaParkGetManga>('/', {
      operationName,
      query,
      variables,
    });

    if (!data.data.get_comicNode.data) {
      throw new Error('Comic not found');
    }

    return data.data.get_comicChapterList.map((chapter) => ({
      id: chapter.data.dname!,
      title: chapter.data.title ?? chapter.data.dname!,
      index: chapter.data.serial!,
      url: chapter.data.urlPath!,
      releasedAt: chapter.data.dateCreate ? new Date(chapter.data.dateCreate) : undefined,
      images: chapter.data.imageFile?.urlList ?? [],
    }));
  }
}
