FROM php:8.0.11-apache
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli
RUN docker-php-ext-install bcmath && docker-php-ext-enable bcmath
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y libgmp-dev && docker-php-ext-install gmp