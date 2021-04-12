# frozen_string_literal: true

class FeedbackDatatable < ApplicationDatatable
  def view_columns
    # Declare strings in this format: ModelName.column_name
    # or in aliased_join_table.column_name format
    @view_columns ||= {
      title: { source: 'Feedback.title', cond: :like },
      body: { source: 'Feedback.body', cond: :like },
      status: { source: 'Feedback.status', cond: :eq }
    }
  end

  def data
    records
  end

  def get_raw_records
    # insert query here
    if user
      user.feedbacks
    else
      Feedback
    end
  end
end
