# frozen_string_literal: true

class ApiResponder < ActionController::Responder
  def initialize(*)
    super
    @options[:location] = nil
  end

  # show action is not always present
  # def resource_location
  #   nil
  # end
  # alias :navigation_location :resource_location
  # alias :api_location :resource_location
end
