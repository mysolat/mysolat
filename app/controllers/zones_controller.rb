class ZonesController < ApplicationController
  def show
    @locations = Location.all
    @location =  @locations.find { |x| x['code'] == default_zone }
    prayer_times = PrayerTime.monthly(zone: default_zone)
    @monthly = prayer_times.fetch('prayerTime')
    today = Date.today.strftime '%d-%b-%Y'
    @today = @monthly.select { |p| p['date'] == today }.first
    @today.merge!({ 'bearing' => prayer_times['bearing'] })
  end

  private

  def default_zone
    params[:id] ||= cookies['zone']
    cookies['zone'] = params[:id].try(:upcase) || 'SGR01'
  end
end
