const accessSync = require('fs-access').sync
const chalk = require('chalk')
const checkpoint = require('../checkpoint')
const sportHeroesGroupConvention = require('@sportheroes/bk-conventional-changelog')
const conventionalChangelog = require('conventional-changelog')
const fs = require('fs')
const runLifecycleScript = require('../run-lifecycle-script')
const writeFile = require('../write-file')

module.exports = function (args, newVersion) {
  if (args.skip.changelog || args.prerelease) return Promise.resolve()
  return runLifecycleScript(args, 'prechangelog')
    .then(() => {
      return outputChangelog(args, newVersion)
    })
    .then(() => {
      return runLifecycleScript(args, 'postchangelog')
    })
}

function outputChangelog (args, newVersion) {
  return new Promise((resolve, reject) => {
    createIfMissing(args)
    var header = '# Change Log\n\nAll notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.\n'
    var oldContent = args.dryRun ? '' : fs.readFileSync(args.infile, 'utf-8')
    // find the position of the last release and remove header:
    if (oldContent.indexOf('<a name=') !== -1) {
      oldContent = oldContent.substring(oldContent.indexOf('<a name='))
    }
    var content = ''
    var context
    if (args.dryRun) context = {version: newVersion}
    if (args.resetChangelog) {
      checkpoint(args, 'Old content in %s has been wiped', [args.infile])
      oldContent = '';
      context = Object.assign({}, context || {}, {
        resetChangelog: true,
        version: newVersion,
      });
    }

    var gitRawCommitsOpts = {
      format: sportHeroesGroupConvention.commitFormat,
      merges: null
    }

    var changelogStream = conventionalChangelog({
      config: sportHeroesGroupConvention
    }, context, gitRawCommitsOpts)
      .on('error', function (err) {
        return reject(err)
      })

    changelogStream.on('data', function (buffer) {
      content += buffer.toString()
    })

    changelogStream.on('end', function () {
      checkpoint(args, 'outputting changes to %s', [args.infile])
      if (args.dryRun) console.info(`\n---\n${chalk.gray(content.trim())}\n---\n`)
      else writeFile(args, args.infile, header + '\n' + (content + oldContent).replace(/\n+$/, '\n'))
      return resolve()
    })
  })
}

function createIfMissing (args) {
  try {
    accessSync(args.infile, fs.F_OK)
  } catch (err) {
    if (err.code === 'ENOENT') {
      checkpoint(args, 'created %s', [args.infile])
      args.outputUnreleased = true
      writeFile(args, args.infile, '\n')
    }
  }
}
