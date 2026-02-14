Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", :as => :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  get "manifest" => "rails/pwa#manifest", :as => :pwa_manifest
  get "service-worker" => "rails/pwa#service_worker", :as => :pwa_service_worker

  # Defines the root path route ("/")
  root to: "zones#show"

  namespace :api, defaults: { format: :json } do
    get "locations", to: "locations#index"
    get "daily/:zone", to: "prayer_times#daily"
    get "monthly/:zone(/:month)", to: "prayer_times#monthly"
    get "yearly/:zone(/:year)", to: "prayer_times#yearly"
  end

  get "sitemap", to: "sitemaps#index", defaults: { format: :xml }, as: :sitemap

  resources :zones

  get "/takwim", to: "zones#monthly", as: :takwim



  get "/:location_name", to: "zones#show", as: :location,
    constraints: ->(req) { Location.valid_name?(req.params[:location_name]) }

  namespace :push do
    resources :subscriptions, only: [:create, :destroy]
  end

  get "/*id", to: "pages#show", as: :page
  get "/manifest", to: "application#manifest", formats: [:json]
end
