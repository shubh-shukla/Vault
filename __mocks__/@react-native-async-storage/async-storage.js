let store = new Map();

const AsyncStorageMock = {
  getItem: jest.fn(async key => (store.has(key) ? store.get(key) : null)),
  setItem: jest.fn(async (key, value) => {
    store.set(key, value);
  }),
  removeItem: jest.fn(async key => {
    store.delete(key);
  }),
  getMany: jest.fn(async keys => {
    const result = {};
    for (const key of keys) {
      result[key] = store.has(key) ? store.get(key) : null;
    }
    return result;
  }),
  setMany: jest.fn(async entries => {
    for (const [key, value] of Object.entries(entries)) {
      store.set(key, value);
    }
  }),
  removeMany: jest.fn(async keys => {
    for (const key of keys) {
      store.delete(key);
    }
  }),
  getAllKeys: jest.fn(async () => Array.from(store.keys())),
  clear: jest.fn(async () => {
    store = new Map();
  }),
  __reset: () => {
    store = new Map();
  },
};

module.exports = AsyncStorageMock;
module.exports.default = AsyncStorageMock;
