# frozen_string_literal: true

class Mosque < ApplicationRecord
  validates :name, presence: true

  STATES = {
    "01" => "Johor",
    "02" => "Kedah",
    "03" => "Kelantan",
    "04" => "Melaka",
    "05" => "Negeri Sembilan",
    "06" => "Pahang",
    "07" => "Pulau Pinang",
    "08" => "Perak",
    "09" => "Perlis",
    "10" => "Selangor",
    "11" => "Terengganu",
    "12" => "Sabah",
    "13" => "Sarawak",
    "14" => "W.P. Kuala Lumpur",
    "15" => "W.P. Labuan",
    "16" => "W.P. Putrajaya"
  }.freeze

  def state_name
    STATES[state_id]
  end

  CATEGORIES = {
    "01" => "MASJID UTAMA",
    "02" => "MASJID NEGERI",
    "03" => "MASJID BANDAR",
    "04" => "MASJID DAERAH / JAJAHAN",
    "05" => "MASJID MUKIM / KARIAH",
    "06" => "MASJID INSTITUSI"
  }.freeze

  def category_name
    CATEGORIES[type_id]
  end
end
