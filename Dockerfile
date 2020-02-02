FROM ubuntu:18.04

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y \
	python3 \
	python3-pip \
	zip \
	unzip

COPY server/ /fileserver

COPY update_ip.sh /

RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs
RUN /bin/bash update_ip.sh

RUN pip3 install -r /fileserver/requirements.txt
RUN mkdir /files
VOLUME /files

WORKDIR /fileserver
ENTRYPOINT ["python3", "run.py"]
