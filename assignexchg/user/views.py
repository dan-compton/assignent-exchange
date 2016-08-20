# -*- coding: utf-8 -*-
import datetime as dt

from flask import current_app as app
from flask import (Blueprint, render_template, request, url_for, redirect, flash)
from flask.ext.login import login_required, current_user

from assignexchg.security.auth import admin_required
from assignexchg.user.models import User, Profile, ExchangeAccount
from assignexchg.assignment.models import Assignment
from assignexchg.subject.models import Subject
from assignexchg.messaging.models import Message
from assignexchg.database import db
from assignexchg.decorators import check_confirmed
import sys, os, random
from datetime import datetime
from loremipsum import get_sentences
from flask.ext.mail import Message
from assignexchg.extensions import mail


blueprint = Blueprint("user", __name__, url_prefix='/users',
        static_folder="../static")

@login_required
@blueprint.route("/send_confirmation", methods=['GET', 'PUT'])
def send_email_confirmation():
    print 'sending email'
    to = current_user.email
    subject = "AssignmentExchange Email Confirmation"
    theurl = os.getenv('APP_URL') + 'confirm/' + str(current_user.confirm_code)

    thehtml = "Please visit the following link: " + theurl

    msg = Message("Please Confirm Your AssignmentExchange Account", recipients=[current_user.email], html=thehtml)
    mail.send(msg)

    flash("Email sent", "success")
    return redirect('/logout/')
@blueprint.route("/unconfirmed")
def unconfirmed():
    return render_template("private/unconfirmed.html")

@blueprint.route("/")
@login_required
def members():
    # email account confirmed?
    if current_user.confirmed == False:
        return render_template("private/unconfirmed.html")

    # Student
    if current_user.account_type == "student":
        return render_template("private/dashboards/student-dashboard.html")

    # Tutor
    elif current_user.account_type == "tutor":
        return render_template("private/dashboards/tutor-dashboard.html")

    elif current_user.account_type == "admin":
        return redirect("/admin/")

    else:
        return redirect(url_for('public.home'))


