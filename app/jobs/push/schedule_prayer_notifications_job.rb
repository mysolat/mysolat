# frozen_string_literal: true

class Push::SchedulePrayerNotificationsJob < ApplicationJob
  queue_as :default

  NOTIFIABLE_PRAYERS = {
    "fajr"    => "Subuh",
    "dhuhr"   => "Zohor",
    "asr"     => "Asar",
    "maghrib" => "Maghrib",
    "isha"    => "Isyak"
  }.freeze

  def perform
    active_zones = Push::Subscription.distinct.pluck(:zone)

    active_zones.each do |zone|
      schedule_for_zone(zone)
    rescue => e
      Rails.logger.error "Failed to schedule notifications for zone #{zone}: #{e.message}"
    end
  end

  private

  def schedule_for_zone(zone)
    data = PrayerTime.yearly(zone: zone)
    today = Date.current.strftime("%d-%b-%Y")
    today_prayer = data["prayerTime"]&.find { |p| p["date"] == today }
    return unless today_prayer

    location = Location.zone(zone)

    NOTIFIABLE_PRAYERS.each do |key, label|
      time_string = today_prayer[key]
      next unless time_string

      prayer_time = Time.zone.parse("#{Date.current} #{time_string}")
      next if prayer_time <= Time.current

      display_time = prayer_time.strftime("%-I:%M %p")

      Push::SendPrayerNotificationJob
        .set(wait_until: prayer_time)
        .perform_later(
          zone: zone,
          prayer_label: label,
          prayer_time: display_time,
          location_name: location["location"],
          state: location["state"]
        )
    end
  end
end
