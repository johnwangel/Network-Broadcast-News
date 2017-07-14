/*jshint esversion: 6 */
const net = require('net');

let serverArray = [];

//ADMIN MESSAGE
var server = net.createServer( function ( connection ) {
  //GET A USERNAME
  connection.write(`Hello. What is your name!`);
  let userName = null;
  connection.setEncoding('utf8');

  //ADD CONNECTION TO ARRAY
  if (!serverArray.some( list => list.socket === connection )){
    {
      userName = `User ${serverArray.length + 2}`;
      serverArray.push({ name: userName, socket: connection } ); }
      console.log(`You have ${serverArray.length} connections.`);
    }

  //LISTENER FOR THE CONNECTION
  connection.on('data', data => {

    let handle = false;
    let admin = false;

    //FIRST MESSAGE FROM USER SETS USERNAME
    if (userName.includes('User')) {
      let oldName = userName;
      userName = String(data).replace(/\r?\n|\r/, '');
      admin = userName.toLowerCase().includes('admin');
      if (admin) {
        connection.write(`User name cannot contain [admin]!`);
        userName = oldName;
        return;
      }

      //MESSAGE WHEN USER JOINS
      for (let connections in serverArray){
        if (oldName === serverArray[connections].name) { serverArray[connections].name = userName; }
        serverArray[connections].socket.write(`${userName} has joined us!\n`);
        handle = true;
      }
    }

    //DEFAULT IF THIS IS NOT FIRST MESSAGE FROM USER.
    if (handle === false){
      for (let connections in serverArray){
        if ( userName !== serverArray[connections].name) {
          serverArray[connections].socket.write(`[${userName}] ${data}`);
        }
      }
    }
    handle = false;
  });

  //CONNECTION HAS CLOSED
  connection.on('end', ( packet ) => {
    let i = 0;
    for (let connections in serverArray){
      if ( userName === serverArray[connections].name) {
        serverArray.splice(i, 1);
        for (let connections in serverArray){
          serverArray[connections].socket.write(`[ADMIN] ${userName} abandoned us!`);
        }
      }
      i++;
    }
  });

});

server.listen({ port: 6969, address: '0.0.0.0' });

//ADMIN BROADCAST
process.stdin.on('data', data  => {
  for (let connections in serverArray){
    serverArray[connections].socket.write(`[ADMIN] ${data}`);
  }
});