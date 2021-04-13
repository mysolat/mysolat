class Api::LocationsController < ApiController
  def index
    render json: Location.all
  end
end
