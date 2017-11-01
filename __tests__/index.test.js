jest.mock('fs');

const path = require('path');
const fs = require.requireActual('fs');
const { compact, filter,find, flatten } = require('lodash');
const loader = require('../loader');

const fileSource = (relativePath) => {
  const file = fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');
  return file;
};

describe('doing the work', () => {
  // describe('loading source files');
  it('finds Trans Component text', () => {
    const oneThing = fileSource('./fixtures/one-thing.js');
    const twoThings = fileSource('./fixtures/two-things.js');
    const oneMatches = loader.matcher(oneThing);
    const twoMatches = loader.matcher(twoThings);
    expect(oneMatches).toEqual(expect.arrayContaining(['Hello friend dude']));
    expect(twoMatches).toEqual(expect.arrayContaining(['Hello friend dude', 'Hello']));
  });


  describe('terms', () => {
    // Assume all language files have identical structure
    it('finds existing terms', () => {
      const index = fileSource('./fixtures/two-things.js');
      const matches = loader.matcher(index);
      const locales = loader.localeFiles();

      let matchCounter = 0;
      locales.forEach((file) => matches.forEach((term) => {
        if (loader.findTerm(term, file.contents)) matchCounter++;
      }));
      expect(matchCounter).toEqual(3);
    });

    it('does not add existing terms to any languages', () => {
      const index = fileSource('./fixtures/two-things.js');
      const matches = loader.matcher(index);

      let newContents = [];
      matches.forEach((term) => {
        newContents.push(loader.tryToAddTerm(term));
      });
      newContents = compact(flatten(newContents));

      const en = find(newContents, { path: './lib/locales/en/common.json' });
      const de = find(newContents, { path: './lib/locales/de/common.json' });
      const ja = find(newContents, { path: './lib/locales/ja/common.json' });
      const enHello = filter(en.contents, { term: 'Hello' });
      const deHello = filter(de.contents, { term: 'Hello' });
      const jaHello = filter(ja.contents, { term: 'Hello' });

      expect(enHello).toHaveLength(1);
      expect(deHello).toHaveLength(1);
      expect(jaHello).toHaveLength(1);
    });

    it('adds non-existent terms to all languages', () => {
      const index = fileSource('./fixtures/two-things.js');
      const matches = loader.matcher(index);

      let newContents = [];
      matches.forEach((term) => {
        newContents.push(loader.tryToAddTerm(term));
      });
      newContents = compact(flatten(newContents));

      const en = find(newContents, { path: './lib/locales/en/common.json' });
      const de = find(newContents, { path: './lib/locales/de/common.json' });
      const ja = find(newContents, { path: './lib/locales/ja/common.json' });

      expect(en.contents).toContainEqual({ term: 'Hello friend dude', definition: '' });
      expect(de.contents).toContainEqual({ term: 'Hello friend dude', definition: '' });
      expect(ja.contents).toContainEqual({ term: 'Hello friend dude', definition: '' });
    });
  });
});