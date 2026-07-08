const bump = require('../lifecycles/bump')
const checkpoint = require('../checkpoint')
const formatCommitMessage = require('../format-commit-message')
const path = require('path')
const runExecFile = require('../run-exec-file')
const runLifecycleScript = require('../run-lifecycle-script')

module.exports = function (args, newVersion) {
  if (args.skip.commit) return Promise.resolve()
  return runLifecycleScript(args, 'precommit')
    .then((message) => {
      if (message && message.length) args.message = message
      return execCommit(args, newVersion)
    })
    .then(() => {
      return runLifecycleScript(args, 'postcommit')
    })
}

function execCommit (args, newVersion) {
  var msg = 'committing %s'
  var paths = [args.infile]
  var toAdd = []
  // commit any of the config files that we've updated
  // the version # for.
  Object.keys(bump.getUpdatedConfigs()).forEach(function (p) {
    if (bump.getUpdatedConfigs()[p]) {
      msg += ' and %s'
      paths.unshift(path.basename(p))
      toAdd.push(path.relative(process.cwd(), p))
    }
  })
  checkpoint(args, msg, paths)
  return runExecFile(args, 'git', ['add'].concat(toAdd, [args.infile]))
    .then(() => {
      var commitArgs = ['commit']
      if (args.verify === false || args.n) commitArgs.push('--no-verify')
      if (args.sign) commitArgs.push('-S')
      if (!args.commitAll) commitArgs = commitArgs.concat([args.infile], toAdd)
      commitArgs = commitArgs.concat(['-m', formatCommitMessage(args.message, newVersion), '-m', '[ci skip]'])
      return runExecFile(args, 'git', commitArgs)
    })
}
