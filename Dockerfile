# Building phase
FROM node:12-buster as builder

LABEL description="mirrormirror.florianporada.com"

# Run those steps during build phase
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy files
ADD . ./

# Install modules
RUN yarn

# Build app
RUN yarn run build

# Production phase
FROM nginx:alpine

# production is the default, but you can override it with --build-arg NODE_ENV=development during docker build
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# unknown is the default, but you can override it with --build-arg APP_VERSION=$(echo "1.0.0") during docker build
ARG APP_VERSION=unknown
ENV APP_VERSION $APP_VERSION

# unknown is the default, but you can override it with --build-arg RELEASE_DATE=$(date +"%Y/%m/%d") during docker build
ARG RELEASE_DATE=unknown
ENV RELEASE_DATE $RELEASE_DATE

LABEL com.florianporada.author="florianporada"

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
# COPY --from=builder /usr/src/app/nginx.conf /etc/nginx/nginx.conf
