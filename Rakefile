# coding: UTF-8

require 'yaml'

##
# Load Nanoc3 tasks for additional validators
#
# require 'nanoc3/tasks'

##
# Configurable Constants
#
BASE_URL = 'https://aktau.github.io'
# Switch PAGES_BRANCH to master for a Pages repo (e.g. username.github.com) and make NANOC_BRANCH something else.
NANOC_BRANCH = 'gh-pages-nanoc'
PAGES_BRANCH = 'gh-pages'
# A list of files to include in the deployment that are not in the output/ directory.
ADDITIONAL_FILES = [
  # 'CNAME'
]

##
# Github Pages-based Deployment
#
desc 'Deploy the website to Github Pages using Git. Set commit="some message" to set the commit message for the pages branch.'
task :deploy do
  ENV['commit'] ||= 'Updated content.'
  prepare!
  compile!
  Rake::Task["optimize:all"].invoke
  commit!
  deploy!
  revert!
end

##
# A couple of rake tasks that'll optimize JPG, PNG, JavaScripts and Stylesheet files
#
namespace :optimize do

  ##
  # Gem Requirement:
  #  YUI-Compressor - Bundled in Gemfile
  #
  desc 'Compress all stylesheet files'
  task :stylesheets do
    require 'yui/compressor'
    compressor = YUI::CssCompressor.new

    Dir['output/**/*.css'].each do |stylesheet|
      puts "Compressing Stylesheet: #{stylesheet}"
      css = File.read(stylesheet)
      File.open(stylesheet, 'w') do |file|
        file.write(compressor.compress(css))
      end
    end
  end

  ##
  # Gem Requirement:
  #  YUI-Compressor - Bundled in Gemfile
  #
  desc 'Compress all javascript files'
  task :javascripts do
    require 'yui/compressor'
    compressor = YUI::JavaScriptCompressor.new(:munge => true)

    Dir['output/**/*.js'].each do |javascript|
      puts "Compressing JavaScript: #{javascript}"
      js = File.read(javascript)
      File.open(javascript, 'w') do |file|
        file.write(compressor.compress(js))
      end
    end
  end

  ##
  # Package Requirement:
  #  jpegoptim
  # Install OSX:
  #  brew install jpegoptim
  # Install Ubuntu:
  #  [apt-get | aptitude] install jpegoptim
  #
  desc 'Optimize JPG images in output/images directory using jpegoptim'
  task :jpg do
    puts `find output/images -name '*.jpg' -exec jpegoptim {} \\;`
  end

  ##
  # Package Requirement:
  #  optipng
  # Install OSX:
  #  brew install optipng
  # Install Ubuntu:
  #  [apt-get | aptitude] install optipng
  #
  desc 'Optimize PNG images in output/images directory using optipng'
  task :png do
    puts `find output/images -name '*.png' -exec optipng {} \\;`
  end

  ##
  # Convenient task for performing all optimization techniques at once
  #
  desc 'Optimize all JPG, PNG, Stylesheet and JavaScript files in the output directory'
  task :all => [:jpg, :png, :javascripts, :stylesheets]
end

##
# Use this method to change the base url in the configuration file
# so you can automate that instead of manually changing it everytime
# when you want to deploy the website
#
def change_base_url_to(url)
  puts "Changing Base URL to #{url}.."
  config = YAML.load_file('./nanoc.yaml')
  config['base_url'] = url
  File.open('./nanoc.yaml', 'w') do |file|
    file.write(config.to_yaml)
  end
end

##
# Prepares the deployment environment
#
def prepare!
  unless %x[git status] =~ /nothing to commit/
    puts "Please commit or stash your changes before deploying!"
    exit 1
  end
end

##
# Re-compile by removing the output directory and re-compiling
#
def compile!
  change_base_url_to(BASE_URL)

  puts "Compiling website.."
  puts %x[rm -rf output]
  puts %x[nanoc compile]

  puts "Reverting code changes..."
  puts %x[git reset --hard]
end

##
# Commits compiled output.
#
def commit!
  puts "Creating and moving to \"#{PAGES_BRANCH}\" branch.."

  # Create gh-pages branch if necessary
  unless system("git checkout #{PAGES_BRANCH}")
    %x[git checkout --orphan #{PAGES_BRANCH}]
    %x[git ls-files].split("\n").each do |tracked_file|
      %x[git rm -f #{tracked_file}] unless tracked_file.start_with?('output/') || ADDITIONAL_FILES.include?(tracked_file)
    end
  end

  # Add all output and commit it
  puts "Adding and committing compiled output for deployment.."
  ADDITIONAL_FILES.each do |file|
    puts %x[git add #{file}]
  end
  Dir['output/*'].each do |output_file|
    destination = output_file.sub(/\Aoutput\//, '')
    puts %x[rm -rf "#{destination}"]
    puts %x[mv "#{output_file}" "#{destination}"]
    puts %x[git add "#{destination}"]
  end
  puts %x[git commit -m "#{ENV['commit'].gsub('"', '\"')}"]
end

##
# Deploys the site via git
#
def deploy!
  puts 'Pushing to Github..'
  puts %x[git push origin HEAD:#{PAGES_BRANCH} --force]
end

##
# Moves back to the nanoc branch
#
def revert!
  %x[git checkout #{NANOC_BRANCH}]
end
