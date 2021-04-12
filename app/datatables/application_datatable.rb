# frozen_string_literal: true

class ApplicationDatatable < AjaxDatatablesRails::ActiveRecord

  def total_count
    records_total_count
  end

  def filtered_count
    records_filtered_count
  end

  def account
    @account ||= options[:account]
  end

  def user
    @user ||= options[:user]
  end
end
