var defaults = require('./defaults')

module.exports = require('yargs')
  .usage('Usage: $0 [options]')
  .option('release-as', {
    alias: 'r',
    describe: 'Specify the release type manually (like npm version <major|minor|patch>)',
    requiresArg: true,
    string: true
  })
  .option('prerelease', {
    alias: 'p',
    describe: 'make a pre-release with optional option value to specify a tag id',
    string: true
  })
  .option('infile', {
    alias: 'i',
    describe: 'Read the CHANGELOG from this file',
    default: defaults.infile
  })
  .option('message', {
    alias: 'm',
    describe: 'Commit message, replaces %s with new version',
    type: 'string',
    default: defaults.message
  })
  .option('first-release', {
    alias: 'f',
    describe: 'Is this the first release?',
    type: 'boolean',
    default: defaults.firstRelease
  })
  .option('sign', {
    alias: 's',
    describe: 'Should the git commit and tag be signed?',
    type: 'boolean',
    default: defaults.sign
  })
  .option('no-verify', {
    alias: 'n',
    describe: 'Bypass pre-commit or commit-msg git hooks during the commit phase',
    type: 'boolean',
    default: defaults.noVerify
  })
  .option('commit-all', {
    alias: 'a',
    describe: 'Commit all staged changes, not just files affected by standard-version',
    type: 'boolean',
    default: defaults.commitAll
  })
  .option('silent', {
    describe: 'Don\'t print logs and errors',
    type: 'boolean',
    default: defaults.silent
  })
  .option('tag-prefix', {
    alias: 't',
    describe: 'Set a custom prefix for the git tag to be created',
    type: 'string',
    default: defaults.tagPrefix
  })
  .option('scripts', {
    describe: 'Provide scripts to execute for lifecycle events (prebump, precommit, etc.,)',
    default: defaults.scripts
  })
  .option('skip', {
    describe: 'Map of steps in the release process that should be skipped',
    default: defaults.scripts
  })
  .option('dry-run', {
    type: 'boolean',
    default: defaults.dryRun,
    describe: 'See the commands that running standard-version would run'
  })
  .option('resetChangelog', {
    type: 'boolean',
    default: defaults.resetChangelog,
    describe: 'Recreates the changelog from scratch'
  })
  .option('overwriteBranchRule', {
    type: 'boolean',
    default: defaults.overwriteBranchRule,
    describe: 'Overwrite branch restriction rule'
  })
  .check((argv) => {
    if (typeof argv.scripts !== 'object' || Array.isArray(argv.scripts)) {
      throw Error('scripts must be an object')
    } else if (typeof argv.skip !== 'object' || Array.isArray(argv.skip)) {
      throw Error('skip must be an object')
    } else {
      return true
    }
  })
  .version()
  .alias('version', 'v')
  .help()
  .alias('help', 'h')
  .example('$0', 'Update changelog and tag release')
  .example('$0 -m "%s: see changelog for details"', 'Update changelog and tag release with custom commit message')
  .pkgConf('standard-version')
  .wrap(97)
