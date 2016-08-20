# -*- coding: utf-8 -*-
import datetime as dt

from flask import current_app as app
from flask import (Blueprint, render_template, request, url_for, redirect, flash)
from flask.ext.login import login_required, current_user

from assignexchg.security.auth import admin_required
from assignexchg.user.models import User, Profile, ExchangeAccount, Friend
from assignexchg.assignment.models import Assignment
from assignexchg.subject.models import Subject
from assignexchg.messaging.models import Message
from assignexchg.database import db

import sys, os, random
from datetime import datetime
from loremipsum import get_sentences


from keen.client import KeenClient

client = KeenClient(
    project_id="55d57caad2eaaa680084e4f1",

write_key="",

read_key="",
    master_key=""
)


blueprint = Blueprint("init", __name__, url_prefix='/init',                       static_folder="../static")

from sqlalchemy.orm import class_mapper

def serialize(model):
    """Transforms a model into a dictionary which can be dumped to JSON."""
    columns = [c.key for c in class_mapper(model.__class__).columns]

    x = dict((c, str(getattr(model, c))) for c in columns)
    x["keen"] = {"timestamp":str(model.created)}
    return x



@blueprint.route("/")
def init_superusers():
    '''
        Initializes a superuser account if there are none
    '''
    admins = [a for a in User.query.filter_by(account_type='admin')]
    students = [a for a in User.query.filter_by(account_type='student')]
    tutors = [a for a in User.query.filter_by(account_type='tutor')]
    subjects = [a for a in Subject.query.all()]

    profile_images = ["http://www.topplers.org/assets/default_profile_picture-5fe08249cdd9f0f379cf5852453e5ff5.png", "http://www.sessionlogs.com/media/icons/defaultIcon.png", "https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2015-05-12/4867744143_622f9ce6dba270ac9da5_72.jpg"]

    initialized = ""

    INIT_TUTORS = False
    INIT_STUDENTS = False
    INIT_MESSAGES = False


    if len(admins) == 0:
        admins = (User(username="admin", email="", password=app.config['ADMIN_PASSWORD'], active=True, account_type="admin"),)
        for user in admins:
            profile = Profile()
            exchangeaccount = ExchangeAccount(user_id=user.id, paypal_account=user.email, minutes=random.randint(0,250))
            user.exchange_account = exchangeaccount
            user.profile = profile
            user.confirmed = True
            db.session.add(user)
            db.session.commit()
        initialized += str([i.username for i in admins])

    if len(tutors) == 0 and INIT_TUTORS:
        tutors = [User(username="test_tutor" + str(i+1), email="test_tutor" + str(i+1) + "@assignmentexchange.com", password="test_tutor", active=True, account_type="tutor") for i in range(0,10)]

        for user in tutors:
            profile = Profile()
            exchangeaccount = ExchangeAccount(user_id=user.id, paypal_account=user.email, minutes=random.randint(0,250))
            user.exchange_account = exchangeaccount
            user.profile = profile
            user.confirmed = True

            for i in range(0,8):
                user.friends.append(Friend(user_id=tutors[i].id, username=tutors[i].username))

            db.session.add(user)
            db.session.commit()

            print user.account_type + " " + user.username
        initialized += str([i.username for i in tutors])


    if len(students) == 0 and INIT_STUDENTS:
        students = [User(username=("test_student" + str(i+1)), email = ("test_student" + str(i+1) + "@assignmentexchange.com"), password = ("test_student" + str(i+1)), account_type="student", minutes=60) for i in range(0,10)]
        for user in students:
            profile = Profile()
            exchangeaccount = ExchangeAccount(user_id=user.id, paypal_account=user.email, minutes=random.randint(0,250))
            user.exchange_account = exchangeaccount
            user.profile = profile

            db.session.add(user)
            db.session.commit()
            print user.account_type + " " + user.username

        initialized += str([i.username for i in students])

    if len(subjects) == 0:
        lines = ['Random', 'Java', 'Python','R','C','C++', 'PHP', 'C# .NET', 'VB .NET', 'F#', 'Clojure', 'Common Lisp', 'Smalltalk', 'x86 ASM', 'ARM ASM', 'x86-64 ASM','Ada', 'Fortran', 'JQuery', 'Javascript', 'HTML/CSS', 'Objective C', 'Android', 'bash', 'Go', 'Scala', 'Smalltalk', 'NetLogo']

        #TODO There's a weird issue with unicode that I'm unfamiliar with
        # need to create default subjects
        if False:
            with open(os.path.join(app.config['APP_STATIC'], './data/subjects.txt')) as f:
                lines = f.readlines()
            lines = [i.strip() for i in lines]

        #add subjects
        subjects = [Subject(subject_title, "The " + subject_title + " Programming Language.") for subject_title in lines]
        for subject in subjects:
            db.session.add(subject)
            db.session.commit()

        initialized += str(lines)

    if INIT_MESSAGES:
        # Create Messages
        admins = [a for a in User.query.filter_by(account_type='admin')]
        students = [a for a in User.query.filter_by(account_type='student')]
        tutors = [a for a in User.query.filter_by(account_type='tutor')]
        subjects = [a for a in Subject.query.all()]
        messages = [a for a in Message.query.all()]

        # random message
        for i in range(0,100):
            user = random.choice(tutors)
            room = random.choice(subjects)
            room_id = room.id
            body = get_sentences(random.randint(1,5))
            body_text = ""
            for sentence in body:
                body_text+=sentence+ " "

            year = random.randint(2014, 2015)
            month = random.randint(1, 6)
            day = random.randint(1, 28)
            hour = random.randint(1, 12)
            minute = random.randint(1,59)
            second = random.randint(1,59)

            message = Message(room_id, body_text, datetime(year,month,day,hour,minute,second))

            # Send events to Keen.io
            m = {'room_id':room_id, 'room_name':room.title, 'body':body_text, 'created':str(message.created), 'user_name':user.username, 'user_id':user.id, 'keen':{'timestamp':str(message.created)}}
            client.add_event("messages", m)

            user.messages.append(message)
            db.session.add(user)
            db.session.add(message)
            db.session.commit()


    flash(initialized, "success")
    return redirect(url_for('public.home'))

