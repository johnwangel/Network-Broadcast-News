/*jshint esversion: 6 */
const net = require('net');

let serverArray = [];
let handle = false;

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

    data = String(data).replace(/\r?\n|\r/, '');

    //FIRST MESSAGE FROM USER SETS USERNAME
    if (userName.includes('User')) {
      let oldName = userName;
      userName = data;
      let admin = (() => {
        if (userName.toLowerCase().includes('admin')) {
          return 1;
        } else if (userName.includes(' ')) {
          return 2;
        } else if ( checkForUser(userName) > -1 ) {
          return 3;
        } else {
          return false;
        }
      })();
      if (admin !== false) {
        switch (admin) {
          case 1:
            connection.write(`[ADMIN] User name cannot contain [admin]! Please type a new name.`);
            break;
          case 2:
            connection.write(`[ADMIN] User name cannot contain spaces! Please type a new name.`);
            break;
          case 3:
            connection.write(`[ADMIN] That name is taken! Please type a new name.`);
            break;
          default:
            connection.write(`[ADMIN] That is not a valid name! Please type a new name.`);
        }
        userName = oldName;
        return;
      }

      //MESSAGE WHEN USER JOINS
      for (let connections in serverArray){
        if (oldName === serverArray[connections].name) { serverArray[connections].name = userName; }
        serverArray[connections].socket.write(`${userName} has joined us!`);
        //To prevent it from broadcasting.
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
    //resets handle if it was true when it got here.
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
  data = String(data).replace(/\r?\n|\r/, '');
  if (data.indexOf('\\kick') !== -1) {
    let parseData = data.split(' ');
    let user = parseData[1];
    let idx = checkForUser( user );
    if ( idx > -1 ) {
      removeUser( user, idx );
      data = `${user} has been ousted!`;
    } else {
      console.log('That user does not exist.');
      return;
    }
  }

  for (let connections in serverArray){
    serverArray[connections].socket.write(`[ADMIN] ${data}`);
  }
});

function checkForUser( checkName ) {
  var userNames = serverArray.map( list => list.name );
  if (userNames.some( names => checkName )){
    return userNames.indexOf( checkName );
  }
  return false;
}

function removeUser( user, idx ){
  serverArray[idx].socket.destroy();
  serverArray.splice(idx);
}