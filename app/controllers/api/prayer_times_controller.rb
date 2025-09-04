# frozen_string_literal: true

class Api::PrayerTimesController < ApiController
  before_action :set_zone

  def daily
    data = PrayerTime.daily(zone: @zone)
    render json: data.merge({ serverTime: Time.current, locations: locations })
  end

  def monthly
    year = params[:year] || Time.current.year
    month = params[:month] || Time.current.month
    data = PrayerTime.monthly(zone: @zone, year: year, month: month)
    render json: data.merge({ serverTime: Time.current, locations: locations })
  end

  def yearly
    year = params[:year] || Time.current.year
    data = PrayerTime.yearly(zone: @zone, year: year)
    render json: data.merge({ serverTime: Time.current, locations: locations })
  end

  private

  def set_zone
    @zone = (params[:zone] || "SGR01").upcase
  end

  def locations
    Location.all.select { |l| l["code"] == @zone }
  end
end
