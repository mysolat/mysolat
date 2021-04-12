# frozen_string_literal: true

class LoginDatatable < ApplicationDatatable
  def view_columns
    # Declare strings in this format: ModelName.column_name
    # or in aliased_join_table.column_name format
    @view_columns ||= {
      last_seen_ip: { source: 'Login.last_seen_ip', cond: :like },
      user_agent: { source: 'Login.user_agent', cond: :like },
      email: { source: 'User.email', cond: :like }
    }
  end

  def data
    records
  end

  def get_raw_records
    # insert query here
    user.logins.joins(:user)
        .select(:id, :user_id, :last_seen_ip, :user_agent, :signed_in_at, :signed_out_at, :last_seen_at, :device_id)
        .select('users.email')
        .order(last_seen_at: :desc)
  end
  end
