# frozen_string_literal: true

class ZonesController < ApplicationController
  def show
    @locations = Location.all
    @location = Location.zone(default_zone)
    @zone = default_zone
    # Prayer times are now loaded client-side from IndexedDB
    # No need to call PrayerTime.monthly here
  end

  def monthly
    @locations = Location.all
    @location = Location.zone(default_zone)
    @zone = default_zone

    # Parse month and year from params, default to current
    @year = (params[:year] || Date.current.year).to_i
    @month = (params[:month] || Date.current.month).to_i

    # Ensure valid month range
    @month = @month.clamp(1, 12)

    @current_date = Date.new(@year, @month, 1)

    # Calculate prev/next month dates
    @prev_date = @current_date.prev_month
    @next_date = @current_date.next_month

    # Prayer times are now loaded client-side from IndexedDB
  end

  private

  def default_zone
    params[:id] ||= cookies["zone"]
    cookies["zone"] = params[:id].try(:upcase) || "SGR01"
  end
end
