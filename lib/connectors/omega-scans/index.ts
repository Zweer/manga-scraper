import axios from 'axios';

import { Connector } from '../abstract';
import { Manga, Status } from '../../interfaces/manga';
import { Chapter } from '../../interfaces/chapter';

import { OmegaScansGetMangas } from './interfaces/getMangas';
import { OmegaScansGetChapters } from './interfaces/getChapters';
import { OmegaScansGetChapterDetails } from './interfaces/getChapterDetails';
import { OmegaScansGetManga } from './interfaces/getManga';

export class OmegaScansConnector extends Connector {
  static readonly BASE_URL = 'https://omegascans.org';

  constructor() {
    super();

    this.request = axios.create({
      baseURL: 'https://api.omegascans.org',
    });
  }

  async getMangas(search?: string): Promise<Omit<Manga, 'chapters'>[]> {
    const mangas: Omit<Manga, 'chapters'>[] = [];

    for (let page = 1, run = true; run; page += 1) {
      const tmpMangas = await this.getMangasFromPage(search, page, true);
      if (tmpMangas.length > 0) {
        mangas.push(...tmpMangas);
      } else {
        run = false;
      }
    }

    return mangas;
  }

  async getManga(id: string): Promise<Manga> {
    const chapters: Chapter[] = [];
    let mangaSlug = '';

    for (let page = 1, run = true; run; page += 1) {
      const { chapters: tmpChapters, mangaSlug: tmpMangaSlug } = await this.getChaptersFromPage(
        id,
        page,
      );

      if (!mangaSlug) {
        mangaSlug = tmpMangaSlug;
      }

      if (tmpChapters.length > 0) {
        chapters.push(...tmpChapters);
      } else {
        run = false;
      }
    }

    const { data } = await this.request.get<OmegaScansGetManga>(`/series/${mangaSlug}`);

    return {
      id: data.id.toString(),
      title: data.title,
      excerpt: data.description,
      image: data.thumbnail,
      url: `${OmegaScansConnector.BASE_URL}/series/${data.series_slug}`,
      releasedAt: new Date(data.seasons[0].created_at),
      status: this.matchStatus(data.status),
      genres: [],
      score: data.rating ?? 0,
      chaptersCount: chapters.length,
      chapters,
    };
  }

  protected async getMangasFromPage(
    search: string | undefined,
    page: number,
    adult: boolean,
  ): Promise<Omit<Manga, 'chapters'>[]> {
    const { data } = await this.request.get<OmegaScansGetMangas>('/query', {
      params: {
        perPage: 100,
        page,
        adult,
        query_string: search,
      },
    });

    return data.data.map((manga) => ({
      id: manga.id.toString(),
      title: manga.title,
      excerpt: manga.description,
      image: manga.thumbnail,
      url: `${OmegaScansConnector.BASE_URL}/series/${manga.series_slug}`,
      releasedAt: new Date(manga.created_at),
      status: this.matchStatus(manga.status),
      genres: [],
      score: manga.rating ?? 0,
      chaptersCount: manga.free_chapters.length,
    }));
  }

  protected async getChaptersFromPage(
    id: string,
    page: number,
  ): Promise<{ chapters: Chapter[]; mangaSlug: string }> {
    const { data } = await this.request.get<OmegaScansGetChapters>('/chapter/query', {
      params: {
        perPage: 100,
        page,
        series_id: id,
      },
    });

    let mangaSlug = '';
    const chapters = await data.data.reduce(
      async (promiseChapters, chapter) => {
        const chapters = await promiseChapters;
        const { data } = await this.request.get<OmegaScansGetChapterDetails>(
          `/chapter/${chapter.series.series_slug}/${chapter.chapter_slug}`,
        );

        if (!mangaSlug) {
          mangaSlug = chapter.series.series_slug;
        }

        if (data.chapter.price) {
          return chapters;
        }

        chapters.push({
          id: chapter.id.toString(),
          title: chapter.chapter_name,
          index: parseFloat(data.chapter.index),
          url: `${OmegaScansConnector.BASE_URL}/series/${chapter.series.series_slug}/${chapter.chapter_slug}`,
          images: data.chapter.chapter_data.images,
        });

        return chapters;
      },
      Promise.resolve([] as Chapter[]),
    );

    return {
      chapters,
      mangaSlug,
    };
  }

  protected matchStatus(status: OmegaScansGetMangas['data'][number]['status']): Status {
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
        throw new Error(`Unknown status: ${status}`);
    }
  }

  protected extractIndex(chapter: OmegaScansGetChapters['data'][number]): number {
    const match = /chapter-(.*)/.exec(chapter.chapter_slug);
    if (match) {
      return parseFloat(match[1].replace('-', '.'));
    }

    throw new Error(`Invalid index extraction: ${chapter.chapter_slug}`);
  }
}
