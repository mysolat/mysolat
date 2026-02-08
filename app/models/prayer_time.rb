# frozen_string_literal: true

module PrayerTime
  def self.daily(zone: "SGR01")
    Jakim::ApiResource.daily(zone: zone).as_json
  end

  def self.monthly(zone: "SGR01", year: Time.zone.today.year, month: Time.zone.today.month)
    Jakim::ApiResource.monthly(zone: zone, year: year, month: month).as_json
  end

  def self.yearly(zone: "SGR01", year: Time.zone.today.year)
    Jakim::ApiResource.yearly(zone: zone, year: year).as_json
  end

  def self.islamic_events
    Jakim::ApiResource.islamic_events.as_json
  end
end
