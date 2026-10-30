# Serves the StatCam static site via nginx (same pattern as siera-blog).
# The build output is committed at ./out (web-tierA deploy target).
FROM nginx:alpine
COPY out/ /usr/share/nginx/html/
RUN chmod -R 755 /usr/share/nginx/html/
COPY out/nginx-default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
