/* eslint-env node */
const nodeCrypto = require('crypto');

const QuickCrypto = {
  randomBytes: size => nodeCrypto.randomBytes(size),
  createCipheriv: (...args) => nodeCrypto.createCipheriv(...args),
  createDecipheriv: (...args) => nodeCrypto.createDecipheriv(...args),
  hkdfSync: (digest, key, salt, info, keylen) =>
    Buffer.from(nodeCrypto.hkdfSync(digest, key, salt, info, keylen)),
  scryptSync: (password, salt, keylen) =>
    nodeCrypto.scryptSync(password, salt, keylen),
  Buffer,
};

module.exports = QuickCrypto;
module.exports.default = QuickCrypto;
