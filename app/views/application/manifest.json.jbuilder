# frozen_string_literal: true

json.set! :short_name, "MySolat"
json.set! :name, "MySolat"
json.set! :theme_color, "#42a5f5"
json.set! :background_color, "#42a5f5"
json.set! :start_url, "/"
json.set! :display, "standalone"
json.set! :scope, "/"
json.set! :description, "Waktu solat di malaysia"

icons = [16, 20, 29, 32, 40, 48, 50, 57, 58, 60, 64, 72, 76, 80, 87, 96, 100, 114, 120, 128, 144, 152, 167, 180, 192, 256, 512, 1024]

json.set! :icons do
  json.array!(icons) do |size|
    json.set! :src, "icons/#{size}.png"
    json.set! :sizes, "#{size}x#{size}"
    json.set! :type, "image/png"
    json.set! :density, 1
  end
end
