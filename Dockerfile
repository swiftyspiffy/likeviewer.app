FROM php:8.4-apache
RUN echo 'PassEnv SOURCE_COMMIT' > /etc/apache2/conf-enabled/passenv.conf
COPY . /var/www/html/
EXPOSE 80
