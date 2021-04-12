class Api::LocationsController < ApiController
  def index
    render json: Location.list
  end
end
