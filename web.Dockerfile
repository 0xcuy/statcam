# Serves the StatCam Next.js static export via nginx (same pattern as siera-blog).
# Build the static export first: `npm run build` (outputs to ./out).
FROM nginx:alpine
COPY out/ /usr/share/nginx/html/
RUN chmod -R 755 /usr/share/nginx/html/
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    add_header Cache-Control "no-cache";\n    try_files $uri $uri/ $uri.html /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
