const chalk = require('chalk')
const checkpoint = require('../checkpoint')
const figures = require('figures')
const formatCommitMessage = require('../format-commit-message')
const runExecFile = require('../run-exec-file')
const runLifecycleScript = require('../run-lifecycle-script')

module.exports = function (newVersion, pkgPrivate, args) {
  if (args.skip.tag) return Promise.resolve()
  return runLifecycleScript(args, 'pretag')
    .then(() => {
      return execTag(newVersion, pkgPrivate, args)
    })
    .then(() => {
      return runLifecycleScript(args, 'posttag')
    })
}

function execTag (newVersion, pkgPrivate, args) {
  var tagOption = args.sign ? '-s' : '-a'
  checkpoint(args, 'tagging release %s', [newVersion])
  return runExecFile(args, 'git', ['tag', tagOption, args.tagPrefix + newVersion, '-m', formatCommitMessage(args.message, newVersion)])
    .then(() => {
      var message = 'git push --follow-tags origin master'
      if (pkgPrivate !== true) message += ' && npm publish'
      if (args.prerelease !== undefined) message += ' --tag prerelease'

      checkpoint(args, 'Run `%s` to publish', [message], chalk.blue(figures.info))
    })
}
