# frozen_string_literal: true

class Api::PrayerTimesController < ApiController
  def daily
    zone = params[:zone] || "SGR01"
    data = PrayerTime.daily(zone: zone)
    locations = Location.all.select { |l| l["code"] == zone.upcase }
    render json: data.merge({ serverTime: Time.current, locations: locations })
  end

  def monthly
    zone = params[:zone] || "SGR01"
    data = PrayerTime.monthly(zone: zone)
    locations = Location.all.select { |l| l["code"] == zone.upcase }
    render json: data.merge({ serverTime: Time.current, locations: locations })
  end
end
