import axios from 'axios';

import { Manga } from '../interfaces/manga';
import { Chapter } from '../interfaces/chapter';

export abstract class Connector {
  protected request = axios.create();

  abstract getMangas(search?: string): Promise<Manga[]>;
  abstract getManga(id: string): Promise<Manga>;

  abstract getChapters(mangaId: string): Promise<Chapter[]>;
  abstract getChapter(mangaId: string, chapterId: string): Promise<Chapter>;
}
