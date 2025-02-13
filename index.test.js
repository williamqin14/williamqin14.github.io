const execa = require('execa');
const fs = require('fs');

afterEach(done => {
  fs.access('test-sitemap.xml', err => {
    if (!err) {
      fs.unlink('test-sitemap.xml', done);
    }
  });
});

test('should create sitemap file', () => {
  expect.assertions(1);

  return execa('node', ['index.js', 'http://example.com', 'test-sitemap.xml']).then(
    () => {
      expect(() => fs.accessSync('test-sitemap.xml')).not.toThrow();
    }
  );
}, 20000);

test('should write to stdout in verbose mode', () => {
  expect.assertions(1);

  return execa('node', [
    'index.js',
    'http://example.com',
    'test-sitemap.xml',
    '--verbose'
  ]).then(result => {
    expect(result.stdout).not.toBe('');
  });
}, 20000);

test('should adds last-mod header to xml', () => {
  return execa('node', [
    'index.js',
    'http://example.com',
    'test-sitemap.xml',
    '--last-mod'
  ]).then(() => {
    fs.readFile('test-sitemap.xml', 'utf8', (err, data) => {
      if (err) throw err;
      expect(data).toContain('<lastmod>');
    });
  });
}, 20000);

test('should ignore specified subdirectory', () => {
  return execa('node', [
    'index.js',
    'https://rowlandmusicschool.com',
    'test-sitemap.xml',
    '-b=https://rowlandmusicschool.com/contact-us'
  ]).then(() => {
    fs.readFile('test-sitemap.xml', 'utf8', (err, data) => {
      if (err) throw err;
      expect(data).not.toContain('https://rowlandmusicschool.com/contact-us');
    });
  });
}, 20000);

