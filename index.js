const path = require('path')
const printError = require('./lib/print-error')

const gitBranch = require('git-branch')
const bump = require('./lib/lifecycles/bump')
const changelog = require('./lib/lifecycles/changelog')
const commit = require('./lib/lifecycles/commit')
const tag = require('./lib/lifecycles/tag')

const ALLOWED_BRANCHES = [ 'master' ];

module.exports = function standardVersion (argv) {
  let branch;

  try {
    branch = gitBranch.sync();
  } catch(err) {
    const noBranch = new Error(`This folder does not have an initialized Git repository`);

    printError({}, noBranch);
    
    return Promise.reject(noBranch);
  }

  if (!ALLOWED_BRANCHES.includes(branch)) {
    const notAllowedBranch = new Error(`This command is only allowed on the following branches: ${ALLOWED_BRANCHES.join(',')}`);
    
    printError({}, notAllowedBranch);

    return Promise.reject(notAllowedBranch);
  }

  var pkgPath = path.resolve(process.cwd(), './package.json')
  var pkg = require(pkgPath)
  var newVersion = pkg.version
  var defaults = require('./defaults')
  var args = Object.assign({}, defaults, argv)

  return Promise.resolve()
    .then(() => {
      return bump(args, pkg)
    })
    .then((_newVersion) => {
      // if bump runs, it calculaes the new version that we
      // should release at.
      if (_newVersion) newVersion = _newVersion
      return changelog(args, newVersion)
    })
    .then(() => {
      return commit(args, newVersion)
    })
    .then(() => {
      return tag(newVersion, pkg.private, args)
    })
    .catch((err) => {
      printError(args, err.message)
      throw err
    })
}
