'use strict';

const checkpoint = require('../checkpoint');
const runExec = require('../run-exec')
const changelog = require('./changelog');

function resetChangelog (args) {
  checkpoint(args, 'Getting all tags starting from repository creation', []);

  return runExec(args, 'git tag --sort=version:refname')
    .then(rawTags => {
      const tags = rawTags.split('\n');

      if (tags.length === 0) {
        checkpoint(args, 'Fetch %s tags. Nothing to do', [tags.length]);

        return Promise.resolve();
      }

      // Discard last element in array as it is an empty string (empty line at the end of git tag)
      const firstTag = tags[0];
      const lastTag = tags[tags.length - 2];

      checkpoint(args, 'Found %s tags ranging from %s and %s', [tags.length, firstTag, lastTag]);

      return changelog(args, null);
    });
}

module.exports = resetChangelog;
