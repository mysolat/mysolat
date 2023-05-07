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
    year = params[:year] || Time.current.year
    month = params[:month] || Time.current.month
    data = PrayerTime.monthly(zone: zone, year: year, month: month)
    locations = Location.all.select { |l| l["code"] == zone.upcase }
    render json: data.merge({ serverTime: Time.current, locations: locations })
  end

  def yearly
    zone = params[:zone] || "SGR01"
    year = params[:year] || Time.current.year
    data = PrayerTime.yearly(zone: zone, year: year)
    locations = Location.all.select { |l| l["code"] == zone.upcase }
    render json: data.merge({ serverTime: Time.current, locations: locations })
  end
end
