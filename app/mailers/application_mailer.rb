class ApplicationMailer < ActionMailer::Base
  layout 'mailer'

  before_action :set_default_url_options
  after_action  :set_delivery_from
  after_action  :set_delivery_options
  after_action  :set_bcc_to

  def self.inherited(subclass)
    subclass.default template_path: "mailers/#{subclass.name.gsub('Mailer', '').underscore.pluralize}"
  end

  private

  def set_delivery_from
    message.from = 'no-reply@teknolabs.my'
  end

  def set_delivery_to
    message.to = 'khairi@labs.my'
  end

  def set_bcc_to
    message.bcc = ['khairi@labs.my']
  end

  def sending_failed
    mail(to: 'khairi@labs.my', subject: '(error) Something went wrong')
  end
end
