import { Chapter } from './chapter';

export interface Manga {
  id: string;
  title: string;
  status: string;
  badges: string[];
  score: number;
  lastChapterId: string;
  lastChapterDate: Date;
  chapters?: Chapter[];
}
