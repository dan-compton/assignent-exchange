# -*- coding: utf-8 -*-
'''Public section, including homepage and signup.'''
from flask import (Blueprint, request, render_template, flash, url_for,
                    redirect, session, jsonify, send_from_directory)
from flask import current_app as app
from flask.ext.login import login_user, login_required, logout_user, current_user

from assignexchg.extensions import login_manager
from assignexchg.user.models import User, Profile, ExchangeAccount
from assignexchg.assignment.models import Assignment
from assignexchg.public.forms import LoginForm, StudentRegistrationForm, TutorRegistrationForm
from assignexchg.landing.forms import LaunchNotificationForm
from assignexchg.landing.models import LaunchNotification

from assignexchg.utils import flash_errors, s3_upload
from assignexchg.database import db
from flask.ext.mail import Message
from assignexchg.extensions import mail
import os

blueprint = Blueprint('public', __name__, static_folder="../static")

@login_manager.user_loader
def load_user(id):
    return User.get_by_id(int(id))

@blueprint.route('/libs/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.path.join(app.config['APP_STATIC'], 'libs'), filename)

@blueprint.route("/", methods=["GET", "POST"])
def home():
    form = LoginForm(request.form)
    notify = LaunchNotificationForm(request.form)

    if current_user and current_user.is_authenticated():
        redirect_url = request.args.get("next") or url_for("user.members")
        return redirect(redirect_url)

    # Handle logging in
    if request.method == 'POST':
        if form.validate_on_submit():
            login_user(form.user)
            redirect_url = request.args.get("next") or url_for("user.members")
            return redirect(redirect_url)
        else:
            flash("incorrect username/password")
    return render_template("public/home.html", form=form, notify=notify)



@blueprint.route("/confirm/<_confirm_code>", methods=['GET', 'PUT'])
def confirm_email(_confirm_code):
    '''
        Confirm an email account using a confirm code.
    '''

    user = User.query.filter_by(confirm_code = _confirm_code).first()

    print str(user.id) + str(user.username)

    if user is not None:
        user.confirmed = True
        db.session.add(user)
        db.session.commit()

        flash("Email Confirmed", "success")
    else:
        flash("Incorrect Confirmation Code, Please Resend", "error")

    return redirect(url_for('public.home'))

@blueprint.route("/send_confirmation", methods=['GET', 'PUT'])
def send_confirmation_email_confirmation():
    print 'sending email'
    flash("Email sent", "success")
    return redirect('/logout/')


@blueprint.route('/logout/')
@login_required
def logout():
    logout_user()
    #flash('You are logged out.', 'info')
    return redirect(url_for('public.home'))



@blueprint.route("/student-signup/", methods=['GET', 'POST'])
def register():
    form = StudentRegistrationForm(request.form, csrf_enabled=False)

    if form.validate_on_submit():
        new_student = User(username=form.username.data,
                        email=form.email.data,
                        password=form.password.data,
                        active=True, account_type="student")

        profile = Profile()
        exchangeaccount = ExchangeAccount(user_id=new_tutor.id, paypal_account=new_student.email, minutes=0)
        new_student.exchange_account = exchangeaccount
        new_student.profile=profile

        db.session.add(new_student)
        db.session.commit()

        #send_confirmation_email(new_student.email, user)

        flash("Thank you for registering. Login Now.", 'success')
        return redirect(url_for('public.home'))

    else:
        flash_errors(form)

    return render_template('public/student-signup-new.html', form=form)


def send_confirmation_email(email_address, user):
    '''
        #TODO Use amazon SES
    '''
    # Send tutor an email
    to = email_address
    subject = "AssignmentExchange Email Confirmation"
    theurl = os.environ.get('APP_URL') + 'confirm/' + str(user.confirm_code)

    thehtml = "Please visit the following link: " + theurl

    msg = Message("Please Confirm Your AssignmentExchange Account", recipients=[email_address], html=thehtml)
    mail.send(msg)


@blueprint.route("/tutor-signup/", methods=['GET', 'POST'])
def register_tutor():
    form = TutorRegistrationForm(request.form, csrf_enabled=False)

    if form.validate_on_submit():
        s3_filename = s3_upload(request.files['resume'], '/tutor/')
        new_tutor = User(username=form.username.data,
                        email=form.email.data,
                        password=form.password.data,
                        active=True, account_type="tutor")

        profile = Profile(user_id=new_tutor.id, resume=s3_filename, description="none provided",)
        exchangeaccount = ExchangeAccount(user_id=new_tutor.id, paypal_account=new_tutor.email, minutes=0)
        new_tutor.exchange_account = exchangeaccount
        new_tutor.profile=profile

        db.session.add(new_tutor)
        db.session.commit()

        # added a new user (send confirmation email)
        #send_confirmation_email(new_tutor.email, new_tutor)

        flash("Thanks for registering.  Login if you dare....", 'success')
        return redirect(url_for('public.home'))
    else:
        flash_errors(form)
    return render_template('public/tutor-signup-new.html', form=form)
