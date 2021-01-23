import { Manga } from '../../interfaces/manga';
import { Chapter } from '../../interfaces/chapter';

export abstract class AbstractEngine {
  static TEST_MANGAS_COUNT: number;

  id: string;
  title: string;
  baseurl: string;

  abstract getMangas(): Promise<Manga[]>;
  abstract getChapters(manga: string): Promise<Chapter[]>;
  abstract getPages(manga: string, chapter: string): Promise<string[]>;
}
