# frozen_string_literal: true

module PrayerTime
  require "open-uri"
  JAKIM_BASE_URL = "https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat&period=:period&zone=:zone"

  def self.daily(zone: "SGR01")
    Rails.cache.fetch("daily_#{Time.zone.today}_#{zone}") do
      get_data("today", zone)
    end
  end

  def self.monthly(zone: "SGR01")
    Rails.cache.fetch("monthly_#{Time.zone.today.month}_#{zone}") do
      get_data("month", zone)
    end
  end

  def self.get_data(period, zone)
    url = JAKIM_BASE_URL.gsub(":period", period).gsub(":zone", zone)
    response = URI.open(url, read_timeout: 10, ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE).read
    JSON.parse(response)
  end
end
