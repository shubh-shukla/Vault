let clipboardContents = '';

const Clipboard = {
  getString: jest.fn(async () => clipboardContents),
  setString: jest.fn(content => {
    clipboardContents = content;
  }),
  __reset: () => {
    clipboardContents = '';
  },
};

module.exports = Clipboard;
module.exports.default = Clipboard;
