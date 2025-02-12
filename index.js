#!/usr/bin/env node

const program = require('commander');
const SitemapGenerator = require('sitemap-generator');
const chalk = require('chalk');
const httpagent = require('http-proxy-agent');
const httpsagent = require('https-proxy-agent');

const pkg = require('./package.json');

function sitemapFactory() {
  program
    .version(pkg.version)
    .usage('[options] <url>')
    .option('-f, --filepath <filepath>', 'path to file including filename', 'sitemap.xml')
    .option('-m, --max-entries <maxEntries>', 'limits the maximum number of URLs per sitemap file', 50000)
    .option('-d, --max-depth <maxDepth>', 'limits the maximum distance from the original request', 0)
    .option('-q, --query', 'consider query string')
    .option('-u, --user-agent <agent>', 'set custom User Agent')
    .option('-v, --verbose', 'print details when crawling')
    .option('-c, --max-concurrency <maxConcurrency>', 'maximum number of requests the crawler will run simultaneously', v => parseInt(v), 5)
    .option('-r, --no-respect-robots-txt', 'controls whether the crawler should respect rules in robots.txt', true)
    .option('-l, --last-mod', 'add Last-Modified header to xml', true)
    .option('-g, --change-freq <changeFreq>', 'adds a <changefreq> line to each URL in the sitemap.')
    .option('-p, --priority-map <priorityMap>', 'priority for each depth url, values between 1.0 and 0.0, example: "1.0,0.8,0.6,0.4" ')
    .option('-x, --proxy <url>', 'Use the passed proxy URL')
    .option('-b, --blacklist <urls>', 'Comma-separated list of URLs to ignore, blacklisting the URLs and their subdirectories from being traversed', val => new Set(val.split(',')))
    .option('-a, --add-url <urls>', 'Comma-separated list of URLs to be added directly to the sitemap', val => val.split(','))
    .parse(process.argv);

  if (program.args.length < 1) {
    program.help();
  }

  let arrayPriority = [];
  if (program.priorityMap) {
    arrayPriority = program.priorityMap.split(',');
  }

  const options = {
    stripQuerystring: !program.query,
    filepath: program.filepath,
    maxEntriesPerFile: program.maxEntries,
    maxDepth: program.maxDepth,
    maxConcurrency: program.maxConcurrency,
    respectRobotsTxt: !!program.respectRobotsTxt,
    lastMod: !!program.lastMod,
    changeFreq: program.changeFreq,
    priorityMap: arrayPriority
  };

  if (program.userAgent) {
    options.userAgent = program.userAgent;
  }

  if (program.proxy) {
    var httpProxyAgent = new httpagent(program.proxy);
    var httpsProxyAgent = new httpsagent(program.proxy);
    options.httpAgent = httpProxyAgent;
    options.httpsAgent = httpsProxyAgent;
  }

  const generator = SitemapGenerator(program.args[0], options);

  if (program.addUrl) {
    program.addUrl.forEach(url => {
      generator.queueURL(url);
    });
  }
  
  if (program.blacklist) {
    const ignoreSet = program.blacklist;
    
    // Filter out blacklisted urls during discovery phase
    generator.getCrawler().discoverResources = function (buffer, queueItem) {
      const originalDiscover = this.constructor.prototype.discoverResources;
      const urls = originalDiscover.call(this, buffer, queueItem);
      return urls.filter(url => !ignoreSet.has(url));
    };

    generator.getCrawler().addFetchCondition((queueItem, referrerQueueItem, callback) => {
      // Don't add to queue any URLs that start with an ignored pattern (including subpaths)
      const shouldIgnore = [...ignoreSet].some(pattern => queueItem.url.startsWith(pattern));
      callback(null, !shouldIgnore);
    });
  }

  if (program.verbose) {
    let added = 0;
    let ignored = 0;
    let errored = 0;

    generator.on('add', url => {
      added += 1;
      console.log('[', chalk.green('ADD'), ']', chalk.gray(url));
    });

    generator.on('ignore', url => {
      ignored += 1;
      console.log('[', chalk.cyan('IGN'), ']', chalk.gray(url));
    });

    generator.on('error', error => {
      errored += 1;
      console.error('[', chalk.red('ERR'), ']', chalk.gray(error.url, ` (${error.code})`));
    });

    generator.on('done', () => {
      if (program.verbose) {
        const message = 'Added %s pages, ignored %s pages, encountered %s errors.';
        const stats = [chalk.white(message), added, ignored, errored];
        console.log.apply(this, stats);
      }
      process.exit(0);
    });
  }

  generator.start();
}

sitemapFactory();
