import { readFileSync } from 'fs';
import { join } from 'path';

import axios from 'axios';

import { Connector } from '../abstract';
import { Chapter } from '../../interfaces/chapter';
import { Manga, Status } from '../../interfaces/manga';

import { MangaParkGetMangas } from './interfaces/getMangas';
import { MangaParkGetManga } from './interfaces/getManga';

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

  async getMangas(search?: string): Promise<Omit<Manga, 'chapters'>[]> {
    const mangas: Omit<Manga, 'chapters'>[] = [];
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
          status: this.matchStatus(manga.data.originalStatus),
          genres: manga.data.genres ?? [],
          score: manga.data.score_avg,
          chaptersCount: (manga.data.chaps_normal ?? 0) + (manga.data.chaps_others ?? 0),
        })),
      );

      run = page < data.data.get_searchComic.paging.pages;
    }

    return mangas;
  }

  async getManga(id: string): Promise<Manga> {
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

    return {
      id: data.data.get_comicNode.data.id,
      title: data.data.get_comicNode.data.name!,
      excerpt: data.data.get_comicNode.data.summary,
      image: data.data.get_comicNode.data.urlCoverOri,
      url: `${MangaParkConnector.BASE_URL}${data.data.get_comicNode.data.urlPath}`,
      releasedAt: data.data.get_comicNode.data.dateCreate
        ? new Date(data.data.get_comicNode.data.dateCreate)
        : undefined,
      status: this.matchStatus(data.data.get_comicNode.data.originalStatus),
      genres: data.data.get_comicNode.data.genres ?? [],
      score: data.data.get_comicNode.data.score_avg,
      chaptersCount:
        (data.data.get_comicNode.data.chaps_normal ?? 0) +
        (data.data.get_comicNode.data.chaps_others ?? 0),
      chapters: data.data.get_comicChapterList.map((chapter) => ({
        id: chapter.data.dname!,
        title: chapter.data.title ?? chapter.data.dname!,
        index: chapter.data.serial!,
        url: chapter.data.urlPath!,
        releasedAt: chapter.data.dateCreate ? new Date(chapter.data.dateCreate) : undefined,
        images: chapter.data.imageFile?.urlList ?? [],
      })),
    };
  }

  protected matchStatus(
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
}
