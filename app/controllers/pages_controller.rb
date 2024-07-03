# frozen_string_literal: true

class PagesController < ApplicationController
  def index
  end

  def show
    render params[:id]
  end
end
