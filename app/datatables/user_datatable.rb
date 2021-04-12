class UserDatatable < ApplicationDatatable
  def view_columns
    @view_columns ||= {
      fullname: { source: 'User.username', cond: :like },
      email: { source: 'User.email', cond: :like }
    }
  end

  def data
    records
  end

  def get_raw_records
    users = User.select(:id,
                        :username,
                        :email,
                        :role,
                        :last_sign_in_at,
                        :created_at,
                        :updated_at,
                        :status)
                .order(created_at: :desc)
    params[:status] ? users.public_send(params[:status]) : users
  end
end
