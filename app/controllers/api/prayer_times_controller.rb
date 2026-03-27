# frozen_string_literal: true

class Api::PrayerTimesController < ApiController
  before_action :set_zone, except: :detect

  def detect
    lat = params[:latitude].presence
    lon = params[:longitude].presence

    return render json: { error: "latitude and longitude are required" }, status: :bad_request if lat.nil? || lon.nil?

    result = Location.nearest_zone(lat, lon)

    return render json: { error: "Invalid coordinates" }, status: :unprocessable_content if result.nil?

    zone_code, distance_km = result

    # Treat as outside Malaysia if nearest zone centroid is more than 500 km away
    if distance_km > 500
      return render json: { error: "Location is outside Malaysia", latitude: lat.to_f, longitude: lon.to_f }, status: :unprocessable_content
    end

    @zone = zone_code

    data = PrayerTime.daily(zone: @zone)
    render json: data.merge({
      serverTime: Time.current,
      detectedZone: @zone,
      distanceKm: distance_km,
      locations: locations
    })
  end

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
