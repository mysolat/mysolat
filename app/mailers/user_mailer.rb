class UserMailer < ApplicationMailer
  helper :application

  def test
    mail(to: 'khairi@labs.my', subject: 'Welcome to quickstart')
  end

  def welcome(user: nil)
    @user = user
    @url  = 'http://teknolabs.my'
    mail(to: @user.email, subject: 'Welcome to quickstart')
  end
end
