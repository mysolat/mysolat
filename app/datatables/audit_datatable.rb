# frozen_string_literal: true

class AuditDatatable < ApplicationDatatable
  def view_columns
    @view_columns ||= {
      created_at: { source: 'Audit.created_at' },
      action: { source: 'Audit.action', cond: :like },
      audited_changes: { source: 'Audit.audited_changes', cond: :eq },
      auditable_type: { source: 'Audit.auditable_type', cond: :eq }
    }
  end

  def data
    records
  end

  def get_raw_records
    audits = Audit.all.order(created_at: :desc)
    return audits unless options[:user]

    audits.where(user_id: options[:user])
  end
end
