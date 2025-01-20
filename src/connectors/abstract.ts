import axios from 'axios';

import { Chapter } from '../interfaces/chapter';
import { Manga } from '../interfaces/manga';

export abstract class Connector {
  protected request = axios.create();

  abstract getMangas(search?: string): Promise<Manga[]>;
  abstract getChapters(manga: Manga): Promise<Chapter[]>;
}
