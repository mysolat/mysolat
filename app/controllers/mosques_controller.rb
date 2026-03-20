# frozen_string_literal: true

class MosquesController < ApplicationController
  def index
    mosques = Mosque.order(:name)
    mosques = mosques.where("name LIKE ?", "%#{Mosque.sanitize_sql_like(params[:search])}%") if params[:search].present?
    mosques = mosques.where(state_id: params[:state]) if params[:state].present?
    mosques = mosques.where(type_id: params[:type]) if params[:type].present?

    @pagy, @mosques = pagy(mosques, limit: 20)
  end

  def show
    @mosque = Mosque.find(params[:id])
  end
end
