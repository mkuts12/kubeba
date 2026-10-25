import { describe, expect, it } from 'vitest';
import { teachingCredits } from './credits';

describe('visible credits and author support', () => {
  it('credits the teaching authors and makes the access limits clear', () => {
    expect(teachingCredits).toHaveLength(4);
    expect(teachingCredits.find((c) => c.author === 'Forrest Kinney')!.scope).toContain(
      'not read or copied',
    );
    expect(teachingCredits.find((c) => c.author.startsWith('Tim Richards'))!.scope).toContain(
      'not the complete book',
    );
    const textbook = teachingCredits.find((c) => c.title.startsWith('Open Music Theory'))!;
    expect(textbook.author).toContain('John Peterson');
    expect(textbook.author).toContain('Megan Lavengood');
    expect(textbook.scope).toContain('CC BY-SA 4.0');
  });
  it('uses direct author or publisher purchase links with no affiliate parameters', () => {
    const purchaseLinks = teachingCredits.filter((c) => c.support.kind === 'buy');
    expect(purchaseLinks).toHaveLength(3);
    expect(purchaseLinks.map((c) => new URL(c.support.url).hostname)).toEqual([
      'forrestkinney.com',
      'www.schott-music.com',
      'www.halleonard.com',
    ]);
    purchaseLinks.forEach((credit) => {
      const url = new URL(credit.support.url);
      expect(url.protocol).toBe('https:');
      expect(url.search).toBe('');
      expect(credit.support.note.length).toBeGreaterThan(20);
    });
  });
  it('does not invent a purchase or donation route for the free textbook', () => {
    const textbook = teachingCredits.find((c) => c.title.startsWith('Open Music Theory'))!;
    expect(textbook.support.kind).toBe('free');
    expect(textbook.support.url).toBe('https://viva.pressbooks.pub/openmusictheory/');
    expect(textbook.support.note).toContain('free by design');
  });
  it('does not present the fiddle book as a piano method', () => {
    const glaser = teachingCredits.find((c) => c.author.startsWith('Matt Glaser'))!;
    expect(glaser.support.note).toContain('fiddle book');
    expect(glaser.support.url).toContain('50449602/bluegrass-fiddle-and-beyond');
  });
});
