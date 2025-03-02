# Step 1: Use an official Node.js image as a parent image
FROM node:16 AS build

# Step 2: Set the working directory in the container
WORKDIR /root/cloud_sec_proy_1/blog_platform_front

# Step 3: Copy package.json and package-lock.json to install dependencies first
COPY package.json package-lock.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the frontend code into the container
COPY . .

#permisos archivo react
RUN chmod +x node_modules/.bin/react-scripts

# Step 6: Build the React application for production
RUN npm run build

# Step 7: Use an Nginx image to serve the React app
#FROM nginx:alpine

# Step 8: Copy the build folder from the previous stage into the Nginx container
RUN npm install -g serve
#COPY --from=build /root/cloud_sec_proy_1/blog_platform_front /usr/share/nginx/html

CMD ["serve", "-s", "build", "-l", "3000"]

# Step 9: Expose the port Nginx is running on (default 80)
EXPOSE 3000

# Step 10: Start the Nginx server
#CMD ["nginx", "-g", "daemon off;"]


