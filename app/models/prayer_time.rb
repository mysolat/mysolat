# frozen_string_literal: true

module PrayerTime
  require "open-uri"
  JAKIM_BASE_URL = "https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat&period=:period&zone=:zone"

  def self.daily(zone: "SGR01")
    Rails.cache.fetch("daily_#{Time.zone.today}_#{zone}") do
      get_data("today", zone)
    end
  end

  def self.monthly(zone: "SGR01", year: Time.zone.today.year, month: Time.zone.today.month)
    Rails.cache.fetch("monthly_#{year}_#{month}_#{zone}") do
      get_data("month", zone, "&month=#{month}")
    end
  end

  def self.yearly(zone: "SGR01", year: Time.zone.today.year)
    Rails.cache.fetch("yearly#{year}_#{zone}") do
      get_data("year", zone, "&year=#{year}")
    end
  end

  def self.get_data(period, zone, params = "")
    url = JAKIM_BASE_URL.gsub(":period", period).gsub(":zone", zone) + params
    response = URI.open(url, read_timeout: 10, ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE).read
    JSON.parse(response)
  end
end
