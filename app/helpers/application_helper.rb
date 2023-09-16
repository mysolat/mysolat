# frozen_string_literal: true

module ApplicationHelper
  def hijri_date(date)
    hijri = Hijri::Date.new *date.split("-").map(&:to_i)
    I18n.l hijri, locale: :hijri
  end
end
