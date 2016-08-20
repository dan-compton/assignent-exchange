#!/bin/sh
rm -rf migrations dev.db
python manage.py db init
python manage.py db upgrade
python manage.py db revision --autogenerate
python manage.py db upgrade
