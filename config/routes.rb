# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    get "locations", to: "locations#index"
    get "daily/:zone", to: "prayer_times#daily"
    get "monthly/:zone(/:month)", to: "prayer_times#monthly"
    get "yearly/:zone(/:year)", to: "prayer_times#yearly"
  end

  resources :zones

  get "/pages/*id", to: "pages#show", as: :page
  get "/manifest", to: "application#manifest", formats: [:json]

  root to: "zones#show"

  mount ActionCable.server => "/cable"
end
