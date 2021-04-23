module PrayerTime
  require 'open-uri'
  JAKIM_BASE_URL = "https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat&period=:period&zone=:zone"

  def self.daily(zone: 'SGR01')
    Rails.cache.fetch("daily_#{zone}", expires_in: Time.current.end_of_day) do
      get_data('today', zone)
    end
  end

  def self.monthly(zone: 'SGR01')
    Rails.cache.fetch("monthly_#{zone}", expires_in: Time.current.end_of_month) do
      get_data('month', zone)
    end
  end

  private

  def self.get_data(period, zone)
    url = JAKIM_BASE_URL.gsub(':period', period).gsub(':zone', zone)
    response = URI.open(url, read_timeout: 2).read
    JSON.parse(response)
  end

end
