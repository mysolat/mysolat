class Api::PrayerTimesController < ApiController

  def daily
    zone =  params[:zone] || 'SGR01'
    data = Rails.cache.fetch("daily_#{zone}", expires_in: Time.current.end_of_day) do
      JakimResource.daily(zone: zone).as_json
    end
    render json: data.merge({ serverTime: Time.current })
  end

  def monthly
    zone =  params[:zone] || 'SGR01'
    data = Rails.cache.fetch("monthly_#{zone}", expires_in: Time.current.end_of_month) do
      JakimResource.monthly(zone: zone).as_json
    end
    render json: data.merge({ serverTime: Time.current })
  end
end
