#!/usr/bin/env bash

wget http://packages.erlang-solutions.com/erlang-solutions_1.0_all.deb
sudo dpkg -i erlang-solutions_1.0_all.deb

sudo apt-get update
sudo apt-get -y install erlang git make supervisor python-pip

# Install HTTP server package for python backend
pip install httplib2

git clone -b origin-fix https://github.com/brainly/hive.git /home/vagrant/hive
cp /home/vagrant/hive-demo/hive-config/* /home/vagrant/hive/etc/
make -C /home/vagrant/hive
mkdir /var/log/hive

# Copy hive supervisor configuration
cp /vagrant/provision/hive.conf /etc/supervisor/conf.d/hive.conf

# Copy hive-demo backend supervisor configuration
cp /vagrant/provision/backend.conf /etc/supervisor/conf.d/backend.conf


# Restart supervisor to reload configuration
/etc/init.d/supervisor stop
/etc/init.d/supervisor start
