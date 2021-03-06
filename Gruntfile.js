'use strict';
var markdown = require('marked');
var semver = require('semver');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: require('./package.json'),
    jshint: {
      all: {
        options: {
          jshintrc: './.jshintrc'
        },
        src: [
          '**/index.js',
          '*.js',
          '!test/**/*.js',
          '!node_modules/**/*.js'
        ]
      }
    },
    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        versionFile: 'package.json'
      }
    },
    release: {
      options: {
        commitMessage: '<%= version %>',
        tagName: 'v<%= version %>',
        bump: false, // we have our own bump
        file: 'package.json'
      }
    },
    stage: {
      options: {
        files: ['CHANGELOG.md']
      }
    }
  });

  grunt.registerTask('bump', 'Bump manifest version', function (type) {
    var options = this.options({
      file: grunt.config('pkgFile') || 'package.json'
    });

    function setup(file, type) {
      var pkg = grunt.file.readJSON(file);
      var newVersion = pkg.version = semver.inc(pkg.version, type || 'patch');
      return {
        file: file,
        pkg: pkg,
        newVersion: newVersion
      };
    }

    var config = setup(options.file, type);
    grunt.file.write(
      config.file,
      JSON.stringify(config.pkg, null, '  ') + '\n'
    );
    grunt.log.ok('Version bumped to ' + config.newVersion);
  });

  grunt.registerTask('stage', 'Git adds files', function () {
    var files = this.options().files;
    grunt.util.spawn({
      cmd: process.platform === 'win32' ? 'git.cmd' : 'git',
      args: ['add'].concat(files)
    }, grunt.task.current.async());
  });

  grunt.registerTask('default', [
    'jshint',
    'bump',
    'changelog',
    'stage',
    'release'
  ]);
};
