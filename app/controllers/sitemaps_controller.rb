# frozen_string_literal: true

class SitemapsController < ApplicationController
  def index
    @locations = Location.data.map { |l| l[:location].downcase.tr(" ", "-") }.uniq
    @states = Location.data.map { |l| l[:state].downcase.tr(" ", "-") }.uniq
  end
end
