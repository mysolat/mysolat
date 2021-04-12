Flexirest::Base.faraday_config do |faraday|
  faraday.adapter(:net_http)
  faraday.ssl.verify = false
  faraday.options.timeout = 5
  faraday.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36'
end
