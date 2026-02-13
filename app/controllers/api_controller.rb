# frozen_string_literal: true

class ApiController < ActionController::API
  rescue_from PrayerTime::InvalidZoneError do |e|
    render json: { error: e.message }, status: :not_found
  end
end
