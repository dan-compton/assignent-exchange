#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import subprocess
import flask
from flask.ext.script import Manager, Shell, Server
from flask.ext.migrate import MigrateCommand

from assignexchg import create_app
from assignexchg.user.models import User
from assignexchg.settings import DevConfig, ProdConfig
from assignexchg.database import db

app = create_app(ProdConfig)

HERE = os.path.abspath(os.path.dirname(__file__))
TEST_PATH = os.path.join(HERE, 'tests')

manager = Manager(app)

def _make_context():
    """
    Return context dict for a shell session so you can access
    app, db, and the User model by default.
    """

    return {'app': app, 'db': db, 'User': User}

@manager.command
def test():
    """Run the tests."""
    import pytest
    exit_code = pytest.main([TEST_PATH, '--verbose'])
    return exit_code

manager.add_command('server', Server())
manager.add_command('shell', Shell(make_context=_make_context))
manager.add_command('db', MigrateCommand)

if __name__ == '__main__':
    manager.run()

