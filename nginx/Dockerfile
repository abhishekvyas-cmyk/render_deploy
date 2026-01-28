FROM node:22-alpine as frontend_builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend .

RUN npm run build
# We use multi-stage builds: multiple build stages in one Dockerfile, and we copy files from one stage to another stage , because Copying from containers or images is not allowed
# Uses an existing stage named frontend for get built files (dist folder) 
# This stage already has the frontend build process Renames it as frontend_builder 

FROM nginx:alpine 
# New stage whose Base image = Nginx server on Alpine Linux
COPY --from=frontend_builder /app/dist /usr/share/nginx/html
#  Copies built frontend files From: frontend_builder stage /app/dist = frontend build output 
# To: Nginx web root /usr/share/nginx/html   So Nginx will serve the frontend
COPY nginx/nginx.conf /etc/nginx/nginx.conf
# Replaces default Nginx config by copy your config in that