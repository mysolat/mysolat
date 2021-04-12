# frozen_string_literal: true

class ApplicationResource < Flexirest::Base
  request_body_type :json
  base_url 'https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat'

  def assign_attributes(new_attributes)
    unless new_attributes.respond_to?(:stringify_keys)
      raise ArgumentError, "When assigning attributes,
                              you must pass a hash as an argument,
                              #{new_attributes.class} passed."
    end
    return if new_attributes.empty?

    attributes = new_attributes.stringify_keys
    _assign_attributes(attributes)
  end

  private

  def _assign_attributes(attributes)
    attributes.each do |k, v|
      _assign_attribute(k, v)
    end
  end

  def _assign_attribute(key, value)
    setter = :"#{key}="
    public_send(setter, value)
  end
end
