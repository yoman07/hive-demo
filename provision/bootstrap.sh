#!/usr/bin/env bash

wget http://packages.erlang-solutions.com/erlang-solutions_1.0_all.deb
sudo dpkg -i erlang-solutions_1.0_all.deb

sudo apt-get update
sudo apt-get -y install erlang
sudo apt-get -y install git

git clone https://github.com/brainly/hive.git /home/vagrant/hive
sudo apt-get -y install supervisor