import axios from 'axios';

import { Connector } from '../abstract';
import { Manga, Status } from '../../interfaces/manga';
import { Chapter } from '../../interfaces/chapter';

import { OmegaScansGetMangas } from './interfaces/getMangas';
import { OmegaScansGetChapters } from './interfaces/getChapters';
import { OmegaScansGetChapterDetails } from './interfaces/getChapterDetails';

export class OmegaScansConnector extends Connector {
  constructor() {
    super();

    this.request = axios.create({
      baseURL: 'https://api.omegascans.org',
    });
  }

  async getMangas(search?: string): Promise<Manga[]> {
    const mangas: Manga[] = [];

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

  async getChapters({ id }: Manga): Promise<Chapter[]> {
    const chapters: Chapter[] = [];

    for (let page = 1, run = true; run; page += 1) {
      const tmpChapters = await this.getChaptersFromPage(id, page);
      if (tmpChapters.length > 0) {
        chapters.push(...tmpChapters);
      } else {
        run = false;
      }
    }

    return chapters;
  }

  protected async getMangasFromPage(
    search: string | undefined,
    page: number,
    adult: boolean,
  ): Promise<Manga[]> {
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
      url: `https://omegascans.org/series/${manga.series_slug}`,
      releasedAt: new Date(manga.created_at),
      status: this.matchStatus(manga.status),
      genres: [],
      score: manga.rating ?? 0,
      chaptersCount: parseInt(manga.meta.chapters_count, 10),
    }));
  }

  protected async getChaptersFromPage(id: string, page: number): Promise<Chapter[]> {
    const { data } = await this.request.get<OmegaScansGetChapters>('/chapter/query', {
      params: {
        perPage: 100,
        page,
        series_id: id,
      },
    });

    return data.data.reduce(
      async (promiseChapters, chapter) => {
        const chapters = await promiseChapters;
        const { data } = await this.request.get<OmegaScansGetChapterDetails>(
          `/chapter/${chapter.series.series_slug}/${chapter.chapter_slug}`,
        );

        chapters.push({
          id: chapter.id.toString(),
          title: chapter.chapter_name,
          index: parseFloat(data.chapter.index),
          url: `https://omegascans.org/series/${chapter.series.series_slug}/${chapter.chapter_slug}`,
          images: data.chapter.chapter_data.images,
        });

        return chapters;
      },
      Promise.resolve([] as Chapter[]),
    );
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
