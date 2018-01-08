jest.mock('fs-extra');

import path from 'path';
import { compact, filter, find, flatten } from 'lodash';
import { transpile } from 'typescript';
import {
  parser,
  tryToAddTerm,
} from '../src/i18n-json-webpack-loader';

import { findTransComponents, sanitizeTerms } from '../src/trans';
import { findTranslationFunctions, findTerms } from '../src/t';

import {
  languages,
  loadTranslationFile,
} from '../src/util/file';

const fs = require.requireActual('fs');

const parseFile = (relativePath) => {
  const { compilerOptions } = require('../tsconfig.json');
  const file = fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');
  const source = transpile(file, compilerOptions);
  const tree = parser(source);
  return tree;
};

describe('i18n-json-loader', () => {
  describe('<Trans />', () => {
    describe('Source Parsing', () => {
      it('finds Trans Component objects', () => {
        const oneThing = parseFile('./fixtures/child.tsx');
        const twoThings = parseFile('./fixtures/parent.tsx');
        const oneFunctions = findTransComponents(oneThing);
        const twoFunctions = findTransComponents(twoThings);
        const verifyMatch = (collection): any[] => {
          return collection.reduce((result, match) => {
            const found = find(match, { property: { name: 'Trans' } });
            if (found) result.push(found);
            return result;
          }, []);
        };
        const oneMatches = verifyMatch(oneFunctions);
        const twoMatches = verifyMatch(twoFunctions);
        expect(oneMatches.length).toEqual(1);
        expect(twoMatches.length).toEqual(3);
      });

      it('finds Trans Component text', () => {
        const oneThing = parseFile('./fixtures/child.tsx');
        const twoThings = parseFile('./fixtures/parent.tsx');
        const oneTransFunctions = findTransComponents(oneThing);
        const twoTransFunctions = findTransComponents(twoThings);
        const oneMatches = sanitizeTerms(oneTransFunctions);
        const twoMatches = sanitizeTerms(twoTransFunctions);
        expect(oneMatches).toEqual(expect.arrayContaining([
          "Text with a <1>one</1>yep <3>{{dog}}</3> dude<5>three</5>A second text with a<7>five<1></1><2>two</2><3>three<1>one</1></3></7><8>six</8><9><0>zero</0>seven</9>",
          // "Hello from {{one}} thing's file",
          // "{{count}} dogs"
        ]));
        expect(twoMatches).toEqual(expect.arrayContaining([
          "Hello <1>{{name}}</1> it's <3>{{day}}</3>",
          'Hello',
          '<0>{{boys}}</0> and <2>{{girls}}</2>'
        ]));
      });

      it('replaces html tags in Trans contents with sequential numbers', () => {
        const oneThing = parseFile('./fixtures/child.tsx');
        const twoThings = parseFile('./fixtures/parent.tsx');
        const oneTransFunctions = findTransComponents(oneThing);
        const twoTransFunctions = findTransComponents(twoThings);

        const oneTerms = sanitizeTerms(oneTransFunctions);
        const twoTerms = sanitizeTerms(twoTransFunctions);

        const tagsToString = (terms) => terms.map(m => (m.match(/(\d)/mgi) || []).join(''));
        const oneMatches = tagsToString(oneTerms);
        const twoMatches = tagsToString(twoTerms);

        expect(oneMatches).toEqual([ '1133557112231137889009' ]);
        expect(twoMatches).toEqual([ '0022', '', '1133', ]);
      });
    });

    describe('Locale Files', () => {
      let tree;
      let terms;
      let transFunctions;
      let LANGUAGES;

      beforeEach(() => {
        tree = parseFile('./fixtures/child.tsx');
        transFunctions = findTransComponents(tree);
        terms = sanitizeTerms(transFunctions);

        LANGUAGES = languages();
      });

      it('finds existing terms', () => {
        let matchCounter = 0;
        LANGUAGES.forEach((dir) => {
          const localeFile = loadTranslationFile(dir);
          terms.forEach((term) => {
            const match = find(localeFile, { term });
            if (match) matchCounter++;
          })
        });
        expect(matchCounter).toEqual(3);
      });

      it('does not add existing terms', () => {
        let newContents = [];
        terms.forEach((term) => {
          newContents.push(tryToAddTerm(term));
        });
        newContents = compact(flatten(newContents));
        expect(newContents).toEqual([])
      });

      it('adds non-existent terms', () => {
        terms.push('New Term');

        let newContents = [];
        terms.forEach((term) => {
          newContents.push(tryToAddTerm(term));
        });
        newContents = compact(flatten(newContents));

        const en = find(newContents, { dir: 'en' });
        const de = find(newContents, { dir: 'de' });
        const ja = find(newContents, { dir: 'ja' });

        expect(en.contents).toEqual(expect.arrayContaining([{ term: 'New Term', definition: '' }]));
        expect(de.contents).toEqual(expect.arrayContaining([{ term: 'New Term', definition: '' }]));
        expect(ja.contents).toEqual(expect.arrayContaining([{ term: 'New Term', definition: '' }]));
      });
    });
  });

  describe('t()', () => {
    it('finds t() functions', () => {
      const oneThing = parseFile('./fixtures/child.tsx');
      const twoThings = parseFile('./fixtures/parent.tsx');
      const oneFunctions = findTranslationFunctions(oneThing);
      const twoFunctions = findTranslationFunctions(twoThings);

      expect(oneFunctions.length).toEqual(1);
      expect(twoFunctions.length).toEqual(2);
    });

    it('finds t() translations', () => {
      const oneThing = parseFile('./fixtures/child.tsx');
      const twoThings = parseFile('./fixtures/parent.tsx');
      const oneFunctions = findTranslationFunctions(oneThing);
      const twoFunctions = findTranslationFunctions(twoThings);
      const oneMatches = findTerms(oneFunctions);
      const twoMatches = findTerms(twoFunctions);

      expect(oneMatches).toEqual(expect.arrayContaining(['woop']));
      expect(twoMatches).toEqual(expect.arrayContaining(['{{count}} boys', '{{count}} girls']));
    });
  });
});
