FROM node:16.4.1-buster

RUN npm install -g @angular/cli@12.1.1

RUN curl -o /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt-get update && apt-get install -y /tmp/chrome.deb
RUN rm /tmp/chrome.deb

RUN mkdir /hostmount
WORKDIR /hostmount

CMD ["ng", "serve", "--host", "0.0.0.0", "--disable-host-check"]
