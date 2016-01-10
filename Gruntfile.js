'use strict';
module.exports = function(grunt) {
	// Dynamically loads all required grunt tasks
	require('matchdep').filterDev('grunt-*')
		.forEach(grunt.loadNpmTasks);
		
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		/**
		 * All TypeScript compilation tasks
		 */
		ts: {
			app: {
				src: ['./resource/**/*.ts', './test/**/*.ts'],
				options: {
					target: 'ES5',
					module: 'commonjs',
					sourceMap: true,
					declaration: !!grunt.option('with-dts') // conditionally create *.d.ts files
				}
			}
		},

		////////////////////////////////////////////////////////////////
		//
		// Below this line only main tasks, alphabetically (the tasks
		// from above are usually not called directly).
		//
		////////////////////////////////////////////////////////////////
		
		/**
		* This one allows to perform multiple (watch-)tasks in parallel.
		*/
		concurrent: {
			options: { logConcurrentOutput: true },
			
			// Tasks to watch during development
			dev: {
				tasks: ['watch:ts']
			}
		},
		
		/**
		* All watchable tasks. The specified tasks will be run if
		* the files specified change.
		*/
		watch: {			
			ts: {
				files: ['./resource/**/*.ts', './test/**/*.ts'],
				tasks: ['ts:app']
			}
		}
	});
	
	grunt.registerTask('default', ['ts:app'])
	
	grunt.registerTask('watch-dev', [
		'default',
		'concurrent:dev'
	]);
};