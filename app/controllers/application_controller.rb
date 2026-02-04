# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  # allow_browser versions: :modern
  #
  self.responder = ApplicationResponder

  respond_to :html

  before_action :set_current_location

  private

  def set_current_location
    zone = cookies["zone"] || "SGR01"
    @location ||= Location.zone(zone)
  end
end
