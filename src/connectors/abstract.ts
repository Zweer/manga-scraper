import axios from 'axios';

import { Manga } from '../interfaces/manga';

export abstract class Connector {
  protected request = axios.create();

  abstract getMangas(search?: string): Promise<Omit<Manga, 'chapters'>[]>;
  abstract getManga(id: string): Promise<Manga>;
}
