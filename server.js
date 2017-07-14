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
      let nameOK = checkNameStructure( userName );
      if ( nameOK !== false ) {
        connection.write(getMessage(nameOK));
        userName = oldName;
        return;
      }

      //MESSAGE WHEN USER JOINS
      for (let connections in serverArray){
        if (oldName === serverArray[connections].name) { serverArray[connections].name = userName; }
        serverArray[connections].socket.write(`${userName} has joined us!`);
        //To prevent it from broadcasting.
        console.log(`${userName} (ip: ${serverArray[connections].socket.remotePort}) has been added.`);
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
    if (data.includes(':')){
      let ip = parseData[1].split(':');
      let port = ip[1];
      removePort( port );
      data = `User ${port} has been ousted!`;
    } else {
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
  let skt = serverArray[idx].socket;
  skt.write( `[ADMIN] You're outta here, ${user}!`);
  skt.destroy();
  serverArray.splice(idx);
}

function removePort( port ) {
  let i = 0;
  port = Number(port);
  for (let connections in serverArray){
    skt = serverArray[connections].socket;
    if (skt.remotePort === port ) {
      skt.write( `[ADMIN] You're outta here, ${skt.name}!`);
      skt.destroy();
      serverArray.splice(i);
    }
    i++;
  }
}

function getMessage( num ) {
  switch ( num ) {
    case 1:
      return `[ADMIN] User name cannot contain [admin]! Please type a new name.`;
    case 2:
      return `[ADMIN] User name cannot contain spaces! Please type a new name.`;
    case 3:
      return `[ADMIN] That name is taken! Please type a new name.`;
    default:
      return `[ADMIN] That is not a valid name! Please type a new name.`;
  }
}

function checkNameStructure( userName ) {
  if (userName.toLowerCase().includes('admin')) {
      return 1;
    } else if (userName.includes(' ')) {
      return 2;
    } else if ( checkForUser(userName) > -1 ) {
      return 3;
    } else {
      return false;
  }
}