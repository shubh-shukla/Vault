import { filterSearchIndex } from '../filterSearchIndex';
import type { SearchableEntry } from '../types';

const index: SearchableEntry[] = [
  {
    entryType: 'wifiCredentials',
    entryId: 'w1',
    title: 'HomeWifi',
    subtitle: 'Wi-Fi credential',
  },
  {
    entryType: 'licenseKeys',
    entryId: 'l1',
    title: 'Photo Editor Pro',
    subtitle: 'License key',
  },
  {
    entryType: 'secureNotes',
    entryId: 'n1',
    title: 'Safe combination',
    subtitle: 'Secure note',
  },
];

describe('filterSearchIndex', () => {
  it('returns nothing for an empty query', () => {
    expect(filterSearchIndex(index, '')).toEqual([]);
    expect(filterSearchIndex(index, '   ')).toEqual([]);
  });

  it('matches case-insensitively on the title', () => {
    expect(filterSearchIndex(index, 'homewifi')).toEqual([index[0]]);
  });

  it('matches on a substring, not just a prefix', () => {
    expect(filterSearchIndex(index, 'editor')).toEqual([index[1]]);
  });

  it('matches on the subtitle (entry kind)', () => {
    expect(filterSearchIndex(index, 'secure note')).toEqual([index[2]]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterSearchIndex(index, 'nonexistent')).toEqual([]);
  });
});
