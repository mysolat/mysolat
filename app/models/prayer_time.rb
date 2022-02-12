module PrayerTime
  require 'open-uri'
  JAKIM_BASE_URL = "https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat&period=:period&zone=:zone"

  def self.daily(zone: 'SGR01')
    Rails.cache.fetch("daily_#{Date.today}_#{zone}") do
      get_data('today', zone)
    end
  end

  def self.monthly(zone: 'SGR01')
    Rails.cache.fetch("monthly_#{Date.today.month}_#{zone}") do
      get_data('month', zone)
    end
  end

  private

  def self.get_data(period, zone)
    url = JAKIM_BASE_URL.gsub(':period', period).gsub(':zone', zone)
    puts url
    response = URI.open(url, read_timeout: 10).read
    JSON.parse(response)
  end

end
