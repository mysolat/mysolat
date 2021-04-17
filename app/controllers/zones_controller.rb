class ZonesController < ApplicationController
  def show
    @locations = Location.all
    @location =  @locations.find {|x| x['code'] == default_zone}
    zone = PrayerTime.daily(zone: default_zone)
    @prayer_time = zone['prayerTime']&.first.merge!({ bearing: zone['bearing'] })
    @prayer_time.merge!({ 'bearing' => zone['bearing'] })
  end

  private

  def default_zone
    params[:id] ||= cookies['zone']
    cookies['zone'] = params[:id].try(:upcase) || 'SGR01'
  end
end
