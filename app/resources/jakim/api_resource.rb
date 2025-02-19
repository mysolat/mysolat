# frozen_string_literal: true

class Jakim::ApiResource < ApplicationResource
  verbose!
  base_url "https://www.e-solat.gov.my/index.php"

  get :daily, "", defaults: { r: "esolatApi/TakwimSolat", period: "today", zone: "SGR01" }
  get :monthly, "", defaults: { r: "esolatApi/TakwimSolat", period: "month", zone: "SGR01", month: Time.current.month }
  get :yearly, "", defaults: { r: "esolatApi/TakwimSolat", period: "year", zone: "SGR01", year: Time.current.year }

  cattr_accessor :cache_expiry

  before_request :upcase_zone
  before_request :set_cache_key
  after_request :set_cache_header

  private

  def upcase_zone(name, request)
    request.get_params[:zone] = request.get_params[:zone].upcase
  end

  def set_cache_key(name, request)
    self.cache_expiry = case name
    when :daily
      Time.current.end_of_day
    when :monthly
      Date.new(Date.current.year, request.get_params[:month].to_i, 1).to_time.end_of_month
    when :yearly
      Date.new(request.get_params[:year].to_i, 12, 31).to_time.end_of_year
    end
  end

  def set_cache_header(name, response)
    response.response_headers["Expires"] = cache_expiry.iso8601
  end
end
