# frozen_string_literal: true

class Push::TestNotificationsController < ApplicationController
  def create
    zone = (cookies["zone"] || "WLY01").upcase
    subscriptions = Push::Subscription.for_zone(zone)

    if subscriptions.none?
      render json: { error: "No subscriptions found for zone #{zone}" }, status: :not_found
      return
    end

    location = Location.zone(zone)
    now = Time.current.strftime("%-I:%M %p")

    payload = {
      title: "Test Notifikasi",
      body: "#{now} - #{location["location"]}, #{location["state"]}",
      path: "/zones/#{zone}",
      badge: 0
    }

    Rails.configuration.x.web_push_pool.queue(payload, subscriptions)

    render json: { ok: true, zone: zone, count: subscriptions.count }
  end
end
