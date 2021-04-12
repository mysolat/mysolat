class PagesController < ApplicationController
  include HighVoltage::StaticPage


  def show
    case params[:id]
    when "api"
    end
    super
  end

end
