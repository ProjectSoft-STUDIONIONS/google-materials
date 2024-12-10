module.exports = function(grunt) {
	require('dotenv').config();
	const DEBUG = parseInt(process.env.DEBUG) || false;
	var fs = require('fs'),
		async = require('async'),
		path = require('path'),
		chalk = require('chalk'),
		PACK = grunt.file.readJSON('package.json'),
		uniqid = function () {
			var md5 = require('md5');
			result = md5((new Date()).getTime()).toString();
			grunt.verbose.writeln("Generate hash: " + chalk.cyan(result) + " >>> OK");
			return result;
		};
	grunt.registerMultiTask('renameExt', 'Grunt plugin to rename files extensions', function() {
		var done = this.async();
		var options = this.options({
			cwd: '.',
			extension: ""
		});
		
		var data = this.data;
		
		if (!data.src) {
			grunt.fail.fatal('src is required');
		}
		if (!data.dest) {
			grunt.fail.fatal('dest is required');
		}
		
		grunt.file.mkdir(data.dest);
		
		var files = grunt.file.expand({
			filter: 'isFile',
			cwd: options.cwd
		}, data.src);
		
		async.each(files, function(file, cb) {
			file = path.normalize(file);
			var dirname = path.dirname(file);
			var extname = path.extname(file);
			var filename = path.basename(file, extname);
			grunt.file.copy(file, path.normalize(path.join(data.dest, filename + options.extension)));
			grunt.file.delete(file);
			grunt.log.ok('File "' + file + '" copy to "' + path.normalize(path.join(data.dest, filename + options.extension)) + '".');
			cb();
		}, function(err) {
			if (err) {
				return done(err);
			}
			grunt.log.ok(files.length + ' files copied.');
			done();
		});
	});
	
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);
	var optionsPug = {
			doctype: 'html',
			client: false,
			pretty: "",
			separator:  "",
			//pretty: '\t',
			//separator:  '\n',
			data: function(dest, src) {
				return {
					"hash": uniqid()
				}
			}
		};
	grunt.initConfig({
		globalConfig : {},
		pkg : PACK,
		clean: {
			options: {
				force: true
			},
			all: [
				path.normalize('docs/'),
				path.normalize('src/fonts'),
				path.normalize('src/less/google-material-bold.less'),
				path.normalize('src/pug/google-material-regular.pug')
			]
		},
		webfont: {
			regular: {
				src: path.normalize('src/google-material/regular/') + '*.svg',
				dest: path.normalize('src/fonts/'),
				options: {
					hashes: true,
					relativeFontPath: '@{fontpath}',
					destLess: path.normalize('src/pug'),
					font: 'google-material-regular',
					types: 'ttf',
					fontFamilyName: 'Google Material',
					stylesheets: ['less'],
					syntax: 'bootstrap',
					engine: 'node',
					autoHint: false,
					execMaxBuffer: 1024 * 200,
					htmlDemo: false,
					version: "1.0.0",
					normalize: true,
					startCodepoint: 0xE900,
					iconsStyles: false,
					templateOptions: {
						fontfaceStyles: false,
						fontWeight: "normal",
						baseClass: '',
						classPrefix: 'gm-'
					},
					embed: false,
					template: path.normalize('src/json.template')
				}
			},
			bold: {
				src: path.normalize('src/google-material/bold/') + '*.svg',
				dest: path.normalize('src/fonts/'),
				options: {
					hashes: true,
					relativeFontPath: '@{fontpath}',
					destLess: path.normalize('src/less'),
					font: 'google-material-bold',
					types: 'ttf',
					fontFamilyName: 'Google Material',
					stylesheets: ['less'],
					syntax: 'bootstrap',
					engine: 'node',
					autoHint: false,
					execMaxBuffer: 1024 * 200,
					htmlDemo: false,
					version: "1.0.0",
					normalize: true,
					startCodepoint: 0xE900,
					iconsStyles: false,
					templateOptions: {
						fontfaceStyles: false,
						fontWeight: "bold",
						baseClass: '',
						classPrefix: 'gm-'
					},
					embed: false,
					template: path.normalize('src/font-build.template')
				}
			},
		},
		ttf2eot: {
			default: {
				src: path.normalize('src/fonts/') + '*.ttf',
				dest: path.normalize('docs/fonts/')
			}
		},
		ttf2woff: {
			default: {
				src: path.normalize('src/fonts/') + '*.ttf',
				dest: path.normalize('docs/fonts/')
			}
		},
		ttf2woff2: {
			default: {
				src: path.normalize('src/fonts/') + '*.ttf',
				dest: path.normalize('docs/fonts/')
			}
		},
		renameExt: {
			options: {
				extension: ".pug"
			},
			files: {
				src: path.normalize('src/pug/') + '*.less',
				dest: path.normalize('src/pug/'),
			}
		},
		copy: {
			fonts: {
				expand: true,
				cwd: path.normalize('src/fonts'),
				src: [
					'**'
				],
				dest: path.normalize('docs/fonts/'),
			},
		},
		less: {
			css: {
				options : {
					compress: false,
					ieCompat: false,
					plugins: [],
					modifyVars: {
						'hash': '"' + uniqid() + '"',
						'fontpath': '../fonts',
					}
				},
				files : {
					'docs/css/main.css' : [
						path.normalize('src/less/main.less')
					],
					'docs/css/material.css' : [
						path.normalize('src/less/material.less')
					],
				}
			},
		},
		pug: {
			serv: {
				options: optionsPug,
				files: [
					{
						expand: true,
						cwd: path.normalize(__dirname + '/src/pug/'),
						src: [ '*.pug' ],
						dest: path.normalize(__dirname + '/docs/'),
						ext: '.html'
					},
				]
			},
		},
	});
	grunt.registerTask('default',	[
		"clean",
		"webfont",
		"ttf2eot",
		"ttf2woff",
		"ttf2woff2",
		"renameExt",
		"less",
		"pug",
		"copy"
	]);
};
		