import axios from 'axios';
import * as cheerio from 'cheerio';
import { stringify } from 'querystring';

import { AbstractEngine } from './abstractEngine';

import { Manga } from '../../interfaces/manga';
import { Chapter } from '../../interfaces/chapter';

export abstract class WordpressMadara extends AbstractEngine {
  async getMangas(): Promise<Manga[]> {
    const mangas = [];

    for (let page = 0, cycle = true; cycle; page += 1) {
      const { data } = await axios.post(
        `${this.baseurl}/wp-admin/admin-ajax.php`,
        stringify({
          page,
          action: 'madara_load_more',
          template: 'madara-core/content/content-archive',
          'vars[paged]': 0,
          'vars[post_type]': 'wp-manga',
          'vars[posts_per_page]': 250,
        }),
      );

      const $ = cheerio.load(data);
      const mangasToAdd = $('.manga')
        .map((_index, element) => {
          const $element = $(element);

          const badges = $element
            .find('.manga-title-badges')
            .map((_badgeIndex, badgeElement) => $(badgeElement).text())
            .get();
          const $title = $element.find('.post-title');
          const title = $title.text().trim();
          const href = $title.find('a').attr('href');
          const slug = href.split('/')[4];
          const score = parseFloat($element.find('.score').text());
          const $chapter = $element.find('.chapter-item:first-child');
          const lastChapterId = $chapter.find('.chapter').text().replace('Chapter', '').trim();
          const lastChapterDate = $chapter.find('.post-on').text().trim();

          return {
            title,
            badges,
            slug,
            score,
            lastChapterId,
            lastChapterDate,
          };
        })
        .get();

      if (mangasToAdd.length > 0) {
        mangas.push(...mangasToAdd);
      } else {
        cycle = false;
      }
    }

    return mangas;
  }

  getChapters(manga: string): Promise<Chapter[]> {
    console.log(manga);

    return Promise.resolve([]);
  }

  getPages(manga: string, chapter: string): Promise<string[]> {
    console.log(manga);
    console.log(chapter);

    return Promise.resolve([]);
  }
}
