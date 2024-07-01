# frozen_string_literal: true

module ApplicationHelper
  def hijri_date(date)
    hijri = Hijri::Date.new(*date.split("-").map(&:to_i))
    I18n.l hijri, locale: :hijri
  end

  def random_bg
    photo_ids = [
      "1650201958331-be519823aa2d",
      "1646533958612-59391fe8886a",
      "1703352962250-90c3bfa18ac4",
      "1651241644596-424291a3e2d1",
      "1644769864218-65a79bfb3ce3",
      "1646533761041-73d924179744",
      "1650163410510-5739db5c02c3",
      "1651241529600-36e6f2e5b87a",
      "1597925147405-2d5b1122c79a",
      "1594834256843-156192c50d0e",
      "1612682039013-85659ee07116",
      "1590326697755-5367d2d82981",
      "1594431024890-6e72e6aee562",
      "1568036511357-aa06734214f1",
      "1636979563673-559071c4691b",
      "1519833326282-62de127da7d3",
      "1571702080583-f1e2746f3d0d",
      "1618671308741-24dedf9253a4",
      "1637828187371-b01ca79cb6cf",
      "1574310886178-20688c28aeb1",
      "1523372779641-eb51d4be268d",
      "1611094641909-f685b56acc8e"
    ].sample

    "https://images.unsplash.com/photo-#{photo_ids}"
  end
end
