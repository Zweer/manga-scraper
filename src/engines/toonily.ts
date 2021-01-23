import { WordpressMadara } from './abstracts/wordpressMadara';

export class Toonily extends WordpressMadara {
  static TEST_MANGAS_COUNT = 538;

  constructor() {
    super();

    this.id = 'toonily';
    this.title = 'Toonily';
    this.baseurl = 'https://toonily.com';
  }
}
