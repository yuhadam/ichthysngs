FROM ubuntu:14.04

RUN apt-get -y update

RUN apt-get install -y curl
RUN apt-get install -y unzip
RUN apt-get install -y vim

# java 1.8 
ENV HOME /root
RUN  apt-get install -y software-properties-common
RUN \
  echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
  add-apt-repository -y ppa:webupd8team/java && \
  apt-get update && \
  apt-get install -y oracle-java8-installer

ENV JAVA_HOME /usr/lib/jvm/java-8-oracle

######

RUN mkdir /web
RUN mkdir /shellscript
RUN mkdir /exe
RUN mkdir -p	/nfsdir
#RUN mkdir -p /nfsdir/exe
#RUN mkdir -p /nfsdir/bundle

###############insatll docker specific version
RUN apt-get install -y -q apt-transport-https ca-certificates && \
apt-key adv --keyserver hkp://ha.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D && \
apt-key adv -k 58118E89F3A912897C070ADBF76221572C52609D >/dev/null 

RUN mkdir -p /etc/apt/sources.list.d

RUN touch /etc/apt/sources.list.d/docker.list

RUN chmod 777 /etc/apt/sources.list.d/docker.list

RUN echo deb \[arch=amd64\] https://apt.dockerproject.org/repo ubuntu-trusty main > /etc/apt/sources.list.d/docker.list

RUN apt-get update; apt-get install -y -q docker-engine=1.11.2-0~trusty

RUN apt-mark hold docker-engine

####RUN wget -qO- https://get.docker.com/ | sh

#sftp install
RUN apt-get install -y ssh

# nfs install
RUN apt-get install -y nfs-kernel-server

#add conf sh
#ADD conf.sh /shellscript/
ADD services /shellscript/
ADD nfs-kernel-server /shellscript/



ADD sftp-useradd.sh /bin/



ADD bwa /exe/bwa

ADD GenomeAnalysisTK.jar /exe/GenomeAnalysisTK.jar

ADD annovar /exe/annovar

ADD muTect-1.1.4.jar /exe/muTect-1.1.4.jar

ADD mutect-1.1.7.jar /exe/mutect-1.1.7.jar

ADD picard.jar /exe/picard.jar

ADD samtools /exe/samtools


#ADD bwa /nfsdir/exe/bwa

#ADD GenomeAnalysisTK.jar /nfsdir/exe/GenomeAnalysisTK.jar

#ADD annovar /nfsdir/exe/annovar

#ADD muTect-1.1.4.jar /nfsdir/exe/muTect-1.1.4.jar

#ADD mutect-1.1.7.jar /nfsdir/exe/mutect-1.1.7.jar

#ADD picard.jar /nfsdir/exe/picard.jar

#ADD samtools /nfsdir/exe/samtools




#Clean up APT when done.
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    apt-get autoclean && \
    apt-get autoremove -y && \
    rm -rf /var/lib/{apt,dpkg,cache,log}/




