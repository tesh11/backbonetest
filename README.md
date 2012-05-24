backbone.js with django-tastypie and django-rest-framework
==========================================================

Just a simple prototype to learn backbone.js and try out django-tastypie and django-rest-framework.

backbone.js - [http://documentcloud.github.com/backbone/#](http://documentcloud.github.com/backbone/#)
django-tastypie - [http://tastypieapi.org/](http://tastypieapi.org/)
django-rest-framework - [http://django-rest-framework.org/](http://django-rest-framework.org/)

Setup
-----
1. Set up a [Virtualenv](http://pypi.python.org/pypi/virtualenv)

        $ virtualenv venv --distribute

2. Install the required packages

        $ pip install -r requirements.txt

    **NOTE**: Mac OS X users may need to install [libevent](http://libevent.org/) in order to install the gevent library.
    That library is only required if you will be running gunicorn. You can install it from a port, build it locally or
    remove that line from requirements.txt if you won't be using gunicorn

3. Create a DB and username (PostgreSQL) for the project

4. Create a new file called `local_settings.py` in the same directory as `settings.py`. Copy the database block
from `settings.py` into `local_settings.py` and replace the DB information with your own.

        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql_psycopg2', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
                'NAME': 'backbonetest',                      # Or path to database file if using sqlite3.
                'USER': 'backbonetest',                      # Not used with sqlite3.
                'PASSWORD': 'backbonetest',                  # Not used with sqlite3.
                'HOST': '127.0.0.1',                      # Set to empty string for localhost. Not used with sqlite3.
                'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
            }
        }

5. Add the following 2 lines to `local_settings.py` to use local storage for static files rather than S3 storage

        STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
        STATIC_URL = '/static/'

6. Create the DB tables

        $ python manage.py syncdb

7. Populate some test data

        $ python manage.py loaddata cities_states

8. Run the app

        $ python manage.py runserver