# frozen_string_literal: true

class Push::SendPrayerNotificationJob < ApplicationJob
  queue_as :default

  def perform(zone:, prayer_label:, prayer_time:, location_name:, state:)
    subscriptions = Push::Subscription.for_zone(zone)
    return if subscriptions.none?

    payload = {
      title: "Waktu #{prayer_label}",
      body: "#{prayer_time} - #{location_name}, #{state}",
      path: "/zones/#{zone}",
      badge: 0
    }

    Rails.configuration.x.web_push_pool.queue(payload, subscriptions)
  end
end
