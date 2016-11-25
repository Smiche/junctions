/**
 * Grunt configuration file.
 * Several tasks are run:
 * 1. html templates are turned into js
 * 2. angular annotation is ran over the source in case some strict-di was missed
 * 3. Entire source is concatenated into 1js file
 * 4. the source is then minified
 */

module.exports = function (grunt) {
	//init configurations
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				//grab source from all of these folders
				src: ['threejs/**/*.js'],
				dest: 'build/index.js'
			}
		},
		uglify: {
			dev: {
				options: {
					mangle: true,
					//keep to true or minified breaks!
					keep_fnames: true
				},
				files: {
					//destination minified is dest.min.js
					'dist/dest.min.js': 'dist/app.js'
				}
			}
		},
		concurrent: {
        target: {
            tasks: ['server', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        }
    	}
	});

	//load tasks

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	//'server', 'protractor_webdriver','protractor' 'uglify'
	grunt.registerTask('all', [ 'concat']);
};