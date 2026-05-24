#!/bin/sh

set -e

if [ "$DATABASE" = "postgres" ]; then
    echo "Waiting for PostgreSQL at $SQL_HOST:$SQL_PORT..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 1
    done

    echo "PostgreSQL started"
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting server..."
exec "$@"
