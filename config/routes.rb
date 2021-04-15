Rails.application.routes.draw do
  mount ActionCable.server => '/cable'

  namespace :api, defaults: { format: :json } do
    get 'locations', to: 'locations#index'
    get 'daily(/:zone)', to: 'prayer_times#daily'
    get 'monthly(/:zone)', to: 'prayer_times#monthly'
  end

  resources :zones

  constraints HighVoltage::Constraints::RootRoute.new do
    get '/*id', to: 'pages#show', as: :page, format: false
  end

  root to: 'zones#show'
end
