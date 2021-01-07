FROM cqxyd/pm2:10-alpine

LABEL maintainer="chengang@xyd.cn"

# 这个目录需要程序判断是否存在，然后自行创建
ENV UPLOAD_DIR /home/$WORK_USER/data/$APP_NAME
ENV BRANCH_COMMIT_ID <BRANCH_COMMIT_ID>
ENV APP_LOG /home/$WORK_USER/log

RUN mkdir /app
WORKDIR /app
COPY package*.json ./

RUN apk add --no-cache bash git openssh

RUN npm ci --registry=https://registry.npm.taobao.org

COPY . .

ADD --chown=502:502 https://s3.cn-north-1.amazonaws.com.cn/images.xyd.cn/docker/app.config.js .


EXPOSE 8080

ENTRYPOINT ["pm2-runtime", "test.app.config.js", "--json" ]