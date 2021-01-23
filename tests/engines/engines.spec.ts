import { readdirSync } from 'fs';
import { join } from 'path';

const enginesFolder = join(__dirname, '..', '..', 'src', 'engines');

readdirSync(enginesFolder)
  .filter((filename) => filename.endsWith('.ts'))
  .forEach((filename) => {
    const engineName = `${filename.substr(0, 1).toUpperCase()}${filename.substr(
      1,
      filename.length - 4,
    )}`;

    describe(engineName, () => {
      const Engine = require(join(enginesFolder, filename))[engineName];
      const engine = new Engine();

      test('Get Mangas', async () => {
        const mangas = await engine.getMangas();

        // @ts-ignore
        expect(mangas).toHaveLength(Engine.TEST_MANGAS_COUNT);
      });
    });
  });
