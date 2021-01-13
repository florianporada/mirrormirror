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

# unknown is the default, but you can override it with --build-arg RELEASE_DATE=$(date +"%Y/%m/%d") during docker build
LABEL com.florianporada.author="florianporada"

COPY --from=builder /usr/src/app/assets /usr/share/nginx/html/assets
COPY --from=builder /usr/src/app/build /usr/share/nginx/html/build
COPY --from=builder /usr/src/app/index.html /usr/share/nginx/html/index.html
