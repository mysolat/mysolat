class ApplicationResponder < ActionController::Responder
  include Responders::FlashResponder
  include Responders::HttpCacheResponder

  # Redirects resources to the collection path (index action) instead
  # of the resource path (show action) for POST/PUT/DELETE requests.
  include Responders::CollectionResponder

  # def to_turbo_stream
  #   if options[:turbo].present? && options[:turbo].to_sym == :html
  #     turbo_stream_to_html
  #   else
  #     to_format
  #   end
  # end

  # def turbo_stream_to_html
  #   controller.render(options.merge(formats: :html))
  # rescue ActionView::MissingTemplate => e
  #   raise e if get?

  #   if has_errors? && default_action
  #     render rendering_options.merge(status: :unprocessable_entity)
  #   else
  #     redirect_to navigation_location
  #   end
  # end

  def navigation_behavior(error)
    raise error if get?

    if has_errors? && default_action
      render rendering_options.merge(status: :unprocessable_entity)
    else
      redirect_to navigation_location
    end
  end
end
