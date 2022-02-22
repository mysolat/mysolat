require 'mina/rails'
require 'mina/git'
require 'mina/asdf'

set :application_name, 'mysolat'
set :domain, 'solat.my'
set :deploy_to, '/home/system/sites/mysolat'
set :repository, 'git@github.com:mysolat/mysolat.git'
set :branch, 'master'

# Optional settings:
set :user, 'system'          # Username in the server to SSH to.
set :port, '22'              # SSH port number.
set :forward_agent, true     # SSH forward_agent.

set :shared_dirs,  fetch(:shared_dirs, []).push('node_modules', 'public/packs', 'storage', 'tmp')
set :shared_files, fetch(:shared_files, []).push('config/application.yml', 'config/database.yml')


task :remote_environment do
  invoke :'asdf:load'
end

task :setup do
  command %{asdf plugin update --all}
  command %{asdf install ruby 3.1.1 --skip-existing}
  command %{asdf install yarn 1.22.17--skip-existing}
  command %{asdf install nodejs lts --skip-existing}
  command %[touch "#{fetch(:shared_path)}/config/application.yml"]
  command %[touch "#{fetch(:shared_path)}/config/database.yml"]
  comment "Be sure to edit '#{fetch(:shared_path)}/config/database.yml', 'application.yml'."
end

desc "Deploys the current version to the server."
task :deploy do
  deploy do
    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'
    invoke :'bundle:install'
    invoke :'rails:db_create'
    invoke :'rails:db_migrate'
    invoke :'rails:assets_precompile'
    invoke :'deploy:cleanup'

    on :launch do
      in_path(fetch(:current_path)) do
        command %{touch tmp/restart.txt}
      end
    end
  end
end
