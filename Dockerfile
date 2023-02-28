# Use official node image as the base image
# Node 14 is the most recent version compatible with Angular 12
FROM node:14 as build

# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# Install all the dependencies
RUN npm install

# Generate the build of the application
RUN npm run build


# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/dist/digital-molecule-maker /usr/share/nginx/html

# Expose port 80
EXPOSE 80