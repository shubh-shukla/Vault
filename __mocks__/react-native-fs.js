let files = new Map();
let directories = new Set();

const RNFS = {
  DocumentDirectoryPath: '/mock/documents',
  CachesDirectoryPath: '/mock/caches',
  mkdir: jest.fn(async path => {
    directories.add(path);
  }),
  exists: jest.fn(async path => files.has(path) || directories.has(path)),
  writeFile: jest.fn(async (path, contents) => {
    files.set(path, contents);
  }),
  readFile: jest.fn(async path => {
    if (!files.has(path)) {
      throw new Error(`ENOENT: no such file, open '${path}'`);
    }
    return files.get(path);
  }),
  unlink: jest.fn(async path => {
    files.delete(path);
  }),
  __reset: () => {
    files = new Map();
    directories = new Set();
    RNFS.mkdir.mockClear();
    RNFS.exists.mockClear();
    RNFS.writeFile.mockClear();
    RNFS.readFile.mockClear();
    RNFS.unlink.mockClear();
  },
  __setFile: (path, contents) => {
    files.set(path, contents);
  },
};

module.exports = RNFS;
module.exports.default = RNFS;
