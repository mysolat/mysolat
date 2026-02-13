# frozen_string_literal: true

module PrayerTime
  class InvalidZoneError < StandardError; end

  VALID_ZONES = Location.data.pluck(:code).uniq.freeze

  def self.valid_zone?(code)
    VALID_ZONES.include?(code.to_s.upcase)
  end

  def self.daily(zone: "SGR01")
    validate_zone!(zone)
    Jakim::ApiResource.daily(zone: zone).as_json
  end

  def self.monthly(zone: "SGR01", year: Time.zone.today.year, month: Time.zone.today.month)
    validate_zone!(zone)
    Jakim::ApiResource.monthly(zone: zone, year: year, month: month).as_json
  end

  def self.yearly(zone: "SGR01", year: Time.zone.today.year)
    validate_zone!(zone)
    Jakim::ApiResource.yearly(zone: zone, year: year).as_json
  end

  def self.islamic_events
    Jakim::ApiResource.islamic_events.as_json
  end

  def self.validate_zone!(zone)
    raise InvalidZoneError, "Zon '#{zone}' tidak sah" unless valid_zone?(zone)
  end
  private_class_method :validate_zone!
end
