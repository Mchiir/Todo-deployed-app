FROM node:18-alpine AS built
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG REACT_APP_SERVERURL
ENV REACT_APP_SERVERURL=$REACT_APP_SERVERURL

RUN npm run build

FROM nginx:alpine

COPY --from=built /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]