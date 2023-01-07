# frozen_string_literal: true

class Api::PrayerTimesController < ApiController
  def daily
    zone = params[:zone] || "SGR01"
    data = PrayerTime.daily(zone: zone)
    render json: data.merge({ serverTime: Time.current })
  end

  def monthly
    zone = params[:zone] || "SGR01"
    data = PrayerTime.monthly(zone: zone)
    render json: data.merge({ serverTime: Time.current })
  end
end
