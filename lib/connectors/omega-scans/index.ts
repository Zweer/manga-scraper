import type { Chapter } from '../../interfaces/chapter';
import type { Manga } from '../../interfaces/manga';
import type { GetChapterDetails } from './interfaces/getChapterDetails';
import type { GetChapters } from './interfaces/getChapters';
import type { GetManga } from './interfaces/getManga';
import type { GetMangas } from './interfaces/getMangas';

import process from 'node:process';

import axios from 'axios';

import { Status } from '../../interfaces/manga';
import { Connector } from '../abstract';

export class OmegaScansConnector extends Connector {
  static readonly BASE_URL = 'https://omegascans.org';

  constructor() {
    super();

    this.request = axios.create({
      baseURL: 'https://api.omegascans.org',
    });
  }

  async getMangas(search?: string): Promise<Manga[]> {
    const mangas: Manga[] = [];

    for (let page = 1; true; page += 1) {
      const { data } = await this.request.get<GetMangas>('/query', {
        params: {
          perPage: 100,
          page,
          adult: true,
          query_string: search,
        },
      });

      if (data.data.length === 0) {
        break;
      }

      mangas.push(
        ...data.data.map(manga => ({
          id: manga.id.toString(),
          slug: manga.series_slug,
          title: manga.title,
          excerpt: manga.description,
          image: manga.thumbnail,
          url: `${OmegaScansConnector.BASE_URL}/series/${manga.series_slug}`,
          releasedAt: new Date(manga.created_at),
          status: this.matchStatus(manga.status),
          genres: [],
          score: manga.rating ?? 0,
          chaptersCount: manga.free_chapters.length,
        })),
      );
    }

    return mangas;
  }

  async getManga(id: string): Promise<Manga> {
    const slug = await this.getMangaSlug(id);
    const { data: manga } = await this.request.get<GetManga>(`/series/${slug}`);

    return {
      id: manga.id.toString(),
      slug: manga.series_slug,
      title: manga.title,
      excerpt: manga.description,
      image: manga.thumbnail,
      url: `${OmegaScansConnector.BASE_URL}/series/${manga.series_slug}`,
      releasedAt: new Date(manga.seasons[0].created_at ?? `${manga.release_year}-01-01`),
      status: this.matchStatus(manga.status),
      genres: [],
      score: manga.rating ?? 0,
      chaptersCount: Number.parseInt(manga.meta.chapters_count, 10),
    };
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const chapters = await this.getPartialChapters(mangaId);

    return chapters.reduce(
      async (promiseChapters, chapter) => {
        const chapters = await promiseChapters;
        const { data } = await this.request.get<GetChapterDetails>(
          `/chapter/${chapter.series.series_slug}/${chapter.chapter_slug}`,
        );

        if (data.chapter.price) {
          return chapters;
        }

        chapters.push(this.buildChapter(data));

        return chapters;
      },
      Promise.resolve([] as Chapter[]),
    );
  }

  async getChapter(mangaId: string, chapterId: string): Promise<Chapter> {
    const mangaSlug = await this.getMangaSlug(mangaId);
    const chapterSlug = await this.getChapterSlug(mangaId, chapterId);
    const { data } = await this.request.get<GetChapterDetails>(
      `/chapter/${mangaSlug}/${chapterSlug}`,
    );

    return this.buildChapter(data);
  }

  protected matchStatus(status: GetMangas['data'][number]['status']): Status {
    switch (status) {
      case 'Ongoing':
        return Status.Ongoing;

      case 'Completed':
        return Status.Completed;

      case 'Hiatus':
        return Status.Hiatus;

      case 'Dropped':
        return Status.Cancelled;

      default:
        throw new Error(`Unknown status: ${status as string}`);
    }
  }

  protected async getMangaSlug(id: string): Promise<string> {
    const { data: chapters } = await this.request
      .get<GetChapters>('/chapter/query', {
        params: {
          perPage: 1,
          page: 1,
          series_id: id,
        },
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== 'test') {
          console.error(error);
        }

        return { data: { data: [] } };
      });

    if (chapters.data.length === 0) {
      throw new Error('Comic not found');
    }

    return chapters.data[0].series.series_slug;
  }

  protected async getPartialChapters(mangaId: string): Promise<GetChapters['data']> {
    const chapters: GetChapters['data'] = [];
    for (let page = 1; true; page += 1) {
      const { data } = await this.request
        .get<GetChapters>('/chapter/query', {
          params: {
            perPage: 100,
            page,
            series_id: mangaId,
          },
        })
        .catch((error) => {
          if (process.env.NODE_ENV !== 'test') {
            console.error(error);
          }

          return { data: { data: [] } };
        });

      if (data.data.length === 0) {
        if (page === 1) {
          throw new Error('Comic not found');
        }

        break;
      }

      chapters.push(...data.data);
    }

    return chapters;
  }

  protected async getChapterSlug(mangaId: string, chapterId: string): Promise<string> {
    const chapters = await this.getPartialChapters(mangaId);
    const chapter = chapters.find(chapter => chapter.id.toString() === chapterId);

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    return chapter.chapter_slug;
  }

  protected buildChapter(data: GetChapterDetails): Chapter {
    return {
      id: data.chapter.id.toString(),
      name: data.chapter.chapter_name,
      slug: data.chapter.chapter_slug,
      title: data.chapter.chapter_title!,
      index: Number.parseFloat(data.chapter.index),
      url: `${OmegaScansConnector.BASE_URL}/series/${data.chapter.series.series_slug}/${data.chapter.chapter_slug}`,
      releasedAt: new Date(data.chapter.created_at),
      images: data.chapter.chapter_data.images,
    };
  }
}
