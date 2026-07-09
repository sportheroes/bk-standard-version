const execFile = require('child_process').execFile
const printError = require('./print-error')

module.exports = function (args, command, commandArgs) {
  if (args.dryRun) return Promise.resolve()
  return new Promise((resolve, reject) => {
    // Exec given command with args directly (no shell) and handle possible errors
    execFile(command, commandArgs, function (err, stdout, stderr) {
      // If exec returns content in stderr, but no error, print it as a warning
      // If exec returns an error, print it and exit with return code 1
      if (err) {
        printError(args, stderr || err.message)
        return reject(err)
      } else if (stderr) {
        printError(args, stderr, { level: 'warn', color: 'yellow' })
      }
      return resolve(stdout)
    })
  })
}
