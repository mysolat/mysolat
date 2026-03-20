# frozen_string_literal: true

class Push::Subscription < ApplicationRecord
  self.table_name = "push_subscriptions"

  validates :endpoint, presence: true, uniqueness: true
  validates :p256dh_key, presence: true
  validates :auth_key, presence: true
  validates :zone, presence: true

  scope :for_zone, ->(zone) { where(zone: zone.to_s.upcase) }

  def notification(title:, body:, path:, badge: 0)
    WebPush::Notification.new(
      title: title,
      body: body,
      path: path,
      badge: badge,
      endpoint: endpoint,
      endpoint_ip: endpoint_ip,
      p256dh_key: p256dh_key,
      auth_key: auth_key
    )
  end

  def resolved_endpoint_ip
    return @resolved_endpoint_ip if defined?(@resolved_endpoint_ip)
    @resolved_endpoint_ip = SsrfProtection.resolve_public_ip(endpoint_uri&.host)
  end

  private

  def endpoint_uri
    @endpoint_uri ||= URI.parse(endpoint) if endpoint.present?
  rescue URI::InvalidURIError
    nil
  end

  def validate_endpoint_url
    if endpoint_uri.nil?
      errors.add(:endpoint, "is not a valid URL")
    elsif endpoint_uri.scheme != "https"
      errors.add(:endpoint, "must use HTTPS")
    elsif !permitted_endpoint_host?
      errors.add(:endpoint, "is not a permitted push service")
    elsif resolved_endpoint_ip.nil?
      errors.add(:endpoint, "resolves to a private or invalid IP address")
    end
  end

  def permitted_endpoint_host?
    host = endpoint_uri&.host&.downcase
    PERMITTED_ENDPOINT_HOSTS.any? { |permitted| host&.end_with?(permitted) }
  end
end
