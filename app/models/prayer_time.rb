module PrayerTime
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
    response = Net::HTTP.get_response URI.parse(url)
    JSON.parse(response.body)
  end

end
