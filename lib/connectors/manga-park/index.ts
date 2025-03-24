import type { Chapter } from '../../interfaces/chapter';
import type { Manga } from '../../interfaces/manga';
import type { GetChapter } from './interfaces/getChapter';
import type { GetChapters } from './interfaces/getChapters';
import type { GetManga } from './interfaces/getManga';
import type { MangaParkGetMangas } from './interfaces/getMangas';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import axios from 'axios';

import { Status } from '../../interfaces/manga';
import { Connector } from '../abstract';
import { OriginalStatus } from './interfaces/getManga';

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
        'cookie': 'nsfw=2;',
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

      mangas.push(...data.data.get_searchComic.items.map(manga => this.buildManga(manga.data)));

      run = page < data.data.get_searchComic.paging.pages;
    }

    return mangas;
  }

  async getManga(id: string): Promise<Manga> {
    const operationName = 'getManga';
    const query = graphqlQuery;
    const variables = {
      comicId: id,
    };

    const { data } = await this.request.post<GetManga>('/', {
      operationName,
      query,
      variables,
    });

    if (!data.data.get_comicNode.data) {
      throw new Error('Comic not found');
    }

    return this.buildManga(data.data.get_comicNode.data);
  }

  async getChapters(comicId: string): Promise<Chapter[]> {
    const operationName = 'getChapters';
    const query = graphqlQuery;
    const variables = { comicId };

    const { data } = await this.request.post<GetChapters>('/', {
      operationName,
      query,
      variables,
    });

    if (!data.data.get_comicChapterList) {
      throw new Error('Comic not found');
    }

    return data.data.get_comicChapterList.map(chapter => this.buildChapter(chapter.data));
  }

  async getChapter(mangaId: string, chapterId: string): Promise<Chapter> {
    const operationName = 'getChapter';
    const query = graphqlQuery;
    const variables = { chapterId };

    const { data } = await this.request.post<GetChapter>('/', {
      operationName,
      query,
      variables,
    });

    if (!data.data.get_chapterNode.data) {
      throw new Error('Chapter not found');
    }

    return this.buildChapter(data.data.get_chapterNode.data);
  }

  protected buildManga(manga: GetManga['data']['get_comicNode']['data']): Manga {
    return {
      id: manga!.id,
      slug: manga!.slug!,
      title: manga!.name!,
      excerpt: manga!.summary,
      image: manga!.urlCoverOri,
      url: `${MangaParkConnector.BASE_URL}${manga!.urlPath}`,
      releasedAt: typeof manga!.dateCreate === 'number' ? new Date(manga!.dateCreate) : undefined,
      status: this.matchStatus(manga!.originalStatus),
      genres: manga!.genres ?? [],
      score: Math.round((manga!.score_avg ?? 0) * 100) / 100,
      chaptersCount: (manga!.chaps_normal ?? 0) + (manga!.chaps_others ?? 0),
    };
  }

  protected buildChapter(chapter: GetChapter['data']['get_chapterNode']['data']): Chapter {
    return {
      id: chapter!.id,
      name: chapter!.dname!,
      slug: chapter!.urlPath!.split('/').pop()!,
      title: chapter!.title,
      index: chapter!.serial!,
      url: `${MangaParkConnector.BASE_URL}${chapter!.urlPath!}`,
      releasedAt: typeof chapter!.dateCreate === 'number' ? new Date(chapter!.dateCreate) : undefined,
      images: chapter!.imageFile?.urlList ?? [],
    };
  }

  protected matchStatus(
    status: OriginalStatus,
  ): Status {
    switch (status) {
      case OriginalStatus.ONGOING:
      case OriginalStatus.PENDING:
        return Status.Ongoing;

      case OriginalStatus.COMPLETED:
        return Status.Completed;

      case OriginalStatus.HIATUS:
        return Status.Hiatus;

      case OriginalStatus.CANCELLED:
        return Status.Cancelled;

      case null:
        return Status.Unknown;

      default:
        throw new Error(`Unknown status: ${status as string}`);
    }
  }
}
