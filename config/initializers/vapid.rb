Rails.application.configure do
  config.x.vapid.private_key = Rails.application.credentials.dig(:vapid, :private_key)
  config.x.vapid.public_key = Rails.application.credentials.dig(:vapid, :public_key)
end
