# frozen_string_literal: true

class ZonesController < ApplicationController
  def show
    @locations = Location.all
    @location = Location.zone(default_zone)
    prayer_times = PrayerTime.monthly(zone: default_zone)
    @monthly = prayer_times.fetch("prayerTime")
    today = Date.current.strftime "%d-%b-%Y"
    @today = @monthly.find { |p| p["date"] == today }
    @today.merge!({ "bearing" => prayer_times["bearing"] })
  end

  def monthly
    @locations = Location.all
    @location = Location.zone(default_zone)
    prayer_times = PrayerTime.monthly(zone: default_zone)
    @monthly = prayer_times.fetch("prayerTime")
  end

  private

  def default_zone
    params[:id] ||= cookies["zone"]
    cookies["zone"] = params[:id].try(:upcase) || "SGR01"
  end
end
