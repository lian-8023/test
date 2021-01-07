# ps -ef | grep -v grep | grep "supervisor server.js"
# ps -ef | grep -v grep | grep "supervisor server.js"  | awk '{print $2}' | xargs kill -9
# ps -ef | grep -v grep | grep "node server.js"
# ps -ef | grep -v grep | grep "node server.js"  | awk '{print $2}' | xargs kill -9
# supervisor server.js &
# echo -e "\033[42;37m supervisor server.js succeed \033[0m"
cd ../redis-5.0.5/src/ 
ps -ef | grep -v grep | grep "redis-server"
ps -ef | grep -v grep | grep "redis-server" | awk '{print $2}' | xargs kill -9
./redis-server &
echo -e "\033[42;37m redis-server succeed \033[0m"


