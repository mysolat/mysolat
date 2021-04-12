# frozen_string_literal: true

class JakimResource < ApplicationResource
  base_url 'https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat'
  get :daily, '&period=today&zone=:zone', defaults: { zone: 'SGR01' }
  get :monthly, '&period=month&zone=:zone', defaults: { zone: 'SGR01' }
end
