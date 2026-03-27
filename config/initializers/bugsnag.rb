Bugsnag.configure do |config|
  next if Rails.env.local?

  config.api_key = ENV["BUGSNAG_API_KEY"]
end
