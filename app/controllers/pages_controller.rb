# frozen_string_literal: true

class PagesController < ApplicationController
  def index
  end

  def show
    render available_page(params[:id])
  end

  private

  def available_page(page)
    %w[api qibla maps].include?(page) ? page : raise(ActionController::RoutingError, 'Not Found')
  end

end
