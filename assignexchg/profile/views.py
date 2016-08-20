# -*- coding: utf-8 -*-
from flask import (Blueprint, render_template, request, url_for, redirect)
from flask.ext.login import login_required, current_user
import datetime as dt

from assignexchg.user.models import User
from assignexchg.assignment.models import Assignment
from assignexchg.subject.models import Subject

from assignexchg.database import db


blueprint = Blueprint("profile", __name__, url_prefix='/profiles',
                        static_folder="../static")

@blueprint.route("/")
@login_required
def display():
    """

    """
    if current_user.account_type == "tutor":
        return render_template("private/tutor-profile.html")

    # Someone Else
    else:
        return render_template("public/home.html")
