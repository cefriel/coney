# BUILD
FROM node:10.16.0 as build

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json

RUN npm install

# add app
COPY . /app

# generate build

RUN ng build --configuration=docker --base-href=$BASE_HREF --output-path=dist

# DEPLOY
FROM nginx:1.16.0-alpine

# copy artifact build from the 'build environment'
COPY --from=build /app/dist /usr/share/nginx/html/

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]