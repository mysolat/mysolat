# frozen_string_literal: true

class PagesController < ApplicationController
  def index
  end

  def show
    send("setup_#{params[:id]}") if respond_to?("setup_#{params[:id]}", true)
    render available_page(params[:id])
  end

  private

  def available_page(page)
    %w[api qibla maps calendar about].include?(page) ? page : raise(ActionController::RoutingError, 'Not Found')
  end

  def setup_calendar
    data = PrayerTime.islamic_events
    all_events = (data["event"] || []).sort_by { |e| e["tarikh_miladi"] }

    # Show 1 year back and 1 year ahead, filterable by year
    range_events = all_events.select { |e|
      date = Date.parse(e["tarikh_miladi"])
      date >= 1.year.ago.to_date && date <= 1.year.from_now.to_date
    }

    @years = range_events.map { |e| Date.parse(e["tarikh_miladi"]).year }.uniq.sort
    @selected_year = params[:year] ? params[:year].to_i : Date.current.year
    @events = range_events.select { |e| Date.parse(e["tarikh_miladi"]).year == @selected_year }
  end

end
