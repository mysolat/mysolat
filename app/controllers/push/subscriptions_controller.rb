# frozen_string_literal: true

class Push::SubscriptionsController < ApplicationController
  def create
    zone = (cookies["zone"] || "WLY01").upcase

    @subscription = Push::Subscription.find_or_initialize_by(
      endpoint: subscription_params[:endpoint]
    )
    @subscription.assign_attributes(
      p256dh_key: subscription_params[:p256dh_key],
      auth_key: subscription_params[:auth_key],
      zone: zone
    )

    if @subscription.save
      head :created
    else
      head :unprocessable_entity
    end
  end

  def destroy
    @subscription = Push::Subscription.find_by(
      endpoint: subscription_params[:endpoint]
    )
    @subscription&.destroy
    head :ok
  end

  private

  def subscription_params
    params.require(:push_subscription).permit(:endpoint, :p256dh_key, :auth_key)
  end
end
